"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { validateCart, type CartLineInput } from "@/lib/shop";
import { BRAND, SHIPPING } from "@/lib/brand";
import { normalizeLocale } from "@/i18n/messages";
import { currentMemberTier } from "@/lib/account";

export type CheckoutResult = { ok: true; url: string } | { ok: false; error: string };

async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Validates the cart server-side, creates a PENDING order, then opens a
 * Stripe Checkout Session (CAD, Canada-only shipping, flat/free shipping
 * option, no automatic tax). Returns PAYMENT_UNAVAILABLE when Stripe isn't
 * configured so the UI can show a graceful message.
 *
 * Signed-in Glow Club members: their tier (from the session, server-side)
 * sets the free-shipping threshold, the order is linked to their Customer and
 * Stripe gets their email. `opts.newsletter` = the unchecked-by-default cart
 * opt-in; the webhook turns it into a CASL double opt-in on payment.
 */
export async function checkout(
  lines: CartLineInput[],
  rawLocale: string,
  opts: { newsletter?: boolean; email?: string } = {},
): Promise<CheckoutResult> {
  const locale = normalizeLocale(rawLocale);
  const member = await currentMemberTier().catch(() => null);
  let validated;
  try {
    validated = await validateCart(lines, { tier: member?.tier ?? null });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "INVALID_CART" };
  }

  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "PAYMENT_UNAVAILABLE" };

  // Email typed next to the consent box (guests only). Prefills Stripe and allows one cart reminder.
  const typed = opts.newsletter === true ? (opts.email ?? "").trim().toLowerCase() : "";
  const guestEmail = typed && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(typed) && typed.length <= 254 ? typed : "";

  const order = await prisma.order.create({
    data: {
      status: "PENDING",
      contactEmail: member?.email ?? guestEmail,
      items: validated.lines.map((l, i) => ({
        productId: l.productId,
        slug: l.slug,
        nameFr: l.nameFr,
        nameEn: l.nameEn,
        priceCents: l.priceCents,
        qty: l.qty,
        options: l.options,
        optionsEn: l.optionsEn,
        selected: lines[i]?.selected ?? {},
      })),
      subtotalCents: validated.subtotalCents,
      shippingCents: validated.shippingCents,
      totalCents: validated.totalCents,
      locale,
      customerId: member?.customerId,
      newsletterOptIn: opts.newsletter === true,
    },
  });

  const shortRef = order.reference.slice(-8).toUpperCase();
  const isFree = validated.shippingCents === 0;

  try {
    const origin = await siteOrigin();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ...(member ? { customer_email: member.email } : guestEmail ? { customer_email: guestEmail } : {}),
      currency: "cad",
      locale: locale === "fr" ? "fr-CA" : "en",
      billing_address_collection: "auto",
      shipping_address_collection: { allowed_countries: ["CA"] },
      phone_number_collection: { enabled: true },
      automatic_tax: { enabled: false },
      // Lets customers enter promo codes created in the Stripe dashboard (Products > Coupons)
      allow_promotion_codes: true,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: isFree
              ? locale === "fr"
                ? "Livraison gratuite"
                : "Free shipping"
              : locale === "fr"
                ? "Livraison standard"
                : "Standard shipping",
            fixed_amount: { amount: validated.shippingCents, currency: "cad" },
            delivery_estimate: {
              minimum: { unit: "week", value: SHIPPING.totalWeeks.min },
              maximum: { unit: "week", value: SHIPPING.totalWeeks.max },
            },
          },
        },
      ],
      line_items: validated.lines.map((l) => {
        const optStr = Object.values(locale === "fr" ? l.options : l.optionsEn).join(" · ");
        return {
          quantity: l.qty,
          price_data: {
            currency: "cad",
            unit_amount: l.priceCents,
            product_data: {
              name: locale === "fr" ? l.nameFr : l.nameEn,
              description: optStr || undefined,
            },
          },
        };
      }),
      metadata: { orderId: order.id, reference: order.reference, ...(member ? { glowTier: member.tier.id } : {}) },
      payment_intent_data: {
        description: `${BRAND.name} — order ${shortRef}`,
        metadata: { orderId: order.id, reference: order.reference },
      },
      success_url: `${origin}/shop/thanks?order=${order.reference}`,
      cancel_url: `${origin}/cart`,
    });
    if (!session.url) throw new Error("NO_SESSION_URL");
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });
    return { ok: true, url: session.url };
  } catch (err) {
    console.error("[shop] checkout failed", err);
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    return { ok: false, error: "CHECKOUT_FAILED" };
  }
}

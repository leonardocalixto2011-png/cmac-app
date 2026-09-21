import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation, sendOwnerOrderNotice } from "@/lib/email";
import { normalizeLocale } from "@/i18n/messages";
import { creditOrder, markCodesRedeemed } from "@/lib/loyalty";
import { subscribeEmail } from "@/lib/newsletter";

/**
 * Stripe webhook — `checkout.session.completed` marks the order PAID, stores
 * the collected shipping address + name, then emails the customer (EN/FR per
 * order locale) and the owner. The order is linked to the Customer with the
 * same email; if that customer is a Glow Club member, points are credited
 * (idempotent ledger) and any reward code used is marked redeemed. A cart
 * newsletter opt-in starts the CASL double opt-in. Register this URL in the CMAC Stripe account:
 *   https://cmacbeauty.ca/api/stripe/webhook
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", secret);
  } catch (err) {
    console.error("[stripe] webhook signature check failed", err);
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) return NextResponse.json({ received: true });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== "PENDING") return NextResponse.json({ received: true });

    // Stripe moved shipping details between `shipping_details` and
    // `collected_information.shipping_details` across API versions.
    const s = session as unknown as {
      shipping_details?: unknown;
      collected_information?: { shipping_details?: unknown } | null;
    };
    const shipping = s.collected_information?.shipping_details ?? s.shipping_details ?? null;
    const shippingObj = shipping as { name?: string | null } | null;
    const contactEmail = session.customer_details?.email ?? order.contactEmail;
    const contactName = shippingObj?.name ?? session.customer_details?.name ?? null;
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

    // Link to the customer: the signed-in member's (set at checkout) or the one with this email.
    const linked = order.customerId ? await prisma.customer.findUnique({ where: { id: order.customerId } }) : null;
    const customer =
      linked ??
      (contactEmail
        ? await prisma.customer.upsert({
            where: { email: contactEmail.toLowerCase() },
            update: { name: contactName ?? undefined },
            create: { email: contactEmail.toLowerCase(), name: contactName, locale: order.locale },
          })
        : null);
    const discountCents = session.total_details?.amount_discount ?? 0;

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        contactEmail,
        contactName,
        shippingJson: (shipping as object) ?? undefined,
        stripePaymentIntentId: paymentIntentId ?? undefined,
        customerId: customer?.id,
        discountCents,
      },
    });
    console.info(`[shop] order ${updated.reference} paid`);

    // Glow Club — never let loyalty bookkeeping break the payment webhook.
    try {
      const points = await creditOrder(updated.id);
      if (points) console.info(`[loyalty] +${points} pts for order ${updated.reference}`);
      const promoIds = (session.discounts ?? [])
        .map((d) => (typeof d.promotion_code === "string" ? d.promotion_code : d.promotion_code?.id))
        .filter((x): x is string => Boolean(x));
      await markCodesRedeemed(promoIds);
    } catch (err) {
      console.error("[loyalty] webhook bookkeeping failed", err);
    }
    if (updated.newsletterOptIn && updated.contactEmail) {
      await subscribeEmail(updated.contactEmail, normalizeLocale(updated.locale), "checkout").catch((err) =>
        console.error("[newsletter] checkout opt-in failed", err),
      );
    }

    const data = {
      reference: updated.reference,
      locale: normalizeLocale(updated.locale),
      contactEmail: updated.contactEmail,
      contactName: updated.contactName,
      items: updated.items,
      subtotalCents: updated.subtotalCents,
      shippingCents: updated.shippingCents,
      totalCents: updated.totalCents,
      shippingJson: updated.shippingJson,
    };
    await Promise.all([sendOrderConfirmation(data), sendOwnerOrderNotice(data)]);
  }

  return NextResponse.json({ received: true });
}

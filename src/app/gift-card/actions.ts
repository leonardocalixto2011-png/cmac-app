"use server";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { BRAND, siteUrl } from "@/lib/brand";
import { giftCardBalance } from "@/lib/gift-cards";
import { LIMITS, rateLimit, requestIp } from "@/lib/rate-limit";
import { cleanLine, cleanMessage, isGiftCardAmount, parseSendDay } from "@/lib/gift-card-rules";
import { normalizeLocale } from "@/i18n/messages";

export type GiftCardInput = {
  amountCents: number;
  toName?: string;
  toEmail?: string;
  fromName?: string;
  message?: string;
  /** "YYYY-MM-DD", or empty to send as soon as it's paid. */
  sendOn?: string;
};

export type GiftCardResult = { ok: true; url: string } | { ok: false; error: "INVALID" | "BAD_EMAIL" | "TOO_MANY" | "PAYMENT_UNAVAILABLE" | "CHECKOUT_FAILED" };

/**
 * Card only: no Klarna or Afterpay on stored value, and no promo code on the card itself.
 * Nothing is issued here. The code exists once Stripe says it's paid (see fulfilGiftCard).
 */
export async function buyGiftCard(input: GiftCardInput, rawLocale: string): Promise<GiftCardResult> {
  const locale = normalizeLocale(rawLocale);
  if (!isGiftCardAmount(input.amountCents)) return { ok: false, error: "INVALID" };
  const send = parseSendDay(input.sendOn);
  if (!send.ok) return { ok: false, error: "INVALID" };
  const toEmail = (input.toEmail ?? "").trim().toLowerCase();
  if (toEmail && (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(toEmail) || toEmail.length > 254)) return { ok: false, error: "BAD_EMAIL" };

  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "PAYMENT_UNAVAILABLE" };
  if (!(await rateLimit(`gift-card:${await requestIp()}`, LIMITS.giftCardIp))) return { ok: false, error: "TOO_MANY" };

  const card = await prisma.giftCard.create({
    data: {
      amountCents: input.amountCents,
      balanceCents: input.amountCents,
      toName: cleanLine(input.toName) || null,
      toEmail: toEmail || null,
      fromName: cleanLine(input.fromName) || null,
      message: cleanMessage(input.message) || null,
      sendAt: send.sendAt,
      locale,
    },
  });

  try {
    const origin = siteUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      currency: "cad",
      locale: locale === "fr" ? "fr-CA" : "en",
      automatic_tax: { enabled: false },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: input.amountCents,
            product_data: {
              name: locale === "fr" ? `Carte-cadeau ${BRAND.name}` : `${BRAND.name} gift card`,
              description: locale === "fr" ? "Envoyée par courriel. Aucune date d'expiration, aucuns frais." : "Sent by email. No expiry date, no fees.",
            },
          },
        },
      ],
      metadata: { giftCardId: card.id },
      payment_intent_data: { description: `${BRAND.name} — gift card`, metadata: { giftCardId: card.id } },
      success_url: `${origin}/gift-card/thanks`,
      cancel_url: `${origin}/gift-card`,
    });
    if (!session.url) throw new Error("NO_SESSION_URL");
    await prisma.giftCard.update({ where: { id: card.id }, data: { stripeCheckoutSessionId: session.id } });
    return { ok: true, url: session.url };
  } catch (err) {
    console.error("[gift-card] checkout failed", err);
    await prisma.giftCard.delete({ where: { id: card.id } }).catch(() => {});
    return { ok: false, error: "CHECKOUT_FAILED" };
  }
}

/** Québec requires a way to check a balance. Throttled, since it answers for any code typed. */
export async function checkGiftCardBalance(code: string): Promise<{ ok: true; balanceCents: number } | { ok: false; error: "NOT_FOUND" | "TOO_MANY" }> {
  if (!(await rateLimit(`gift-balance:${await requestIp()}`, LIMITS.giftBalanceIp))) return { ok: false, error: "TOO_MANY" };
  const balanceCents = await giftCardBalance(code);
  return balanceCents === null ? { ok: false, error: "NOT_FOUND" } : { ok: true, balanceCents };
}

/**
 * Gift cards. A paid card becomes a single-use Stripe promotion code on its own
 * amount-off coupon, which the holder types at checkout like any other code, so
 * Stripe is what stops a balance being spent twice. Stripe discards whatever a coupon
 * doesn't use, so a partial use retires the code and issues a new one for the rest.
 *
 * Everything after payment runs through settleGiftCard, which is safe to repeat: the
 * webhook calls it, and the daily cron calls it again for scheduled cards and for
 * anything that failed (a Stripe error, an email that didn't leave).
 */
import type Stripe from "stripe";
import type { GiftCard, Prisma } from "@prisma/client";
import { normalizeLocale } from "@/i18n/messages";
import {
  sendGiftCard,
  sendGiftCardBalance,
  sendGiftCardReceipt,
  sendOwnerGiftCardNotice,
  sendOwnerGiftCardProblem,
} from "./email";
import { isGiftCardCode } from "./gift-card-rules";
import { prisma } from "./prisma";
import { getStripe } from "./stripe";
import { createSingleUseCode, ensureCoupon } from "./stripe-coupons";
import { rewardCode } from "./tokens";

const CODE_PREFIX = "CADEAU";

export type GiftCardUse = { reference: string; amountCents: number; at: string };

async function issueCode(stripe: Stripe, card: GiftCard): Promise<GiftCard> {
  const code = card.code ?? rewardCode(CODE_PREFIX);
  if (!card.code) await prisma.giftCard.update({ where: { id: card.id }, data: { code } });
  const coupon = await ensureCoupon(stripe, `gift-${card.id}-${card.balanceCents}`, {
    amount_off: card.balanceCents,
    currency: "cad",
    duration: "once",
    name: "Carte-cadeau / Gift card",
    metadata: { program: "gift-card", giftCardId: card.id },
  });
  const promo = await createSingleUseCode(stripe, coupon.id, code, {
    metadata: { program: "gift-card", giftCardId: card.id },
    idempotencyKey: `gift-code-${code}`,
  });
  return prisma.giftCard.update({ where: { id: card.id }, data: { stripePromotionCodeId: promo.id } });
}

/** Does whatever this card still needs. Returns false when something is left for the next pass. */
export async function settleGiftCard(id: string, now: Date = new Date()): Promise<boolean> {
  let card = await prisma.giftCard.findUnique({ where: { id } });
  if (!card || card.status !== "ACTIVE") return true;

  if (!card.stripePromotionCodeId) {
    const stripe = getStripe();
    if (!stripe) return false;
    card = await issueCode(stripe, card);
  }
  const code = card.code;
  if (!code) return false;
  const locale = normalizeLocale(card.locale);
  let done = true;

  const to = card.toEmail ?? card.buyerEmail;
  const due = !card.sendAt || card.sendAt <= now;
  if (!card.sentAt && to && due) {
    const sent = await sendGiftCard(to, locale, {
      toName: card.toName,
      fromName: card.fromName,
      message: card.message,
      balanceCents: card.balanceCents,
      code,
    });
    if (sent) await prisma.giftCard.update({ where: { id }, data: { sentAt: now } });
    else done = false;
  }

  // The giver keeps the code too: it's their way out if the card lands in a spam folder.
  if (card.toEmail && card.buyerEmail && !card.receiptSentAt) {
    const sent = await sendGiftCardReceipt(card.buyerEmail, locale, {
      name: card.buyerName,
      toName: card.toName,
      toEmail: card.toEmail,
      amountCents: card.amountCents,
      code,
      sendAt: card.sendAt && card.sendAt > now ? card.sendAt : null,
    });
    if (sent) await prisma.giftCard.update({ where: { id }, data: { receiptSentAt: now } });
    else done = false;
  }

  if (card.balanceNoticeTo) {
    const sent = await sendGiftCardBalance(card.balanceNoticeTo, locale, { code, balanceCents: card.balanceCents });
    if (sent) await prisma.giftCard.update({ where: { id }, data: { balanceNoticeTo: null } });
    else done = false;
  }
  return done;
}

/** checkout.session.completed for a card. Repeating it (a webhook retry) changes nothing already done. */
export async function fulfilGiftCard(id: string, session: Stripe.Checkout.Session): Promise<boolean> {
  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
  const buyerEmail = session.customer_details?.email?.toLowerCase() ?? null;
  const first = await prisma.giftCard.updateMany({
    where: { id, status: "PENDING" },
    data: {
      status: "ACTIVE",
      paidAt: new Date(),
      buyerEmail,
      buyerName: session.customer_details?.name ?? null,
      stripePaymentIntentId: paymentIntent,
    },
  });
  const done = await settleGiftCard(id);
  if (first.count === 1) {
    const card = await prisma.giftCard.findUnique({ where: { id } });
    if (card) await sendOwnerGiftCardNotice({ amountCents: card.amountCents, buyerEmail: card.buyerEmail, toEmail: card.toEmail, sendAt: card.sendAt });
  }
  return done;
}

/**
 * After an order is paid: if a gift card paid for part of it, take that off the balance.
 * Stripe has already burnt the code, so anything left gets a new one, and the person who
 * just used it hears about it.
 */
export async function redeemGiftCode(
  promoIds: string[],
  order: { reference: string; contactEmail: string },
  discountCents: number,
): Promise<{ id: string; spentCents: number; balanceCents: number } | null> {
  if (promoIds.length === 0) return null;
  const card = await prisma.giftCard.findFirst({ where: { stripePromotionCodeId: { in: promoIds }, status: "ACTIVE" } });
  if (!card) return null;

  const spentCents = Math.min(discountCents, card.balanceCents);
  const balanceCents = card.balanceCents - spentCents;
  const use: GiftCardUse = { reference: order.reference, amountCents: spentCents, at: new Date().toISOString() };
  const uses = [...(card.uses as GiftCardUse[]), use] as unknown as Prisma.InputJsonValue;

  // Keyed on the code that was spent, so a repeat can't subtract twice.
  const moved = await prisma.giftCard.updateMany({
    where: { id: card.id, stripePromotionCodeId: card.stripePromotionCodeId },
    data:
      balanceCents > 0
        ? { balanceCents, uses, code: null, stripePromotionCodeId: null, balanceNoticeTo: order.contactEmail }
        : { balanceCents: 0, uses, status: "USED" },
  });
  if (moved.count !== 1) return null;
  if (balanceCents > 0) await settleGiftCard(card.id);
  return { id: card.id, spentCents, balanceCents };
}

/** Called from the webhook, where a failure must reach a human rather than the customer. */
export async function redeemGiftCodeSafely(promoIds: string[], order: { reference: string; contactEmail: string }, discountCents: number): Promise<void> {
  try {
    const used = await redeemGiftCode(promoIds, order, discountCents);
    if (used) console.info(`[gift-card] ${used.spentCents} spent on order ${order.reference}, ${used.balanceCents} left`);
  } catch (err) {
    console.error("[gift-card] redeem failed", err);
    await sendOwnerGiftCardProblem(order.reference).catch(() => {});
  }
}

/** Daily cron: scheduled cards whose day has come, and anything a failure left behind. */
export async function runGiftCards(now: Date = new Date()): Promise<{ due: number; settled: number }> {
  const due = await prisma.giftCard.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { stripePromotionCodeId: null },
        { sentAt: null, OR: [{ sendAt: null }, { sendAt: { lte: now } }] },
        { balanceNoticeTo: { not: null } },
        { toEmail: { not: null }, receiptSentAt: null },
      ],
    },
    select: { id: true },
    take: 100,
  });
  let settled = 0;
  for (const { id } of due) {
    if (await settleGiftCard(id, now).catch((err) => (console.error("[gift-card] settle failed", id, err), false))) settled++;
  }
  return { due: due.length, settled };
}

/** Public balance check. Only ever says how much is left on a code someone already holds. */
export async function giftCardBalance(rawCode: string): Promise<number | null> {
  const code = rawCode.trim().toUpperCase();
  if (!isGiftCardCode(code)) return null;
  const card = await prisma.giftCard.findUnique({ where: { code }, select: { status: true, balanceCents: true } });
  if (!card || (card.status !== "ACTIVE" && card.status !== "USED")) return null;
  return card.balanceCents;
}

/**
 * Puts money back on a card (admin), for an order refunded after being paid with it.
 * The balance changes, so the code does too, and the holder gets the new one.
 */
export async function creditGiftCard(id: string, cents: number): Promise<void> {
  const card = await prisma.giftCard.findUnique({ where: { id } });
  if (!card || (card.status !== "ACTIVE" && card.status !== "USED") || !Number.isInteger(cents) || cents <= 0) throw new Error("BAD_CREDIT");
  if (card.stripePromotionCodeId && card.status === "ACTIVE") {
    const stripe = getStripe();
    if (!stripe) throw new Error("STRIPE_NOT_CONFIGURED");
    await stripe.promotionCodes.update(card.stripePromotionCodeId, { active: false });
  }
  await prisma.giftCard.update({
    where: { id },
    data: {
      status: "ACTIVE",
      balanceCents: card.balanceCents + cents,
      code: null,
      stripePromotionCodeId: null,
      balanceNoticeTo: card.toEmail ?? card.buyerEmail,
    },
  });
  await settleGiftCard(id);
}

/** Voids a card (admin, after a refund in Stripe). The code stops working first. */
export async function cancelGiftCard(id: string): Promise<void> {
  const card = await prisma.giftCard.findUnique({ where: { id } });
  if (!card || card.status === "CANCELLED") return;
  if (card.stripePromotionCodeId) {
    const stripe = getStripe();
    if (!stripe) throw new Error("STRIPE_NOT_CONFIGURED");
    await stripe.promotionCodes.update(card.stripePromotionCodeId, { active: false });
  }
  await prisma.giftCard.update({ where: { id }, data: { status: "CANCELLED", balanceNoticeTo: null } });
}

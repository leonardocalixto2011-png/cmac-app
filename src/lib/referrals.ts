/**
 * Referral program ("Invite a friend").
 *
 * Every Glow Club member gets one personal code (AMIE-XXXX) that is a Stripe
 * promotion code on the shared `referral-10` coupon: 10 % off, once, first
 * order only (Stripe enforces first_time_transaction by customer email). The
 * member shares /r/<code>; that page drops a 30-day cookie and checkout applies
 * the code automatically. When the friend's order is paid, the member gets
 * REFERRAL_BONUS_POINTS (one bonus per order, enforced by the ledger's unique
 * (orderId, reason)). A member can't refer themselves.
 */
import { prisma } from "./prisma";
import { getStripe } from "./stripe";
import { ensureCoupon } from "./stripe-coupons";
import { siteUrl } from "./brand";
import { sendReferralBonus } from "./email";
import { normalizeLocale } from "@/i18n/messages";

export const REFERRAL_PERCENT_OFF = 10;
export const REFERRAL_BONUS_POINTS = 100; // = one $10 reward
export const REFERRAL_COOKIE = "cmac-ref";
export const REFERRAL_COOKIE_DAYS = 30;
export const REFERRAL_COUPON_ID = "referral-10";
const CODE_PREFIX = "AMIE-";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function referralLink(code: string): string {
  return `${siteUrl()}/r/${encodeURIComponent(code)}`;
}

export function isReferralCode(code: string): boolean {
  return /^AMIE-[A-Z2-9]{4}$/.test(code);
}

function randomCode(): string {
  let s = CODE_PREFIX;
  for (let i = 0; i < 4; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

export type Referral = { code: string; url: string };

/**
 * The member's personal code, created on first request (Stripe first, then
 * saved). Returns null when Stripe isn't configured: the account page then
 * simply hides the card.
 */
export async function ensureReferralCode(customerId: string): Promise<Referral | null> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { referralCode: true, referralPromoId: true },
  });
  if (!customer) return null;
  if (customer.referralCode) return { code: customer.referralCode, url: referralLink(customer.referralCode) };

  const stripe = getStripe();
  if (!stripe) return null;
  const coupon = await ensureCoupon(stripe, REFERRAL_COUPON_ID, {
    percent_off: REFERRAL_PERCENT_OFF,
    duration: "once",
    name: `Referred by a friend — ${REFERRAL_PERCENT_OFF}% off`,
    metadata: { program: "referral" },
  });
  // A code collision is a Stripe error (codes are unique per account): try a few.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    try {
      const pc = await stripe.promotionCodes.create({
        promotion: { type: "coupon", coupon: coupon.id },
        code,
        active: true,
        restrictions: { first_time_transaction: true },
        metadata: { program: "referral", customerId },
      });
      await prisma.customer.update({ where: { id: customerId }, data: { referralCode: code, referralPromoId: pc.id } });
      return { code, url: referralLink(code) };
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e?.code === "resource_already_exists" || /already exists/i.test(e?.message ?? "")) continue;
      // Another request created the member's code meanwhile: use it.
      const again = await prisma.customer.findUnique({ where: { id: customerId }, select: { referralCode: true } });
      if (again?.referralCode) return { code: again.referralCode, url: referralLink(again.referralCode) };
      throw err;
    }
  }
  return null;
}

/** Who owns this code, and the Stripe promotion code to apply. */
export async function resolveReferral(code: string | undefined | null): Promise<{ customerId: string; promoId: string; code: string } | null> {
  if (!code) return null;
  const c = code.trim().toUpperCase();
  if (!isReferralCode(c)) return null;
  const owner = await prisma.customer.findUnique({
    where: { referralCode: c },
    select: { id: true, referralPromoId: true },
  });
  if (!owner?.referralPromoId) return null;
  return { customerId: owner.id, promoId: owner.referralPromoId, code: c };
}

/**
 * After a referred order is paid: credit the referrer once, then tell them.
 * Never throws (called from the payment webhook).
 */
export async function creditReferrer(orderId: string): Promise<number> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, reference: true, referredById: true, customerId: true, status: true },
    });
    if (!order?.referredById || order.status !== "PAID") return 0;
    if (order.customerId && order.customerId === order.referredById) return 0; // self-referral
    const referrer = await prisma.customer.findUnique({
      where: { id: order.referredById },
      select: { id: true, email: true, name: true, locale: true, points: true },
    });
    if (!referrer) return 0;
    try {
      await prisma.$transaction([
        prisma.loyaltyEntry.create({
          data: {
            customerId: referrer.id,
            orderId: order.id,
            points: REFERRAL_BONUS_POINTS,
            reason: "REFERRAL_BONUS",
            note: `Friend's first order ${order.reference.slice(-8).toUpperCase()}`,
          },
        }),
        prisma.customer.update({ where: { id: referrer.id }, data: { points: { increment: REFERRAL_BONUS_POINTS } } }),
      ]);
    } catch (err) {
      const e = err as { code?: string };
      if (e?.code === "P2002") return 0; // already credited (webhook retry)
      throw err;
    }
    await sendReferralBonus(referrer.email, normalizeLocale(referrer.locale), {
      name: referrer.name,
      points: REFERRAL_BONUS_POINTS,
      balance: referrer.points + REFERRAL_BONUS_POINTS,
    }).catch((err) => console.error("[referral] bonus email failed", err));
    return REFERRAL_BONUS_POINTS;
  } catch (err) {
    console.error("[referral] credit failed", err);
    return 0;
  }
}

/**
 * Idempotent Stripe coupon / promotion-code helpers for the Glow Club and the
 * newsletter welcome offer. Coupons are looked up by fixed id and created only
 * when missing, so every call is safe to repeat.
 *
 *  - glow-club-10 / -20 / … : amount_off (CAD), duration once — points rewards
 *  - glow-birthday-15       : 15 % off, once — birthday reward
 *  - welcome-10 + WELCOME10 : 10 % off, once, first order only — newsletter welcome
 */
import type Stripe from "stripe";
import { getStripe } from "./stripe";
import { BIRTHDAY_PERCENT_OFF, REWARD_VALUE_CENTS, WELCOME_PERCENT_OFF, rewardCouponId } from "./loyalty-rules";
import { PROMOS } from "./promos";

export const BIRTHDAY_COUPON_ID = "glow-birthday-15";
export const WELCOME_COUPON_ID = "welcome-10";
export const WELCOME_CODE = "WELCOME10";

function isMissing(err: unknown): boolean {
  const e = err as { statusCode?: number; code?: string };
  return e?.statusCode === 404 || e?.code === "resource_missing";
}

export async function ensureCoupon(stripe: Stripe, id: string, params: Stripe.CouponCreateParams): Promise<Stripe.Coupon> {
  try {
    return await stripe.coupons.retrieve(id);
  } catch (err) {
    if (!isMissing(err)) throw err;
  }
  try {
    return await stripe.coupons.create({ ...params, id });
  } catch (err) {
    // Two requests raced to create it — the other one won.
    const e = err as { code?: string };
    if (e?.code === "resource_already_exists") return stripe.coupons.retrieve(id);
    throw err;
  }
}

export async function ensureRewardCoupon(stripe: Stripe, units: number): Promise<Stripe.Coupon> {
  const dollars = units * (REWARD_VALUE_CENTS / 100);
  return ensureCoupon(stripe, rewardCouponId(units), {
    amount_off: units * REWARD_VALUE_CENTS,
    currency: "cad",
    duration: "once",
    name: `Glow Club reward — $${dollars} off`,
    metadata: { program: "glow-club" },
  });
}

export async function ensureBirthdayCoupon(stripe: Stripe): Promise<Stripe.Coupon> {
  return ensureCoupon(stripe, BIRTHDAY_COUPON_ID, {
    percent_off: BIRTHDAY_PERCENT_OFF,
    duration: "once",
    name: `Glow Club birthday — ${BIRTHDAY_PERCENT_OFF}% off`,
    metadata: { program: "glow-club" },
  });
}

/** Single-use promotion code on a coupon. */
export async function createSingleUseCode(
  stripe: Stripe,
  couponId: string,
  code: string,
  opts: { expiresAt?: Date; metadata?: Record<string, string> } = {},
): Promise<Stripe.PromotionCode> {
  return stripe.promotionCodes.create({
    promotion: { type: "coupon", coupon: couponId },
    code,
    max_redemptions: 1,
    expires_at: opts.expiresAt ? Math.floor(opts.expiresAt.getTime() / 1000) : undefined,
    metadata: opts.metadata,
  });
}

/**
 * Makes sure WELCOME10 exists (10 % off, first order only). Returns the code,
 * or null when Stripe isn't configured or the call fails (callers then simply
 * don't mention a code).
 */
export async function ensureWelcomeCode(): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  try {
    await ensureCoupon(stripe, WELCOME_COUPON_ID, {
      percent_off: WELCOME_PERCENT_OFF,
      duration: "once",
      name: `Welcome — ${WELCOME_PERCENT_OFF}% off your first order`,
      metadata: { program: "newsletter" },
    });
    const existing = await stripe.promotionCodes.list({ code: WELCOME_CODE, limit: 1 });
    const found = existing.data[0];
    if (found) {
      if (!found.active) return null; // owner deactivated it on purpose
      return WELCOME_CODE;
    }
    await stripe.promotionCodes.create({
      promotion: { type: "coupon", coupon: WELCOME_COUPON_ID },
      code: WELCOME_CODE,
      restrictions: { first_time_transaction: true },
      metadata: { program: "newsletter" },
    });
    return WELCOME_CODE;
  } catch (err) {
    console.error("[stripe] ensureWelcomeCode failed", err);
    return null;
  }
}

/**
 * Seasonal campaign codes (src/lib/promos.ts): one coupon + one promotion code
 * each, created only when missing. The promotion code expires exactly when the
 * campaign ends, so a Black Friday code can't leak into March. Safe to run on
 * every deploy; returns what was created vs. already there.
 */
export async function ensureSeasonalCodes(): Promise<{ created: string[]; existing: string[]; skipped?: string }> {
  const stripe = getStripe();
  if (!stripe) return { created: [], existing: [], skipped: "stripe not configured" };
  const created: string[] = [];
  const existing: string[] = [];
  for (const p of PROMOS) {
    if (!p.code) continue;
    const found = await stripe.promotionCodes.list({ code: p.code, limit: 1 });
    if (found.data.length) {
      existing.push(p.code);
      continue;
    }
    const coupon = await ensureCoupon(stripe, `season-${p.id}`, {
      percent_off: p.percentOff,
      duration: "once",
      name: `${p.en.label} — ${p.percentOff}% off`,
      metadata: { program: "seasonal", campaign: p.id },
    });
    await stripe.promotionCodes.create({
      promotion: { type: "coupon", coupon: coupon.id },
      code: p.code,
      active: true,
      expires_at: Math.floor(Date.parse(p.endsAt) / 1000),
      metadata: { program: "seasonal", campaign: p.id },
    });
    created.push(p.code);
  }
  return { created, existing };
}

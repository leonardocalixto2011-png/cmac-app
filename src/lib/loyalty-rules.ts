/**
 * Glow Club rules — pure functions only (no DB), shared by server code, the
 * cart preview and the vitest suite. Membership is free: having a customer
 * account = being a member.
 *
 *  - Points: 1 pt per $1 of merchandise (subtotal after discounts, shipping
 *    excluded) on PAID orders; Radiance earns 1.25 pts/$, Icon 1.5 pts/$.
 *  - Tier by lifetime merchandise spend: Glow 0+, Radiance $250+, Icon $600+.
 *  - Free shipping: everyone from $75; Radiance from $50; Icon on every order.
 *  - Rewards: 100 points = $10 off (single-use Stripe promotion code).
 */
import { SHIPPING } from "./brand";

export type TierId = "glow" | "radiance" | "icon";

export type Tier = {
  id: TierId;
  /** Lifetime merchandise spend (cents) needed to reach the tier. */
  minSpendCents: number;
  /** Points per $1, in quarter points (4 = 1 pt/$, 5 = 1.25, 6 = 1.5) to stay in integers. */
  quarterPointsPerDollar: number;
  /** Subtotal (cents) from which shipping is free for this tier. 0 = always free. */
  freeShippingFromCents: number;
};

export const TIERS: readonly Tier[] = [
  { id: "glow", minSpendCents: 0, quarterPointsPerDollar: 4, freeShippingFromCents: SHIPPING.freeThresholdCents },
  { id: "radiance", minSpendCents: 25_000, quarterPointsPerDollar: 5, freeShippingFromCents: 5_000 },
  { id: "icon", minSpendCents: 60_000, quarterPointsPerDollar: 6, freeShippingFromCents: 0 },
] as const;

export const POINTS_PER_REWARD = 100;
export const REWARD_VALUE_CENTS = 1_000;
/** Max $ value of one reward code (10 × $10) — keeps a code smaller than a typical order. */
export const MAX_REWARD_UNITS = 10;
export const BIRTHDAY_PERCENT_OFF = 15;
export const WELCOME_PERCENT_OFF = 10;

export function getTier(id: TierId): Tier {
  return TIERS.find((t) => t.id === id) ?? TIERS[0];
}

/** Tier reached for a lifetime merchandise spend (cents). */
export function tierFor(lifetimeSpendCents: number): Tier {
  let current = TIERS[0];
  for (const t of TIERS) if (lifetimeSpendCents >= t.minSpendCents) current = t;
  return current;
}

/** Next tier + how far along the member is (0..1). null next = top tier. */
export function tierProgress(lifetimeSpendCents: number): {
  tier: Tier;
  next: Tier | null;
  remainingCents: number;
  ratio: number;
} {
  const tier = tierFor(lifetimeSpendCents);
  const idx = TIERS.findIndex((t) => t.id === tier.id);
  const next = TIERS[idx + 1] ?? null;
  if (!next) return { tier, next: null, remainingCents: 0, ratio: 1 };
  const span = next.minSpendCents - tier.minSpendCents;
  const done = Math.max(0, lifetimeSpendCents - tier.minSpendCents);
  return { tier, next, remainingCents: next.minSpendCents - lifetimeSpendCents, ratio: Math.min(1, done / span) };
}

/** Merchandise amount that earns points: subtotal minus discounts, never below 0 (shipping never counts). */
export function merchandiseCents(subtotalCents: number, discountCents: number): number {
  return Math.max(0, Math.round(subtotalCents) - Math.max(0, Math.round(discountCents)));
}

/** Points earned on a merchandise amount at a tier. Whole points, rounded down. */
export function pointsFor(merchCents: number, tier: Tier): number {
  if (merchCents <= 0) return 0;
  return Math.floor((merchCents * tier.quarterPointsPerDollar) / 400);
}

/** Shipping for a cart subtotal. Members use their tier threshold; guests (tier null) the standard rule. */
export function shippingCentsForTier(subtotalCents: number, tier: Tier | null): number {
  const threshold = tier ? tier.freeShippingFromCents : SHIPPING.freeThresholdCents;
  return subtotalCents >= threshold ? 0 : SHIPPING.flatCents;
}

/** How many $10 rewards a balance can buy right now (capped per code). */
export function maxRedeemableUnits(pointsBalance: number): number {
  if (pointsBalance < POINTS_PER_REWARD) return 0;
  return Math.min(MAX_REWARD_UNITS, Math.floor(pointsBalance / POINTS_PER_REWARD));
}

/** Validates a redemption request; returns the points cost and the code value. */
export function redemptionFor(
  units: number,
  pointsBalance: number,
): { ok: true; pointsCost: number; amountOffCents: number } | { ok: false; error: "BAD_UNITS" | "INSUFFICIENT_POINTS" } {
  if (!Number.isInteger(units) || units < 1 || units > MAX_REWARD_UNITS) return { ok: false, error: "BAD_UNITS" };
  const pointsCost = units * POINTS_PER_REWARD;
  if (pointsCost > pointsBalance) return { ok: false, error: "INSUFFICIENT_POINTS" };
  return { ok: true, pointsCost, amountOffCents: units * REWARD_VALUE_CENTS };
}

/** Stripe coupon id for a points reward of `units` × $10 (glow-club-10, glow-club-20, …). */
export function rewardCouponId(units: number): string {
  return `glow-club-${units * (REWARD_VALUE_CENTS / 100)}`;
}

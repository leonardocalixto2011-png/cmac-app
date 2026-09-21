import { describe, expect, it } from "vitest";
import {
  MAX_REWARD_UNITS,
  TIERS,
  getTier,
  maxRedeemableUnits,
  merchandiseCents,
  pointsFor,
  redemptionFor,
  rewardCouponId,
  shippingCentsForTier,
  tierFor,
  tierProgress,
} from "@/lib/loyalty-rules";
import { SHIPPING } from "@/lib/brand";

const glow = getTier("glow");
const radiance = getTier("radiance");
const icon = getTier("icon");

describe("tier thresholds", () => {
  it("starts everyone at Glow", () => {
    expect(tierFor(0).id).toBe("glow");
    expect(tierFor(24_999).id).toBe("glow");
  });
  it("reaches Radiance at exactly $250 and Icon at exactly $600", () => {
    expect(tierFor(25_000).id).toBe("radiance");
    expect(tierFor(59_999).id).toBe("radiance");
    expect(tierFor(60_000).id).toBe("icon");
    expect(tierFor(10_000_000).id).toBe("icon");
  });
  it("treats negative spend (over-reversed) as Glow", () => {
    expect(tierFor(-500).id).toBe("glow");
  });
  it("reports progress toward the next tier", () => {
    const p = tierProgress(12_500);
    expect(p.tier.id).toBe("glow");
    expect(p.next?.id).toBe("radiance");
    expect(p.remainingCents).toBe(12_500);
    expect(p.ratio).toBeCloseTo(0.5);
    const mid = tierProgress(42_500); // halfway between $250 and $600
    expect(mid.next?.id).toBe("icon");
    expect(mid.ratio).toBeCloseTo(0.5);
    const top = tierProgress(80_000);
    expect(top.next).toBeNull();
    expect(top.ratio).toBe(1);
  });
  it("keeps tiers ordered", () => {
    const mins = TIERS.map((t) => t.minSpendCents);
    expect([...mins].sort((a, b) => a - b)).toEqual(mins);
  });
});

describe("points per tier", () => {
  it("Glow earns 1 point per $1, rounded down", () => {
    expect(pointsFor(10_000, glow)).toBe(100);
    expect(pointsFor(5_999, glow)).toBe(59);
    expect(pointsFor(99, glow)).toBe(0);
  });
  it("Radiance earns 1.25 points per $1", () => {
    expect(pointsFor(10_000, radiance)).toBe(125);
    expect(pointsFor(7_999, radiance)).toBe(99); // 79.99 × 1.25 = 99.98
  });
  it("Icon earns 1.5 points per $1", () => {
    expect(pointsFor(10_000, icon)).toBe(150);
    expect(pointsFor(3_333, icon)).toBe(49); // 33.33 × 1.5 = 49.995
  });
  it("earns nothing on zero or negative merchandise", () => {
    expect(pointsFor(0, icon)).toBe(0);
    expect(pointsFor(-1_000, glow)).toBe(0);
  });
  it("counts merchandise after discounts, never below zero", () => {
    expect(merchandiseCents(12_000, 1_000)).toBe(11_000);
    expect(merchandiseCents(5_000, 9_000)).toBe(0);
    expect(merchandiseCents(5_000, -100)).toBe(5_000);
  });
});

describe("shipping threshold per tier", () => {
  it("guests keep the standard $75 rule", () => {
    expect(shippingCentsForTier(7_499, null)).toBe(SHIPPING.flatCents);
    expect(shippingCentsForTier(7_500, null)).toBe(0);
  });
  it("Glow members have the same rule as guests", () => {
    expect(shippingCentsForTier(7_499, glow)).toBe(SHIPPING.flatCents);
    expect(shippingCentsForTier(7_500, glow)).toBe(0);
  });
  it("Radiance ships free from $50", () => {
    expect(shippingCentsForTier(4_999, radiance)).toBe(SHIPPING.flatCents);
    expect(shippingCentsForTier(5_000, radiance)).toBe(0);
  });
  it("Icon ships free on every order", () => {
    expect(shippingCentsForTier(100, icon)).toBe(0);
    expect(shippingCentsForTier(0, icon)).toBe(0);
  });
});

describe("redemption arithmetic", () => {
  it("100 points = one $10 reward", () => {
    expect(redemptionFor(1, 100)).toEqual({ ok: true, pointsCost: 100, amountOffCents: 1_000 });
    expect(redemptionFor(3, 350)).toEqual({ ok: true, pointsCost: 300, amountOffCents: 3_000 });
  });
  it("refuses more than the balance", () => {
    expect(redemptionFor(2, 199)).toEqual({ ok: false, error: "INSUFFICIENT_POINTS" });
    expect(redemptionFor(1, 99)).toEqual({ ok: false, error: "INSUFFICIENT_POINTS" });
  });
  it("refuses non-integer, zero, negative or over-cap units", () => {
    expect(redemptionFor(0, 1_000)).toEqual({ ok: false, error: "BAD_UNITS" });
    expect(redemptionFor(-1, 1_000)).toEqual({ ok: false, error: "BAD_UNITS" });
    expect(redemptionFor(1.5, 1_000)).toEqual({ ok: false, error: "BAD_UNITS" });
    expect(redemptionFor(MAX_REWARD_UNITS + 1, 100_000)).toEqual({ ok: false, error: "BAD_UNITS" });
  });
  it("offers only whole rewards, capped per code", () => {
    expect(maxRedeemableUnits(99)).toBe(0);
    expect(maxRedeemableUnits(250)).toBe(2);
    expect(maxRedeemableUnits(-40)).toBe(0);
    expect(maxRedeemableUnits(5_000)).toBe(MAX_REWARD_UNITS);
  });
  it("names the Stripe coupon after the reward value", () => {
    expect(rewardCouponId(1)).toBe("glow-club-10");
    expect(rewardCouponId(5)).toBe("glow-club-50");
  });
});

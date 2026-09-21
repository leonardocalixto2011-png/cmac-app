/**
 * Glow Club ledger operations (server-only). Every change to a member's
 * points / lifetime spend writes a LoyaltyEntry and updates the cached sums on
 * Customer in the same transaction. Order credits and reversals are idempotent
 * thanks to the unique (orderId, reason) constraint.
 */
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getStripe } from "./stripe";
import { createSingleUseCode, ensureRewardCoupon } from "./stripe-coupons";
import { merchandiseCents, pointsFor, redemptionFor, tierFor } from "./loyalty-rules";
import { rewardCode } from "./tokens";

const EARNING_STATUSES = ["PAID", "FULFILLED"] as const;

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

/**
 * Credit points for a PAID/FULFILLED order that belongs to a member (customer
 * with a login). Rate uses the tier reached BEFORE this order. Returns the
 * points credited (0 when not eligible or already credited).
 */
export async function creditOrder(orderId: string): Promise<number> {
  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { customer: true } });
      if (!order?.customer?.userId) return 0;
      if (!(EARNING_STATUSES as readonly string[]).includes(order.status)) return 0;
      const already = await tx.loyaltyEntry.findUnique({
        where: { orderId_reason: { orderId, reason: "ORDER_CREDIT" } },
      });
      if (already) return 0;

      const merch = merchandiseCents(order.subtotalCents, order.discountCents);
      const tier = tierFor(order.customer.lifetimeSpendCents);
      const points = pointsFor(merch, tier);
      await tx.loyaltyEntry.create({
        data: {
          customerId: order.customer.id,
          orderId,
          points,
          spendCents: merch,
          reason: "ORDER_CREDIT",
          note: `Order ${order.reference.slice(-8).toUpperCase()} · ${tier.id}`,
        },
      });
      await tx.customer.update({
        where: { id: order.customer.id },
        data: { points: { increment: points }, lifetimeSpendCents: { increment: merch } },
      });
      return points;
    });
  } catch (err) {
    if (isUniqueViolation(err)) return 0; // concurrent credit — already done
    throw err;
  }
}

/** Reverse an order's credit (admin set REFUNDED / CANCELLED). Idempotent. */
export async function reverseOrder(orderId: string): Promise<number> {
  try {
    return await prisma.$transaction(async (tx) => {
      const credit = await tx.loyaltyEntry.findUnique({
        where: { orderId_reason: { orderId, reason: "ORDER_CREDIT" } },
      });
      if (!credit) return 0;
      const reversed = await tx.loyaltyEntry.findUnique({
        where: { orderId_reason: { orderId, reason: "ORDER_REVERSAL" } },
      });
      if (reversed) return 0;
      await tx.loyaltyEntry.create({
        data: {
          customerId: credit.customerId,
          orderId,
          points: -credit.points,
          spendCents: -credit.spendCents,
          reason: "ORDER_REVERSAL",
          note: "Order refunded / cancelled",
        },
      });
      await tx.customer.update({
        where: { id: credit.customerId },
        data: { points: { decrement: credit.points }, lifetimeSpendCents: { decrement: credit.spendCents } },
      });
      return credit.points;
    });
  } catch (err) {
    if (isUniqueViolation(err)) return 0;
    throw err;
  }
}

/** Credit every past PAID/FULFILLED order of a (newly registered) member. */
export async function creditPastOrders(customerId: string): Promise<number> {
  const orders = await prisma.order.findMany({
    where: { customerId, status: { in: [...EARNING_STATUSES] } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  let total = 0;
  for (const o of orders) total += await creditOrder(o.id);
  return total;
}

/** Manual admin adjustment (+/-) with a reason. */
export async function adjustPoints(customerId: string, points: number, note: string): Promise<void> {
  await prisma.$transaction([
    prisma.loyaltyEntry.create({ data: { customerId, points, reason: "ADJUSTMENT", note } }),
    prisma.customer.update({ where: { id: customerId }, data: { points: { increment: points } } }),
  ]);
}

export type RedeemResult =
  | { ok: true; code: string; amountOffCents: number }
  | { ok: false; error: "STRIPE_UNAVAILABLE" | "BAD_UNITS" | "INSUFFICIENT_POINTS" | "NOT_MEMBER" | "FAILED" };

/**
 * Redeem `units` × 100 points for one single-use $10×units code.
 * Stripe first (can't be inside a DB transaction), then a conditional
 * decrement + ledger entry + RewardCode in one transaction. If the balance
 * was spent concurrently, the Stripe code is deactivated again.
 */
export async function redeemPoints(customerId: string, units: number): Promise<RedeemResult> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "STRIPE_UNAVAILABLE" };
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer?.userId) return { ok: false, error: "NOT_MEMBER" };
  const check = redemptionFor(units, customer.points);
  if (!check.ok) return check;

  let promo;
  const code = rewardCode("GLOW");
  try {
    const coupon = await ensureRewardCoupon(stripe, units);
    promo = await createSingleUseCode(stripe, coupon.id, code, { metadata: { customerId, program: "glow-club" } });
  } catch (err) {
    console.error("[loyalty] Stripe redemption failed", err);
    return { ok: false, error: "STRIPE_UNAVAILABLE" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const dec = await tx.customer.updateMany({
        where: { id: customerId, points: { gte: check.pointsCost } },
        data: { points: { decrement: check.pointsCost } },
      });
      if (dec.count !== 1) throw new Error("INSUFFICIENT_POINTS");
      await tx.loyaltyEntry.create({
        data: { customerId, points: -check.pointsCost, reason: "REDEEM", note: `Reward code ${code}` },
      });
      await tx.rewardCode.create({
        data: {
          customerId,
          kind: "POINTS",
          code,
          stripePromotionCodeId: promo.id,
          amountOffCents: check.amountOffCents,
          pointsSpent: check.pointsCost,
        },
      });
    });
  } catch (err) {
    await stripe.promotionCodes.update(promo.id, { active: false }).catch(() => {});
    if (err instanceof Error && err.message === "INSUFFICIENT_POINTS") return { ok: false, error: "INSUFFICIENT_POINTS" };
    console.error("[loyalty] redemption transaction failed", err);
    return { ok: false, error: "FAILED" };
  }
  return { ok: true, code, amountOffCents: check.amountOffCents };
}

/** Mark reward codes used on a paid checkout as redeemed (by Stripe promotion code id). */
export async function markCodesRedeemed(promotionCodeIds: string[]): Promise<void> {
  if (!promotionCodeIds.length) return;
  await prisma.rewardCode.updateMany({
    where: { stripePromotionCodeId: { in: promotionCodeIds }, redeemedAt: null },
    data: { redeemedAt: new Date() },
  });
}

/**
 * Glow Club birthday rewards (run once a day by /api/cron/birthdays).
 * For every member whose birthday month is the current month (Montréal time)
 * and who hasn't had this year's reward: create a single-use 15 % Stripe code
 * (coupon glow-birthday-15, valid until the end of next month), save it on
 * the account, email it when email + mailing address are configured.
 */
import { prisma } from "./prisma";
import { getStripe } from "./stripe";
import { BRAND } from "./brand";
import { createSingleUseCode, ensureBirthdayCoupon } from "./stripe-coupons";
import { BIRTHDAY_PERCENT_OFF } from "./loyalty-rules";
import { rewardCode } from "./tokens";
import { sendBirthdayReward } from "./marketing";
import { fmtDate } from "./fmt";

/** Year / month (1-12) in the store's time zone. */
export function localYearMonth(now: Date = new Date()): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: BRAND.timeZone, year: "numeric", month: "numeric" }).formatToParts(now);
  return {
    year: Number(parts.find((p) => p.type === "year")?.value),
    month: Number(parts.find((p) => p.type === "month")?.value),
  };
}

/** Code expiry: last day of the month after the birthday month, ~23:00 Montréal (03:59 UTC on the 1st after). */
export function birthdayCodeExpiry(year: number, month: number): Date {
  return new Date(Date.UTC(year, month + 1, 1, 3, 59, 59));
}

export async function runBirthdayRewards(now: Date = new Date()): Promise<{ issued: number; emailed: number; skipped?: string }> {
  const stripe = getStripe();
  if (!stripe) return { issued: 0, emailed: 0, skipped: "stripe not configured" };
  const { year, month } = localYearMonth(now);
  const due = await prisma.customer.findMany({
    where: {
      userId: { not: null },
      birthMonth: month,
      OR: [{ birthdayRewardYear: null }, { birthdayRewardYear: { lt: year } }],
    },
    take: 200,
  });
  if (!due.length) return { issued: 0, emailed: 0 };
  const coupon = await ensureBirthdayCoupon(stripe);
  const expiresAt = birthdayCodeExpiry(year, month);
  let issued = 0;
  let emailed = 0;
  for (const c of due) {
    // Claim first (conditional update) so overlapping runs can't issue twice.
    const claim = await prisma.customer.updateMany({
      where: { id: c.id, OR: [{ birthdayRewardYear: null }, { birthdayRewardYear: { lt: year } }] },
      data: { birthdayRewardYear: year },
    });
    if (claim.count !== 1) continue;
    const code = rewardCode("BDAY");
    try {
      const promo = await createSingleUseCode(stripe, coupon.id, code, {
        expiresAt,
        metadata: { customerId: c.id, program: "glow-club-birthday" },
      });
      await prisma.rewardCode.create({
        data: { customerId: c.id, kind: "BIRTHDAY", code, stripePromotionCodeId: promo.id, percentOff: BIRTHDAY_PERCENT_OFF, expiresAt },
      });
      issued++;
    } catch (err) {
      console.error("[birthday] code creation failed", c.id, err);
      await prisma.customer.update({ where: { id: c.id }, data: { birthdayRewardYear: c.birthdayRewardYear } });
      continue;
    }
    const locale = c.locale === "fr" ? "fr" : "en";
    const ok = await sendBirthdayReward(c.email, locale, c.name, code, fmtDate(expiresAt, locale)).catch(() => false);
    if (ok) emailed++;
  }
  return { issued, emailed };
}

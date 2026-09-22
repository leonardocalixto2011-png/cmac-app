import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { runBirthdayRewards } from "@/lib/birthdays";
import { runCheckoutReminders, runReviewRequests } from "@/lib/followups";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest, secret: string): boolean {
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>"; x-cron-secret also accepted for manual runs.
  const header = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? req.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(header);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function step<T>(name: string, fn: () => Promise<T>): Promise<T | { error: string }> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[cron] ${name} failed`, err);
    return { error: "failed" };
  }
}

/**
 * Daily jobs (vercel.json cron, one run a day on the Hobby plan): Glow Club
 * birthday rewards, checkout reminders, review requests. Each job is isolated
 * so one failure doesn't block the others. No-op until CRON_SECRET is set.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ skipped: "CRON_SECRET not configured" });
  if (!authorized(req, secret)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = {
    birthdays: await step("birthdays", () => runBirthdayRewards()),
    checkoutReminders: await step("checkout reminders", () => runCheckoutReminders()),
    reviewRequests: await step("review requests", () => runReviewRequests()),
  };
  console.info("[cron] daily", result);
  return NextResponse.json(result);
}

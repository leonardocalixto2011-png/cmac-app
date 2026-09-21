import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { runBirthdayRewards } from "@/lib/birthdays";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest, secret: string): boolean {
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>"; x-cron-secret also accepted for manual runs.
  const header = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? req.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(header);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Daily Glow Club birthday rewards (vercel.json cron). No-op (200, skipped)
 * until CRON_SECRET is set; 401 for any request without the secret.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return NextResponse.json({ skipped: "CRON_SECRET not configured" });
  if (!authorized(req, secret)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const result = await runBirthdayRewards();
    console.info("[birthday] run", result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[birthday] run failed", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

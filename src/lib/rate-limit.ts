/**
 * Fixed-window rate limiting stored in Postgres (RateLimit table), so it holds
 * across serverless instances. One atomic upsert per check.
 */
import { headers } from "next/headers";
import { prisma } from "./prisma";

export const LIMITS = {
  loginEmail: { limit: 8, windowMs: 15 * 60_000 },
  loginIp: { limit: 30, windowMs: 15 * 60_000 },
  registerIp: { limit: 6, windowMs: 60 * 60_000 },
  resetEmail: { limit: 3, windowMs: 60 * 60_000 },
  resetIp: { limit: 10, windowMs: 60 * 60_000 },
  subscribeEmail: { limit: 3, windowMs: 60 * 60_000 },
  subscribeIp: { limit: 12, windowMs: 60 * 60_000 },
  redeem: { limit: 10, windowMs: 60 * 60_000 },
} as const;

/** Returns true when the call is allowed (and counts it). Fails open if the DB errors. */
export async function rateLimit(key: string, rule: { limit: number; windowMs: number }): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, NOW() + (${rule.windowMs} * INTERVAL '1 millisecond'))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" < NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" < NOW()
          THEN NOW() + (${rule.windowMs} * INTERVAL '1 millisecond') ELSE "RateLimit"."resetAt" END
      RETURNING "count"`;
    return Number(rows[0]?.count ?? 0) <= rule.limit;
  } catch (err) {
    console.error("[rate-limit] check failed", err);
    return true;
  }
}

/** Best-effort client IP (Vercel sets x-forwarded-for / x-real-ip). */
export function ipFrom(h: Headers): string {
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
}

export async function requestIp(): Promise<string> {
  return ipFrom(await headers());
}

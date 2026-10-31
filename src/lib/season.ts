import { holidayCutoff, lastChristmasOrderDay } from "./brand";
import type { Locale } from "@/i18n/messages";

/**
 * The Christmas look switches itself on and off by date, like the campaigns in
 * promos.ts, so nothing has to be remembered on the day. Dates are Montréal time
 * written as UTC. The Christmas boxes themselves come off sale on Dec 20, in /admin.
 */
export const CHRISTMAS = { startsAt: "2026-11-01T04:00:00Z", endsAt: "2026-12-26T05:00:00Z" } as const;

/** Today, or the date in NEXT_PUBLIC_SEASON_NOW while previewing a season locally. */
export function seasonNow(): Date {
  const preview = process.env.NEXT_PUBLIC_SEASON_NOW;
  return preview && process.env.NODE_ENV !== "production" ? new Date(preview) : new Date();
}

/** "order": still in time for Christmas. "late": in season, but delivery can no longer be promised. */
export type ChristmasPhase = "order" | "late";

export function christmasPhase(now: Date = seasonNow()): ChristmasPhase | null {
  const t = now.getTime();
  if (t < Date.parse(CHRISTMAS.startsAt) || t >= Date.parse(CHRISTMAS.endsAt)) return null;
  return holidayCutoff(now) ? "order" : "late";
}

/** "November 26" / "26 novembre". */
export function christmasOrderDay(locale: Locale, now: Date = seasonNow()): string {
  return lastChristmasOrderDay(now.getFullYear()).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { month: "long", day: "numeric" });
}

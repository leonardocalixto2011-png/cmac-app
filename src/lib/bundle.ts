/**
 * "Build your own set" tiers: buy 3 single items, save 10 %; buy 5, save 15 %.
 * No code to type: the cart and the checkout both apply it to the eligible
 * lines (sets are already discounted, the free gift is $0, so neither counts).
 * The discount pauses while a seasonal code campaign runs (Black Friday, …)
 * so the two never stack below margin. Pure functions: shared by the client
 * cart (display) and the server checkout (what is charged).
 */
import { activePromo } from "./promos";

export type BundleTier = { minItems: number; percent: number };
export const BUNDLE_TIERS: BundleTier[] = [
  { minItems: 3, percent: 10 },
  { minItems: 5, percent: 15 },
];

export type BundleLine = { slug: string; priceCents: number; qty: number };

export type BundleState = {
  /** Discount applied to eligible lines, 0 when none. */
  percent: number;
  /** Total saved across the cart, in cents. */
  savingCents: number;
  /** How many single items count toward the tiers. */
  eligibleQty: number;
  /** The next tier to reach, or null at the top (or while paused). */
  next: { items: number; percent: number } | null;
  /** True while a seasonal code campaign pauses the tiers. */
  paused: boolean;
};

export function isBundleEligible(line: BundleLine): boolean {
  return !line.slug.startsWith("set-") && line.priceCents > 0 && line.qty > 0;
}

export function bundlePercentFor(eligibleQty: number, now: Date = new Date()): number {
  if (activePromo(now)?.code) return 0;
  let percent = 0;
  for (const t of BUNDLE_TIERS) if (eligibleQty >= t.minItems) percent = t.percent;
  return percent;
}

/** Cents off one line at `percent` (rounded per line so totals match what Stripe sums). */
export function discountedUnit(priceCents: number, percent: number): number {
  return Math.round(priceCents * (1 - percent / 100));
}

export function bundleFor(lines: BundleLine[], now: Date = new Date()): BundleState {
  const paused = Boolean(activePromo(now)?.code);
  const eligible = lines.filter(isBundleEligible);
  const eligibleQty = eligible.reduce((s, l) => s + l.qty, 0);
  const percent = bundlePercentFor(eligibleQty, now);
  const savingCents = percent ? eligible.reduce((s, l) => s + (l.priceCents - discountedUnit(l.priceCents, percent)) * l.qty, 0) : 0;
  const nextTier = paused ? null : BUNDLE_TIERS.find((t) => eligibleQty < t.minItems) ?? null;
  return {
    percent,
    savingCents,
    eligibleQty,
    next: nextTier ? { items: nextTier.minItems - eligibleQty, percent: nextTier.percent } : null,
    paused,
  };
}

/** The same lines with the tier applied to their unit price (what the customer pays). */
export function applyBundle<T extends BundleLine>(lines: T[], now: Date = new Date()): { lines: T[]; percent: number; savingCents: number } {
  const state = bundleFor(lines, now);
  if (!state.percent) return { lines, percent: 0, savingCents: 0 };
  return {
    lines: lines.map((l) => (isBundleEligible(l) ? { ...l, priceCents: discountedUnit(l.priceCents, state.percent) } : l)),
    percent: state.percent,
    savingCents: state.savingCents,
  };
}

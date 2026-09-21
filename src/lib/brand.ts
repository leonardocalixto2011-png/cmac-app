/**
 * Fixed brand facts for CMAC Beauty. Single source of truth for anything
 * repeated across the storefront (shipping rule, returns, warranty, delivery
 * estimate). Do not embellish — no invented reviews, awards or stats.
 *
 * COPY RULE (Health Canada): every device is marketed as a COSMETIC, at-home
 * tool. Copy must stay appearance-only ("the look of", "appearance of").
 * Never "treats", "heals", "stimulates collagen", "reduces inflammation",
 * "clinically proven", or any disease word.
 */
export const BRAND = {
  name: "CMAC Beauty",
  shortName: "CMAC",
  tagline: "Beauty tech · Montréal",
  domain: "https://cmacbeauty.ca",
  area: "Montréal & L'Assomption, Québec",
  areaFr: "Montréal et L'Assomption, Québec",
  /** Public contact mailbox (owner-created 2026-09-21). */
  email: "cmacbeauty.ca@outlook.com",
  currency: "CAD",
  country: "CA",
  timeZone: "America/Toronto",
} as const;

/** Shipping rule — owner's choice. Flat rate, free above the threshold. */
export const SHIPPING = {
  flatCents: 999,
  freeThresholdCents: 7500,
  /**
   * Business-day handling window before the parcel leaves the supplier. 3–5 because CJ
   * buys most items from the factory first (stock "CJ: 0, Factory: N") and a set is
   * consolidated into one parcel. Keep Merchant Center handling time in sync (feed.ts).
   */
  processingDays: { min: 3, max: 5 },
  /** Carrier transit after processing (CJPacket, China → Canada), business days. */
  deliveryBusinessDays: { min: 7, max: 15 },
  /** Rounded carrier transit once shipped (CJPacket from China). */
  deliveryWeeks: { min: 1, max: 3 },
  /** Rounded order-to-door estimate (processing + transit = 10–20 business days). */
  totalWeeks: { min: 2, max: 4 },
} as const;

export const POLICY = {
  returnDays: 30,
  warrantyMonths: 12,
  damageReportDays: 7,
  refundProcessingDays: 5,
} as const;

export function shippingCentsFor(subtotalCents: number): number {
  return subtotalCents >= SHIPPING.freeThresholdCents ? 0 : SHIPPING.flatCents;
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || BRAND.domain;
}

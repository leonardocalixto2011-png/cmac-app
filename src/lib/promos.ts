import type { Locale } from "@/i18n/messages";

/**
 * Seasonal campaigns. Each one switches itself on and off by date, so nothing
 * has to be remembered on the day: the bar appears at `startsAt`, shows the
 * real end date, and disappears at `endsAt`.
 *
 * Honesty rules baked in:
 * - A campaign always states what it gives and when it ends. No "today only"
 *   that runs for three weeks, no countdown that resets.
 * - Discounts happen through a Stripe promotion code the customer types at
 *   checkout. Listed prices never move, so no "was" price is ever invented
 *   (Competition Act, ordinary selling price).
 * - `code` must exist in Stripe before `startsAt`, or the bar promises
 *   something the checkout will refuse. The owner's list lives in
 *   cmac-store/marketing/plan-promos-2026.md.
 *
 * Dates are Montréal time (UTC−5 in winter), written as UTC on purpose.
 */
export type Promo = {
  id: string;
  /** Stripe promotion code, or null for an offer that needs no code (e.g. free shipping threshold). */
  code: string | null;
  /** What the code takes off the cart (whole cart: checkout uses ad-hoc prices, so Stripe can't restrict by product). */
  percentOff: number;
  startsAt: string;
  endsAt: string;
  /** Where the bar links. */
  href: string;
  en: { label: string; detail: string; cta: string };
  fr: { label: string; detail: string; cta: string };
};

export const PROMOS: Promo[] = [
  {
    id: "black-friday-2026",
    code: "BF20",
    percentOff: 20,
    startsAt: "2026-11-27T05:00:00Z",
    endsAt: "2026-12-02T05:00:00Z",
    href: "/collections/gifts",
    en: {
      label: "Black Friday",
      detail: "20% off every gift set with code BF20",
      cta: "See the sets",
    },
    fr: {
      label: "Vendredi fou",
      detail: "20 % de rabais sur tous les coffrets avec le code BF20",
      cta: "Voir les coffrets",
    },
  },
  {
    id: "boxing-day-2026",
    code: "BOXING25",
    percentOff: 25,
    startsAt: "2026-12-26T05:00:00Z",
    endsAt: "2027-01-05T05:00:00Z",
    href: "/collections/gifts",
    en: {
      label: "Boxing Week",
      detail: "25% off sets, and the new-year restock starts here — code BOXING25",
      cta: "Shop the sale",
    },
    fr: {
      label: "Après-Noël",
      detail: "25 % de rabais sur les coffrets, et on repart l'année du bon pied — code BOXING25",
      cta: "Voir la vente",
    },
  },
  {
    id: "galentines-2027",
    code: "BESTIE15",
    percentOff: 15,
    startsAt: "2027-01-28T05:00:00Z",
    endsAt: "2027-02-15T05:00:00Z",
    href: "/shop/set-bestie-duo",
    en: { label: "Galentine's", detail: "15% off the Bestie Glow Duo with code BESTIE15", cta: "See the duo" },
    fr: { label: "Saint-Valentin entre copines", detail: "15 % sur le Duo Glow entre copines avec le code BESTIE15", cta: "Voir le duo" },
  },
  {
    id: "mothers-day-2027",
    code: "MAMAN15",
    percentOff: 15,
    startsAt: "2027-04-26T04:00:00Z",
    endsAt: "2027-05-10T04:00:00Z",
    href: "/collections/gifts",
    en: { label: "Mother's Day", detail: "15% off gift sets with code MAMAN15 — order by April 30 to be on time", cta: "Gift guide" },
    fr: { label: "Fête des Mères", detail: "15 % sur les coffrets avec le code MAMAN15 — commandez d'ici le 30 avril pour être à temps", cta: "Idées cadeaux" },
  },
];

/** The campaign running at `now`, or null. Earliest end date wins when two overlap. */
export function activePromo(now: Date = new Date()): Promo | null {
  const live = PROMOS.filter((p) => {
    const start = Date.parse(p.startsAt);
    const end = Date.parse(p.endsAt);
    return Number.isFinite(start) && Number.isFinite(end) && end > start && now.getTime() >= start && now.getTime() < end;
  });
  return live.sort((a, b) => Date.parse(a.endsAt) - Date.parse(b.endsAt))[0] ?? null;
}

export function promoText(p: Promo, locale: Locale) {
  return locale === "fr" ? p.fr : p.en;
}

/** "until December 1" / "jusqu'au 1er décembre" — the bar always shows when it stops. */
export function promoEndLabel(p: Promo, locale: Locale): string {
  const end = new Date(Date.parse(p.endsAt) - 1);
  const date = end.toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { month: "long", day: "numeric" });
  return locale === "fr" ? `jusqu'au ${date}` : `until ${date}`;
}

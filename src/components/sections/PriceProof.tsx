import Link from "next/link";
import type { Locale } from "@/i18n/messages";
import type { ProductView } from "@/lib/shop";
import { formatMoneyFromCents } from "@/lib/utils";

/**
 * The positioning, made checkable: our live price next to what Amazon.ca was asking
 * for the same kind of device, with the date the comparison was taken. Our side is
 * read from the catalogue so it can never drift from checkout; the market side is a
 * dated snapshot and says so, because a comparison nobody can verify is just an ad.
 * Update MARKET and CHECKED together when the prices are re-checked.
 */
const CHECKED = { en: "September 28, 2026", fr: "28 septembre 2026" };

type Row = {
  slug: string;
  name: { en: string; fr: string };
  market: { en: string; fr: string };
  note?: { en: string; fr: string };
};

const MARKET: Row[] = [
  {
    slug: "led-red-light-mask",
    name: { en: "LED red light mask", fr: "Masque LED lumière rouge" },
    market: { en: "$89.99 for the cheapest on the first page of Amazon.ca", fr: "89,99 $ pour le moins cher en première page d'Amazon.ca" },
  },
  {
    slug: "set-christmas-glow",
    name: { en: "Christmas Glow Box (the mask + 3 pieces)", fr: "Coffret Éclat de Noël (le masque + 3 pièces)" },
    market: { en: "less than the cheapest mask on Amazon.ca sold alone", fr: "moins cher que le masque le moins cher d'Amazon.ca vendu seul" },
    note: { en: "Free shipping", fr: "Livraison gratuite" },
  },
  // Like-for-like only: the same type of device at its cheapest, never a premium brand
  // beside a generic, which would imply an equivalence we can't show.
  {
    slug: "electric-scalp-massager",
    name: { en: "Electric scalp massager", fr: "Masseur électrique pour le cuir chevelu" },
    market: { en: "from $35.99 for electric scalp massagers on the first page of Amazon.ca", fr: "à partir de 35,99 $ pour les masseurs électriques en première page d'Amazon.ca" },
  },
];

export function PriceProof({ products, locale }: { products: ProductView[]; locale: Locale }) {
  const fr = locale === "fr";
  const rows = MARKET.flatMap((r) => {
    const p = products.find((x) => x.slug === r.slug);
    return p ? [{ ...r, price: formatMoneyFromCents(p.priceCents, locale) }] : [];
  });
  if (!rows.length) return null;

  return (
    <section className="section-pad" aria-labelledby="price-proof-h">
      <div className="wrap">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="eyebrow" data-reveal>
            {fr ? "Le juste prix, vérifiable" : "Fair prices you can check"}
          </p>
          <h2 id="price-proof-h" className="mt-3 text-[clamp(1.7rem,1.3rem+1.8vw,2.6rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
            {fr ? "Les appareils de beauté au juste prix, expliqués en français." : "Beauty devices at a fair price, explained plainly."}
          </h2>
          <p className="mt-3 text-[1rem] leading-relaxed text-ink-soft" data-reveal style={{ "--d": "140ms" } as React.CSSProperties}>
            {fr
              ? "On vend en direct, sans commission de place de marché. C'est toute la raison de l'écart, et la contrepartie est dite : 2 à 4 semaines de livraison."
              : "We sell direct, with no marketplace commission. That is the whole reason for the gap, and the trade-off is stated: 2 to 4 weeks for delivery."}
          </p>
        </div>

        <ul className="mx-auto mt-8 grid max-w-[980px] gap-4 md:grid-cols-3">
          {rows.map((r, i) => (
            <li key={r.slug} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
              <Link
                href={`/shop/${r.slug}`}
                className="flex h-full flex-col rounded-[var(--radius-card)] bg-warm-white p-6 transition-transform hover:-translate-y-0.5"
              >
                <span className="text-[0.95rem] font-semibold text-ink">{fr ? r.name.fr : r.name.en}</span>
                <span className="mt-3 font-display text-[2.1rem] leading-none text-terra">{r.price}</span>
                {r.note && <span className="mt-1 text-[0.85rem] font-semibold text-ink">{fr ? r.note.fr : r.note.en}</span>}
                <span className="mt-3 text-[0.9rem] leading-snug text-ink-soft">
                  {fr ? "Ailleurs : " : "Elsewhere: "}
                  {fr ? r.market.fr : r.market.en}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-6 max-w-[760px] text-center text-[0.82rem] text-ink-soft">
          {fr
            ? `Prix relevés sur Amazon.ca le ${CHECKED.fr}. Les prix changent : vérifiez avant d'acheter. `
            : `Prices checked on Amazon.ca on ${CHECKED.en}. Prices move: check before you buy. `}
          <Link href="/journal/led-mask-canada-price-guide" className="font-semibold text-terra underline-offset-4 hover:underline">
            {fr ? "Pourquoi on peut être moins cher" : "Why we can be cheaper"}
          </Link>
        </p>
      </div>
    </section>
  );
}

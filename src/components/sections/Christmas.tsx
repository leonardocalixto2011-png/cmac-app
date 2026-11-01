"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/shop/ProductCard";
import { CHRISTMAS_SETS } from "@/lib/sets";
import { christmasOrderDay } from "@/lib/season";
import type { ProductView } from "@/lib/shop";

/** The four dates that matter, in order. Same dates as src/lib/promos.ts and the journal. */
export function ChristmasDates() {
  const { t, locale } = useLocale();
  const date = christmasOrderDay(locale);
  const items = [
    [t("xmas.date.bf"), t("xmas.date.bfD")],
    [date, t("xmas.date.lastD")],
    [t("xmas.date.end"), t("xmas.date.endD")],
    [t("xmas.date.boxing"), t("xmas.date.boxingD")],
  ];
  return (
    <section className="xmas-dates" id="dates" aria-label={t("xmas.date.label")}>
      <ol className="wrap xmas-dates__list">
        {items.map(([when, what]) => (
          <li key={when}>
            <strong>{when}</strong>
            <span>{what}</span>
          </li>
        ))}
      </ol>
      <p className="wrap xmas-dates__note">{t("xmas.date.note")}</p>
    </section>
  );
}

/** The way out for a late or undecided buyer. Everything else here ships in weeks. */
export function GiftCardBand() {
  const { t } = useLocale();
  return (
    <aside className="gift-band">
      <div>
        <p className="eyebrow">{t("gift.band.eyebrow")}</p>
        <h2>{t("gift.band.title")}</h2>
        <p>{t("gift.band.body")}</p>
      </div>
      <Link className="btn" href="/gift-card">
        {t("gift.band.cta")}
        <Icon name="arrow" />
      </Link>
    </aside>
  );
}

/** One box per person on the list. Each card says who it is for before what it is. */
export function ChristmasGuide({ products, compact = false }: { products: ProductView[]; compact?: boolean }) {
  const { t } = useLocale();
  const sets = CHRISTMAS_SETS.flatMap((slug) => products.filter((p) => p.slug === slug));
  if (sets.length === 0) return null;
  return (
    <section className={compact ? "xmas-guide xmas-guide--compact" : "cmac-featured xmas-guide"} data-sky="linen">
      <div className={compact ? undefined : "wrap"}>
        <div className="cmac-featured__head">
          <div>
            <p className="eyebrow">{t("xmas.guide.eyebrow")}</p>
            <h2>{t("xmas.guide.title")}</h2>
          </div>
          {!compact && (
            <Link className="btn btn--ghost" href="/collections/christmas">
              {t("xmas.guide.link")}
              <Icon name="arrow" />
            </Link>
          )}
        </div>
        <div className="xmas-guide__grid">
          {sets.map((p, i) => (
            <div key={p.slug} className="xmas-guide__item">
              <p className="xmas-guide__for">{t(`xmas.for.${p.slug}`)}</p>
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

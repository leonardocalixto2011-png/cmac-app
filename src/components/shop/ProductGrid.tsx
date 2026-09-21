"use client";

import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { ProductCard } from "./ProductCard";
import type { ProductView } from "@/lib/shop";

const FILTERS = ["all", "glow", "sculpt", "cool", "essentials"] as const;
type Filter = (typeof FILTERS)[number];

export function ProductGrid({
  products,
  title,
  intro,
  eyebrow,
  showFilters = true,
  initialFilter = "all",
}: {
  products: ProductView[];
  title: string;
  intro?: string;
  eyebrow?: string;
  showFilters?: boolean;
  initialFilter?: Filter;
}) {
  const { t } = useLocale();
  const [filter, setFilter] = useState<Filter>(initialFilter);

  const visible = filter === "all" ? products : products.filter((p) => p.tags.includes(filter));

  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-[60ch]">
        <span className="eyebrow" data-reveal>
          {eyebrow ?? t("shop.eyebrow")}
        </span>
        <h1 className="mt-3 text-[clamp(2.2rem,1.6rem+3vw,3.6rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
          {title}
        </h1>
        {intro && (
          <p className="mt-3 text-ink-soft" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
            {intro}
          </p>
        )}
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("shop.filterLabel")}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className="pill"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? t("shop.all") : t(`coll.${f}.t`)}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-ink-faint">{t("shop.empty")}</p>
      ) : (
        <div className="product-grid">
          {visible.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductView } from "@/lib/shop";

/**
 * Server page fetches active products and passes them in. `variant="sets"`
 * renders the homepage "Curated sets" band with the same cards.
 */
export function FeaturedProducts({ products, variant = "edit" }: { products: ProductView[]; variant?: "edit" | "sets" }) {
  const { t } = useLocale();
  const sets = variant === "sets";
  if (sets && products.length === 0) return null;

  return (
    <section className={sets ? "cmac-featured cmac-featured--sets" : "cmac-featured"} id={sets ? "sets" : "shop"}>
      <div className="wrap">
        <div className="cmac-featured__head">
          <div>
            <p className="eyebrow" data-reveal>
              {t(sets ? "sets.eyebrow" : "featured.eyebrow")}
            </p>
            <h2 data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
              {t(sets ? "sets.title" : "featured.title")}
            </h2>
          </div>
          <Link
            className="btn btn--ghost"
            href={sets ? "/collections/sets" : "/shop"}
            data-reveal
            style={{ "--d": "160ms" } as React.CSSProperties}
          >
            {t(sets ? "sets.link" : "featured.link")}
            <Icon name="arrow" />
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-ink-faint">{t("featured.empty")}</p>
        ) : (
          <div className="product-grid">
            {products.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

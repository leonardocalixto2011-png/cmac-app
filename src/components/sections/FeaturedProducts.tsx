"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductView } from "@/lib/shop";

/** Server page fetches active products and passes them in. */
export function FeaturedProducts({ products }: { products: ProductView[] }) {
  const { t } = useLocale();

  return (
    <section className="cmac-featured" id="shop">
      <div className="wrap">
        <div className="cmac-featured__head">
          <div>
            <p className="eyebrow" data-reveal>
              {t("featured.eyebrow")}
            </p>
            <h2 data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
              {t("featured.title")}
            </h2>
          </div>
          <Link className="btn btn--ghost" href="/shop" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
            {t("featured.link")}
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

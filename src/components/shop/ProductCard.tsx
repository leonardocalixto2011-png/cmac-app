"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { useCart } from "./CartProvider";
import { ProductArt } from "./ProductArt";
import { Icon } from "@/components/Icon";
import { formatMoneyFromCents } from "@/lib/utils";
import type { ProductView } from "@/lib/shop";

export function ProductCard({ product: p, index = 0 }: { product: ProductView; index?: number }) {
  const { t, locale } = useLocale();
  const cart = useCart();
  const name = locale === "fr" ? p.nameFr : p.nameEn;
  const tagline = locale === "fr" ? p.taglineFr ?? p.tagline : p.tagline;
  const href = `/shop/${p.slug}`;
  const hasOptions = p.options.length > 0;
  const onSale = p.compareAtCents != null && p.compareAtCents > p.priceCents;
  const pct = onSale ? Math.round(((p.compareAtCents! - p.priceCents) / p.compareAtCents!) * 100) : 0;

  function quickAdd() {
    cart.add({
      slug: p.slug,
      qty: 1,
      selected: {},
      nameFr: p.nameFr,
      nameEn: p.nameEn,
      priceCents: p.priceCents,
      image: p.images[0] ?? null,
      tags: p.tags,
      optionLabelsFr: {},
      optionLabelsEn: {},
    });
  }

  return (
    <article className="product-card tilt" data-reveal style={{ "--d": `${index * 90}ms` } as React.CSSProperties}>
      <Link className="product-card__media" href={href} aria-label={name}>
        <ProductArt images={p.images} hoverImage={p.images[1]} name={name} tags={p.tags} sizes="(min-width: 990px) 25vw, 50vw" />
        {onSale ? (
          <span className="product-card__badge">−{pct}%</span>
        ) : p.tags.includes("new") ? (
          <span className="product-card__badge product-card__badge--new">{t("featured.new")}</span>
        ) : null}
      </Link>
      <div className="product-card__body">
        <h3>
          <Link href={href}>{name}</Link>
        </h3>
        {tagline && <p className="product-card__tag">{tagline}</p>}
        <div className="product-card__row">
          <span className="product-card__price">
            {formatMoneyFromCents(p.priceCents, locale)}
            {onSale && <s>{formatMoneyFromCents(p.compareAtCents!, locale)}</s>}
          </span>
          {hasOptions ? (
            <Link className="product-card__add" href={href}>
              <span>{t("featured.choose")}</span>
            </Link>
          ) : (
            <button type="button" className="product-card__add" onClick={quickAdd} aria-label={`${t("shop.addToCart")} — ${name}`}>
              <Icon name="plus" />
              <span>{t("featured.add")}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

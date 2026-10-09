"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { useCart } from "./CartProvider";
import { ProductArt } from "./ProductArt";
import { formatMoneyFromCents } from "@/lib/utils";
import type { ProductView } from "@/lib/shop";
import { announceAdded, flyToCart } from "@/lib/motion-fx";

/**
 * Product tile: the photo on a uniform tile, then name, one-line note and
 * price set directly on the page background. No card, no shadow, no badge,
 * no repeated black button: on pointer devices an "Add" bar slides over the
 * photo on hover; on touch the whole tile is the link to the product page.
 */
export function ProductCard({ product: p }: { product: ProductView; index?: number }) {
  const { t, locale } = useLocale();
  const cart = useCart();
  const name = locale === "fr" ? p.nameFr : p.nameEn;
  const tagline = locale === "fr" ? (p.taglineFr ?? p.tagline) : p.tagline;
  const href = `/shop/${p.slug}`;
  const hasOptions = p.options.length > 0;
  const isSet = p.tags.includes("sets");
  const price = formatMoneyFromCents(p.priceCents, locale);
  // Sets: compareAt is the pieces bought separately (shown as "worth"); singles: a former price.
  const worth = isSet && p.compareAtCents != null && p.compareAtCents > p.priceCents ? p.compareAtCents : null;
  const onSale = !isSet && p.compareAtCents != null && p.compareAtCents > p.priceCents;

  function quickAdd(e: React.MouseEvent<HTMLButtonElement>) {
    flyToCart(e.currentTarget);
    announceAdded(name);
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
    <article className="product-card" data-reveal>
      <div className="product-card__frame">
        <Link className="product-card__media" href={href} aria-label={name}>
          <ProductArt
            images={p.images}
            hoverImage={p.images[1]}
            name={name}
            tags={p.tags}
            fit="tile"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        </Link>
        {hasOptions ? (
          <Link className="product-card__quick" href={href} tabIndex={-1} aria-hidden="true">
            {t("featured.choose")}
          </Link>
        ) : (
          <button type="button" className="product-card__quick" onClick={quickAdd} aria-label={`${t("shop.addToCart")} — ${name}`}>
            {t("featured.add")} — {price}
          </button>
        )}
      </div>
      <div className="product-card__body">
        <h3>
          <Link href={href}>{name}</Link>
        </h3>
        {tagline && <p className="product-card__tag">{tagline}</p>}
        <p className="product-card__price">
          <span>{price}</span>
          {worth != null && <span className="product-card__worth"> · {t("shop.separately", { amount: formatMoneyFromCents(worth, locale) })}</span>}
          {onSale && <s>{formatMoneyFromCents(p.compareAtCents!, locale)}</s>}
        </p>
      </div>
    </article>
  );
}

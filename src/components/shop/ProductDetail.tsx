"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { useCart } from "./CartProvider";
import { ProductArt } from "./ProductArt";
import { Icon } from "@/components/Icon";
import { formatMoneyFromCents, formatWholeDollars, cn } from "@/lib/utils";
import { POLICY, SHIPPING } from "@/lib/brand";
import type { ProductView, SetComponentView } from "@/lib/shop";

export function ProductDetail({ product, components = [] }: { product: ProductView; components?: SetComponentView[] }) {
  const { t, locale } = useLocale();
  const cart = useCart();

  const name = locale === "fr" ? product.nameFr : product.nameEn;
  const tagline = locale === "fr" ? product.taglineFr ?? product.tagline : product.tagline;
  const description = locale === "fr" ? product.descriptionFr : product.descriptionEn;
  const onSale = product.compareAtCents != null && product.compareAtCents > product.priceCents;
  const isSet = product.tags.includes("sets");
  const pct = onSale ? Math.round(((product.compareAtCents! - product.priceCents) / product.compareAtCents!) * 100) : 0;

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((o) => [o.nameEn, ""])),
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const missingOption = product.options.some((o) => !selected[o.nameEn]);

  function addToCart() {
    if (missingOption) return;
    const labelsFr: Record<string, string> = {};
    const labelsEn: Record<string, string> = {};
    for (const o of product.options) {
      const v = o.values.find((x) => x.value === selected[o.nameEn]);
      if (v) {
        labelsFr[o.nameFr] = v.labelFr;
        labelsEn[o.nameEn] = v.labelEn;
      }
    }
    cart.add({
      slug: product.slug,
      qty,
      selected,
      nameFr: product.nameFr,
      nameEn: product.nameEn,
      priceCents: product.priceCents,
      image: product.images[0] ?? null,
      tags: product.tags,
      optionLabelsFr: labelsFr,
      optionLabelsEn: labelsEn,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  const gallery = product.images.length ? product.images : [];

  return (
    <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
      <div>
        <Link href="/shop" className="mb-4 inline-block text-sm text-ink-soft hover:text-terra">
          {t("shop.backToShop")}
        </Link>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-cream-2" data-reveal="scale">
          <ProductArt images={gallery[activeImage] ? [gallery[activeImage]] : []} name={name} tags={product.tags} priority />
          {onSale && <span className="product-card__badge">−{pct}%</span>}
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-2">
            {gallery.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-pressed={activeImage === i}
                className={cn(
                  "relative h-16 w-16 overflow-hidden rounded-xl border-2",
                  activeImage === i ? "border-ink" : "border-transparent",
                )}
              >
                <ProductArt images={[src]} name={`${name} ${i + 1}`} tags={product.tags} sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <span className="eyebrow">{t("shop.eyebrow")}</span>
        <h1 className="mt-3 text-[clamp(1.9rem,1.4rem+2vw,3rem)]">{name}</h1>
        {tagline && <p className="mt-2 text-[1.05rem] text-sage">{tagline}</p>}
        {product.tags.includes("limited") && (
          <span className="mt-3 inline-block rounded-full border border-terra px-3 py-0.5 font-ui text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-terra">
            {t("shop.limited")}
          </span>
        )}

        <p className="mt-4 flex flex-wrap items-baseline gap-3">
          <span className="font-ui text-2xl font-semibold text-ink">{formatMoneyFromCents(product.priceCents, locale)}</span>
          {onSale && (
            <>
              <s className="text-ink-faint">{formatMoneyFromCents(product.compareAtCents!, locale)}</s>
              <span className="rounded-full bg-terra px-2.5 py-0.5 text-[0.72rem] font-semibold text-white">{t("shop.save", { pct })}</span>
            </>
          )}
        </p>
        {isSet && onSale && (
          <p className="mt-2 text-[0.92rem] text-ink-soft">
            {t("shop.youSave", { amount: formatMoneyFromCents(product.compareAtCents! - product.priceCents, locale), pct })}
          </p>
        )}

        {product.options.map((o) => (
          <fieldset key={o.nameEn} className="mt-6">
            <legend className="mb-2 font-ui text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {locale === "fr" ? o.nameFr : o.nameEn}
            </legend>
            <div className="flex flex-wrap gap-2">
              {o.values.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  className="pill"
                  aria-pressed={selected[o.nameEn] === v.value}
                  onClick={() => setSelected((s) => ({ ...s, [o.nameEn]: v.value }))}
                >
                  {locale === "fr" ? v.labelFr : v.labelEn}
                </button>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 font-ui text-[0.8rem] font-semibold text-ink-soft" htmlFor="qty">
            {t("shop.qty")}
            <input
              id="qty"
              type="number"
              min={1}
              max={10}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              className="field w-[76px] text-center"
            />
          </label>
          <button type="button" onClick={addToCart} disabled={missingOption} className="btn flex-1 sm:flex-none">
            <Icon name={added ? "check" : "plus"} />
            {added ? t("shop.added") : missingOption ? t("shop.chooseOption", { name: locale === "fr" ? product.options[0]?.nameFr : product.options[0]?.nameEn }) : t("shop.addToCart")}
          </button>
        </div>
        {cart.count > 0 && (
          <Link href="/cart" className="btn btn--ghost btn--sm mt-3">
            {t("shop.viewCart")} ({cart.count})
          </Link>
        )}

        {components.length > 0 && (
          <div className="mt-8 border-t border-[var(--line)] pt-6">
            <h2 className="mb-3 text-[1.25rem]">{t("shop.inside")}</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {components.map((c) => {
                const cName = locale === "fr" ? c.nameFr : c.nameEn;
                return (
                  <li key={c.slug}>
                    <Link href={`/shop/${c.slug}`} className="group block text-[0.85rem] leading-snug text-ink-soft hover:text-terra">
                      <div className="relative mb-2 aspect-square overflow-hidden rounded-xl bg-cream-2">
                        <ProductArt images={c.image ? [c.image] : []} name={cName} tags={product.tags} sizes="120px" />
                        {c.qty > 1 && (
                          <span className="absolute right-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[0.7rem] font-semibold text-cream">×{c.qty}</span>
                        )}
                      </div>
                      {cName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {description && (
          <div
            className="prose mt-8 border-t border-[var(--line)] pt-6"
            // Description HTML is authored by the owner in /admin (trusted).
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        <div className="mt-8 rounded-[var(--radius-card)] bg-warm-white p-5 text-[0.92rem] text-ink-soft">
          <h3 className="mb-3 text-[1.1rem] text-ink">{t("shop.deliveryTitle")}</h3>
          <ul className="flex flex-col gap-2">
            <li className="flex gap-2">
              <Icon name="check" className="mt-1 h-4 w-4 flex-none text-terra" />
              {t("shop.delivery", {
                pmin: SHIPPING.processingDays.min,
                pmax: SHIPPING.processingDays.max,
                dmin: SHIPPING.deliveryBusinessDays.min,
                dmax: SHIPPING.deliveryBusinessDays.max,
                wmin: SHIPPING.deliveryWeeks.min,
                wmax: SHIPPING.deliveryWeeks.max,
              })}
            </li>
            <li className="flex gap-2">
              <Icon name="check" className="mt-1 h-4 w-4 flex-none text-terra" />
              {t("shop.shippingRule", {
                flat: formatMoneyFromCents(SHIPPING.flatCents, locale),
                free: formatWholeDollars(SHIPPING.freeThresholdCents, locale),
              })}
            </li>
            <li className="flex gap-2">
              <Icon name="check" className="mt-1 h-4 w-4 flex-none text-terra" />
              {t("shop.returns", { days: POLICY.returnDays })}
            </li>
            {!product.tags.includes("hygiene") && (
              <li className="flex gap-2">
                <Icon name="check" className="mt-1 h-4 w-4 flex-none text-terra" />
                {t("shop.warranty", { months: POLICY.warrantyMonths })}
              </li>
            )}
          </ul>
          <p className="mt-4 text-[0.8rem] text-ink-faint">{t("shop.cosmeticNote")}</p>
        </div>
      </div>
    </div>
  );
}

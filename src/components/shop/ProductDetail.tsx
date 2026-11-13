"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { useCart } from "./CartProvider";
import { ProductArt } from "./ProductArt";
import { Icon } from "@/components/Icon";
import { formatMoneyFromCents, formatWholeDollars, cn } from "@/lib/utils";
import { POLICY, SHIPPING } from "@/lib/brand";
import { splitDescription } from "@/lib/description";
import { christmasOrderDay, christmasPhase } from "@/lib/season";
import type { ProductView, SetComponentView } from "@/lib/shop";
import { trackAddToCart, trackViewContent } from "@/lib/pixels";
import { announceAdded, flyToCart, useReducedMotion } from "@/lib/motion-fx";

// The honest spec section stays open: the page promises it, so it should not hide behind a click.
const SPEC_SECTION = /what we know|ce qu'on sait/i;
// A set's photo grid already shows its pieces, so its written list would say the same thing twice.
const INSIDE_SECTION = /^(what's inside|dans le coffret)/i;

export function ProductDetail({ product, components = [] }: { product: ProductView; components?: SetComponentView[] }) {
  const { t, locale } = useLocale();
  const christmas = christmasPhase();
  const cart = useCart();

  useEffect(() => {
    trackViewContent({ id: product.slug, name: product.nameEn, priceCents: product.priceCents });
  }, [product.slug, product.nameEn, product.priceCents]);

  const name = locale === "fr" ? product.nameFr : product.nameEn;
  const tagline = locale === "fr" ? product.taglineFr ?? product.tagline : product.tagline;
  const description = locale === "fr" ? product.descriptionFr : product.descriptionEn;
  const onSale = product.compareAtCents != null && product.compareAtCents > product.priceCents;
  const isSet = product.tags.includes("sets");
  const pct = onSale ? Math.round(((product.compareAtCents! - product.priceCents) / product.compareAtCents!) * 100) : 0;

  // First value preselected: one tap less, and the pill + cart line both show the choice.
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((o) => [o.nameEn, o.values[0]?.value ?? ""])),
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const reduceMotion = useReducedMotion();
  const addBtn = useRef<HTMLButtonElement>(null);
  const [activeImage, setActiveImage] = useState(0);
  // null until the observer has run: the phone bar is portaled to <body>, which only exists on the client.
  const [barShown, setBarShown] = useState<boolean | null>(null);

  // The phone bar stands in for the main button, so it shows only while that button
  // and the footer are both out of view.
  useEffect(() => {
    const btn = addBtn.current;
    if (!btn) return;
    const inView = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inView.add(e.target);
        else inView.delete(e.target);
      }
      setBarShown(inView.size === 0);
    });
    io.observe(btn);
    const footer = document.querySelector("footer");
    if (footer) io.observe(footer);
    return () => io.disconnect();
  }, []);

  const missingOption = product.options.some((o) => !selected[o.nameEn]);

  function addToCart(e: MouseEvent<HTMLButtonElement>) {
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
    trackAddToCart({ id: product.slug, name: product.nameEn, priceCents: product.priceCents, qty });
    flyToCart(e.currentTarget);
    announceAdded(locale === "fr" ? product.nameFr : product.nameEn);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  // Gallery slides: hero photo first, then the supplier video (if any), then the other photos.
  type Slide = { kind: "image"; src: string } | { kind: "video"; src: string; poster: string };
  const imageSlides: Slide[] = product.images.map((src) => ({ kind: "image", src }));
  const videoSlides: Slide[] = product.videos.map((v) => ({ kind: "video", src: v.mp4, poster: v.poster }));
  const gallery: Slide[] = [...imageSlides.slice(0, 1), ...videoSlides, ...imageSlides.slice(1)];
  const active = gallery[activeImage];

  const addLabel = added
    ? t("shop.added")
    : missingOption
      ? t("shop.chooseOption", { name: locale === "fr" ? product.options[0]?.nameFr : product.options[0]?.nameEn })
      : t("shop.addToCart");
  const { intro, sections: allSections } = splitDescription(description ?? "");
  const sections = components.length > 0 ? allSections.filter((s) => !INSIDE_SECTION.test(s.title)) : allSections;

  return (
    <div className="pdp">
      <div className="pdp__gallery">
        <Link href="/shop" className="mb-2 hidden py-2 text-sm text-ink-soft hover:text-terra md:inline-block">
          {t("shop.backToShop")}
        </Link>
        {/* Phones: a visitor from an ad sees what it is and what it costs before the photo. */}
        <p className="mb-3 flex items-baseline justify-between gap-3 md:hidden" aria-hidden="true">
          <span className="font-display text-[1.35rem] font-medium leading-tight text-ink">{name}</span>
          <span className="flex-none font-ui text-[1.15rem] font-semibold tabular-nums text-ink">{formatMoneyFromCents(product.priceCents, locale)}</span>
        </p>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-warm-white" data-reveal="scale">
          {active?.kind === "video" ? (
            <video
              key={active.src}
              src={active.src}
              poster={active.poster}
              autoPlay={!reduceMotion}
              controls={reduceMotion}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ProductArt images={active ? [active.src] : []} name={name} tags={product.tags} priority fit="contain" sizes="(min-width: 1024px) 50vw, 100vw" />
          )}
          {onSale && <span className="product-card__badge">−{pct}%</span>}
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {gallery.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-pressed={activeImage === i}
                className={cn(
                  "relative h-16 w-16 overflow-hidden rounded-xl border-2",
                  activeImage === i ? "border-ink" : "border-transparent",
                )}
              >
                <ProductArt
                  images={[slide.kind === "video" ? slide.poster : slide.src]}
                  name={`${name} ${i + 1}`}
                  tags={product.tags}
                  sizes="64px"
                />
                {slide.kind === "video" && (
                  <span className="absolute inset-0 grid place-items-center bg-ink/25" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                )}
                {slide.kind === "video" && <span className="sr-only">{t("shop.video")}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pdp__buy">
        <span className="eyebrow">{t("shop.eyebrow")}</span>
        <h1 className="mt-3 text-[clamp(1.9rem,1.4rem+2vw,3rem)]">{name}</h1>
        {tagline && <p className="mt-2 text-[1.05rem] text-sage">{tagline}</p>}
        {product.tags.includes("limited") && (
          <>
            <span className="mt-3 inline-flex flex-wrap gap-2">
              <span className="inline-block rounded-full border border-terra px-3 py-0.5 font-ui text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-terra">
                {t(product.tags.includes("christmas") ? "shop.limitedChristmas" : "shop.limited")}
              </span>
              <Link
                href="/glow-club"
                className="hidden rounded-full bg-ink px-3 py-0.5 font-ui text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-cream hover:bg-terra md:inline-block"
              >
                {t("shop.membersFirstBadge")}
              </Link>
            </span>
            <p className="mt-2 hidden text-[0.85rem] text-ink-soft md:block">{t("shop.membersFirst")}</p>
          </>
        )}

        {isSet && onSale ? (
          <div className="mt-4 rounded-2xl bg-warm-white px-4 py-3.5">
            <dl className="flex flex-col gap-1 text-[0.92rem]">
              <div className="flex items-baseline justify-between gap-4 text-ink-faint">
                <dt>{t("shop.priceSeparately")}</dt>
                <dd className="tabular-nums line-through">{formatMoneyFromCents(product.compareAtCents!, locale)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 font-semibold text-terra">
                <dt>{t("shop.priceSaving", { pct })}</dt>
                <dd className="tabular-nums">−{formatMoneyFromCents(product.compareAtCents! - product.priceCents, locale)}</dd>
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-[var(--line)] pt-2">
                <dt className="font-ui text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">{t("shop.priceYouPay")}</dt>
                <dd className="font-ui text-2xl font-semibold tabular-nums text-ink">{formatMoneyFromCents(product.priceCents, locale)}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="font-ui text-2xl font-semibold text-ink">{formatMoneyFromCents(product.priceCents, locale)}</span>
            {onSale && (
              <>
                <s className="text-ink-faint">{formatMoneyFromCents(product.compareAtCents!, locale)}</s>
                <span className="rounded-full bg-terra px-2.5 py-0.5 text-[0.72rem] font-semibold text-white">{t("shop.save", { pct })}</span>
              </>
            )}
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
                  onClick={() => {
                    setSelected((s) => ({ ...s, [o.nameEn]: v.value }));
                    const idx = gallery.findIndex((g) => g.kind === "image" && g.src === v.image);
                    if (idx >= 0) setActiveImage(idx);
                  }}
                >
                  {v.hex && <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full border border-black/15" style={{ background: v.hex }} />}
                  {locale === "fr" ? v.labelFr : v.labelEn}
                </button>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="mt-6 flex items-center gap-3">
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
          <button ref={addBtn} type="button" onClick={addToCart} disabled={missingOption} className="btn flex-1">
            <Icon name={added ? "check" : "plus"} />
            {addLabel}
          </button>
        </div>
        {cart.count > 0 && (
          <Link href="/cart" className="btn btn--ghost btn--sm mt-3">
            {t("shop.viewCart")} ({cart.count})
          </Link>
        )}

        <ul className="mt-5 flex flex-col gap-1.5 text-[0.88rem] text-ink-soft">
          {christmas && (
            <li className="flex gap-2 font-semibold text-ink">
              <Icon name="gift" className="mt-0.5 h-4 w-4 flex-none text-terra" />
              <span>
                {christmas === "order" ? t("xmas.line", { date: christmasOrderDay(locale) }) : t("xmas.late")}
                {christmas === "late" && (
                  <>
                    {" "}
                    <Link href="/gift-card" className="text-terra underline underline-offset-2">
                      {t("gift.lateLink")}
                    </Link>
                  </>
                )}
              </span>
            </li>
          )}
          <li className="flex gap-2">
            <Icon name="check" className="mt-1 h-3.5 w-3.5 flex-none text-terra" />
            {t("shop.deliveryShort", { wmin: SHIPPING.totalWeeks.min, wmax: SHIPPING.totalWeeks.max })}
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="mt-1 h-3.5 w-3.5 flex-none text-terra" />
            {t("shop.shippingRule", {
              flat: formatMoneyFromCents(SHIPPING.flatCents, locale),
              free: formatWholeDollars(SHIPPING.freeThresholdCents, locale),
            })}
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="mt-1 h-3.5 w-3.5 flex-none text-terra" />
            <span>
              {locale === "fr" ? "Ou livraison gratuite avec le Convoi, à choisir au panier. " : "Or free shipping with the Convoy, chosen in the cart. "}
              <Link href="/convoi" className="text-terra underline underline-offset-2">
                {locale === "fr" ? "Comment ça marche" : "How it works"}
              </Link>
            </span>
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="mt-1 h-3.5 w-3.5 flex-none text-terra" />
            {locale === "fr" ? "Paiement sécurisé par Stripe : Visa, Mastercard, Apple Pay." : "Secure payment by Stripe: Visa, Mastercard, Apple Pay."}
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="mt-1 h-3.5 w-3.5 flex-none text-terra" />
            {t(product.tags.includes("hygiene") ? "shop.returnsShortHygiene" : "shop.returnsShort", { days: POLICY.returnDays })}
          </li>
        </ul>
      </div>

      <div className="pdp__details flex flex-col gap-8">
        {components.length > 0 && (
          <div>
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

        {intro && (
          <div
            className="prose"
            // Description HTML is authored by the owner in /admin (trusted).
            dangerouslySetInnerHTML={{ __html: intro }}
          />
        )}

        <div className="pdp-acc">
          {sections.map((s, i) => (
            <details key={s.title} className="pdp-acc__item" open={i === 0 || SPEC_SECTION.test(s.title)}>
              <summary>{s.title}</summary>
              <div className="pdp-acc__body prose" dangerouslySetInnerHTML={{ __html: s.html }} />
            </details>
          ))}
          <details className="pdp-acc__item">
            <summary>{t("shop.deliveryTitle")}</summary>
            <div className="pdp-acc__body text-[0.95rem] text-ink-soft">
              <ul className="flex flex-col gap-2">
                <li className="flex gap-2">
                  <Icon name="check" className="mt-1 h-4 w-4 flex-none text-terra" />
                  {t("shop.delivery", {
                    pmin: SHIPPING.processingDays.min,
                    pmax: SHIPPING.processingDays.max,
                    dmin: SHIPPING.deliveryBusinessDays.min,
                    dmax: SHIPPING.deliveryBusinessDays.max,
                    wmin: SHIPPING.totalWeeks.min,
                    wmax: SHIPPING.totalWeeks.max,
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
          </details>
        </div>
      </div>

      {barShown !== null &&
        createPortal(
          <div className={cn("pdp-bar", barShown && "is-shown")}>
            <div className="min-w-0">
              <p className="pdp-bar__name">{name}</p>
              <p className="pdp-bar__price">{formatMoneyFromCents(product.priceCents, locale)}</p>
            </div>
            <button type="button" onClick={addToCart} disabled={missingOption} className="btn btn--sm flex-none">
              <Icon name={added ? "check" : "plus"} />
              {addLabel}
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

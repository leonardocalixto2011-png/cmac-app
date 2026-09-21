"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { useCart } from "./CartProvider";
import { ProductArt } from "./ProductArt";
import { checkout } from "@/app/shop/actions";
import { Icon } from "@/components/Icon";
import { formatMoneyFromCents, formatWholeDollars } from "@/lib/utils";
import { BRAND, SHIPPING } from "@/lib/brand";
import { getTier, pointsFor, type TierId } from "@/lib/loyalty-rules";

export type CartMember = { tier: TierId; freeShippingFromCents: number; quarterPointsPerDollar: number } | null;

export function CartView({ member = null, subscribed = false }: { member?: CartMember; subscribed?: boolean }) {
  const { t, locale } = useLocale();
  const cart = useCart();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optIn, setOptIn] = useState(false); // CASL: unchecked by default

  function pay() {
    setError(null);
    start(async () => {
      const res = await checkout(
        cart.items.map((i) => ({ slug: i.slug, qty: i.qty, selected: i.selected })),
        locale,
        { newsletter: optIn },
      );
      if (res.ok) {
        window.location.href = res.url;
      } else if (res.error === "PAYMENT_UNAVAILABLE") {
        setError(t("shop.payUnavailable"));
      } else if (res.error === "PRODUCT_UNAVAILABLE" || res.error === "OPTION_REQUIRED" || res.error === "EMPTY_CART") {
        setError(t("shop.cartInvalid"));
      } else {
        setError(t("shop.checkoutFailed"));
      }
    });
  }

  // Preview only — checkout recomputes shipping server-side from the session's tier.
  const freeFrom = member ? member.freeShippingFromCents : SHIPPING.freeThresholdCents;
  const shippingCents = cart.items.length && cart.subtotalCents < freeFrom ? SHIPPING.flatCents : 0;
  const totalCents = cart.subtotalCents + shippingCents;
  const remaining = freeFrom - cart.subtotalCents;
  const tierName = member ? t(`tier.${member.tier}`) : "";
  const earn = member ? pointsFor(cart.subtotalCents, getTier(member.tier)) : 0;

  return (
    <div className="mx-auto max-w-[680px]">
      <span className="eyebrow">{t("shop.eyebrow")}</span>
      <h1 className="mt-3 text-[clamp(2rem,1.6rem+2vw,3rem)]">{t("shop.cartTitle")}</h1>

      {!cart.hydrated ? null : cart.items.length === 0 ? (
        <div className="mt-6">
          <p className="text-ink-soft">{t("shop.cartEmpty")}</p>
          <Link href="/shop" className="btn btn--ghost mt-5">
            {t("shop.continue")}
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-6 flex flex-col divide-y divide-[var(--line)]">
            {cart.items.map((item, i) => {
              const name = locale === "fr" ? item.nameFr : item.nameEn;
              const labels = Object.values(locale === "fr" ? item.optionLabelsFr : item.optionLabelsEn);
              return (
                <li key={`${item.slug}-${i}`} className="flex items-start gap-4 py-4">
                  <Link href={`/shop/${item.slug}`} className="relative h-20 w-16 flex-none overflow-hidden rounded-xl bg-cream-2">
                    <ProductArt images={item.image ? [item.image] : []} name={name} tags={item.tags} sizes="64px" />
                  </Link>
                  <div className="flex-1">
                    <Link href={`/shop/${item.slug}`} className="font-display text-[1.08rem] font-medium hover:text-terra">
                      {name}
                    </Link>
                    {labels.length > 0 && <p className="text-[0.85rem] text-ink-faint">{labels.join(" · ")}</p>}
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={item.qty}
                        onChange={(e) => cart.setQty(i, Number(e.target.value) || 1)}
                        aria-label={t("shop.qty")}
                        className="field w-[64px] px-2 py-1 text-center text-[0.85rem]"
                      />
                      <button type="button" onClick={() => cart.remove(i)} className="text-[0.8rem] text-terra underline underline-offset-2">
                        {t("shop.remove")}
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold tabular-nums text-ink">{formatMoneyFromCents(item.priceCents * item.qty, locale)}</p>
                </li>
              );
            })}
          </ul>

          <dl className="mt-4 flex flex-col gap-1.5 border-t border-[var(--line)] pt-4 text-[0.95rem]">
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t("shop.subtotal")}</dt>
              <dd className="tabular-nums">{formatMoneyFromCents(cart.subtotalCents, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t("shop.shipping")}</dt>
              <dd className="tabular-nums">
                {shippingCents === 0 ? t("shop.shippingFree") : formatMoneyFromCents(shippingCents, locale)}
              </dd>
            </div>
            <div className="mt-1 flex justify-between border-t border-[var(--line)] pt-3">
              <dt className="font-ui text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">{t("shop.total")}</dt>
              <dd className="font-display text-2xl font-semibold tabular-nums text-ink">{formatMoneyFromCents(totalCents, locale)}</dd>
            </div>
          </dl>

          <div className="mt-3 flex flex-col gap-1 rounded-2xl bg-warm-white px-4 py-3 text-[0.85rem] text-sage">
            {member && member.tier !== "glow" && (
              <p className="font-semibold text-ink">
                {freeFrom === 0
                  ? t("shop.memberPerkAll", { tier: tierName })
                  : t("shop.memberPerk", { tier: tierName, amount: formatWholeDollars(freeFrom, locale) })}
              </p>
            )}
            <p>
              {remaining > 0
                ? t("shop.freeShipAway", { amount: formatMoneyFromCents(remaining, locale) })
                : t("shop.freeShipUnlocked")}
            </p>
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[0.82rem] text-ink-soft">
            {member ? (
              t("shop.earnPoints", { points: earn })
            ) : (
              <>
                {t("shop.joinNudge")}
                <Link href="/account/register?from=/cart" className="font-semibold text-terra underline underline-offset-2">
                  {t("shop.joinFree")}
                </Link>
              </>
            )}
          </p>
          <p className="mt-2 text-[0.8rem] text-ink-faint">{t("shop.taxNote")}</p>
          {error && (
            <p className="mt-3 rounded-2xl bg-terra/10 px-4 py-3 text-sm text-terra" role="alert">
              {error}
            </p>
          )}

          {!subscribed && (
            <label className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--line)] px-4 py-3 text-[0.8rem] leading-relaxed text-ink-soft">
              <input type="checkbox" className="mt-0.5 h-4 w-4 flex-none accent-[var(--color-terra)]" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
              <span>{t("consent.newsletter", { email: BRAND.email })}</span>
            </label>
          )}

          <button type="button" onClick={pay} disabled={pending} className="btn btn--block mt-5">
            <Icon name="arrow" />
            {pending ? "…" : t("shop.checkout")}
          </button>
          <p className="mt-2 text-center text-[0.78rem] text-ink-faint">{t("shop.checkoutNote")}</p>
          <Link href="/shop" className="mt-4 block text-center text-sm text-ink-soft hover:text-terra">
            {t("shop.continue")}
          </Link>
        </>
      )}
    </div>
  );
}

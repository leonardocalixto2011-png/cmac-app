"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { fmtDate } from "@/lib/fmt";
import { cn, formatMoneyFromCents } from "@/lib/utils";
import { AccountNav } from "./ui";
import type { DashOrder } from "./AccountDashboard";

const STATUS_TONE: Record<string, string> = {
  PAID: "bg-terra/15 text-terra",
  FULFILLED: "bg-sage/15 text-sage",
  CANCELLED: "bg-cream-2 text-ink-faint",
  REFUNDED: "bg-cream-2 text-ink-faint",
  PENDING: "bg-cream-2 text-ink-faint",
};

export function StatusChip({ status }: { status: string }) {
  const { t } = useLocale();
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[0.74rem] font-semibold", STATUS_TONE[status])}>
      {t(`acc.status.${status}`)}
    </span>
  );
}

export function OrdersList({ orders }: { orders: DashOrder[] }) {
  const { t, locale } = useLocale();
  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6">
      <header className="flex flex-col gap-4">
        <span className="eyebrow">{t("acc.eyebrow")}</span>
        <h1 className="text-[clamp(2rem,1.5rem+2.4vw,3rem)]">{t("acc.ordersPageTitle")}</h1>
        <AccountNav active="orders" />
      </header>
      {orders.length === 0 ? (
        <div className="rounded-[var(--radius-card)] bg-warm-white p-8">
          <p className="text-ink-soft">{t("acc.ordersEmpty")}</p>
          <Link href="/shop" className="btn btn--sm mt-4">
            <Icon name="arrow" />
            {t("acc.shopNow")}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-[var(--radius-card)] bg-warm-white">
          {orders.map((o) => (
            <li key={o.reference}>
              <Link href={`/account/orders/${o.reference}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-cream">
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{t("acc.order", { ref: o.reference.slice(-8).toUpperCase() })}</span>
                  <span className="block text-[0.82rem] text-ink-faint">{t("acc.placed", { date: fmtDate(new Date(o.createdAt), locale) })}</span>
                </span>
                <StatusChip status={o.status} />
                <span className="w-[92px] text-right tabular-nums">{formatMoneyFromCents(o.totalCents, locale)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export type OrderDetailView = {
  reference: string;
  status: string;
  createdAt: string;
  items: { slug: string; nameEn: string; nameFr: string; qty: number; priceCents: number; optionsEn: string[]; optionsFr: string[] }[];
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shipTo: string;
  pointsEarned: number | null;
};

export function OrderDetail({ order }: { order: OrderDetailView }) {
  const { t, locale } = useLocale();
  const money = (c: number) => formatMoneyFromCents(c, locale);
  const fr = locale === "fr";
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6">
      <Link href="/account/orders" className="text-[0.88rem] text-ink-soft hover:text-terra">
        {t("acc.backToOrders")}
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">{t("acc.placed", { date: fmtDate(new Date(order.createdAt), locale) })}</span>
          <h1 className="mt-2 text-[clamp(1.9rem,1.4rem+2vw,2.8rem)]">{t("acc.order", { ref: order.reference.slice(-8).toUpperCase() })}</h1>
        </div>
        <StatusChip status={order.status} />
      </header>

      {order.trackingNumber && (
        <section className="rounded-[var(--radius-card)] bg-ink p-6 text-cream">
          <p className="font-ui text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-terra-2">{t("acc.trackingNumber")}</p>
          <p className="mt-2 font-mono text-[1.1rem]">{order.trackingNumber}</p>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn--terra btn--sm mt-4">
              <Icon name="arrow" />
              {t("acc.track")}
            </a>
          )}
        </section>
      )}

      <section className="rounded-[var(--radius-card)] bg-warm-white p-[clamp(1.25rem,4vw,2rem)]">
        <h2 className="text-[1.2rem]">{t("acc.items")}</h2>
        <ul className="mt-3 divide-y divide-[var(--line)]">
          {order.items.map((i, idx) => {
            const opts = fr ? i.optionsFr : i.optionsEn;
            return (
              <li key={`${i.slug}-${idx}`} className="flex items-start justify-between gap-4 py-3">
                <span>
                  <Link href={`/shop/${i.slug}`} className="font-medium hover:text-terra">
                    {i.qty} × {fr ? i.nameFr : i.nameEn}
                  </Link>
                  {opts.length > 0 && <span className="block text-[0.82rem] text-ink-faint">{opts.join(" · ")}</span>}
                </span>
                <span className="tabular-nums">{money(i.priceCents * i.qty)}</span>
              </li>
            );
          })}
        </ul>
        <dl className="mt-3 flex flex-col gap-1.5 border-t border-[var(--line)] pt-4 text-[0.95rem]">
          <div className="flex justify-between">
            <dt className="text-ink-soft">{t("shop.subtotal")}</dt>
            <dd className="tabular-nums">{money(order.subtotalCents)}</dd>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t("acc.discount")}</dt>
              <dd className="tabular-nums text-sage">−{money(order.discountCents)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-soft">{t("shop.shipping")}</dt>
            <dd className="tabular-nums">{order.shippingCents === 0 ? t("shop.shippingFree") : money(order.shippingCents)}</dd>
          </div>
          <div className="mt-1 flex justify-between border-t border-[var(--line)] pt-3">
            <dt className="font-ui text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">{t("shop.total")}</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums">{money(order.totalCents)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-[0.78rem] text-ink-faint">{t("shop.taxNote")}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {order.shipTo && (
          <section className="rounded-[var(--radius-card)] bg-warm-white p-5">
            <p className="font-ui text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-terra">{t("acc.shipTo")}</p>
            <p className="mt-2 text-ink-soft">{order.shipTo}</p>
          </section>
        )}
        {order.pointsEarned != null && (
          <section className="rounded-[var(--radius-card)] bg-warm-white p-5">
            <p className="font-ui text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-terra">{t("nav.glowClub")}</p>
            <p className="mt-2 text-ink-soft">{t("acc.pointsEarned", { points: order.pointsEarned })}</p>
          </section>
        )}
      </div>
    </div>
  );
}

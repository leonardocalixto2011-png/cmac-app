"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { fmtDate } from "@/lib/fmt";
import { cn, formatMoneyFromCents, formatWholeDollars } from "@/lib/utils";
import {
  POINTS_PER_REWARD,
  REWARD_VALUE_CENTS,
  maxRedeemableUnits,
  tierProgress,
} from "@/lib/loyalty-rules";
import { customerSignOut, redeemReward } from "@/app/account/actions";
import { AccountNav, FormMessage, ProgressBar, TierBadge } from "./ui";
import { TierPerks } from "@/components/glow/TierPerks";

export type DashOrder = { reference: string; status: string; totalCents: number; createdAt: string; count: number };
export type DashCode = {
  code: string;
  kind: "POINTS" | "BIRTHDAY";
  amountOffCents: number | null;
  percentOff: number | null;
  expiresAt: string | null;
  redeemedAt: string | null;
  expired: boolean;
};
export type DashEntry = { id: string; points: number; reason: string; createdAt: string };

export function AccountDashboard({
  name,
  points,
  lifetimeSpendCents,
  redeemEnabled,
  referral,
  orders,
  codes,
  entries,
}: {
  name: string | null;
  points: number;
  lifetimeSpendCents: number;
  redeemEnabled: boolean;
  referral: { code: string; url: string } | null;
  orders: DashOrder[];
  codes: DashCode[];
  entries: DashEntry[];
}) {
  const { t, locale } = useLocale();
  const progress = tierProgress(lifetimeSpendCents);
  const money = (c: number) => formatMoneyFromCents(c, locale);
  const firstName = name?.split(" ")[0];

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-8">
      <header className="flex flex-col gap-4">
        <span className="eyebrow">{t("acc.eyebrow")}</span>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[clamp(2rem,1.5rem+2.4vw,3.2rem)]">{firstName ? t("acc.hello", { name: firstName }) : t("acc.helloNoName")}</h1>
          <form action={customerSignOut}>
            <button type="submit" className="btn btn--ghost btn--sm">
              {t("acc.signOut")}
            </button>
          </form>
        </div>
        <AccountNav active="home" />
      </header>

      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        {/* Tier + progress */}
        <section className="relative overflow-hidden rounded-[var(--radius-card)] bg-ink p-[clamp(1.4rem,4vw,2.2rem)] text-cream grain" data-reveal>
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(228,164,142,0.45),transparent_70%)]" />
          <p className="font-ui text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-terra-2">{t("acc.tier")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="font-display text-[clamp(2.2rem,1.8rem+2vw,3rem)] leading-none">{t(`tier.${progress.tier.id}`)}</p>
            <TierBadge tier={progress.tier.id} className="bg-white/10 text-cream" />
          </div>
          <div className="mt-6">
            {progress.next ? (
              <>
                <ProgressBar ratio={progress.ratio} label={t("acc.toNext", { amount: money(progress.remainingCents), tier: t(`tier.${progress.next.id}`) })} />
                <p className="mt-2 text-[0.88rem] text-sage-light">
                  {t("acc.toNext", { amount: money(progress.remainingCents), tier: t(`tier.${progress.next.id}`) })}
                </p>
              </>
            ) : (
              <p className="text-[0.9rem] text-sage-light">{t("acc.topTier")}</p>
            )}
            <p className="mt-1 text-[0.78rem] text-ink-faint">{t("acc.lifetime", { amount: money(lifetimeSpendCents) })}</p>
          </div>
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="mb-3 font-ui text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-terra-2">{t("acc.perksTitle")}</p>
            <TierPerks tier={progress.tier.id} onDark />
          </div>
        </section>

        {/* Points + redeem */}
        <RedeemCard points={points} enabled={redeemEnabled} />
      </div>

      {referral && <ReferralCard code={referral.code} url={referral.url} />}

      <section className="rounded-[var(--radius-card)] bg-warm-white p-[clamp(1.25rem,4vw,2rem)]" data-reveal>
        <h2 className="text-[1.35rem]">{t("acc.codesTitle")}</h2>
        {codes.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">{t("acc.codesEmpty")}</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {codes.map((c) => (
              <RewardCodeCard key={c.code} c={c} />
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[var(--radius-card)] bg-warm-white p-[clamp(1.25rem,4vw,2rem)]" data-reveal>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.35rem]">{t("acc.ordersTitle")}</h2>
            <Link href="/account/orders" className="text-[0.85rem] text-terra underline underline-offset-4">
              {t("acc.ordersAll")}
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="mt-3">
              <p className="text-sm text-ink-faint">{t("acc.ordersEmpty")}</p>
              <Link href="/shop" className="btn btn--sm mt-4">
                <Icon name="arrow" />
                {t("acc.shopNow")}
              </Link>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--line)]">
              {orders.map((o) => (
                <li key={o.reference}>
                  <Link href={`/account/orders/${o.reference}`} className="flex items-center justify-between gap-3 py-3 hover:text-terra">
                    <span>
                      <span className="block font-medium">{t("acc.order", { ref: o.reference.slice(-8).toUpperCase() })}</span>
                      <span className="block text-[0.8rem] text-ink-faint">
                        {fmtDate(new Date(o.createdAt), locale)} · {t(`acc.status.${o.status}`)}
                      </span>
                    </span>
                    <span className="tabular-nums">{money(o.totalCents)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[var(--radius-card)] bg-warm-white p-[clamp(1.25rem,4vw,2rem)]" data-reveal>
          <h2 className="text-[1.35rem]">{t("acc.activity")}</h2>
          {entries.length === 0 ? (
            <p className="mt-3 text-sm text-ink-faint">—</p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--line)] text-[0.9rem]">
              {entries.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span>
                    {t(`acc.reason.${e.reason}`)}
                    <span className="block text-[0.78rem] text-ink-faint">{fmtDate(new Date(e.createdAt), locale)}</span>
                  </span>
                  <span className={cn("font-semibold tabular-nums", e.points >= 0 ? "text-sage" : "text-terra")}>
                    {e.points > 0 ? "+" : ""}
                    {e.points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function RedeemCard({ points, enabled }: { points: number; enabled: boolean }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const max = maxRedeemableUnits(points);
  const [units, setUnits] = useState(1);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const rewards = Math.floor(points / POINTS_PER_REWARD);
  const need = POINTS_PER_REWARD - (points % POINTS_PER_REWARD);
  const chosen = Math.min(units, Math.max(1, max));

  function redeem() {
    setMsg(null);
    start(async () => {
      const res = await redeemReward(chosen);
      if (res.ok) {
        setMsg({ tone: "ok", text: t("acc.redeemDone", { code: res.code }) });
        setUnits(1);
        router.refresh();
      } else if (res.error === "INSUFFICIENT_POINTS") setMsg({ tone: "error", text: t("acc.redeemInsufficient") });
      else if (res.error === "limited") setMsg({ tone: "error", text: t("acc.err.limited") });
      else setMsg({ tone: "error", text: t("acc.redeemUnavailable") });
    });
  }

  return (
    <section className="flex flex-col rounded-[var(--radius-card)] bg-warm-white p-[clamp(1.4rem,4vw,2.2rem)]" data-reveal>
      <p className="font-ui text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-terra">{t("acc.points")}</p>
      <p className="mt-2 font-display text-[clamp(2.6rem,2rem+3vw,3.6rem)] leading-none tabular-nums">
        {points.toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")}
      </p>
      <p className="mt-2 text-[0.88rem] text-ink-soft">
        {rewards > 0 ? t("acc.pointsWorth", { rewards }) : t("acc.redeemNeed", { points: points < 0 ? POINTS_PER_REWARD - points : need })}
      </p>

      <div className="mt-6 border-t border-[var(--line)] pt-5">
        <h2 className="text-[1.2rem]">{t("acc.redeemTitle")}</h2>
        <p className="mt-1 text-[0.85rem] text-ink-faint">{t("acc.redeemLead")}</p>
        {!enabled ? (
          <p className="mt-4 text-[0.85rem] text-ink-soft">{t("acc.redeemUnavailable")}</p>
        ) : max === 0 ? null : (
          <div className="mt-4 flex flex-col gap-3">
            <label className="sr-only-text" htmlFor="redeem-units">
              {t("acc.redeemTitle")}
            </label>
            <select id="redeem-units" className="field" value={chosen} onChange={(e) => setUnits(Number(e.target.value))} disabled={pending}>
              {Array.from({ length: max }, (_, i) => i + 1).map((u) => (
                <option key={u} value={u}>
                  {t("acc.redeemFor", { points: u * POINTS_PER_REWARD, amount: formatWholeDollars(u * REWARD_VALUE_CENTS, locale) })}
                </option>
              ))}
            </select>
            <button type="button" onClick={redeem} disabled={pending} className="btn btn--terra btn--block">
              <Icon name="spark" />
              {pending ? "…" : t("acc.redeemBtn")}
            </button>
          </div>
        )}
        {msg && (
          <div className="mt-3">
            <FormMessage tone={msg.tone}>{msg.text}</FormMessage>
          </div>
        )}
      </div>
    </section>
  );
}

function RewardCodeCard({ c }: { c: DashCode }) {
  const { t, locale } = useLocale();
  const [copied, setCopied] = useState(false);
  const expired = c.expired;
  const used = Boolean(c.redeemedAt);
  const inactive = used || expired;
  const value = c.amountOffCents
    ? t("acc.codeOff", { amount: formatWholeDollars(c.amountOffCents, locale) })
    : t("acc.codePct", { pct: c.percentOff ?? 0 });

  return (
    <li className={cn("flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-cream px-4 py-3", inactive && "opacity-55")}>
      <div className="min-w-0">
        <p className="font-mono text-[1rem] tracking-[0.08em]">{c.code}</p>
        <p className="text-[0.8rem] text-ink-soft">
          {value}
          {c.kind === "BIRTHDAY" ? ` · ${t("acc.codeBirthday")}` : ""}
          {used
            ? ` · ${t("acc.codeUsed")}`
            : expired
              ? ` · ${t("acc.codeExpired")}`
              : c.expiresAt
                ? ` · ${t("acc.codeExpires", { date: fmtDate(new Date(c.expiresAt), locale) })}`
                : ""}
        </p>
      </div>
      {!inactive && (
        <button
          type="button"
          className="pill flex-none"
          onClick={() => {
            navigator.clipboard?.writeText(c.code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          {copied ? t("acc.copied") : t("acc.copy")}
        </button>
      )}
    </li>
  );
}

/** Invite a friend: personal link, copy button, what each side gets. */
function ReferralCard({ code, url }: { code: string; url: string }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked: the link is selectable below */
    }
  }
  return (
    <section className="rounded-[var(--radius-card)] bg-warm-white p-[clamp(1.25rem,4vw,2rem)]" data-reveal>
      <p className="font-ui text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-terra">{t("acc.refEyebrow")}</p>
      <h2 className="mt-2 text-[1.35rem]">{t("acc.refTitle")}</h2>
      <p className="mt-2 text-[0.9rem] text-ink-soft">{t("acc.refLead")}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <code className="select-all rounded-full bg-cream px-4 py-2 text-[0.9rem] text-ink">{url}</code>
        <button type="button" onClick={copy} className="btn btn-sm">
          {copied ? t("acc.refCopied") : t("acc.refCopy")}
        </button>
      </div>
      <p className="mt-3 text-[0.8rem] text-ink-faint">{t("acc.refFine", { code })}</p>
    </section>
  );
}

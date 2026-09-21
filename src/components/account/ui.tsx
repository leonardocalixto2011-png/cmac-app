"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import type { TierId } from "@/lib/loyalty-rules";

/** Maps server error codes to acc.err.* messages. */
export function useAccountError() {
  const { t } = useLocale();
  return (code: string | null | undefined): string | null => {
    if (!code) return null;
    const known = ["credentials", "name", "email", "password", "taken", "limited", "birthday", "currentPassword"];
    return t(known.includes(code) ? `acc.err.${code}` : "acc.err.generic");
  };
}

export function Field({
  label,
  hint,
  className,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const id = input.id ?? input.name;
  return (
    <label className={cn("flex flex-col gap-1.5", className)} htmlFor={id}>
      <span className="font-ui text-[0.8rem] font-semibold text-ink-soft">{label}</span>
      <input id={id} className="field" {...input} />
      {hint && <span className="text-[0.78rem] text-ink-faint">{hint}</span>}
    </label>
  );
}

export function FormMessage({ tone = "error", children }: { tone?: "error" | "ok"; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-2xl px-4 py-3 text-sm",
        tone === "error" ? "bg-terra/10 text-terra" : "bg-sage/10 text-sage",
      )}
    >
      {children}
    </p>
  );
}

/** Centered card used by login / register / reset. */
export function AuthShell({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  const { t } = useLocale();
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <span className="eyebrow">{t("nav.glowClub")}</span>
      <h1 className="mt-3 text-[clamp(1.9rem,1.5rem+2vw,2.7rem)]">{title}</h1>
      {lead && <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-soft">{lead}</p>}
      <div className="mt-6 rounded-[var(--radius-card)] bg-warm-white p-[clamp(1.25rem,4vw,2rem)] shadow-[0_20px_50px_-40px_rgba(31,36,34,0.45)]">
        {children}
      </div>
    </div>
  );
}

export function BirthdayFields({
  month,
  day,
  onMonth,
  onDay,
}: {
  month: string;
  day: string;
  onMonth: (v: string) => void;
  onDay: (v: string) => void;
}) {
  const { t, locale } = useLocale();
  const months = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2024, i, 1))),
  );
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 font-ui text-[0.8rem] font-semibold text-ink-soft">{t("acc.birthday")}</legend>
      <div className="grid grid-cols-[1.4fr_1fr] gap-2">
        <label className="sr-only-text" htmlFor="bday-month">
          {t("acc.month")}
        </label>
        <select id="bday-month" className="field" value={month} onChange={(e) => onMonth(e.target.value)}>
          <option value="">{t("acc.month")}</option>
          {months.map((m, i) => (
            <option key={m} value={String(i + 1)}>
              {m}
            </option>
          ))}
        </select>
        <label className="sr-only-text" htmlFor="bday-day">
          {t("acc.day")}
        </label>
        <select id="bday-day" className="field" value={day} onChange={(e) => onDay(e.target.value)}>
          <option value="">{t("acc.day")}</option>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i} value={String(i + 1)}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
      <span className="text-[0.78rem] text-ink-faint">{t("acc.birthdayHint")}</span>
    </fieldset>
  );
}

const TIER_STYLE: Record<TierId, string> = {
  glow: "bg-terra-2/30 text-ink",
  radiance: "bg-gold/35 text-ink",
  icon: "bg-ink text-cream",
};

export function TierBadge({ tier, className }: { tier: TierId; className?: string }) {
  const { t } = useLocale();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-ui text-[0.72rem] font-semibold uppercase tracking-[0.16em]",
        TIER_STYLE[tier],
        className,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {t(`tier.${tier}`)}
    </span>
  );
}

export function ProgressBar({ ratio, label }: { ratio: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className="h-2.5 w-full overflow-hidden rounded-full bg-cream-2"
    >
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-terra-2),var(--color-terra))] transition-[width] duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function AccountNav({ active }: { active: "home" | "orders" | "profile" }) {
  const { t } = useLocale();
  const items = [
    { key: "home", href: "/account", label: t("acc.eyebrow") },
    { key: "orders", href: "/account/orders", label: t("acc.ordersPageTitle") },
    { key: "profile", href: "/account/profile", label: t("acc.profile") },
  ] as const;
  return (
    <nav aria-label={t("acc.eyebrow")} className="flex flex-wrap gap-2">
      {items.map((i) => (
        <Link key={i.key} href={i.href} className={cn("pill", active === i.key && "is-active")} aria-current={active === i.key ? "page" : undefined}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

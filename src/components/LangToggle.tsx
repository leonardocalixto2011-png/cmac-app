"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export function LangToggle({ className, onDark }: { className?: string; onDark?: boolean }) {
  const { locale, toggle, t } = useLocale();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("lang.switch")}
      className={cn(
        "inline-flex h-[42px] min-w-[42px] items-center justify-center rounded-full border px-3 font-ui text-[0.76rem] font-bold tracking-[0.12em] transition-colors",
        onDark
          ? "border-white/20 text-cream hover:border-white/50"
          : "border-[var(--line)] text-ink hover:border-ink",
        className,
      )}
    >
      {locale === "en" ? "FR" : "EN"}
    </button>
  );
}

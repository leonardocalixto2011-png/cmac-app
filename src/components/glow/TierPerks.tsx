"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { cn, formatWholeDollars } from "@/lib/utils";
import { getTier, type TierId } from "@/lib/loyalty-rules";

/** Perk list for one tier (glow-club page table + account dashboard). */
export function tierPerkKeys(tier: TierId, t: (k: string, v?: Record<string, string | number>) => string, locale: "en" | "fr"): string[] {
  const tt = getTier(tier);
  const rate = tt.quarterPointsPerDollar / 4;
  const rateLabel = locale === "fr" ? String(rate).replace(".", ",") : String(rate);
  return [
    t(rate === 1 ? "glow.perk.points" : "glow.perk.pointsPlural", { rate: rateLabel }),
    tt.freeShippingFromCents === 0
      ? t("glow.perk.shipAll")
      : t("glow.perk.shipFrom", { amount: formatWholeDollars(tt.freeShippingFromCents, locale) }),
    t("glow.perk.birthday"),
    t("glow.perk.early"),
    t("glow.perk.history"),
  ];
}

export function TierPerks({ tier, onDark }: { tier: TierId; onDark?: boolean }) {
  const { t, locale } = useLocale();
  return (
    <ul className="flex flex-col gap-2">
      {tierPerkKeys(tier, t, locale).map((p) => (
        <li key={p} className={cn("flex items-start gap-2.5 text-[0.92rem]", onDark ? "text-sage-light" : "text-ink-soft")}>
          <Icon name="check" width={16} height={16} className={cn("mt-[3px] flex-none", onDark ? "text-terra-2" : "text-terra")} />
          {p}
        </li>
      ))}
    </ul>
  );
}

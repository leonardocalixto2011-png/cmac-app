"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";
import { activePromo, promoEndLabel, promoText } from "@/lib/promos";

/**
 * Seasonal bar above the nav. Renders only while a campaign is running (dates
 * in src/lib/promos.ts), always shows the code and the real end date, and
 * disappears by itself. Hidden in the admin area.
 */
export function PromoBar() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const promo = activePromo();
  if (!promo || pathname?.startsWith("/admin")) return null;

  const t = promoText(promo, locale);
  return (
    <div className="bg-ink text-cream">
      <div className="wrap flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-[0.82rem] leading-snug">
        <span className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-terra-2">{t.label}</span>
        <span>{t.detail}</span>
        <span className="text-sage-light">({promoEndLabel(promo, locale)})</span>
        <Link href={promo.href} className="font-semibold text-cream underline underline-offset-4 hover:text-terra-2">
          {t.cta}
        </Link>
      </div>
    </div>
  );
}

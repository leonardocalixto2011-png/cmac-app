"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";

/** Compact Glow Club band on the homepage, just above the newsletter. */
export function GlowBand() {
  const { t } = useLocale();
  return (
    <section className="cmac-glowband" aria-labelledby="glowband-title">
      <div className="wrap">
        <div className="cmac-glowband__card" data-reveal>
          <div className="relative z-[1]">
            <p className="eyebrow">{t("glowband.eyebrow")}</p>
            <h2 id="glowband-title" className="mt-3 text-[clamp(1.7rem,1.3rem+1.8vw,2.5rem)]">
              {t("glowband.title")}
            </h2>
            <p className="mt-3 max-w-[58ch] leading-relaxed text-ink-soft">{t("glowband.lead")}</p>
          </div>
          <div className="relative z-[1] flex flex-wrap gap-3 md:flex-col md:items-stretch">
            <Link href="/account/register" className="btn">
              <Icon name="gift" />
              {t("glowband.cta")}
            </Link>
            <Link href="/glow-club" className="btn btn--ghost">
              {t("glowband.more")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

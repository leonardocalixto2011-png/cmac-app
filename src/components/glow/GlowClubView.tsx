"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { TIERS } from "@/lib/loyalty-rules";
import { cn, formatWholeDollars } from "@/lib/utils";
import { TierPerks } from "./TierPerks";

export const GLOW_FAQ_COUNT = 7;

const D = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export function GlowClubView({ signedIn }: { signedIn: boolean }) {
  const { t, locale } = useLocale();

  const cta = signedIn ? (
    <Link href="/account" className="btn btn--terra">
      <Icon name="arrow" />
      {t("glow.goAccount")}
    </Link>
  ) : (
    <>
      <Link href="/account/register" className="btn btn--terra">
        <Icon name="arrow" />
        {t("glow.join")}
      </Link>
      <Link href="/account/login" className="btn btn--ghost btn--cream-ghost">
        {t("glow.signIn")}
      </Link>
    </>
  );

  return (
    <>
      {/* Hero */}
      <section className="cmac-glowhero grain" data-glow>
        <div className="wrap relative">
          <p className="eyebrow" data-reveal>
            {t("glow.eyebrow")}
          </p>
          <h1 className="mt-4 max-w-[14ch] text-[clamp(2.6rem,1.8rem+4.4vw,5rem)]" data-reveal style={D(80)}>
            {t("glow.title")}
          </h1>
          <p className="mt-5 max-w-[52ch] text-[clamp(1.02rem,1.4vw,1.18rem)] leading-relaxed text-[#cfd3cf]" data-reveal style={D(160)}>
            {t("glow.lead")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3" data-reveal style={D(240)}>
            {cta}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-pad bg-cream">
        <div className="wrap">
          <h2 className="text-[clamp(2rem,4vw,3rem)]" data-reveal>
            {t("glow.howTitle")}
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n, i) => (
              <li key={n} className="relative overflow-hidden rounded-[var(--radius-card)] bg-warm-white p-7" data-reveal style={D(i * 90)}>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-ink font-ui text-[0.85rem] font-semibold text-cream">{n}</span>
                <h3 className="mt-5 text-[1.45rem]">{t(`glow.step${n}.t`)}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{t(`glow.step${n}.d`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tiers */}
      <section className="section-pad bg-warm-white" id="tiers">
        <div className="wrap">
          <div className="max-w-[640px]">
            <h2 className="text-[clamp(2rem,4vw,3rem)]" data-reveal>
              {t("glow.tiersTitle")}
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft" data-reveal style={D(80)}>
              {t("glow.tiersLead")}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TIERS.map((tier, i) => (
              <article
                key={tier.id}
                className={cn(
                  "flex flex-col rounded-[var(--radius-card)] p-7",
                  tier.id === "icon" ? "bg-ink text-cream" : tier.id === "radiance" ? "bg-cream-2" : "bg-cream",
                )}
                data-reveal
                style={D(i * 90)}
              >
                <p className={cn("font-ui text-[0.72rem] font-semibold uppercase tracking-[0.2em]", tier.id === "icon" ? "text-terra-2" : "text-terra")}>
                  {tier.minSpendCents === 0 ? t("glow.tierStart") : t("glow.tierFrom", { amount: formatWholeDollars(tier.minSpendCents, locale) })}
                </p>
                <h3 className="mt-2 font-display text-[2.2rem] leading-none">{t(`tier.${tier.id}`)}</h3>
                <div className={cn("my-5 h-px", tier.id === "icon" ? "bg-white/10" : "bg-[var(--line)]")} />
                <TierPerks tier={tier.id} onDark={tier.id === "icon"} />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="cmac-faq">
        <div className="wrap cmac-faq__grid">
          <div className="cmac-faq__intro">
            <p className="eyebrow" data-reveal>
              {t("nav.glowClub")}
            </p>
            <h2 data-reveal style={D(80)}>
              {t("glow.faqTitle")}
            </h2>
            <p data-reveal style={D(160)}>
              <Link href="/terms#glow-club" className="text-terra underline underline-offset-4">
                {t("glow.termsLink")}
              </Link>
            </p>
          </div>
          <div>
            {Array.from({ length: GLOW_FAQ_COUNT }, (_, i) => i + 1).map((n) => (
              <details key={n} className="faq-item">
                <summary>
                  {t(`glow.faq.${n}.q`)}
                  <i aria-hidden />
                </summary>
                <p className="faq-item__a">{t(`glow.faq.${n}.a`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cmac-news grain" data-glow>
        <div className="wrap cmac-news__inner">
          <h2 data-reveal>{t("glow.ctaTitle")}</h2>
          <p className="cmac-news__lead" data-reveal style={D(80)}>
            {t("glow.ctaLead")}
          </p>
          <div className="flex flex-wrap justify-center gap-3" data-reveal style={D(160)}>
            {cta}
          </div>
        </div>
      </section>
    </>
  );
}

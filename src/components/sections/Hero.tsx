"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { SHIPPING } from "@/lib/brand";
import { formatWholeDollars } from "@/lib/utils";

const D = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export function Hero() {
  const { t, locale } = useLocale();
  const words = t("hero.words").split(",").map((w) => w.trim());
  const free = formatWholeDollars(SHIPPING.freeThresholdCents, locale);

  return (
    <section className="cmac-hero grain" data-glow id="top">
      <div className="cmac-hero__blob cmac-hero__blob--a" aria-hidden="true" />
      <div className="cmac-hero__blob cmac-hero__blob--b" aria-hidden="true" />
      <div className="wrap cmac-hero__grid">
        <div>
          <p className="eyebrow" data-reveal>
            {t("hero.eyebrow")}
          </p>
          <h1 className="cmac-hero__title" data-reveal style={D(80)}>
            {t("hero.title")}
            <br />
            <span
              className="cmac-hero__rotator"
              aria-hidden="true"
              style={{ "--words-dur": `${words.length * 2.4}s` } as React.CSSProperties}
            >
              {words.map((w, i) => (
                <span key={w} style={{ animationDelay: `${i * 2.4}s` }}>
                  {w}
                </span>
              ))}
            </span>
            <span className="sr-only-text">{words[0]}</span>
          </h1>
          <p className="cmac-hero__lead" data-reveal style={D(160)}>
            {t("hero.lead")}
          </p>
          <div className="cmac-hero__actions" data-reveal style={D(240)}>
            <Link className="btn" href="/collections/the-ritual">
              {t("hero.cta1")}
              <Icon name="arrow" />
            </Link>
            <Link className="btn btn--ghost" href="#routine">
              {t("hero.cta2")}
            </Link>
          </div>
          <ul className="cmac-hero__proof" data-reveal style={D(320)}>
            {[t("hero.proof1", { free }), t("hero.proof2"), t("hero.proof3")].map((p) => (
              <li key={p}>
                <Icon name="check" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="cmac-hero__visual" data-reveal="scale" style={D(200)}>
          <div className="cmac-hero__ring" aria-hidden="true" />
          {/* PLACEHOLDER hero visual — swap for a product photo (<Image>) when available. */}
          <div className="cmac-hero__img" role="img" aria-label={t("hero.visualAlt")}>
            <div className="absolute inset-0 bg-[linear-gradient(160deg,#fffdf9_0%,#ede6da_45%,#e4a48e_100%)]" />
            <div className="absolute left-1/2 top-1/2 h-[62%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-[40%_40%_46%_46%/48%_48%_52%_52%] bg-[linear-gradient(180deg,#fffdf9,#f5f1ea)] shadow-[inset_0_-18px_40px_-20px_rgba(201,123,99,0.45),0_30px_60px_-30px_rgba(31,36,34,0.35)]" />
            <div className="absolute left-1/2 top-[44%] h-[6%] w-[46%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,123,99,0.9),rgba(228,164,142,0.2)_70%,transparent)] blur-[2px]" />
            <div className="absolute left-1/2 top-[58%] h-[4%] w-[34%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(217,179,112,0.8),transparent_70%)] blur-[2px]" />
            <span className="absolute bottom-5 left-5 font-ui text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-ink/55">
              CMAC Beauty
            </span>
          </div>
          <div className="cmac-hero__badge">
            <span>{t("hero.badge")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

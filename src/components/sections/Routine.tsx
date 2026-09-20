"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";

const STEPS: { key: string; slug?: string }[] = [
  { key: "1", slug: "facial-ice-roller" },
  { key: "2", slug: "microcurrent-facial-lift-device" },
  { key: "3", slug: "led-red-light-mask" },
  { key: "4" },
];

export function Routine({ productNames }: { productNames: Record<string, { en: string; fr: string }> }) {
  const { t, locale } = useLocale();

  return (
    <section className="cmac-routine" id="routine">
      <div className="wrap cmac-routine__grid">
        <div className="cmac-routine__intro">
          <p className="eyebrow" data-reveal>
            {t("routine.eyebrow")}
          </p>
          <h2 data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
            {t("routine.title")}
          </h2>
          <p className="cmac-routine__lead" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
            {t("routine.lead")}
          </p>
          <Link className="btn btn--cream" href="/collections/the-ritual" data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
            {t("routine.cta")}
          </Link>
        </div>
        <ol className="cmac-routine__steps">
          <svg className="cmac-routine__line" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M1 0v100" stroke="currentColor" strokeWidth="2" strokeDasharray="100" strokeDashoffset="100" pathLength="100" />
          </svg>
          {STEPS.map((s, i) => {
            const name = s.slug ? productNames[s.slug] : undefined;
            return (
              <li key={s.key} className="cmac-routine__step" data-reveal="left" style={{ "--d": `${i * 140}ms` } as React.CSSProperties}>
                <span className="cmac-routine__num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>
                    {t(`routine.${s.key}.t`)} <small>{t(`routine.${s.key}.time`)}</small>
                  </h3>
                  <p>{t(`routine.${s.key}.d`)}</p>
                  {s.slug && name && (
                    <Link className="cmac-routine__link" href={`/shop/${s.slug}`}>
                      {locale === "fr" ? name.fr : name.en} →
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

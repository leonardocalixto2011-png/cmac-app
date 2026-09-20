"use client";

import { useLocale } from "@/i18n/LocaleProvider";

export function FounderNote() {
  const { t } = useLocale();
  const stamp = t("founder.stamp");

  return (
    <section className="cmac-founder" id="about">
      <div className="wrap cmac-founder__grid">
        <div className="cmac-founder__visual" data-reveal="left">
          {/* PLACEHOLDER visual — replace with a founder / studio photo when available. */}
          <div className="cmac-founder__img" role="img" aria-label={t("founder.eyebrow")}>
            <div className="absolute inset-x-[18%] top-[22%] aspect-square rounded-full bg-warm-white/70 blur-[1px]" />
            <div className="absolute inset-x-[30%] top-[30%] aspect-square rounded-full border border-dashed border-ink/25" />
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-display text-[1.2rem] italic text-ink/70">CMAC</span>
          </div>
          <div className="cmac-founder__stamp" aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <defs>
                <path id="cmac-circ" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
              </defs>
              <text fontSize="9.5" letterSpacing="2">
                <textPath href="#cmac-circ">
                  {stamp} · {stamp} ·{" "}
                </textPath>
              </text>
            </svg>
          </div>
        </div>
        <div>
          <p className="eyebrow" data-reveal>
            {t("founder.eyebrow")}
          </p>
          <h2 data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
            {t("founder.title")}
          </h2>
          <div className="cmac-founder__text" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
            <p>{t("founder.p1")}</p>
            <p>{t("founder.p2")}</p>
          </div>
          <p className="cmac-founder__sig" data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
            {t("founder.sig")}
          </p>
        </div>
      </div>
    </section>
  );
}

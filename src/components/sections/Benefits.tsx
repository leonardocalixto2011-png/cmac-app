"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { Icon, type IconName } from "@/components/Icon";

const CARDS: { icon: IconName; key: string; stat?: { n: number; suffix: string } }[] = [
  { icon: "light", key: "1", stat: { n: 10, suffix: " min" } },
  { icon: "bolt", key: "2", stat: { n: 3, suffix: "x" } },
  { icon: "snow", key: "3", stat: { n: 60, suffix: " s" } },
  { icon: "clock", key: "4" },
];

export function Benefits() {
  const { t } = useLocale();

  return (
    <section className="cmac-benefits" id="why">
      <div className="wrap">
        <div className="cmac-benefits__head">
          <p className="eyebrow" data-reveal>
            {t("benefits.eyebrow")}
          </p>
          <h2 data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
            {t("benefits.title")}
          </h2>
        </div>
        <div className="cmac-benefits__grid">
          {CARDS.map((c, i) => (
            <article key={c.key} className="cmac-benefits__card tilt" data-reveal style={{ "--d": `${i * 110}ms` } as React.CSSProperties}>
              <div className="cmac-benefits__icon">
                <Icon name={c.icon} />
              </div>
              <h3>{t(`benefits.${c.key}.t`)}</h3>
              <p>{t(`benefits.${c.key}.d`)}</p>
              {c.stat && (
                <div className="cmac-benefits__stat">
                  <span data-count={c.stat.n} data-suffix={c.stat.suffix}>
                    0{c.stat.suffix}
                  </span>
                  <small>{t(`benefits.${c.key}.stat`)}</small>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { SHIPPING } from "@/lib/brand";
import { formatWholeDollars } from "@/lib/utils";

export function Marquee() {
  const { t, locale } = useLocale();
  const free = formatWholeDollars(SHIPPING.freeThresholdCents, locale);
  const items = [t("marquee.1", { free }), t("marquee.2"), t("marquee.3"), t("marquee.4"), t("marquee.5")];

  return (
    <section className="cmac-marquee" aria-label={t("marquee.label")}>
      <div className="cmac-marquee__track">
        {[0, 1].map((g) => (
          <div key={g} className="cmac-marquee__group" aria-hidden={g === 1 || undefined}>
            {items.map((text, i) => (
              <span key={`${g}-${i}`} className="contents">
                <span className="cmac-marquee__item">{text}</span>
                <span className="cmac-marquee__dot" aria-hidden="true" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

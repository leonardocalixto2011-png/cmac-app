"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { SHIPPING } from "@/lib/brand";
import { formatWholeDollars } from "@/lib/utils";

/** Hero product photo: the LED mask cut out on the brand cream (same file as its product page). */
const HERO_PHOTO =
  "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013183/cmac/products/led-red-light-mask/final-0";

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
          <Link className="cmac-hero__img" href="/shop/led-red-light-mask">
            <Image
              src={HERO_PHOTO}
              alt={t("hero.visualAlt")}
              fill
              priority
              sizes="(min-width: 900px) 38vw, 80vw"
              className="object-cover"
            />
            <span className="cmac-hero__caption">
              {t("hero.visualLabel")}
              <Icon name="arrow" />
            </span>
          </Link>
          <div className="cmac-hero__badge">
            <span>{t("hero.badge")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

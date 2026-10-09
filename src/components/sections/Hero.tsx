"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { SHIPPING } from "@/lib/brand";
import { formatWholeDollars } from "@/lib/utils";
import { SilkCanvas } from "@/components/motion/SilkCanvas";
import { cloudinaryLoader } from "@/lib/cloudinary-loader";

/**
 * Opening scene of the evening. A satin surface moves slowly behind three
 * devices that take turns on stage, each lit by its own light: the mask by
 * its seven LED colours, the microcurrent device by a cool silver, the sonic
 * brush by a soft pink. The accent word of the headline changes with them.
 */
export type HeroSlide = {
  slug: string;
  name: string;
  price: string;
  image: string;
  /** Light behind the product: "led" cycles the mask's seven colours. */
  light: "led" | "silver" | "rose";
};

const SLIDE_MS = 6500;
const WORD_MS = 2600;
const D = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

function useTicker(count: number, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % count);
    }, ms);
    return () => window.clearInterval(id);
  }, [count, ms]);
  return [i, setI] as const;
}

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const { t, locale } = useLocale();
  const words = t("hero.words").split(",").map((w) => w.trim());
  const titleWords = t("hero.title").split(" ");
  const free = formatWholeDollars(SHIPPING.freeThresholdCents, locale);
  const [slide, setSlide] = useTicker(slides.length, SLIDE_MS);
  const [word] = useTicker(words.length, WORD_MS);
  const current = slides[slide];

  return (
    <section className="cmac-hero" id="top" data-sky="dusk">
      <SilkCanvas className="cmac-hero__silk" colors={["#efe4d9", "#e4cdbd", "#d9a996"]} />
      <div className="cmac-hero__veil" aria-hidden="true" />
      <div className="wrap cmac-hero__grid">
        <div className="cmac-hero__copy">
          <p className="eyebrow" data-reveal>
            {t("hero.eyebrow")}
          </p>
          <h1 className="cmac-hero__title" data-reveal style={D(80)}>
            {titleWords.map((w, i) => (
              <span key={i}>
                <span className="cmac-hero__w" style={{ "--i": i } as React.CSSProperties}>
                  {w}
                </span>
                {i < titleWords.length - 1 ? " " : ""}
              </span>
            ))}
            <br />
            <span className="cmac-hero__swap" aria-hidden="true">
              {words.map((w, i) => (
                <em key={w} className={i === word ? "is-on" : undefined}>
                  {w}
                </em>
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
            <Link className="cmac-hero__link" href="#routine">
              {t("hero.cta2")}
              <Icon name="arrow" />
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

        {/* No data-reveal here: its will-change/transform would isolate the photo from
            the satin behind it and bring the cream square back. The slides fade themselves. */}
        <div className="cmac-hero__visual">
          {/* The light lives inside the stage: the photo is multiplied onto it, and a
              transformed ancestor between them would isolate the blend. */}
          <div className="cmac-hero__stage">
            <div className={`cmac-hero__light cmac-hero__light--${current?.light ?? "led"}`} aria-hidden="true" />
            {slides.map((s, i) => (
              <Link
                key={s.slug}
                href={`/shop/${s.slug}`}
                className={`cmac-hero__slide${i === slide ? " is-on" : ""}`}
                aria-hidden={i === slide ? undefined : true}
                tabIndex={i === slide ? undefined : -1}
              >
                <Image
                  loader={cloudinaryLoader}
                  src={s.image}
                  alt={i === 0 ? t("hero.visualAlt") : s.name}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 990px) 42vw, 90vw"
                  className="cmac-hero__photo"
                />
              </Link>
            ))}
          </div>
          {current && (
            <Link className="cmac-hero__caption" href={`/shop/${current.slug}`} key={current.slug}>
              <span>{current.name}</span>
              <span className="cmac-hero__price">{current.price}</span>
              <Icon name="arrow" />
            </Link>
          )}
          {slides.length > 1 && (
            <div className="cmac-hero__dots" role="tablist" aria-label={t("hero.visualLabel")}>
              {slides.map((s, i) => (
                <button
                  key={s.slug}
                  type="button"
                  role="tab"
                  aria-selected={i === slide}
                  aria-label={s.name}
                  className={i === slide ? "is-on" : undefined}
                  onClick={() => setSlide(i)}
                  style={{ "--ms": `${SLIDE_MS}ms` } as React.CSSProperties}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

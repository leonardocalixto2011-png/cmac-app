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
import { useReducedMotion } from "@/lib/motion-fx";

/**
 * Opening scene of the evening. A satin surface moves slowly behind three
 * devices that take turns on stage, each with a light behind it: red for the
 * LED mask (which glows red on itself), silver for the microcurrent device,
 * rose for the sonic brush. The accent word of the headline follows.
 *
 * The rotation pauses while the pointer or focus is on the stage, can be
 * paused with a button (WCAG 2.2.2), and stops by itself after two rounds.
 */
export type HeroSlide = {
  slug: string;
  name: string;
  price: string;
  image: string;
  light: "led" | "silver" | "rose";
};

const SLIDE_MS = 6500;
const ROUNDS = 2;
const D = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const { t, locale } = useLocale();
  const words = t("hero.words").split(",").map((w) => w.trim());
  const titleWords = t("hero.title").split(" ");
  const free = formatWholeDollars(SHIPPING.freeThresholdCents, locale);
  const [slide, setSlide] = useState(0);
  const [steps, setSteps] = useState(0);
  const [hold, setHold] = useState(false); // pointer or focus on the stage
  const [paused, setPaused] = useState(false); // the visitor pressed pause
  const still = useReducedMotion();
  const done = steps >= slides.length * ROUNDS - 1;
  const running = slides.length > 1 && !hold && !paused && !still && !done;

  // One timeout per slide, restarted on every change, so a click on a dash
  // always gives that slide its full time.
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => {
      if (document.hidden) return;
      setSlide((n) => (n + 1) % slides.length);
      setSteps((n) => n + 1);
    }, SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [running, slide, slides.length]);

  const current = slides[slide];
  const word = words[slide % words.length] ?? words[0];

  return (
    <section className={`cmac-hero${running ? " is-running" : ""}`} id="top" data-sky="dusk">
      <SilkCanvas className="cmac-hero__silk" colors={["#efe4d9", "#e2c9b7", "#d6a28d"]} />
      <div className="cmac-hero__veil" aria-hidden="true" />
      <div className="wrap cmac-hero__grid">
        <div className="cmac-hero__copy">
          <p className="eyebrow" style={D(0)}>
            {t("hero.eyebrow")}
          </p>
          <h1 className="cmac-hero__title" style={D(80)}>
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
              {words.map((w) => (
                <em key={w} className={w === word ? "is-on" : undefined}>
                  {w}
                </em>
              ))}
            </span>
            <span className="sr-only-text">{words[0]}</span>
          </h1>
          <p className="cmac-hero__lead" style={D(200)}>
            {t("hero.lead")}
          </p>
          <div className="cmac-hero__actions" style={D(280)}>
            <Link className="btn" href="/collections/the-ritual">
              {t("hero.cta1")}
              <Icon name="arrow" />
            </Link>
            <Link className="cmac-hero__link" href="#routine">
              {t("hero.cta2")}
              <Icon name="arrow" />
            </Link>
          </div>
          <ul className="cmac-hero__proof" style={D(360)}>
            {[t("hero.proof1", { free }), t("hero.proof2"), t("hero.proof3")].map((p) => (
              <li key={p}>
                <Icon name="check" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* No data-reveal here: its will-change/transform would isolate the photo from
            the satin behind it. The slides fade themselves. */}
        <div
          className="cmac-hero__visual"
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocusCapture={() => setHold(true)}
          onBlurCapture={() => setHold(false)}
        >
          <div className="cmac-hero__stage" aria-hidden="true">
            <div className={`cmac-hero__light cmac-hero__light--${current?.light ?? "led"}`} />
            {slides.map((s, i) => (
              <div key={s.slug} className={`cmac-hero__slide cmac-hero__slide--${s.light}${i === slide ? " is-on" : ""}`}>
                <Image
                  loader={cloudinaryLoader}
                  src={s.image}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(min-width: 990px) 42vw, 90vw"
                  className="cmac-hero__photo"
                />
              </div>
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
            <div className="cmac-hero__controls">
              <div className="cmac-hero__dots" role="group" aria-label={t("hero.visualLabel")}>
                {slides.map((s, i) => (
                  <button
                    key={s.slug}
                    type="button"
                    aria-current={i === slide ? "true" : undefined}
                    aria-label={s.name}
                    className={i === slide ? "is-on" : undefined}
                    onClick={() => setSlide(i)}
                    style={{ "--ms": `${SLIDE_MS}ms` } as React.CSSProperties}
                  />
                ))}
              </div>
              {!still && !done && (
                <button
                  type="button"
                  className="cmac-hero__pause"
                  aria-pressed={paused}
                  aria-label={paused ? t("hero.play") : t("hero.pause")}
                  onClick={() => setPaused((p) => !p)}
                >
                  <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

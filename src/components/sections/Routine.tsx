"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { cloudinaryLoader } from "@/lib/cloudinary-loader";

/**
 * The evening ritual, told as you scroll. A sticky stage holds the tool of
 * the current step on a set that changes with it: frost for the ice roller,
 * sage for the contour step, the red of the mask for light, then night. A
 * clock fills from 0 to 15 minutes, which is what the four steps add up to.
 */
// Transparent cut-outs (alpha-0), cut from the originals with an eroded, re-feathered
// matte and sharpened (cmac-store/media recut pipeline), so each tool stands cleanly on
// a dark set. The loader adds size, sharpening and format.
const CL = (id: string) => `https://res.cloudinary.com/dmlolrov/image/upload/${id}`;

const STEPS = [
  { key: "1", slug: "facial-ice-roller", scene: "frost", img: CL("v1791567101/cmac/products/facial-ice-roller/alpha-0"), at: 1 },
  { key: "2", slug: "microcurrent-facial-lift-device", scene: "sage", img: CL("v1791567102/cmac/products/microcurrent-facial-lift-device/alpha-0"), at: 5 },
  { key: "3", slug: "led-red-light-mask", scene: "glow", img: CL("v1791567103/cmac/products/led-red-light-mask/alpha-0"), at: 15 },
  { key: "4", slug: "satin-beauty-sleep-set", scene: "night", img: CL("v1791567104/cmac/products/satin-beauty-sleep-set/alpha-0"), at: 15.5 },
] as const;
const TOTAL = 15.5;

export function Routine({ productNames }: { productNames: Record<string, { en: string; fr: string }> }) {
  const { t, locale } = useLocale();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  // The step whose text crosses the middle of the screen drives the stage.
  useEffect(() => {
    const els = refs.current.filter(Boolean) as HTMLLIElement[];
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const step = STEPS[active];
  const minutes = step.at;
  const angle = Math.min(1, minutes / TOTAL) * 360;

  return (
    <section className={`cmac-ritual cmac-ritual--${step.scene}`} id="routine" data-live>
      <div className="wrap cmac-ritual__head">
        <p className="eyebrow" data-reveal>
          {t("routine.eyebrow")}
        </p>
        <h2 data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
          {t("routine.title")}
        </h2>
        <p className="cmac-ritual__lead" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
          {t("routine.lead")}
        </p>
      </div>

      <div className="wrap cmac-ritual__body">
        <div className="cmac-ritual__stage" aria-hidden="true">
          <div className="cmac-ritual__set">
            <span className="cmac-ritual__halo" />
            {STEPS.map((s, i) => (
              <div key={s.key} className={`cmac-ritual__shot${i === active ? " is-on" : ""}`}>
                <Image loader={cloudinaryLoader} src={s.img} alt="" fill sizes="(min-width: 990px) 40vw, 80vw" className="cmac-ritual__img" />
              </div>
            ))}
            <div className="cmac-ritual__clock" style={{ "--a": `${angle}deg` } as React.CSSProperties}>
              <span className="cmac-ritual__min">{Math.floor(minutes)}</span>
              <span className="cmac-ritual__unit">min</span>
            </div>
          </div>
        </div>

        <ol className="cmac-ritual__steps">
          {STEPS.map((s, i) => {
            const name = productNames[s.slug];
            return (
              <li
                key={s.key}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                data-i={i}
                className={`cmac-ritual__step${i === active ? " is-on" : ""}`}
              >
                <span className="cmac-ritual__num">{String(i + 1).padStart(2, "0")}</span>
                <h3>
                  {t(`routine.${s.key}.t`)} <small>{t(`routine.${s.key}.time`)}</small>
                </h3>
                <p>{t(`routine.${s.key}.d`)}</p>
                {name && (
                  <Link className="cmac-ritual__link" href={`/shop/${s.slug}`}>
                    {locale === "fr" ? name.fr : name.en} →
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="wrap cmac-ritual__foot">
        <Link className="btn btn--cream" href="/collections/the-ritual">
          {t("routine.cta")}
        </Link>
      </div>
    </section>
  );
}

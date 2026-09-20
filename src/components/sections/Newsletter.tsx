"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { subscribe } from "@/app/actions/newsletter";

export function Newsletter() {
  const { t, locale } = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "already" | "invalid" | "error">("idle");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await subscribe(email, locale);
      setState(res);
    });
  }

  const D = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

  return (
    <section className="cmac-news grain" data-glow id="newsletter">
      <div className="wrap cmac-news__inner">
        <p className="eyebrow" data-reveal>
          {t("news.eyebrow")}
        </p>
        <h2 data-reveal style={D(80)}>
          {t("news.title")}
        </h2>
        <p className="cmac-news__lead" data-reveal style={D(160)}>
          {t("news.lead")}
        </p>
        {state === "ok" || state === "already" ? (
          <p className="cmac-news__ok" role="status">
            {t(state === "ok" ? "news.ok" : "news.already")}
          </p>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="cmac-news__row" data-reveal style={D(240)}>
              <label className="sr-only-text" htmlFor="news-email">
                {t("contact.email")}
              </label>
              <input
                id="news-email"
                type="email"
                name="email"
                placeholder={t("news.placeholder")}
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="btn" disabled={pending}>
                {pending ? "…" : t("news.button")}
              </button>
            </div>
            {(state === "invalid" || state === "error") && (
              <p className="cmac-news__err" role="alert">
                {t(state === "invalid" ? "news.invalid" : "news.error")}
              </p>
            )}
          </form>
        )}
        <p className="cmac-news__fine" data-reveal style={D(320)}>
          {t("news.fine")}
        </p>
      </div>
    </section>
  );
}

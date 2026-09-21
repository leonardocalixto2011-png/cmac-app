"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { subscribe, type SubscribeResult } from "@/app/actions/newsletter";
import { BRAND } from "@/lib/brand";

/** Maps a subscribe result to its message key (shared with the popup). */
export function subscribeMessageKey(res: SubscribeResult): { key: string; ok: boolean } {
  switch (res) {
    case "pending":
      return { key: "news.pending", ok: true };
    case "pending_no_email":
      return { key: "news.pendingNoEmail", ok: true };
    case "already":
      return { key: "news.already", ok: true };
    case "invalid":
      return { key: "news.invalid", ok: false };
    case "limited":
      return { key: "news.limited", ok: false };
    default:
      return { key: "news.error", ok: false };
  }
}

/** Homepage / footer-area signup. CASL: the consent wording sits next to the button; double opt-in follows. */
export function Newsletter() {
  const { t, locale } = useLocale();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<SubscribeResult | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await subscribe(email, locale, "footer");
      setResult(res);
      if (subscribeMessageKey(res).ok) {
        try {
          localStorage.setItem("cmac-news-popup", String(Date.now())); // don't show the popup offer again
        } catch {
          /* ignore */
        }
      }
    });
  }

  const D = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;
  const msg = result ? subscribeMessageKey(result) : null;

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
        {msg?.ok ? (
          <p className="cmac-news__ok" role="status">
            {t(msg.key)}
          </p>
        ) : (
          <form onSubmit={submit} noValidate aria-describedby="news-consent">
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
            {msg && !msg.ok && (
              <p className="cmac-news__err" role="alert">
                {t(msg.key)}
              </p>
            )}
          </form>
        )}
        <p className="cmac-news__fine" id="news-consent" data-reveal style={D(320)}>
          {t("consent.newsletter", { email: BRAND.email })}{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-cream">
            {t("news.privacy")}
          </Link>
        </p>
      </div>
    </section>
  );
}

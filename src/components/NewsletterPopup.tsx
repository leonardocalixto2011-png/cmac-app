"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";
import { subscribe, type SubscribeResult } from "@/app/actions/newsletter";
import { subscribeMessageKey } from "@/components/sections/Newsletter";
import { BRAND } from "@/lib/brand";
import { Icon } from "./Icon";

const KEY = "cmac-news-popup";
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;
const DELAY_MS = 25_000;
const EXCLUDED = ["/cart", "/account", "/admin", "/newsletter", "/shop/thanks"];

function snoozed(): boolean {
  try {
    const at = Number(localStorage.getItem(KEY) || 0);
    return Date.now() - at < SNOOZE_MS;
  } catch {
    return true; // no storage → don't nag
  }
}

function snooze() {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/**
 * "10% off your first order" slide-in. Shows after 25 s or 50 % scroll, never
 * on cart / account / admin / newsletter pages, never to signed-in subscribers,
 * and not again for 14 days once dismissed (or after signing up).
 * Accessible modal: labelled dialog, Esc closes, focus is trapped and restored.
 */
export function NewsletterPopup({ suppressed }: { suppressed: boolean }) {
  const { t, locale } = useLocale();
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<SubscribeResult | null>(null);
  const [pending, start] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<Element | null>(null);

  const excluded = suppressed || EXCLUDED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Trigger: 25 s or 50 % scroll, once per page view.
  useEffect(() => {
    if (excluded || snoozed()) return;
    let fired = false;
    const fire = () => {
      if (fired || snoozed()) return;
      fired = true;
      lastFocus.current = document.activeElement;
      setOpen(true);
    };
    const timer = window.setTimeout(fire, DELAY_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.5) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [excluded]);

  const close = useCallback(() => {
    snooze();
    setOpen(false);
    const el = lastFocus.current as HTMLElement | null;
    el?.focus?.();
  }, []);

  // Focus management + Esc + focus trap.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open || excluded) return null;
  const msg = result ? subscribeMessageKey(result) : null;

  return (
    <div className="cmac-popup-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div ref={dialogRef} className="cmac-popup grain" role="dialog" aria-modal="true" aria-labelledby="popup-title" aria-describedby="popup-lead">
        <button
          type="button"
          onClick={close}
          aria-label={t("popup.close")}
          className="absolute right-3 top-3 z-[1] inline-flex h-9 w-9 items-center justify-center rounded-full text-cream/80 hover:bg-white/10 hover:text-cream"
        >
          <Icon name="close" width={18} height={18} />
        </button>
        <div className="relative">
          <p className="eyebrow">{t("popup.eyebrow")}</p>
          <h2 id="popup-title" className="mt-3 pr-8 text-[clamp(1.6rem,1.3rem+1.5vw,2.1rem)] leading-tight">
            {t("popup.title")}
          </h2>
          <p id="popup-lead" className="mt-3 text-[0.94rem] leading-relaxed text-[#cfd3cf]">
            {t("popup.lead")}
          </p>
          {msg?.ok ? (
            <p role="status" className="mt-5 font-display text-[1.05rem] text-terra-2">
              {t(msg.key)}
            </p>
          ) : (
            <form
              className="mt-5 flex flex-col gap-3"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                start(async () => {
                  const res = await subscribe(email, locale, "popup");
                  setResult(res);
                  if (subscribeMessageKey(res).ok) snooze();
                });
              }}
            >
              <label className="sr-only-text" htmlFor="popup-email">
                {t("contact.email")}
              </label>
              <input
                ref={inputRef}
                id="popup-email"
                type="email"
                autoComplete="email"
                placeholder={t("news.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn--terra btn--block" disabled={pending}>
                {pending ? "…" : t("news.button")}
              </button>
              {msg && !msg.ok && (
                <p role="alert" className="text-[0.85rem] text-terra-2">
                  {t(msg.key)}
                </p>
              )}
            </form>
          )}
          <p className="mt-4 text-[0.72rem] leading-relaxed text-[#8f968f]">
            {t("consent.newsletter", { email: BRAND.email })}{" "}
            <Link href="/privacy" className="underline underline-offset-2" onClick={close}>
              {t("news.privacy")}
            </Link>
          </p>
          <button type="button" onClick={close} className="mt-3 text-[0.8rem] text-cream/70 underline underline-offset-4 hover:text-cream">
            {t("popup.noThanks")}
          </button>
        </div>
      </div>
    </div>
  );
}

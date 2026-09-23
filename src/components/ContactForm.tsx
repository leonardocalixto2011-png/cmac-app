"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { sendContact } from "@/app/contact/actions";
import { Icon } from "@/components/Icon";
import { BRAND } from "@/lib/brand";

export function ContactForm() {
  const { t, locale } = useLocale();
  const [f, setF] = useState({ name: "", email: "", message: "", website: "" });
  const [state, setState] = useState<"idle" | "ok" | "invalid" | "error">("idle");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      setState(await sendContact({ ...f, locale }));
    });
  }

  return (
    <div className="mx-auto grid max-w-[980px] gap-10 md:grid-cols-[0.9fr_1.1fr]">
      <div>
        <span className="eyebrow" data-reveal>
          {t("footer.help")}
        </span>
        <h1 className="mt-3 text-[clamp(2rem,1.5rem+2.4vw,3.2rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
          {t("contact.title")}
        </h1>
        <p className="mt-4 text-ink-soft" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
          {t("contact.lead")}
        </p>
        <p className="mt-6 text-[0.9rem] text-ink-soft" data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
          {t("contact.emailUs")}
          <br />
          <a href={`mailto:${BRAND.email}`} className="inline-flex items-center gap-2 font-semibold text-terra underline-offset-4 hover:underline">
            <Icon name="mail" className="h-4 w-4" />
            {BRAND.email}
          </a>
        </p>
        <div className="mt-6 rounded-2xl bg-warm-white px-4 py-3 text-[0.85rem] leading-relaxed text-ink-soft" data-reveal style={{ "--d": "300ms" } as React.CSSProperties}>
          <p className="font-ui text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink">{t("contact.who")}</p>
          <p className="mt-1">{t("contact.whoBody")}</p>
        </div>
      </div>

      {state === "ok" ? (
        <div className="rounded-[var(--radius-card)] bg-warm-white p-8" role="status">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-terra text-white">
            <Icon name="check" className="h-5 w-5" />
          </span>
          <p className="mt-4 text-[1.05rem] text-ink">{t("contact.sent")}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-warm-white p-6 md:p-8" data-reveal="right">
          <label className="flex flex-col gap-1.5 text-[0.8rem] font-semibold text-ink-soft">
            {t("contact.name")}
            <input className="field" type="text" required autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5 text-[0.8rem] font-semibold text-ink-soft">
            {t("contact.email")}
            <input className="field" type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1.5 text-[0.8rem] font-semibold text-ink-soft">
            {t("contact.message")}
            <textarea className="field" rows={6} required value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
          </label>
          {/* honeypot */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
          {(state === "invalid" || state === "error") && (
            <p className="text-sm text-terra" role="alert">
              {t(state === "invalid" ? "contact.invalid" : "contact.error")}
            </p>
          )}
          <button type="submit" className="btn self-start" disabled={pending}>
            <Icon name="arrow" />
            {pending ? "…" : t("contact.send")}
          </button>
        </form>
      )}
    </div>
  );
}

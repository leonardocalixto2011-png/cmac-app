"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { sendProRequest } from "@/app/pro/actions";
import { Icon } from "@/components/Icon";

const EMPTY = { salon: "", name: "", email: "", phone: "", city: "", message: "", website: "" };

export function ProForm() {
  const { t, locale } = useLocale();
  const [f, setF] = useState(EMPTY);
  const [state, setState] = useState<"idle" | "ok" | "invalid" | "error">("idle");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      setState(await sendProRequest({ ...f, locale }));
    });
  }

  if (state === "ok") {
    return (
      <div className="rounded-[var(--radius-card)] bg-warm-white p-8" role="status">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-terra text-white">
          <Icon name="check" className="h-5 w-5" />
        </span>
        <p className="mt-4 text-[1.05rem] text-ink">{t("pro.sent")}</p>
      </div>
    );
  }

  const field = (key: keyof typeof EMPTY, label: string, type = "text", required = false) => (
    <label className="flex flex-col gap-1 text-[0.85rem] text-ink-soft">
      {label}
      <input
        type={type}
        required={required}
        value={f[key]}
        onChange={(e) => setF({ ...f, [key]: e.target.value })}
        className="field"
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-warm-white p-6 md:p-8" data-reveal="right">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("salon", t("pro.f.salon"), "text", true)}
        {field("city", t("pro.f.city"))}
        {field("name", t("pro.f.name"), "text", true)}
        {field("email", t("pro.f.email"), "email", true)}
        {field("phone", t("pro.f.phone"), "tel")}
      </div>
      <label className="flex flex-col gap-1 text-[0.85rem] text-ink-soft">
        {t("pro.f.message")}
        <textarea
          rows={4}
          value={f.message}
          onChange={(e) => setF({ ...f, message: e.target.value })}
          className="field"
        />
      </label>
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
      {state === "invalid" && <p className="text-[0.85rem] text-terra">{t("pro.invalid")}</p>}
      {state === "error" && <p className="text-[0.85rem] text-terra">{t("pro.error")}</p>}
      <button type="submit" className="btn self-start" disabled={pending}>
        {pending ? "…" : t("pro.f.send")}
      </button>
      <p className="text-[0.78rem] text-ink-faint">{t("pro.f.privacy")}</p>
    </form>
  );
}

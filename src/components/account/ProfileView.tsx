"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { BRAND } from "@/lib/brand";
import { changePassword, deleteAccount, setNewsletter, updateProfile } from "@/app/account/actions";
import { AccountNav, BirthdayFields, Field, FormMessage, useAccountError } from "./ui";

type Msg = { tone: "ok" | "error"; text: string } | null;

function Card({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <section className={`rounded-[var(--radius-card)] p-[clamp(1.25rem,4vw,2rem)] ${danger ? "border border-terra/30 bg-terra/5" : "bg-warm-white"}`}>
      <h2 className="text-[1.3rem]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ProfileView(props: {
  email: string;
  name: string;
  birthMonth: number | null;
  birthDay: number | null;
  emailLocale: "en" | "fr";
  newsletter: "CONFIRMED" | "PENDING" | "NONE";
}) {
  const { t, locale, setLocale } = useLocale();
  const router = useRouter();
  const errorText = useAccountError();

  const [d, setD] = useState({
    name: props.name,
    month: props.birthMonth ? String(props.birthMonth) : "",
    day: props.birthDay ? String(props.birthDay) : "",
    locale: props.emailLocale,
  });
  const [detailsMsg, setDetailsMsg] = useState<Msg>(null);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwMsg, setPwMsg] = useState<Msg>(null);
  const [nlMsg, setNlMsg] = useState<Msg>(null);
  const [delPw, setDelPw] = useState("");
  const [delMsg, setDelMsg] = useState<Msg>(null);
  const [pending, start] = useTransition();

  const err = (code: string): Msg => ({ tone: "error", text: errorText(code) ?? t("acc.err.generic") });

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6">
      <header className="flex flex-col gap-4">
        <span className="eyebrow">{t("acc.eyebrow")}</span>
        <h1 className="text-[clamp(2rem,1.5rem+2.4vw,3rem)]">{t("acc.profileTitle")}</h1>
        <AccountNav active="profile" />
      </header>

      <Card title={t("acc.details")}>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setDetailsMsg(null);
            start(async () => {
              const res = await updateProfile({ name: d.name, birthMonth: d.month || null, birthDay: d.day || null, locale: d.locale });
              if (res.ok) {
                setDetailsMsg({ tone: "ok", text: t("acc.saved") });
                if (d.locale !== locale) setLocale(d.locale);
                router.refresh();
              } else setDetailsMsg(err(res.error));
            });
          }}
        >
          <Field label={t("acc.email")} name="email" value={props.email} readOnly disabled />
          <Field label={t("acc.name")} name="name" autoComplete="name" maxLength={120} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
          <BirthdayFields month={d.month} day={d.day} onMonth={(month) => setD({ ...d, month })} onDay={(day) => setD({ ...d, day })} />
          <label className="flex flex-col gap-1.5" htmlFor="email-locale">
            <span className="font-ui text-[0.8rem] font-semibold text-ink-soft">{t("acc.language")}</span>
            <select id="email-locale" className="field" value={d.locale} onChange={(e) => setD({ ...d, locale: e.target.value === "fr" ? "fr" : "en" })}>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </label>
          {detailsMsg && <FormMessage tone={detailsMsg.tone}>{detailsMsg.text}</FormMessage>}
          <button type="submit" disabled={pending} className="btn self-start">
            <Icon name="check" />
            {t("acc.save")}
          </button>
        </form>
      </Card>

      <Card title={t("acc.newsletterTitle")}>
        <p className="text-ink-soft">{t(`acc.nl.${props.newsletter}`)}</p>
        {props.newsletter === "NONE" && (
          <p className="mt-3 rounded-2xl bg-cream px-4 py-3 text-[0.84rem] leading-relaxed text-ink-soft">
            {t("consent.newsletter", { email: BRAND.email })}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {props.newsletter === "NONE" ? (
            <button
              type="button"
              className="btn btn--sm"
              disabled={pending}
              onClick={() => {
                setNlMsg(null);
                start(async () => {
                  const res = await setNewsletter(true, locale);
                  if (res.ok) router.refresh();
                  else setNlMsg(err(res.error));
                });
              }}
            >
              <Icon name="mail" />
              {t("acc.nl.subscribe")}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={pending}
              onClick={() => {
                setNlMsg(null);
                start(async () => {
                  const res = await setNewsletter(false, locale);
                  if (res.ok) router.refresh();
                  else setNlMsg(err(res.error));
                });
              }}
            >
              {t("acc.nl.unsubscribe")}
            </button>
          )}
        </div>
        {nlMsg && (
          <div className="mt-3">
            <FormMessage tone={nlMsg.tone}>{nlMsg.text}</FormMessage>
          </div>
        )}
      </Card>

      <Card title={t("acc.passwordTitle")}>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setPwMsg(null);
            if (pw.next.length < 8) {
              setPwMsg(err("password"));
              return;
            }
            start(async () => {
              const res = await changePassword(pw.current, pw.next);
              if (res.ok) {
                setPw({ current: "", next: "" });
                setPwMsg({ tone: "ok", text: t("acc.passwordChanged") });
              } else setPwMsg(err(res.error));
            });
          }}
        >
          <Field label={t("acc.currentPassword")} name="current-password" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <Field
            label={t("acc.newPassword")}
            hint={t("acc.passwordHint")}
            name="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={pw.next}
            onChange={(e) => setPw({ ...pw, next: e.target.value })}
          />
          {pwMsg && <FormMessage tone={pwMsg.tone}>{pwMsg.text}</FormMessage>}
          <button type="submit" disabled={pending} className="btn btn--ghost self-start">
            {t("acc.save")}
          </button>
        </form>
      </Card>

      <Card title={t("acc.deleteTitle")} danger>
        <p className="text-[0.92rem] leading-relaxed text-ink-soft">{t("acc.deleteLead")}</p>
        <form
          className="mt-4 flex flex-col gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setDelMsg(null);
            start(async () => {
              const res = await deleteAccount(delPw);
              if (res.ok) {
                router.push("/");
                router.refresh();
              } else setDelMsg(err(res.error));
            });
          }}
        >
          <Field label={t("acc.deleteConfirm")} name="delete-password" type="password" autoComplete="current-password" value={delPw} onChange={(e) => setDelPw(e.target.value)} />
          {delMsg && <FormMessage tone={delMsg.tone}>{delMsg.text}</FormMessage>}
          <button type="submit" disabled={pending || !delPw} className="btn btn--terra self-start">
            {t("acc.deleteBtn")}
          </button>
        </form>
      </Card>
    </div>
  );
}

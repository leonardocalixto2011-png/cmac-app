"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { BRAND } from "@/lib/brand";
import { registerCustomer, requestPasswordReset, resetPassword } from "@/app/account/actions";
import { AuthShell, BirthdayFields, Field, FormMessage, useAccountError } from "./ui";

/** Only same-site, non-admin paths are allowed as post-login destinations. */
function safeDest(from?: string): string {
  if (from && from.startsWith("/") && !from.startsWith("//") && !from.startsWith("/admin") && !from.startsWith("/account/login")) {
    return from;
  }
  return "/account";
}

export function CustomerLoginForm({ from, resetDone }: { from?: string; resetDone?: boolean }) {
  const { t } = useLocale();
  const router = useRouter();
  const errorText = useAccountError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (!res || res.error) {
        setError("credentials");
        return;
      }
      router.push(safeDest(from));
      router.refresh();
    });
  }

  return (
    <AuthShell title={t("acc.loginTitle")} lead={t("acc.loginLead")}>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {resetDone && <FormMessage tone="ok">{t("acc.resetDone")}</FormMessage>}
        <Field label={t("acc.email")} name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label={t("acc.password")}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormMessage>{errorText(error)}</FormMessage>
        <button type="submit" disabled={pending} className="btn btn--block">
          <Icon name="arrow" />
          {pending ? "…" : t("acc.loginBtn")}
        </button>
        <Link href="/account/reset" className="text-center text-[0.85rem] text-ink-soft underline underline-offset-4 hover:text-terra">
          {t("acc.forgot")}
        </Link>
      </form>
      <p className="mt-6 border-t border-[var(--line)] pt-5 text-center text-[0.9rem] text-ink-soft">
        {t("acc.noAccount")}{" "}
        <Link href={from ? `/account/register?from=${encodeURIComponent(from)}` : "/account/register"} className="font-semibold text-terra underline underline-offset-4">
          {t("acc.createOne")}
        </Link>
      </p>
    </AuthShell>
  );
}

export function RegisterForm({ from }: { from?: string }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const errorText = useAccountError();
  const [f, setF] = useState({ name: "", email: "", password: "", month: "", day: "" });
  const [newsletter, setNewsletter] = useState(false); // CASL: never pre-checked
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (f.password.length < 8) {
      setError("password");
      return;
    }
    start(async () => {
      const res = await registerCustomer({
        name: f.name,
        email: f.email,
        password: f.password,
        birthMonth: f.month || null,
        birthDay: f.day || null,
        newsletter,
        locale,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const login = await signIn("credentials", { email: f.email, password: f.password, redirect: false });
      if (!login || login.error) {
        router.push("/account/login");
        return;
      }
      router.push(safeDest(from));
      router.refresh();
    });
  }

  return (
    <AuthShell title={t("acc.registerTitle")} lead={t("acc.registerLead")}>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label={t("acc.name")} name="name" autoComplete="name" required maxLength={120} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Field label={t("acc.email")} name="email" type="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Field
          label={t("acc.password")}
          hint={t("acc.passwordHint")}
          name="new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />
        <BirthdayFields month={f.month} day={f.day} onMonth={(month) => setF({ ...f, month })} onDay={(day) => setF({ ...f, day })} />
        <label className="flex items-start gap-3 rounded-2xl bg-cream px-4 py-3 text-[0.84rem] leading-relaxed text-ink-soft">
          <input type="checkbox" className="mt-1 h-4 w-4 flex-none accent-[var(--color-terra)]" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
          <span>{t("consent.newsletter", { email: BRAND.email })}</span>
        </label>
        <FormMessage>{errorText(error)}</FormMessage>
        <button type="submit" disabled={pending} className="btn btn--block">
          <Icon name="check" />
          {pending ? "…" : t("acc.registerBtn")}
        </button>
        <p className="text-[0.78rem] leading-relaxed text-ink-faint">
          {t("acc.agree")}{" "}
          <Link href="/terms#glow-club" className="underline underline-offset-2 hover:text-terra">
            {t("glow.termsLink")}
          </Link>{" "}
          {t("acc.and")}{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-terra">
            {t("acc.privacyLink")}
          </Link>
          .
        </p>
      </form>
      <p className="mt-6 border-t border-[var(--line)] pt-5 text-center text-[0.9rem] text-ink-soft">
        {t("acc.haveAccount")}{" "}
        <Link href={from ? `/account/login?from=${encodeURIComponent(from)}` : "/account/login"} className="font-semibold text-terra underline underline-offset-4">
          {t("acc.loginBtn")}
        </Link>
      </p>
    </AuthShell>
  );
}

export function ResetForms({ token }: { token: string | null }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const errorText = useAccountError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "sent" | "unavailable" | "invalid">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (token) {
    return (
      <AuthShell title={t("acc.resetNewTitle")}>
        {state === "invalid" ? (
          <div className="flex flex-col gap-4">
            <FormMessage>{t("acc.resetInvalid")}</FormMessage>
            <Link href="/account/reset" className="btn btn--ghost btn--block">
              {t("acc.resetBtn")}
            </Link>
          </div>
        ) : (
          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              if (password.length < 8) {
                setError("password");
                return;
              }
              start(async () => {
                const res = await resetPassword(token, password);
                if (res.ok) router.push("/account/login?reset=1");
                else if (res.error === "invalid") setState("invalid");
                else setError(res.error);
              });
            }}
          >
            <Field
              label={t("acc.newPassword")}
              hint={t("acc.passwordHint")}
              name="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormMessage>{errorText(error)}</FormMessage>
            <button type="submit" disabled={pending} className="btn btn--block">
              <Icon name="check" />
              {pending ? "…" : t("acc.resetSave")}
            </button>
          </form>
        )}
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("acc.resetTitle")} lead={t("acc.resetLead")}>
      {state === "sent" ? (
        <FormMessage tone="ok">{t("acc.resetSent")}</FormMessage>
      ) : state === "unavailable" ? (
        <FormMessage>
          {t("acc.resetUnavailable")}{" "}
          <a href={`mailto:${BRAND.email}`} className="underline">
            {BRAND.email}
          </a>
        </FormMessage>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            start(async () => {
              const res = await requestPasswordReset(email, locale);
              if (res.ok) setState("sent");
              else if (res.error === "unavailable") setState("unavailable");
              else setError(res.error);
            });
          }}
        >
          <Field label={t("acc.email")} name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <FormMessage>{errorText(error)}</FormMessage>
          <button type="submit" disabled={pending} className="btn btn--block">
            <Icon name="mail" />
            {pending ? "…" : t("acc.resetBtn")}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-[0.88rem]">
        <Link href="/account/login" className="text-ink-soft underline underline-offset-4 hover:text-terra">
          {t("acc.backToLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}

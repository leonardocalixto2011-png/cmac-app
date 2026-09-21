"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { confirmNewsletter, unsubscribeNewsletter } from "@/app/actions/newsletter";

function Shell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[560px] text-center">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="mt-3 text-[clamp(2rem,1.5rem+2.4vw,3rem)]">{title}</h1>
      <div className="mt-5 flex flex-col items-center gap-5 text-ink-soft">{children}</div>
    </div>
  );
}

function HomeLink() {
  const { t } = useLocale();
  return (
    <Link href="/shop" className="btn btn--ghost">
      <Icon name="arrow" />
      {t("nlp.home")}
    </Link>
  );
}

function Invalid() {
  const { t } = useLocale();
  return (
    <Shell eyebrow={t("news.eyebrow")} title={t("nlp.invalidTitle")}>
      <p className="leading-relaxed">{t("nlp.invalidLead")}</p>
      <HomeLink />
    </Shell>
  );
}

export function ConfirmView({ token }: { token: string | null }) {
  const { t } = useLocale();
  const [state, setState] = useState<{ status: "working" | "done" | "invalid"; code: string | null }>({
    status: token ? "working" : "invalid",
    code: null,
  });
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    confirmNewsletter(token)
      .then((res) => setState(res.ok ? { status: "done", code: res.code } : { status: "invalid", code: null }))
      .catch(() => setState({ status: "invalid", code: null }));
  }, [token]);

  if (state.status === "invalid") return <Invalid />;
  if (state.status === "working") {
    return (
      <Shell eyebrow={t("news.eyebrow")} title={t("nlp.confirmingTitle")}>
        <p aria-live="polite">…</p>
      </Shell>
    );
  }
  return (
    <Shell eyebrow={t("news.eyebrow")} title={t("nlp.confirmedTitle")}>
      <p className="leading-relaxed">{state.code ? t("nlp.confirmedLead") : t("nlp.confirmedNoCode")}</p>
      {state.code && (
        <>
          <p className="rounded-[var(--radius-card)] border border-dashed border-terra bg-warm-white px-8 py-5 font-mono text-[1.6rem] tracking-[0.16em] text-ink">
            {state.code}
          </p>
          <p className="text-[0.88rem] text-ink-faint">{t("nlp.useCode")}</p>
        </>
      )}
      <Link href="/shop" className="btn">
        <Icon name="arrow" />
        {t("acc.shopNow")}
      </Link>
      <Link href="/glow-club" className="text-[0.9rem] text-terra underline underline-offset-4">
        {t("glowband.cta")}
      </Link>
    </Shell>
  );
}

export function UnsubscribeView({
  token,
  maskedEmail,
  alreadyUnsubscribed,
}: {
  token: string | null;
  maskedEmail: string;
  alreadyUnsubscribed: boolean;
}) {
  const { t } = useLocale();
  const [done, setDone] = useState(alreadyUnsubscribed);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();
  const started = useRef(false);

  const run = () => {
    if (!token) return;
    start(async () => {
      const ok = await unsubscribeNewsletter(token).catch(() => false);
      if (ok) setDone(true);
      else setFailed(true);
    });
  };

  // One click: the link in the email is enough — unsubscribe as soon as the page opens in a browser.
  useEffect(() => {
    if (!token || alreadyUnsubscribed || started.current) return;
    started.current = true;
    unsubscribeNewsletter(token)
      .then((ok) => (ok ? setDone(true) : setFailed(true)))
      .catch(() => setFailed(true));
  }, [token, alreadyUnsubscribed]);

  if (!token || failed) return <Invalid />;
  if (done) {
    return (
      <Shell eyebrow={t("news.eyebrow")} title={t("nlp.unsubTitle")}>
        <p role="status" className="leading-relaxed">
          {t("nlp.unsubDone")}
        </p>
        <p className="text-[0.88rem] text-ink-faint">{t("nlp.resub")}</p>
        <HomeLink />
      </Shell>
    );
  }
  return (
    <Shell eyebrow={t("news.eyebrow")} title={t("nlp.unsubTitle")}>
      <p className="leading-relaxed">{t("nlp.unsubLead", { email: maskedEmail })}</p>
      <button type="button" className="btn" onClick={run} disabled={pending}>
        {pending ? t("nlp.unsubWorking") : t("nlp.unsubBtn")}
      </button>
    </Shell>
  );
}

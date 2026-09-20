"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useLocale();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section-pad">
      <div className="wrap mx-auto max-w-[480px] text-center">
        <span className="eyebrow">CMAC Beauty</span>
        <h1 className="mt-4 text-[clamp(2rem,1.5rem+2.5vw,3rem)]">{t("error.title")}</h1>
        <p className="mx-auto mt-3 max-w-[38ch] text-ink-soft">{t("error.lead")}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn">
            {t("error.retry")}
          </button>
          <Link href="/" className="btn btn--ghost">
            {t("notfound.home")}
          </Link>
        </div>
      </div>
    </section>
  );
}

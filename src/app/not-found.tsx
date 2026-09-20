"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";

export default function NotFound() {
  const { t } = useLocale();
  return (
    <section className="section-pad">
      <div className="wrap mx-auto max-w-[480px] text-center">
        <span className="eyebrow">CMAC Beauty</span>
        <h1 className="mt-4 text-[clamp(2.2rem,1.6rem+3vw,3.4rem)]">{t("notfound.title")}</h1>
        <p className="mx-auto mt-3 max-w-[36ch] text-ink-soft">{t("notfound.lead")}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn">
            {t("notfound.shop")}
          </Link>
          <Link href="/" className="btn btn--ghost">
            {t("notfound.home")}
          </Link>
        </div>
      </div>
    </section>
  );
}

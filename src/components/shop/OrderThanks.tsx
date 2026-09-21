"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { useCart } from "./CartProvider";
import { Icon } from "@/components/Icon";

export function OrderThanks({ reference, found, signedIn = false }: { reference: string; found: boolean; signedIn?: boolean }) {
  const { t } = useLocale();
  const cart = useCart();

  useEffect(() => {
    if (found) cart.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found]);

  return (
    <div className="mx-auto max-w-[520px] text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-terra text-white">
        <Icon name="check" className="h-6 w-6" />
      </span>
      <h1 className="mt-5 text-[clamp(2rem,1.6rem+2vw,3rem)]">{t("shop.thanksTitle")}</h1>
      <p className="mx-auto mt-3 max-w-[44ch] text-ink-soft">{t("shop.thanksLead")}</p>
      {found ? (
        <p className="mt-4 text-sm text-ink-faint">
          {t("shop.orderRef")}: <span className="font-mono">{reference.slice(-8).toUpperCase()}</span>
        </p>
      ) : (
        <p className="mt-4 text-sm text-ink-faint">{t("shop.thanksNotFound")}</p>
      )}
      {found && !signedIn && (
        <div className="mt-7 rounded-[var(--radius-card)] bg-warm-white p-5">
          <p className="text-[0.92rem] text-ink-soft">{t("shop.thanksJoin")}</p>
          <Link href="/account/register" className="btn btn--sm mt-3">
            <Icon name="gift" />
            {t("shop.thanksJoinCta")}
          </Link>
        </div>
      )}
      <Link href={signedIn ? "/account/orders" : "/shop"} className="btn btn--ghost mt-7">
        {signedIn ? t("acc.ordersPageTitle") : t("shop.continue")}
      </Link>
    </div>
  );
}

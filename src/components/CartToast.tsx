"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { Icon } from "@/components/Icon";
import { ADDED_EVENT } from "@/lib/motion-fx";

/**
 * "Added to cart" confirmation that slides up from the bottom for a moment.
 * Fed by announceAdded(); mounted once in the root layout.
 */
export function CartToast() {
  const { t } = useLocale();
  const [name, setName] = useState<string | null>(null);
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onAdded = (e: Event) => {
      const detail = (e as CustomEvent<{ name: string }>).detail;
      setName(detail?.name ?? "");
      setOn(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setOn(false), 3200);
    };
    window.addEventListener(ADDED_EVENT, onAdded);
    return () => {
      window.removeEventListener(ADDED_EVENT, onAdded);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (name === null) return null;

  return (
    <div className={`cmac-toast${on ? " is-on" : ""}`} role="status" aria-live="polite">
      <span className="cmac-toast__check" aria-hidden="true">
        <Icon name="check" />
      </span>
      <span className="cmac-toast__text">
        <strong>{t("toast.added")}</strong>
        {name ? <span className="cmac-toast__name">{name}</span> : null}
      </span>
      <Link href="/cart" className="cmac-toast__link" onClick={() => setOn(false)}>
        {t("toast.view")}
        <Icon name="arrow" />
      </Link>
    </div>
  );
}

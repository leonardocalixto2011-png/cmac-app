"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";
import { CONSENT_KEY, anyPixel, loadPixels, readConsent, trackPageView } from "@/lib/pixels";

/** Cookie choice + pixel loader. Renders nothing when no pixel ID is configured. */
export function Pixels() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const [choice, setChoice] = useState<"all" | "essential" | null | "unknown">("unknown");

  useEffect(() => {
    const id = setTimeout(() => setChoice(readConsent()), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (choice !== "all") return;
    loadPixels();
    trackPageView();
  }, [choice, pathname]);

  if (!anyPixel() || choice !== null || pathname?.startsWith("/admin")) return null;

  const save = (v: "all" | "essential") => {
    try {
      localStorage.setItem(CONSENT_KEY, v);
    } catch {
      /* this visit only */
    }
    setChoice(v);
  };
  const fr = locale === "fr";
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={fr ? "Témoins" : "Cookies"}
      className="fixed inset-x-3 bottom-3 z-[150] mx-auto max-w-[560px] rounded-2xl bg-ink p-4 text-[0.85rem] text-cream shadow-xl md:inset-x-auto md:left-4"
    >
      <p className="leading-relaxed text-sage-light">
        {fr
          ? "Nous utilisons les témoins essentiels au fonctionnement du site. Avec votre accord, nous utilisons aussi des témoins publicitaires (TikTok, Meta, Pinterest) pour mesurer nos publicités et vous montrer des offres pertinentes."
          : "We use the cookies the site needs to work. With your OK, we also use advertising cookies (TikTok, Meta, Pinterest) to measure our ads and show you relevant offers."}{" "}
        <Link href="/privacy#cookies" className="underline underline-offset-2">
          {fr ? "En savoir plus" : "Learn more"}
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => save("all")} className="btn btn--sm">
          {fr ? "Tout accepter" : "Accept all"}
        </button>
        <button type="button" onClick={() => save("essential")} className="btn btn--sm btn--ghost !text-cream">
          {fr ? "Essentiels seulement" : "Essential only"}
        </button>
      </div>
    </div>
  );
}

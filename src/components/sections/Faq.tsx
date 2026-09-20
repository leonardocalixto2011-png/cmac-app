"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { faqItems } from "@/content/faq";
import { SHIPPING } from "@/lib/brand";
import { formatWholeDollars } from "@/lib/utils";
import { Icon } from "@/components/Icon";

/**
 * FAQ accordion. `limit` trims the list on the homepage; the /faq page shows
 * everything. FAQPage JSON-LD is emitted by the server page (see page.tsx).
 */
export function Faq({ limit, asPage = false }: { limit?: number; asPage?: boolean }) {
  const { t, locale } = useLocale();
  const items = faqItems(locale, formatWholeDollars(SHIPPING.freeThresholdCents, locale));
  const shown = limit ? items.slice(0, limit) : items;
  const Heading = asPage ? "h1" : "h2";

  return (
    <section className="cmac-faq" id="faq">
      <div className="wrap cmac-faq__grid">
        <div className="cmac-faq__intro">
          <p className="eyebrow" data-reveal>
            {t("faq.eyebrow")}
          </p>
          <Heading data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
            {t("faq.title")}
          </Heading>
          <p data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
            {t("faq.lead")}
          </p>
          {!asPage && (
            <Link href="/faq" className="btn btn--ghost btn--sm mt-6" data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
              {t("faq.more")}
              <Icon name="arrow" />
            </Link>
          )}
        </div>
        <div>
          {shown.map((item, i) => (
            <details key={item.q} className="faq-item" data-reveal style={{ "--d": `${i * 70}ms` } as React.CSSProperties} open={i === 0}>
              <summary>
                <span>{item.q}</span>
                <i aria-hidden="true" />
              </summary>
              <div className="faq-item__a">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

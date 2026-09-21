"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { PAGES } from "@/content/pages";

/**
 * Renders a bilingual long-form page (About, Shipping & Returns, policies)
 * from src/content/pages.ts, switching instantly with the locale toggle.
 */
export function LongForm({ page, eyebrow }: { page: keyof typeof PAGES; eyebrow?: string }) {
  const { locale } = useLocale();
  const c = PAGES[page][locale];

  return (
    <article className="mx-auto max-w-[72ch]">
      {eyebrow && (
        <span className="eyebrow" data-reveal>
          {eyebrow}
        </span>
      )}
      <h1 className="mt-3 text-[clamp(2rem,1.5rem+2.4vw,3.2rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
        {c.title}
      </h1>
      {c.updated && <p className="mt-2 text-[0.82rem] text-ink-faint">{c.updated}</p>}
      {c.lead && (
        <p className="mt-5 text-[1.08rem] leading-relaxed text-ink-soft" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
          {c.lead}
        </p>
      )}
      <div className="prose mt-6">
        {c.blocks.map((b, i) => (
          <section key={i} id={b.id} className={b.id ? "scroll-mt-[calc(var(--nav-h)+16px)]" : undefined}>
            {b.h && <h2>{b.h}</h2>}
            {b.p?.map((p, j) => <p key={j}>{p}</p>)}
            {b.ul && (
              <ul>
                {b.ul.map((li, j) => (
                  <li key={j}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}

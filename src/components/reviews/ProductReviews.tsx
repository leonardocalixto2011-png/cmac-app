import type { Locale } from "@/i18n/messages";
import type { ReviewSummary } from "@/lib/reviews";

function Stars({ value, className = "" }: { value: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={`text-terra ${className}`} aria-hidden="true">
      {"★".repeat(full)}
      <span className="text-ink-faint/40">{"★".repeat(5 - full)}</span>
    </span>
  );
}

/**
 * Verified-buyer reviews under a product. Renders nothing until there is at
 * least one approved review: no placeholder ratings, ever.
 */
export function ProductReviews({ summary, locale }: { summary: ReviewSummary; locale: Locale }) {
  if (!summary.count) return null;
  const fr = locale === "fr";
  const avg = summary.average.toLocaleString(fr ? "fr-CA" : "en-CA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <section id="reviews" className="mx-auto mt-16 max-w-[820px] scroll-mt-[calc(var(--nav-h)+16px)]">
      <span className="eyebrow">{fr ? "Avis de clientes" : "Customer reviews"}</span>
      <div className="mt-3 flex flex-wrap items-baseline gap-3">
        <h2 className="text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)]">{avg} / 5</h2>
        <Stars value={summary.average} className="text-xl" />
        <span className="text-[0.9rem] text-ink-soft">
          {fr ? `${summary.count} avis d'acheteuses vérifiées` : `${summary.count} verified-buyer review${summary.count > 1 ? "s" : ""}`}
        </span>
      </div>
      <ul className="mt-6 flex flex-col divide-y divide-[var(--line)]">
        {summary.reviews.map((r) => (
          <li key={r.id} className="py-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.85rem]">
              <Stars value={r.rating} />
              <span className="font-semibold text-ink">{r.authorName}</span>
              <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[0.72rem] font-semibold text-sage">{fr ? "Achat vérifié" : "Verified buyer"}</span>
              {r.incentivized && (
                <span className="rounded-full bg-cream-2 px-2 py-0.5 text-[0.72rem] text-ink-soft">{fr ? "Produit reçu en cadeau" : "Received as a gift"}</span>
              )}
              <span className="text-ink-faint">{r.createdAt.toLocaleDateString(fr ? "fr-CA" : "en-CA", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            {r.title && <p className="mt-2 font-display text-[1.08rem]">{r.title}</p>}
            <p className="mt-1 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-soft" lang={r.locale === "fr" ? "fr" : "en"}>
              {r.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

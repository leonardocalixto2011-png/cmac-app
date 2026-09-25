import type { Metadata } from "next";
import { serverLocale } from "@/i18n/server";
import { reviewContext, suggestedAuthor } from "@/lib/reviews";
import { ReviewForms, StopReviewsButton } from "@/components/reviews/ReviewForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Review", robots: { index: false, follow: false } };

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ stop?: string }>;
}) {
  const [{ token }, { stop }, locale] = await Promise.all([params, searchParams, serverLocale()]);
  const ctx = await reviewContext(token).catch(() => null);
  const fr = locale === "fr";

  return (
    <section className="section-pad">
      <div className="wrap mx-auto max-w-[680px]">
        <span className="eyebrow">{fr ? "Votre avis" : "Your review"}</span>
        {!ctx ? (
          <>
            <h1 className="mt-3 text-[clamp(2rem,1.6rem+2vw,3rem)]">{fr ? "Lien expiré ou invalide" : "This link isn't valid"}</h1>
            <p className="mt-3 text-ink-soft">
              {fr
                ? "Ce lien d'avis ne correspond à aucune commande. Écrivez-nous à bonjour@cmacbeauty.ca et nous vous enverrons un nouveau lien."
                : "This review link doesn't match an order. Write to bonjour@cmacbeauty.ca and we'll send you a new one."}
            </p>
          </>
        ) : stop === "1" ? (
          <>
            <h1 className="mt-3 text-[clamp(2rem,1.6rem+2vw,3rem)]">{fr ? "Plus de demandes d'avis ?" : "No more review requests?"}</h1>
            <p className="mt-3 text-ink-soft">
              {fr
                ? "Confirmez et nous ne vous demanderons plus d'avis. Vous recevrez toujours vos confirmations de commande et d'expédition."
                : "Confirm and we won't ask you for reviews again. You'll still get your order and shipping emails."}
            </p>
            <StopReviewsButton token={token} locale={locale} />
          </>
        ) : (
          <>
            <h1 className="mt-3 text-[clamp(2rem,1.6rem+2vw,3rem)]">{fr ? "Alors, verdict ?" : "So, what's the verdict?"}</h1>
            <p className="mt-3 text-ink-soft">
              {fr
                ? "Une note et quelques mots honnêtes, par produit. Les bons comme les moins bons avis sont publiés après une vérification rapide (nous ne retirons que les propos injurieux ou hors sujet)."
                : "A rating and a few honest words, per product. Good and less-good reviews are published after a quick check (we only remove abusive or off-topic content)."}
            </p>
            <ReviewForms
              token={token}
              locale={locale}
              defaultAuthor={suggestedAuthor(ctx.order.contactName)}
              items={ctx.items.map((i) => ({ slug: i.slug, name: fr ? i.nameFr : i.nameEn, image: i.image, done: i.done }))}
            />
          </>
        )}
      </div>
    </section>
  );
}

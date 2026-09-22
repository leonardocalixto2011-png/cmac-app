"use client";

import { useState, useTransition } from "react";
import { stopReviewEmails, submitReview } from "@/app/review/actions";
import { cn } from "@/lib/utils";

type Item = { slug: string; name: string; image: string | null; done: boolean };

const L = {
  en: {
    rating: "Your rating",
    title: "Title (optional)",
    body: "Your review",
    bodyHint: "What did you like, or not? How do you use it? (10 characters minimum)",
    name: "Name shown with your review",
    send: "Publish my review",
    sent: "Thank you! Your review will appear after a quick check.",
    edit: "Already reviewed. You can update it below.",
    invalid: "Please pick a rating and write at least 10 characters.",
    error: "Something went wrong. Please try again.",
    stars: (n: number) => `${n} star${n > 1 ? "s" : ""}`,
  },
  fr: {
    rating: "Votre note",
    title: "Titre (facultatif)",
    body: "Votre avis",
    bodyHint: "Qu'avez-vous aimé, ou moins aimé ? Comment l'utilisez-vous ? (10 caractères minimum)",
    name: "Nom affiché avec votre avis",
    send: "Publier mon avis",
    sent: "Merci ! Votre avis sera publié après une vérification rapide.",
    edit: "Avis déjà envoyé. Vous pouvez le modifier ci-dessous.",
    invalid: "Choisissez une note et écrivez au moins 10 caractères.",
    error: "Une erreur est survenue. Veuillez réessayer.",
    stars: (n: number) => `${n} étoile${n > 1 ? "s" : ""}`,
  },
};

function ReviewCard({ item, token, locale, defaultAuthor }: { item: Item; token: string; locale: "en" | "fr"; defaultAuthor: string }) {
  const t = L[locale];
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState(defaultAuthor);
  const [state, setState] = useState<"idle" | "sent" | "invalid" | "error">("idle");
  const [pending, start] = useTransition();

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || body.trim().length < 10 || !author.trim()) return setState("invalid");
    start(async () => {
      const res = await submitReview({ token, slug: item.slug, rating, title, body, authorName: author, locale });
      setState(res.ok ? "sent" : res.error === "INVALID" ? "invalid" : "error");
    });
  }

  return (
    <li className="rounded-2xl bg-warm-white p-4">
      <div className="flex items-center gap-3">
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="h-16 w-14 flex-none rounded-xl bg-cream-2 object-cover" />
        )}
        <p className="font-display text-[1.1rem]">{item.name}</p>
      </div>
      {state === "sent" ? (
        <p className="mt-3 rounded-xl bg-sage/10 px-3 py-2 text-[0.9rem] text-sage">{t.sent}</p>
      ) : (
        <form onSubmit={send} className="mt-3 flex flex-col gap-3 text-[0.9rem]">
          {item.done && <p className="text-[0.8rem] text-ink-faint">{t.edit}</p>}
          <fieldset>
            <legend className="mb-1 text-ink-soft">{t.rating}</legend>
            <div className="flex gap-1" role="radiogroup">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={t.stars(n)}
                  onClick={() => setRating(n)}
                  className={cn("text-[1.7rem] leading-none transition-colors", n <= rating ? "text-terra" : "text-ink-faint/40")}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-1 block text-ink-soft">{t.title}</span>
            <input className="field w-full" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-ink-soft">{t.body}</span>
            <textarea className="field min-h-[110px] w-full" maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t.bodyHint} />
          </label>
          <label className="block">
            <span className="mb-1 block text-ink-soft">{t.name}</span>
            <input className="field w-full" maxLength={40} value={author} onChange={(e) => setAuthor(e.target.value)} />
          </label>
          {(state === "invalid" || state === "error") && (
            <p className="text-[0.85rem] text-terra" role="alert">
              {state === "invalid" ? t.invalid : t.error}
            </p>
          )}
          <button type="submit" disabled={pending} className="btn self-start">
            {pending ? "…" : t.send}
          </button>
        </form>
      )}
    </li>
  );
}

export function ReviewForms({ token, locale, items, defaultAuthor }: { token: string; locale: "en" | "fr"; items: Item[]; defaultAuthor: string }) {
  return (
    <ul className="mt-6 flex flex-col gap-4">
      {items.map((i) => (
        <ReviewCard key={i.slug} item={i} token={token} locale={locale} defaultAuthor={defaultAuthor} />
      ))}
    </ul>
  );
}

export function StopReviewsButton({ token, locale }: { token: string; locale: "en" | "fr" }) {
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  if (done)
    return <p className="mt-5 rounded-xl bg-sage/10 px-3 py-2 text-sage">{locale === "fr" ? "C'est noté. Plus de demandes d'avis." : "Done. No more review requests."}</p>;
  return (
    <button type="button" disabled={pending} className="btn mt-5" onClick={() => start(async () => setDone(await stopReviewEmails(token)))}>
      {locale === "fr" ? "Oui, ne plus me demander d'avis" : "Yes, stop review requests"}
    </button>
  );
}

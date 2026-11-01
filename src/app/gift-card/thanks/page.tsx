import type { Metadata } from "next";
import Link from "next/link";
import { serverLocale } from "@/i18n/server";
import { BRAND } from "@/lib/brand";

const COPY = {
  en: {
    title: "Thank you",
    lead: "Your gift card is on its way by email, usually within a few minutes. If you chose a day, it leaves that morning and your receipt with the code arrives now.",
    help: `Nothing after 15 minutes? Check the spam folder, then write to ${BRAND.email}.`,
    cta: "Back to the shop",
  },
  fr: {
    title: "Merci",
    lead: "Votre carte-cadeau part par courriel, habituellement en quelques minutes. Si vous avez choisi un jour, elle part ce matin-là, et votre reçu avec le code arrive maintenant.",
    help: `Rien après 15 minutes ? Regardez dans les courriels indésirables, puis écrivez à ${BRAND.email}.`,
    cta: "Retour à la boutique",
  },
} as const;

export const metadata: Metadata = { robots: { index: false } };

export default async function GiftCardThanksPage() {
  const c = COPY[await serverLocale()];
  return (
    <section className="section-pad">
      <div className="wrap mx-auto max-w-[620px]">
        <h1 className="text-[clamp(2rem,1.5rem+2.4vw,3.2rem)]">{c.title}</h1>
        <p className="mt-4 text-[1.08rem] leading-relaxed text-ink-soft">{c.lead}</p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{c.help}</p>
        <Link href="/shop" className="btn btn--ghost mt-6">
          {c.cta}
        </Link>
      </div>
    </section>
  );
}

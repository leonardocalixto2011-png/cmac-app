import type { Metadata } from "next";
import { serverLocale } from "@/i18n/server";
import { GiftCardBalance, GiftCardForm } from "@/components/shop/GiftCardForm";
import { JsonLd, breadcrumbLd, faqLd } from "@/components/JsonLd";
import { BRAND, POLICY, SHIPPING } from "@/lib/brand";
import { GIFT_CARD_AMOUNTS, GIFT_CARD_REFUND_FLOOR_CENTS } from "@/lib/gift-card-rules";
import { formatWholeDollars } from "@/lib/utils";

const COPY = {
  en: {
    eyebrow: "Gift card",
    title: "The gift that arrives in time",
    lead: "Sent by email in minutes, or on the morning you choose. They pick what they want, with no shade to guess.",
    faqTitle: "Before you buy",
  },
  fr: {
    eyebrow: "Carte-cadeau",
    title: "Le cadeau qui arrive à temps",
    lead: "Envoyée par courriel en quelques minutes, ou le matin de votre choix. La personne choisit ce qu'elle veut, sans teinte à deviner.",
    faqTitle: "Avant d'acheter",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await serverLocale();
  const c = COPY[locale];
  return {
    title: c.eyebrow,
    description: c.lead,
    alternates: { canonical: "/gift-card", languages: { "en-CA": "/gift-card", "fr-CA": "/gift-card?lang=fr", "x-default": "/gift-card" } },
  };
}

export default async function GiftCardPage() {
  const locale = await serverLocale();
  const fr = locale === "fr";
  const c = COPY[locale];
  const low = formatWholeDollars(GIFT_CARD_AMOUNTS[0], locale);
  const high = formatWholeDollars(GIFT_CARD_AMOUNTS[GIFT_CARD_AMOUNTS.length - 1], locale);
  const floor = formatWholeDollars(GIFT_CARD_REFUND_FLOOR_CENTS, locale);
  const free = formatWholeDollars(SHIPPING.freeThresholdCents, locale);
  const { min, max } = SHIPPING.totalWeeks;

  // These are the conditions Québec asks a merchant to give before the sale.
  const faq = fr
    ? [
        { q: "Quand est-ce que la personne la reçoit ?", a: "Quelques minutes après le paiement, ou vers 9 h le jour que vous choisissez. La carte arrive tout de suite, mais les produits achetés avec elle sont livrés en " + `${min} à ${max} semaines.` },
        { q: "Comment l'utilise-t-on ?", a: "Au paiement sur cmacbeauty.ca, on touche « Ajouter un code promotionnel » et on entre le code. Il faut donc magasiner en ligne : la carte ne se présente nulle part ailleurs." },
        { q: "Est-ce qu'elle expire ? Y a-t-il des frais ?", a: "Non et non. Elle n'a aucune date d'expiration et aucuns frais, ni à l'achat ni à l'utilisation." },
        { q: "Et si la commande coûte moins cher que la carte ?", a: "Le reste vous appartient. On envoie par courriel un nouveau code pour le solde, qui remplace l'ancien." },
        { q: "Comment vérifier le solde ?", a: "Avec le formulaire au bas de cette page, ou en nous écrivant à " + `${BRAND.email}.` },
        { q: "Est-ce qu'elle paie la livraison ?", a: `Non, elle s'applique aux produits. La livraison est gratuite dès ${free} ; en bas de ce montant, les frais de livraison restent à payer par carte.` },
        { q: "Peut-on la combiner avec un code promo ?", a: "Non : le paiement accepte une seule carte ou un seul code par commande. Si vous avez les deux, choisissez celui qui vous donne le plus." },
        { q: "Et pour un remboursement ?", a: `Une carte qui n'a pas servi se rembourse sur demande dans les ${POLICY.returnDays} jours suivant l'achat. Un solde de ${floor} ou moins se rembourse sur demande, en tout temps. Écrivez-nous à ${BRAND.email}.` },
      ]
    : [
        { q: "When does the person get it?", a: `A few minutes after payment, or around 9 a.m. on the day you choose. The card arrives right away, but products bought with it are delivered in ${min} to ${max} weeks.` },
        { q: "How is it used?", a: "At checkout on cmacbeauty.ca, tap “Add promotion code” and enter the code. So it's for shopping online: there is nowhere else to present it." },
        { q: "Does it expire? Are there fees?", a: "No and no. It has no expiry date and no fees, to buy it or to use it." },
        { q: "What if the order costs less than the card?", a: "The rest is yours. We email a new code for the balance, which replaces the old one." },
        { q: "How do I check the balance?", a: `With the form at the bottom of this page, or by writing to ${BRAND.email}.` },
        { q: "Does it cover shipping?", a: `No, it covers products. Shipping is free from ${free}; below that, the shipping fee is paid by card.` },
        { q: "Can I combine it with a promo code?", a: "No: checkout takes one card or one code per order. If you have both, use the one that gives you more." },
        { q: "What about refunds?", a: `An unused card is refunded on request within ${POLICY.returnDays} days of purchase. A balance of ${floor} or less is refunded on request at any time. Write to ${BRAND.email}.` },
      ];

  return (
    <section className="section-pad">
      <JsonLd data={faqLd(faq)} />
      <JsonLd data={breadcrumbLd([{ name: c.eyebrow, path: "/gift-card" }])} />
      <div className="wrap">
        <header className="gc-head">
          <span className="eyebrow">{c.eyebrow}</span>
          <h1>{c.title}</h1>
          <p>{c.lead}</p>
          <p className="gc-range">{fr ? `De ${low} à ${high}. Aucune date d'expiration, aucuns frais.` : `From ${low} to ${high}. No expiry date, no fees.`}</p>
        </header>
        <GiftCardForm />
        <div className="gc-after">
          <h2>{c.faqTitle}</h2>
          <dl className="flex flex-col divide-y divide-[var(--line)]">
            {faq.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="font-display text-[1.08rem]">{f.q}</dt>
                <dd className="mt-1 text-[0.98rem] leading-relaxed text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
          <GiftCardBalance />
        </div>
      </div>
    </section>
  );
}

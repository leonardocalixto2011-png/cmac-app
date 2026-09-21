import type { Locale } from "@/i18n/messages";

export type FaqItem = { q: string; a: string };

/**
 * FAQ copy (from content/pages.md). Plain text answers; `{free}` is replaced
 * with the free-shipping threshold so it stays in sync with src/lib/brand.ts.
 */
const FAQ: Record<Locale, FaqItem[]> = {
  en: [
    {
      q: "How long does shipping take?",
      a: "Orders are processed within 3 to 5 business days (our supplier prepares each item for your order). Delivery then takes 7 to 15 business days, so plan on about 2 to 4 weeks in total, depending on the item and your province; the estimate is shown at checkout before you pay. You'll receive a tracking number by email as soon as your parcel is on its way.",
    },
    {
      q: "How much is shipping?",
      a: "Flat-rate shipping across Canada, and free on orders of {free} or more. The exact amount is shown at checkout before you pay.",
    },
    {
      q: "Do you ship outside Canada?",
      a: "Not yet. Canada only for now.",
    },
    {
      q: "Can I return a device?",
      a: "Yes. Unused devices in their original packaging can be returned within 30 days of delivery. Hygiene items such as ice rollers must be unopened. Contact us with your order number and we'll send return instructions. Return shipping is at your cost unless the item arrived defective.",
    },
    {
      q: "Are these medical devices?",
      a: "No. CMAC tools are cosmetic, at-home wellness devices. They are not intended to diagnose, treat, cure or prevent any condition. If you are pregnant, have a pacemaker or implanted electronic device, epilepsy, an active skin condition, or are under medical care, ask your doctor before use.",
    },
    {
      q: "How often should I use them?",
      a: "Start with three sessions a week and see how your skin responds. Each product page has a routine card with timing.",
    },
    {
      q: "Is there a warranty?",
      a: "Every device is covered against manufacturing defects for 12 months from delivery. Send us your order number and a photo or short video of the problem.",
    },
    {
      q: "Can I use several devices in one session?",
      a: "Yes. Our suggested order is Cool, Lift, Glow: ice roller first, then the microcurrent device or EMS roller, then the LED mask, then moisturizer.",
    },
  ],
  fr: [
    {
      q: "Combien de temps prend la livraison ?",
      a: "Les commandes sont traitées en 3 à 5 jours ouvrables (notre fournisseur prépare chaque article pour votre commande). La livraison prend ensuite de 7 à 15 jours ouvrables : comptez environ 2 à 4 semaines au total, selon l'article et votre province ; l'estimation est affichée au moment du paiement, avant de payer. Vous recevrez un numéro de suivi par courriel dès que votre colis sera en route.",
    },
    {
      q: "Combien coûte la livraison ?",
      a: "Livraison à tarif fixe partout au Canada, et gratuite pour toute commande de {free} et plus. Le montant exact est affiché au moment du paiement.",
    },
    {
      q: "Livrez-vous à l'extérieur du Canada ?",
      a: "Pas encore. Au Canada seulement pour l'instant.",
    },
    {
      q: "Puis-je retourner un appareil ?",
      a: "Oui. Les appareils inutilisés, dans leur emballage d'origine, peuvent être retournés dans les 30 jours suivant la livraison. Les articles d'hygiène comme les rouleaux de glace doivent être non ouverts. Écrivez-nous avec votre numéro de commande et on vous enverra les instructions de retour. Les frais de retour sont à votre charge, sauf si l'article est arrivé défectueux.",
    },
    {
      q: "Est-ce que ce sont des dispositifs médicaux ?",
      a: "Non. Les outils CMAC sont des appareils cosmétiques de bien-être à usage domestique. Ils ne sont pas destinés à diagnostiquer, traiter, guérir ou prévenir quelque condition que ce soit. Si vous êtes enceinte, portez un stimulateur cardiaque ou un dispositif électronique implanté, souffrez d'épilepsie ou d'une affection cutanée active, ou êtes sous suivi médical, consultez votre médecin avant l'utilisation.",
    },
    {
      q: "À quelle fréquence les utiliser ?",
      a: "Commencez par trois séances par semaine et observez la réaction de votre peau. Chaque page produit contient une carte de routine avec les durées.",
    },
    {
      q: "Y a-t-il une garantie ?",
      a: "Chaque appareil est couvert contre les défauts de fabrication pendant 12 mois à compter de la livraison. Envoyez-nous votre numéro de commande et une photo ou une courte vidéo du problème.",
    },
    {
      q: "Puis-je utiliser plusieurs appareils dans une même séance ?",
      a: "Oui. L'ordre qu'on suggère : Rafraîchir, Lifter, Illuminer — le rouleau de glace d'abord, puis l'appareil microcourant ou le rouleau EMS, puis le masque LED, puis l'hydratant.",
    },
  ],
};

export function faqItems(locale: Locale, free: string): FaqItem[] {
  return FAQ[locale].map((i) => ({ q: i.q, a: i.a.replace("{free}", free) }));
}

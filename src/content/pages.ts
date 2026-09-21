import type { Locale } from "@/i18n/messages";
import { BRAND, POLICY, SHIPPING } from "@/lib/brand";

/**
 * Long-form page copy (About, Shipping & Returns, Privacy, Terms, Refund).
 * Plain structured text, bilingual. Legal pages are sensible generic policies
 * for a Québec/Canada online shop — not legal advice; owner should review.
 */
export type Block = { h?: string; p?: string[]; ul?: string[] };
export type PageContent = { title: string; lead?: string; blocks: Block[]; updated?: string };

const FREE = { en: `$${SHIPPING.freeThresholdCents / 100} CAD`, fr: `${SHIPPING.freeThresholdCents / 100} $ CA` };
const FLAT = { en: `$${(SHIPPING.flatCents / 100).toFixed(2)} CAD`, fr: `${(SHIPPING.flatCents / 100).toFixed(2).replace(".", ",")} $ CA` };
const LAST_UPDATED = { en: "Last updated: September 2026", fr: "Dernière mise à jour : septembre 2026" };

export const PAGES: Record<string, Record<Locale, PageContent>> = {
  about: {
    en: {
      title: "We test the boring stuff so you don't have to.",
      blocks: [
        {
          p: [
            "CMAC Beauty started in Montréal with a simple frustration: clinic facials cost more than a weekend away, and most \"at-home\" devices sold online are a gamble. Reviews are fake, specs are copied, and nobody tells you how to actually use the thing.",
            "So we pick a small number of tools, order them ourselves, use them for weeks, and only list the ones we'd give to a friend. Every device ships with a plain-language routine card. No 40-step rituals, no miracle claims.",
          ],
        },
        {
          h: "What we believe",
          ul: [
            "Ten honest minutes beat an hour of guesswork.",
            "A device you'll actually use beats one that's technically better.",
            "If we wouldn't say it to your face, we don't put it on the label.",
          ],
        },
        {
          h: "Where we are",
          p: [
            `We're based in the ${BRAND.area} area and ship across Canada. Questions, feedback or a device that isn't behaving? Write to us from the Contact page and a person answers.`,
          ],
        },
      ],
    },
    fr: {
      title: "On teste les affaires plates pour que vous n'ayez pas à le faire.",
      blocks: [
        {
          p: [
            "CMAC Beauty est né à Montréal d'une frustration toute simple : un soin en clinique coûte plus cher qu'une fin de semaine à l'extérieur, et la plupart des appareils « à domicile » vendus en ligne sont une loterie. Les avis sont faux, les fiches techniques sont copiées, et personne ne vous explique comment vraiment vous en servir.",
            "Alors on choisit un petit nombre d'outils, on les commande nous-mêmes, on les utilise pendant des semaines, et on ne garde que ceux qu'on offrirait à une amie. Chaque appareil est livré avec une carte de routine en langage clair. Pas de rituel en 40 étapes, pas de promesses miracles.",
          ],
        },
        {
          h: "Ce en quoi on croit",
          ul: [
            "Dix minutes honnêtes valent mieux qu'une heure de devinettes.",
            "Un appareil que vous utiliserez vraiment vaut mieux qu'un appareil techniquement supérieur.",
            "Si on ne vous le dirait pas en face, on ne l'écrit pas sur l'étiquette.",
          ],
        },
        {
          h: "Où nous trouver",
          p: [
            `On est établis dans la région de ${BRAND.areaFr} et on livre partout au Canada. Une question, un commentaire, un appareil qui fait des siennes ? Écrivez-nous via la page Contact, et c'est une vraie personne qui répond.`,
          ],
        },
      ],
    },
  },

  "shipping-returns": {
    en: {
      title: "Shipping & Returns",
      blocks: [
        {
          h: "Shipping",
          ul: [
            "We ship to all Canadian provinces and territories. Canada only for now.",
            `Orders are processed within ${SHIPPING.processingDays.min} to ${SHIPPING.processingDays.max} business days.`,
            `After processing, delivery takes ${SHIPPING.deliveryBusinessDays.min} to ${SHIPPING.deliveryBusinessDays.max} business days (about ${SHIPPING.deliveryWeeks.min} to ${SHIPPING.deliveryWeeks.max} weeks) depending on the item and your province. The estimate is shown at checkout before you pay.`,
            `Shipping is a flat ${FLAT.en}. Orders of ${FREE.en} or more ship free.`,
            "A tracking number is emailed when your parcel ships.",
          ],
        },
        {
          h: "Returns",
          ul: [
            `${POLICY.returnDays} days from delivery for unused devices in original packaging.`,
            "Hygiene items (ice rollers, gel, anything that touches skin directly) must be unopened.",
            "Contact us with your order number before sending anything back.",
            `Refunds are issued to the original payment method within ${POLICY.refundProcessingDays} business days of receiving the return.`,
            "Return shipping is your responsibility unless the item arrived damaged or defective, in which case we cover it.",
          ],
        },
        {
          h: "Damaged or defective on arrival",
          p: [
            `Email us within ${POLICY.damageReportDays} days of delivery with your order number and a photo. We'll replace or refund, your choice.`,
          ],
        },
        {
          h: "Warranty",
          p: [
            `Every device is covered against manufacturing defects for ${POLICY.warrantyMonths} months from delivery. Send us your order number and a photo or short video of the problem.`,
          ],
        },
      ],
    },
    fr: {
      title: "Livraison et retours",
      blocks: [
        {
          h: "Livraison",
          ul: [
            "On livre dans toutes les provinces et tous les territoires du Canada. Au Canada seulement pour l'instant.",
            `Les commandes sont traitées en ${SHIPPING.processingDays.min} à ${SHIPPING.processingDays.max} jours ouvrables.`,
            `Après le traitement, la livraison prend de ${SHIPPING.deliveryBusinessDays.min} à ${SHIPPING.deliveryBusinessDays.max} jours ouvrables (environ ${SHIPPING.deliveryWeeks.min} à ${SHIPPING.deliveryWeeks.max} semaines) selon l'article et votre province. L'estimation est affichée au moment du paiement.`,
            `Frais de livraison fixes de ${FLAT.fr}. Livraison gratuite pour toute commande de ${FREE.fr} et plus.`,
            "Un numéro de suivi vous est envoyé par courriel dès l'expédition.",
          ],
        },
        {
          h: "Retours",
          ul: [
            `${POLICY.returnDays} jours à compter de la livraison pour les appareils inutilisés dans leur emballage d'origine.`,
            "Les articles d'hygiène (rouleaux de glace, gel, tout ce qui touche directement la peau) doivent être non ouverts.",
            "Écrivez-nous avec votre numéro de commande avant de retourner quoi que ce soit.",
            `Les remboursements sont effectués sur le mode de paiement d'origine dans les ${POLICY.refundProcessingDays} jours ouvrables suivant la réception du retour.`,
            "Les frais de retour sont à votre charge, sauf si l'article est arrivé endommagé ou défectueux ; dans ce cas, on les assume.",
          ],
        },
        {
          h: "Endommagé ou défectueux à l'arrivée",
          p: [
            `Écrivez-nous dans les ${POLICY.damageReportDays} jours suivant la livraison avec votre numéro de commande et une photo. On remplace ou on rembourse, à votre choix.`,
          ],
        },
        {
          h: "Garantie",
          p: [
            `Chaque appareil est couvert contre les défauts de fabrication pendant ${POLICY.warrantyMonths} mois à compter de la livraison. Envoyez-nous votre numéro de commande et une photo ou une courte vidéo du problème.`,
          ],
        },
      ],
    },
  },

  "refund-policy": {
    en: {
      title: "Refund policy",
      updated: LAST_UPDATED.en,
      blocks: [
        {
          h: "Eligibility",
          ul: [
            `You may request a return within ${POLICY.returnDays} days of delivery.`,
            "Devices must be unused, in their original packaging with all accessories and documentation.",
            "Hygiene items (ice rollers, conductive gel, or anything applied directly to skin) are only accepted if unopened and sealed.",
            "Items marked final sale are not returnable.",
          ],
        },
        {
          h: "How to start a return",
          p: [
            `Email ${BRAND.email} with your order reference and the reason for the return. We reply with instructions and the return address. Items sent back without contacting us first may be delayed or refused.`,
          ],
        },
        {
          h: "Refunds",
          ul: [
            `Once we receive and inspect the item, the refund is issued to the original payment method within ${POLICY.refundProcessingDays} business days. Your bank may take a few more days to post it.`,
            "Original shipping charges are not refunded unless the item arrived damaged or defective.",
            "Return shipping is at your cost unless the item arrived damaged or defective.",
          ],
        },
        {
          h: "Damaged, defective or wrong item",
          p: [
            `Contact us within ${POLICY.damageReportDays} days of delivery with a photo. We replace the item or refund it in full, including shipping, at your choice.`,
          ],
        },
        {
          h: "Warranty claims",
          p: [
            `Manufacturing defects are covered for ${POLICY.warrantyMonths} months from delivery. Warranty claims are handled as a replacement or refund after we review a photo or short video of the issue. Normal wear, damage from misuse, water damage on non-waterproof devices, and cosmetic scratches are not covered.`,
          ],
        },
        {
          h: "Cancellations",
          p: [
            "Orders can be cancelled for a full refund as long as they have not been handed to the carrier. After that, the return process above applies.",
          ],
        },
        {
          h: "Consumer rights",
          p: [
            "Nothing in this policy limits the rights you have under the Québec Consumer Protection Act or other applicable Canadian consumer laws.",
          ],
        },
      ],
    },
    fr: {
      title: "Politique de remboursement",
      updated: LAST_UPDATED.fr,
      blocks: [
        {
          h: "Admissibilité",
          ul: [
            `Vous pouvez demander un retour dans les ${POLICY.returnDays} jours suivant la livraison.`,
            "Les appareils doivent être inutilisés, dans leur emballage d'origine, avec tous les accessoires et la documentation.",
            "Les articles d'hygiène (rouleaux de glace, gel conducteur, ou tout produit appliqué directement sur la peau) ne sont acceptés que s'ils sont non ouverts et scellés.",
            "Les articles identifiés « vente finale » ne sont pas retournables.",
          ],
        },
        {
          h: "Comment démarrer un retour",
          p: [
            `Écrivez à ${BRAND.email} avec votre référence de commande et la raison du retour. On vous répond avec les instructions et l'adresse de retour. Les articles retournés sans nous avoir contactés au préalable peuvent être retardés ou refusés.`,
          ],
        },
        {
          h: "Remboursements",
          ul: [
            `Une fois l'article reçu et inspecté, le remboursement est effectué sur le mode de paiement d'origine dans les ${POLICY.refundProcessingDays} jours ouvrables. Votre institution financière peut prendre quelques jours de plus pour l'afficher.`,
            "Les frais de livraison initiaux ne sont pas remboursés, sauf si l'article est arrivé endommagé ou défectueux.",
            "Les frais de retour sont à votre charge, sauf si l'article est arrivé endommagé ou défectueux.",
          ],
        },
        {
          h: "Article endommagé, défectueux ou erroné",
          p: [
            `Contactez-nous dans les ${POLICY.damageReportDays} jours suivant la livraison avec une photo. On remplace l'article ou on le rembourse en entier, livraison incluse, à votre choix.`,
          ],
        },
        {
          h: "Réclamations sous garantie",
          p: [
            `Les défauts de fabrication sont couverts pendant ${POLICY.warrantyMonths} mois à compter de la livraison. Les réclamations sont traitées par remplacement ou remboursement après examen d'une photo ou d'une courte vidéo du problème. L'usure normale, les dommages causés par une mauvaise utilisation, les dégâts d'eau sur les appareils non étanches et les égratignures esthétiques ne sont pas couverts.`,
          ],
        },
        {
          h: "Annulations",
          p: [
            "Une commande peut être annulée pour un remboursement complet tant qu'elle n'a pas été remise au transporteur. Après cela, le processus de retour ci-dessus s'applique.",
          ],
        },
        {
          h: "Droits des consommateurs",
          p: [
            "Rien dans cette politique ne limite les droits que vous confère la Loi sur la protection du consommateur du Québec ou toute autre loi canadienne applicable en matière de consommation.",
          ],
        },
      ],
    },
  },

  privacy: {
    en: {
      title: "Privacy policy",
      updated: LAST_UPDATED.en,
      lead: `${BRAND.name} ("we", "us") operates ${BRAND.domain}. This policy explains what personal information we collect, why, and how you can reach us about it. We follow Québec's Act respecting the protection of personal information in the private sector (Law 25) and Canada's PIPEDA.`,
      blocks: [
        {
          h: "What we collect",
          ul: [
            "Order information: name, email, shipping address, phone number (if provided), and the items you buy.",
            "Payment: handled entirely by Stripe. We never see or store your full card number.",
            "Newsletter: your email address and preferred language, if you subscribe.",
            "Contact form: your name, email and message.",
            "Technical data: standard server logs (IP address, browser, pages visited) needed to run and secure the site. We do not use advertising trackers.",
          ],
        },
        {
          h: "Why we use it",
          ul: [
            "To process and ship your order, send order confirmations and tracking updates, and handle returns or warranty claims.",
            "To answer your messages.",
            "To send newsletter emails you signed up for. You can unsubscribe at any time using the link in each email or by writing to us.",
            "To keep the site secure and comply with tax and accounting obligations.",
          ],
        },
        {
          h: "Who we share it with",
          p: [
            "Only the service providers needed to run the store: Stripe (payments), our fulfilment partner and carriers (shipping — they receive your name, address and phone number), our email provider (transactional emails), and our hosting and database providers. Some of these providers store data outside Québec and Canada, including in the United States and China (for fulfilment). We do not sell your personal information.",
          ],
        },
        {
          h: "Cookies",
          p: [
            "We use a language-preference cookie, a session cookie for the admin area, and your browser's local storage to remember your cart. No third-party advertising cookies.",
          ],
        },
        {
          h: "How long we keep it",
          p: [
            "Order records are kept for as long as required by Canadian tax law (generally seven years). Newsletter emails are kept until you unsubscribe. Contact messages are deleted once resolved, within twelve months.",
          ],
        },
        {
          h: "Your rights",
          p: [
            `You can ask to access, correct or delete your personal information, or withdraw consent to the newsletter, by emailing ${BRAND.email}. We respond within 30 days. The person responsible for the protection of personal information at ${BRAND.name} can be reached at the same address.`,
          ],
        },
        {
          h: "Changes",
          p: ["We may update this policy from time to time. The date at the top tells you when it was last revised."],
        },
      ],
    },
    fr: {
      title: "Politique de confidentialité",
      updated: LAST_UPDATED.fr,
      lead: `${BRAND.name} (« nous ») exploite le site ${BRAND.domain}. Cette politique explique quels renseignements personnels nous recueillons, pourquoi, et comment nous joindre à ce sujet. Nous respectons la Loi sur la protection des renseignements personnels dans le secteur privé du Québec (Loi 25) et la LPRPDE canadienne.`,
      blocks: [
        {
          h: "Ce que nous recueillons",
          ul: [
            "Renseignements de commande : nom, courriel, adresse de livraison, numéro de téléphone (si fourni) et les articles achetés.",
            "Paiement : traité entièrement par Stripe. Nous ne voyons ni ne conservons jamais votre numéro de carte complet.",
            "Infolettre : votre adresse courriel et votre langue préférée, si vous vous abonnez.",
            "Formulaire de contact : votre nom, votre courriel et votre message.",
            "Données techniques : journaux de serveur standards (adresse IP, navigateur, pages visitées) nécessaires au fonctionnement et à la sécurité du site. Nous n'utilisons pas de traceurs publicitaires.",
          ],
        },
        {
          h: "Pourquoi nous les utilisons",
          ul: [
            "Pour traiter et expédier votre commande, envoyer les confirmations et les mises à jour de suivi, et gérer les retours ou les réclamations sous garantie.",
            "Pour répondre à vos messages.",
            "Pour vous envoyer l'infolettre à laquelle vous vous êtes abonné. Vous pouvez vous désabonner en tout temps via le lien dans chaque courriel ou en nous écrivant.",
            "Pour assurer la sécurité du site et respecter nos obligations fiscales et comptables.",
          ],
        },
        {
          h: "Avec qui nous les partageons",
          p: [
            "Uniquement avec les fournisseurs nécessaires au fonctionnement de la boutique : Stripe (paiements), notre partenaire d'exécution des commandes et les transporteurs (livraison — ils reçoivent votre nom, votre adresse et votre numéro de téléphone), notre fournisseur de courriels (courriels transactionnels), ainsi que nos fournisseurs d'hébergement et de base de données. Certains de ces fournisseurs conservent des données à l'extérieur du Québec et du Canada, notamment aux États-Unis et en Chine (pour l'exécution des commandes). Nous ne vendons pas vos renseignements personnels.",
          ],
        },
        {
          h: "Témoins (cookies)",
          p: [
            "Nous utilisons un témoin pour votre préférence de langue, un témoin de session pour l'espace d'administration, et le stockage local de votre navigateur pour mémoriser votre panier. Aucun témoin publicitaire tiers.",
          ],
        },
        {
          h: "Durée de conservation",
          p: [
            "Les dossiers de commande sont conservés aussi longtemps que l'exige la législation fiscale canadienne (généralement sept ans). Les courriels de l'infolettre sont conservés jusqu'à votre désabonnement. Les messages de contact sont supprimés une fois résolus, dans un délai de douze mois.",
          ],
        },
        {
          h: "Vos droits",
          p: [
            `Vous pouvez demander l'accès à vos renseignements personnels, leur rectification ou leur suppression, ou retirer votre consentement à l'infolettre, en écrivant à ${BRAND.email}. Nous répondons dans un délai de 30 jours. La personne responsable de la protection des renseignements personnels chez ${BRAND.name} peut être jointe à la même adresse.`,
          ],
        },
        {
          h: "Modifications",
          p: ["Nous pouvons mettre à jour cette politique de temps à autre. La date en haut de page indique la dernière révision."],
        },
      ],
    },
  },

  terms: {
    en: {
      title: "Terms of service",
      updated: LAST_UPDATED.en,
      lead: `These terms apply to every purchase made on ${BRAND.domain}, operated by ${BRAND.name}, ${BRAND.area}. By placing an order you agree to them.`,
      blocks: [
        {
          h: "Products",
          p: [
            "CMAC devices are cosmetic, at-home tools intended to improve the appearance of skin. They are not medical devices and are not intended to diagnose, treat, cure or prevent any disease or condition. Read the \"Good to know\" list on each product page before first use, and consult a doctor if you are pregnant, have a pacemaker or implanted electronic device, epilepsy, an active skin condition, or are under medical care.",
          ],
        },
        {
          h: "Orders and payment",
          ul: [
            "Prices are in Canadian dollars. Applicable taxes are shown at checkout.",
            "Payment is processed by Stripe. Your order is confirmed once payment succeeds; you'll receive an email confirmation.",
            "We may cancel an order if an item becomes unavailable, if we suspect fraud, or if there was an obvious pricing error. You'll be refunded in full.",
          ],
        },
        {
          h: "Shipping",
          p: [
            "We ship within Canada only. Processing and delivery estimates are shown on the Shipping & Returns page and at checkout. Delivery dates are estimates, not guarantees. Risk of loss passes to you on delivery.",
          ],
        },
        {
          h: "Returns and warranty",
          p: ["See our Refund policy for return eligibility, the 12-month defect coverage, and how to make a claim."],
        },
        {
          h: "Use of the site",
          p: [
            "You agree not to misuse the site, attempt to access accounts or data that aren't yours, or scrape content. All text, images and design on this site belong to CMAC Beauty or its licensors.",
          ],
        },
        {
          h: "Limitation of liability",
          p: [
            "To the extent permitted by law, CMAC Beauty's liability for any claim related to a purchase is limited to the amount you paid for the product. Nothing in these terms limits the legal warranties or rights you have under the Québec Consumer Protection Act, the Civil Code of Québec, or other applicable Canadian law.",
          ],
        },
        {
          h: "Language",
          p: [
            "These terms are available in French and English. Both versions are offered for convenience; in the event of a discrepancy, the French version prevails for consumers in Québec.",
          ],
        },
        {
          h: "Governing law and contact",
          p: [
            `These terms are governed by the laws of Québec and the applicable federal laws of Canada. Questions: ${BRAND.email}.`,
          ],
        },
      ],
    },
    fr: {
      title: "Conditions d'utilisation",
      updated: LAST_UPDATED.fr,
      lead: `Ces conditions s'appliquent à tout achat effectué sur ${BRAND.domain}, exploité par ${BRAND.name}, ${BRAND.areaFr}. En passant une commande, vous les acceptez.`,
      blocks: [
        {
          h: "Produits",
          p: [
            "Les appareils CMAC sont des outils cosmétiques à usage domestique destinés à améliorer l'apparence de la peau. Ce ne sont pas des dispositifs médicaux et ils ne sont pas destinés à diagnostiquer, traiter, guérir ou prévenir quelque maladie ou condition que ce soit. Lisez la liste « Bon à savoir » de chaque page produit avant la première utilisation, et consultez un médecin si vous êtes enceinte, portez un stimulateur cardiaque ou un dispositif électronique implanté, souffrez d'épilepsie ou d'une affection cutanée active, ou êtes sous suivi médical.",
          ],
        },
        {
          h: "Commandes et paiement",
          ul: [
            "Les prix sont en dollars canadiens. Les taxes applicables sont affichées au moment du paiement.",
            "Le paiement est traité par Stripe. Votre commande est confirmée dès que le paiement est accepté ; vous recevrez une confirmation par courriel.",
            "Nous pouvons annuler une commande si un article devient indisponible, en cas de soupçon de fraude, ou en cas d'erreur de prix manifeste. Vous serez remboursé en entier.",
          ],
        },
        {
          h: "Livraison",
          p: [
            "Nous livrons au Canada seulement. Les délais de traitement et de livraison sont indiqués sur la page Livraison et retours ainsi qu'au moment du paiement. Les dates de livraison sont des estimations, pas des garanties. Le risque de perte vous est transféré à la livraison.",
          ],
        },
        {
          h: "Retours et garantie",
          p: ["Consultez notre Politique de remboursement pour l'admissibilité des retours, la garantie de 12 mois contre les défauts et la marche à suivre pour une réclamation."],
        },
        {
          h: "Utilisation du site",
          p: [
            "Vous vous engagez à ne pas faire un usage abusif du site, à ne pas tenter d'accéder à des comptes ou à des données qui ne sont pas les vôtres, et à ne pas en extraire le contenu. Tous les textes, images et éléments de design de ce site appartiennent à CMAC Beauty ou à ses concédants.",
          ],
        },
        {
          h: "Limitation de responsabilité",
          p: [
            "Dans la mesure permise par la loi, la responsabilité de CMAC Beauty pour toute réclamation liée à un achat est limitée au montant payé pour le produit. Rien dans ces conditions ne limite les garanties légales ni les droits que vous confèrent la Loi sur la protection du consommateur du Québec, le Code civil du Québec ou toute autre loi canadienne applicable.",
          ],
        },
        {
          h: "Langue",
          p: [
            "Ces conditions sont offertes en français et en anglais. Les deux versions sont fournies par commodité ; en cas de divergence, la version française prévaut pour les consommateurs du Québec.",
          ],
        },
        {
          h: "Droit applicable et contact",
          p: [
            `Ces conditions sont régies par les lois du Québec et les lois fédérales du Canada qui s'y appliquent. Questions : ${BRAND.email}.`,
          ],
        },
      ],
    },
  },
};

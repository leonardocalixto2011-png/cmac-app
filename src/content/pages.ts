import type { Locale } from "@/i18n/messages";
import { BRAND, POLICY, SHIPPING } from "@/lib/brand";

/**
 * Long-form page copy (About, Shipping & Returns, Privacy, Terms, Refund).
 * Plain structured text, bilingual. Legal pages are sensible generic policies
 * for a Québec/Canada online shop — not legal advice; owner should review.
 */
export type Block = { id?: string; h?: string; p?: string[]; ul?: string[] };
export type PageContent = { title: string; lead?: string; blocks: Block[]; updated?: string };

const FREE = { en: `$${SHIPPING.freeThresholdCents / 100} CAD`, fr: `${SHIPPING.freeThresholdCents / 100} $ CA` };
const FLAT = { en: `$${(SHIPPING.flatCents / 100).toFixed(2)} CAD`, fr: `${(SHIPPING.flatCents / 100).toFixed(2).replace(".", ",")} $ CA` };
const LAST_UPDATED = { en: "Last updated: September 2026", fr: "Dernière mise à jour : septembre 2026" };

export const PAGES: Record<string, Record<Locale, PageContent>> = {
  about: {
    en: {
      title: "We do the boring homework so you don't have to.",
      blocks: [
        {
          p: [
            "CMAC Beauty started in Montréal with a simple frustration: clinic facials cost more than a weekend away, and most \"at-home\" devices sold online are a gamble. Reviews are fake, specs are copied, and nobody tells you how to actually use the thing.",
            "So we keep the shelf small: a handful of tools with honest specs, clear instructions and a real-world price. Every order comes with a plain-language routine in your confirmation email, and if something disappoints you, you write to a person, not a bot. No 40-step rituals, no miracle claims.",
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
      title: "On fait les devoirs plates pour que vous n'ayez pas à les faire.",
      blocks: [
        {
          p: [
            "CMAC Beauty est né à Montréal d'une frustration toute simple : un soin en clinique coûte plus cher qu'une fin de semaine à l'extérieur, et la plupart des appareils « à domicile » vendus en ligne sont une loterie. Les avis sont faux, les fiches techniques sont copiées, et personne ne vous explique comment vraiment vous en servir.",
            "Alors on garde une petite sélection : quelques outils aux fiches honnêtes, aux instructions claires et au juste prix. Chaque commande est accompagnée d'une routine en langage clair dans votre courriel de confirmation, et si quelque chose vous déçoit, c'est une vraie personne qui vous répond, pas un robot. Pas de rituel en 40 étapes, pas de promesses miracles.",
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
            `After processing, delivery takes ${SHIPPING.deliveryBusinessDays.min} to ${SHIPPING.deliveryBusinessDays.max} business days (about ${SHIPPING.deliveryWeeks.min} to ${SHIPPING.deliveryWeeks.max} weeks) depending on the item and your province. In total, plan on about ${SHIPPING.totalWeeks.min} to ${SHIPPING.totalWeeks.max} weeks from order to delivery. The estimate is shown at checkout before you pay.`,
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
            `Après le traitement, la livraison prend de ${SHIPPING.deliveryBusinessDays.min} à ${SHIPPING.deliveryBusinessDays.max} jours ouvrables (environ ${SHIPPING.deliveryWeeks.min} à ${SHIPPING.deliveryWeeks.max} semaines) selon l'article et votre province. Au total, comptez environ ${SHIPPING.totalWeeks.min} à ${SHIPPING.totalWeeks.max} semaines de la commande à la livraison. L'estimation est affichée au moment du paiement.`,
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
            "Customer account (Glow Club): name, email, password (stored only as a one-way hash), optional birthday (month and day, no year), preferred language, your orders, points history and reward codes.",
            "Newsletter: your email address, preferred language, and a record of your consent (date, where you signed up, the exact wording you agreed to, and when you confirmed or unsubscribed).",
            "Contact form: your name, email and message.",
            "Technical data: standard server logs (IP address, browser, pages visited) needed to run and secure the site. We do not use advertising trackers.",
          ],
        },
        {
          h: "Why we use it",
          ul: [
            "To process and ship your order, send order confirmations and tracking updates, and handle returns or warranty claims.",
            "To answer your messages.",
            "To run your account and the Glow Club: show your orders, count points, apply tier perks (such as free-shipping thresholds), create reward codes, and send your birthday reward if you gave us your birthday.",
            "To send newsletter emails you signed up for and confirmed (double opt-in). You can unsubscribe at any time in one click using the link in each email, from your account, or by writing to us.",
            "If you tick the email box in your cart and type your email but don't finish paying: one reminder email about that cart (only once, never if you unsubscribed).",
            "About three weeks after your order ships: one email inviting you to review what you bought. Reviews show your chosen display name, never your email. You can stop these requests with the link in the email.",
            "To keep the site secure (for example, limiting repeated sign-in attempts) and comply with tax and accounting obligations.",
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
            "We use a language-preference cookie, a sign-in session cookie (customer accounts and the admin area), and your browser's local storage to remember your cart and whether you've closed our newsletter offer. Advertising cookies (TikTok, Meta, Pinterest pixels), used to measure our ads and show relevant offers, load only if you click \"Accept all\" in the cookie banner. To change your choice, clear this site's data in your browser; the banner will ask again.",
          ],
        },
        {
          h: "How long we keep it",
          p: [
            "Order records are kept for seven years, as required by Canadian and Québec tax law. Accounts (with points and reward codes) are kept until you delete your account. Newsletter data is used until you unsubscribe; after that we keep only a minimal record (email, status and consent history) so we can prove consent and never email you again by mistake. Contact messages are deleted once resolved, within twelve months.",
            "When you delete your account, your login, profile, points and reward codes are erased right away. Your past orders stay in our accounting records for the rest of the seven-year period, but anonymised: the email is replaced by a one-way code and your name, street address and phone number are removed.",
          ],
        },
        {
          h: "Your rights",
          p: [
            "You have the right to access your personal information, to have it corrected, to have it deleted, to withdraw your consent, and to receive the information you gave us in a structured, commonly used technological format (portability).",
            "You can see and correct your details yourself in My account → Profile & settings, unsubscribe from the newsletter there or in one click from any email, and delete your account from the same page. For anything else — including a copy of your data — email us; we respond within 30 days.",
          ],
        },
        {
          h: "Person in charge of the protection of personal information",
          p: [
            `Leonart Calixte, owner — ${BRAND.name}, 209 rue Paré, L'Assomption, QC J5W 0K5, Canada — ${BRAND.email}. Write to this address for any question, request or complaint about your personal information.`,
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
            "Compte client (Glow Club) : nom, courriel, mot de passe (conservé uniquement sous forme chiffrée à sens unique), date d'anniversaire facultative (mois et jour, sans l'année), langue préférée, vos commandes, l'historique de vos points et vos codes de récompense.",
            "Infolettre : votre adresse courriel, votre langue préférée et une preuve de votre consentement (date, endroit de l'inscription, formulation exacte acceptée, et date de confirmation ou de désabonnement).",
            "Formulaire de contact : votre nom, votre courriel et votre message.",
            "Données techniques : journaux de serveur standards (adresse IP, navigateur, pages visitées) nécessaires au fonctionnement et à la sécurité du site. Nous n'utilisons pas de traceurs publicitaires.",
          ],
        },
        {
          h: "Pourquoi nous les utilisons",
          ul: [
            "Pour traiter et expédier votre commande, envoyer les confirmations et les mises à jour de suivi, et gérer les retours ou les réclamations sous garantie.",
            "Pour répondre à vos messages.",
            "Pour gérer votre compte et le Glow Club : afficher vos commandes, calculer vos points, appliquer les avantages de votre niveau (comme les seuils de livraison gratuite), créer vos codes de récompense et vous offrir votre récompense d'anniversaire si vous nous avez donné cette date.",
            "Pour vous envoyer l'infolettre à laquelle vous vous êtes abonné·e et que vous avez confirmée (double confirmation). Vous pouvez vous désabonner en tout temps, en un clic, avec le lien de chaque courriel, depuis votre compte ou en nous écrivant.",
            "Si vous cochez la case des courriels dans votre panier et entrez votre courriel sans terminer le paiement : un seul courriel de rappel pour ce panier (jamais si vous vous êtes désabonné·e).",
            "Environ trois semaines après l'expédition : un courriel vous invitant à donner votre avis sur vos achats. Les avis affichent le nom que vous choisissez, jamais votre courriel. Vous pouvez arrêter ces demandes avec le lien du courriel.",
            "Pour assurer la sécurité du site (par exemple, limiter les tentatives de connexion répétées) et respecter nos obligations fiscales et comptables.",
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
            "Nous utilisons un témoin pour votre préférence de langue, un témoin de session de connexion (comptes clients et espace d'administration), et le stockage local de votre navigateur pour mémoriser votre panier et le fait que vous avez fermé notre offre d'infolettre. Les témoins publicitaires (pixels TikTok, Meta et Pinterest), qui servent à mesurer nos publicités et à vous montrer des offres pertinentes, ne se chargent que si vous cliquez sur « Tout accepter » dans la bannière. Pour changer d'avis, effacez les données de ce site dans votre navigateur : la bannière vous redemandera.",
          ],
        },
        {
          h: "Durée de conservation",
          p: [
            "Les dossiers de commande sont conservés sept ans, comme l'exigent les lois fiscales du Canada et du Québec. Les comptes (avec les points et les codes de récompense) sont conservés jusqu'à ce que vous supprimiez votre compte. Les données de l'infolettre sont utilisées jusqu'à votre désabonnement ; ensuite, nous ne gardons qu'un dossier minimal (courriel, statut et historique du consentement) pour pouvoir prouver le consentement et ne jamais vous écrire de nouveau par erreur. Les messages de contact sont supprimés une fois résolus, dans un délai de douze mois.",
            "Quand vous supprimez votre compte, vos identifiants, votre profil, vos points et vos codes sont effacés immédiatement. Vos commandes passées restent dans nos dossiers comptables jusqu'à la fin de la période de sept ans, mais anonymisées : le courriel est remplacé par un code à sens unique et votre nom, votre adresse municipale et votre numéro de téléphone sont retirés.",
          ],
        },
        {
          h: "Vos droits",
          p: [
            "Vous avez le droit d'accéder à vos renseignements personnels, de les faire rectifier, de les faire supprimer, de retirer votre consentement et de recevoir les renseignements que vous nous avez fournis dans un format technologique structuré et couramment utilisé (portabilité).",
            "Vous pouvez consulter et corriger vos renseignements vous-même dans Mon compte → Profil et paramètres, vous désabonner de l'infolettre au même endroit ou en un clic depuis n'importe quel courriel, et supprimer votre compte depuis la même page. Pour toute autre demande — y compris une copie de vos données — écrivez-nous ; nous répondons dans un délai de 30 jours.",
          ],
        },
        {
          h: "Personne responsable de la protection des renseignements personnels",
          p: [
            `Leonart Calixte, propriétaire — ${BRAND.name}, 209 rue Paré, L'Assomption (Québec) J5W 0K5, Canada — ${BRAND.email}. Écrivez à cette adresse pour toute question, demande ou plainte concernant vos renseignements personnels.`,
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
          id: "glow-club",
          h: "Glow Club (free membership)",
          ul: [
            "The Glow Club is free. Creating a customer account makes you a member; deleting your account ends your membership.",
            "Points: 1 point per $1 of products paid (after discounts, excluding shipping and taxes), 1.25 points per $1 at the Radiance tier and 1.5 points per $1 at the Icon tier, rounded down. Points are added once payment is confirmed and removed if the order is refunded or cancelled.",
            "Tiers are based on what you spend on products as a member: Glow from joining, Radiance from $250, Icon from $600. Perks of a new tier apply from your next order. Refunds and cancellations count against your spend.",
            "Rewards: every 100 points can be exchanged in your account for a single-use code worth $10 (up to $100 per code). One code per order; a code can't be exchanged for cash, and any unused value on an order is lost.",
            "Birthday reward: if your profile has a birthday, you get a single-use 15% code in your birthday month, valid until the end of the following month.",
            "Points and codes have no cash value, can't be transferred or sold, and are deleted when you delete your account. Points don't expire while your account is open.",
            "We may change or end the program with 30 days' notice on this page; points already earned can still be redeemed during that period. Abuse (for example fake orders or multiple accounts) may lead to points being removed.",
          ],
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
          id: "glow-club",
          h: "Glow Club (adhésion gratuite)",
          ul: [
            "Le Glow Club est gratuit. La création d'un compte client fait de vous un membre ; la suppression de votre compte met fin à votre adhésion.",
            "Points : 1 point par dollar de produits payés (après rabais, livraison et taxes exclues), 1,25 point par dollar au niveau Radiance et 1,5 point par dollar au niveau Icon, arrondi à l'entier inférieur. Les points sont ajoutés une fois le paiement confirmé et retirés si la commande est remboursée ou annulée.",
            "Les niveaux dépendent de vos achats de produits en tant que membre : Glow dès l'adhésion, Radiance dès 250 $, Icon dès 600 $. Les avantages d'un nouveau niveau s'appliquent dès votre commande suivante. Les remboursements et annulations sont déduits de vos achats.",
            "Récompenses : chaque tranche de 100 points peut être échangée dans votre compte contre un code à usage unique de 10 $ (jusqu'à 100 $ par code). Un code par commande ; un code ne peut pas être échangé contre de l'argent et toute valeur non utilisée sur une commande est perdue.",
            "Récompense d'anniversaire : si votre profil contient une date d'anniversaire, vous recevez un code à usage unique de 15 % durant le mois de votre anniversaire, valide jusqu'à la fin du mois suivant.",
            "Les points et les codes n'ont aucune valeur monétaire, ne peuvent être ni transférés ni vendus, et sont supprimés si vous supprimez votre compte. Les points n'expirent pas tant que votre compte est ouvert.",
            "Nous pouvons modifier ou mettre fin au programme avec un préavis de 30 jours sur cette page ; les points déjà obtenus peuvent être échangés pendant cette période. Un usage abusif (par exemple de fausses commandes ou plusieurs comptes) peut entraîner le retrait des points.",
          ],
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

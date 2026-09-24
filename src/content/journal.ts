import type { Locale } from "@/i18n/messages";
import { POLICY, SHIPPING } from "@/lib/brand";

/**
 * Journal: buying guides written to be quotable. Each article opens with a
 * direct answer (what assistants and search engines lift), then the detail,
 * then real FAQs. Rules: appearance-only claims (Health Canada), no invented
 * statistics, no competitor bashing, prices always marked "as of" a date so
 * they can be corrected instead of silently going stale.
 */
export type Block =
  | { h?: string; p?: string[]; ul?: string[] }
  | { h?: string; table: { head: string[]; rows: string[][] } };

export type Article = {
  slug: string;
  updated: string; // ISO date
  title: string;
  /** One-sentence answer, shown in a highlighted box and used as the meta description. */
  answer: string;
  intro: string;
  blocks: Block[];
  faq: { q: string; a: string }[];
  /** Product slugs linked at the end. */
  related: string[];
};

const FREE_EN = `$${SHIPPING.freeThresholdCents / 100} CAD`;
const FREE_FR = `${SHIPPING.freeThresholdCents / 100} $ CA`;

export const JOURNAL: Record<Locale, Article[]> = {
  en: [
    {
      slug: "when-to-order-christmas-gifts-canada",
      updated: "2026-09-24",
      title: "When to order beauty gifts in Canada so they arrive before Christmas",
      answer:
        "For a shop that ships from an overseas warehouse, order by late November. At CMAC Beauty the last safe date is shown on the homepage banner and is calculated from our longest estimate (3–5 business days of processing plus 7–15 business days in transit, about 2–4 weeks in total).",
      intro:
        "Every December, the same thing happens: the gift was perfect, the delivery was late. Here is how to work backwards from December 24 instead of hoping.",
      blocks: [
        {
          h: "Count backwards, not forwards",
          table: {
            head: ["Where it ships from", "Realistic transit", "Order by"],
            rows: [
              ["Overseas warehouse (most online beauty tools, including ours)", "2–4 weeks door to door", "Late November"],
              ["Canadian warehouse, standard post", "3–8 business days", "Around December 12–15"],
              ["Canadian warehouse, express", "1–3 business days", "Around December 19–20"],
            ],
          },
        },
        {
          h: "Three traps",
          ul: [
            "\"Ships in 24 h\" is not \"arrives in 24 h\". Processing and transit are two different clocks; a shop that shows only one is hiding the other.",
            "Peak season slows everything: carriers add days in the first half of December, and customs adds unpredictable ones.",
            "A shop with no visible deadline has decided the problem is yours. Ours is on the homepage from the fall, and it disappears by itself once it has passed.",
          ],
        },
        {
          h: "If you ordered too late",
          p: [
            "Print the order confirmation and put it in the card. It is not elegant, but it beats an empty box and an awkward silence. Most people are fine with \"it's on its way\" when they can see what is coming.",
          ],
        },
      ],
      faq: [
        { q: "What is CMAC's exact Christmas deadline?", a: "It is shown in the banner at the top of cmacbeauty.ca during the fall, calculated from our longest delivery estimate. In 2026 it falls in the last week of November." },
        { q: "Can I pay for faster shipping?", a: "No. We offer one shipping speed and we say so plainly, rather than selling an express option we cannot guarantee from an overseas warehouse." },
        { q: "What if it arrives damaged?", a: "Write to us within 7 days with a photo and we replace it or refund it. Our phone number and address are on the Contact page." },
      ],
      related: ["set-fall-basket", "set-bestie-duo", "set-pink-pop", "set-7am-reset"],
    },
    {
      slug: "led-mask-canada-price-guide",
      updated: "2026-09-22",
      title: "At-home LED masks in Canada: what you actually get at each price",
      answer:
        "In Canada, at-home red-light masks sell for roughly $60 to $500. Under $100 you get a flexible silicone or hard-shell mask with red light and a timer; above $300 you mostly pay for more LEDs, a clinical-looking finish, an app and a longer warranty.",
      intro:
        "Prices for at-home LED masks look random until you line up what changes between them. Here is the honest version, written by a small Québec shop that sells one of them.",
      blocks: [
        {
          h: "What changes with price",
          table: {
            head: ["Price band (CAD)", "Typically includes", "What you give up"],
            rows: [
              ["$50–$100", "Red light, 10-minute timer, rechargeable, eye protection, flexible or rigid shell", "Fewer LEDs, no app, shorter warranty, no clinical testing published"],
              ["$100–$300", "More LEDs, several light colours, sometimes neck attachment", "Still rarely any published testing on the exact model"],
              ["$300+", "High LED count, medical-grade certifications in some markets, app, 1–2 year warranty, brand support", "Price. Comfort and habit matter more than specs for most people"],
            ],
          },
        },
        {
          h: "The part nobody advertises",
          p: [
            "The mask you use four nights a week beats the better mask you use twice a month. Weight, strap comfort and session length decide that, not the LED count.",
            "Canadian rules matter here: a device sold with claims about treating a skin condition becomes a medical device and needs a licence. Devices sold as cosmetic tools, like ours, are described in terms of appearance only. If a listing promises to cure acne, that's a red flag about the seller, not a feature.",
          ],
        },
        {
          h: "How to choose in two minutes",
          ul: [
            "Decide your realistic weekly slot first: 10 minutes, four nights, while reading? Pick the lightest mask you can find.",
            "Check the warranty and who answers when it breaks. A one-line Amazon listing with no seller name is a gamble.",
            "Ignore before/after photos entirely: they are lighting, makeup and angle. Canadian advertising rules don't allow them to be used as proof, and honest shops don't use them.",
            "Confirm the shipping estimate before you pay, especially for gifts.",
          ],
        },
      ],
      faq: [
        {
          q: "Is a $60 LED mask a scam?",
          a: "Not necessarily. At that price you should expect a simple red-light mask with a timer and a rechargeable battery, sold as a cosmetic tool. What you should not expect is published clinical testing on that exact model, or medical claims of any kind.",
        },
        {
          q: "How often should I use one?",
          a: "Most at-home masks are designed for about 10 minutes, three to four times a week. More is not better; consistency is what people notice.",
        },
        {
          q: "Who should avoid LED masks?",
          a: "Anyone who is pregnant, photosensitive, taking light-sensitizing medication, or dealing with an active skin condition should ask their doctor first. Keep your eyes closed during use.",
        },
      ],
      related: ["led-red-light-mask", "set-midnight-glow"],
    },
    {
      slug: "puffy-face-tools-compared",
      updated: "2026-09-22",
      title: "Ice roller, gua sha or microcurrent: which one for a puffy-looking morning?",
      answer:
        "For a face that looks puffy in the morning, a cooling tool (ice roller) is the cheapest and fastest option, an electronic gua sha adds warmth and vibration for a longer massage, and a microcurrent device is aimed at a lifted look rather than morning puffiness.",
      intro: "Three tools, three jobs. Here is what each one is for, what it costs in Canada, and when it is a waste of money.",
      blocks: [
        {
          h: "Side by side",
          table: {
            head: ["Tool", "Best for", "Time", "Typical price (CAD)"],
            rows: [
              ["Ice roller", "A fast cooling pass on a puffy-looking morning", "60 seconds", "$20–$35"],
              ["Electronic gua sha", "A longer, warm massage along the jaw and cheeks", "5 minutes", "$35–$60"],
              ["Microcurrent device", "A temporarily more lifted look, used regularly", "5–10 minutes", "$80–$400"],
            ],
          },
        },
        {
          h: "How to actually use them",
          ul: [
            "Ice roller: keep it in the freezer, roll from the nose outward and under the eyes. Never press hard, never leave it in one spot.",
            "Electronic gua sha: use a slip layer (gel or oil), glide along the jaw and up the cheek, never drag dry skin.",
            "Microcurrent: needs a water-based conductive gel, every session. No gel, no point.",
          ],
        },
        {
          h: "When to skip",
          p: [
            "Microcurrent devices are not for everyone: pacemakers, implanted electronic devices, epilepsy and pregnancy are standard contraindications. Ask your doctor if you are unsure.",
            "If your goal is a five-minute morning, a $300 device you won't charge is worse than a $27 roller you keep in the freezer door.",
          ],
        },
      ],
      faq: [
        { q: "Does any of this remove wrinkles?", a: "No. These are cosmetic tools. They change how skin looks temporarily: smoother, less puffy-looking, a bit more contoured. Anyone promising permanent changes is overselling." },
        { q: "How long do results last?", a: "Cooling effects last a couple of hours. Microcurrent results are described as temporary and fade over a day or two, which is why routines matter more than single sessions." },
        { q: "Which one for a gift?", a: "An ice roller or a small set: they need no learning curve, no gel and no charging." },
      ],
      related: ["facial-ice-roller", "electronic-gua-sha-massager", "microcurrent-facial-lift-device", "set-7am-reset"],
    },
    {
      slug: "beauty-gift-sets-canada-under-100",
      updated: "2026-09-22",
      title: "Beauty gift sets under $100 in Canada: what makes one actually good",
      answer:
        `A good beauty gift set under $100 has one clear moment (morning, night, travel), no products that need a specific skin type, and free shipping. At CMAC Beauty, sets in that range include the 7 AM Reset ($79.99), Carry-On Glow ($79.99) and the Bestie Glow Duo ($69.99); free shipping starts at ${FREE_EN}.`,
      intro:
        "Gift sets fail for boring reasons: too many products, the wrong shade, or a box that arrives after the party. Here is the checklist we use when we build ours.",
      blocks: [
        {
          h: "The five-point checklist",
          ul: [
            "One occasion, not five: a set that answers \"Sunday night\" or \"on the plane\" is easier to love than a random assortment.",
            "Nothing shade-based. Skip foundation, lipstick and anything that needs a skin-type match.",
            "Tools over liquids: cosmetics that touch the face raise allergy and regulation questions; a roller, a headband or a satin scrunchie don't.",
            "Check the delivery window before you buy. Most online gift disappointment is a shipping problem, not a product problem.",
            "Look for a real return policy in writing. Ours is " + POLICY.returnDays + " days on unused items, and hygiene items only if unopened.",
          ],
        },
        {
          h: "What we put under $100",
          table: {
            head: ["Set", "Price (CAD)", "For"],
            rows: [
              ["The 7 AM Reset", "$79.99", "Someone who gets ready in a hurry and wakes up puffy-looking"],
              ["Carry-On Glow", "$79.99", "A frequent flyer or a student going back and forth"],
              ["Bestie Glow Duo", "$69.99", "Two people: one set for you, one for your friend"],
              ["Between Appointments Kit", "$59.99", "Someone who gets her nails done and wants them neat in between"],
            ],
          },
        },
        {
          h: "Ordering in time",
          p: [
            `Plan about ${SHIPPING.totalWeeks.min} to ${SHIPPING.totalWeeks.max} weeks from order to delivery in Canada. For Christmas, that means ordering by late November; the exact date is shown on our homepage banner in the fall.`,
          ],
        },
      ],
      faq: [
        { q: "Is free shipping worth waiting for?", a: `Free shipping starts at ${FREE_EN}. Adding a $20 accessory to reach it usually costs less than paying flat-rate shipping, which is why the cart shows how much is missing.` },
        { q: "Can I get it gift-wrapped?", a: "Not yet. Sets arrive in the supplier's plain packaging, and we say so rather than promising a ribbon that isn't there." },
        { q: "What if she already owns one of the items?", a: "Pick a set built around a moment she doesn't have covered, or write to us: a person answers, and we can suggest a swap." },
      ],
      related: ["set-7am-reset", "set-carry-on-glow", "set-bestie-duo", "set-between-appointments"],
    },
  ],
  fr: [
    {
      slug: "when-to-order-christmas-gifts-canada",
      updated: "2026-09-24",
      title: "Quand commander ses cadeaux beauté au Canada pour les recevoir avant Noël",
      answer:
        "Pour une boutique qui expédie d'un entrepôt outre-mer, commandez d'ici la fin novembre. Chez CMAC Beauty, la date limite s'affiche dans la bannière de la page d'accueil et se calcule à partir de notre estimation la plus longue (3 à 5 jours ouvrables de préparation, puis 7 à 15 jours ouvrables de transport, soit environ 2 à 4 semaines).",
      intro:
        "Chaque décembre, la même histoire : le cadeau était parfait, la livraison était en retard. Voici comment calculer à rebours à partir du 24 décembre, au lieu d'espérer.",
      blocks: [
        {
          h: "Compter à rebours",
          table: {
            head: ["D'où part le colis", "Transport réaliste", "Commander d'ici"],
            rows: [
              ["Entrepôt outre-mer (la plupart des outils de beauté en ligne, dont les nôtres)", "2 à 4 semaines porte à porte", "Fin novembre"],
              ["Entrepôt canadien, poste régulière", "3 à 8 jours ouvrables", "Vers le 12 au 15 décembre"],
              ["Entrepôt canadien, express", "1 à 3 jours ouvrables", "Vers le 19 au 20 décembre"],
            ],
          },
        },
        {
          h: "Trois pièges",
          ul: [
            "« Expédié en 24 h » n'est pas « livré en 24 h ». La préparation et le transport sont deux horloges différentes ; une boutique qui n'en affiche qu'une cache l'autre.",
            "La haute saison ralentit tout : les transporteurs ajoutent des jours dans la première moitié de décembre, et la douane en ajoute d'imprévisibles.",
            "Une boutique sans date limite affichée a décidé que le problème était le vôtre. La nôtre est sur la page d'accueil dès l'automne, et elle disparaît d'elle-même une fois passée.",
          ],
        },
        {
          h: "Si vous avez commandé trop tard",
          p: [
            "Imprimez la confirmation de commande et glissez-la dans la carte. Ce n'est pas élégant, mais c'est mieux qu'une boîte vide et un silence gênant. La plupart des gens acceptent très bien « c'est en route » quand ils voient ce qui s'en vient.",
          ],
        },
      ],
      faq: [
        { q: "Quelle est la date limite exacte chez CMAC ?", a: "Elle s'affiche dans la bannière en haut de cmacbeauty.ca pendant l'automne, calculée à partir de notre estimation de livraison la plus longue. En 2026, elle tombe dans la dernière semaine de novembre." },
        { q: "Puis-je payer pour une livraison plus rapide ?", a: "Non. Nous offrons une seule vitesse de livraison et nous le disons clairement, plutôt que de vendre une option express que nous ne pourrions pas garantir depuis un entrepôt outre-mer." },
        { q: "Et si le colis arrive endommagé ?", a: "Écrivez-nous dans les 7 jours avec une photo : nous remplaçons ou remboursons. Notre numéro de téléphone et notre adresse sont sur la page Contact." },
      ],
      related: ["set-fall-basket", "set-bestie-duo", "set-pink-pop", "set-7am-reset"],
    },
    {
      slug: "led-mask-canada-price-guide",
      updated: "2026-09-22",
      title: "Masques DEL à domicile au Canada : ce que vous obtenez à chaque prix",
      answer:
        "Au Canada, les masques DEL lumière rouge à domicile se vendent environ 60 $ à 500 $. Sous 100 $, vous avez un masque en silicone souple ou rigide avec lumière rouge et minuterie ; au-dessus de 300 $, vous payez surtout plus de DEL, une finition de clinique, une application et une garantie plus longue.",
      intro:
        "Les prix semblent aléatoires tant qu'on n'aligne pas ce qui change vraiment d'un modèle à l'autre. Voici la version honnête, écrite par une petite boutique québécoise qui en vend un.",
      blocks: [
        {
          h: "Ce qui change avec le prix",
          table: {
            head: ["Tranche de prix (CA)", "Ce qu'on trouve", "Ce qu'on n'a pas"],
            rows: [
              ["50–100 $", "Lumière rouge, minuterie de 10 minutes, rechargeable, protection des yeux", "Moins de DEL, pas d'application, garantie plus courte, aucune étude publiée sur le modèle"],
              ["100–300 $", "Plus de DEL, plusieurs couleurs, parfois un module pour le cou", "Toujours rarement des tests publiés sur ce modèle précis"],
              ["300 $ et +", "Beaucoup de DEL, certifications dans certains marchés, application, garantie 1 à 2 ans", "Le prix. Pour la plupart des gens, le confort et l'habitude comptent plus que la fiche technique"],
            ],
          },
        },
        {
          h: "Ce que personne n'annonce",
          p: [
            "Le masque que vous utilisez quatre soirs par semaine vaut mieux que le meilleur masque utilisé deux fois par mois. C'est le poids, le confort de la sangle et la durée des séances qui décident, pas le nombre de DEL.",
            "La règle canadienne compte ici : un appareil vendu avec des promesses de traitement devient un instrument médical et exige une licence. Les appareils vendus comme outils cosmétiques, comme le nôtre, se décrivent en matière d'apparence seulement. Une fiche qui promet de guérir l'acné en dit long sur le vendeur.",
          ],
        },
        {
          h: "Choisir en deux minutes",
          ul: [
            "Décidez d'abord votre créneau réaliste : 10 minutes, quatre soirs, en lisant ? Prenez le masque le plus léger possible.",
            "Vérifiez la garantie et qui répond quand ça brise. Une annonce sans nom de vendeur, c'est une loterie.",
            "Ignorez les photos avant/après : c'est l'éclairage, le maquillage et l'angle. La publicité canadienne ne permet pas de s'en servir comme preuve, et les boutiques honnêtes n'en publient pas.",
            "Confirmez le délai de livraison avant de payer, surtout pour un cadeau.",
          ],
        },
      ],
      faq: [
        { q: "Un masque DEL à 60 $, c'est une arnaque ?", a: "Pas nécessairement. À ce prix, attendez-vous à un masque à lumière rouge simple, avec minuterie et batterie rechargeable, vendu comme outil cosmétique. N'attendez pas d'étude clinique publiée sur ce modèle, ni de promesse médicale." },
        { q: "À quelle fréquence l'utiliser ?", a: "La plupart des masques à domicile sont conçus pour environ 10 minutes, trois à quatre fois par semaine. Plus n'est pas mieux : c'est la régularité qui se remarque." },
        { q: "Qui devrait l'éviter ?", a: "En cas de grossesse, de photosensibilité, de médication photosensibilisante ou d'affection cutanée active, consultez d'abord votre médecin. Gardez les yeux fermés pendant les séances." },
      ],
      related: ["led-red-light-mask", "set-midnight-glow"],
    },
    {
      slug: "puffy-face-tools-compared",
      updated: "2026-09-22",
      title: "Rouleau de glace, gua sha ou microcourant : lequel pour un matin bouffi ?",
      answer:
        "Pour un visage qui paraît bouffi le matin, le rouleau de glace est l'option la plus rapide et la moins chère, le gua sha électronique ajoute chaleur et vibration pour un massage plus long, et l'appareil à microcourant vise plutôt un air plus tonique que la bouffissure du matin.",
      intro: "Trois outils, trois usages. Voici à quoi sert chacun, ce qu'il coûte au Canada, et quand c'est de l'argent gaspillé.",
      blocks: [
        {
          h: "Côte à côte",
          table: {
            head: ["Outil", "Idéal pour", "Durée", "Prix courant (CA)"],
            rows: [
              ["Rouleau de glace", "Un passage froid rapide sur un matin bouffi", "60 secondes", "20–35 $"],
              ["Gua sha électronique", "Un massage tiède plus long, mâchoire et joues", "5 minutes", "35–60 $"],
              ["Appareil à microcourant", "Un air temporairement plus tonique, en usage régulier", "5–10 minutes", "80–400 $"],
            ],
          },
        },
        {
          h: "Comment s'en servir pour vrai",
          ul: [
            "Rouleau de glace : gardez-le au congélateur, roulez du nez vers l'extérieur et sous les yeux. Jamais d'appui fort, jamais au même endroit.",
            "Gua sha électronique : mettez une couche glissante (gel ou huile), glissez le long de la mâchoire et vers la pommette, jamais sur une peau sèche.",
            "Microcourant : il faut un gel conducteur à base d'eau, à chaque séance. Pas de gel, aucun intérêt.",
          ],
        },
        {
          h: "Quand s'abstenir",
          p: [
            "Le microcourant ne convient pas à tout le monde : stimulateur cardiaque, dispositif électronique implanté, épilepsie et grossesse sont des contre-indications courantes. En cas de doute, consultez votre médecin.",
            "Si votre objectif, c'est un matin de cinq minutes, un appareil à 300 $ jamais rechargé vaut moins qu'un rouleau à 27 $ dans la porte du congélateur.",
          ],
        },
      ],
      faq: [
        { q: "Est-ce que ça enlève les rides ?", a: "Non. Ce sont des outils cosmétiques. Ils changent temporairement l'apparence : peau plus lisse, air moins bouffi, contours un peu plus définis. Toute promesse de changement permanent est exagérée." },
        { q: "Combien de temps dure l'effet ?", a: "L'effet du froid dure quelques heures. Les résultats du microcourant sont décrits comme temporaires et s'estompent en un jour ou deux : c'est la routine qui compte, pas une séance." },
        { q: "Lequel offrir en cadeau ?", a: "Un rouleau de glace ou un petit ensemble : aucun apprentissage, aucun gel, aucune recharge." },
      ],
      related: ["facial-ice-roller", "electronic-gua-sha-massager", "microcurrent-facial-lift-device", "set-7am-reset"],
    },
    {
      slug: "beauty-gift-sets-canada-under-100",
      updated: "2026-09-22",
      title: "Ensembles beauté à moins de 100 $ au Canada : ce qui en fait un bon cadeau",
      answer:
        `Un bon ensemble beauté sous 100 $ a un moment clair (matin, soir, voyage), aucun produit qui dépend du type de peau, et la livraison gratuite. Chez CMAC Beauty, dans cette tranche : le 7 AM Reset (79,99 $), Carry-On Glow (79,99 $) et le Duo Glow entre copines (69,99 $) ; la livraison gratuite commence à ${FREE_FR}.`,
      intro:
        "Les coffrets ratés le sont pour des raisons plates : trop de produits, la mauvaise teinte, ou une boîte qui arrive après la fête. Voici la liste qu'on utilise pour monter les nôtres.",
      blocks: [
        {
          h: "La liste en cinq points",
          ul: [
            "Une occasion, pas cinq : un coffret qui répond à « dimanche soir » ou « dans l'avion » se fait aimer plus facilement.",
            "Rien qui dépend d'une teinte. On oublie le fond de teint, le rouge à lèvres et tout ce qui doit correspondre au type de peau.",
            "Des outils plutôt que des liquides : les cosmétiques qui touchent le visage soulèvent des questions d'allergies et de réglementation ; un rouleau, un bandeau ou un chouchou en satin, non.",
            "Vérifiez le délai avant d'acheter. La plupart des déceptions de cadeaux en ligne sont un problème de livraison, pas de produit.",
            "Exigez une politique de retour écrite. La nôtre : " + POLICY.returnDays + " jours sur les articles inutilisés, et les articles d'hygiène seulement s'ils sont non ouverts.",
          ],
        },
        {
          h: "Ce qu'on met sous 100 $",
          table: {
            head: ["Ensemble", "Prix (CA)", "Pour qui"],
            rows: [
              ["The 7 AM Reset", "79,99 $", "Celle qui se prépare vite et se réveille bouffie"],
              ["Carry-On Glow", "79,99 $", "Celle qui voyage souvent, ou l'étudiante qui fait des allers-retours"],
              ["Duo Glow entre copines", "69,99 $", "Deux personnes : un ensemble pour toi, un pour ton amie"],
              ["Trousse Entre deux rendez-vous", "59,99 $", "Celle qui se fait faire les ongles et veut qu'ils restent soignés"],
            ],
          },
        },
        {
          h: "Commander à temps",
          p: [
            `Prévoyez environ ${SHIPPING.totalWeeks.min} à ${SHIPPING.totalWeeks.max} semaines entre la commande et la livraison au Canada. Pour Noël, ça veut dire commander vers la fin novembre ; la date exacte s'affiche dans la bannière de la page d'accueil à l'automne.`,
          ],
        },
      ],
      faq: [
        { q: "Ça vaut la peine d'attendre la livraison gratuite ?", a: `La livraison gratuite commence à ${FREE_FR}. Ajouter un accessoire à 20 $ pour l'atteindre coûte souvent moins cher que de payer la livraison : c'est pour ça que le panier affiche le montant qui manque.` },
        { q: "Est-ce emballé cadeau ?", a: "Pas encore. Les ensembles arrivent dans l'emballage neutre du fournisseur, et on le dit plutôt que de promettre un ruban qui n'existe pas." },
        { q: "Et si elle a déjà un des articles ?", a: "Choisissez un coffret construit autour d'un moment qu'elle n'a pas encore couvert, ou écrivez-nous : une vraie personne répond et peut suggérer un échange." },
      ],
      related: ["set-7am-reset", "set-carry-on-glow", "set-bestie-duo", "set-between-appointments"],
    },
  ],
};

export function articleBySlug(locale: Locale, slug: string): Article | null {
  return JOURNAL[locale].find((a) => a.slug === slug) ?? null;
}

export const JOURNAL_SLUGS = JOURNAL.en.map((a) => a.slug);

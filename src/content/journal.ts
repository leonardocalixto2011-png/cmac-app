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
      updated: "2026-09-28",
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
          h: "What the market actually charges right now",
          table: {
            head: ["Where", "Asking price (CAD)"],
            rows: [
              ["Amazon.ca, cheapest full-face mask on the first page of results", "$89.99"],
              ["Amazon.ca, the range most listings sit in", "$129.99 – $169.99"],
              ["Amazon.ca, Health Canada authorised medical-grade model", "$498.00"],
              ["CMAC Beauty (this shop)", "$59.99"],
            ],
          },
        },
        {
          h: "Why we can be the cheapest",
          p: [
            "Competitor prices above were checked on Amazon.ca on September 28, 2026, on the search “led red light therapy face mask”. Prices move, so treat them as a snapshot and check before you buy.",
            "We are not cheaper because the device is worse. We are cheaper because of where it is sold. A seller on a marketplace pays roughly 15% commission in beauty, plus fulfilment per unit, plus advertising to stay visible at all: around a third of the price is gone before any margin. We pay card processing and ship direct, so the same class of device lands at $59.99 and we still make a healthy margin on it. That is the whole trick, and there isn't a second one.",
            "The trade-off is honest and it is delivery. Ours takes about 2 to 4 weeks because it ships from the supplier's warehouse, not from a Canadian one. If you need it this week, pay the marketplace premium — that is what it buys.",
          ],
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
      slug: "red-light-hand-masks-canada",
      updated: "2026-09-28",
      title: "“LED hand masks” in Canada: what is actually being sold",
      answer:
        "Most devices sold online as LED hand masks are near-infrared gloves advertised for arthritis and joint pain. In Canada, a device sold with pain-relief claims is a medical device and needs a Health Canada licence. That is why the honest cosmetic version of this product is a much smaller category, and why we do not sell one today.",
      intro:
        "People search for this, land on beauty shops, and find a product that is not really a beauty product. Here is the difference, from a shop that looked into selling one and decided against it.",
      blocks: [
        {
          h: "Three different products, one name",
          table: {
            head: ["What it really is", "How it is advertised", "What that means in Canada"],
            rows: [
              ["Near-infrared glove, 660 / 850 nm", "Arthritis, joint pain, circulation, stiff fingers", "Those are therapeutic claims: the device becomes a medical device and needs a Health Canada licence"],
              ["Cosmetic light device for hands", "The look of the skin on the backs of the hands", "A cosmetic tool, described in terms of appearance only, under the same rules as our face mask"],
              ["Hand sheet mask or moisturising glove treatment", "Softness, hydration", "A cosmetic. It must be notified to Health Canada, with a full ingredient list"],
            ],
          },
        },
        {
          h: "Why we don't sell one",
          p: [
            "We went looking. Almost every hand device a small shop can source is the first kind: the listing, the manual and the box all talk about arthritis and pain relief. We could write cosmetic copy on our own page, but the printed sheet inside the box would still make claims we do not make and cannot stand behind. Shipping someone else's promises is not something we are willing to do.",
            "Price is the second reason. The credible units land around $65 to $100 before anything we add, which would make this the most expensive thing we sell, in a category we cannot describe honestly at that price.",
            "If we find a hand device sold as a cosmetic tool, with packaging that matches, we will add it and update this page. Until then, the answer to “do you sell an LED hand mask?” is no, and this is why.",
          ],
        },
        {
          h: "What actually changes how your hands look",
          ul: [
            "Sunscreen on the backs of the hands, every day, all year. Hands collect more cumulative sun than almost anywhere else and almost never get protected. It is free, and it is the biggest lever you have.",
            "A thick cream at night, then cotton gloves. Unglamorous, costs almost nothing, works on dryness and texture.",
            "Gloves for dish soap and for the cold. Most rough hands in Québec are water, detergent and January, not age.",
            "Anything promising to erase spots or reverse ageing is selling you a claim, not a result. Ask what the device is actually licensed to do.",
          ],
        },
      ],
      faq: [
        {
          q: "Is an LED hand mask the same thing as an LED face mask?",
          a: "Usually not. Face masks in this price range are sold as cosmetic tools, described in terms of appearance. Most hand devices are sold as pain-relief products, which is a different category with different rules.",
        },
        {
          q: "Does red light help arthritis?",
          a: "That is not a question a shop should answer, and a shop that answers it confidently is telling you something about itself. Ask a pharmacist or a doctor. If you do buy a device for pain, check that it carries a Health Canada medical device licence number.",
        },
        {
          q: "Can I use a face LED mask on my hands?",
          a: "Follow the manufacturer's instructions for the device you own. Ours is designed and sold for facial use, and we describe it for that use only.",
        },
      ],
      related: ["led-red-light-mask"],
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
            "If your goal is a five-minute morning, a $300 device you won't charge is worse than a $20 roller you keep in the freezer door.",
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
    {
      slug: "buying-beauty-devices-canada",
      updated: "2026-09-28",
      title: "Buying a beauty device in Canada: the rules nobody tells you",
      answer:
        "In Canada a device sold with a treatment claim is a medical device and needs a Health Canada licence; a device sold as a cosmetic tool must describe appearance only. Before/after photos cannot stand in for proof, and a “was” price the seller never charged is illegal. Most of what you read while shopping breaks at least one of these rules.",
      intro:
        "We sell these devices, so read this with that in mind. It is still the page we wish had existed when we started, because every rule below is one a Canadian seller is already supposed to follow — and you can check each one yourself in under a minute.",
      blocks: [
        {
          h: "The four rules, and how to check them",
          table: {
            head: ["The rule", "A compliant listing", "A red flag"],
            rows: [
              ["Treatment claims make it a medical device", "“The look of fine lines”, “appears smoother”, “less puffy-looking”", "“Treats acne”, “heals”, “stimulates collagen” — with no Health Canada licence number anywhere"],
              ["Before/after photos are not proof", "Product shots, and an honest description of what a session feels like", "Split-image faces. Lighting, makeup and angle do that work, not the device"],
              ["A “was” price must be one actually charged", "One price, or a discount off a price the shop genuinely used", "A permanent “50% off” that has run since the listing first appeared"],
              ["Reviews must come from real buyers", "Few reviews, or none, on a young shop", "Four hundred five-star reviews on a device launched last month"],
            ],
          },
        },
        {
          h: "Why the same device costs $60 or $300",
          p: [
            "Often it is the same factory. What changes is the route it takes to your door. A seller on a large marketplace pays roughly 15% commission in beauty, plus a per-unit fulfilment fee, plus the advertising needed to appear at all — about a third of the sticker before anyone earns anything. A clinic brand adds retail margin, packaging and a warranty desk. A direct shop pays card processing and postage.",
            "So price tells you about the distribution, not the hardware. What genuinely differs between a $60 and a $300 mask is LED count, build quality, strap comfort, warranty length, and whether anyone answers when it stops working. Those are worth paying for. The word “clinical” on a box is not, unless a licence number sits beside it.",
          ],
        },
        {
          h: "The questions worth asking before you pay",
          ul: [
            "Who is the seller, and is there a name and a phone number? A listing with neither is a gamble you cannot follow up on.",
            "What is the total time to my door — processing plus transit, not one of them? A shop showing only one number is hiding the other.",
            "What happens if it breaks in month four? Get the warranty in writing before, not after.",
            "Is the price the final price? Some Canadian shops add tax at checkout and some do not: a small supplier under the $30,000 threshold is not required to charge it.",
            "Does the listing say who should not use it? Pregnancy, photosensitivity, light-sensitising medication, pacemakers and active skin conditions are standard cautions. A listing with no cautions has not thought about you.",
          ],
        },
        {
          h: "Where we stand, since you are on our site",
          p: [
            "We are a small shop in L'Assomption, Québec. Our LED mask is $59.99, and on September 28, 2026 the cheapest full-face mask on the first page of Amazon.ca was $89.99, with most listings between $129.99 and $169.99. We are cheaper because of the route, not the hardware, and the honest trade-off is delivery: ours takes about 2 to 4 weeks because it ships from the supplier's warehouse.",
            "We also do not have hundreds of reviews, because only verified buyers can leave one and we are new. You are allowed to hold that against us. We would rather say it than buy them.",
          ],
        },
      ],
      faq: [
        {
          q: "Is it legal to sell an LED mask in Canada without a Health Canada licence?",
          a: "Yes, when it is sold as a cosmetic tool and described in terms of appearance only. The licence requirement attaches to the claim, not to the device: the moment a seller says it treats a condition, it becomes a medical device and has to be licensed.",
        },
        {
          q: "Are before/after photos illegal?",
          a: "Using them as proof of a performance claim is the problem. Canadian advertising law requires a performance claim to rest on adequate and proper testing done before the claim is made, and a pair of photos is not testing. Honest shops leave them out.",
        },
        {
          q: "Why do some Canadian shops not charge tax?",
          a: "A supplier whose worldwide sales stay under $30,000 over four consecutive quarters is a small supplier and is not required to register for GST/HST. It is not a trick, and the listed price is then the final price.",
        },
        {
          q: "How do I spot bought reviews?",
          a: "Look at the ratio of reviews to the age of the listing, at whether the wording repeats across unrelated products, and at whether any review mentions something going wrong. Real review sets always contain complaints.",
        },
      ],
      related: ["led-red-light-mask", "microcurrent-facial-lift-device"],
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
      updated: "2026-09-28",
      title: "Masque LED au Canada : ce que vous obtenez vraiment à chaque prix",
      answer:
        "Au Canada, les masques LED lumière rouge à domicile se vendent environ 60 $ à 500 $. Sous 100 $, vous avez un masque en silicone souple ou rigide avec lumière rouge et minuterie ; au-dessus de 300 $, vous payez surtout plus de LED, une finition de clinique, une application et une garantie plus longue.",
      intro:
        "Les prix semblent aléatoires tant qu'on n'aligne pas ce qui change vraiment d'un modèle à l'autre. Voici la version honnête, écrite par une petite boutique québécoise qui en vend un.",
      blocks: [
        {
          h: "Ce qui change avec le prix",
          table: {
            head: ["Tranche de prix (CA)", "Ce qu'on trouve", "Ce qu'on n'a pas"],
            rows: [
              ["50–100 $", "Lumière rouge, minuterie de 10 minutes, rechargeable, protection des yeux", "Moins de LED, pas d'application, garantie plus courte, aucune étude publiée sur le modèle"],
              ["100–300 $", "Plus de LED, plusieurs couleurs, parfois un module pour le cou", "Toujours rarement des tests publiés sur ce modèle précis"],
              ["300 $ et +", "Beaucoup de LED, certifications dans certains marchés, application, garantie 1 à 2 ans", "Le prix. Pour la plupart des gens, le confort et l'habitude comptent plus que la fiche technique"],
            ],
          },
        },
        {
          h: "Ce que le marché demande vraiment en ce moment",
          table: {
            head: ["Où", "Prix demandé (CA)"],
            rows: [
              ["Amazon.ca, le masque complet le moins cher de la première page", "89,99 $"],
              ["Amazon.ca, la fourchette où se situent la plupart des fiches", "129,99 $ à 169,99 $"],
              ["Amazon.ca, modèle de qualité médicale autorisé par Santé Canada", "498,00 $"],
              ["CMAC Beauty (cette boutique)", "59,99 $"],
            ],
          },
        },
        {
          h: "Pourquoi on peut être le moins cher",
          p: [
            "Les prix des concurrents ci-dessus ont été relevés sur Amazon.ca le 28 septembre 2026, sur la recherche « led red light therapy face mask ». Les prix bougent : prenez-le comme une photo à un instant donné et vérifiez avant d'acheter.",
            "On n'est pas moins cher parce que l'appareil est moins bon. On est moins cher à cause de l'endroit où il est vendu. Un vendeur sur une place de marché paie environ 15 % de commission en beauté, plus l'expédition à l'unité, plus de la publicité pour rester visible tout court : près du tiers du prix est parti avant la moindre marge. Nous, on paie les frais de carte et on expédie directement, alors le même type d'appareil se retrouve à 59,99 $ et il nous reste une marge saine. C'est toute l'astuce, et il n'y en a pas de deuxième.",
            "La contrepartie est honnête, et c'est le délai. Le nôtre prend de 2 à 4 semaines, parce qu'il part de l'entrepôt du fournisseur et non d'un entrepôt canadien. S'il vous le faut cette semaine, payez la prime de la place de marché : c'est exactement ce qu'elle achète.",
          ],
        },
        {
          h: "Ce que personne n'annonce",
          p: [
            "Le masque que vous utilisez quatre soirs par semaine vaut mieux que le meilleur masque utilisé deux fois par mois. C'est le poids, le confort de la sangle et la durée des séances qui décident, pas le nombre de LED.",
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
        { q: "Un masque LED à 60 $, c'est une arnaque ?", a: "Pas nécessairement. À ce prix, attendez-vous à un masque à lumière rouge simple, avec minuterie et batterie rechargeable, vendu comme outil cosmétique. N'attendez pas d'étude clinique publiée sur ce modèle, ni de promesse médicale." },
        { q: "À quelle fréquence l'utiliser ?", a: "La plupart des masques à domicile sont conçus pour environ 10 minutes, trois à quatre fois par semaine. Plus n'est pas mieux : c'est la régularité qui se remarque." },
        { q: "Qui devrait l'éviter ?", a: "En cas de grossesse, de photosensibilité, de médication photosensibilisante ou d'affection cutanée active, consultez d'abord votre médecin. Gardez les yeux fermés pendant les séances." },
      ],
      related: ["led-red-light-mask", "set-midnight-glow"],
    },
    {
      slug: "red-light-hand-masks-canada",
      updated: "2026-09-28",
      title: "« Masque LED pour les mains » au Canada : ce qu'on vous vend vraiment",
      answer:
        "La plupart des appareils vendus en ligne comme « masques LED pour les mains » sont des gants à infrarouge proche annoncés contre l'arthrite et les douleurs articulaires. Au Canada, un appareil vendu avec une promesse de soulager la douleur devient un instrument médical et exige une licence de Santé Canada. C'est pourquoi la version cosmétique honnête de ce produit est une catégorie beaucoup plus petite, et pourquoi nous n'en vendons pas aujourd'hui.",
      intro:
        "Les gens cherchent ça, arrivent sur des boutiques beauté, et tombent sur un produit qui n'en est pas vraiment un. Voici la différence, écrite par une boutique qui a envisagé d'en vendre un et a dit non.",
      blocks: [
        {
          h: "Trois produits différents, un seul nom",
          table: {
            head: ["Ce que c'est vraiment", "Comment c'est annoncé", "Ce que ça veut dire au Canada"],
            rows: [
              ["Gant à infrarouge proche, 660 / 850 nm", "Arthrite, douleurs articulaires, circulation, doigts raides", "Ce sont des promesses thérapeutiques : l'appareil devient un instrument médical et exige une licence de Santé Canada"],
              ["Appareil lumineux cosmétique pour les mains", "L'apparence de la peau du dessus des mains", "Un outil cosmétique, décrit en matière d'apparence seulement, sous les mêmes règles que notre masque visage"],
              ["Masque en tissu ou gant hydratant pour les mains", "Douceur, hydratation", "Un cosmétique. Il doit être déclaré à Santé Canada, avec la liste complète des ingrédients"],
            ],
          },
        },
        {
          h: "Pourquoi nous n'en vendons pas",
          p: [
            "Nous avons cherché. Presque tous les appareils pour les mains accessibles à une petite boutique sont du premier type : la fiche, le manuel et la boîte parlent d'arthrite et de soulagement de la douleur. On pourrait écrire un texte cosmétique sur notre propre page, mais le feuillet imprimé dans la boîte, lui, continuerait d'affirmer des choses que nous ne disons pas et que nous ne pouvons pas défendre. Expédier les promesses de quelqu'un d'autre, ce n'est pas quelque chose qu'on est prêt à faire.",
            "Le prix est la deuxième raison. Les unités crédibles arrivent autour de 65 à 100 $ avant tout ce qu'on ajoute, ce qui en ferait l'article le plus cher de la boutique, dans une catégorie qu'on ne peut pas décrire honnêtement à ce prix.",
            "Si nous trouvons un appareil pour les mains vendu comme outil cosmétique, avec un emballage qui dit la même chose, nous l'ajouterons et nous mettrons cette page à jour. D'ici là, la réponse à « vendez-vous un masque LED pour les mains ? » est non, et voici pourquoi.",
          ],
        },
        {
          h: "Ce qui change vraiment l'apparence de vos mains",
          ul: [
            "De la crème solaire sur le dessus des mains, tous les jours, toute l'année. Les mains reçoivent plus de soleil cumulatif que presque partout ailleurs et ne sont presque jamais protégées. C'est gratuit, et c'est le plus gros levier.",
            "Une crème épaisse le soir, puis des gants de coton. Pas glamour, coûte presque rien, agit sur la sécheresse et la texture.",
            "Des gants pour le savon à vaisselle et pour le froid. Au Québec, des mains rugueuses, c'est l'eau, le détergent et janvier — pas l'âge.",
            "Tout ce qui promet d'effacer les taches ou de renverser le vieillissement vous vend une promesse, pas un résultat. Demandez ce que l'appareil a vraiment le droit de faire.",
          ],
        },
      ],
      faq: [
        { q: "Un masque LED pour les mains, c'est comme un masque LED visage ?", a: "Généralement non. Les masques visage dans cette gamme de prix sont vendus comme outils cosmétiques, décrits en matière d'apparence. La plupart des appareils pour les mains sont vendus comme produits antidouleur, ce qui est une autre catégorie avec d'autres règles." },
        { q: "Est-ce que la lumière rouge aide contre l'arthrite ?", a: "Ce n'est pas une question à laquelle une boutique devrait répondre, et une boutique qui y répond avec assurance vous apprend quelque chose sur elle-même. Demandez à votre pharmacien ou à votre médecin. Si vous achetez un appareil pour la douleur, vérifiez qu'il porte un numéro de licence d'instrument médical de Santé Canada." },
        { q: "Puis-je utiliser un masque LED visage sur mes mains ?", a: "Suivez le mode d'emploi de l'appareil que vous possédez. Le nôtre est conçu et vendu pour le visage, et c'est le seul usage que nous décrivons." },
      ],
      related: ["led-red-light-mask"],
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
            "Si votre objectif, c'est un matin de cinq minutes, un appareil à 300 $ jamais rechargé vaut moins qu'un rouleau à 20 $ dans la porte du congélateur.",
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
    {
      slug: "buying-beauty-devices-canada",
      updated: "2026-09-28",
      title: "Acheter un appareil de beauté au Canada : les règles que personne ne vous dit",
      answer:
        "Au Canada, un appareil vendu avec une promesse de traitement devient un instrument médical et exige une licence de Santé Canada ; un appareil vendu comme outil cosmétique doit se décrire en matière d'apparence seulement. Les photos avant/après ne tiennent pas lieu de preuve, et un prix « avant » que le vendeur n'a jamais demandé est illégal. La plupart de ce que vous lisez en magasinant enfreint au moins une de ces règles.",
      intro:
        "On vend ces appareils : lisez ceci en le sachant. C'est quand même la page qu'on aurait voulu trouver en commençant, parce que chaque règle ci-dessous, un vendeur canadien est déjà censé la respecter — et vous pouvez vérifier chacune vous-même en moins d'une minute.",
      blocks: [
        {
          h: "Les quatre règles, et comment les vérifier",
          table: {
            head: ["La règle", "Une fiche conforme", "Un drapeau rouge"],
            rows: [
              ["Une promesse de traitement en fait un instrument médical", "« L'apparence des ridules », « paraît plus lisse », « l'air moins bouffi »", "« Traite l'acné », « guérit », « stimule le collagène » — sans aucun numéro de licence de Santé Canada"],
              ["Les photos avant/après ne sont pas une preuve", "Des photos du produit, et une description honnête de ce que la séance fait ressentir", "Des visages en deux moitiés. C'est l'éclairage, le maquillage et l'angle qui travaillent, pas l'appareil"],
              ["Un prix « avant » doit avoir été demandé pour vrai", "Un seul prix, ou un rabais sur un prix que la boutique a vraiment utilisé", "Un « −50 % » permanent, affiché depuis la création de la fiche"],
              ["Les avis doivent venir de vrais acheteurs", "Peu d'avis, ou aucun, sur une boutique récente", "Quatre cents avis cinq étoiles sur un appareil lancé le mois dernier"],
            ],
          },
        },
        {
          h: "Pourquoi le même appareil coûte 60 $ ou 300 $",
          p: [
            "Souvent, c'est la même usine. Ce qui change, c'est le chemin parcouru jusqu'à votre porte. Un vendeur sur une grande place de marché paie environ 15 % de commission en beauté, plus des frais d'expédition à l'unité, plus la publicité nécessaire pour seulement apparaître : près du tiers du prix affiché avant que qui que ce soit gagne quoi que ce soit. Une marque de clinique ajoute sa marge de détail, l'emballage et un service de garantie. Une boutique directe paie les frais de carte et la poste.",
            "Le prix vous renseigne donc sur la distribution, pas sur la quincaillerie. Ce qui diffère vraiment entre un masque à 60 $ et un à 300 $ : le nombre de LED, la qualité de fabrication, le confort de la sangle, la durée de la garantie, et le fait que quelqu'un réponde quand ça brise. Ça, ça vaut de payer. Le mot « clinique » sur une boîte, non — sauf si un numéro de licence est écrit juste à côté.",
          ],
        },
        {
          h: "Les questions à poser avant de payer",
          ul: [
            "Qui est le vendeur, et y a-t-il un nom et un numéro de téléphone ? Une fiche sans les deux, c'est un pari qu'on ne peut pas relancer.",
            "Quel est le délai total jusqu'à ma porte — traitement plus transport, pas l'un des deux ? Une boutique qui n'affiche qu'un seul chiffre cache l'autre.",
            "Qu'est-ce qui arrive si ça brise au quatrième mois ? Faites écrire la garantie avant, pas après.",
            "Le prix affiché est-il le prix final ? Certaines boutiques canadiennes ajoutent la taxe au paiement et d'autres non : un petit fournisseur sous le seuil de 30 000 $ n'est pas tenu de la facturer.",
            "La fiche dit-elle qui ne devrait pas l'utiliser ? Grossesse, photosensibilité, médication photosensibilisante, stimulateur cardiaque et affection cutanée active sont les mises en garde habituelles. Une fiche sans aucune mise en garde n'a pas pensé à vous.",
          ],
        },
        {
          h: "Où on se situe, puisque vous êtes sur notre site",
          p: [
            "On est une petite boutique de L'Assomption, au Québec. Notre masque LED est à 59,99 $, et le 28 septembre 2026 le masque complet le moins cher de la première page d'Amazon.ca était à 89,99 $, la plupart des fiches se situant entre 129,99 $ et 169,99 $. On est moins cher à cause du chemin parcouru, pas de la quincaillerie, et la contrepartie honnête c'est le délai : le nôtre prend de 2 à 4 semaines parce qu'il part de l'entrepôt du fournisseur.",
            "On n'a pas non plus des centaines d'avis, parce que seuls les acheteurs vérifiés peuvent en laisser un et qu'on est nouveaux. Vous avez le droit de nous le reprocher. On préfère le dire plutôt que d'en acheter.",
          ],
        },
      ],
      faq: [
        { q: "Est-ce légal de vendre un masque LED au Canada sans licence de Santé Canada ?", a: "Oui, quand il est vendu comme outil cosmétique et décrit en matière d'apparence seulement. L'exigence de licence s'attache à la promesse, pas à l'appareil : dès qu'un vendeur affirme qu'il traite une affection, ça devient un instrument médical qui doit être homologué." },
        { q: "Les photos avant/après sont-elles illégales ?", a: "C'est de s'en servir comme preuve d'une promesse de rendement qui pose problème. La loi canadienne exige qu'une promesse de rendement repose sur des épreuves suffisantes et appropriées faites avant de la formuler, et deux photos ne sont pas des épreuves. Les boutiques honnêtes n'en publient pas." },
        { q: "Pourquoi certaines boutiques canadiennes ne facturent pas de taxe ?", a: "Un fournisseur dont les ventes mondiales restent sous 30 000 $ sur quatre trimestres consécutifs est un petit fournisseur et n'est pas tenu de s'inscrire à la TPS/TVH. Ce n'est pas un truc, et le prix affiché est alors le prix final." },
        { q: "Comment repérer des avis achetés ?", a: "Regardez le rapport entre le nombre d'avis et l'âge de la fiche, si les formulations se répètent d'un produit sans lien à l'autre, et si un seul avis mentionne un problème. Un vrai ensemble d'avis contient toujours des plaintes." },
      ],
      related: ["led-red-light-mask", "microcurrent-facial-lift-device"],
    },
  ],
};

export function articleBySlug(locale: Locale, slug: string): Article | null {
  return JOURNAL[locale].find((a) => a.slug === slug) ?? null;
}

export const JOURNAL_SLUGS = JOURNAL.en.map((a) => a.slug);

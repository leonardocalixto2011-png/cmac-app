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
      updated: "2026-09-29",
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
            "If your goal is a five-minute morning, a $300 device you won't charge is worse than a $15 roller you keep in the freezer door.",
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
      updated: "2026-09-29",
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
              ["The 7 AM Reset", "$69.99", "Someone who gets ready in a hurry and wakes up puffy-looking"],
              ["Carry-On Glow", "$79.99", "A frequent flyer or a student going back and forth"],
              ["Bestie Glow Duo", "$46.99", "Two people: one set for you, one for your friend"],
              ["Between Appointments Kit", "$54.99", "Someone who gets her nails done and wants them neat in between"],
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
    {
      slug: "beauty-gifts-under-50-canada",
      updated: "2026-09-29",
      title: "Beauty gifts under $25 and under $50 in Canada, for the office gift exchange",
      answer:
        `For a Canadian gift exchange, $25 buys one useful beauty tool (at CMAC Beauty, a facial ice roller at $14.99, a satin bonnet at $16.99 or a heatless curling set at $24.99) and $50 buys a complete boxed gift, such as the Cozy Night Box at $41.99 or the Silky Hair Box at $45.99. Order by November 26 for delivery before Christmas, and put the whole exchange in one order: shipping is free from ${FREE_EN}.`,
      intro:
        "The office exchange comes with a budget, a deadline and a colleague whose skin type you don't know. Tools solve the last one: no shade to match, no scent to dislike, no ingredient to react to. Here is what each budget actually buys, with prices checked on September 29, 2026.",
      blocks: [
        {
          h: "Under $25: one good tool",
          table: {
            head: ["Gift", "Price", "For whom"],
            rows: [
              ["Facial ice roller", "$14.99", "Anyone who wakes up puffy-looking"],
              ["Satin-feel sleep mask", "$12.99", "A light sleeper, or someone who travels"],
              ["Adjustable satin bonnet", "$16.99", "Curly or textured hair"],
              ["Microfiber hair towel wrap", "$17.99", "Long hair and no patience for drying it"],
              ["Natural bristle body brush", "$22.99", "Someone who likes a long shower"],
              ["Heatless curling set", "$24.99", "Wants curls without heat"],
              ["USB UV/LED nail lamp", "$24.99", "Does her own gel nails"],
            ],
          },
        },
        {
          h: "Under $50: a complete box",
          table: {
            head: ["Gift", "Price", "What's inside"],
            rows: [
              ["The Cozy Night Box", "$41.99", "Ice roller, satin-feel sleep mask, fleece socks, scrunchie, cleansing puff. Nothing to charge"],
              ["Silky Hair Box", "$45.99", "Satin pillowcase, scalp massager, scrunchie, spa headband"],
              ["Bestie Glow Duo", "$46.99", "Two identical kits (ice roller, headband, scrunchie): one to give, one to keep"],
              ["Pedi Night In", "$47.99", "Electric foot file, fleece socks, spa headband, scrunchie"],
              ["Under-Eye Glow Wand", "$44.99", "The one device under $50 that still feels like a real present"],
            ],
          },
        },
        {
          h: "The shipping math for an exchange",
          ul: [
            `Shipping is a flat $9.99 below ${FREE_EN} and free above it. A single $14.99 gift therefore costs $24.98 delivered, while five gifts in one order ship free.`,
            "Collecting for the whole office? One person orders everything, pays once and hands out the boxes. It is the cheapest way to buy any gift here.",
            "Ten or more of the same box, or delivery to several addresses: our corporate page (cmacbeauty.ca/entreprises) handles quantity pricing and per-address shipping.",
            "Sets arrive in the supplier's plain packaging. We don't gift-wrap, and we would rather say so now than on December 20.",
          ],
        },
        {
          h: "The deadline",
          p: [
            "Our parcels take about 2 to 4 weeks door to door, because they ship from the supplier's warehouse. The last safe day to order for Christmas is November 26. After that we can't promise the 24th, and we won't pretend to.",
          ],
        },
      ],
      faq: [
        { q: "Can I send a gift straight to a colleague?", a: "Yes: enter their address at checkout. One order goes to one address; for several addresses, use the corporate page." },
        { q: "What if she already owns it?", a: "Unused items can be returned within 30 days. Hygiene items, like the cleansing puff, only if unopened." },
        { q: "Why tools rather than skincare?", a: "Because you can't guess someone's skin type from across the office. A tool has no shade, no scent and no ingredient to react to." },
      ],
      related: ["set-cozy-night", "set-silky-hair", "facial-ice-roller", "heatless-curl-set"],
    },
    {
      slug: "exfoliating-mitt-vs-dry-brush",
      updated: "2026-09-29",
      title: "Exfoliating mitt, dry brush or face brush in Canada: which one, and how often",
      answer:
        "Use a hammam-style exfoliating mitt on wet, soap-free skin once a week for the strongest polish; a natural-bristle dry brush for two minutes before the shower if you want a daily habit; and a soft face dry brush for a one-minute routine on the face, never the body tools. At CMAC Beauty they cost $12.99, $22.99 and $14.99.",
      intro:
        "Three tools, three textures, and the most common mistake is using the rough one too often. Here is what each one does, how to use it, and when to leave it on the hook.",
      blocks: [
        {
          h: "The three tools side by side",
          table: {
            head: ["Tool", "How it's used", "How often", "Price"],
            rows: [
              ["Exfoliating mitt (hammam glove)", "Soak in warm water a few minutes, no soap, then firm strokes on wet skin", "Once a week", "$12.99"],
              ["Natural bristle body brush", "On dry skin, long strokes toward the heart, before the shower", "Daily or every other day, light pressure", "$22.99"],
              ["Face dry brush", "On a dry, clean face, from the centre outward, feather-light, about a minute", "A few times a week", "$14.99"],
            ],
          },
        },
        {
          h: "The one rule: body tools stay on the body",
          p: [
            "The mitt and the body brush are made to be rough, and facial skin is thinner. Use them from the neck down. The face brush has much softer bristles for exactly that reason, and even then the pressure should be feather-light.",
            "Rough is also why the mitt is a once-a-week tool. If skin feels tender or looks red afterwards, you went too hard or too often; give it a longer break.",
          ],
        },
        {
          h: "When to skip it",
          ul: [
            "Sunburnt, broken, irritated or freshly scratched skin.",
            "Active breakouts, for the face brush.",
            "The day of shaving or waxing: wait a day.",
            "If you already use exfoliating acids or retinoids, go gentler and less often, and ask your pharmacist if you're unsure.",
          ],
        },
        {
          h: "Keeping them clean",
          ul: [
            "Mitt: rinse, wring and hang it to dry after each use. Machine wash cold in a laundry bag.",
            "Body brush: keep the bristles dry, tap them out and hang the brush. Wash the head with mild soap once a month and dry it bristles-down.",
            "Face brush: tap it out after use, wipe the bristles with a dry cloth weekly and keep the cover on.",
            "Replace any of them once the bristles splay or the mitt goes thin and smooth.",
          ],
        },
      ],
      faq: [
        {
          q: "Is a hammam mitt the same as a Korean “Italy towel”?",
          a: "Same idea: a rough viscose weave used on wet skin to lift dead skin. The name changes with the country (kessa in the hammam, Italy towel in Korean spas).",
        },
        {
          q: "Can I use the mitt with soap?",
          a: "No. Soap makes the skin slippery and the weave stops gripping. Soak, then use it on wet skin with no product, and wash afterwards.",
        },
        {
          q: "Does dry brushing detox the body or reduce cellulite?",
          a: "We only claim what you can see and feel: smoother, polished-feeling skin. Detox and cellulite claims are not well enough supported for us to make them, and we would rather you buy the brush for the right reason.",
        },
      ],
      related: ["exfoliating-mitt", "bristle-body-brush", "face-dry-brush"],
    },
    {
      slug: "satin-vs-silk-pillowcase",
      updated: "2026-09-29",
      title: "Satin or silk pillowcase: what the difference actually is",
      answer:
        "Silk is a natural protein fibre; satin is a weave, usually made of polyester. Both give hair and skin a smoother surface than cotton, which many people notice as less morning frizz. Silk feels cooler and costs several times more; polyester satin costs a fraction, goes in the washing machine and lasts well. Ours is polyester satin at $9.99, and we call it satin, not silk.",
      intro:
        "Half the listings you'll see say “silky”, “silk-feel” or “satin silk”, and that is not an accident. Here is how to tell what you are actually buying, and which one is worth it for you.",
      blocks: [
        {
          h: "Satin and silk side by side",
          table: {
            head: ["", "Satin (polyester)", "Silk (mulberry)"],
            rows: [
              ["What it is", "A smooth, shiny weave; the fibre is usually polyester", "A natural protein fibre from silkworm cocoons"],
              ["Feel", "Smooth and slippery, slightly warmer", "Smooth, cooler, breathes a little better"],
              ["Care", "Machine wash, dries fast, forgiving", "Cold hand or delicate wash, mild detergent, no heat"],
              ["Price", "Low: our satin pillowcase is $9.99", "Several times the price of satin"],
              ["Who it suits", "Most people, and anyone who wants to try before spending more", "People who run hot at night, or want the natural fibre"],
            ],
          },
        },
        {
          h: "What “momme” means",
          p: [
            "Momme is the weight of silk fabric. Pillowcases are commonly 19 to 25 momme; a higher number means a denser, more durable fabric and a higher price. Polyester satin has no momme rating, so a “22 momme satin” listing is mixing two things up.",
          ],
        },
        {
          h: "How to tell what you're buying",
          ul: [
            "“Satin” on a label describes the weave, not the fibre. Look for the fibre content: 100% polyester or 100% mulberry silk.",
            "“Silky”, “silk-feel” and “silk touch” mean it is not silk.",
            "In Canada, textiles must show their fibre content on the label. If a product won't tell you what it is made of, move on.",
            "Real silk at a satin price is a red flag, not a bargain.",
          ],
        },
        {
          h: "Keeping it smooth",
          ul: [
            "Satin: wash cold with like colours, skip fabric softener, low heat or hang to dry.",
            "Silk: cold hand wash or a delicate cycle in a mesh bag, a detergent made for silk, dry flat away from the sun.",
            "Either one: pairing it with a satin bonnet or a scrunchie instead of a tight elastic does more for morning hair than any single product.",
          ],
        },
      ],
      faq: [
        { q: "Does a satin pillowcase prevent wrinkles?", a: "No pillowcase changes wrinkles. Sleep creases on waking are temporary; a smoother surface may leave fewer of them, and that is the honest extent of it." },
        { q: "Is satin good for curly or textured hair?", a: "Many people with curly or textured hair use satin for exactly this reason, often together with a satin bonnet, because a smooth surface drags less on the hair overnight." },
        { q: "Why is your satin pillowcase only $9.99?", a: "Because it is polyester satin, sold without a marketplace commission, and shipping is charged separately. It is not silk, and it is not priced as if it were." },
      ],
      related: ["satin-pillowcase", "satin-bonnet", "satin-beauty-sleep-set", "set-silky-hair"],
    },
    {
      slug: "black-friday-beauty-canada-2026",
      updated: "2026-09-29",
      title: "Black Friday 2026 in Canada: what arrives before Christmas, and how to spot a fake discount",
      answer:
        "At CMAC Beauty, Black Friday week runs November 20 to December 1, 2026: 20% off every gift set with code BF20. Orders placed by November 26 are expected before Christmas, since delivery takes 2 to 4 weeks; from November 27 the discount continues but Christmas delivery is no longer guaranteed. Boxing Week runs December 26 to January 4, with 25% off sets using code BOXING25.",
      intro:
        "Black Friday is the busiest week of the year for staged discounts and for gifts that arrive on December 28. Here is our calendar with the delivery arithmetic already done, and the checks that separate a real discount from a dressed-up one.",
      blocks: [
        {
          h: "Our holiday calendar",
          table: {
            head: ["Dates", "What", "Before Christmas?"],
            rows: [
              ["Until November 19", `Regular prices, free shipping from ${FREE_EN}`, "Yes"],
              ["November 20 to 26", "Black Friday week: 20% off every gift set with code BF20", "Yes"],
              ["November 27 to December 1", "Black Friday: BF20 continues", "Not guaranteed"],
              ["December 26 to January 4", "Boxing Week: 25% off sets with code BOXING25", "After the holidays"],
            ],
          },
        },
        {
          h: "How to tell a real Black Friday discount",
          ul: [
            "The “was” price has to be one the shop actually charged, for a real period, before the sale. In Canada, inflating a regular price to advertise a bigger saving is misleading advertising under the Competition Act.",
            "Check the price a few weeks earlier. A product at $59.99 in October that becomes “$59.99, 40% off” in November has no discount at all.",
            "A countdown that restarts when you reload the page is a sales tactic, not a deadline.",
            "Compare totals with shipping, not headline percentages. 30% off plus $15 shipping can cost more than 20% off with free shipping.",
          ],
        },
        {
          h: "Our own rules for the season",
          ul: [
            "Discounts come off our normal price, the one on the site all year. We don't raise prices ahead of a sale to make the saving look bigger.",
            "Every code says what it gives and when it ends, and it disappears when it ends.",
            "Our “buy 3, save 10%; buy 5, save 15%” tiers pause while a seasonal code runs, so the two never stack.",
            "The Christmas cutoff is November 26. After that we say “not guaranteed” rather than hope.",
          ],
        },
      ],
      faq: [
        { q: "Can I use BF20 on a set I'm giving for Christmas?", a: "Yes, from November 20 to 26. Orders placed in that window are expected before Christmas." },
        { q: "Does BF20 combine with the 3-item discount?", a: "No. The build-your-own-set tiers pause while a seasonal code is running, so you get one or the other, never both." },
        { q: "Will your prices go up before Black Friday?", a: "No. We don't raise prices before a sale to make a discount look bigger; the code comes off the price you can see today." },
      ],
      related: ["set-christmas-glow", "set-cozy-night", "set-for-mom", "set-silky-hair"],
    },
    {
      slug: "gel-manicure-between-appointments",
      updated: "2026-09-29",
      title: "Keeping a gel manicure looking fresh between appointments",
      answer:
        "A gel manicure typically looks its best for two to three weeks. What makes it last is simple: gloves for dishes and cleaning products, hand cream or cuticle oil every day, never peeling a lifting edge, and filing natural nails in one direction only. Tidy natural nails at home; leave gel repairs and removal to your technician. Our Between Appointments kit is $54.99.",
      intro:
        "Most gel manicures don't fail at the salon. They fail at the sink, on a stubborn lid or when a lifting corner gets picked at on the couch. Here is what helps, what to do yourself, and what to leave for your next appointment.",
      blocks: [
        {
          h: "What actually makes it last",
          ul: [
            "Gloves for dishwater and cleaning products. Hot water and detergent are what loosen gel at the edges.",
            "Hand cream or cuticle oil every day, on the cuticles as much as the hands.",
            "Nails are not tools: no opening cans or scraping labels.",
            "Never peel a lifting edge. Gel that comes off in one piece takes the top layer of the natural nail with it.",
            "File in one direction, from the side toward the centre. Back-and-forth filing frays the edge.",
          ],
        },
        {
          h: "At home, or at the studio?",
          table: {
            head: ["Task", "At home", "Leave to your technician"],
            rows: [
              ["Shape natural nails", "Glass nail file ($12.99), or the 5-in-1 nail pen ($29.99) on bare natural nails", "—"],
              ["Tidy cuticles", "Push them back after a shower; nip only loose skin (Cuticle Care Duo, $14.99)", "Full cuticle work"],
              ["A lifting gel edge", "Keep it dry, don't peel it, book a fill", "Repair or fill"],
              ["Removing gel", "Never by prying or hard filing", "Proper removal"],
              ["Doing your own gel", "USB UV/LED lamp ($24.99): thin coats, 30 to 60 seconds per coat", "—"],
            ],
          },
        },
        {
          h: "Under the lamp",
          p: [
            "Many people prefer to keep the backs of their hands covered while gel cures. Our cover gloves ($8.99) are fabric covers with open fingertips, so the technician works as usual. They are a cover, not a sunscreen.",
          ],
        },
      ],
      faq: [
        { q: "How often can I use the nail care pen?", a: "Once a week is plenty, on clean, bare natural nails, at the lower speed." },
        { q: "Can I file my gel with it?", a: "No. Leave gel and builder gel to your technician; the pen is for natural nails between visits." },
        { q: "Is a USB lamp as good as a salon lamp?", a: "It is a compact 24-bead lamp for touch-ups and home gel; salon lamps are larger. Follow the curing time on your polish, usually 30 to 60 seconds per coat." },
      ],
      related: ["set-between-appointments", "cuticle-care-duo", "glass-nail-file", "usb-nail-lamp"],
    },
    {
      slug: "beauty-gift-for-mom-canada",
      updated: "2026-10-02",
      title: "What to give your mother that she will actually use",
      answer:
        "The gifts that get used are the ones with nothing to guess: no shade, no size, no scent, nothing to learn. A satin pillowcase at $9.99, a scalp massager at $29.99 or a cooling ice roller at $14.99 all pass that test. Our For Mom box is $107.99. If it is for Christmas, order by November 26 — delivery takes 2 to 4 weeks.",
      intro:
        "Beauty gifts fail for predictable reasons. The shade is wrong, the scent is not hers, the device needs a technique she has no interest in learning. Here is how to pick one that ends up on the nightstand instead of in a drawer.",
      blocks: [
        {
          h: "The drawer test",
          ul: [
            "Nothing to choose wrong. No foundation shades, no clothing sizes, no perfume. A pillowcase, a roller or a headband fits everyone.",
            "Nothing to learn. If it needs a technique or a tutorial, it gets used twice.",
            "Nothing to replace. Avoid anything with refills, pods or cartridges she will have to buy again.",
            "It fits a routine she already has. The best gift slots into an evening she already spends on the couch.",
          ],
        },
        {
          h: "By budget",
          table: {
            head: ["Budget", "What we would pick", "Why it works"],
            rows: [
              ["Under $20", "Satin pillowcase $9.99, satin sleep mask $12.99, facial ice roller $14.99", "One size, one colour choice, immediately useful"],
              ["$20 to $50", "Scalp massager $29.99, heatless curl set $24.99, hair towel wrap $17.99", "Small devices with no learning curve and nothing to refill"],
              ["$40 to $50 as a set", "Cozy Night box $41.99, Silky Hair box $45.99", "Arrives wrapped and complete; nothing else to buy"],
              ["Over $100", "For Mom box $107.99", "Microcurrent device, ice roller, satin pillowcase and spa headband in one box"],
            ],
          },
        },
        {
          h: "What we would avoid",
          ul: [
            "Anything with a shade: foundation, lipstick, tinted cream. The odds are against you.",
            "Perfume, unless you have smelled it on her.",
            "Devices that promise a transformation. Set the expectation at pleasant, not life-changing, and the gift lands better.",
            "Subscriptions. A gift should end, not become a monthly line on someone's statement.",
          ],
        },
      ],
      faq: [
        { q: "What if she already has everything?", a: "Replace something she uses daily with a nicer version. A satin pillowcase instead of a cotton one costs $9.99 and she will feel it the first night." },
        { q: "Is a beauty device a safe gift for someone in her sixties or seventies?", a: "Our devices are cosmetic, not medical. If she has a skin condition, is photosensitive or takes light-sensitising medication, ask her doctor first — and that is true at any age." },
        { q: "When is the last day to order for Christmas?", a: "November 26. Delivery takes 2 to 4 weeks, so after that date we cannot promise it arrives in time, and we would rather say so than hope." },
      ],
      related: ["set-for-mom", "satin-pillowcase", "electric-scalp-massager", "facial-ice-roller"],
    },
    {
      slug: "beauty-gift-for-partner-canada",
      updated: "2026-10-03",
      title: "A beauty gift for your partner when you know nothing about beauty",
      answer:
        "Pick something with no shade, no scent and no size, that works straight out of the box, and give it as time for themselves rather than as a fix. Our Éclat de Noël box at $75.99 (LED mask, sleep mask, spa headband and scrunchie) is the safe choice; the Cozy Night box at $41.99 is the option with no device at all. For Christmas, order by November 26: delivery takes 2 to 4 weeks.",
      intro:
        "Plenty of beauty gifts are bought by people who never use beauty products themselves. That is fine. None of the rules below require knowing anything about skin care, and none of them involve guessing a shade.",
      blocks: [
        {
          h: "Three rules that do the knowing for you",
          ul: [
            "No shade, no scent, no size. Foundation, perfume and clothing are where gifts go wrong. A device, a satin set or a box avoids all three.",
            "Complete in the box. If it needs a refill, a cartridge or an app, it turns into homework. Everything in our sets works as it arrives; the LED mask recharges by USB.",
            "Give it as time, not as a fix. \"Ten minutes for yourself\" lands well. Anything that sounds like \"this will fix your wrinkles\" does not, and we do not promise that anyway.",
          ],
        },
        {
          h: "By budget",
          table: {
            head: ["Budget", "What we would pick", "Why it works"],
            rows: [
              ["Under $50", "Cozy Night box $41.99 or Silky Hair box $45.99", "No device and nothing to learn. Cozy Night is an ice roller, sleep mask, fleece socks, scrunchie and cleansing puff; Silky Hair is a satin pillowcase, scalp massager, scrunchie and headband"],
              ["$50 to $80", "LED mask $59.99 alone, or the Éclat de Noël box $75.99", "The box adds a sleep mask, spa headband and scrunchie, arrives as one parcel and ships free"],
              ["Around $100", "Midnight Glow $104.99", "Sonic cleansing brush, LED mask and a 4-piece satin sleep set; orders over $100 also get a satin scrunchie added free"],
              ["Going all out", "The Full Ritual $169.99", "LED mask, microcurrent device, ice roller, spa headband and the satin sleep set: our most complete set"],
            ],
          },
        },
        {
          h: "The practical part",
          ul: [
            "Order by November 26 for Christmas. Delivery takes 2 to 4 weeks, and we would rather say so now than promise the 24th.",
            "Have it shipped to yourself if you want to wrap it. It arrives in shipping packaging, not gift wrap.",
            "Shipping is free from $75. Unused items can be returned within 30 days.",
          ],
        },
        {
          h: "What we would skip",
          ul: [
            "Anything that implies a flaw. A gift sold as \"anti-wrinkle\" says something you did not mean to say.",
            "Perfume and makeup, unless you know the exact product and shade.",
            "Subscription boxes. A gift should end, not become a monthly charge.",
          ],
        },
      ],
      faq: [
        { q: "Is an LED mask a safe gift?", a: "It is a cosmetic device, not a medical one. It is not for anyone who is pregnant, photosensitive, on light-sensitising medication or dealing with an active skin condition. If you are unsure, the Cozy Night or Silky Hair box has no device at all." },
        { q: "What if they already own a lot of skin care?", a: "Skip skin care and give them the evening instead. Cozy Night and Silky Hair do not overlap with anything already on a bathroom shelf." },
        { q: "Does it come gift-wrapped?", a: "No. It ships in ordinary shipping packaging. Have it delivered to your own address and wrap it yourself." },
        { q: "When is the last day to order for Christmas?", a: "November 26. Delivery takes 2 to 4 weeks, so after that date we cannot promise it arrives in time." },
      ],
      related: ["set-christmas-glow", "led-red-light-mask", "set-cozy-night", "set-silky-hair"],
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
      updated: "2026-09-29",
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
            "Si votre objectif, c'est un matin de cinq minutes, un appareil à 300 $ jamais rechargé vaut moins qu'un rouleau à 15 $ dans la porte du congélateur.",
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
      updated: "2026-09-29",
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
              ["The 7 AM Reset", "69,99 $", "Celle qui se prépare vite et se réveille bouffie"],
              ["Carry-On Glow", "79,99 $", "Celle qui voyage souvent, ou l'étudiante qui fait des allers-retours"],
              ["Duo Glow entre copines", "46,99 $", "Deux personnes : un ensemble pour toi, un pour ton amie"],
              ["Trousse Entre deux rendez-vous", "54,99 $", "Celle qui se fait faire les ongles et veut qu'ils restent soignés"],
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
    {
      slug: "beauty-gifts-under-50-canada",
      updated: "2026-09-29",
      title: "Cadeaux beauté à moins de 25 $ et de 50 $ au Canada, pour l'échange de cadeaux du bureau",
      answer:
        `Pour un échange de cadeaux au Canada, 25 $ achète un bon outil beauté (chez CMAC Beauty, un rouleau de glace à 14,99 $, un bonnet en satin à 16,99 $ ou un ensemble boucles sans chaleur à 24,99 $) et 50 $ achète un coffret complet, comme la boîte Soirée douillette à 41,99 $ ou le coffret Cheveux soyeux à 45,99 $. Commandez avant le 26 novembre pour une livraison avant Noël, et regroupez tout l'échange dans une seule commande : la livraison est gratuite dès ${FREE_FR}.`,
      intro:
        "L'échange de cadeaux du bureau vient avec un budget, une date limite et une collègue dont on ne connaît pas le type de peau. Les outils règlent ce dernier problème : aucune teinte à deviner, aucun parfum qui déplaît, aucun ingrédient qui irrite. Voici ce que chaque budget permet vraiment, avec les prix relevés le 29 septembre 2026.",
      blocks: [
        {
          h: "Moins de 25 $ : un bon outil",
          table: {
            head: ["Cadeau", "Prix", "Pour qui"],
            rows: [
              ["Rouleau de glace pour le visage", "14,99 $", "Celle qui se réveille avec le visage bouffi"],
              ["Masque de nuit effet satin", "12,99 $", "Celle qui a le sommeil léger, ou qui voyage"],
              ["Bonnet en satin ajustable", "16,99 $", "Cheveux bouclés ou texturés"],
              ["Serviette turban en microfibre", "17,99 $", "Cheveux longs et aucune patience pour les sécher"],
              ["Brosse pour le corps en soies naturelles", "22,99 $", "Celle qui aime les longues douches"],
              ["Ensemble boucles sans chaleur", "24,99 $", "Veut des boucles sans fer à friser"],
              ["Lampe à ongles UV/LED USB", "24,99 $", "Se fait elle-même ses ongles au gel"],
            ],
          },
        },
        {
          h: "Moins de 50 $ : un coffret complet",
          table: {
            head: ["Cadeau", "Prix", "Ce qu'il contient"],
            rows: [
              ["La boîte Soirée douillette", "41,99 $", "Rouleau de glace, masque de nuit effet satin, bas en molleton, chouchou, houppette. Rien à recharger"],
              ["Coffret Cheveux soyeux", "45,99 $", "Taie d'oreiller en satin, masseur pour le cuir chevelu, chouchou, bandeau spa"],
              ["Duo Glow entre copines", "46,99 $", "Deux trousses identiques (rouleau de glace, bandeau, chouchou) : une à offrir, une à garder"],
              ["Soirée pédi à la maison", "47,99 $", "Râpe électrique pour les pieds, bas en molleton, bandeau spa, chouchou"],
              ["Baguette éclat contour des yeux", "44,99 $", "Le seul appareil sous 50 $ qui a vraiment l'air d'un cadeau"],
            ],
          },
        },
        {
          h: "Le calcul de la livraison pour un échange",
          ul: [
            `La livraison coûte 9,99 $ sous ${FREE_FR} et elle est gratuite au-dessus. Un seul cadeau à 14,99 $ revient donc à 24,98 $ livré, alors que cinq cadeaux dans une même commande sont livrés gratuitement.`,
            "Vous faites les achats pour tout le bureau ? Une seule personne commande tout, paie une fois et distribue les boîtes. C'est la façon la moins chère d'acheter n'importe quel cadeau ici.",
            "Dix boîtes identiques ou plus, ou une livraison à plusieurs adresses : notre page entreprises (cmacbeauty.ca/entreprises) s'occupe des prix de quantité et de la livraison par adresse.",
            "Les coffrets arrivent dans l'emballage neutre du fournisseur. On ne fait pas d'emballage-cadeau, et on préfère le dire maintenant que le 20 décembre.",
          ],
        },
        {
          h: "La date limite",
          p: [
            "Nos colis prennent environ 2 à 4 semaines, porte à porte, parce qu'ils partent de l'entrepôt du fournisseur. La dernière date sûre pour commander pour Noël est le 26 novembre. Après, on ne peut plus promettre le 24, et on ne fera pas semblant.",
          ],
        },
      ],
      faq: [
        { q: "Puis-je envoyer un cadeau directement à une collègue ?", a: "Oui : entrez son adresse au moment de payer. Une commande va à une seule adresse ; pour plusieurs adresses, passez par la page entreprises." },
        { q: "Et si elle l'a déjà ?", a: "Les articles inutilisés se retournent sous 30 jours. Les articles d'hygiène, comme la houppette, seulement s'ils ne sont pas ouverts." },
        { q: "Pourquoi des outils plutôt que des soins ?", a: "Parce qu'on ne devine pas le type de peau de quelqu'un de l'autre bout du bureau. Un outil n'a ni teinte, ni parfum, ni ingrédient qui irrite." },
      ],
      related: ["set-cozy-night", "set-silky-hair", "facial-ice-roller", "heatless-curl-set"],
    },
    {
      slug: "exfoliating-mitt-vs-dry-brush",
      updated: "2026-09-29",
      title: "Gant exfoliant, brosse à sec ou brosse visage : lequel choisir, et à quelle fréquence",
      answer:
        "Utilisez un gant exfoliant de type hammam sur la peau mouillée, sans savon, une fois par semaine pour l'effet le plus poli ; une brosse à sec en soies naturelles deux minutes avant la douche si vous voulez une habitude quotidienne ; et une brosse visage douce pour une routine d'une minute sur le visage, jamais les outils pour le corps. Chez CMAC Beauty, ils coûtent 12,99 $, 22,99 $ et 14,99 $.",
      intro:
        "Trois outils, trois textures, et l'erreur la plus courante est d'utiliser le plus rugueux trop souvent. Voici ce que fait chacun, comment s'en servir, et quand le laisser au crochet.",
      blocks: [
        {
          h: "Les trois outils côte à côte",
          table: {
            head: ["Outil", "Comment l'utiliser", "À quelle fréquence", "Prix"],
            rows: [
              ["Gant exfoliant (gant de hammam)", "Laisser tremper quelques minutes dans l'eau chaude, sans savon, puis frotter fermement la peau mouillée", "Une fois par semaine", "12,99 $"],
              ["Brosse pour le corps en soies naturelles", "Sur la peau sèche, de longs mouvements vers le cœur, avant la douche", "Tous les jours ou aux deux jours, pression légère", "22,99 $"],
              ["Brosse visage à sec", "Sur le visage sec et propre, du centre vers l'extérieur, tout en légèreté, environ une minute", "Quelques fois par semaine", "14,99 $"],
            ],
          },
        },
        {
          h: "La seule règle : les outils pour le corps restent sur le corps",
          p: [
            "Le gant et la brosse pour le corps sont faits pour être rugueux, et la peau du visage est plus mince. Utilisez-les à partir du cou vers le bas. La brosse visage a des soies bien plus douces justement pour ça, et même avec elle la pression doit rester très légère.",
            "C'est aussi pour ça que le gant s'utilise une fois par semaine. Si la peau est sensible ou rouge après, vous avez frotté trop fort ou trop souvent : laissez-lui une plus longue pause.",
          ],
        },
        {
          h: "Quand s'abstenir",
          ul: [
            "Peau brûlée par le soleil, lésée, irritée ou fraîchement égratignée.",
            "Boutons actifs, pour la brosse visage.",
            "Le jour du rasage ou de l'épilation à la cire : attendez un jour.",
            "Si vous utilisez déjà des acides exfoliants ou des rétinoïdes, allez-y plus doucement et moins souvent, et demandez conseil à votre pharmacien en cas de doute.",
          ],
        },
        {
          h: "Les garder propres",
          ul: [
            "Gant : rincer, essorer et suspendre pour sécher après chaque usage. Lavable à la machine à l'eau froide, dans un filet.",
            "Brosse pour le corps : garder les soies au sec, les secouer et suspendre la brosse. Laver la tête au savon doux une fois par mois et la faire sécher soies vers le bas.",
            "Brosse visage : la secouer après usage, essuyer les soies avec un linge sec chaque semaine et garder le couvercle.",
            "Remplacez-les dès que les soies s'écartent ou que le gant devient mince et lisse.",
          ],
        },
      ],
      faq: [
        { q: "Un gant de hammam, c'est comme la « serviette Italie » coréenne ?", a: "Même principe : un tissage de viscose rugueux, utilisé sur la peau mouillée pour décoller les peaux mortes. Le nom change selon le pays (kessa au hammam, serviette Italie dans les spas coréens)." },
        { q: "Peut-on utiliser le gant avec du savon ?", a: "Non. Le savon rend la peau glissante et le tissage n'accroche plus. Laissez tremper, utilisez le gant sur la peau mouillée sans produit, puis lavez-vous ensuite." },
        { q: "Le brossage à sec détoxifie-t-il le corps ou réduit-il la cellulite ?", a: "On ne promet que ce qui se voit et se sent : une peau plus lisse, qui semble polie. Les promesses de détox et de cellulite ne sont pas assez appuyées pour qu'on les fasse, et on préfère que vous achetiez la brosse pour la bonne raison." },
      ],
      related: ["exfoliating-mitt", "bristle-body-brush", "face-dry-brush"],
    },
    {
      slug: "satin-vs-silk-pillowcase",
      updated: "2026-09-29",
      title: "Taie d'oreiller en satin ou en soie : la vraie différence",
      answer:
        "La soie est une fibre naturelle de protéine ; le satin est un tissage, le plus souvent en polyester. Les deux offrent aux cheveux et à la peau une surface plus lisse que le coton, ce que beaucoup de gens remarquent par des cheveux moins frisottés le matin. La soie est plus fraîche et coûte plusieurs fois plus cher ; le satin de polyester coûte une fraction du prix, va à la machine et dure bien. La nôtre est en satin de polyester à 9,99 $, et on l'appelle satin, pas soie.",
      intro:
        "La moitié des annonces disent « soyeux », « effet soie » ou « satin de soie », et ce n'est pas un hasard. Voici comment savoir ce que vous achetez vraiment, et lequel vaut la peine pour vous.",
      blocks: [
        {
          h: "Satin et soie côte à côte",
          table: {
            head: ["", "Satin (polyester)", "Soie (de mûrier)"],
            rows: [
              ["Ce que c'est", "Un tissage lisse et brillant ; la fibre est le plus souvent du polyester", "Une fibre naturelle de protéine tirée du cocon du ver à soie"],
              ["Au toucher", "Lisse et glissant, un peu plus chaud", "Lisse, plus frais, respire un peu mieux"],
              ["Entretien", "Lavable à la machine, sèche vite, pardonne les erreurs", "Lavage à la main ou délicat à l'eau froide, savon doux, sans chaleur"],
              ["Prix", "Bas : notre taie en satin est à 9,99 $", "Plusieurs fois le prix du satin"],
              ["Pour qui", "La plupart des gens, et quiconque veut essayer avant de dépenser plus", "Celles qui ont chaud la nuit, ou qui tiennent à la fibre naturelle"],
            ],
          },
        },
        {
          h: "Ce que veut dire « momme »",
          p: [
            "Le momme est le poids du tissu de soie. Les taies d'oreiller font souvent de 19 à 25 mommes ; plus le chiffre est élevé, plus le tissu est dense, durable et cher. Le satin de polyester n'a pas de momme : une annonce « satin 22 mommes » mélange deux choses.",
          ],
        },
        {
          h: "Comment savoir ce que vous achetez",
          ul: [
            "« Satin » sur une étiquette décrit le tissage, pas la fibre. Cherchez la composition : 100 % polyester ou 100 % soie de mûrier.",
            "« Soyeux », « effet soie » et « toucher soie » veulent dire que ce n'est pas de la soie.",
            "Au Canada, les textiles doivent indiquer leur composition sur l'étiquette. Si un produit ne vous dit pas en quoi il est fait, passez votre chemin.",
            "De la vraie soie au prix du satin, c'est un signal d'alarme, pas une aubaine.",
          ],
        },
        {
          h: "Le garder lisse",
          ul: [
            "Satin : laver à l'eau froide avec des couleurs semblables, sans assouplissant, sécher à basse température ou à plat.",
            "Soie : lavage à la main à l'eau froide ou cycle délicat dans un filet, savon pour la soie, séchage à plat à l'abri du soleil.",
            "Dans les deux cas : un bonnet en satin ou un chouchou au lieu d'un élastique serré fait plus pour les cheveux du matin que n'importe quel produit seul.",
          ],
        },
      ],
      faq: [
        { q: "Une taie en satin empêche-t-elle les rides ?", a: "Aucune taie ne change les rides. Les plis de sommeil au réveil sont temporaires ; une surface plus lisse peut en laisser moins, et c'est honnêtement tout." },
        { q: "Le satin convient-il aux cheveux bouclés ou texturés ?", a: "Beaucoup de personnes aux cheveux bouclés ou texturés utilisent le satin justement pour ça, souvent avec un bonnet en satin, parce qu'une surface lisse tire moins sur les cheveux pendant la nuit." },
        { q: "Pourquoi votre taie en satin est-elle seulement à 9,99 $ ?", a: "Parce qu'elle est en satin de polyester, vendue sans commission de place de marché, et que la livraison est facturée à part. Ce n'est pas de la soie, et elle n'est pas vendue au prix de la soie." },
      ],
      related: ["satin-pillowcase", "satin-bonnet", "satin-beauty-sleep-set", "set-silky-hair"],
    },
    {
      slug: "black-friday-beauty-canada-2026",
      updated: "2026-09-29",
      title: "Vendredi fou 2026 au Canada : ce qui arrive avant Noël, et comment repérer un faux rabais",
      answer:
        "Chez CMAC Beauty, la semaine du Vendredi fou va du 20 novembre au 1er décembre 2026 : 20 % de rabais sur tous les coffrets avec le code BF20. Les commandes passées d'ici le 26 novembre devraient arriver avant Noël, puisque la livraison prend de 2 à 4 semaines ; à partir du 27 novembre, le rabais continue mais la livraison avant Noël n'est plus garantie. L'après-Noël va du 26 décembre au 4 janvier, avec 25 % de rabais sur les coffrets grâce au code BOXING25.",
      intro:
        "Le Vendredi fou, c'est la semaine de l'année où l'on voit le plus de rabais maquillés et de cadeaux qui arrivent le 28 décembre. Voici notre calendrier, avec le calcul de livraison déjà fait, et les vérifications qui séparent un vrai rabais d'un faux.",
      blocks: [
        {
          h: "Notre calendrier des Fêtes",
          table: {
            head: ["Dates", "Quoi", "Avant Noël ?"],
            rows: [
              ["Jusqu'au 19 novembre", `Prix habituels, livraison gratuite dès ${FREE_FR}`, "Oui"],
              ["Du 20 au 26 novembre", "Semaine du Vendredi fou : 20 % de rabais sur tous les coffrets avec le code BF20", "Oui"],
              ["Du 27 novembre au 1er décembre", "Vendredi fou : BF20 continue", "Non garanti"],
              ["Du 26 décembre au 4 janvier", "Après-Noël : 25 % de rabais sur les coffrets avec le code BOXING25", "Après les Fêtes"],
            ],
          },
        },
        {
          h: "Comment reconnaître un vrai rabais du Vendredi fou",
          ul: [
            "Le prix « avant » doit être un prix que la boutique a vraiment demandé, pendant une vraie période, avant la vente. Au Canada, gonfler un prix habituel pour annoncer une plus grosse économie est une publicité trompeuse au sens de la Loi sur la concurrence.",
            "Vérifiez le prix quelques semaines avant. Un produit à 59,99 $ en octobre qui devient « 59,99 $, −40 % » en novembre n'a aucun rabais.",
            "Un compte à rebours qui repart à zéro quand on recharge la page est une technique de vente, pas une date limite.",
            "Comparez les totaux avec la livraison, pas les pourcentages en gros caractères. −30 % plus 15 $ de livraison peut coûter plus cher que −20 % livré gratuitement.",
          ],
        },
        {
          h: "Nos propres règles pour la saison",
          ul: [
            "Nos rabais s'appliquent sur notre prix habituel, celui du site toute l'année. On n'augmente pas nos prix avant une vente pour faire paraître l'économie plus grosse.",
            "Chaque code dit ce qu'il donne et quand il se termine, et il disparaît à la fin.",
            "Nos paliers « 3 articles −10 %, 5 articles −15 % » sont suspendus pendant un code saisonnier : les deux ne se cumulent jamais.",
            "La date limite de Noël est le 26 novembre. Après, on écrit « non garanti » plutôt que d'espérer.",
          ],
        },
      ],
      faq: [
        { q: "Puis-je utiliser BF20 sur un coffret à offrir à Noël ?", a: "Oui, du 20 au 26 novembre. Les commandes passées pendant cette période devraient arriver avant Noël." },
        { q: "BF20 se combine-t-il avec le rabais de 3 articles ?", a: "Non. Les paliers « Compose ta trousse » sont suspendus pendant un code saisonnier : c'est l'un ou l'autre, jamais les deux." },
        { q: "Vos prix vont-ils monter avant le Vendredi fou ?", a: "Non. On n'augmente pas nos prix avant une vente pour faire paraître un rabais plus gros ; le code s'applique sur le prix que vous voyez aujourd'hui." },
      ],
      related: ["set-christmas-glow", "set-cozy-night", "set-for-mom", "set-silky-hair"],
    },
    {
      slug: "gel-manicure-between-appointments",
      updated: "2026-09-29",
      title: "Faire durer sa manucure au gel entre deux rendez-vous",
      answer:
        "Une manucure au gel reste belle habituellement deux à trois semaines. Ce qui la fait durer est simple : des gants pour la vaisselle et les produits ménagers, de la crème à mains ou de l'huile à cuticules chaque jour, ne jamais arracher un coin qui décolle, et limer les ongles naturels dans un seul sens. On entretient les ongles naturels à la maison ; les réparations et le retrait du gel, on les laisse à sa technicienne. Notre trousse Entre deux rendez-vous est à 54,99 $.",
      intro:
        "La plupart des manucures au gel ne ratent pas au salon. Elles ratent à l'évier, sur un couvercle récalcitrant ou quand on gratte un coin qui lève, devant la télé. Voici ce qui aide, ce qu'on peut faire soi-même, et ce qu'on garde pour le prochain rendez-vous.",
      blocks: [
        {
          h: "Ce qui la fait vraiment durer",
          ul: [
            "Des gants pour l'eau de vaisselle et les produits ménagers. L'eau chaude et le détergent, c'est ce qui décolle le gel sur les bords.",
            "De la crème à mains ou de l'huile à cuticules chaque jour, sur les cuticules autant que sur les mains.",
            "Les ongles ne sont pas des outils : pas pour ouvrir une canette ni gratter une étiquette.",
            "Ne jamais arracher un coin qui décolle. Le gel qui part d'un coup emporte la couche du dessus de l'ongle naturel.",
            "Limer dans un seul sens, du côté vers le centre. Limer en va-et-vient effiloche le bord.",
          ],
        },
        {
          h: "À la maison ou au studio ?",
          table: {
            head: ["Tâche", "À la maison", "À laisser à votre technicienne"],
            rows: [
              ["Donner forme aux ongles naturels", "Lime en verre (12,99 $), ou le stylo soin des ongles 5 en 1 (29,99 $) sur ongles naturels nus", "—"],
              ["Entretenir les cuticules", "Les repousser après la douche ; couper seulement les peaux détachées (Duo soin des cuticules, 14,99 $)", "Le travail complet des cuticules"],
              ["Un coin de gel qui lève", "Le garder au sec, ne pas l'arracher, prendre rendez-vous pour un remplissage", "Réparation ou remplissage"],
              ["Retirer le gel", "Jamais en le soulevant ni en limant fort", "Le retrait fait correctement"],
              ["Faire son gel soi-même", "Lampe UV/LED USB (24,99 $) : couches minces, 30 à 60 secondes par couche", "—"],
            ],
          },
        },
        {
          h: "Sous la lampe",
          p: [
            "Beaucoup de gens préfèrent garder le dessus des mains couvert pendant que le gel sèche. Nos gants couvrants (8,99 $) sont en tissu, avec le bout des doigts dégagé : la technicienne travaille comme d'habitude. C'est une couverture, pas un écran solaire.",
          ],
        },
      ],
      faq: [
        { q: "À quelle fréquence utiliser le stylo soin des ongles ?", a: "Une fois par semaine suffit, sur des ongles naturels propres et nus, à la vitesse la plus basse." },
        { q: "Puis-je limer mon gel avec ?", a: "Non. Le gel et le gel de construction, on les laisse à sa technicienne ; le stylo sert aux ongles naturels entre deux visites." },
        { q: "Une lampe USB vaut-elle une lampe de salon ?", a: "C'est une lampe compacte de 24 LED pour les retouches et le gel maison ; les lampes de salon sont plus grandes. Suivez le temps de séchage indiqué sur votre vernis, habituellement 30 à 60 secondes par couche." },
      ],
      related: ["set-between-appointments", "cuticle-care-duo", "glass-nail-file", "usb-nail-lamp"],
    },
    {
      slug: "beauty-gift-for-mom-canada",
      updated: "2026-10-02",
      title: "Quoi offrir à sa mère pour que ça serve vraiment",
      answer:
        "Les cadeaux qui servent sont ceux où il n'y a rien à deviner : pas de teinte, pas de taille, pas de parfum, rien à apprendre. Une taie d'oreiller en satin à 9,99 $, un masseur de cuir chevelu à 29,99 $ ou un rouleau de glace à 14,99 $ passent tous le test. Notre coffret Pour maman est à 107,99 $. Pour Noël, commandez avant le 26 novembre : la livraison prend de 2 à 4 semaines.",
      intro:
        "Les cadeaux beauté ratent pour des raisons prévisibles. La teinte n'est pas la bonne, le parfum n'est pas le sien, l'appareil exige une technique qu'elle n'a aucune envie d'apprendre. Voici comment en choisir un qui finit sur la table de chevet plutôt que dans un tiroir.",
      blocks: [
        {
          h: "Le test du tiroir",
          ul: [
            "Rien à se tromper. Pas de teinte de fond de teint, pas de taille, pas de parfum. Une taie, un rouleau ou un bandeau vont à tout le monde.",
            "Rien à apprendre. Si ça demande une technique ou un tutoriel, ça sert deux fois.",
            "Rien à remplacer. Évitez ce qui a des recharges ou des cartouches qu'elle devra racheter.",
            "Ça entre dans une routine qu'elle a déjà. Le meilleur cadeau se glisse dans une soirée qu'elle passe déjà sur le divan.",
          ],
        },
        {
          h: "Selon le budget",
          table: {
            head: ["Budget", "Ce qu'on choisirait", "Pourquoi ça marche"],
            rows: [
              ["Moins de 20 $", "Taie en satin 9,99 $, masque de nuit 12,99 $, rouleau de glace 14,99 $", "Une seule taille, un seul choix, utile tout de suite"],
              ["20 à 50 $", "Masseur de cuir chevelu 29,99 $, bigoudis sans chaleur 24,99 $, serviette turban 17,99 $", "De petits appareils sans apprentissage et sans recharge"],
              ["40 à 50 $ en coffret", "Soirée douillette 41,99 $, Cheveux soyeux 45,99 $", "Arrive complet et prêt à offrir ; rien d'autre à acheter"],
              ["Plus de 100 $", "Coffret Pour maman 107,99 $", "Appareil à microcourant, rouleau de glace, taie en satin et bandeau spa dans une seule boîte"],
            ],
          },
        },
        {
          h: "Ce qu'on éviterait",
          ul: [
            "Tout ce qui a une teinte : fond de teint, rouge à lèvres, crème teintée. Les chances sont contre vous.",
            "Le parfum, sauf si vous l'avez senti sur elle.",
            "Les appareils qui promettent une transformation. Visez agréable plutôt que spectaculaire, et le cadeau est mieux reçu.",
            "Les abonnements. Un cadeau devrait se terminer, pas devenir une ligne mensuelle sur un relevé.",
          ],
        },
      ],
      faq: [
        { q: "Et si elle a déjà tout ?", a: "Remplacez par une plus belle version quelque chose qu'elle utilise tous les jours. Une taie en satin au lieu du coton coûte 9,99 $ et elle le sentira dès la première nuit." },
        { q: "Un appareil beauté, est-ce un bon cadeau pour quelqu'un dans la soixantaine ou la soixante-dizaine ?", a: "Nos appareils sont cosmétiques, pas médicaux. Si elle a une condition de peau, est photosensible ou prend un médicament photosensibilisant, demandez d'abord à son médecin — et c'est vrai à tout âge." },
        { q: "Quelle est la dernière date pour commander pour Noël ?", a: "Le 26 novembre. La livraison prend de 2 à 4 semaines, alors après cette date on ne peut pas promettre que ça arrive à temps, et on préfère le dire plutôt que d'espérer." },
      ],
      related: ["set-for-mom", "satin-pillowcase", "electric-scalp-massager", "facial-ice-roller"],
    },
    {
      slug: "beauty-gift-for-partner-canada",
      updated: "2026-10-03",
      title: "Un cadeau beauté pour sa blonde (ou son chum), quand on n'y connaît rien",
      answer:
        "Choisissez quelque chose sans teinte, sans parfum et sans taille, qui fonctionne dès la sortie de la boîte, et offrez-le comme du temps pour soi plutôt que comme une correction. Notre coffret Éclat de Noël à 75,99 $ (masque DEL, masque de nuit, bandeau spa et chouchou) est le choix sûr ; la boîte Soirée douillette à 41,99 $ est l'option sans aucun appareil. Pour Noël, commandez avant le 26 novembre : la livraison prend de 2 à 4 semaines.",
      intro:
        "Beaucoup de cadeaux beauté sont achetés par des gens qui n'utilisent eux-mêmes aucun produit de beauté. Ce n'est pas un problème. Aucune des règles ci-dessous ne demande de connaître les soins de la peau, et aucune ne demande de deviner une teinte.",
      blocks: [
        {
          h: "Trois règles qui en savent plus que vous",
          ul: [
            "Pas de teinte, pas de parfum, pas de taille. Fond de teint, parfum et vêtements, c'est là que les cadeaux ratent. Un appareil, un ensemble en satin ou un coffret évite les trois.",
            "Complet dans la boîte. S'il faut une recharge, une cartouche ou une application, ça devient un devoir. Tout ce qui est dans nos coffrets fonctionne tel quel ; le masque DEL se recharge par USB.",
            "Offrez du temps, pas une correction. « Dix minutes pour toi », ça fait plaisir. Tout ce qui ressemble à « ça va régler tes rides », non — et de toute façon, on ne le promet pas.",
          ],
        },
        {
          h: "Selon le budget",
          table: {
            head: ["Budget", "Ce qu'on choisirait", "Pourquoi ça marche"],
            rows: [
              ["Moins de 50 $", "Boîte Soirée douillette 41,99 $ ou coffret Cheveux soyeux 45,99 $", "Aucun appareil, rien à apprendre. Soirée douillette : rouleau de glace, masque de nuit, bas en molleton, chouchou et houppette ; Cheveux soyeux : taie en satin, masseur de cuir chevelu, chouchou et bandeau"],
              ["50 à 80 $", "Le masque DEL seul à 59,99 $, ou le coffret Éclat de Noël à 75,99 $", "Le coffret ajoute un masque de nuit, un bandeau spa et un chouchou, arrive en un seul colis et la livraison est gratuite"],
              ["Autour de 100 $", "Rituel Éclat de minuit 104,99 $", "Brosse nettoyante sonique, masque DEL et ensemble sommeil en satin de 4 pièces ; un chouchou en satin est ajouté gratuitement aux commandes de plus de 100 $"],
              ["Pour faire les choses en grand", "Le Rituel complet 169,99 $", "Masque DEL, appareil à microcourant, rouleau de glace, bandeau spa et ensemble sommeil en satin : notre coffret le plus complet"],
            ],
          },
        },
        {
          h: "Le côté pratique",
          ul: [
            "Pour Noël, commandez avant le 26 novembre. La livraison prend de 2 à 4 semaines, et on préfère vous le dire maintenant plutôt que de promettre le 24.",
            "Faites-le livrer chez vous si vous voulez l'emballer. Il arrive dans un emballage d'expédition, pas dans du papier cadeau.",
            "Livraison gratuite dès 75 $. Les articles non utilisés peuvent être retournés dans les 30 jours.",
          ],
        },
        {
          h: "Ce qu'on éviterait",
          ul: [
            "Tout ce qui sous-entend un défaut. Un cadeau vendu comme « antirides » dit quelque chose que vous ne vouliez pas dire.",
            "Le parfum et le maquillage, sauf si vous connaissez le produit et la teinte exacts.",
            "Les abonnements. Un cadeau devrait se terminer, pas devenir un prélèvement mensuel.",
          ],
        },
      ],
      faq: [
        { q: "Un masque DEL, est-ce un cadeau sans risque ?", a: "C'est un appareil cosmétique, pas un appareil médical. Il ne convient pas aux personnes enceintes, photosensibles, sous médicament photosensibilisant ou avec une condition de peau active. Dans le doute, les coffrets Soirée douillette et Cheveux soyeux ne contiennent aucun appareil." },
        { q: "Et si elle (ou il) a déjà plein de produits de soin ?", a: "Laissez tomber les soins et offrez plutôt la soirée. Soirée douillette et Cheveux soyeux ne font doublon avec rien de ce qui est déjà sur la tablette de la salle de bain." },
        { q: "Est-ce que c'est emballé pour offrir ?", a: "Non. Le colis arrive dans un emballage d'expédition ordinaire. Faites-le livrer à votre adresse et emballez-le vous-même." },
        { q: "Quelle est la dernière date pour commander pour Noël ?", a: "Le 26 novembre. La livraison prend de 2 à 4 semaines, alors après cette date on ne peut pas promettre que ça arrive à temps." },
      ],
      related: ["set-christmas-glow", "led-red-light-mask", "set-cozy-night", "set-silky-hair"],
    },
  ],
};

export function articleBySlug(locale: Locale, slug: string): Article | null {
  return JOURNAL[locale].find((a) => a.slug === slug) ?? null;
}

export const JOURNAL_SLUGS = JOURNAL.en.map((a) => a.slug);

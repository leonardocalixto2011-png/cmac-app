/**
 * Seed — CMAC Beauty.
 *
 * Catalogue sourced on CJdropshipping (research:
 * ../OneDrive/Claude projets/cmac-store/research/cj-catalog-2026-09-21.json).
 * Every item ships China → Canada by CJPacket JYSP Sensitive (3–5 business days
 * processing, since CJ buys from the factory first, then 7–15 days transit). Prices are CAD, chosen per the pricing rule
 * (≈2.6–3.2× landed CAD) except where the owner fixed them.
 *
 * COPY RULE (Health Canada): cosmetic / appearance-only. Never "treats",
 * "heals", "cures", "stimulates collagen", "reduces inflammation", "pain
 * relief", "clinically proven", "therapy", "slimming", or any disease word. No
 * specs that the CJ listing doesn't state. Electric devices keep the "Cosmetic
 * at-home device, not a medical device" line + contraindications.
 *
 * Idempotent, admin edits win:
 *  - New slug → created with everything below (images/videos from ./media.ts when present).
 *  - Images → replaced by the processed Cloudinary set (./media.ts) ONLY while every
 *    current image URL is still a CJ CDN photo (cjdropshipping.com / aliyuncs.com), i.e.
 *    untouched supplier photos. Admin-pasted URLs are never replaced.
 *  - Videos → filled only while `videos` is empty.
 *  - Existing row → `sortOrder` always; `images`, `options`, `supplierUrl`,
 *    `supplierSku`, `shippingNote` (and, for `refreshCopyWhenEmpty` items, the
 *    copy) ONLY while the row still has no images, i.e. was never edited with
 *    real photos in /admin. Retired items (`active: false`) are switched off
 *    under the same condition, so the owner can re-enable them after adding
 *    photos.
 *  - RESET_PRODUCTS=1 overwrites copy / prices / tags / options from this file.
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SET_CONTENTS } from "../src/lib/sets";
import { MEDIA } from "./media";
import { ensureSeasonalCodes } from "../src/lib/stripe-coupons";

const prisma = new PrismaClient();

const FOOTER_EN = "<p><em>12-month defect coverage. 30-day returns on unused items.</em></p>";
const FOOTER_FR = "<p><em>Garantie de 12 mois contre les défauts. Retours sous 30 jours pour les articles inutilisés.</em></p>";
const FOOTER_HYGIENE_EN = "<p><em>30-day returns on unopened items.</em></p>";
const FOOTER_HYGIENE_FR = "<p><em>Retours sous 30 jours pour les articles non ouverts.</em></p>";

const OSS = "https://oss-cf.cjdropshipping.com/product";
const CF = "https://cf.cjdropshipping.com";
const CJ = "https://cjdropshipping.com/product";
/** Second supplier (2026-09-25): AliExpress listings that ship to Canada, ordered by hand. */
const AE = "https://www.aliexpress.com/item";
/** Product photos we host ourselves (downloaded from the supplier, resized to 1400 px). */
const SITE = "https://cmacbeauty.ca/products";

type OptionValue = { value: string; labelEn: string; labelFr: string };
type Option = { nameEn: string; nameFr: string; values: OptionValue[] };

type SeedProduct = {
  slug: string;
  nameEn: string;
  nameFr: string;
  tagline: string;
  taglineFr: string;
  priceCents: number;
  compareAtCents: number | null;
  tags: string[];
  sortOrder: number;
  descriptionEn: string;
  descriptionFr: string;
  options: Option[];
  images: string[];
  supplierUrl: string | null;
  supplierSku: string | null;
  shippingNote: string | null;
  active?: boolean;
  /** Also replace copy on the one-time fill (the launch copy described a different item). */
  refreshCopyWhenEmpty?: boolean;
  /** Options as a previous seed wrote them: a row still holding exactly these gets `options`. */
  legacyOptions?: Option[];
};

const colour = (values: OptionValue[]): Option => ({ nameEn: "Colour", nameFr: "Couleur", values });

// "Was" prices seeded before launch that the product never actually sold at → cleared if still untouched.
const INVENTED_COMPARE_AT: Record<string, number> = { "led-red-light-mask": 8999 };

/**
 * 2026-09-22 price review against the Canadian market (Amazon.ca ranges): the
 * accessories were priced above what the same item sells for here, which reads
 * badly next to the devices, where we are cheap. [slug, old price, new price] —
 * applied only while the row still holds the old price, so /admin edits win.
 */
/** Rows that must carry the "gift" tag (the /collections/gifts page reads it). Added if missing, never removed. */
const GIFT_TAGGED = [
  "set-full-ritual",
  "set-7am-reset",
  "set-midnight-glow",
  "set-sweater-weather",
  "set-pink-pop",
  "set-carry-on-glow",
  "set-bestie-duo",
  "set-between-appointments",
  "set-pedi-night",
  "set-mani-pedi",
  "set-fall-basket",
  "set-christmas-glow",
  "set-cozy-night",
  "set-for-mom",
  "set-first-glow",
  "set-silky-hair",
  "rose-gold-manicure-kit",
  "satin-beauty-sleep-set",
];

/** Rows shown on /collections/hair (tag "hair"). Added if missing, never removed. */
const HAIR_TAGGED = ["satin-pillowcase", "satin-scrunchie", "satin-beauty-sleep-set", "electric-scalp-massager", "spa-headband"];

/** Collection tags a row must carry (gift, hair): the new list, or null when nothing changes. */
function addGiftTag(slug: string, tags: string[]): string[] | null {
  let out = tags;
  if (GIFT_TAGGED.includes(slug) && !out.includes("gift")) out = [...out, "gift"];
  if (HAIR_TAGGED.includes(slug) && !out.includes("hair")) out = [...out, "hair"];
  return out === tags ? null : out;
}

const PRICE_REVIEW: [string, number, number][] = [
  ["satin-scrunchie", 1599, 1299],
  ["spa-headband", 1699, 1299],
  ["cozy-fleece-socks", 1799, 1499],
  ["reusable-cleansing-puff", 2099, 1599],
  ["satin-sleep-mask", 2999, 2299],
  ["electric-scalp-massager", 3499, 2999],
  ["electric-makeup-brush-cleaner", 3199, 2699],
  ["electric-foot-file", 4499, 3499],
  ["rose-gold-manicure-kit", 2999, 2499],
  ["pink-shell-makeup-pouch", 2499, 1999],
];

const PRODUCTS: SeedProduct[] = [
  // ---------------------------------------------------------------- GLOW
  {
    slug: "led-red-light-mask",
    nameEn: "LED Red Light Mask",
    nameFr: "Masque LED lumière rouge",
    tagline: "Hands-free glow, 10 minutes a night",
    taglineFr: "Un éclat mains libres, 10 minutes par soir",
    priceCents: 5999,
    // No "was" price: it was never sold at a higher price (Competition Act, ordinary selling price)
    compareAtCents: null,
    tags: ["glow", "led", "hands-free", "new"],
    sortOrder: 0,
    descriptionEn: `<p><strong>The part of the routine where you do nothing.</strong> Put it on, lie back, let the light run. The LED Red Light Mask is built for evening use at home: no downtime, no gel, no technique to learn.</p><h3>How to use</h3><ol><li>Cleanse and dry your face.</li><li>Fit the mask and start a 10-minute session.</li><li>Follow with your usual serum and moisturizer.</li></ol><p>Start with 3 sessions a week. Most people fold it into their wind-down while reading or scrolling.</p><h3>Good to know</h3><ul><li>Cosmetic at-home device, not a medical device.</li><li>Not for use if you are pregnant, photosensitive, on light-sensitizing medication, or have an active skin condition. Ask your doctor if unsure.</li><li>Keep eyes closed during sessions.</li><li>Wipe with a dry cloth after use. Do not submerge.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>La partie de la routine où vous ne faites rien.</strong> Vous l'enfilez, vous vous allongez, vous laissez la lumière faire son travail. Le Masque LED lumière rouge est conçu pour les soirées à la maison : pas de temps d'arrêt, pas de gel, aucune technique à apprendre.</p><h3>Mode d'emploi</h3><ol><li>Nettoyez et séchez votre visage.</li><li>Ajustez le masque et lancez une séance de 10 minutes.</li><li>Terminez avec votre sérum et votre hydratant habituels.</li></ol><p>Commencez par 3 séances par semaine. La plupart des gens l'intègrent à leur moment détente, en lisant ou en scrollant.</p><h3>Bon à savoir</h3><ul><li>Appareil cosmétique à usage domestique, pas un dispositif médical.</li><li>À éviter si vous êtes enceinte, photosensible, sous médication photosensibilisante, ou si vous avez une affection cutanée active. En cas de doute, consultez votre médecin.</li><li>Gardez les yeux fermés pendant les séances.</li><li>Essuyez avec un linge sec après usage. Ne pas immerger.</li></ul>${FOOTER_FR}`,
    options: [],
    images: [
      // Only the clean main shot: every other CJ photo shows the bundled serum bottle
      // or multi-pack labels. Replace with own sample photos when available.
      `${OSS}/2025/04/14/08/56eb45a5-ec87-4856-8b42-6df0e3a47331_trans.jpeg`,
    ],
    supplierUrl: `${CJ}/touch-screen-seven-color-light-mask-led-photon-skin-rejuvenation-p-1798542129166426112.html`,
    supplierSku: "CJPF205440201AZ",
    shippingNote:
      'CJ variant "Set" (CJPF205440201AZ, 670 g, $6.70 USD). CJ no longer sells separate colour / gift-box SKUs, only Set / Set3-5 bundles. CJPacket JYSP Sensitive to CA $11.92, 7-15 days. Landed $18.62 USD. Box includes a small bottle of "original liquid": ask CJ to remove it; never mention it on the site.',
  },
  {
    slug: "under-eye-glow-wand",
    nameEn: "Under-Eye Glow Wand",
    nameFr: "Baguette éclat contour des yeux",
    tagline: "Warmth, soft light and a gentle hum for the eye area",
    taglineFr: "Chaleur, lumière douce et vibration légère pour le contour des yeux",
    priceCents: 4499,
    compareAtCents: null,
    tags: ["glow", "eye", "warmth", "new"],
    sortOrder: 4,
    descriptionEn: `<p><strong>A pocket-size wand for the most tired-looking part of the face.</strong> The rounded head warms up, glows with soft coloured light and vibrates gently, so gliding it around the eye area after your eye cream feels like a small spa moment. It helps the under-eye area look more rested and makes your routine feel less rushed.</p><h3>How to use</h3><ol><li>Apply your usual eye cream or serum.</li><li>Pick one of the 3 modes and glide the head slowly from the inner corner outward, under the eye and along the brow bone. Never press on the eyelid.</li><li>One or two minutes per side, then let your product settle.</li></ol><p>Use in the evening, or in the morning for a fresher look before makeup.</p><h3>Good to know</h3><ul><li>Cosmetic at-home device, not a medical device.</li><li>Do not use if you are pregnant, have a pacemaker or implanted electronic device, epilepsy, are photosensitive or on light-sensitizing medication, or have an active skin condition or broken skin around the eyes. Ask your doctor if unsure.</li><li>Keep eyes closed and never place the wand on the eyeball or eyelid.</li><li>Wipe the head clean after each use.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>Une baguette format poche pour la zone du visage qui a le plus souvent l'air fatiguée.</strong> La tête arrondie tiédit, s'illumine d'une lumière colorée douce et vibre légèrement : la glisser autour des yeux après votre crème contour devient un petit moment spa. Elle aide le contour des yeux à paraître plus reposé et rend la routine moins pressée.</p><h3>Mode d'emploi</h3><ol><li>Appliquez votre crème ou sérum contour des yeux habituel.</li><li>Choisissez l'un des 3 modes et glissez la tête lentement du coin interne vers l'extérieur, sous l'œil et le long de l'arcade. N'appuyez jamais sur la paupière.</li><li>Une à deux minutes par côté, puis laissez le produit pénétrer.</li></ol><p>À utiliser le soir, ou le matin pour un air plus frais avant le maquillage.</p><h3>Bon à savoir</h3><ul><li>Appareil cosmétique à usage domestique, pas un dispositif médical.</li><li>Ne pas utiliser si vous êtes enceinte, portez un stimulateur cardiaque ou un dispositif électronique implanté, souffrez d'épilepsie, êtes photosensible ou sous médication photosensibilisante, ou avez une affection cutanée active ou une peau lésée autour des yeux. En cas de doute, consultez votre médecin.</li><li>Gardez les yeux fermés et ne posez jamais la baguette sur le globe oculaire ni sur la paupière.</li><li>Essuyez la tête après chaque utilisation.</li></ul>${FOOTER_FR}`,
    options: [
      colour([
        { value: "English-Rose Gold", labelEn: "Rose gold", labelFr: "Or rose" },
        { value: "English-Blue", labelEn: "Blue", labelFr: "Bleu" },
      ]),
    ],
    images: [
      `${OSS}/2024/06/18/01/3e75a820-9597-4553-a1f6-a9005cb5828b.jpg`,
      `${OSS}/2024/05/23/08/180ede89-64de-48f6-9d00-8045c38a427b.jpg`,
      `${OSS}/2024/05/23/08/8a414945-3a40-4493-a7e7-b5ed558641c5_trans.jpeg`,
      `${OSS}/2024/05/23/08/8be3d334-6e23-4abb-ba27-83c2860ba2fc_trans.jpeg`,
      `${OSS}/2024/05/23/08/66fffa72-b822-4328-b824-da5ec02421ba_trans.jpeg`,
      `${OSS}/2024/05/23/09/b96bb3e2-7f49-49a8-a86c-16ff44ef2141.jpg`,
    ],
    supplierUrl: `${CJ}/4-colors-electric-eye-massager-red-blue-light-massage-eye-beautification-instrument-therapeutic-warmth-face-massage-p-1783744478788988928.html`,
    supplierSku: "CJYD202121801AZ",
    shippingNote:
      "CJ variants (English version): Rose gold = CJYD202121801AZ, Blue = CJYD202121803CX. $6.63 USD, 100 g. CJPacket JYSP Sensitive to CA $4.54, 7-15 days. Landed $11.17 USD. CJ listing uses therapy / 660 nm / microcurrent claims: never reuse its copy.",
  },
  {
    slug: "sonic-silicone-cleansing-brush",
    nameEn: "Sonic Silicone Cleansing Brush",
    nameFr: "Brosse nettoyante sonique en silicone",
    tagline: "The first step, made softer",
    taglineFr: "La première étape, en plus doux",
    priceCents: 3499,
    compareAtCents: null,
    tags: ["glow", "cleansing", "essentials", "new"],
    sortOrder: 5,
    descriptionEn: `<p><strong>Every good evening routine starts with a clean canvas.</strong> Soft food-grade silicone bristles and a gentle sonic vibration work your cleanser in for a more thorough-feeling cleanse than hands alone, so skin looks fresh and ready for the rest of the ritual. Waterproof (IPX7), USB-rechargeable, and small enough for a travel bag.</p><h3>How to use</h3><ol><li>Wet your face and the brush, then apply your usual cleanser.</li><li>Switch on and move the brush in small circles: forehead, nose, chin, then cheeks. About one minute in total.</li><li>Rinse your face, rinse the brush, pat dry.</li></ol><p>Once a day is plenty. Use a lighter touch on sensitive areas.</p><h3>Good to know</h3><ul><li>Cosmetic at-home device, not a medical device.</li><li>Do not use on broken, irritated or sunburnt skin. Avoid the eye area.</li><li>Rinse with warm soapy water after use and let it air-dry.</li><li>In the box: cleansing brush, USB charging cable, manual.</li><li>For hygiene reasons, returns are accepted only if unopened.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>Toute bonne routine du soir commence par une peau propre.</strong> Des picots souples en silicone de qualité alimentaire et une vibration sonique douce font travailler votre nettoyant pour une sensation de nettoyage plus complète qu'avec les mains seules : la peau a l'air fraîche et prête pour la suite du rituel. Étanche (IPX7), rechargeable par USB et assez petite pour la trousse de voyage.</p><h3>Mode d'emploi</h3><ol><li>Mouillez votre visage et la brosse, puis appliquez votre nettoyant habituel.</li><li>Allumez et faites de petits cercles : front, nez, menton, puis joues. Environ une minute au total.</li><li>Rincez le visage, rincez la brosse, épongez.</li></ol><p>Une fois par jour, c'est suffisant. Allez-y plus doucement sur les zones sensibles.</p><h3>Bon à savoir</h3><ul><li>Appareil cosmétique à usage domestique, pas un dispositif médical.</li><li>Ne pas utiliser sur une peau lésée, irritée ou brûlée par le soleil. Évitez le contour des yeux.</li><li>Rincez à l'eau tiède savonneuse après usage et laissez sécher à l'air.</li><li>Dans la boîte : brosse nettoyante, câble de recharge USB, mode d'emploi.</li><li>Pour des raisons d'hygiène, les retours sont acceptés seulement si l'article est non ouvert.</li></ul>${FOOTER_FR}`,
    options: [],
    images: [
      `${CF}/1615022567168.jpg`,
      `${CF}/1615022567153.jpg`,
      `${CF}/1615022567166.jpg`,
      `${CF}/1615022567433.jpg`,
      `${CF}/1615022567163.jpg`,
      `${CF}/1615022567164.jpg`,
    ],
    supplierUrl: `${CJ}/mini-silicone-electric-face-cleansing-brush-electric-facial-cleanser-facial-cleansing-brush-skin-massager-skin-care-tools-p-1368130342149558272.html`,
    supplierSku: "CJPF103247301AZ",
    shippingNote:
      'CJ variant "Pink-USB" (CJPF103247301AZ, 197 g, $3.10 USD). Do NOT order "Pink Set" (CJPF103247302BY, 315 g, ships $7.28). CJPacket JYSP Sensitive to CA $5.55, 7-15 days. Landed $8.65 USD.',
  },
  // ---------------------------------------------------------------- SCULPT
  {
    slug: "microcurrent-facial-lift-device",
    nameEn: "Microcurrent Facial Lift Device",
    nameFr: "Appareil microcourant effet lift",
    tagline: "The lift step of the ritual",
    taglineFr: "L'étape « lift » du rituel",
    priceCents: 8999,
    compareAtCents: null,
    tags: ["sculpt", "microcurrent", "lift"],
    sortOrder: 1,
    descriptionEn: `<p><strong>Guided upward motion for a more lifted, defined look.</strong> This is the device people mean when they say "at-home facial." Used with a conductive gel, it glides over the cheekbone, jawline and brow in slow, upward passes.</p><h3>How to use</h3><ol><li>Apply a generous layer of water-based conductive gel. Skin must stay wet for the current to conduct.</li><li>Glide upward and outward, holding for a few seconds at the top of each pass.</li><li>Rinse off the gel, then moisturize.</li></ol><p>Five minutes, three to five times a week. Results build with consistency.</p><h3>Good to know</h3><ul><li>Cosmetic at-home device, not a medical device.</li><li>Do not use if you are pregnant, have a pacemaker or implanted electronic device, epilepsy, metal implants in the face, or active skin conditions. Ask your doctor if unsure.</li><li>Always use with conductive gel. Do not use over the thyroid or the eyes.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>Un mouvement guidé vers le haut pour un air plus lifté, plus défini.</strong> C'est l'appareil auquel les gens pensent quand ils parlent de « soin du visage à la maison ». Utilisé avec un gel conducteur, il glisse sur les pommettes, la mâchoire et les sourcils en passages lents, vers le haut.</p><h3>Mode d'emploi</h3><ol><li>Appliquez une couche généreuse de gel conducteur à base d'eau. La peau doit rester humide pour que le courant passe.</li><li>Glissez vers le haut et vers l'extérieur, en maintenant quelques secondes au sommet de chaque passage.</li><li>Rincez le gel, puis hydratez.</li></ol><p>Cinq minutes, trois à cinq fois par semaine. Les résultats visibles viennent avec la régularité.</p><h3>Bon à savoir</h3><ul><li>Appareil cosmétique à usage domestique, pas un dispositif médical.</li><li>Ne pas utiliser si vous êtes enceinte, portez un stimulateur cardiaque ou un dispositif électronique implanté, souffrez d'épilepsie, avez des implants métalliques au visage ou une affection cutanée active. En cas de doute, consultez votre médecin.</li><li>Toujours utiliser avec un gel conducteur. Ne pas passer sur la thyroïde ni sur les yeux.</li></ul>${FOOTER_FR}`,
    options: [
      colour([
        { value: "Pink", labelEn: "Pink", labelFr: "Rose" },
        { value: "White", labelEn: "White", labelFr: "Blanc" },
      ]),
    ],
    images: [
      `${CF}/1616060869961.jpg`,
      `${CF}/1616060869956.jpg`,
      `${CF}/1616060869968.jpg`,
      `${CF}/1616060869963.jpg`,
      `${CF}/1616060869959.jpg`,
    ],
    supplierUrl: `${CJ}/facial-lifting-firming-skin-rejuvenation-face-lifting-device-p-1372485408520278016.html`,
    supplierSku: "CJPF104709101AZ",
    shippingNote:
      "CJ variants: Pink = CJPF104709101AZ, White = CJPF104709102BY. $14.75 USD, 331 g. CJPacket JYSP Sensitive to CA $7.47, 7-15 days. Landed $22.22 USD. Conductive gel is NOT in the box (packing list: 1 x face lifter).",
  },
  {
    slug: "ems-sculpting-v-roller",
    nameEn: "EMS Sculpting V-Roller",
    nameFr: "Rouleau sculptant EMS en V",
    tagline: "Roll along the jaw, sculpt the look of your contours",
    taglineFr: "Roulez le long de la mâchoire, sculptez l'allure de vos contours",
    priceCents: 4999,
    compareAtCents: null,
    tags: ["sculpt", "ems", "roller", "new"],
    sortOrder: 2,
    descriptionEn: `<p><strong>Four rolling balls on a V-shaped frame that hugs the jawline and cheekbones.</strong> Low-level EMS pulses and soft red and blue light run while you roll, turning the "lift" step of the ritual into a relaxing massage. It helps the jaw and cheek area look more defined and the face look less puffy after a long day.</p><h3>How to use</h3><ol><li>Cleanse your face and apply a thin layer of serum or gel so the rollers glide on damp skin.</li><li>Switch on and roll upward from the chin along the jawline toward the ears, then from the nose across the cheekbones. Slow passes, light pressure.</li><li>Finish down the sides of the neck, then moisturize.</li></ol><p>Five minutes, three to five times a week.</p><h3>Good to know</h3><ul><li>Cosmetic at-home device, not a medical device.</li><li>Do not use if you are pregnant, have a pacemaker or implanted electronic device, epilepsy, metal implants in the face, are photosensitive, or have an active skin condition or broken skin. Ask your doctor if unsure.</li><li>Keep away from the eyes and do not use over the thyroid (front of the neck).</li><li>Wipe the rollers clean after each use. Do not submerge.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>Quatre billes roulantes sur une monture en V qui épouse la mâchoire et les pommettes.</strong> De légères impulsions EMS et une lumière rouge et bleue douce fonctionnent pendant que vous roulez : l'étape « lift » du rituel devient un massage relaxant. Il aide la mâchoire et les joues à paraître plus définies et le visage moins gonflé après une longue journée.</p><h3>Mode d'emploi</h3><ol><li>Nettoyez votre visage et appliquez une fine couche de sérum ou de gel pour que les rouleaux glissent sur une peau humide.</li><li>Allumez et roulez vers le haut, du menton le long de la mâchoire vers les oreilles, puis du nez vers les pommettes. Passages lents, pression légère.</li><li>Terminez le long des côtés du cou, puis hydratez.</li></ol><p>Cinq minutes, trois à cinq fois par semaine.</p><h3>Bon à savoir</h3><ul><li>Appareil cosmétique à usage domestique, pas un dispositif médical.</li><li>Ne pas utiliser si vous êtes enceinte, portez un stimulateur cardiaque ou un dispositif électronique implanté, souffrez d'épilepsie, avez des implants métalliques au visage, êtes photosensible, ou avez une affection cutanée active ou une peau lésée. En cas de doute, consultez votre médecin.</li><li>Tenez loin des yeux et ne passez pas sur la thyroïde (devant du cou).</li><li>Essuyez les rouleaux après chaque utilisation. Ne pas immerger.</li></ul>${FOOTER_FR}`,
    options: [],
    images: [
      // CJ's first two photos show a different white "V-Face" device: skipped.
      `${OSS}/2026/01/19/02/81b92ac9-e9a6-41e4-a2af-29182887e228_trans.jpeg`,
      `${OSS}/2026/01/12/06/1e62a174-5cc7-42b0-bd42-7261ae966933.jpg`,
      `${OSS}/2026/01/12/06/c584540f-157a-4dd1-8c40-807f83b49083.jpg`,
      `${OSS}/2026/01/12/06/2e1d2811-28a1-4731-90ac-87aa4716b34a.jpg`,
      `${OSS}/2026/01/12/06/4c378e28-c10f-4843-87ab-e6cd25eae14f.jpg`,
    ],
    supplierUrl: `${CJ}/home-v-roller-ems-microcurrent-electric-smart-red-and-blue-dual-wave-roller-massager-face-slimming-instrument-ems-micro-current-lifting-tightening-p-2601120448011603500.html`,
    supplierSku: "CJPF272560601AZ",
    shippingNote:
      'CJ variant "Normal Version-English Version" (CJPF272560601AZ, 430 g, $11.28 USD). Never the Chinese version. CJPacket JYSP Sensitive to CA $8.66, 7-15 days. Landed $19.94 USD.',
  },
  {
    // Retired: CJ has no face-specific electric gua sha. Replaced by the EMS V-Roller.
    slug: "electronic-gua-sha-massager",
    nameEn: "Electronic Gua Sha Massager",
    nameFr: "Gua sha électronique",
    tagline: "Sculpt and de-puff in four minutes",
    taglineFr: "Sculpter et dégonfler en quatre minutes",
    priceCents: 3999,
    compareAtCents: null,
    tags: ["sculpt", "gua-sha", "massage"],
    sortOrder: 99,
    descriptionEn: `<p><strong>The classic gua sha stroke, with a gentle vibration.</strong> Sweep upward along the jaw, cheekbones and brow for a smoother, more sculpted look.</p><h3>Good to know</h3><ul><li>Cosmetic at-home device, not a medical device.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>Le geste classique du gua sha, avec une vibration douce.</strong> Passez vers le haut le long de la mâchoire, des pommettes et des sourcils pour un air plus lisse, plus sculpté.</p><h3>Bon à savoir</h3><ul><li>Appareil cosmétique à usage domestique, pas un dispositif médical.</li></ul>${FOOTER_FR}`,
    options: [],
    images: [],
    supplierUrl: null,
    supplierSku: null,
    shippingNote: "Retired 2026-09-21: no face-specific electric gua sha on CJ. Replaced by ems-sculpting-v-roller.",
    active: false,
  },
  // ---------------------------------------------------------------- COOL
  {
    slug: "facial-ice-roller",
    nameEn: "Facial Ice Roller",
    nameFr: "Rouleau de glace pour le visage",
    tagline: "Sixty-second morning reset",
    taglineFr: "La remise à zéro du matin, en soixante secondes",
    priceCents: 2699,
    compareAtCents: null,
    tags: ["cool", "ice-roller", "de-puff", "hygiene"],
    sortOrder: 3,
    refreshCopyWhenEmpty: true,
    descriptionEn: `<p><strong>Fill it, freeze it, glide it before coffee.</strong> A soft silicone holder that turns plain water into a smooth ice roller, with a handle so your fingers stay warm. A cold glide from the centre of the face outward reduces the look of morning puffiness, tightens the appearance of pores and helps makeup sit better. It's the cheapest, fastest step in the ritual and the one people use most.</p><h3>How to use</h3><ol><li>Fill the silicone mould with water and freeze for a few hours.</li><li>Push the ice up slightly and glide it from the nose outward across the cheeks, then under the eyes, then along the jaw. About 60 seconds.</li><li>Pat your face dry, then continue with your routine. Also lovely after sun or a long day.</li></ol><h3>Good to know</h3><ul><li>Hygiene item: returns accepted only if unopened.</li><li>Keep the ice moving and don't hold it on one spot. Do not press hard on the under-eye area.</li><li>Silicone, freezer- and dishwasher-safe. Rinse and dry before refilling.</li></ul>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>Remplissez, congelez, glissez avant le café.</strong> Un support en silicone souple qui transforme de l'eau en rouleau de glace tout doux, avec un manche pour garder les doigts au chaud. Un passage froid du centre du visage vers l'extérieur atténue l'apparence des poches du matin, resserre l'apparence des pores et aide le maquillage à mieux tenir. C'est l'étape la moins chère et la plus rapide du rituel, et celle que les gens utilisent le plus.</p><h3>Mode d'emploi</h3><ol><li>Remplissez le moule en silicone d'eau et congelez quelques heures.</li><li>Poussez légèrement la glace vers le haut et glissez-la du nez vers l'extérieur sur les joues, puis sous les yeux, puis le long de la mâchoire. Environ 60 secondes.</li><li>Épongez le visage, puis poursuivez votre routine. Aussi agréable après le soleil ou une longue journée.</li></ol><h3>Bon à savoir</h3><ul><li>Article d'hygiène : retours acceptés seulement s'il est non ouvert.</li><li>Gardez la glace en mouvement, sans la maintenir au même endroit. N'appuyez pas fort sous les yeux.</li><li>Silicone, va au congélateur et au lave-vaisselle. Rincez et séchez avant de le remplir à nouveau.</li></ul>${FOOTER_HYGIENE_FR}`,
    options: [
      colour([
        { value: "Pink 1", labelEn: "Pink", labelFr: "Rose" },
        { value: "Purple 1", labelEn: "Purple", labelFr: "Mauve" },
        // CJ calls it "Green 1" but the mould is turquoise (variant photo, 2026-09-21).
        { value: "Green 1", labelEn: "Turquoise", labelFr: "Turquoise" },
        { value: "Yellow 1", labelEn: "Yellow", labelFr: "Jaune" },
        { value: "Red 1", labelEn: "Red", labelFr: "Rouge" },
      ]),
    ],
    legacyOptions: [
      colour([
        { value: "Pink 1", labelEn: "Pink", labelFr: "Rose" },
        { value: "Purple 1", labelEn: "Purple", labelFr: "Mauve" },
        { value: "Green 1", labelEn: "Green", labelFr: "Vert" },
        { value: "Yellow 1", labelEn: "Yellow", labelFr: "Jaune" },
        { value: "Red 1", labelEn: "Red", labelFr: "Rouge" },
      ]),
    ],
    images: [
      // CJ's main shots carry a "skin firming" banner (a claim): skipped.
      `${CF}/quick/product/069b9b14-5b1c-4be8-bf83-a07da29c877a.jpg`,
      `${CF}/quick/product/bab01418-9540-4b61-bfc9-0b4fea3f1393.jpg`,
      `${CF}/quick/product/238adaf6-147b-413f-be39-e00639ebc574.jpg`,
      `${CF}/quick/product/85cdd747-05cd-4539-8072-ffc08cf83697.jpg`,
    ],
    supplierUrl: `${CJ}/silicone-ice-face-roller-contour-shrink-pores-remove-dark-circles-massage-skin-beauty-facial-roller-for-eyes-neck-skin-care-tool-p-1764139609648271360.html`,
    supplierSku: "CJMJ198034901AZ",
    shippingNote:
      "CJ variants ($1.72 USD, 127 g): Pink = CJMJ198034901AZ, Green = CJMJ198034902BY, Yellow = CJMJ198034903CX, Purple = CJMJ198034904DW, Red = CJMJ198034905EV. CJPacket JYSP Sensitive to CA $4.82, 7-15 days. Landed $6.54 USD. Item is a silicone ice mould the customer fills with water.",
  },
  // ---------------------------------------------------------------- ESSENTIALS
  {
    slug: "electric-scalp-massager",
    nameEn: "Electric Scalp Massager",
    nameFr: "Masseur électrique pour le cuir chevelu",
    tagline: "Eight soft fingers for the end of a long day",
    taglineFr: "Huit doigts souples pour la fin d'une longue journée",
    priceCents: 2999,
    compareAtCents: null,
    tags: ["essentials", "massage", "new"],
    sortOrder: 6,
    descriptionEn: `<p><strong>The part of a salon visit everyone secretly books it for.</strong> Eight flexible, rounded fingers vibrate gently over the scalp for a relaxing, tingly massage while the rest of your ritual does its thing. Compact and USB-powered, so it lives on the nightstand, not in a drawer.</p><h3>How to use</h3><ol><li>Switch on and rest the fingers on the crown of your head.</li><li>Move it slowly toward the temples and down to the nape. Let the vibration do the work, no pressure needed.</li><li>A few minutes is enough. Lovely on the neck and shoulders too.</li></ol><h3>Good to know</h3><ul><li>Cosmetic, relaxation-only device, not a medical device.</li><li>Do not use on broken or irritated skin, or if you have a pacemaker or implanted electronic device. Ask your doctor if unsure.</li><li>Keep long hair loose so it doesn't tangle. Wipe the fingers clean after use.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>La partie d'une visite au salon pour laquelle tout le monde réserve en secret.</strong> Huit doigts souples et arrondis vibrent doucement sur le cuir chevelu pour un massage relaxant et picotant pendant que le reste du rituel fait effet. Compact et alimenté par USB : il reste sur la table de chevet, pas au fond d'un tiroir.</p><h3>Mode d'emploi</h3><ol><li>Allumez et posez les doigts sur le sommet de la tête.</li><li>Déplacez-le lentement vers les tempes, puis vers la nuque. Laissez la vibration travailler, pas besoin d'appuyer.</li><li>Quelques minutes suffisent. Aussi agréable sur la nuque et les épaules.</li></ol><h3>Bon à savoir</h3><ul><li>Appareil cosmétique de détente, pas un dispositif médical.</li><li>Ne pas utiliser sur une peau lésée ou irritée, ni si vous portez un stimulateur cardiaque ou un dispositif électronique implanté. En cas de doute, consultez votre médecin.</li><li>Laissez les cheveux longs détachés pour éviter qu'ils s'emmêlent. Essuyez les doigts après usage.</li></ul>${FOOTER_FR}`,
    options: [],
    images: [
      `${OSS}/2024/04/01/07/97fcc9a8-b691-4fe2-989d-9833b3ecc7ae.jpg`,
      `${CF}/1619772598845.jpg`,
      `${CF}/1619753282008.jpg`,
      `${CF}/1619753282005.jpg`,
      `${CF}/1619753282009.jpg`,
    ],
    supplierUrl: `${CJ}/head-massager-scalp-vibration-massage-eight-claw-electric-household-massager-head-masager-body-care-p-1387972416516526080.html`,
    supplierSku: "CJST110710401AZ",
    shippingNote:
      'CJ variant "White" (CJST110710401AZ, 181 g, $4.12 USD). CJPacket JYSP Sensitive to CA $5.39, 7-15 days. Landed $9.51 USD. CJ listing makes hair-growth / pain-relief claims: never reuse its copy.',
  },
  {
    slug: "satin-sleep-mask",
    nameEn: "Satin-Feel Sleep Mask",
    nameFr: "Masque de nuit effet satin",
    tagline: "Lights out, the soft way",
    taglineFr: "Extinction des feux, tout en douceur",
    priceCents: 2299,
    compareAtCents: null,
    tags: ["essentials", "sleep", "new"],
    sortOrder: 7,
    descriptionEn: `<p><strong>The last step of the evening ritual.</strong> A wide mask in smooth, cool-to-the-touch rayon that blocks light all around the eyes. The band wraps softly around the head instead of tugging at the ears, so it stays put through the night.</p><h3>How to use</h3><ol><li>Finish your routine and let your moisturizer settle for a few minutes.</li><li>Slip the mask on over the eyes and adjust the band.</li><li>Lights out.</li></ol><h3>Good to know</h3><ul><li>Material: rayon (artificial silk).</li><li>Hand-wash in cool water with a mild soap and lay flat to dry.</li><li>For hygiene reasons, returns are accepted only if unopened.</li></ul>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>La dernière étape du rituel du soir.</strong> Un masque large en rayonne lisse, fraîche au toucher, qui bloque la lumière tout autour des yeux. La bande entoure doucement la tête au lieu de tirer sur les oreilles : il reste en place toute la nuit.</p><h3>Mode d'emploi</h3><ol><li>Terminez votre routine et laissez l'hydratant pénétrer quelques minutes.</li><li>Enfilez le masque sur les yeux et ajustez la bande.</li><li>Bonne nuit.</li></ol><h3>Bon à savoir</h3><ul><li>Matière : rayonne (soie artificielle).</li><li>Lavez à la main à l'eau fraîche avec un savon doux et faites sécher à plat.</li><li>Pour des raisons d'hygiène, les retours sont acceptés seulement si l'article est non ouvert.</li></ul>${FOOTER_HYGIENE_FR}`,
    options: [
      colour([
        { value: "Pink", labelEn: "Pink", labelFr: "Rose" },
        { value: "Light Gray", labelEn: "Light grey", labelFr: "Gris pâle" },
        { value: "Navy Blue", labelEn: "Navy", labelFr: "Bleu marine" },
        { value: "Black", labelEn: "Black", labelFr: "Noir" },
      ]),
    ],
    images: [
      `${CF}/quick/product/efbdd00c-1125-468b-8fbf-a7708bba286d.jpg`,
      `${CF}/quick/product/c1b5ab27-731a-4d95-a497-daba0c07981d.jpg`,
      `${CF}/quick/product/d74eacc7-5abb-4d5e-8903-ed0e1f9fb60e.jpg`,
      `${CF}/quick/product/42847f41-fcc2-4066-8100-2cea14de73b5.jpg`,
      `${CF}/quick/product/98291377-4f62-4094-a2c1-4d960b767769.jpg`,
      `${CF}/quick/product/b3b84ab0-0404-4a54-95fb-5feabb2db217.jpg`,
    ],
    supplierUrl: `${CJ}/long-sleep-shading-not-tight-ear-all-inclusive-eye-shield-artificial-silk-cold-soft-eye-mask-p-1767536568941686784.html`,
    supplierSku: "CJYD198717801AZ",
    shippingNote:
      "CJ variants ($4.02 USD, 65 g): Pink = CJYD198717801AZ, Light Gray = CJYD198717802BY, Navy Blue = CJYD198717806FU, Black = CJYD198717805EV. CJPacket JYSP Sensitive to CA $4.17, 7-15 days (processing 1-4 days). Landed $8.19 USD. Rayon, not real silk: never call it silk.",
  },
  {
    slug: "spa-headband",
    nameEn: "Spa Headband",
    nameFr: "Bandeau spa",
    tagline: "Hair off your face, ritual on",
    taglineFr: "Les cheveux dégagés, le rituel commence",
    priceCents: 1299,
    compareAtCents: null,
    tags: ["essentials", "spa", "new"],
    sortOrder: 8,
    descriptionEn: `<p><strong>The small thing that makes a routine feel like a spa night.</strong> A soft fabric headband with a little bow that keeps hair and baby hairs back while you cleanse, roll, mask and glow, without the dent a clip leaves behind.</p><h3>How to use</h3><ol><li>Slide it on from the neck up and push it back to your hairline.</li><li>Do the whole ritual hands-free.</li><li>Wash it with your towels once a week.</li></ol><h3>Good to know</h3><ul><li>Fabric headband, one size.</li><li>Wash cold in a laundry bag, air-dry.</li><li>For hygiene reasons, returns are accepted only if unopened.</li></ul>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>Le petit détail qui transforme une routine en soirée spa.</strong> Un bandeau en tissu doux, avec une petite boucle, qui retient les cheveux et les petits cheveux pendant que vous nettoyez, roulez, masquez et illuminez, sans la marque que laisse une pince.</p><h3>Mode d'emploi</h3><ol><li>Enfilez-le par le cou et remontez-le jusqu'à la racine des cheveux.</li><li>Faites tout le rituel les mains libres.</li><li>Lavez-le avec vos serviettes une fois par semaine.</li></ol><h3>Bon à savoir</h3><ul><li>Bandeau en tissu, taille unique.</li><li>Lavage à l'eau froide dans un filet, séchage à l'air.</li><li>Pour des raisons d'hygiène, les retours sont acceptés seulement si l'article est non ouvert.</li></ul>${FOOTER_HYGIENE_FR}`,
    options: [
      colour([
        { value: "Beige", labelEn: "Beige", labelFr: "Beige" },
        { value: "Pink", labelEn: "Pink", labelFr: "Rose" },
        { value: "Grey", labelEn: "Grey", labelFr: "Gris" },
        { value: "Green", labelEn: "Green", labelFr: "Vert" },
      ]),
    ],
    images: [
      `${CF}/8253ae69-7f6b-4371-9d35-3b67d339a2de.jpg`,
      `${CF}/65300486-ba6f-4131-bb4c-0e5390e8775a.jpg`,
      `${CF}/ee8c62ec-a048-4138-b60c-c63366adfc1c.jpg`,
      `${CF}/8bbaf3df-9c3a-4690-8217-e6210bfc45b3.jpg`,
      `${CF}/6a0dd145-a291-4340-a98e-e2a87bcabbd2.jpg`,
      `${CF}/a5056bad-4069-452a-b497-5e7c0d582eb0.jpg`,
    ],
    supplierUrl: `${CJ}/makeup-yoga-headband-womens-confinement-headband-p-1455452550215110656.html`,
    supplierSku: "CJHL133914107GT",
    shippingNote:
      "CJ single-headband variants ($0.59 USD, 55 g): Beige = CJHL133914107GT, Pink = CJHL133914102BY, Grey = CJHL133914103CX, Green = CJHL133914105EV (never the 3/6/9-pcs SKUs). CJPacket JYSP Sensitive to CA $4.07, 7-15 days. Landed $4.66 USD.",
  },
  {
    slug: "electric-makeup-brush-cleaner",
    nameEn: "Electric Makeup Brush Cleaner",
    nameFr: "Nettoyeur électrique de pinceaux à maquillage",
    tagline: "Clean brushes in the time it takes to boil the kettle",
    taglineFr: "Des pinceaux propres le temps de faire bouillir l'eau",
    priceCents: 2699,
    compareAtCents: null,
    tags: ["essentials", "brush-care", "new"],
    sortOrder: 9,
    descriptionEn: `<p><strong>The chore nobody does often enough, handled.</strong> A compact spinning base with a textured silicone bowl: add water and a drop of soap, press one button and swirl your brushes against the ridges. Works with face, eye and double-ended brushes, and it's small enough to keep on the vanity.</p><h3>How to use</h3><ol><li>Add warm water and a drop of gentle soap or brush cleanser to the silicone bowl.</li><li>Press the button and hold the bristles against the textured ridges for a few seconds, then rinse under the tap.</li><li>Squeeze out excess water and lay brushes flat, or bristles down, to dry.</li></ol><p>Once a week for face brushes keeps them soft and your makeup looking smooth.</p><h3>Good to know</h3><ul><li>Material: ABS and silicone. USB-powered.</li><li>Only the silicone bowl goes in water: never submerge the base.</li><li>Rinse and dry the bowl after each use.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>La corvée que personne ne fait assez souvent, réglée.</strong> Une base compacte qui tourne, avec un bol en silicone texturé : ajoutez de l'eau et une goutte de savon, appuyez sur le bouton et faites tourner vos pinceaux contre les reliefs. Fonctionne avec les pinceaux visage, yeux et à double embout, et assez petit pour rester sur la coiffeuse.</p><h3>Mode d'emploi</h3><ol><li>Versez de l'eau tiède et une goutte de savon doux ou de nettoyant à pinceaux dans le bol en silicone.</li><li>Appuyez sur le bouton et tenez les poils contre les reliefs quelques secondes, puis rincez sous le robinet.</li><li>Essorez l'excédent d'eau et laissez sécher les pinceaux à plat, ou poils vers le bas.</li></ol><p>Une fois par semaine pour les pinceaux visage, et ils restent doux et votre maquillage uniforme.</p><h3>Bon à savoir</h3><ul><li>Matière : ABS et silicone. Alimentation USB.</li><li>Seul le bol en silicone va dans l'eau : n'immergez jamais la base.</li><li>Rincez et séchez le bol après chaque utilisation.</li></ul>${FOOTER_FR}`,
    options: [
      colour([
        { value: "White Powder", labelEn: "White & pink", labelFr: "Blanc et rose" },
        { value: "Black Rose Red", labelEn: "Black & rose", labelFr: "Noir et rose" },
        { value: "Purple", labelEn: "Black & purple", labelFr: "Noir et mauve" },
      ]),
    ],
    images: [
      `${OSS}/2024/01/02/07/305b1f43-9f70-4bee-bb5b-be2e8dc30e17.jpg`,
      `${OSS}/2024/01/08/08/1b675cc9-f31f-439d-9800-70af4271e028.jpg`,
      `${OSS}/2023/12/29/09/c0d7437b-b070-435b-91be-b13ffe296fd9.jpg`,
      `${OSS}/2023/12/29/09/71cf7372-8ae6-4d90-9313-61aef8a2dbd5.jpg`,
      `${CF}/db03f729-20ce-466f-93a9-c1c42cb26539.jpg`,
      `${CF}/46425a3d-7ea7-48db-aa50-2be7c0fa5cd1.jpg`,
    ],
    supplierUrl: `${CJ}/electric-makeup-brush-cleaner-machine-portable-automatic-usb-cosmetic-brush-cleaner-tools-for-all-size-beauty-makeup-brushes-set-p-1707021717920550912.html`,
    supplierSku: "CJMJ185778101AZ",
    shippingNote:
      "CJ variants ($1.93 USD, 300 g): White Powder = CJMJ185778101AZ, Black Rose Red = CJMJ185778102BY, Purple = CJMJ185778103CX. CJPacket JYSP Sensitive to CA $6.81, 7-15 days. Landed $8.74 USD.",
  },
  // ---------------------------------------------------------------- ADD-ONS (2026-09-21)
  // Sourced for the Sets (research: cmac-store/research/sets-addons-2026-09-21.json).
  // Also sold alone. Appearance-only copy; CJ titles say "silk": never reuse (satin/polyester).
  {
    slug: "satin-beauty-sleep-set",
    nameEn: "Satin Beauty-Sleep Set (4 pieces)",
    nameFr: "Ensemble beauté-sommeil en satin (4 pièces)",
    tagline: "Eye mask, pillowcase, scrunchie and headband in champagne satin",
    taglineFr: "Masque, taie, chouchou et bandeau en satin champagne",
    priceCents: 3999,
    compareAtCents: null,
    tags: ["essentials", "sleep", "gift", "new"],
    sortOrder: 10,
    descriptionEn: `<p><strong>Four matching satin pieces for the very end of the evening.</strong> A champagne-colour eye mask, pillowcase, scrunchie and twist headband, all smooth and cool to the touch. Hair and cheek glide over the pillowcase instead of catching on cotton, and the whole set makes a nightstand look like a little hotel.</p><h3>In the set</h3><ul><li>Eye mask, about 20.5 × 9.5 cm</li><li>Pillowcase, about 48 × 65 cm</li><li>Scrunchie</li><li>Twist headband</li></ul><h3>How to use</h3><ol><li>Slip the pillowcase over a standard pillow.</li><li>Headband on for your evening routine, scrunchie for a loose bun before bed.</li><li>Eye mask on. Lights out.</li></ol><h3>Good to know</h3><ul><li>Material: satin, as stated by the supplier (not silk). Colour: champagne.</li><li>Hand-wash in cool water with a mild soap and lay flat to dry.</li><li>For hygiene reasons, returns are accepted only if unopened.</li></ul>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>Quatre pièces en satin assorties pour la toute fin de soirée.</strong> Un masque pour les yeux, une taie d'oreiller, un chouchou et un bandeau torsadé couleur champagne, lisses et frais au toucher. Les cheveux et la joue glissent sur la taie au lieu d'accrocher au coton, et l'ensemble donne à la table de chevet un petit air d'hôtel.</p><h3>Dans l'ensemble</h3><ul><li>Masque pour les yeux, environ 20,5 × 9,5 cm</li><li>Taie d'oreiller, environ 48 × 65 cm</li><li>Chouchou</li><li>Bandeau torsadé</li></ul><h3>Mode d'emploi</h3><ol><li>Glissez la taie sur un oreiller standard.</li><li>Le bandeau pour la routine du soir, le chouchou pour un chignon lâche avant de dormir.</li><li>Masque en place. Bonne nuit.</li></ol><h3>Bon à savoir</h3><ul><li>Matière : satin, selon le fournisseur (pas de la soie). Couleur : champagne.</li><li>Lavez à la main à l'eau fraîche avec un savon doux et faites sécher à plat.</li><li>Pour des raisons d'hygiène, les retours sont acceptés seulement si l'article est non ouvert.</li></ul>${FOOTER_HYGIENE_FR}`,
    options: [],
    images: [`${CF}/dc02e2c4-db49-43e3-9963-a12d1e4049c4.jpg`],
    supplierUrl: `${CJ}/double-sided-silk-eye-mask-pillowcase-hair-tie-four-piece-set-p-1524212426772852736.html`,
    supplierSku: "CJCS148046301AZ",
    shippingNote:
      'CJ variant Champagne (CJCS148046301AZ, only colour, 135 g, $5.81 USD). The CJ page defaults to a US warehouse: ALWAYS choose "Shipping From: China". CJPacket JYSP Sensitive to CA $4.90, 7-15 days. Landed $10.71 USD. Satin, not silk: never call it silk.',
  },
  {
    slug: "satin-scrunchie",
    nameEn: "Satin Scrunchie",
    nameFr: "Chouchou en satin",
    tagline: "A soft hold for buns and ponytails",
    taglineFr: "Une tenue douce pour chignons et queues de cheval",
    priceCents: 1299,
    compareAtCents: null,
    tags: ["essentials", "hair", "new"],
    sortOrder: 11,
    descriptionEn: `<p><strong>The easiest upgrade in the whole routine.</strong> A full, glossy satin scrunchie that holds a bun or ponytail softly, without the tight crease a thin elastic leaves. Wear it for the ritual, to bed, or on your wrist until you need it.</p><h3>How to use</h3><ol><li>Loop it twice around a ponytail, or three times for a smaller bun.</li><li>Keep it loose for sleep.</li></ol><h3>Good to know</h3><ul><li>Material: satin, as stated by the supplier (not silk). One size.</li><li>Hand-wash in cool water and air-dry.</li><li>For hygiene reasons, returns are accepted only if unopened.</li></ul>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>L'amélioration la plus simple de toute la routine.</strong> Un chouchou en satin bien bouffant et lustré qui tient un chignon ou une queue de cheval tout en douceur, sans le pli serré d'un élastique mince. À porter pour le rituel, pour dormir, ou au poignet jusqu'à ce qu'on en ait besoin.</p><h3>Mode d'emploi</h3><ol><li>Faites deux tours autour d'une queue de cheval, ou trois pour un petit chignon.</li><li>Gardez-le lâche pour dormir.</li></ol><h3>Bon à savoir</h3><ul><li>Matière : satin, selon le fournisseur (pas de la soie). Taille unique.</li><li>Lavez à la main à l'eau fraîche et laissez sécher à l'air.</li><li>Pour des raisons d'hygiène, les retours sont acceptés seulement si l'article est non ouvert.</li></ul>${FOOTER_HYGIENE_FR}`,
    options: [
      colour([
        { value: "Pink", labelEn: "Pink", labelFr: "Rose" },
        { value: "Light Pink", labelEn: "Light pink", labelFr: "Rose pâle" },
        { value: "Smoky pink", labelEn: "Dusty pink", labelFr: "Vieux rose" },
        { value: "Champagne", labelEn: "Champagne", labelFr: "Champagne" },
        { value: "Beige", labelEn: "Beige", labelFr: "Beige" },
        { value: "White", labelEn: "White", labelFr: "Blanc" },
        { value: "Light Blue", labelEn: "Light blue", labelFr: "Bleu pâle" },
        { value: "Lake Blue", labelEn: "Lake blue", labelFr: "Bleu lac" },
        { value: "Purple", labelEn: "Purple", labelFr: "Mauve" },
        { value: "Yellow", labelEn: "Yellow", labelFr: "Jaune" },
        { value: "Gray", labelEn: "Grey", labelFr: "Gris" },
        { value: "Red", labelEn: "Red", labelFr: "Rouge" },
        { value: "Black", labelEn: "Black", labelFr: "Noir" },
      ]),
    ],
    images: [`${CF}/1617668809299.jpg`, `${CF}/1617668808409.jpg`, `${CF}/1617668809421.jpg`],
    supplierUrl: `${CJ}/french-girl-silky-satin-large-intestine-ring-ins-korea-tie-hair-rubber-band-hair-rope-hair-ring-ponytail-head-rope-hair-accessories-p-1379230694693277696.html`,
    supplierSku: "CJTF106711601AZ",
    shippingNote:
      "CJ variants ($0.33 USD, 30 g): Pink = CJTF106711601AZ, Light Pink = CJTF106711610JQ, Smoky pink = CJTF106711611KP, Champagne = CJTF106711602BY, Beige = CJTF106711605EV, White = CJTF106711604DW, Light Blue = CJTF106711603CX, Lake Blue = CJTF106711606FU, Purple = CJTF106711607GT, Yellow = CJTF106711608HS, Gray = CJTF106711609IR, Red = CJTF106711612LO, Black = CJTF106711613MN. Shipping From: China. CJPacket JYSP Sensitive to CA $3.81 alone, 7-15 days. Landed $4.14 USD alone (about +$0.40 inside a set parcel). Satin, not silk.",
  },
  {
    slug: "pink-shell-makeup-pouch",
    nameEn: "Rose Shell Makeup Pouch",
    nameFr: "Trousse à maquillage coquillage rose",
    tagline: "A soft-structured pouch for the everyday bag",
    taglineFr: "Une trousse souple et structurée pour le sac de tous les jours",
    priceCents: 1999,
    compareAtCents: null,
    tags: ["essentials", "travel", "gift", "new"],
    sortOrder: 12,
    descriptionEn: `<p><strong>A pouch you'll actually carry.</strong> A rounded shell-shape bag in wipe-clean faux leather (PU) with a zip top and carry handles. Big enough for the everyday kit: a few makeup pieces, brushes, a small tool or two. In the Pink Pop set it doubles as the gift box.</p><h3>How to use</h3><ol><li>Unzip, fill, zip.</li><li>Wipe the outside with a damp cloth when needed.</li></ol><h3>Good to know</h3><ul><li>Material: PU (faux leather).</li><li>Makeup and accessories shown in photos are not included.</li><li>Colours: rose pink, milk white, caramel mocha, black.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>Une trousse qu'on traîne vraiment partout.</strong> Un sac arrondi en forme de coquillage, en similicuir (PU) facile à essuyer, avec fermeture éclair et poignées. Assez grand pour le nécessaire du quotidien : quelques produits de maquillage, des pinceaux, un ou deux petits outils. Dans la trousse Pink Pop, il sert aussi de boîte-cadeau.</p><h3>Mode d'emploi</h3><ol><li>On ouvre, on remplit, on ferme.</li><li>Essuyez l'extérieur avec un linge humide au besoin.</li></ol><h3>Bon à savoir</h3><ul><li>Matière : PU (similicuir).</li><li>Le maquillage et les accessoires montrés sur les photos ne sont pas inclus.</li><li>Couleurs : rose, blanc lait, caramel moka, noir.</li></ul>${FOOTER_FR}`,
    options: [
      colour([
        { value: "Rose Pink", labelEn: "Rose pink", labelFr: "Rose" },
        { value: "Milk Apricot White", labelEn: "Milk white", labelFr: "Blanc lait" },
        { value: "Caramel Mocha", labelEn: "Caramel mocha", labelFr: "Caramel moka" },
        { value: "Black", labelEn: "Black", labelFr: "Noir" },
      ]),
    ],
    images: [
      `${CF}/operation-center/file_202403070927181765670549817925632.png`,
      `${CF}/operation-center/file_202403070926581765670468771389440.png`,
    ],
    supplierUrl: `${CJ}/shell-shape-pu-leather-cosmetic-bag-waterproof-letter-makeup-pouch-bag-multifunction-carry-on-makeup-tote-travel-wash-bags-p-1733339387867439104.html`,
    supplierSku: "CJYD191668204DW",
    shippingNote:
      "CJ variants ($1.22 USD): Rose Pink = CJYD191668204DW (165 g), Milk Apricot White = CJYD191668201AZ (217 g), Caramel Mocha = CJYD191668202BY (120 g), Black = CJYD191668203CX (120 g). Shipping From: China. CJPacket JYSP Sensitive to CA $5.22 alone, 7-15 days. Landed $6.44 USD alone. CJ title says 'Letter': check the sample for printed lettering.",
  },
  {
    slug: "travel-makeup-organizer",
    nameEn: "Travel Makeup Organizer",
    nameFr: "Organisateur de maquillage de voyage",
    tagline: "Everything in its place, zipped",
    taglineFr: "Chaque chose à sa place, bien zippée",
    priceCents: 2799,
    compareAtCents: null,
    tags: ["essentials", "travel", "gift", "new"],
    sortOrder: 13,
    descriptionEn: `<p><strong>The case that makes packing feel organized.</strong> A structured faux-leather (PU) organizer, about 21 × 8 × 19 cm, with divided compartments inside for brushes, bottles and small tools, a wide zip opening and carry handles. It holds a whole travel routine; in the Carry-On Glow set it is the set's case.</p><h3>How to use</h3><ol><li>Tall items and brushes in the side pockets, flat items in the middle.</li><li>Zip it and go.</li></ol><h3>Good to know</h3><ul><li>Material: PU (faux leather). About 21 × 8 × 19 cm.</li><li>Makeup and accessories shown in photos and video are not included.</li><li>Wipe clean with a damp cloth.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>L'étui qui rend les bagages organisés.</strong> Un organisateur structuré en similicuir (PU), environ 21 × 8 × 19 cm, avec des compartiments intérieurs pour les pinceaux, les flacons et les petits outils, une large ouverture zippée et des poignées. Il contient toute une routine de voyage ; dans le coffret Éclat en cabine, c'est l'étui du coffret.</p><h3>Mode d'emploi</h3><ol><li>Les grands articles et les pinceaux dans les pochettes latérales, le reste au centre.</li><li>On zippe et on part.</li></ol><h3>Bon à savoir</h3><ul><li>Matière : PU (similicuir). Environ 21 × 8 × 19 cm.</li><li>Le maquillage et les accessoires montrés sur les photos et la vidéo ne sont pas inclus.</li><li>Essuyez avec un linge humide.</li></ul>${FOOTER_FR}`,
    options: [
      colour([
        { value: "Rose Pink", labelEn: "Rose pink", labelFr: "Rose" },
        { value: "Ivory White", labelEn: "Ivory", labelFr: "Ivoire" },
        { value: "Caramel Mocha", labelEn: "Caramel mocha", labelFr: "Caramel moka" },
        { value: "Crystal Black", labelEn: "Black", labelFr: "Noir" },
      ]),
    ],
    images: [
      `${CF}/operation-center/file_202403110838511767107909847883776.png`,
      `${CF}/operation-center/file_202403110832461767106379811921920.png`,
    ],
    supplierUrl: `${CJ}/pu-large-capacity-travel-make-up-storage-organizer-makeup-pouch-cosmetic-bag-shell-bags-p-1705890767220248576.html`,
    supplierSku: "CJYD185535502BY",
    shippingNote:
      "CJ variants ($1.71 USD, 210 g): Rose Pink = CJYD185535502BY, Ivory White = CJYD185535501AZ, Caramel Mocha = CJYD185535503CX, Crystal Black = CJYD185535504DW. Shipping From: China. CJPacket JYSP Sensitive to CA $5.81 alone, 7-15 days. Landed $7.52 USD alone.",
  },
  {
    slug: "cozy-fleece-socks",
    nameEn: "Cozy Fleece Socks",
    nameFr: "Bas douillets en molleton",
    tagline: "Fluffy socks for long evenings in",
    taglineFr: "Des bas moelleux pour les longues soirées à la maison",
    priceCents: 1499,
    compareAtCents: null,
    tags: ["essentials", "cozy", "fall", "new"],
    sortOrder: 14,
    descriptionEn: `<p><strong>The cozy part of the ritual.</strong> Thick, fluffy coral-fleece socks for mask nights, movie nights and cold floors. Soft cuff, one size.</p><h3>Good to know</h3><ul><li>Fibre content: polyester (coral fleece), as stated by the supplier. One size.</li><li>Wash cold in a laundry bag, or by hand, and air-dry.</li><li>For hygiene reasons, returns are accepted only if unopened.</li></ul>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>Le côté douillet du rituel.</strong> Des bas épais et moelleux en molleton corail, pour les soirées masque, les soirées cinéma et les planchers froids. Poignet souple, taille unique.</p><h3>Bon à savoir</h3><ul><li>Composition : polyester (molleton corail), selon le fournisseur. Taille unique.</li><li>Lavage à l'eau froide dans un filet, ou à la main, séchage à l'air.</li><li>Pour des raisons d'hygiène, les retours sont acceptés seulement si l'article est non ouvert.</li></ul>${FOOTER_HYGIENE_FR}`,
    options: [
      colour([
        { value: "Beige", labelEn: "Beige", labelFr: "Beige" },
        { value: "White", labelEn: "White", labelFr: "Blanc" },
        { value: "Light Grey", labelEn: "Light grey", labelFr: "Gris pâle" },
        { value: "Dark Grey", labelEn: "Dark grey", labelFr: "Gris foncé" },
        { value: "Coffee", labelEn: "Coffee", labelFr: "Café" },
        { value: "Green", labelEn: "Green", labelFr: "Vert" },
        { value: "Blue", labelEn: "Blue", labelFr: "Bleu" },
        { value: "Black", labelEn: "Black", labelFr: "Noir" },
      ]),
    ],
    images: [
      `${CF}/operation-center/file_202410240827371849367127476412416.png`,
      `${CF}/operation-center/file_202410170640271846803444552441856.jpg`,
    ],
    supplierUrl: `${CJ}/-p-1732222258162585600.html`,
    supplierSku: "CJWZ191410903CX",
    shippingNote:
      "CJ variants ($0.79 USD, 40 g): Beige = CJWZ191410903CX, White = CJWZ191410902BY, Light Grey = CJWZ191410906FU, Dark Grey = CJWZ191410907GT, Coffee = CJWZ191410905EV, Green = CJWZ191410908HS, Blue = CJWZ191410904DW, Black = CJWZ191410901AZ. Shipping From: China. CJPacket JYSP Sensitive to CA $3.92 alone, 7-15 days. Landed $4.71 USD alone.",
  },
  {
    slug: "reusable-cleansing-puff",
    nameEn: "Reusable Cleansing Puff",
    nameFr: "Houppette démaquillante réutilisable",
    tagline: "A soft round pad for your cleanser, again and again",
    taglineFr: "Un disque doux pour votre nettoyant, encore et encore",
    priceCents: 1599,
    compareAtCents: null,
    tags: ["essentials", "cleansing", "hygiene", "new"],
    sortOrder: 15,
    descriptionEn: `<p><strong>A plush 12 cm pad for the cleansing step.</strong> Soft microfibre over a sponge core: wet it, use it with your usual cleanser or makeup remover, rinse, and let it dry. One pad replaces a stack of cotton rounds.</p><h3>How to use</h3><ol><li>Wet the puff and squeeze out the excess water.</li><li>Add your cleanser or makeup remover and move it over the face in gentle circles. Avoid rubbing the eyes.</li><li>Rinse the puff with mild soap after each use and let it dry completely.</li></ol><h3>Good to know</h3><ul><li>Material: sponge and microfibre, as stated by the supplier. About 12 cm across, 1 cm thick.</li><li>Colour picked by us.</li><li>For hygiene reasons, returns are accepted only if unopened.</li></ul>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>Un disque moelleux de 12 cm pour l'étape du nettoyage.</strong> Une microfibre douce sur un cœur en éponge : on le mouille, on l'utilise avec son nettoyant ou son démaquillant habituel, on rince et on le laisse sécher. Un seul disque remplace une pile de ronds de coton.</p><h3>Mode d'emploi</h3><ol><li>Mouillez la houppette et essorez l'excédent d'eau.</li><li>Ajoutez votre nettoyant ou démaquillant et faites de petits cercles doux sur le visage. Évitez de frotter les yeux.</li><li>Rincez la houppette au savon doux après chaque utilisation et laissez-la sécher complètement.</li></ol><h3>Bon à savoir</h3><ul><li>Matière : éponge et microfibre, selon le fournisseur. Environ 12 cm de diamètre, 1 cm d'épaisseur.</li><li>Couleur choisie par nous.</li><li>Pour des raisons d'hygiène, les retours sont acceptés seulement si l'article est non ouvert.</li></ul>${FOOTER_HYGIENE_FR}`,
    options: [],
    images: [`${CF}/1614061763385.jpg`, `${CF}/1614061763383.jpg`],
    supplierUrl: `${CJ}/-p-1364100558956400640.html`,
    supplierSku: "CJPF101912105EV",
    shippingNote:
      "CJ variant CJPF101912105EV (default swatch; pick a pink swatch when ordering: 14 swatches, names not read). $1.30 USD (page shows 'Request quote': may be a tier price), 90 g. Shipping From: China. CJPacket JYSP Sensitive to CA $4.43 alone, 7-15 days. Landed $5.73 USD alone. Lowest inventory of the add-ons (4,000).",
  },
  // ---------------------------------------------------------------- NAILS, HANDS & FEET (Couca Beauty clients, 2026-09-22)
  // Tools only (no creams/oils: those would need a Health Canada cosmetic notification).
  // Positioned as care BETWEEN salon appointments, never as a replacement for them.
  {
    slug: "nail-care-pen",
    nameEn: "5-in-1 Nail Care Pen",
    nameFr: "Stylo soin des ongles 5 en 1",
    tagline: "Tidy natural nails between appointments",
    taglineFr: "Des ongles naturels soignés entre deux rendez-vous",
    priceCents: 2999,
    compareAtCents: null,
    tags: ["essentials", "nails", "new"],
    sortOrder: 16,
    descriptionEn: `<p><strong>For the week-three nails.</strong> A pen-size, rechargeable file with five interchangeable heads and a small LED light, to shape edges, smooth ridges and buff natural nails between salon visits. Quiet enough for couch use.</p><h3>How to use</h3><ol><li>Start on clean, dry, bare natural nails.</li><li>Pick a head, choose the lower speed and glide lightly, one direction at a time. Let the tool do the work.</li><li>Brush away the dust, wash your hands, then apply your usual hand cream.</li></ol><p>Once a week is plenty. Leave gel, builder gel and extensions to your nail technician.</p><h3>Good to know</h3><ul><li>Cosmetic at-home tool, not a medical device.</li><li>Rechargeable via the included USB cable. Two speeds, forward and reverse.</li><li>Not for use on broken, infected or very thin nails. Never file the skin.</li><li>Clean the heads after each use. Keep out of reach of children.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>Pour les ongles de la troisième semaine.</strong> Une lime rechargeable format stylo, avec cinq embouts interchangeables et une petite lumière DEL, pour mettre en forme le bout des ongles, adoucir les stries et polir les ongles naturels entre deux visites au salon. Assez silencieuse pour le divan.</p><h3>Mode d'emploi</h3><ol><li>Commencez sur des ongles naturels propres, secs et sans vernis.</li><li>Choisissez un embout, la vitesse la plus basse, et glissez légèrement, dans un seul sens. Laissez l'outil travailler.</li><li>Brossez la poussière, lavez-vous les mains, puis appliquez votre crème habituelle.</li></ol><p>Une fois par semaine suffit. Le gel, le gel de construction et les rallonges, on les laisse à votre technicienne.</p><h3>Bon à savoir</h3><ul><li>Outil cosmétique à usage domestique, pas un dispositif médical.</li><li>Rechargeable avec le câble USB inclus. Deux vitesses, marche avant et arrière.</li><li>Ne pas utiliser sur des ongles abîmés, infectés ou très minces. Ne jamais limer la peau.</li><li>Nettoyez les embouts après chaque usage. Gardez hors de la portée des enfants.</li></ul>${FOOTER_FR}`,
    options: [],
    images: [
      "https://cc-west-usa.oss-accelerate.aliyuncs.com/be35cf25-d12a-4cbf-b138-71663c4fdb95.jpg",
      "https://cc-west-usa.oss-accelerate.aliyuncs.com/2a09d319-cce7-4a16-875f-bf752751d0c7.jpg",
      "https://cc-west-usa.oss-accelerate.aliyuncs.com/50a6389f-5f88-4bac-808a-0bacc07c5e37.jpg",
    ],
    supplierUrl: `${CJ}/-p-1595297440465432576.html`,
    supplierSku: "CJYD161928501AZ",
    shippingNote:
      "CJ 5in1 Manicure Machine Set, Pink (USB) = CJYD161928501AZ, $1.90 USD, 105 g, 5,083 lists, 13,390 in stock. Shipping From: China. CJPacket JYSP Sensitive to CA $4.59 alone, 7-15 days. Landed $6.49 USD alone. Never use the supplier's before/after images.",
  },
  {
    slug: "rose-gold-manicure-kit",
    nameEn: "Rose Gold Manicure Kit",
    nameFr: "Trousse de manucure or rose",
    tagline: "Every little tool, in one pretty case",
    taglineFr: "Tous les petits outils, dans un joli étui",
    priceCents: 2499,
    compareAtCents: null,
    tags: ["essentials", "nails", "gift", "new"],
    sortOrder: 17,
    descriptionEn: `<p><strong>The kit that ends the "where are my clippers" search.</strong> Stainless-steel clippers, scissors, cuticle pusher, file and small grooming tools in a rose-gold finish, each held in its own slot of a zip-up case. It lives in a drawer, a gym bag or a carry-on.</p><h3>How to use</h3><ol><li>Trim, then file in one direction.</li><li>Soften cuticles in warm water and push them back gently. Don't cut living skin.</li><li>Wipe each tool with rubbing alcohol before putting it back.</li></ol><h3>Good to know</h3><ul><li>Personal grooming tools. Sharp: keep out of reach of children.</li><li>Pack in checked luggage when flying (blades).</li><li>For hygiene reasons, returns are accepted only if unopened.</li></ul>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>La trousse qui met fin à la chasse au coupe-ongles.</strong> Coupe-ongles, ciseaux, repousse-cuticules, lime et petits outils de soin en acier inoxydable fini or rose, chacun dans sa fente d'un étui à fermeture éclair. Elle vit dans un tiroir, un sac de sport ou un bagage de cabine.</p><h3>Mode d'emploi</h3><ol><li>Coupez, puis limez dans un seul sens.</li><li>Assouplissez les cuticules dans l'eau tiède et repoussez-les doucement. On ne coupe pas la peau vivante.</li><li>Essuyez chaque outil à l'alcool à friction avant de le ranger.</li></ol><h3>Bon à savoir</h3><ul><li>Outils de soin personnel. Tranchants : gardez hors de la portée des enfants.</li><li>En avion, mettez-la dans les bagages enregistrés (lames).</li><li>Pour des raisons d'hygiène, les retours sont acceptés seulement si l'article est non ouvert.</li></ul>${FOOTER_HYGIENE_FR}`,
    options: [],
    images: [
      "https://cmacbeauty.ca/products/rose-gold-manicure-kit-0.jpg",
      "https://cmacbeauty.ca/products/rose-gold-manicure-kit-1.jpg",
      `${CF}/1612319017734.jpg`,
    ],
    supplierUrl: `${CJ}/-p-1356053588002082816.html`,
    supplierSku: "CJJT100243006FU",
    shippingNote:
      "CJ Household Manicure Tool Set, Colour Rose Gold + Style C = CJJT100243006FU, $1.42 USD, 170 g, 30,000 in stock. Shipping From: China. CJPacket Sensitive Pro+ to CA $8.25 alone, 6-11 days. Landed $9.67 USD alone. Confirm with CJ which style (A/B/C) matches the photo before the first order.",
  },
  {
    slug: "gel-manicure-gloves",
    nameEn: "Gel Manicure Cover Gloves",
    nameFr: "Gants couvrants pour manucure au gel",
    tagline: "Hands covered, fingertips free under the lamp",
    taglineFr: "Les mains couvertes, le bout des doigts libre sous la lampe",
    priceCents: 1499,
    compareAtCents: null,
    tags: ["essentials", "nails", "hands", "new"],
    sortOrder: 18,
    descriptionEn: `<p><strong>The little extra for your gel appointment.</strong> Fingerless stretch gloves that cover the backs of your hands and wrists while your nails sit under the UV/LED lamp, with open fingertips so your technician can work as usual. Slip them in your bag before your next Couca Beauty visit.</p><h3>How to use</h3><ol><li>Put them on before the first coat.</li><li>Your fingertips stay out, the rest of the hand stays covered during every curing step.</li><li>Hand-wash cold and air-dry.</li></ol><h3>Good to know</h3><ul><li>A fabric cover, not a sunscreen or a medical product. We don't claim a protection rating.</li><li>One size, stretch fabric. Fibre content is on the sewn-in label.</li><li>For hygiene reasons, returns are accepted only if unopened.</li></ul>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>Le petit plus pour votre rendez-vous gel.</strong> Des gants extensibles sans doigts qui couvrent le dessus des mains et les poignets pendant que vos ongles passent sous la lampe UV/DEL, avec le bout des doigts dégagé pour que votre technicienne travaille comme d'habitude. Glissez-les dans votre sac avant votre prochaine visite chez Couca Beauty.</p><h3>Mode d'emploi</h3><ol><li>Enfilez-les avant la première couche.</li><li>Le bout des doigts reste dégagé, le reste de la main reste couvert à chaque étape de catalyse.</li><li>Lavage à la main à l'eau froide, séchage à l'air.</li></ol><h3>Bon à savoir</h3><ul><li>Une couverture en tissu, pas un écran solaire ni un produit médical. Nous n'annonçons aucun indice de protection.</li><li>Taille unique, tissu extensible. La composition figure sur l'étiquette cousue.</li><li>Pour des raisons d'hygiène, les retours sont acceptés seulement si l'article est non ouvert.</li></ul>${FOOTER_HYGIENE_FR}`,
    options: [
      colour([
        { value: "Rose Red", labelEn: "Rose", labelFr: "Rose" },
        { value: "White", labelEn: "White", labelFr: "Blanc" },
      ]),
    ],
    images: [
      `${CF}/9020d42c-6bfd-41d7-b217-60168580470d.jpg`,
      `${CF}/a666a215-62e5-4b7f-8e75-c4777d755db8.jpg`,
    ],
    supplierUrl: `${CJ}/-p-1407575935661772800.html`,
    supplierSku: "CJMJ118758902BY",
    shippingNote:
      "CJ Manicure UV Protection Glove ($1.36 USD, 40 g, 572 lists, 27,977 in stock): Rose Red = CJMJ118758902BY, White = CJMJ118758906FU (also Blue 05EV, Green 03CX, Lake Green 04DW, Yellow 01AZ). Shipping From: China. CJPacket JYSP Sensitive to CA $3.92 alone, 7-15 days. Landed $5.28 USD alone. Textile: needs bilingual fibre label + CA number before scaling.",
  },
  {
    slug: "electric-foot-file",
    nameEn: "Electric Foot File",
    nameFr: "Râpe électrique pour les pieds",
    tagline: "Sandal-ready heels, at home",
    taglineFr: "Des talons prêts pour les sandales, à la maison",
    priceCents: 3499,
    compareAtCents: null,
    tags: ["essentials", "feet", "nails", "new"],
    sortOrder: 19,
    descriptionEn: `<p><strong>Between two pedicures, your heels still have a life.</strong> A rotating sanding disc gently buffs dry, rough-looking skin on heels and the balls of the feet, for smoother-looking feet in a few minutes. Comes with replacement discs.</p><h3>How to use</h3><ol><li>Use on clean, completely dry feet.</li><li>Glide the disc lightly over rough areas, a few seconds per spot. Don't press and don't stay in one place.</li><li>Rinse your feet and apply a moisturizer. Once a week is enough.</li></ol><h3>Good to know</h3><ul><li>Cosmetic at-home tool, not a medical device.</li><li>Not for use on broken, irritated or infected skin, warts or moles. If you have diabetes or circulation problems, ask your doctor first.</li><li>Powered through the included USB cable. Replace the disc when it looks smooth.</li><li>Brush the disc clean after each use. Personal use only.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>Entre deux pédicures, vos talons ont une vie.</strong> Un disque abrasif rotatif polit doucement la peau sèche et rugueuse des talons et de l'avant du pied, pour des pieds d'apparence plus lisse en quelques minutes. Disques de rechange inclus.</p><h3>Mode d'emploi</h3><ol><li>Utilisez sur des pieds propres et parfaitement secs.</li><li>Glissez le disque légèrement sur les zones rugueuses, quelques secondes par endroit. N'appuyez pas et ne restez pas au même endroit.</li><li>Rincez vos pieds et appliquez une crème hydratante. Une fois par semaine suffit.</li></ol><h3>Bon à savoir</h3><ul><li>Outil cosmétique à usage domestique, pas un dispositif médical.</li><li>Ne pas utiliser sur une peau lésée, irritée ou infectée, sur des verrues ou des grains de beauté. Si vous êtes diabétique ou avez des problèmes de circulation, consultez d'abord votre médecin.</li><li>Alimentée par le câble USB inclus. Changez le disque quand il devient lisse.</li><li>Brossez le disque après chaque usage. Usage personnel seulement.</li></ul>${FOOTER_FR}`,
    options: [],
    images: [
      // Cleaned on the CMAC cream background (scripts: scratch cutout), then the supplier detail shot
      "https://cmacbeauty.ca/products/electric-foot-file-0.jpg",
      "https://oss-cf.cjdropshipping.com/product/2024/02/05/09/134127e8-25df-4ef1-b142-b25626479cca_trans.jpeg",
      `${CF}/17211744/2407170833080326900.jpg`,
    ],
    supplierUrl: `${CJ}/-p-1754434236339195904.html`,
    supplierSku: "CJYD196463901AZ",
    shippingNote:
      "CJ Electric Foot Callus Remover, Colour Pink + Electrical outlet No (USB) = CJYD196463901AZ, $9.61 USD, 295 g, 633 lists, 10,506 in stock. Shipping From: China. CJPacket JYSP Sensitive to CA ~$6.75 alone (total $16.36 USD landed). 8 supplier videos on the CJ page. Don't use the CY-02 lifestyle photo (different model).",
  },
  // -------------------------------------------------------------------------
  // Cozy home (2026-09-25): second supplier. These are AliExpress listings that
  // ship to Canada with free shipping in about 1-2 weeks; ordered by hand on the
  // same day as the CJ order. Prices below are CAD landed (item + shipping).
  // -------------------------------------------------------------------------
  {
    slug: "hooded-sherpa-blanket",
    nameEn: "Hooded Sherpa Blanket",
    nameFr: "Couverture sherpa à capuchon",
    tagline: "A blanket you can wear, for mask nights and cold floors",
    taglineFr: "Une couverture qui se porte, pour les soirées masque et les planchers froids",
    priceCents: 7999,
    compareAtCents: null,
    tags: ["cozy", "fall", "gift", "new", "home"],
    sortOrder: 30,
    descriptionEn: `<p><strong>The blanket that comes with you.</strong> A shaggy sherpa hooded blanket with sleeves and a big front pocket, long enough to cover your knees when you sit. Put it on for the LED mask, the movie, the 6 a.m. coffee.</p><h3>Details</h3><ul><li>One size, about 120 cm long: fits most adults, oversized on purpose.</li><li>Shaggy sherpa outside, soft fleece inside, ribbed cuffs.</li><li>Fibre content: polyester, as stated by the supplier.</li><li>Wash cold on gentle, tumble dry low or air-dry. Give it a shake: shaggy fabric sheds a little on the first wash.</li></ul><p>Not a branded product: made for us by a textile supplier, without a logo.</p>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>La couverture qui vous suit partout.</strong> Une couverture sherpa à capuchon, avec manches et grande poche avant, assez longue pour couvrir les genoux quand vous êtes assise. Vous l'enfilez pour le masque LED, le film, le café de 6 h.</p><h3>Détails</h3><ul><li>Taille unique, environ 120 cm de long : convient à la plupart des adultes, volontairement surdimensionnée.</li><li>Sherpa à poils longs à l'extérieur, molleton doux à l'intérieur, poignets côtelés.</li><li>Composition : polyester, selon le fournisseur.</li><li>Lavage à l'eau froide, cycle délicat ; séchage à basse température ou à l'air. Secouez-la : un tissu à poils longs perd un peu au premier lavage.</li></ul><p>Ce n'est pas un produit de marque : fabriqué pour nous par un fournisseur textile, sans logo.</p>${FOOTER_HYGIENE_FR}`,
    options: [
      colour([
        { value: "Khaki", labelEn: "Khaki", labelFr: "Kaki" },
        { value: "Light Brown", labelEn: "Light brown", labelFr: "Brun pâle" },
        { value: "Light Grey", labelEn: "Light grey", labelFr: "Gris pâle" },
        { value: "Grey", labelEn: "Grey", labelFr: "Gris" },
        { value: "Dark Grey", labelEn: "Dark grey", labelFr: "Gris foncé" },
        { value: "White", labelEn: "White", labelFr: "Blanc" },
        { value: "Black", labelEn: "Black", labelFr: "Noir" },
        { value: "Pink", labelEn: "Pink", labelFr: "Rose" },
      ]),
    ],
    images: [1, 2, 3, 4, 5].map((n) => `${SITE}/hooded-sherpa-blanket-${n}.jpg`),
    supplierUrl: `${AE}/1005013053845657.html?shipCountry=CA&currency=CAD`,
    supplierSku: "AE-1005013053845657",
    shippingNote:
      "AliExpress (not CJ). Order the variant Colour = as chosen, Size = Length 120cm. C$51.68 incl. free shipping to Canada on 2026-09-25, delivery quoted Oct 3-13 (about 1-2 weeks), 800+ sold. Landed C$51.68 → 35% margin at 79.99. Ship to the customer's address directly; choose 'no invoice / gift' if offered.",
  },
  {
    slug: "pumpkin-velvet-cushion-cover",
    nameEn: "Pumpkin Velvet Cushion Cover, 18 × 18",
    nameFr: "Housse de coussin citrouille en velours, 18 × 18",
    tagline: "Embroidered velvet for the sofa, October to Thanksgiving",
    taglineFr: "Du velours brodé pour le canapé, d'octobre à l'Action de grâce",
    priceCents: 1799,
    compareAtCents: null,
    tags: ["cozy", "fall", "gift", "new", "home"],
    sortOrder: 31,
    descriptionEn: `<p><strong>The easiest way to make a room feel like October.</strong> A soft velvet cover with an embroidered pumpkin, in warm tones that go with wood, cream and rust. Slip it over a cushion you already own.</p><h3>Details</h3><ul><li>Cover only, 45 × 45 cm (18 × 18 in). Fits a standard 18-inch insert; no insert included.</li><li>Hidden zipper. Embroidered front, plain velvet back.</li><li>Fibre content: polyester velvet, as stated by the supplier.</li><li>Wash cold on gentle, inside out; air-dry.</li></ul>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>La façon la plus simple de donner un air d'octobre à une pièce.</strong> Une housse en velours doux, avec une citrouille brodée, dans des tons chauds qui s'accordent au bois, au crème et à la rouille. Elle se glisse sur un coussin que vous avez déjà.</p><h3>Détails</h3><ul><li>Housse seulement, 45 × 45 cm (18 × 18 po). Pour un coussin standard de 18 po ; coussin non inclus.</li><li>Fermeture éclair invisible. Devant brodé, dos en velours uni.</li><li>Composition : velours de polyester, selon le fournisseur.</li><li>Lavage à l'eau froide, cycle délicat, à l'envers ; séchage à l'air.</li></ul>${FOOTER_HYGIENE_FR}`,
    options: [],
    images: [1, 2, 3, 4].map((n) => `${SITE}/pumpkin-velvet-cushion-cover-${n}.jpg`),
    supplierUrl: `${AE}/1005009784126272.html?shipCountry=CA&currency=CAD`,
    supplierSku: "AE-1005009784126272",
    shippingNote:
      "AliExpress (not CJ). Order the variant '45X45cm Pumpkin' (NOT the 30x50 'welcome' one). C$9.30 incl. free shipping to Canada on 2026-09-25, delivery quoted Oct 4-9. Landed C$9.30 → 48% margin at 17.99.",
  },
  {
    slug: "velvet-pumpkin-set",
    nameEn: "Velvet Pumpkins, Set of 30",
    nameFr: "Citrouilles en velours, ensemble de 30",
    tagline: "A bowl of little pumpkins for the table, the mantel, the tray",
    taglineFr: "Un bol de petites citrouilles pour la table, le manteau de cheminée, le plateau",
    priceCents: 2499,
    compareAtCents: null,
    tags: ["cozy", "fall", "gift", "new", "home"],
    sortOrder: 32,
    descriptionEn: `<p><strong>Fall decor you set out in two minutes and keep for years.</strong> Thirty small velvet pumpkins in an autumn mix of creams, rusts and greens, with stems. Fill a bowl, line a shelf, tuck a few into a gift basket.</p><h3>Details</h3><ul><li>30 pieces in assorted colours and sizes, as pictured (about 3-5 cm each).</li><li>Foam core wrapped in velvet; decorative only, not a toy. Keep away from children under 3 (small parts) and from candles.</li><li>Wipe with a dry cloth. Store flat in the box between seasons.</li></ul>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>Un décor d'automne qui s'installe en deux minutes et se garde des années.</strong> Trente petites citrouilles en velours, dans un mélange automnal de crème, de rouille et de vert, avec leur tige. Remplissez un bol, garnissez une tablette, glissez-en quelques-unes dans un panier-cadeau.</p><h3>Détails</h3><ul><li>30 pièces, couleurs et tailles assorties, comme sur la photo (environ 3 à 5 cm chacune).</li><li>Cœur en mousse recouvert de velours ; décoratif seulement, pas un jouet. Tenir loin des enfants de moins de 3 ans (petites pièces) et des bougies.</li><li>Essuyer avec un linge sec. Ranger à plat dans la boîte entre les saisons.</li></ul>${FOOTER_HYGIENE_FR}`,
    options: [],
    images: [1, 2, 3, 4].map((n) => `${SITE}/velvet-pumpkin-set-${n}.jpg`),
    supplierUrl: `${AE}/1005012975458134.html?shipCountry=CA&currency=CAD`,
    supplierSku: "AE-1005012975458134",
    shippingNote:
      "AliExpress (not CJ). Order the variant '30pcs-D' (the default, matches the photos). C$8.62 incl. free shipping to Canada on 2026-09-25, delivery quoted Oct 3-8. Landed C$8.62 → 65% margin at 24.99. Replaces the flocked pumpkin candle jar idea: no candle (fire risk + shipping restrictions).",
  },
  // -------------------------------------------------------------------------
  // Hair (2026-09-25): first piece of the /collections/hair range.
  // -------------------------------------------------------------------------
  {
    slug: "satin-pillowcase",
    nameEn: "Satin Pillowcase",
    nameFr: "Taie d'oreiller en satin",
    tagline: "Less friction on hair and skin, every night",
    taglineFr: "Moins de friction sur les cheveux et la peau, chaque nuit",
    priceCents: 1999,
    compareAtCents: null,
    tags: ["hair", "essentials", "gift", "new"],
    sortOrder: 33,
    descriptionEn: `<p><strong>The easiest hair habit there is.</strong> A smooth satin pillowcase lets hair glide instead of catching, so you wake with fewer tangles and creases. It also feels cool against the face on warm nights.</p><h3>Details</h3><ul><li>One pillowcase, 51 × 74 cm (20 × 29 in): fits a standard or queen pillow.</li><li>Fibre content: polyester satin, as stated by the supplier. Not silk.</li><li>Wash cold on gentle, air-dry or tumble low. Colours may vary slightly from the photos.</li><li>Pairs with the Satin Beauty-Sleep Set and the satin scrunchie.</li></ul>${FOOTER_HYGIENE_EN}`,
    descriptionFr: `<p><strong>L'habitude capillaire la plus simple qui soit.</strong> Une taie en satin lisse laisse glisser les cheveux au lieu de les accrocher : moins de nœuds et de plis au réveil. Elle est aussi fraîche contre le visage les nuits chaudes.</p><h3>Détails</h3><ul><li>Une taie, 51 × 74 cm (20 × 29 po) : pour un oreiller standard ou queen.</li><li>Composition : satin de polyester, selon le fournisseur. Ce n'est pas de la soie.</li><li>Lavage à l'eau froide, cycle délicat ; séchage à l'air ou à basse température. Les couleurs peuvent varier légèrement des photos.</li><li>S'agence à l'Ensemble beauté-sommeil en satin et au chouchou en satin.</li></ul>${FOOTER_HYGIENE_FR}`,
    options: [
      colour([
        { value: "Champagne", labelEn: "Champagne", labelFr: "Champagne" },
        { value: "Beige", labelEn: "Beige", labelFr: "Beige" },
        { value: "Pink", labelEn: "Pink", labelFr: "Rose" },
        { value: "Silver", labelEn: "Silver", labelFr: "Argent" },
        { value: "Grey", labelEn: "Grey", labelFr: "Gris" },
        { value: "Blue", labelEn: "Blue", labelFr: "Bleu" },
        { value: "Coffee", labelEn: "Coffee", labelFr: "Café" },
        { value: "White", labelEn: "White", labelFr: "Blanc" },
        { value: "Black", labelEn: "Black", labelFr: "Noir" },
      ]),
    ],
    images: [1, 4, 5, 2, 3].map((n) => `${SITE}/satin-pillowcase-${n}.jpg`),
    supplierUrl: `${CJ}/x-p-F25DF9B2-5E6B-42C9-85FD-B34D55E39822.html`,
    supplierSku: "CJJJJFZT00222-Beige-20X29inches-1PC",
    shippingNote:
      "CJ (China warehouse, factory stock 32k). Variant = <Colour> + Dimensions 20X29inches + Quantity 1PC; SKU pattern CJJJJFZT00222-<Color>-20X29inches-1PC (colour spelled as on CJ: black / white lowercase). $1.75-2.00 USD, 120 g. Only 'Champagne' and 'Silk white' in 75x50 are mulberry silk: we sell the polyester satin 20x29 only. CJPacket to CA about $4.90 USD alone; landed ~$6.90 USD ≈ C$9.50 → 52% at 19.99.",
  },
];

// ---------------------------------------------------------------------------
// SETS — curated bundles (contents + CJ variants in src/lib/sets.ts).
// No options (colours picked by us). Images = components' current images.
// compareAtCents = sum of component sale prices × qty, so the store shows
// "Save X%". Fulfilment recipe lives in shippingNote (admin + owner email).
// ---------------------------------------------------------------------------

type SeedSet = {
  slug: string;
  nameEn: string;
  nameFr: string;
  tagline: string;
  taglineFr: string;
  priceCents: number;
  tags: string[];
  sortOrder: number;
  hookEn: string;
  hookFr: string;
  routineEn: string[];
  routineFr: string[];
  goodEn: string[];
  goodFr: string[];
  /** No electric device inside: hygiene footer, no warranty line. */
  hygieneOnly?: boolean;
  /** Launch price: an existing row still at this price gets the new price + compare-at. */
  prevPriceCents: number;
  /** Targeted copy updates [from, to] (EN or FR), applied only where `from` is still present verbatim. */
  swaps?: [string, string][];
};

const COSMETIC_EN = "Cosmetic at-home devices, not medical devices.";
const COSMETIC_FR = "Appareils cosmétiques à usage domestique, pas des dispositifs médicaux.";
const PICKED_EN = "Colours are picked by us to suit the set.";
const PICKED_FR = "Les couleurs sont choisies par nous pour s'agencer au coffret.";
// Sets are placed as ONE CJ order (China warehouse), so they ship as one parcel.
const LEGACY_PARCELS_EN = "Items may ship in separate parcels.";
const LEGACY_PARCELS_FR = "Les articles peuvent arriver en colis séparés.";
const PARCELS_EN = "Everything is ordered and shipped together, normally in one parcel.";
const PARCELS_FR = "Tout est commandé et expédié ensemble, normalement en un seul colis.";
const hygieneEn = (items: string) => `Hygiene items (${items}) are returnable only if unopened.`;
const hygieneFr = (items: string) => `Articles d'hygiène (${items}) : retours acceptés seulement s'ils sont non ouverts.`;

const XMAS_EN = "Christmas edition: order by November 26 for delivery before the 24th (2–4 weeks door to door). On sale until December 20, or while the colours last.";
const XMAS_FR = "Édition de Noël : commandez avant le 26 novembre pour une livraison avant le 24 (2 à 4 semaines porte à porte). En vente jusqu'au 20 décembre, ou jusqu'à épuisement des couleurs.";
const COLOURS_EN = "Colours picked by us to suit the box; the photos show each piece in its standard colour, so the shades you receive may differ.";
const COLOURS_FR = "Couleurs choisies par nous pour s'agencer au coffret ; les photos montrent chaque pièce dans sa couleur standard, les teintes reçues peuvent différer.";

const SETS: SeedSet[] = [
  {
    slug: "set-full-ritual",
    nameEn: "The Full Ritual",
    nameFr: "Le Rituel complet",
    tagline: "Cool, lift, glow: the whole routine in one box",
    taglineFr: "Fraîcheur, lift, éclat : toute la routine dans une boîte",
    priceCents: 16999,
    prevPriceCents: 15999,
    swaps: [
      [
        "Four pieces, one evening ritual, and the most complete set we make.",
        "Four tools plus a satin beauty-sleep set, one evening ritual, and the most complete set we make."
      ],
      [
        "Quatre pièces, un rituel du soir, et notre coffret le plus complet.",
        "Quatre outils et un ensemble beauté-sommeil en satin, un rituel du soir, et notre coffret le plus complet."
      ]
    ],
    tags: ["sets", "glow", "sculpt", "cool", "essentials", "gift"],
    sortOrder: 20,
    hookEn:
      "<p><strong>The complete CMAC routine, in the order we actually use it.</strong> Cool to wake the skin up, lift for a more defined look, glow to wind down. Four pieces, one evening ritual, and the most complete set we make.</p>",
    hookFr:
      "<p><strong>La routine CMAC au complet, dans l'ordre où on l'utilise vraiment.</strong> La fraîcheur pour réveiller la peau, le lift pour un air plus défini, l'éclat pour décrocher. Quatre pièces, un rituel du soir, et notre coffret le plus complet.</p>",
    routineEn: [
      "Headband on, then cleanse. <strong>Cool:</strong> glide the ice roller from the nose outward for about 60 seconds.",
      "<strong>Lift:</strong> apply a water-based conductive gel and make slow upward passes with the microcurrent device for 5 minutes. Rinse off the gel.",
      "<strong>Glow:</strong> fit the LED mask and lie back for a 10-minute session, eyes closed.",
      "Serum, moisturizer, headband off. Done.",
    ],
    routineFr: [
      "Bandeau en place, puis nettoyage. <strong>Fraîcheur :</strong> glissez le rouleau de glace du nez vers l'extérieur pendant environ 60 secondes.",
      "<strong>Lift :</strong> appliquez un gel conducteur à base d'eau et faites des passages lents vers le haut avec l'appareil microcourant pendant 5 minutes. Rincez le gel.",
      "<strong>Éclat :</strong> ajustez le masque LED et allongez-vous pour une séance de 10 minutes, les yeux fermés.",
      "Sérum, hydratant, on retire le bandeau. C'est fait.",
    ],
    goodEn: [
      COSMETIC_EN,
      "Do not use the devices if you are pregnant, have a pacemaker or implanted electronic device, epilepsy, metal implants in the face, are photosensitive or on light-sensitizing medication, or have an active skin condition. Ask your doctor if unsure.",
      "Keep eyes closed during LED sessions. Always use the microcurrent device with a conductive gel (not included), never over the thyroid or the eyes.",
      "Keep the ice roller moving and don't press hard under the eyes.",
      PICKED_EN,
      hygieneEn("ice roller, headband"),
      PARCELS_EN,
    ],
    goodFr: [
      COSMETIC_FR,
      "Ne pas utiliser les appareils si vous êtes enceinte, portez un stimulateur cardiaque ou un dispositif électronique implanté, souffrez d'épilepsie, avez des implants métalliques au visage, êtes photosensible ou sous médication photosensibilisante, ou avez une affection cutanée active. En cas de doute, consultez votre médecin.",
      "Gardez les yeux fermés pendant les séances LED. Utilisez toujours l'appareil microcourant avec un gel conducteur (non inclus), jamais sur la thyroïde ni sur les yeux.",
      "Gardez le rouleau de glace en mouvement et n'appuyez pas fort sous les yeux.",
      PICKED_FR,
      hygieneFr("rouleau de glace, bandeau"),
      PARCELS_FR,
    ],
  },
  {
    slug: "set-7am-reset",
    nameEn: "The 7 AM Reset",
    nameFr: "Le Reset de 7 h",
    tagline: "From pillow face to ready in 5 minutes",
    taglineFr: "De l'oreiller à la porte en 5 minutes",
    priceCents: 7999,
    prevPriceCents: 7699,
    tags: ["sets", "cool", "glow", "essentials", "gift"],
    sortOrder: 21,
    hookEn:
      "<p><strong>For mornings that start with an alarm and end at the door.</strong> Commuters, 9-to-5ers, parents doing three things at once: this is the quickest way we know to look more awake before the coffee kicks in. A cold glide, a little warmth around the eyes, hair out of the way, done.</p>",
    hookFr:
      "<p><strong>Pour les matins qui commencent avec le cadran et finissent à la porte.</strong> Navetteurs, 9 à 5, parents qui font trois choses à la fois : c'est la façon la plus rapide qu'on connaisse d'avoir l'air plus réveillé avant que le café fasse effet. Un passage froid, un peu de chaleur autour des yeux, les cheveux dégagés, c'est réglé.</p>",
    routineEn: [
      "Headband on, splash of water or your cleanser.",
      "Glide the ice roller from the nose outward, under the eyes and along the jaw. About 60 seconds.",
      "Apply eye cream, then the glow wand for a minute per side, inner corner outward.",
      "Headband off, sunscreen or makeup, out the door.",
    ],
    routineFr: [
      "Bandeau en place, un peu d'eau ou votre nettoyant.",
      "Glissez le rouleau de glace du nez vers l'extérieur, sous les yeux et le long de la mâchoire. Environ 60 secondes.",
      "Appliquez votre crème contour des yeux, puis la baguette éclat une minute par côté, du coin interne vers l'extérieur.",
      "On retire le bandeau, écran solaire ou maquillage, et on part.",
    ],
    goodEn: [
      COSMETIC_EN,
      "Do not use the glow wand if you are pregnant, have a pacemaker or implanted electronic device, epilepsy, are photosensitive or on light-sensitizing medication, or have an active skin condition or broken skin around the eyes. Ask your doctor if unsure.",
      "Keep eyes closed and never place the wand on the eyeball or eyelid. Keep the ice roller moving and don't press hard under the eyes.",
      PICKED_EN,
      hygieneEn("ice roller, headband"),
      PARCELS_EN,
    ],
    goodFr: [
      COSMETIC_FR,
      "Ne pas utiliser la baguette éclat si vous êtes enceinte, portez un stimulateur cardiaque ou un dispositif électronique implanté, souffrez d'épilepsie, êtes photosensible ou sous médication photosensibilisante, ou avez une affection cutanée active ou une peau lésée autour des yeux. En cas de doute, consultez votre médecin.",
      "Gardez les yeux fermés et ne posez jamais la baguette sur le globe oculaire ni sur la paupière. Gardez le rouleau de glace en mouvement et n'appuyez pas fort sous les yeux.",
      PICKED_FR,
      hygieneFr("rouleau de glace, bandeau"),
      PARCELS_FR,
    ],
  },
  {
    slug: "set-midnight-glow",
    nameEn: "Midnight Glow Ritual",
    nameFr: "Rituel Éclat de minuit",
    tagline: "Cleanse, glow, lights out",
    taglineFr: "Nettoyage, éclat, extinction des feux",
    priceCents: 10999,
    prevPriceCents: 9999,
    swaps: [
      [
        "then a satin-feel mask for lights out.",
        "then the satin beauty-sleep set (eye mask, pillowcase, scrunchie, headband) for lights out."
      ],
      [
        "puis un masque effet satin pour l'extinction des feux.",
        "puis l'ensemble beauté-sommeil en satin (masque, taie, chouchou, bandeau) pour l'extinction des feux."
      ]
    ],
    tags: ["sets", "glow", "essentials", "gift"],
    sortOrder: 22,
    hookEn:
      "<p><strong>For night owls who save the best part of the day for last.</strong> A soft sonic cleanse, ten minutes under the LED mask, then a satin-feel mask for lights out. It turns the end of the evening into a ritual instead of an afterthought.</p>",
    hookFr:
      "<p><strong>Pour les oiseaux de nuit qui gardent le meilleur de la journée pour la fin.</strong> Un nettoyage sonique tout doux, dix minutes sous le masque LED, puis un masque effet satin pour l'extinction des feux. La fin de soirée devient un rituel plutôt qu'une corvée.</p>",
    routineEn: [
      "Wet your face, add cleanser and move the sonic brush in small circles for about a minute. Rinse and pat dry.",
      "Fit the LED mask for a 10-minute session, eyes closed, while you listen to something good.",
      "Serum and moisturizer. Give them a few minutes to settle.",
      "Sleep mask on. Lights out.",
    ],
    routineFr: [
      "Mouillez votre visage, ajoutez votre nettoyant et faites de petits cercles avec la brosse sonique pendant environ une minute. Rincez et épongez.",
      "Ajustez le masque LED pour une séance de 10 minutes, les yeux fermés, en écoutant quelque chose de bon.",
      "Sérum et hydratant. Laissez-les pénétrer quelques minutes.",
      "Masque de nuit en place. Bonne nuit.",
    ],
    goodEn: [
      COSMETIC_EN,
      "Do not use the LED mask if you are pregnant, photosensitive, on light-sensitizing medication, or have an active skin condition. Ask your doctor if unsure. Keep eyes closed during sessions.",
      "Do not use the cleansing brush on broken, irritated or sunburnt skin, and avoid the eye area.",
      PICKED_EN,
      hygieneEn("cleansing brush, sleep mask"),
      PARCELS_EN,
    ],
    goodFr: [
      COSMETIC_FR,
      "Ne pas utiliser le masque LED si vous êtes enceinte, photosensible, sous médication photosensibilisante, ou si vous avez une affection cutanée active. En cas de doute, consultez votre médecin. Gardez les yeux fermés pendant les séances.",
      "Ne pas utiliser la brosse nettoyante sur une peau lésée, irritée ou brûlée par le soleil, et évitez le contour des yeux.",
      PICKED_FR,
      hygieneFr("brosse nettoyante, masque de nuit"),
      PARCELS_FR,
    ],
  },
  {
    slug: "set-sweater-weather",
    nameEn: "Sweater Weather Skin Kit",
    nameFr: "Trousse Temps de pull",
    tagline: "Your skin's cozy season. Fall limited edition",
    taglineFr: "La saison douillette de votre peau. Édition limitée d'automne",
    priceCents: 10999,
    prevPriceCents: 10999,
    swaps: [
      [
        "a soft headband and a satin-feel mask for lights out.",
        "a soft headband, fluffy fleece socks and a satin-feel mask for lights out."
      ],
      [
        "un bandeau tout doux et un masque effet satin pour l'extinction des feux.",
        "un bandeau tout doux, des bas moelleux en molleton et un masque effet satin pour l'extinction des feux."
      ]
    ],
    tags: ["sets", "glow", "essentials", "gift", "fall", "limited"],
    sortOrder: 23,
    hookEn:
      "<p><strong>Dark by 5 p.m.? Perfect.</strong> Our fall limited edition is made for long, cozy evenings: ten minutes under the LED mask, a slow scalp massage, a soft headband and a satin-feel mask for lights out. Available until November 30.</p>",
    hookFr:
      "<p><strong>Il fait noir à 17 h ? Parfait.</strong> Notre édition limitée d'automne est pensée pour les longues soirées douillettes : dix minutes sous le masque LED, un massage lent du cuir chevelu, un bandeau tout doux et un masque effet satin pour l'extinction des feux. Offerte jusqu'au 30 novembre.</p>",
    routineEn: [
      "Tea, blanket, headband on. Cleanse and dry your face.",
      "Fit the LED mask and settle in for a 10-minute session, eyes closed.",
      "Serum and moisturizer, then a few minutes with the scalp massager from the crown down to the nape.",
      "Sleep mask on. Lights out.",
    ],
    routineFr: [
      "Une tisane, une doudou, le bandeau en place. Nettoyez et séchez votre visage.",
      "Ajustez le masque LED et installez-vous pour une séance de 10 minutes, les yeux fermés.",
      "Sérum et hydratant, puis quelques minutes de masseur du sommet de la tête jusqu'à la nuque.",
      "Masque de nuit en place. Bonne nuit.",
    ],
    goodEn: [
      COSMETIC_EN,
      "Do not use the LED mask if you are pregnant, photosensitive, on light-sensitizing medication, or have an active skin condition. Keep eyes closed during sessions.",
      "Do not use the scalp massager on broken or irritated skin, or if you have a pacemaker or implanted electronic device. Keep long hair loose. Ask your doctor if unsure.",
      "Fall limited edition, available until November 30.",
      PICKED_EN,
      hygieneEn("sleep mask, headband"),
      PARCELS_EN,
    ],
    goodFr: [
      COSMETIC_FR,
      "Ne pas utiliser le masque LED si vous êtes enceinte, photosensible, sous médication photosensibilisante, ou si vous avez une affection cutanée active. Gardez les yeux fermés pendant les séances.",
      "Ne pas utiliser le masseur sur une peau lésée ou irritée, ni si vous portez un stimulateur cardiaque ou un dispositif électronique implanté. Laissez les cheveux longs détachés. En cas de doute, consultez votre médecin.",
      "Édition limitée d'automne, offerte jusqu'au 30 novembre.",
      PICKED_FR,
      hygieneFr("masque de nuit, bandeau"),
      PARCELS_FR,
    ],
  },
  {
    slug: "set-pink-pop",
    nameEn: "Pink Pop Glow Kit",
    nameFr: "Trousse Pink Pop",
    tagline: "Everything pink, everything glow",
    taglineFr: "Tout en rose, tout en éclat",
    priceCents: 9999,
    prevPriceCents: 9499,
    swaps: [
      [
        "Four of our favourite tools in their pink (and rose-gold) versions: cleanse",
        "Four of our favourite tools in their pink (and rose-gold) versions, plus a pink satin scrunchie, zipped into a rose shell pouch: cleanse"
      ],
      [
        "Quatre de nos outils préférés dans leurs versions roses (et or rose) : on nettoie",
        "Quatre de nos outils préférés dans leurs versions roses (et or rose), plus un chouchou en satin rose, dans une trousse coquillage rose : on nettoie"
      ]
    ],
    tags: ["sets", "glow", "cool", "essentials", "gift"],
    sortOrder: 24,
    hookEn:
      "<p><strong>Your vanity called. It wants to be pink.</strong> Four of our favourite tools in their pink (and rose-gold) versions: cleanse, chill, glow, repeat. Made for girly-pop routines, get-ready-with-me videos and the friend who deserves a really good gift.</p>",
    hookFr:
      "<p><strong>Votre coiffeuse a appelé. Elle veut du rose.</strong> Quatre de nos outils préférés dans leurs versions roses (et or rose) : on nettoie, on rafraîchit, on illumine, on recommence. Pour les routines girly pop, les vidéos « prépare-toi avec moi » et l'amie qui mérite un vrai beau cadeau.</p>",
    routineEn: [
      "Headband on. Pink, obviously.",
      "Sonic brush with your cleanser for about a minute, then rinse.",
      "Ice roller from the nose outward for 60 seconds.",
      "Eye cream, then the glow wand for a minute or two per side. Hit record if you like.",
    ],
    routineFr: [
      "Bandeau en place. Rose, évidemment.",
      "Brosse sonique avec votre nettoyant pendant environ une minute, puis rincez.",
      "Rouleau de glace du nez vers l'extérieur pendant 60 secondes.",
      "Crème contour des yeux, puis la baguette éclat une minute ou deux par côté. On filme si ça nous tente.",
    ],
    goodEn: [
      COSMETIC_EN,
      "Do not use the glow wand if you are pregnant, have a pacemaker or implanted electronic device, epilepsy, are photosensitive or on light-sensitizing medication, or have an active skin condition or broken skin around the eyes. Ask your doctor if unsure. Never place it on the eyeball or eyelid.",
      "Do not use the cleansing brush on broken, irritated or sunburnt skin, and avoid the eye area.",
      "Pink version of every piece; the glow wand comes in rose gold, its pinkest shade.",
      hygieneEn("cleansing brush, ice roller, headband"),
      PARCELS_EN,
    ],
    goodFr: [
      COSMETIC_FR,
      "Ne pas utiliser la baguette éclat si vous êtes enceinte, portez un stimulateur cardiaque ou un dispositif électronique implanté, souffrez d'épilepsie, êtes photosensible ou sous médication photosensibilisante, ou avez une affection cutanée active ou une peau lésée autour des yeux. En cas de doute, consultez votre médecin. Ne la posez jamais sur le globe oculaire ni sur la paupière.",
      "Ne pas utiliser la brosse nettoyante sur une peau lésée, irritée ou brûlée par le soleil, et évitez le contour des yeux.",
      "Version rose de chaque pièce ; la baguette éclat est en or rose, sa teinte la plus rose.",
      hygieneFr("brosse nettoyante, rouleau de glace, bandeau"),
      PARCELS_FR,
    ],
  },
  {
    slug: "set-carry-on-glow",
    nameEn: "Carry-On Glow",
    nameFr: "Éclat en cabine",
    tagline: "Pack light, land glowing",
    taglineFr: "Bagage léger, arrivée éclatante",
    priceCents: 7999,
    prevPriceCents: 7699,
    swaps: [
      [
        "and a headband that folds to nothing: a small kit",
        "and a headband that folds to nothing, plus a satin scrunchie, all zipped into a travel organizer: a small kit"
      ],
      [
        "et un bandeau qui se plie en rien : une petite trousse",
        "et un bandeau qui se plie en rien, plus un chouchou en satin, le tout zippé dans un organisateur de voyage : une petite trousse"
      ]
    ],
    tags: ["sets", "glow", "essentials", "gift"],
    sortOrder: 25,
    hookEn:
      "<p><strong>For red-eyes, road trips and hotel rooms with thin curtains.</strong> A pocket-size eye wand, a satin-feel sleep mask and a headband that folds to nothing: a small kit that fits in a carry-on and makes any seat or hotel bed feel a bit more like home. Made with flight attendants and frequent travellers in mind.</p>",
    hookFr:
      "<p><strong>Pour les vols de nuit, les road trips et les chambres d'hôtel aux rideaux trop minces.</strong> Une baguette pour les yeux format poche, un masque de nuit effet satin et un bandeau qui se plie en rien : une petite trousse qui entre dans un bagage de cabine et rend n'importe quel siège ou lit d'hôtel un peu plus comme chez soi. Pensée pour les agents de bord et les grands voyageurs.</p>",
    routineEn: [
      "Before boarding or on arrival: headband on, freshen up with water or a cleansing wipe.",
      "Apply eye cream and glide the glow wand for a minute per side, inner corner outward.",
      "Headband off, sleep mask on for the flight, the back seat or the hotel night.",
      "Land, stretch, repeat step 2 if the night was short.",
    ],
    routineFr: [
      "Avant l'embarquement ou à l'arrivée : bandeau en place, on se rafraîchit avec de l'eau ou une lingette nettoyante.",
      "Appliquez votre crème contour des yeux et glissez la baguette éclat une minute par côté, du coin interne vers l'extérieur.",
      "On retire le bandeau, masque de nuit en place pour le vol, la banquette arrière ou la nuit à l'hôtel.",
      "On atterrit, on s'étire, on refait l'étape 2 si la nuit a été courte.",
    ],
    goodEn: [
      COSMETIC_EN,
      "Do not use the glow wand if you are pregnant, have a pacemaker or implanted electronic device, epilepsy, are photosensitive or on light-sensitizing medication, or have an active skin condition or broken skin around the eyes. Ask your doctor if unsure. Never place it on the eyeball or eyelid.",
      "Check your airline's rules for electronic devices in carry-on bags.",
      PICKED_EN,
      hygieneEn("sleep mask, headband"),
      PARCELS_EN,
    ],
    goodFr: [
      COSMETIC_FR,
      "Ne pas utiliser la baguette éclat si vous êtes enceinte, portez un stimulateur cardiaque ou un dispositif électronique implanté, souffrez d'épilepsie, êtes photosensible ou sous médication photosensibilisante, ou avez une affection cutanée active ou une peau lésée autour des yeux. En cas de doute, consultez votre médecin. Ne la posez jamais sur le globe oculaire ni sur la paupière.",
      "Vérifiez les règles de votre compagnie aérienne pour les appareils électroniques en cabine.",
      PICKED_FR,
      hygieneFr("masque de nuit, bandeau"),
      PARCELS_FR,
    ],
  },
  {
    slug: "set-bestie-duo",
    nameEn: "Bestie Glow Duo",
    nameFr: "Duo Glow entre copines",
    tagline: "One for you, one for your bestie",
    taglineFr: "Un pour toi, un pour ta meilleure amie",
    priceCents: 6999,
    prevPriceCents: 6999,
    swaps: [
      [
        "Two ice rollers and two spa headbands: one set for you",
        "Two ice rollers, two spa headbands and two satin scrunchies: one set for you"
      ],
      [
        "Deux rouleaux de glace et deux bandeaux spa : un ensemble pour toi",
        "Deux rouleaux de glace, deux bandeaux spa et deux chouchous en satin : un ensemble pour toi"
      ]
    ],
    tags: ["sets", "cool", "essentials", "gift"],
    sortOrder: 26,
    hygieneOnly: true,
    hookEn:
      "<p><strong>Some things are better in pairs.</strong> Two ice rollers and two spa headbands: one set for you, one for the friend who still answers your texts at 1 a.m. Made for Galentine's Day (Feb 13) and Girlfriends Day (Aug 1), and honestly, any Tuesday.</p>",
    hookFr:
      "<p><strong>Certaines choses sont meilleures à deux.</strong> Deux rouleaux de glace et deux bandeaux spa : un ensemble pour toi, un pour l'amie qui répond encore à tes textos à 1 h du matin. Parfait pour la Saint-Valentin entre copines (13 février) et la Journée des copines (1er août), et franchement, pour n'importe quel mardi.</p>",
    routineEn: [
      "Fill both moulds and freeze them overnight. Sleepover optional.",
      "Headbands on.",
      "Sixty seconds of ice roller each: nose outward, under the eyes, along the jaw.",
      "Pat dry, carry on with your routines, take the selfie.",
    ],
    routineFr: [
      "Remplissez les deux moules et congelez-les pour la nuit. Pyjama party facultatif.",
      "Bandeaux en place.",
      "Soixante secondes de rouleau de glace chacune : du nez vers l'extérieur, sous les yeux, le long de la mâchoire.",
      "On éponge, on continue la routine, on prend le selfie.",
    ],
    goodEn: [
      "Two different colours of each piece, picked by us, so nobody mixes them up.",
      "Keep the ice moving and don't press hard under the eyes.",
      hygieneEn("ice rollers, headbands"),
      PARCELS_EN,
    ],
    goodFr: [
      "Deux couleurs différentes pour chaque pièce, choisies par nous, pour ne pas les mélanger.",
      "Gardez la glace en mouvement et n'appuyez pas fort sous les yeux.",
      hygieneFr("rouleaux de glace, bandeaux"),
      PARCELS_FR,
    ],
  },
  // ---------------------------------------------------------------- Couca Beauty client sets (2026-09-22)
  {
    slug: "set-between-appointments",
    nameEn: "Between Appointments Kit",
    nameFr: "Trousse Entre deux rendez-vous",
    tagline: "Keep your manicure looking fresh until the next visit",
    taglineFr: "Une manucure qui garde son air frais jusqu'à la prochaine visite",
    priceCents: 5499,
    prevPriceCents: 5999, // 2026-09-22 market review
    tags: ["sets", "essentials", "nails", "gift", "new"],
    sortOrder: 27,
    hygieneOnly: false,
    hookEn:
      "<p><strong>For the girl who books her next appointment before she leaves.</strong> Everything to keep natural nails neat between salon visits: a rechargeable nail care pen, a rose-gold manicure kit in its case, and cover gloves to wear under the lamp at your next gel appointment. Made with our friends at Couca Beauty in mind.</p>",
    hookFr:
      "<p><strong>Pour celle qui prend son prochain rendez-vous avant de partir.</strong> Tout pour garder des ongles naturels soignés entre deux visites au salon : un stylo soin des ongles rechargeable, une trousse de manucure or rose dans son étui, et des gants couvrants à porter sous la lampe à votre prochain rendez-vous gel. Pensé pour les clientes de nos amies de Couca Beauty.</p>",
    routineEn: [
      "Once a week: trim with the kit, then file in one direction.",
      "Soften cuticles in warm water and push them back gently.",
      "Buff away ridges with the nail care pen, lowest speed, light touch.",
      "Wash your hands and finish with your favourite hand cream.",
      "Gel day: gloves in your bag, fingertips out, hands covered under the lamp.",
    ],
    routineFr: [
      "Une fois par semaine : coupez avec la trousse, puis limez dans un seul sens.",
      "Assouplissez les cuticules dans l'eau tiède et repoussez-les doucement.",
      "Adoucissez les stries avec le stylo soin des ongles, vitesse basse, geste léger.",
      "Lavez-vous les mains et terminez avec votre crème préférée.",
      "Jour de gel : les gants dans votre sac, le bout des doigts dégagé, les mains couvertes sous la lampe.",
    ],
    goodEn: [
      "For natural nails. Leave gel removal, builder gel and extensions to your nail technician.",
      "Cosmetic at-home tools, not medical devices.",
      PICKED_EN,
      hygieneEn("manicure kit, gloves"),
      PARCELS_EN,
    ],
    goodFr: [
      "Pour les ongles naturels. Le retrait du gel, le gel de construction et les rallonges, on les laisse à votre technicienne.",
      "Outils cosmétiques à usage domestique, pas des dispositifs médicaux.",
      PICKED_FR,
      hygieneFr("trousse de manucure, gants"),
      PARCELS_FR,
    ],
  },
  {
    slug: "set-pedi-night",
    nameEn: "Pedi Night In",
    nameFr: "Soirée pédi à la maison",
    tagline: "Soft-looking heels and fluffy socks, no appointment needed",
    taglineFr: "Des talons d'apparence douce et des bas moelleux, sans rendez-vous",
    priceCents: 5999,
    prevPriceCents: 7999, // 2026-09-22 market review
    tags: ["sets", "essentials", "feet", "cozy", "gift", "new"],
    sortOrder: 28,
    hygieneOnly: false,
    hookEn:
      "<p><strong>A pedicure mood on a Tuesday night.</strong> The electric foot file for rough-looking heels, fluffy fleece socks to slip into after your moisturizer, a spa headband and a satin scrunchie to keep your hair out of the way.</p>",
    hookFr:
      "<p><strong>Une ambiance pédicure un mardi soir.</strong> La râpe électrique pour les talons rugueux, des bas en molleton moelleux à enfiler après votre crème, un bandeau spa et un chouchou en satin pour dégager vos cheveux.</p>",
    routineEn: [
      "Hair up with the scrunchie, headband on, playlist on.",
      "On clean, completely dry feet, glide the foot file lightly over rough areas.",
      "Rinse, pat dry and apply a generous layer of your foot cream.",
      "Fleece socks on for the rest of the evening.",
    ],
    routineFr: [
      "Cheveux attachés avec le chouchou, bandeau en place, musique en marche.",
      "Sur des pieds propres et parfaitement secs, glissez la râpe légèrement sur les zones rugueuses.",
      "Rincez, épongez et appliquez une bonne couche de votre crème pour les pieds.",
      "Bas en molleton pour le reste de la soirée.",
    ],
    goodEn: [
      "If you have diabetes or circulation problems, ask your doctor before using the foot file.",
      "Cosmetic at-home tool, not a medical device.",
      PICKED_EN,
      hygieneEn("socks, headband, scrunchie"),
      PARCELS_EN,
    ],
    goodFr: [
      "Si vous êtes diabétique ou avez des problèmes de circulation, consultez votre médecin avant d'utiliser la râpe.",
      "Outil cosmétique à usage domestique, pas un dispositif médical.",
      PICKED_FR,
      hygieneFr("bas, bandeau, chouchou"),
      PARCELS_FR,
    ],
  },
  {
    slug: "set-mani-pedi",
    nameEn: "The Mani-Pedi Box",
    nameFr: "Le coffret Mani-Pédi",
    tagline: "Hands and feet, head to toe, one gift",
    taglineFr: "Les mains et les pieds, de la tête aux orteils, un seul cadeau",
    priceCents: 9499,
    prevPriceCents: 10999, // 2026-09-22 market review
    tags: ["sets", "essentials", "nails", "feet", "gift", "new"],
    sortOrder: 29,
    hygieneOnly: false,
    hookEn:
      "<p><strong>The gift for the friend who never misses her nail appointment.</strong> The nail care pen, the rose-gold manicure kit, cover gloves for gel day, the electric foot file and fluffy fleece socks: everything to keep hands and feet looking cared for between salon visits.</p>",
    hookFr:
      "<p><strong>Le cadeau pour l'amie qui ne manque jamais son rendez-vous d'ongles.</strong> Le stylo soin des ongles, la trousse de manucure or rose, les gants couvrants pour le jour du gel, la râpe électrique pour les pieds et des bas en molleton moelleux : tout pour des mains et des pieds soignés entre deux visites au salon.</p>",
    routineEn: [
      "Hands, once a week: trim, file, push back softened cuticles, buff lightly with the pen.",
      "Feet, once a week: foot file on clean, dry heels, then moisturizer and fleece socks.",
      "Gel day: bring the cover gloves to your appointment.",
    ],
    routineFr: [
      "Les mains, une fois par semaine : couper, limer, repousser les cuticules assouplies, polir légèrement au stylo.",
      "Les pieds, une fois par semaine : râpe sur des talons propres et secs, puis crème et bas en molleton.",
      "Jour de gel : apportez les gants couvrants à votre rendez-vous.",
    ],
    goodEn: [
      "For natural nails. Leave gel removal and extensions to your nail technician.",
      "If you have diabetes or circulation problems, ask your doctor before using the foot file.",
      COSMETIC_EN,
      PICKED_EN,
      hygieneEn("manicure kit, gloves, socks"),
      PARCELS_EN,
    ],
    goodFr: [
      "Pour les ongles naturels. Le retrait du gel et les rallonges, on les laisse à votre technicienne.",
      "Si vous êtes diabétique ou avez des problèmes de circulation, consultez votre médecin avant d'utiliser la râpe.",
      COSMETIC_FR,
      PICKED_FR,
      hygieneFr("trousse de manucure, gants, bas"),
      PARCELS_FR,
    ],
  },
  {
    slug: "set-fall-basket",
    nameEn: "The Fall Basket",
    nameFr: "Le panier d'automne",
    tagline: "A cozy night in, packed in a caramel case. Fall limited edition",
    taglineFr: "Une soirée douillette, dans un étui caramel. Édition limitée d'automne",
    priceCents: 8499,
    prevPriceCents: 8999, // 2026-09-22 market review
    tags: ["sets", "essentials", "cozy", "fall", "gift", "new"],
    sortOrder: 30,
    hygieneOnly: true,
    hookEn:
      "<p><strong>The gift basket, minus the cellophane.</strong> Everything soft, nothing to charge: fluffy fleece socks, a satin-feel sleep mask, a spa headband, a satin scrunchie and a reusable cleansing puff, all packed inside a caramel travel case she'll keep using long after the leaves are gone. No device, no learning curve, no wrong shade.</p>",
    hookFr:
      "<p><strong>Le panier-cadeau, sans le cellophane.</strong> Tout ce qui est doux, rien à recharger : des bas moelleux en molleton, un masque de nuit effet satin, un bandeau spa, un chouchou en satin et une houppette démaquillante réutilisable, le tout rangé dans un étui de voyage caramel qu'elle gardera bien après l'automne. Aucun appareil, aucun apprentissage, aucune teinte à deviner.</p>",
    routineEn: [
      "Headband on, hair up with the scrunchie.",
      "Cleanse with the reusable puff, then apply whatever your skin likes.",
      "Fleece socks on, phone down.",
      "Sleep mask on for a proper dark room.",
    ],
    routineFr: [
      "Bandeau en place, cheveux attachés avec le chouchou.",
      "Nettoyez avec la houppette réutilisable, puis appliquez vos produits habituels.",
      "Bas en molleton enfilés, téléphone déposé.",
      "Masque de nuit sur les yeux, pour une vraie noirceur.",
    ],
    goodEn: [
      "Autumn colours picked by us: caramel case, coffee socks, beige headband, champagne scrunchie. The photos show each piece in its standard colour, so the shades you receive differ from the pictures.",
      "No electronics inside: nothing to charge, nothing to break, easy to mail as a gift.",
      "Satin-feel textiles are rayon, not silk. Hand-wash cold, dry flat.",
      "Fall limited edition: on sale until December 1, or while the colours last.",
      hygieneEn("socks, headband, scrunchie, sleep mask, cleansing puff"),
      PARCELS_EN,
    ],
    goodFr: [
      "Couleurs d'automne choisies par nous : étui caramel, bas café, bandeau beige, chouchou champagne. Les photos montrent chaque pièce dans sa couleur standard : les teintes reçues diffèrent donc des images.",
      "Aucun appareil électronique : rien à recharger, rien à briser, facile à offrir ou à poster.",
      "Les textiles effet satin sont en viscose, pas en soie. Lavage à la main à l'eau froide, séchage à plat.",
      "Édition limitée d'automne : en vente jusqu'au 1er décembre, ou jusqu'à épuisement des couleurs.",
      hygieneFr("bas, bandeau, chouchou, masque de nuit, houppette"),
      PARCELS_FR,
    ],
  },
  // -------------------------------------------------------------------------
  // Christmas 2026 (added 2026-09-25). Deactivate in /admin after Dec 20.
  // -------------------------------------------------------------------------
  {
    slug: "set-christmas-glow",
    nameEn: "The Christmas Glow Box",
    nameFr: "Le coffret Éclat de Noël",
    tagline: "The LED mask, wrapped for the tree. Christmas edition",
    taglineFr: "Le masque LED, emballé pour le sapin. Édition de Noël",
    priceCents: 8999,
    prevPriceCents: 8999,
    tags: ["sets", "glow", "christmas", "gift", "limited", "new"],
    sortOrder: 40,
    hookEn:
      "<p><strong>The gift that gets used every night in January.</strong> Our LED Red Light Mask, with the three things that turn ten minutes of light into a ritual: a satin-feel sleep mask for after, a spa headband to keep hair back, a satin scrunchie for the ponytail. One box, one parcel, nothing else to buy.</p>",
    hookFr:
      "<p><strong>Le cadeau qui sert tous les soirs de janvier.</strong> Notre Masque LED lumière rouge, avec les trois choses qui font de dix minutes de lumière un vrai rituel : un masque de nuit effet satin pour après, un bandeau spa pour retenir les cheveux, un chouchou en satin pour la queue de cheval. Une boîte, un colis, rien d'autre à acheter.</p>",
    routineEn: [
      "Headband on, hair up with the scrunchie.",
      "Cleanse, dry, fit the LED mask: 10 minutes, eyes closed.",
      "Serum and moisturizer as usual.",
      "Sleep mask on. That's the whole thing.",
    ],
    routineFr: [
      "Bandeau en place, cheveux attachés avec le chouchou.",
      "Nettoyez, séchez, ajustez le masque LED : 10 minutes, yeux fermés.",
      "Sérum et hydratant comme d'habitude.",
      "Masque de nuit sur les yeux. C'est tout.",
    ],
    goodEn: [
      XMAS_EN,
      COLOURS_EN,
      "The LED mask is a cosmetic at-home device, not a medical device. Not for use if you are pregnant, photosensitive, on light-sensitizing medication, or have an active skin condition. Ask your doctor if unsure.",
      hygieneEn("headband, scrunchie, sleep mask"),
      PARCELS_EN,
    ],
    goodFr: [
      XMAS_FR,
      COLOURS_FR,
      "Le masque LED est un appareil cosmétique à usage domestique, pas un dispositif médical. À éviter si vous êtes enceinte, photosensible, sous médication photosensibilisante, ou si vous avez une affection cutanée active. En cas de doute, consultez votre médecin.",
      hygieneFr("bandeau, chouchou, masque de nuit"),
      PARCELS_FR,
    ],
  },
  {
    slug: "set-cozy-night",
    nameEn: "The Cozy Night Box",
    nameFr: "La boîte Soirée douillette",
    tagline: "Everything soft, nothing to charge. Christmas edition",
    taglineFr: "Tout ce qui est doux, rien à recharger. Édition de Noël",
    priceCents: 7499,
    prevPriceCents: 7499,
    tags: ["sets", "essentials", "cozy", "christmas", "gift", "limited", "new"],
    sortOrder: 41,
    hygieneOnly: true,
    hookEn:
      "<p><strong>For the person who says they don't need anything.</strong> A facial ice roller for puffy mornings, a satin-feel sleep mask, fluffy fleece socks, a satin scrunchie and a reusable cleansing puff. No device, no learning curve, no wrong shade: it just makes the evening nicer.</p>",
    hookFr:
      "<p><strong>Pour celle qui dit qu'elle n'a besoin de rien.</strong> Un rouleau de glace pour les matins gonflés, un masque de nuit effet satin, des bas moelleux en molleton, un chouchou en satin et une houppette démaquillante réutilisable. Aucun appareil, aucun apprentissage, aucune teinte à deviner : ça rend juste la soirée plus douce.</p>",
    routineEn: [
      "Ice roller from the freezer, two minutes across cheeks and under the eyes.",
      "Cleanse with the reusable puff.",
      "Socks on, hair up with the scrunchie.",
      "Sleep mask on for a proper dark room.",
    ],
    routineFr: [
      "Rouleau de glace sorti du congélateur, deux minutes sur les joues et sous les yeux.",
      "Nettoyez avec la houppette réutilisable.",
      "Bas enfilés, cheveux attachés avec le chouchou.",
      "Masque de nuit sur les yeux, pour une vraie noirceur.",
    ],
    goodEn: [XMAS_EN, COLOURS_EN, "No electronics inside: nothing to charge, easy to mail as a gift.", hygieneEn("socks, scrunchie, sleep mask, cleansing puff"), PARCELS_EN],
    goodFr: [XMAS_FR, COLOURS_FR, "Aucun appareil électronique : rien à recharger, facile à poster en cadeau.", hygieneFr("bas, chouchou, masque de nuit, houppette"), PARCELS_FR],
  },
  {
    slug: "set-for-mom",
    nameEn: "For Mom",
    nameFr: "Pour maman",
    tagline: "The lift device she wouldn't buy herself. Christmas edition",
    taglineFr: "L'appareil lift qu'elle ne s'achèterait pas. Édition de Noël",
    priceCents: 12499,
    prevPriceCents: 12499,
    tags: ["sets", "sculpt", "christmas", "gift", "limited", "new"],
    sortOrder: 42,
    hookEn:
      "<p><strong>The one she'd never buy for herself.</strong> Our Microcurrent Facial Lift Device, with a facial ice roller for the mornings, a satin pillowcase for the nights, and a spa headband for both. Five minutes a day, at home, no appointment.</p>",
    hookFr:
      "<p><strong>Celui qu'elle ne s'achèterait jamais elle-même.</strong> Notre Appareil microcourant effet lift, avec un rouleau de glace pour les matins, une taie d'oreiller en satin pour les nuits, et un bandeau spa pour les deux. Cinq minutes par jour, à la maison, sans rendez-vous.</p>",
    routineEn: [
      "Morning: ice roller from the freezer, two minutes.",
      "Evening: headband on, conductive gel, five minutes of microcurrent along the jaw and cheekbones.",
      "Moisturize, then the satin pillowcase does the rest.",
    ],
    routineFr: [
      "Matin : rouleau de glace sorti du congélateur, deux minutes.",
      "Soir : bandeau en place, gel conducteur, cinq minutes de microcourant le long de la mâchoire et des pommettes.",
      "Hydratez, puis la taie en satin fait le reste.",
    ],
    goodEn: [
      XMAS_EN,
      COLOURS_EN,
      "Cosmetic at-home device, not a medical device. Do not use the microcurrent device if you are pregnant, have a pacemaker or implanted electronic device, epilepsy, metal implants in the face, or an active skin condition. Ask your doctor if unsure.",
      "The pillowcase is polyester satin, not silk.",
      hygieneEn("pillowcase, headband"),
      PARCELS_EN,
    ],
    goodFr: [
      XMAS_FR,
      COLOURS_FR,
      "Appareil cosmétique à usage domestique, pas un dispositif médical. Ne pas utiliser l'appareil microcourant si vous êtes enceinte, portez un stimulateur cardiaque ou un dispositif électronique implanté, souffrez d'épilepsie, avez des implants métalliques au visage ou une affection cutanée active. En cas de doute, consultez votre médecin.",
      "La taie est en satin de polyester, pas en soie.",
      hygieneFr("taie, bandeau"),
      PARCELS_FR,
    ],
  },
  {
    slug: "set-first-glow",
    nameEn: "First Glow Kit",
    nameFr: "Trousse Premier éclat",
    tagline: "A first real routine, for a teen or a student. Christmas edition",
    taglineFr: "Une première vraie routine, pour une ado ou une étudiante. Édition de Noël",
    priceCents: 7999,
    prevPriceCents: 7999,
    tags: ["sets", "essentials", "christmas", "gift", "limited", "new"],
    sortOrder: 43,
    hookEn:
      "<p><strong>Cleanse properly, sleep properly.</strong> A sonic silicone cleansing brush that's gentle enough for every day, a reusable cleansing puff, a satin-feel sleep mask, a spa headband and a satin scrunchie. Simple to use, hard to get wrong, nice enough to show friends.</p>",
    hookFr:
      "<p><strong>Bien nettoyer, bien dormir.</strong> Une brosse nettoyante sonique en silicone assez douce pour tous les jours, une houppette démaquillante réutilisable, un masque de nuit effet satin, un bandeau spa et un chouchou en satin. Simple à utiliser, difficile à rater, assez joli pour le montrer aux amies.</p>",
    routineEn: [
      "Headband on, hair up with the scrunchie.",
      "Wet face, a little cleanser, one minute with the sonic brush.",
      "Wipe with the reusable puff, rinse, moisturize.",
      "Sleep mask on.",
    ],
    routineFr: [
      "Bandeau en place, cheveux attachés avec le chouchou.",
      "Visage mouillé, un peu de nettoyant, une minute avec la brosse sonique.",
      "Essuyez avec la houppette réutilisable, rincez, hydratez.",
      "Masque de nuit sur les yeux.",
    ],
    goodEn: [XMAS_EN, COLOURS_EN, "The cleansing brush is a cosmetic at-home device, USB rechargeable, water-resistant for the sink (not for the shower).", hygieneEn("puff, headband, scrunchie, sleep mask"), PARCELS_EN],
    goodFr: [XMAS_FR, COLOURS_FR, "La brosse nettoyante est un appareil cosmétique à usage domestique, rechargeable par USB, résistante à l'eau pour le lavabo (pas pour la douche).", hygieneFr("houppette, bandeau, chouchou, masque de nuit"), PARCELS_FR],
  },
  {
    slug: "set-silky-hair",
    nameEn: "Silky Hair Box",
    nameFr: "Coffret Cheveux soyeux",
    tagline: "Satin for the pillow, a massager for wash day. Christmas edition",
    taglineFr: "Du satin pour l'oreiller, un masseur pour le jour du shampoing. Édition de Noël",
    priceCents: 6299,
    prevPriceCents: 6299,
    tags: ["sets", "hair", "christmas", "gift", "limited", "new"],
    sortOrder: 44,
    hookEn:
      "<p><strong>For hair that gets tangled, pulled and dried too hot.</strong> A satin pillowcase and a satin scrunchie for less friction, an electric scalp massager for wash day, and a spa headband to keep everything out of the way. The hair gift that isn't a hair tool.</p>",
    hookFr:
      "<p><strong>Pour les cheveux qui s'emmêlent, qu'on tire et qu'on sèche trop chaud.</strong> Une taie d'oreiller en satin et un chouchou en satin pour moins de friction, un masseur électrique pour le jour du shampoing, et un bandeau spa pour tout garder hors du chemin. Le cadeau cheveux qui n'est pas un fer.</p>",
    routineEn: [
      "Wash day: scalp massager with your shampoo, two minutes.",
      "Every night: hair up with the scrunchie, head on the satin pillowcase.",
      "Mask night: headband on.",
    ],
    routineFr: [
      "Jour du shampoing : masseur avec votre shampoing, deux minutes.",
      "Chaque soir : cheveux attachés avec le chouchou, tête sur la taie en satin.",
      "Soirée masque : bandeau en place.",
    ],
    goodEn: [XMAS_EN, COLOURS_EN, "The scalp massager is a cosmetic at-home device, USB rechargeable, waterproof for the shower. The pillowcase is polyester satin, not silk.", hygieneEn("pillowcase, scrunchie, headband"), PARCELS_EN],
    goodFr: [XMAS_FR, COLOURS_FR, "Le masseur est un appareil cosmétique à usage domestique, rechargeable par USB, étanche pour la douche. La taie est en satin de polyester, pas en soie.", hygieneFr("taie, chouchou, bandeau"), PARCELS_FR],
  },
];

const li = (xs: string[]) => xs.map((x) => `<li>${x}</li>`).join("");

/** Set contents before the 2026-09-21 add-ons (slug × qty). Used only to recognise untouched seed copy. */
const LEGACY_SET_CONTENTS: Record<string, [string, number][]> = {
  "set-full-ritual": [["led-red-light-mask", 1], ["microcurrent-facial-lift-device", 1], ["facial-ice-roller", 1], ["spa-headband", 1]],
  "set-7am-reset": [["facial-ice-roller", 1], ["under-eye-glow-wand", 1], ["spa-headband", 1]],
  "set-midnight-glow": [["sonic-silicone-cleansing-brush", 1], ["led-red-light-mask", 1], ["satin-sleep-mask", 1]],
  "set-sweater-weather": [["led-red-light-mask", 1], ["electric-scalp-massager", 1], ["satin-sleep-mask", 1], ["spa-headband", 1]],
  "set-pink-pop": [["under-eye-glow-wand", 1], ["sonic-silicone-cleansing-brush", 1], ["facial-ice-roller", 1], ["spa-headband", 1]],
  "set-carry-on-glow": [["under-eye-glow-wand", 1], ["satin-sleep-mask", 1], ["spa-headband", 1]],
  "set-bestie-duo": [["facial-ice-roller", 2], ["spa-headband", 2]],
};

function insideBlock(items: [string, number][], locale: "en" | "fr"): string {
  const fr = locale === "fr";
  const inside = items.map(([slug, qty]) => {
    const p = PRODUCTS.find((x) => x.slug === slug);
    const name = p ? (fr ? p.nameFr : p.nameEn) : slug;
    return `${qty} × <a href="/shop/${slug}">${name}</a>`;
  });
  return `<h3>${fr ? "Dans le coffret" : "What's inside"}</h3><ul>${li(inside)}</ul>`;
}

const currentInside = (slug: string, locale: "en" | "fr") =>
  insideBlock((SET_CONTENTS[slug] ?? []).map((c) => [c.slug, c.qty]), locale);

function applySwaps(html: string, s: SeedSet): string {
  let out = html;
  for (const [from, to] of s.swaps ?? []) if (out.includes(from)) out = out.replace(from, to);
  return out;
}

function setDescription(s: SeedSet, locale: "en" | "fr"): string {
  const fr = locale === "fr";
  const footer = s.hygieneOnly ? (fr ? FOOTER_HYGIENE_FR : FOOTER_HYGIENE_EN) : fr ? FOOTER_FR : FOOTER_EN;
  return applySwaps(
    [
      fr ? s.hookFr : s.hookEn,
      currentInside(s.slug, locale),
      `<h3>${fr ? "La routine" : "The routine"}</h3><ol>${li(fr ? s.routineFr : s.routineEn)}</ol>`,
      `<h3>${fr ? "Bon à savoir" : "Good to know"}</h3><ul>${li(fr ? s.goodFr : s.goodEn)}</ul>`,
      footer,
    ].join(""),
    s,
  );
}

/**
 * Bring an existing set description up to date without touching owner edits: only the
 * seed-generated "What's inside" block (if still verbatim), the old separate-parcels line,
 * and the targeted `swaps` are replaced.
 */
function refreshSetDescription(html: string, s: SeedSet, locale: "en" | "fr"): string {
  const fr = locale === "fr";
  let out = html;
  const legacy = insideBlock(LEGACY_SET_CONTENTS[s.slug] ?? [], locale);
  if (out.includes(legacy)) out = out.replace(legacy, currentInside(s.slug, locale));
  const [oldP, newP] = fr ? [LEGACY_PARCELS_FR, PARCELS_FR] : [LEGACY_PARCELS_EN, PARCELS_EN];
  out = out.replace(`<li>${oldP}</li>`, `<li>${newP}</li>`);
  return applySwaps(out, s);
}

/** Sum of component sale prices × qty (from this file's catalogue). */
function setCompareAt(slug: string): number {
  return (SET_CONTENTS[slug] ?? []).reduce((sum, c) => {
    const p = PRODUCTS.find((x) => x.slug === c.slug);
    if (!p) throw new Error(`Set ${slug}: unknown component ${c.slug}`);
    return sum + p.priceCents * c.qty;
  }, 0);
}

/** Owner-facing CJ recipe: each component, qty, variant + SKU. */
function setRecipe(slug: string): string {
  const parts = (SET_CONTENTS[slug] ?? []).map((c) => {
    const p = PRODUCTS.find((x) => x.slug === c.slug);
    return `${c.qty}× ${p?.nameEn ?? c.slug}: ${c.variant}`;
  });
  return `SET: place ONE CJ order with all items (Shipping From: China for every item) so it ships as one parcel, CJPacket JYSP Sensitive to CA. ${parts.join(" | ")}. Put the small items inside the pouch/organizer if the CJ agent agreed.`;
}
/** Recipes written by the previous seed start with this (never hand-written by the owner). */
const LEGACY_RECIPE_PREFIX = "SET: order each component on CJ";

const SET_HERO_BASE = "https://cmacbeauty.ca/sets";
const SET_HERO_VERSION = 2;
const isDerivedCloudinary = (u: string) => u.startsWith("https://res.cloudinary.com/") && u.includes("/cmac/products/");
/** True when a set's images were all generated by this seed (CJ photos, component Cloudinary photos, set mosaics). */
function onlyDerivedSetPhotos(images: unknown): boolean {
  return (
    Array.isArray(images) &&
    images.length > 0 &&
    images.every(
      (u) => typeof u === "string" && (CJ_HOST.test(u) || u.startsWith(SET_HERO_BASE + "/") || isDerivedCloudinary(u)),
    )
  );
}

/** True when every URL is a CJ CDN photo, i.e. untouched supplier images (admin never pasted its own). */
const CJ_HOST = /^https?:\/\/[^/]*(cjdropshipping\.com|aliyuncs\.com)\//i;
function onlySupplierPhotos(images: unknown): boolean {
  return Array.isArray(images) && images.length > 0 && images.every((u) => typeof u === "string" && CJ_HOST.test(u));
}
const isEmptyJsonArray = (v: unknown) => !Array.isArray(v) || v.length === 0;
/** Deep equality that ignores object key order (Postgres jsonb reorders keys). */
function sameJson(a: unknown, b: unknown): boolean {
  const norm = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(norm)
      : v && typeof v === "object"
        ? Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, norm((v as Record<string, unknown>)[k])]))
        : v;
  return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}

async function seedSets(reset: boolean) {
  for (const s of SETS) {
    const components = SET_CONTENTS[s.slug];
    if (!components?.length) throw new Error(`Set ${s.slug} has no contents`);

    // Real photos: first image of each component (contents order), then second images.
    const rows = await prisma.product.findMany({ where: { slug: { in: components.map((c) => c.slug) } } });
    const imgs = (slug: string) => {
      const r = rows.find((x) => x.slug === slug);
      return Array.isArray(r?.images) ? (r.images as string[]) : [];
    };
    // Hero = composed mosaic of the set's real product photos (public/sets/<slug>.jpg), then component photos.
    const hero = `${SET_HERO_BASE}/${s.slug}.jpg?v=${SET_HERO_VERSION}`;
    const images = [hero, ...components.map((c) => imgs(c.slug)[0]), ...components.map((c) => imgs(c.slug)[1])].filter(
      (u, i, a): u is string => Boolean(u) && a.indexOf(u) === i,
    );

    const copy = {
      nameEn: s.nameEn,
      nameFr: s.nameFr,
      tagline: s.tagline,
      taglineFr: s.taglineFr,
      descriptionEn: setDescription(s, "en"),
      descriptionFr: setDescription(s, "fr"),
    };
    const commerce = { priceCents: s.priceCents, compareAtCents: setCompareAt(s.slug), tags: s.tags };
    const supplier = { images, supplierUrl: null, supplierSku: "SET", shippingNote: setRecipe(s.slug) };

    const existing = await prisma.product.findUnique({ where: { slug: s.slug } });
    if (!existing) {
      await prisma.product.create({
        data: { slug: s.slug, active: true, sortOrder: s.sortOrder, options: [], ...copy, ...commerce, ...supplier },
      });
      console.log(`Set created: ${s.slug} (${images.length} images)`);
      continue;
    }
    const update: Prisma.ProductUpdateInput = { sortOrder: s.sortOrder };
    const giftTags = addGiftTag(s.slug, existing.tags);
    if (giftTags) update.tags = giftTags;
    const notes: string[] = [];
    if (reset) Object.assign(update, copy, commerce, { options: [] });
    else {
      // New launch price (and compare-at) only while the owner hasn't changed the old price.
      if (
        existing.priceCents === s.prevPriceCents &&
        (existing.priceCents !== s.priceCents || existing.compareAtCents !== commerce.compareAtCents)
      ) {
        Object.assign(update, { priceCents: s.priceCents, compareAtCents: commerce.compareAtCents });
        notes.push("price");
      }
      const en = refreshSetDescription(existing.descriptionEn ?? "", s, "en");
      const fr = refreshSetDescription(existing.descriptionFr ?? "", s, "fr");
      if (existing.descriptionEn && en !== existing.descriptionEn) {
        update.descriptionEn = en;
        notes.push("copy EN");
      }
      if (existing.descriptionFr && fr !== existing.descriptionFr) {
        update.descriptionFr = fr;
        notes.push("copy FR");
      }
    }
    // Images derived from components: refresh while they are still untouched CJ photos.
    const oldImages = existing.images;
    if (
      (isEmptyJsonArray(oldImages) || onlySupplierPhotos(oldImages) || onlyDerivedSetPhotos(oldImages)) &&
      images.length &&
      JSON.stringify(oldImages) !== JSON.stringify(images)
    ) {
      update.images = images;
      notes.push("images");
    }
    const note = existing.shippingNote ?? "";
    if (!note || note.startsWith(LEGACY_RECIPE_PREFIX)) {
      update.shippingNote = supplier.shippingNote;
      notes.push("recipe");
    }
    await prisma.product.update({ where: { slug: s.slug }, data: update });
    console.log(`Set ready: ${s.slug}${notes.length ? ` (${notes.join(", ")})` : ""}`);
  }
}

async function main() {
  // Seasonal promotion codes (BF20, BOXING25, …) exist in Stripe before their campaign starts.
  try {
    const codes = await ensureSeasonalCodes();
    console.log(`Seasonal codes: created [${codes.created.join(", ")}] existing [${codes.existing.join(", ")}]${codes.skipped ? " (" + codes.skipped + ")" : ""}`);
  } catch (err) {
    console.error("Seasonal codes failed (continuing):", err);
  }
  const reset = process.env.RESET_PRODUCTS === "1";
  for (const p of PRODUCTS) {
    const media = MEDIA[p.slug];
    const copy = {
      nameEn: p.nameEn,
      nameFr: p.nameFr,
      tagline: p.tagline,
      taglineFr: p.taglineFr,
      descriptionEn: p.descriptionEn,
      descriptionFr: p.descriptionFr,
    };
    const commerce = { priceCents: p.priceCents, compareAtCents: p.compareAtCents, tags: p.tags };
    const supplier = {
      images: media?.images.length ? media.images : p.images,
      options: p.options as unknown as Prisma.InputJsonValue,
      supplierUrl: p.supplierUrl,
      supplierSku: p.supplierSku,
      shippingNote: p.shippingNote,
    };
    const videos = (media?.videos ?? []) as unknown as Prisma.InputJsonValue;

    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({
        data: { slug: p.slug, active: p.active ?? true, sortOrder: p.sortOrder, ...copy, ...commerce, ...supplier, videos },
      });
      console.log(`Product created: ${p.slug}`);
      continue;
    }

    const update: Prisma.ProductUpdateInput = { sortOrder: p.sortOrder };
    const notes: string[] = [];
    const giftTags = addGiftTag(p.slug, existing.tags);
    if (giftTags) {
      update.tags = giftTags;
      notes.push("gift tag");
    }
    const review = PRICE_REVIEW.find(([slug, from]) => slug === p.slug && existing.priceCents === from);
    if (review) {
      update.priceCents = review[2];
      notes.push(`price ${review[1] / 100} → ${review[2] / 100} (market review)`);
    }
    if (INVENTED_COMPARE_AT[p.slug] != null && existing.compareAtCents === INVENTED_COMPARE_AT[p.slug]) {
      update.compareAtCents = null;
      notes.push("invented compare-at price removed");
    }
    if (reset) Object.assign(update, copy, commerce, { options: supplier.options });
    const hasImages = Array.isArray(existing.images) && existing.images.length > 0;
    if (!hasImages) {
      // Never edited with real photos in /admin → safe to fill supplier data.
      Object.assign(update, supplier);
      if (p.refreshCopyWhenEmpty) Object.assign(update, copy);
      if (p.active === false) update.active = false;
      notes.push("supplier data filled");
    } else if (media?.images.length && onlySupplierPhotos(existing.images)) {
      // Still the raw CJ photos the seed put there → swap in the processed Cloudinary set.
      update.images = media.images;
      notes.push("images → Cloudinary");
    }
    if (!reset && hasImages && p.legacyOptions && sameJson(existing.options, p.legacyOptions)) {
      update.options = supplier.options;
      notes.push("option labels");
    }
    if (media?.videos.length && isEmptyJsonArray(existing.videos)) {
      update.videos = videos;
      notes.push("videos");
    }
    await prisma.product.update({ where: { slug: p.slug }, data: update });
    console.log(`Product ready: ${p.slug}${notes.length ? ` (${notes.join(", ")})` : ""}`);
  }

  await seedSets(reset);

  // Admin user — from ADMIN_EMAIL / ADMIN_PASSWORD env vars (skipped if unset).
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN", passwordHash },
      create: { email: adminEmail, name: "CMAC Beauty Admin", role: "ADMIN", passwordHash },
    });
    console.log(`Admin user ready: ${adminEmail}`);
  } else {
    console.log("No ADMIN_EMAIL / ADMIN_PASSWORD set — skipped admin user.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

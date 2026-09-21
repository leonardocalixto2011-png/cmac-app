/**
 * Seed — CMAC Beauty.
 *
 * Catalogue sourced on CJdropshipping (research:
 * ../OneDrive/Claude projets/cmac-store/research/cj-catalog-2026-09-21.json).
 * Every item ships China → Canada by CJPacket JYSP Sensitive (1–3 days
 * processing, 7–15 days transit). Prices are CAD, chosen per the pricing rule
 * (≈2.6–3.2× landed CAD) except where the owner fixed them.
 *
 * COPY RULE (Health Canada): cosmetic / appearance-only. Never "treats",
 * "heals", "cures", "stimulates collagen", "reduces inflammation", "pain
 * relief", "clinically proven", "therapy", "slimming", or any disease word. No
 * specs that the CJ listing doesn't state. Electric devices keep the "Cosmetic
 * at-home device, not a medical device" line + contraindications.
 *
 * Idempotent, admin edits win:
 *  - New slug → created with everything below.
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

const prisma = new PrismaClient();

const FOOTER_EN = "<p><em>12-month defect coverage. 30-day returns on unused items.</em></p>";
const FOOTER_FR = "<p><em>Garantie de 12 mois contre les défauts. Retours sous 30 jours pour les articles inutilisés.</em></p>";
const FOOTER_HYGIENE_EN = "<p><em>30-day returns on unopened items.</em></p>";
const FOOTER_HYGIENE_FR = "<p><em>Retours sous 30 jours pour les articles non ouverts.</em></p>";

const OSS = "https://oss-cf.cjdropshipping.com/product";
const CF = "https://cf.cjdropshipping.com";
const CJ = "https://cjdropshipping.com/product";

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
};

const colour = (values: OptionValue[]): Option => ({ nameEn: "Colour", nameFr: "Couleur", values });

const PRODUCTS: SeedProduct[] = [
  // ---------------------------------------------------------------- GLOW
  {
    slug: "led-red-light-mask",
    nameEn: "LED Red Light Mask",
    nameFr: "Masque LED lumière rouge",
    tagline: "Hands-free glow, 10 minutes a night",
    taglineFr: "Un éclat mains libres, 10 minutes par soir",
    priceCents: 5999,
    compareAtCents: 8999,
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
    priceCents: 3499,
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
    priceCents: 2999,
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
    priceCents: 1699,
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
    priceCents: 3199,
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
];

async function main() {
  const reset = process.env.RESET_PRODUCTS === "1";
  for (const p of PRODUCTS) {
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
      images: p.images,
      options: p.options as unknown as Prisma.InputJsonValue,
      supplierUrl: p.supplierUrl,
      supplierSku: p.supplierSku,
      shippingNote: p.shippingNote,
    };

    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({
        data: { slug: p.slug, active: p.active ?? true, sortOrder: p.sortOrder, ...copy, ...commerce, ...supplier },
      });
      console.log(`Product created: ${p.slug}`);
      continue;
    }

    const update: Prisma.ProductUpdateInput = { sortOrder: p.sortOrder };
    if (reset) Object.assign(update, copy, commerce, { options: supplier.options });
    const hasImages = Array.isArray(existing.images) && existing.images.length > 0;
    if (!hasImages) {
      // Never edited with real photos in /admin → safe to fill supplier data.
      Object.assign(update, supplier);
      if (p.refreshCopyWhenEmpty) Object.assign(update, copy);
      if (p.active === false) update.active = false;
    }
    await prisma.product.update({ where: { slug: p.slug }, data: update });
    console.log(`Product ready: ${p.slug}${hasImages ? "" : " (supplier data filled)"}`);
  }

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

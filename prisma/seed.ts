/**
 * Seed — CMAC Beauty.
 *
 * The 4 launch products (copy from cmac-store/content/products.json, FR
 * translated here), prices chosen by the owner, and the admin user from
 * ADMIN_EMAIL / ADMIN_PASSWORD.
 *
 * PLACEHOLDERS (flagged in CLAUDE.md):
 *  - images: [] → ProductArt renders a branded placeholder until supplier
 *    photo URLs are pasted in /admin/products.
 *  - Ice roller colours "Pink / White / Sage" are placeholders — real colour
 *    names + SKUs come from the CJdropshipping listing.
 *  - supplierUrl / supplierSku are empty until the CJ listing is chosen.
 *
 * COPY RULE: cosmetic / appearance-only. Never "treats", "heals", "stimulates
 * collagen", "reduces inflammation", "clinically proven".
 *
 * Idempotent: upserts by slug; only sets prices/copy on create so admin edits
 * survive a re-run (pass RESET_PRODUCTS=1 to overwrite everything).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const FOOTER_EN = "<p><em>12-month defect coverage. 30-day returns on unused items.</em></p>";
const FOOTER_FR = "<p><em>Garantie de 12 mois contre les défauts. Retours sous 30 jours pour les articles inutilisés.</em></p>";

const PRODUCTS = [
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
  },
  {
    slug: "electronic-gua-sha-massager",
    nameEn: "Electronic Gua Sha Massager",
    nameFr: "Gua sha électronique",
    tagline: "Sculpt and de-puff in four minutes",
    taglineFr: "Sculpter et dégonfler en quatre minutes",
    priceCents: 3999,
    compareAtCents: null,
    tags: ["sculpt", "gua-sha", "massage"],
    sortOrder: 1,
    descriptionEn: `<p><strong>The classic gua sha stroke, with a gentle vibration that does the work for you.</strong> Sweep upward along the jaw, cheekbones and brow for a smoother, more sculpted look and a spa-style massage where you hold tension.</p><h3>How to use</h3><ol><li>Apply a thin layer of oil or serum so the head glides.</li><li>Sweep from the centre of the face outward and upward, 5 to 8 strokes per zone.</li><li>Finish under the jaw toward the ears, then down the sides of the neck.</li></ol><p>Four minutes, three times a week, is plenty.</p><h3>Good to know</h3><ul><li>Cosmetic at-home device, not a medical device.</li><li>Do not use on broken skin, active acne or over injectables within two weeks of treatment.</li><li>Wipe the head clean after each use.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>Le geste classique du gua sha, avec une vibration douce qui fait le travail à votre place.</strong> Passez vers le haut le long de la mâchoire, des pommettes et des sourcils pour un air plus lisse, plus sculpté, et un massage façon spa là où vous accumulez la tension.</p><h3>Mode d'emploi</h3><ol><li>Appliquez une fine couche d'huile ou de sérum pour que la tête glisse bien.</li><li>Passez du centre du visage vers l'extérieur et vers le haut, 5 à 8 passages par zone.</li><li>Terminez sous la mâchoire vers les oreilles, puis le long du cou.</li></ol><p>Quatre minutes, trois fois par semaine, c'est amplement suffisant.</p><h3>Bon à savoir</h3><ul><li>Appareil cosmétique à usage domestique, pas un dispositif médical.</li><li>Ne pas utiliser sur une peau lésée, sur de l'acné active ou sur des zones ayant reçu des injectables dans les deux dernières semaines.</li><li>Essuyez la tête après chaque utilisation.</li></ul>${FOOTER_FR}`,
    options: [],
  },
  {
    slug: "microcurrent-facial-lift-device",
    nameEn: "Microcurrent Facial Lift Device",
    nameFr: "Appareil microcourant effet lift",
    tagline: "The lift step of the ritual",
    taglineFr: "L'étape « lift » du rituel",
    priceCents: 8999,
    compareAtCents: null,
    tags: ["sculpt", "microcurrent", "lift"],
    sortOrder: 2,
    descriptionEn: `<p><strong>Guided upward motion for a more lifted, defined look.</strong> This is the device people mean when they say "at-home facial." Used with a conductive gel, it glides over the cheekbone, jawline and brow in slow, upward passes.</p><h3>How to use</h3><ol><li>Apply a generous layer of water-based conductive gel. Skin must stay wet for the current to conduct.</li><li>Glide upward and outward, holding for a few seconds at the top of each pass.</li><li>Rinse off the gel, then moisturize.</li></ol><p>Five minutes, three to five times a week. Results build with consistency.</p><h3>Good to know</h3><ul><li>Cosmetic at-home device, not a medical device.</li><li>Do not use if you are pregnant, have a pacemaker or implanted electronic device, epilepsy, metal implants in the face, or active skin conditions. Ask your doctor if unsure.</li><li>Always use with conductive gel. Do not use over the thyroid or the eyes.</li></ul>${FOOTER_EN}`,
    descriptionFr: `<p><strong>Un mouvement guidé vers le haut pour un air plus lifté, plus défini.</strong> C'est l'appareil auquel les gens pensent quand ils parlent de « soin du visage à la maison ». Utilisé avec un gel conducteur, il glisse sur les pommettes, la mâchoire et les sourcils en passages lents, vers le haut.</p><h3>Mode d'emploi</h3><ol><li>Appliquez une couche généreuse de gel conducteur à base d'eau. La peau doit rester humide pour que le courant passe.</li><li>Glissez vers le haut et vers l'extérieur, en maintenant quelques secondes au sommet de chaque passage.</li><li>Rincez le gel, puis hydratez.</li></ol><p>Cinq minutes, trois à cinq fois par semaine. Les résultats visibles viennent avec la régularité.</p><h3>Bon à savoir</h3><ul><li>Appareil cosmétique à usage domestique, pas un dispositif médical.</li><li>Ne pas utiliser si vous êtes enceinte, portez un stimulateur cardiaque ou un dispositif électronique implanté, souffrez d'épilepsie, avez des implants métalliques au visage ou une affection cutanée active. En cas de doute, consultez votre médecin.</li><li>Toujours utiliser avec un gel conducteur. Ne pas passer sur la thyroïde ni sur les yeux.</li></ul>${FOOTER_FR}`,
    options: [],
  },
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
    descriptionEn: `<p><strong>Keep it in the freezer. Use it before coffee.</strong> A cold roll from the centre of the face outward reduces the look of morning puffiness, tightens the appearance of pores, and makes makeup sit better. It's the cheapest, fastest step in the ritual and the one people use most.</p><h3>How to use</h3><ol><li>Store in the freezer or fridge.</li><li>Roll from the nose outward across cheeks, then under the eyes, then along the jaw. About 60 seconds.</li><li>Also great after sun, after a long day, or over a sheet mask.</li></ol><h3>Good to know</h3><ul><li>Hygiene item: returns accepted only if unopened.</li><li>Do not press hard on the under-eye area. Let the cold do the work.</li><li>Wash the head with mild soap and dry before refreezing.</li></ul><p><em>30-day returns on unopened items.</em></p>`,
    descriptionFr: `<p><strong>Gardez-le au congélateur. Utilisez-le avant le café.</strong> Un passage froid du centre du visage vers l'extérieur atténue l'apparence des poches du matin, resserre l'apparence des pores et aide le maquillage à mieux tenir. C'est l'étape la moins chère et la plus rapide du rituel, et celle que les gens utilisent le plus.</p><h3>Mode d'emploi</h3><ol><li>Rangez-le au congélateur ou au réfrigérateur.</li><li>Roulez du nez vers l'extérieur sur les joues, puis sous les yeux, puis le long de la mâchoire. Environ 60 secondes.</li><li>Aussi parfait après le soleil, après une longue journée ou par-dessus un masque en tissu.</li></ol><h3>Bon à savoir</h3><ul><li>Article d'hygiène : retours acceptés seulement s'il est non ouvert.</li><li>N'appuyez pas fort sous les yeux. Laissez le froid faire le travail.</li><li>Lavez la tête avec un savon doux et séchez-la avant de la remettre au congélateur.</li></ul><p><em>Retours sous 30 jours pour les articles non ouverts.</em></p>`,
    // PLACEHOLDER colours — replace with the real CJ variant names.
    options: [
      {
        nameEn: "Colour",
        nameFr: "Couleur",
        values: [
          { value: "pink", labelEn: "Pink", labelFr: "Rose" },
          { value: "white", labelEn: "White", labelFr: "Blanc" },
          { value: "sage", labelEn: "Sage", labelFr: "Sauge" },
        ],
      },
    ],
  },
];

async function main() {
  const reset = process.env.RESET_PRODUCTS === "1";
  for (const p of PRODUCTS) {
    const data = {
      nameEn: p.nameEn,
      nameFr: p.nameFr,
      tagline: p.tagline,
      taglineFr: p.taglineFr,
      descriptionEn: p.descriptionEn,
      descriptionFr: p.descriptionFr,
      priceCents: p.priceCents,
      compareAtCents: p.compareAtCents,
      tags: p.tags,
      options: p.options,
      sortOrder: p.sortOrder,
    };
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: reset ? data : { sortOrder: p.sortOrder },
      create: { slug: p.slug, images: [], active: true, ...data },
    });
    console.log(`Product ready: ${p.slug}`);
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

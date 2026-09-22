/**
 * Customer + owner email templates for CMAC Beauty (EN + Québec FR).
 * Pure render functions: data in → { subject, preheader, html, text } out.
 * No DB or network here — `email.ts` / `marketing.ts` resolve the data and
 * send; `scripts/render-email-previews.ts` renders samples.
 *
 * Voice: warm, intimate, never salesy; signed by the CMAC team. Health Canada:
 * appearance-only wording. Delivery promises come from SHIPPING (brand.ts).
 */
import type { Locale } from "@/i18n/messages";
import { BRAND, POLICY, SHIPPING, siteUrl } from "./brand";
import { formatMoneyFromCents, formatWholeDollars } from "./utils";
import { fmtDate } from "./fmt";
import { POINTS_PER_REWARD, REWARD_VALUE_CENTS, TIERS, type TierId } from "./loyalty-rules";
import {
  C,
  SANS,
  SERIF,
  button,
  emailImage,
  esc,
  eyebrow,
  firstNameOf,
  h1,
  h2,
  kv,
  layout,
  panel,
  para,
  rule,
  signOff,
  spacer,
  ticket,
  transactionalFooter,
  utm,
  type Block,
} from "./email-kit";

export type RenderedEmail = { subject: string; preheader: string; html: string; text: string };

const fr = (l: Locale) => l === "fr";
export const shortRef = (reference: string) => reference.slice(-8).toUpperCase();
const money = (cents: number, l: Locale) => formatMoneyFromCents(cents, l);
/** Keeps hyphenated first names (Marie-Ève) on one line: word joiner after each hyphen. */
const NB = (s: string) => s.replace(/-/g, "-⁠");
const TIER_LABEL: Record<TierId, string> = { glow: "Glow", radiance: "Radiance", icon: "Icon" };

// ---------------------------------------------------------------------------
// Data shapes
// ---------------------------------------------------------------------------

export type ComponentView = { slug: string; name: string; qty: number; image: string | null };

export type ItemView = {
  slug: string;
  /** Localised product name. */
  name: string;
  /** Localised option labels (e.g. colour). */
  options: string[];
  qty: number;
  unitCents: number;
  image: string | null;
  /** Set contents (empty for single products). */
  components: ComponentView[];
};

export type LoyaltyView =
  | { kind: "member"; earned: number; balance: number; tier: TierId }
  | { kind: "guest"; points: number }
  | null;

export type OrderView = {
  locale: Locale;
  reference: string;
  placedAt: Date;
  name: string | null;
  email: string;
  items: ItemView[];
  subtotalCents: number;
  discountCents: number;
  promoCode: string | null;
  shippingCents: number;
  totalCents: number;
  /** Name + street lines (no phone). */
  address: string[];
  loyalty: LoyaltyView;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
};

export type CardProduct = { slug: string; name: string; priceCents: number; compareAtCents: number | null; image: string | null; isSet: boolean };

// ---------------------------------------------------------------------------
// "While you wait" — one practical, appearance-only tip per product
// ---------------------------------------------------------------------------

type Tip = { en: string; fr: string };

const SATIN: Tip = {
  en: "Hand-wash cold with a drop of gentle soap and lay flat to dry — it keeps that soft sheen.",
  fr: "Lavez à la main à l'eau froide avec un soupçon de savon doux et laissez sécher à plat : le lustre reste intact.",
};
const GEL: Tip = {
  en: "Keep a water-based gel nearby — the device glides best on a generous, even layer.",
  fr: "Gardez un gel à base d'eau à portée de main : l'appareil glisse mieux sur une couche généreuse et uniforme.",
};

export const TIPS: Record<string, Tip> = {
  "facial-ice-roller": {
    en: "Pop it in the freezer the night before your first ritual — you'll wake up to a perfectly cool glide.",
    fr: "Glissez-le au congélateur la veille de votre premier rituel : vous vous réveillerez avec une glisse parfaitement fraîche.",
  },
  "led-red-light-mask": {
    en: "Charge it fully before the first session, then start on a clean, dry face.",
    fr: "Chargez-le complètement avant la première séance, puis commencez sur un visage propre et sec.",
  },
  "microcurrent-facial-lift-device": GEL,
  "ems-sculpting-v-roller": GEL,
  "sonic-silicone-cleansing-brush": {
    en: "Charge it overnight so your very first cleanse is a full-power one.",
    fr: "Chargez-la pendant la nuit pour que votre tout premier nettoyage se fasse à pleine puissance.",
  },
  "under-eye-glow-wand": {
    en: "Give it a full charge and pair it with your usual eye cream for an easy, gentle glide.",
    fr: "Donnez-lui une pleine charge et associez-la à votre crème contour des yeux habituelle pour une glisse tout en douceur.",
  },
  "electric-scalp-massager": {
    en: "Charge it before the first use — it's loveliest on dry hair, at the very end of a long day.",
    fr: "Chargez-le avant la première utilisation : il est à son meilleur sur cheveux secs, à la toute fin d'une longue journée.",
  },
  "electric-makeup-brush-cleaner": {
    en: "Charge it and gather your brushes; after the first spin, let them dry bristles-down.",
    fr: "Chargez-le et rassemblez vos pinceaux ; après le premier essorage, laissez-les sécher poils vers le bas.",
  },
  "satin-sleep-mask": SATIN,
  "satin-beauty-sleep-set": SATIN,
  "satin-scrunchie": SATIN,
  "spa-headband": {
    en: "Keep it by the sink — slipping it on becomes the first gesture of your ritual.",
    fr: "Gardez-le près du lavabo : l'enfiler deviendra le premier geste de votre rituel.",
  },
  "pink-shell-makeup-pouch": {
    en: "Decide now what lives inside — your ritual, packed and ready for the next weekend away.",
    fr: "Décidez dès maintenant de ce qui y vivra : votre rituel, prêt pour la prochaine escapade.",
  },
  "travel-makeup-organizer": {
    en: "Decide now what lives inside — your ritual, packed and ready for the next trip.",
    fr: "Décidez dès maintenant de ce qui y vivra : votre rituel, prêt pour le prochain voyage.",
  },
  "cozy-fleece-socks": {
    en: "Wash them inside out on cold to keep them fluffy, wear after wear.",
    fr: "Lavez-les à l'envers à l'eau froide pour qu'ils restent moelleux, port après port.",
  },
  "reusable-cleansing-puff": {
    en: "Rinse it after each use and let it air-dry — it's made to be used again and again.",
    fr: "Rincez-la après chaque usage et laissez-la sécher à l'air : elle est faite pour servir encore et encore.",
  },
};

const FALLBACK_TIP: Tip = {
  en: "Unbox it somewhere calm and read the little guide first — ten quiet minutes is all a ritual needs.",
  fr: "Déballez-le dans un coin calme et lisez d'abord le petit guide : dix minutes tranquilles suffisent à un rituel.",
};

/** Tips for an order: sets expand to their components, identical tips appear once. Max 5. */
export function tipsFor(items: ItemView[], locale: Locale): { name: string; tip: string }[] {
  const out: { name: string; tip: string }[] = [];
  const seen = new Set<string>();
  const add = (slug: string, name: string) => {
    const t = TIPS[slug] ?? FALLBACK_TIP;
    const text = fr(locale) ? t.fr : t.en;
    if (seen.has(text)) return;
    seen.add(text);
    out.push({ name, tip: text });
  };
  for (const i of items) {
    if (i.components.length) i.components.forEach((c) => add(c.slug, c.name));
    else add(i.slug, i.name);
  }
  return out.slice(0, 5);
}

// ---------------------------------------------------------------------------
// Shared order blocks
// ---------------------------------------------------------------------------

function thumb(url: string | null, alt: string, w: number, h: number, cls = ""): string {
  const src = emailImage(url, w * 2, h * 2);
  if (!src) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td ${cls ? `class="${cls}"` : ""} width="${w}" height="${h}" bgcolor="${C.blush}" align="center" style="width:${w}px;height:${h}px;background:${C.blush};border-radius:12px;font-family:${SERIF};font-size:11px;letter-spacing:0.12em;color:${C.terra};">CMAC</td></tr></table>`;
  }
  return `<img ${cls ? `class="${cls}"` : ""} src="${esc(src)}" width="${w}" height="${h}" alt="${esc(alt)}" style="display:block;width:${w}px;height:${h}px;border-radius:12px;background:${C.cream};object-fit:cover;">`;
}

function itemsBlock(items: ItemView[], locale: Locale, opts: { prices: boolean }): Block {
  const L = fr(locale)
    ? { qty: "Qté", inside: "Dans votre ensemble" }
    : { qty: "Qty", inside: "Inside your set" };
  const rows = items
    .map((i, idx) => {
      const meta = [...i.options, `${L.qty} ${i.qty}`].map(esc).join(" &nbsp;·&nbsp; ");
      const itemRow = `<tr>
<td width="72" valign="top" style="padding:${idx ? "20px" : "0"} 16px 0 0;width:72px;">${thumb(i.image, i.name, 72, 90, "thumb")}</td>
<td valign="top" style="padding:${idx ? "20px" : "0"} 0 0;">
  <p style="margin:2px 0 6px;font-family:${SERIF};font-size:17px;line-height:1.3;color:${C.ink};">${esc(i.name)}</p>
  <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.5;color:${C.faint};">${meta}</p>
</td>
${opts.prices ? `<td valign="top" align="right" style="padding:${idx ? "20px" : "0"} 0 0 12px;white-space:nowrap;font-family:${SANS};font-size:15px;line-height:1.5;color:${C.ink};"><span style="display:inline-block;padding-top:2px;">${esc(money(i.unitCents * i.qty, locale))}</span></td>` : ""}
</tr>`;
      if (!i.components.length) return itemRow;
      const comps = i.components
        .map(
          (c) => `<tr>
<td width="32" valign="middle" style="padding:6px 12px 6px 0;width:32px;">${thumb(c.image, c.name, 32, 40)}</td>
<td valign="middle" style="padding:6px 0;font-family:${SANS};font-size:13px;line-height:1.45;color:${C.soft};">${esc(c.name)}${c.qty > 1 ? ` <span style="color:${C.faint};">× ${c.qty}</span>` : ""}</td>
</tr>`,
        )
        .join("");
      return `${itemRow}
<tr><td colspan="${opts.prices ? 3 : 2}" style="padding:14px 0 0;">
${panel(`${eyebrow(L.inside, C.sage)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${comps}</table>`, { padding: "16px 18px 12px", radius: 14, margin: "0" })}
</td></tr>`;
    })
    .join("");
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
  const text = items
    .map((i) => {
      const head = `${i.qty} × ${i.name}${i.options.length ? ` (${i.options.join(", ")})` : ""}${opts.prices ? ` — ${money(i.unitCents * i.qty, locale)}` : ""}`;
      const inside = i.components.map((c) => `    · ${c.qty > 1 ? `${c.qty} × ` : ""}${c.name}`);
      return [head, ...(inside.length ? [`  ${L.inside}:`, ...inside] : [])].join("\n");
    })
    .join("\n");
  return { html, text };
}

function totalsBlock(o: OrderView): Block {
  const l = o.locale;
  const L = fr(l)
    ? { sub: "Sous-total", disc: "Rabais", code: "code", ship: "Livraison", free: "Offerte", total: "Total", cad: "CAD" }
    : { sub: "Subtotal", disc: "Discount", code: "code", ship: "Shipping", free: "Free", total: "Total", cad: "CAD" };
  const discLabel = o.promoCode ? `${L.disc} · ${o.promoCode}` : L.disc;
  const rows = [
    kv(L.sub, esc(money(o.subtotalCents, l))),
    o.discountCents > 0 ? kv(discLabel, `−${esc(money(o.discountCents, l))}`, { color: C.sage }) : "",
    kv(L.ship, o.shippingCents === 0 ? `<span style="color:${C.sage};">${esc(L.free)}</span>` : esc(money(o.shippingCents, l))),
  ].join("");
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
${rule("12px 0 10px")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${kv(L.total, `${esc(money(o.totalCents, l))} <span style="font-family:${SANS};font-size:11px;letter-spacing:0.1em;color:${C.faint};">${L.cad}</span>`, { strong: true })}</table>`;
  const text = [
    `${L.sub}: ${money(o.subtotalCents, l)}`,
    ...(o.discountCents > 0 ? [`${discLabel}: −${money(o.discountCents, l)}`] : []),
    `${L.ship}: ${o.shippingCents === 0 ? L.free : money(o.shippingCents, l)}`,
    `${L.total}: ${money(o.totalCents, l)} CAD`,
  ].join("\n");
  return { html, text };
}

function tipsBlock(items: ItemView[], locale: Locale, title: string, intro: string): Block {
  const tips = tipsFor(items, locale);
  if (!tips.length) return { html: "", text: "" };
  const rows = tips
    .map(
      (t, n) => `<tr>
<td width="34" valign="top" style="padding:0 12px 18px 0;width:34px;font-family:${SERIF};font-size:20px;line-height:1.2;font-style:italic;color:${C.terra};">${String(n + 1).padStart(2, "0")}</td>
<td valign="top" style="padding:0 0 18px;">
  <p style="margin:0 0 3px;font-family:${SANS};font-size:12px;line-height:1.5;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;color:${C.ink};">${esc(t.name)}</p>
  <p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.65;color:${C.soft};">${esc(t.tip)}</p>
</td></tr>`,
    )
    .join("");
  return {
    html: `${h2(title)}${para(esc(intro), { size: 14, margin: "0 0 20px" })}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`,
    text: [title.toUpperCase(), intro, ...tips.map((t, n) => `${n + 1}. ${t.name} — ${t.tip}`)].join("\n"),
  };
}

function hasMultipleParcels(items: ItemView[]): boolean {
  return items.some((i) => i.components.length > 1) || items.reduce((s, i) => s + i.qty, 0) > 1;
}

function shortDate(d: Date, l: Locale): string {
  return new Intl.DateTimeFormat(fr(l) ? "fr-CA" : "en-CA", { day: "numeric", month: "long", timeZone: BRAND.timeZone }).format(d);
}

function timelineBlock(o: OrderView): Block {
  const l = o.locale;
  const day = 24 * 60 * 60 * 1000;
  const from = shortDate(new Date(o.placedAt.getTime() + SHIPPING.totalWeeks.min * 7 * day), l);
  const to = shortDate(new Date(o.placedAt.getTime() + SHIPPING.totalWeeks.max * 7 * day), l);
  const P = SHIPPING.processingDays;
  const W = SHIPPING.totalWeeks;
  const steps = fr(l)
    ? [
        { t: "Confirmée", d: `Paiement reçu le ${fmtDate(o.placedAt, l)}.` },
        { t: "En préparation", d: `${P.min} à ${P.max} jours ouvrables, le temps de réunir chaque article.` },
        { t: "Expédiée", d: "Vous recevrez un courriel avec votre numéro de suivi." },
        { t: "Chez vous", d: `Généralement ${W.min} à ${W.max} semaines après la commande — vers le ${from} au ${to}.` },
      ]
    : [
        { t: "Confirmed", d: `Payment received on ${fmtDate(o.placedAt, l)}.` },
        { t: "Being prepared", d: `${P.min}–${P.max} business days while every piece is gathered.` },
        { t: "Shipped", d: "You'll get an email with your tracking number." },
        { t: "At your door", d: `Usually ${W.min}–${W.max} weeks after ordering — around ${from} to ${to}.` },
      ];
  const rows = steps
    .map((s, n) => {
      const done = n === 0;
      const last = n === steps.length - 1;
      const dot = done
        ? `<td width="28" height="28" align="center" bgcolor="${C.sage}" style="width:28px;height:28px;border-radius:14px;background:${C.sage};font-family:${SANS};font-size:13px;line-height:28px;font-weight:700;color:${C.cream};">&#10003;</td>`
        : `<td width="26" height="26" align="center" bgcolor="${C.paper}" style="width:26px;height:26px;border-radius:14px;background:${C.paper};border:1px solid ${C.terra};font-family:${SERIF};font-size:13px;line-height:26px;color:${C.terra};">${n + 1}</td>`;
      return `<tr>
<td width="28" valign="top" align="center" style="width:28px;padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr>${dot}</tr></table>
  ${last ? "" : `<div style="width:1px;height:40px;margin:4px auto 0;background:${C.line};font-size:1px;line-height:1px;">&nbsp;</div>`}
</td>
<td valign="top" style="padding:3px 0 ${last ? 0 : 14}px 16px;">
  <p style="margin:0 0 2px;font-family:${SERIF};font-size:16px;line-height:1.35;color:${done ? C.sage : C.ink};">${esc(s.t)}</p>
  <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.55;color:${C.faint};">${esc(s.d)}</p>
</td></tr>`;
    })
    .join("");
  const note = hasMultipleParcels(o.items)
    ? fr(l)
      ? "Plusieurs articles ou un ensemble ? Ils peuvent arriver dans des colis séparés, à quelques jours d'intervalle — c'est normal, et chacun est suivi."
      : "Several pieces or a set? They may arrive in separate parcels, a few days apart — that's normal, and each one is tracked."
    : "";
  const title = fr(l) ? "Les prochaines étapes" : "What happens next";
  return {
    html: `${h2(title)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>${note ? para(esc(note), { size: 13, color: C.soft, margin: "20px 0 0" }) : ""}`,
    text: [title.toUpperCase(), ...steps.map((s, n) => `${n === 0 ? "✓" : n + 1} ${s.t} — ${s.d}`), ...(note ? ["", note] : [])].join("\n"),
  };
}

function loyaltyBlock(o: OrderView): Block {
  const lo = o.loyalty;
  const l = o.locale;
  if (!lo) return { html: "", text: "" };
  const reward = formatWholeDollars(REWARD_VALUE_CENTS, l);
  if (lo.kind === "member") {
    const toNext = lo.balance >= 0 ? POINTS_PER_REWARD - (lo.balance % POINTS_PER_REWARD) : POINTS_PER_REWARD - lo.balance;
    const redeemable = lo.balance >= POINTS_PER_REWARD ? Math.floor(lo.balance / POINTS_PER_REWARD) : 0;
    const tier = TIER_LABEL[lo.tier];
    const head = fr(l) ? `+${lo.earned} points` : `+${lo.earned} points`;
    const line = fr(l)
      ? `Votre solde est maintenant de ${lo.balance} points · niveau ${tier}.`
      : `Your balance is now ${lo.balance} points · ${tier} tier.`;
    const next = redeemable
      ? fr(l)
        ? `Vous pouvez déjà échanger ${formatWholeDollars(redeemable * REWARD_VALUE_CENTS, l)} de récompenses depuis votre compte.`
        : `You can already redeem ${formatWholeDollars(redeemable * REWARD_VALUE_CENTS, l)} in rewards from your account.`
      : fr(l)
        ? `Plus que ${toNext} points avant votre prochaine récompense de ${reward}.`
        : `Just ${toNext} more points to your next ${reward} reward.`;
    const cta = fr(l) ? "Voir mon Glow Club" : "See my Glow Club";
    const url = utm("/account", "order-confirmation");
    return {
      html: panel(
        `${eyebrow("Glow Club", C.sage)}
<p style="margin:0 0 8px;font-family:${SERIF};font-size:30px;line-height:1.1;color:${C.ink};">${esc(head)}</p>
${para(`${esc(line)}<br>${esc(next)}`, { size: 14, margin: "0 0 18px" })}
${button(url, cta, { color: C.sage, width: 220 })}`,
        { bg: C.sageSoft, padding: "28px 28px" },
      ),
      text: ["GLOW CLUB", `${head} — ${line}`, next, url].join("\n"),
    };
  }
  if (lo.points <= 0) return { html: "", text: "" };
  const head = fr(l) ? `${lo.points} points vous attendent` : `${lo.points} points are waiting for you`;
  const body = fr(l)
    ? `Créez votre compte gratuit avec ${o.email} et ces points s'ajoutent automatiquement à votre solde. Ensuite : 100 points = ${reward} de rabais, et une petite attention pour votre anniversaire.`
    : `Create your free account with ${o.email} and these points are added to your balance automatically. After that: 100 points = ${reward} off, plus a little something on your birthday.`;
  const cta = fr(l) ? "Créer mon compte gratuit" : "Create my free account";
  const url = utm("/account/register", "order-confirmation");
  return {
    html: panel(
      `${eyebrow("Glow Club", C.sage)}
<p style="margin:0 0 10px;font-family:${SERIF};font-size:24px;line-height:1.2;color:${C.ink};">${esc(head)}</p>
${para(esc(body), { size: 14, margin: "0 0 18px" })}
${button(url, cta, { color: C.sage, width: 250 })}`,
      { bg: C.sageSoft, padding: "28px 28px" },
    ),
    text: ["GLOW CLUB", head, body, url].join("\n"),
  };
}

function addressBlock(o: OrderView): Block {
  if (!o.address.length) return { html: "", text: "" };
  const L = fr(o.locale) ? { to: "Livraison à", contact: "Confirmation envoyée à" } : { to: "Shipping to", contact: "Confirmation sent to" };
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;"><tr>
<td class="stack" width="55%" valign="top" style="padding:0 16px 0 0;">
  ${eyebrow(L.to)}
  <p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.7;color:${C.ink};">${o.address.map(esc).join("<br>")}</p>
</td>
<td class="stack" width="45%" valign="top" style="padding:0;">
  ${eyebrow(L.contact)}
  <p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.7;color:${C.ink};word-break:break-word;overflow-wrap:anywhere;">${esc(o.email)}</p>
</td></tr></table>`;
  return { html, text: [`${L.to.toUpperCase()}:`, ...o.address].join("\n") };
}

function greeting(name: string | null, l: Locale): string {
  const first = firstNameOf(name);
  return fr(l) ? (first ? `Bonjour ${first},` : "Bonjour,") : first ? `Hi ${first},` : "Hi there,";
}

function metaLine(label: string, ref: string, date: string): string {
  return `<p style="margin:0 0 26px;font-family:${SANS};font-size:12px;line-height:1.6;letter-spacing:0.12em;text-transform:uppercase;color:${C.faint};">${esc(label)} <span style="color:${C.ink};font-weight:600;">#${esc(ref)}</span> &nbsp;·&nbsp; ${esc(date)}</p>`;
}

// ---------------------------------------------------------------------------
// 1. Order confirmation
// ---------------------------------------------------------------------------

export function renderOrderConfirmation(o: OrderView): RenderedEmail {
  const l = o.locale;
  const ref = shortRef(o.reference);
  const first = firstNameOf(o.name);
  const T = fr(l)
    ? {
        subject: `Votre rituel CMAC est confirmé ✨ (commande n° ${ref})`,
        eyebrow: "Commande confirmée",
        hero: first ? `Votre rituel est en route, ${NB(first)}.` : "Votre rituel est en route.",
        preheader: `Merci ! Voici le récapitulatif de la commande n° ${ref} et les prochaines étapes, en toute transparence.`,
        order: "Commande",
        note: "Merci de confier votre rituel à une petite marque d'ici — ça nous touche sincèrement. Si quoi que ce soit vous semble flou en chemin, répondez simplement à ce courriel : il nous arrive directement.",
        summary: "Votre commande",
        waitTitle: "En attendant",
        waitIntro: "Quelques petits gestes pour que votre premier rituel soit parfait.",
        view: "Voir ma commande",
        returns: `Retours sous ${POLICY.returnDays} jours pour les articles inutilisés dans leur emballage d'origine · garantie de ${POLICY.warrantyMonths} mois contre les défauts de fabrication.`,
      }
    : {
        subject: `Your CMAC ritual is confirmed ✨ (Order #${ref})`,
        eyebrow: "Order confirmed",
        hero: first ? `Your ritual is on its way, ${NB(first)}.` : "Your ritual is on its way.",
        preheader: `Thank you! Here's your order #${ref} and exactly what happens next.`,
        order: "Order",
        note: "Thank you for trusting a small Québec brand with your ritual — it truly means a lot to us. If anything feels unclear along the way, simply reply to this email; it comes straight to our team.",
        summary: "Your order",
        waitTitle: "While you wait",
        waitIntro: "A few small things to make your first ritual feel just right.",
        view: "View my order",
        returns: `${POLICY.returnDays}-day returns on unused items in their original packaging · ${POLICY.warrantyMonths}-month warranty against manufacturing defects.`,
      };
  const items = itemsBlock(o.items, l, { prices: true });
  const totals = totalsBlock(o);
  const timeline = timelineBlock(o);
  const tips = tipsBlock(o.items, l, T.waitTitle, T.waitIntro);
  const loyalty = loyaltyBlock(o);
  const addr = addressBlock(o);
  const sig = signOff(l);
  const foot = transactionalFooter(l, "order-confirmation");
  const hello = greeting(o.name, l);

  const body = `
${eyebrow(T.eyebrow)}
${h1(T.hero)}
${metaLine(T.order, ref, fmtDate(o.placedAt, l))}
${para(`<span style="color:${C.ink};">${esc(hello)}</span>`, { margin: "0 0 8px" })}
${para(esc(T.note), { margin: "0 0 32px" })}
${panel(`${eyebrow(T.summary)}${spacer(6)}${items.html}${rule("22px 0 14px")}${totals.html}`, { bg: C.cream, padding: "26px 26px 22px" })}
${addr.html}
${rule("26px 0 30px")}
${timeline.html}
${rule("30px 0 30px")}
${tips.html}
${loyalty.html ? `${spacer(8)}${loyalty.html}` : ""}
${para(esc(T.returns), { size: 12, color: C.faint, margin: "8px 0 28px" })}
${sig.html}`;

  const html = layout({ locale: l, title: T.subject, preheader: T.preheader, body, footer: foot.html });
  const text = [
    T.hero,
    `${T.order} #${ref} · ${fmtDate(o.placedAt, l)}`,
    "",
    hello,
    T.note,
    "",
    T.summary.toUpperCase(),
    items.text,
    "",
    totals.text,
    "",
    addr.text,
    "",
    timeline.text,
    "",
    tips.text,
    ...(loyalty.text ? ["", loyalty.text] : []),
    "",
    T.returns,
    "",
    `${T.view}: ${siteUrl()}/account/orders`,
    "",
    sig.text,
    "",
    foot.text,
  ].join("\n");
  return { subject: T.subject, preheader: T.preheader, html, text };
}

// ---------------------------------------------------------------------------
// 2. Shipped / tracking
// ---------------------------------------------------------------------------

/** Carrier name guessed from the tracking link's host (display only). */
export function carrierFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host.includes("canadapost") || host.includes("postescanada")) return "Canada Post";
  if (host.includes("17track")) return "17TRACK";
  if (host.includes("cjpacket") || host.includes("cjdropshipping")) return "CJPacket";
  if (host.includes("ups.")) return "UPS";
  if (host.includes("fedex")) return "FedEx";
  if (host.includes("dhl")) return "DHL";
  if (host.includes("purolator")) return "Purolator";
  if (host.includes("usps")) return "USPS";
  return host.replace(/^www\./, "");
}

export function renderShipped(o: OrderView): RenderedEmail {
  const l = o.locale;
  const ref = shortRef(o.reference);
  const first = firstNameOf(o.name);
  const W = SHIPPING.deliveryWeeks;
  const carrier = carrierFromUrl(o.trackingUrl);
  const T = fr(l)
    ? {
        subject: `Votre rituel CMAC est expédié (commande n° ${ref})`,
        eyebrow: "Expédiée",
        hero: first ? `Il est en route, ${NB(first)}.` : "Il est en route.",
        preheader: `Votre colis a quitté l'entrepôt. Numéro de suivi à l'intérieur.`,
        order: "Commande",
        lead: `Bonne nouvelle : votre commande vient de quitter l'entrepôt de notre partenaire. Le transport prend généralement de ${W.min} à ${W.max} semaines ; le suivi peut mettre un jour ou deux avant d'afficher le premier scan.`,
        tracking: "Suivi du colis",
        carrier: "Transporteur",
        number: "Numéro de suivi",
        track: "Suivre mon colis",
        parcel: "Dans ce colis",
        separate: "Un ensemble ou plusieurs articles ? Les pièces peuvent arriver dans des colis séparés, à quelques jours d'intervalle. Si un article semble manquer, attendez quelques jours ou répondez à ce courriel — nous vérifions tout de suite.",
        careTitle: "À l'arrivée",
        careIntro: "Petit rappel pour bien commencer.",
      }
    : {
        subject: `Your CMAC ritual has shipped (Order #${ref})`,
        eyebrow: "Shipped",
        hero: first ? `It's on its way, ${NB(first)}.` : "It's on its way.",
        preheader: `Your parcel has left the warehouse. Tracking inside.`,
        order: "Order",
        lead: `Lovely news: your order just left our partner's warehouse. Transit usually takes ${W.min}–${W.max} weeks, and tracking can take a day or two to show its first scan.`,
        tracking: "Parcel tracking",
        carrier: "Carrier",
        number: "Tracking number",
        track: "Track your parcel",
        parcel: "In this parcel",
        separate: "Ordered a set or several pieces? They may arrive in separate parcels, a few days apart. If something seems missing, give it a few days or reply to this email — we'll check right away.",
        careTitle: "When it arrives",
        careIntro: "A gentle reminder to start on the right foot.",
      };
  const items = itemsBlock(o.items, l, { prices: false });
  const care = tipsBlock(o.items, l, T.careTitle, T.careIntro);
  const sig = signOff(l);
  const foot = transactionalFooter(l, "shipping-notice");
  const hello = greeting(o.name, l);
  const num = o.trackingNumber ?? "";
  const track = panel(
    `${eyebrow(T.tracking)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;"><tr>
${carrier ? `<td class="stack" valign="top" style="padding:0 16px 0 0;"><p style="margin:0 0 4px;font-family:${SANS};font-size:12px;color:${C.faint};">${esc(T.carrier)}</p><p style="margin:0;font-family:${SERIF};font-size:18px;color:${C.ink};">${esc(carrier)}</p></td>` : ""}
<td class="stack" valign="top"><p style="margin:0 0 4px;font-family:${SANS};font-size:12px;color:${C.faint};">${esc(T.number)}</p><p style="margin:0;font-family:'Courier New',Menlo,Consolas,monospace;font-size:18px;letter-spacing:0.06em;font-weight:700;color:${C.ink};word-break:break-all;">${esc(num)}</p></td>
</tr></table>
${o.trackingUrl ? button(o.trackingUrl, T.track, { color: C.terraDeep, width: 240 }) : ""}`,
    { bg: C.blush, padding: "28px 28px" },
  );
  const body = `
${eyebrow(T.eyebrow)}
${h1(T.hero)}
${metaLine(T.order, ref, fmtDate(new Date(), l))}
${para(`<span style="color:${C.ink};">${esc(hello)}</span>`, { margin: "0 0 8px" })}
${para(esc(T.lead), { margin: "0 0 28px" })}
${track}
${h2(T.parcel)}
${items.html}
${hasMultipleParcels(o.items) ? para(esc(T.separate), { size: 13, margin: "22px 0 0" }) : ""}
${rule("30px 0 30px")}
${care.html}
${spacer(4)}
${sig.html}`;
  const html = layout({ locale: l, title: T.subject, preheader: T.preheader, body, footer: foot.html });
  const text = [
    T.hero,
    `${T.order} #${ref}`,
    "",
    hello,
    T.lead,
    "",
    ...(carrier ? [`${T.carrier}: ${carrier}`] : []),
    `${T.number}: ${num}`,
    ...(o.trackingUrl ? [`${T.track}: ${o.trackingUrl}`] : []),
    "",
    T.parcel.toUpperCase(),
    items.text,
    ...(hasMultipleParcels(o.items) ? ["", T.separate] : []),
    "",
    care.text,
    "",
    sig.text,
    "",
    foot.text,
  ].join("\n");
  return { subject: T.subject, preheader: T.preheader, html, text };
}

// ---------------------------------------------------------------------------
// Marketing footer (CASL) + product cards
// ---------------------------------------------------------------------------

export type MarketingFooterInput = {
  locale: Locale;
  /** newsletter = subscriber (unsubscribe link); member = Glow Club birthday (profile link); confirm = opt-in request. */
  kind: "newsletter" | "member" | "confirm";
  /** BUSINESS_MAILING_ADDRESS (falls back to the service area when unset). */
  mailingAddress: string | null;
  unsubscribeUrl?: string;
};

const CASL = {
  en: {
    newsletter: "You're receiving this email because you subscribed to CMAC Beauty news at cmacbeauty.ca.",
    member: "You're receiving this email because you're a Glow Club member with a birthday saved in your CMAC Beauty account. Remove it from your profile to stop birthday emails.",
    confirm: "You're receiving this one-time email because this address was entered in a CMAC Beauty signup form. No confirmation, no newsletter.",
    unsubscribe: "Unsubscribe",
    unsubscribeText: "Unsubscribe in one click:",
    profile: "Manage my profile",
  },
  fr: {
    newsletter: "Vous recevez ce courriel parce que vous êtes abonné·e aux nouvelles de CMAC Beauty sur cmacbeauty.ca.",
    member: "Vous recevez ce courriel parce que vous êtes membre du Glow Club et que votre date d'anniversaire est enregistrée dans votre compte CMAC Beauty. Retirez-la de votre profil pour ne plus recevoir ce courriel.",
    confirm: "Vous recevez ce courriel unique parce que cette adresse a été saisie dans un formulaire d'inscription CMAC Beauty. Sans confirmation, aucune infolettre.",
    unsubscribe: "Se désabonner",
    unsubscribeText: "Désabonnement en un clic :",
    profile: "Gérer mon profil",
  },
} as const;

export function marketingFooter(i: MarketingFooterInput): Block {
  const f = CASL[i.locale];
  const address = i.mailingAddress ?? (fr(i.locale) ? BRAND.areaFr : BRAND.area);
  const reason = f[i.kind];
  const link =
    i.kind === "newsletter" && i.unsubscribeUrl
      ? { url: i.unsubscribeUrl, label: f.unsubscribe, text: f.unsubscribeText }
      : i.kind === "member"
        ? { url: `${siteUrl()}/account/profile`, label: f.profile, text: `${f.profile}:` }
        : null;
  const html = `${esc(reason)}<br><br>
<strong style="color:${C.soft};">${esc(BRAND.name)}</strong> · ${esc(address)} · <a href="mailto:${BRAND.email}" style="color:${C.terraDeep};text-decoration:none;">${BRAND.email}</a>
${link ? `<br><br><a href="${esc(link.url)}" style="color:${C.soft};text-decoration:underline;">${esc(link.label)}</a>` : ""}
<br><br><a href="${esc(utm("/shipping-returns", i.kind))}" style="color:${C.faint};text-decoration:underline;">${fr(i.locale) ? "Livraison et retours" : "Shipping & returns"}</a> &nbsp;·&nbsp; <a href="${esc(utm("/glow-club", i.kind))}" style="color:${C.faint};text-decoration:underline;">Glow Club</a>`;
  const text = ["—", reason, `${BRAND.name} · ${address} · ${BRAND.email}`, ...(link ? [`${link.text} ${link.url}`] : [])].join("\n");
  return { html, text };
}

/** Up to 3 product cards (stack on mobile). */
export function productCards(products: CardProduct[], locale: Locale, campaign: string, title: string): Block {
  if (!products.length) return { html: "", text: "" };
  const cols = products.slice(0, 3);
  const width = Math.floor(100 / cols.length);
  const setLabel = fr(locale) ? "Ensemble" : "Set";
  const cells = cols
    .map((p) => {
      const href = utm(`/shop/${p.slug}`, campaign, "newsletter");
      const img = emailImage(p.image, 360, 450);
      const price =
        p.compareAtCents && p.compareAtCents > p.priceCents
          ? `${esc(money(p.priceCents, locale))} <span style="color:${C.faint};text-decoration:line-through;font-weight:400;">${esc(money(p.compareAtCents, locale))}</span>`
          : esc(money(p.priceCents, locale));
      return `<td class="stack" width="${width}%" valign="top" style="padding:0 8px;">
<a href="${esc(href)}" style="text-decoration:none;color:${C.ink};display:block;">
${img ? `<img src="${esc(img)}" width="170" alt="${esc(p.name)}" style="display:block;width:100%;max-width:100%;height:auto;border-radius:16px;background:${C.paper};border:1px solid ${C.line};">` : ""}
${p.isSet ? `<p style="margin:12px 0 0;font-family:${SANS};font-size:10px;line-height:15px;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;color:${C.terra};">${setLabel}</p>` : `<p style="margin:12px 0 0;font-size:10px;line-height:15px;">&nbsp;</p>`}
<p style="margin:4px 0 4px;font-family:${SERIF};font-size:16px;line-height:1.3;color:${C.ink};">${esc(p.name)}</p>
<p style="margin:0;font-family:${SANS};font-size:13px;font-weight:600;color:${C.ink};">${price}</p>
</a></td>`;
    })
    .join("");
  const html = `<p style="margin:0 0 16px;text-align:center;font-family:${SERIF};font-size:22px;line-height:1.3;color:${C.ink};">${esc(title)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>`;
  const text = [title.toUpperCase(), ...cols.map((p) => `${p.name} — ${money(p.priceCents, locale)}\n${utm(`/shop/${p.slug}`, campaign, "newsletter")}`)].join("\n");
  return { html, text };
}

// ---------------------------------------------------------------------------
// 3a. Newsletter double opt-in request
// ---------------------------------------------------------------------------

export function renderConfirmRequest(i: { locale: Locale; confirmUrl: string; mailingAddress: string | null }): RenderedEmail {
  const l = i.locale;
  const T = fr(l)
    ? {
        subject: "Un petit clic pour confirmer votre abonnement CMAC",
        preheader: "Confirmez votre adresse — votre code de bienvenue suit juste après.",
        eyebrow: "Presque terminé",
        hero: "Un tout petit clic.",
        lead: "Merci de vous être inscrit·e aux nouvelles de CMAC Beauty : nouveaux outils, idées de rituels tout simples et offres réservées aux abonné·es. Confirmez que c'est bien vous — nous n'enverrons aucune infolettre avant.",
        after: "Dès la confirmation, votre code de bienvenue arrive dans votre boîte de réception.",
        cta: "Oui, je m'abonne",
        ignore: "Vous ne vous êtes pas inscrit·e ? Ignorez simplement ce courriel.",
      }
    : {
        subject: "One little click to confirm your CMAC subscription",
        preheader: "Confirm your address — your welcome code follows right after.",
        eyebrow: "Almost there",
        hero: "One little click.",
        lead: "Thank you for signing up for CMAC Beauty news: new tools, simple ritual ideas and subscriber-only offers. Please confirm it's really you — we won't send a single newsletter until you do.",
        after: "As soon as you confirm, your welcome code lands in your inbox.",
        cta: "Yes, subscribe me",
        ignore: "Didn't sign up? Simply ignore this email.",
      };
  const foot = marketingFooter({ locale: l, kind: "confirm", mailingAddress: i.mailingAddress });
  const sig = signOff(l);
  const body = `
${eyebrow(T.eyebrow)}
${h1(T.hero)}
${para(esc(T.lead))}
${para(esc(T.after), { margin: "0 0 28px" })}
${button(i.confirmUrl, T.cta)}
${spacer(28)}
${para(esc(T.ignore), { size: 13, color: C.faint, margin: "0 0 28px" })}
${sig.html}`;
  return {
    subject: T.subject,
    preheader: T.preheader,
    html: layout({ locale: l, title: T.subject, preheader: T.preheader, body, footer: foot.html }),
    text: [T.hero, "", T.lead, T.after, "", `${T.cta}: ${i.confirmUrl}`, "", T.ignore, "", sig.text, "", foot.text].join("\n"),
  };
}

// ---------------------------------------------------------------------------
// 3b. Welcome (WELCOME10)
// ---------------------------------------------------------------------------

export function renderWelcome(i: {
  locale: Locale;
  code: string | null;
  products: CardProduct[];
  unsubscribeUrl: string;
  mailingAddress: string | null;
}): RenderedEmail {
  const l = i.locale;
  const T = fr(l)
    ? {
        subject: "Bienvenue chez CMAC Beauty — vos 10 % vous attendent ✨",
        subjectNoCode: "Bienvenue chez CMAC Beauty ✨",
        preheader: "Votre cadeau de bienvenue est à l'intérieur, avec quelques idées pour commencer.",
        eyebrow: "Bienvenue",
        hero: "Bienvenue dans le rituel.",
        lead: "Merci de nous laisser une petite place dans votre boîte de réception. On écrira rarement, et seulement quand ça en vaut la peine : nouveaux outils, idées de rituels de dix minutes et offres tout en douceur.",
        label: "Votre cadeau de bienvenue",
        headline: "10 % de rabais",
        how: "Au paiement, touchez « Ajouter un code promotionnel » et entrez ce code.",
        fine: "Valable une fois, sur votre première commande.",
        cta: "Découvrir le rituel",
        begin: "Pour commencer",
        club: "Envie de points sur chaque commande ? Le Glow Club est gratuit.",
      }
    : {
        subject: "Welcome to CMAC Beauty — your 10% is inside ✨",
        subjectNoCode: "Welcome to CMAC Beauty ✨",
        preheader: "Your welcome gift is inside, with a few ideas on where to begin.",
        eyebrow: "Welcome",
        hero: "Welcome to the ritual.",
        lead: "Thank you for making a little room for us in your inbox. We'll write rarely, and only when it's worth it: new tools, ten-minute ritual ideas and gentle offers.",
        label: "Your welcome gift",
        headline: "10% off",
        how: "At checkout, tap “Add promotion code” and enter this code.",
        fine: "One use, on your first order.",
        cta: "Discover the ritual",
        begin: "Where to begin",
        club: "Want points on every order too? The Glow Club is free.",
      };
  const subject = i.code ? T.subject : T.subjectNoCode;
  const foot = marketingFooter({ locale: l, kind: "newsletter", mailingAddress: i.mailingAddress, unsubscribeUrl: i.unsubscribeUrl });
  const cards = productCards(i.products, l, "welcome", T.begin);
  const sig = signOff(l);
  const shopUrl = utm("/shop", "welcome", "newsletter");
  const clubUrl = utm("/glow-club", "welcome", "newsletter");
  const body = `
${eyebrow(T.eyebrow)}
${h1(T.hero)}
${para(esc(T.lead), { margin: "0 0 28px" })}
${i.code ? ticket({ label: T.label, headline: T.headline, code: i.code, note: T.how, fine: T.fine }) : ""}
${button(shopUrl, T.cta, { align: "center", width: 250 })}
${spacer(30)}
${para(`<a href="${esc(clubUrl)}" style="color:${C.terraDeep};">${esc(T.club)}</a>`, { size: 14, margin: "0 0 28px" })}
${sig.html}`;
  return {
    subject,
    preheader: T.preheader,
    html: layout({ locale: l, title: subject, preheader: T.preheader, body, footer: foot.html, after: cards.html }),
    text: [
      T.hero,
      "",
      T.lead,
      ...(i.code ? ["", `${T.label}: ${T.headline}`, `CODE: ${i.code}`, T.how, T.fine] : []),
      "",
      `${T.cta}: ${shopUrl}`,
      "",
      cards.text,
      "",
      `${T.club} ${clubUrl}`,
      "",
      sig.text,
      "",
      foot.text,
    ].join("\n"),
  };
}

// ---------------------------------------------------------------------------
// 4a. Account welcome (on registration)
// ---------------------------------------------------------------------------

export function renderAccountWelcome(i: { locale: Locale; name: string | null; creditedPoints: number; hasBirthday: boolean }): RenderedEmail {
  const l = i.locale;
  const first = firstNameOf(i.name);
  const reward = formatWholeDollars(REWARD_VALUE_CENTS, l);
  const [, radiance, icon] = TIERS;
  const T = fr(l)
    ? {
        subject: first ? `Bienvenue au Glow Club, ${first}` : "Bienvenue au Glow Club",
        preheader: "Votre compte CMAC est prêt — et votre adhésion au Glow Club aussi.",
        eyebrow: "Votre compte est prêt",
        hero: first ? `Bienvenue au Glow Club, ${NB(first)}.` : "Bienvenue au Glow Club.",
        lead: "Votre compte CMAC est prêt, et avec lui votre adhésion au Glow Club. C'est gratuit, et ça récompense tout doucement le rituel que vous bâtissez déjà.",
        how: "Comment ça fonctionne",
        perks: [
          ["1 point par dollar", "sur vos produits, dès votre première commande."],
          [`100 points = ${reward}`, "à échanger en un clic depuis votre compte."],
          ["Une attention d'anniversaire", i.hasBirthday ? "15 % de rabais pendant votre mois d'anniversaire." : "ajoutez votre date d'anniversaire à votre profil pour recevoir 15 % de rabais."],
        ],
        tiers: `Les niveaux évoluent avec vous : Glow dès l'inscription, Radiance dès ${formatWholeDollars(radiance.minSpendCents, l)} et Icon dès ${formatWholeDollars(icon.minSpendCents, l)} — plus de points et une livraison offerte plus tôt.`,
        found: (n: number) => `Bonne nouvelle : nous avons retrouvé ${n} points de vos commandes précédentes. Ils sont déjà dans votre solde.`,
        cta: "Visiter mon compte",
      }
    : {
        subject: first ? `Welcome to the Glow Club, ${first}` : "Welcome to the Glow Club",
        preheader: "Your CMAC account is ready — and so is your Glow Club membership.",
        eyebrow: "Your account is ready",
        hero: first ? `Welcome to the Glow Club, ${NB(first)}.` : "Welcome to the Glow Club.",
        lead: "Your CMAC account is ready, and with it your Glow Club membership. It's free, and it quietly rewards the ritual you're already building.",
        how: "How it works",
        perks: [
          ["1 point per $1", "on products, starting with your very next order."],
          [`100 points = ${reward}`, "redeemed in one click from your account."],
          ["A birthday treat", i.hasBirthday ? "15% off during your birthday month." : "add your birthday to your profile to receive 15% off."],
        ],
        tiers: `Tiers grow with you: Glow from day one, Radiance from ${formatWholeDollars(radiance.minSpendCents, l)} and Icon from ${formatWholeDollars(icon.minSpendCents, l)} — more points per dollar and free shipping sooner.`,
        found: (n: number) => `Good news: we found ${n} points from your earlier orders. They're already in your balance.`,
        cta: "Visit my account",
      };
  const perkRows = T.perks
    .map(
      ([a, b], n) => `<tr>
<td width="34" valign="top" style="padding:0 12px 16px 0;width:34px;font-family:${SERIF};font-size:20px;line-height:1.2;font-style:italic;color:${C.terra};">${String(n + 1).padStart(2, "0")}</td>
<td valign="top" style="padding:0 0 16px;"><p style="margin:0 0 2px;font-family:${SERIF};font-size:17px;line-height:1.3;color:${C.ink};">${esc(a)}</p><p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.soft};">${esc(b)}</p></td>
</tr>`,
    )
    .join("");
  const sig = signOff(l);
  const foot = transactionalFooter(l, "account-welcome");
  const url = utm("/account", "account-welcome");
  const body = `
${eyebrow(T.eyebrow)}
${h1(T.hero)}
${para(esc(T.lead), { margin: "0 0 28px" })}
${i.creditedPoints > 0 ? panel(`${eyebrow("Glow Club", C.sage)}<p style="margin:0 0 6px;font-family:${SERIF};font-size:30px;line-height:1.1;color:${C.ink};">+${i.creditedPoints} points</p>${para(esc(T.found(i.creditedPoints)), { size: 14, margin: "0" })}`, { bg: C.sageSoft }) : ""}
${h2(T.how)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${perkRows}</table>
${para(esc(T.tiers), { size: 13, color: C.faint, margin: "4px 0 28px" })}
${button(url, T.cta)}
${spacer(32)}
${sig.html}`;
  return {
    subject: T.subject,
    preheader: T.preheader,
    html: layout({ locale: l, title: T.subject, preheader: T.preheader, body, footer: foot.html }),
    text: [
      T.hero,
      "",
      T.lead,
      ...(i.creditedPoints > 0 ? ["", T.found(i.creditedPoints)] : []),
      "",
      T.how.toUpperCase(),
      ...T.perks.map(([a, b]) => `· ${a} — ${b}`),
      "",
      T.tiers,
      "",
      `${T.cta}: ${url}`,
      "",
      sig.text,
      "",
      foot.text,
    ].join("\n"),
  };
}

// ---------------------------------------------------------------------------
// 4b. Password reset
// ---------------------------------------------------------------------------

export function renderPasswordReset(i: { locale: Locale; url: string }): RenderedEmail {
  const l = i.locale;
  const T = fr(l)
    ? {
        subject: "Réinitialisez votre mot de passe CMAC Beauty",
        preheader: "Votre lien est valide pendant 1 heure et fonctionne une seule fois.",
        eyebrow: "Sécurité du compte",
        hero: "Un nouveau mot de passe, en douceur.",
        lead: "Quelqu'un (vous, on l'espère) a demandé à réinitialiser le mot de passe de votre compte CMAC Beauty. Touchez le bouton ci-dessous pour en choisir un nouveau.",
        cta: "Choisir un nouveau mot de passe",
        secTitle: "Bon à savoir",
        sec: [
          "Ce lien expire dans 1 heure et ne fonctionne qu'une seule fois.",
          "Vous n'avez rien demandé ? Ignorez ce courriel : votre mot de passe ne change pas.",
          "Nous ne vous demanderons jamais votre mot de passe par courriel.",
        ],
        copy: "Le bouton ne fonctionne pas ? Copiez ce lien dans votre navigateur :",
      }
    : {
        subject: "Reset your CMAC Beauty password",
        preheader: "Your link is valid for 1 hour and works once.",
        eyebrow: "Account security",
        hero: "A fresh password, gently.",
        lead: "Someone (hopefully you) asked to reset the password of your CMAC Beauty account. Tap the button below to choose a new one.",
        cta: "Choose a new password",
        secTitle: "Good to know",
        sec: [
          "This link expires in 1 hour and works only once.",
          "Didn't ask for this? Ignore this email — your password stays the same.",
          "We will never ask for your password by email.",
        ],
        copy: "Button not working? Copy this link into your browser:",
      };
  const sig = signOff(l);
  const foot = transactionalFooter(l, "password-reset");
  const body = `
${eyebrow(T.eyebrow)}
${h1(T.hero)}
${para(esc(T.lead), { margin: "0 0 28px" })}
${button(i.url, T.cta, { width: 290 })}
${spacer(30)}
${panel(`${eyebrow(T.secTitle, C.sage)}${T.sec.map((s) => `<p style="margin:0 0 8px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.soft};">&#8226;&nbsp; ${esc(s)}</p>`).join("")}`, { padding: "22px 24px 16px" })}
${para(`${esc(T.copy)}<br><a href="${esc(i.url)}" style="color:${C.terraDeep};word-break:break-all;">${esc(i.url)}</a>`, { size: 12, color: C.faint, margin: "0 0 28px" })}
${sig.html}`;
  return {
    subject: T.subject,
    preheader: T.preheader,
    html: layout({ locale: l, title: T.subject, preheader: T.preheader, body, footer: foot.html }),
    text: [T.hero, "", T.lead, "", i.url, "", ...T.sec.map((s) => `· ${s}`), "", sig.text, "", foot.text].join("\n"),
  };
}

// ---------------------------------------------------------------------------
// 4c. Glow Club reward code (points redeemed)
// ---------------------------------------------------------------------------

export function renderRewardCode(i: { locale: Locale; name: string | null; code: string; amountOffCents: number; pointsSpent: number; balance: number }): RenderedEmail {
  const l = i.locale;
  const first = firstNameOf(i.name);
  const amount = formatWholeDollars(i.amountOffCents, l);
  const T = fr(l)
    ? {
        subject: `Votre récompense Glow Club de ${amount} est prête ✨`,
        preheader: `Votre code de ${amount} est à l'intérieur — il est aussi enregistré dans votre compte.`,
        eyebrow: "Récompense Glow Club",
        hero: first ? `Un petit merci, ${NB(first)}.` : "Un petit merci.",
        lead: `Vous avez échangé ${i.pointsSpent} points contre ${amount} de rabais. Voici votre code — il est aussi enregistré dans votre compte.`,
        label: "Votre récompense",
        headline: `${amount} de rabais`,
        how: "Au paiement, touchez « Ajouter un code promotionnel » et entrez ce code.",
        fine: "Usage unique · un code par commande.",
        balance: `Solde restant : ${i.balance} points.`,
        cta: "Magasiner le rituel",
      }
    : {
        subject: `Your ${amount} Glow Club reward is ready ✨`,
        preheader: `Your ${amount} code is inside — it's saved in your account too.`,
        eyebrow: "Glow Club reward",
        hero: first ? `A little thank-you, ${NB(first)}.` : "A little thank-you.",
        lead: `You traded ${i.pointsSpent} points for ${amount} off. Here's your code — it's saved in your account too.`,
        label: "Your reward",
        headline: `${amount} off`,
        how: "At checkout, tap “Add promotion code” and enter this code.",
        fine: "Single use · one code per order.",
        balance: `Remaining balance: ${i.balance} points.`,
        cta: "Shop the ritual",
      };
  const sig = signOff(l);
  const foot = transactionalFooter(l, "glow-reward");
  const url = utm("/shop", "glow-reward");
  const body = `
${eyebrow(T.eyebrow)}
${h1(T.hero)}
${para(esc(T.lead), { margin: "0 0 28px" })}
${ticket({ label: T.label, headline: T.headline, code: i.code, note: T.how, fine: T.fine })}
${para(esc(T.balance), { size: 14, margin: "0 0 26px" })}
${button(url, T.cta)}
${spacer(32)}
${sig.html}`;
  return {
    subject: T.subject,
    preheader: T.preheader,
    html: layout({ locale: l, title: T.subject, preheader: T.preheader, body, footer: foot.html }),
    text: [T.hero, "", T.lead, "", `CODE: ${i.code}`, T.how, T.fine, "", T.balance, "", `${T.cta}: ${url}`, "", sig.text, "", foot.text].join("\n"),
  };
}

// ---------------------------------------------------------------------------
// 4d. Birthday (15%)
// ---------------------------------------------------------------------------

export function renderBirthday(i: { locale: Locale; name: string | null; code: string; expiresLabel: string; mailingAddress: string | null }): RenderedEmail {
  const l = i.locale;
  const first = firstNameOf(i.name);
  const T = fr(l)
    ? {
        subject: first ? `Joyeux anniversaire, ${first} 🎂 — 15 % offerts` : "Joyeux anniversaire 🎂 — 15 % offerts",
        preheader: "Une petite attention du Glow Club, rien que pour vous.",
        eyebrow: "Joyeux anniversaire",
        hero: first ? `Joyeux anniversaire, ${NB(first)}.` : "Joyeux anniversaire.",
        lead: "Que cette nouvelle année vous fasse autant de bien que vos dix minutes préférées de la journée. Le Glow Club a envie de vous gâter un peu : 15 % de rabais sur une commande, rien que pour vous.",
        label: "Votre cadeau d'anniversaire",
        headline: "15 % de rabais",
        how: "Au paiement, touchez « Ajouter un code promotionnel » et entrez ce code.",
        fine: `Valide jusqu'au ${i.expiresLabel} · usage unique · aussi enregistré dans votre compte.`,
        cta: "Me faire plaisir",
        wish: "Avec toute notre tendresse,",
      }
    : {
        subject: first ? `Happy birthday, ${first} 🎂 — 15% off, from us` : "Happy birthday 🎂 — 15% off, from us",
        preheader: "A little something from the Glow Club, just for you.",
        eyebrow: "Happy birthday",
        hero: first ? `Happy birthday, ${NB(first)}.` : "Happy birthday.",
        lead: "Here's to a year that feels as good as your favourite ten quiet minutes of the day. The Glow Club would love to spoil you a little: 15% off one order, just for you.",
        label: "Your birthday gift",
        headline: "15% off",
        how: "At checkout, tap “Add promotion code” and enter this code.",
        fine: `Valid until ${i.expiresLabel} · single use · also saved in your account.`,
        cta: "Treat yourself",
        wish: "With warm wishes,",
      };
  const foot = marketingFooter({ locale: l, kind: "member", mailingAddress: i.mailingAddress });
  const sig = signOff(l, T.wish);
  const url = utm("/shop", "birthday", "glow-club");
  const stars = `<p style="margin:0 0 14px;font-family:${SERIF};font-size:16px;line-height:1;letter-spacing:0.6em;color:${C.terra};">&#10022; &#10023; &#10022;</p>`;
  const body = `
${stars}
${eyebrow(T.eyebrow)}
${h1(T.hero)}
${para(esc(T.lead), { margin: "0 0 28px" })}
${ticket({ label: T.label, headline: T.headline, code: i.code, note: T.how, fine: T.fine })}
${button(url, T.cta, { align: "center", width: 230 })}
${spacer(32)}
${sig.html}`;
  return {
    subject: T.subject,
    preheader: T.preheader,
    html: layout({ locale: l, title: T.subject, preheader: T.preheader, body, footer: foot.html }),
    text: [T.hero, "", T.lead, "", `CODE: ${i.code}`, T.how, T.fine, "", `${T.cta}: ${url}`, "", sig.text, "", foot.text].join("\n"),
  };
}

// ---------------------------------------------------------------------------
// 5. Owner new-order notification (EN, functional)
// ---------------------------------------------------------------------------

export type OwnerOrderView = {
  reference: string;
  placedAt: Date;
  name: string | null;
  email: string;
  locale: Locale;
  items: {
    name: string;
    options: string[];
    qty: number;
    unitCents: number;
    sku: string | null;
    /** Product shippingNote (colour → CJ SKU / set recipe). */
    note: string | null;
    components: { name: string; qty: number; variant: string }[];
  }[];
  subtotalCents: number;
  discountCents: number;
  promoCode: string | null;
  shippingCents: number;
  totalCents: number;
  /** Full address incl. phone. */
  address: string[];
  member: boolean;
  pointsEarned: number | null;
};

export function renderOwnerOrder(o: OwnerOrderView): RenderedEmail {
  const ref = shortRef(o.reference);
  const m = (c: number) => money(c, "en");
  const subject = `New order · ${m(o.totalCents)} · ${ref}`;
  const td = `font-family:${SANS};font-size:13px;line-height:1.5;color:${C.ink};border-bottom:1px solid ${C.line};`;
  const itemRows = o.items
    .map((i) => {
      const cj = i.components.length
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;">${i.components
            .map(
              (c) => `<tr><td valign="top" style="padding:3px 8px 3px 0;font-family:${SANS};font-size:12px;color:${C.faint};white-space:nowrap;">${c.qty * i.qty} ×</td><td style="padding:3px 0;font-family:${SANS};font-size:12px;line-height:1.5;color:${C.soft};"><strong style="color:${C.ink};">${esc(c.name)}</strong><br><span style="font-family:'Courier New',Menlo,monospace;">${esc(c.variant)}</span></td></tr>`,
            )
            .join("")}</table>`
        : "";
      const skuLine = [i.sku && i.sku !== "SET" ? `SKU ${i.sku}` : null, !i.components.length ? i.note : null].filter(Boolean).join(" · ");
      return `<tr>
<td valign="top" style="padding:12px 8px 12px 0;${td}white-space:nowrap;"><strong>${i.qty} ×</strong></td>
<td valign="top" style="padding:12px 8px 12px 0;${td}"><strong>${esc(i.name)}</strong>${i.options.length ? ` <span style="color:${C.faint};">(${esc(i.options.join(", "))})</span>` : ""}
${skuLine ? `<br><span style="font-family:'Courier New',Menlo,monospace;font-size:12px;color:${C.soft};">${esc(skuLine)}</span>` : ""}
${i.components.length ? `<p style="margin:8px 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;color:${C.terra};">Order on CJ — one order, China warehouse</p>${cj}` : ""}</td>
<td valign="top" align="right" style="padding:12px 0;${td}white-space:nowrap;">${esc(m(i.unitCents * i.qty))}</td>
</tr>`;
    })
    .join("");
  const totals = [
    kv("Subtotal", esc(m(o.subtotalCents))),
    o.discountCents > 0 ? kv(`Discount${o.promoCode ? ` (${o.promoCode})` : ""}`, `−${esc(m(o.discountCents))}`) : "",
    kv("Shipping", o.shippingCents === 0 ? "Free" : esc(m(o.shippingCents))),
    kv("Total paid", `<strong>${esc(m(o.totalCents))}</strong>`, { strong: true }),
  ].join("");
  const customer = `<strong>${esc(o.name ?? "—")}</strong><br><a href="mailto:${esc(o.email)}" style="color:${C.terraDeep};">${esc(o.email)}</a><br>Email language: ${o.locale.toUpperCase()}<br>${o.member ? `Glow Club member${o.pointsEarned != null ? ` · +${o.pointsEarned} pts` : ""}` : "Guest"}`;
  const body = `
${eyebrow("New order · action needed")}
${h1(`${m(o.totalCents)} · #${ref}`)}
<p style="margin:0 0 24px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.faint};">${esc(new Intl.DateTimeFormat("en-CA", { dateStyle: "full", timeStyle: "short", timeZone: BRAND.timeZone }).format(o.placedAt))} · ref <span style="font-family:'Courier New',Menlo,monospace;">${esc(o.reference)}</span></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">${itemRows}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;">${totals}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;"><tr>
<td class="stack" width="50%" valign="top" style="padding:0 12px 0 0;">${eyebrow("Customer")}<p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.7;color:${C.ink};">${customer}</p></td>
<td class="stack" width="50%" valign="top">${eyebrow("Ship to")}<p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.7;color:${C.ink};">${o.address.length ? o.address.map(esc).join("<br>") : "—"}</p></td>
</tr></table>
${button(`${siteUrl()}/admin/orders`, "Open /admin/orders", { width: 230 })}
${para("Place the CJ order, then click Mark fulfilled with the tracking number — the customer gets the shipping email in their language.", { size: 12, color: C.faint, margin: "20px 0 0" })}`;
  const text = [
    subject,
    `Ref ${o.reference}`,
    "",
    ...o.items.flatMap((i) => [
      `${i.qty} × ${i.name}${i.options.length ? ` (${i.options.join(", ")})` : ""} — ${m(i.unitCents * i.qty)}`,
      ...(i.sku && i.sku !== "SET" ? [`   SKU ${i.sku}`] : []),
      ...(!i.components.length && i.note ? [`   ${i.note}`] : []),
      ...(i.components.length ? ["   ORDER ON CJ (one order, China warehouse):", ...i.components.map((c) => `   - ${c.qty * i.qty} × ${c.name}: ${c.variant}`)] : []),
    ]),
    "",
    `Subtotal: ${m(o.subtotalCents)}`,
    ...(o.discountCents > 0 ? [`Discount${o.promoCode ? ` (${o.promoCode})` : ""}: −${m(o.discountCents)}`] : []),
    `Shipping: ${o.shippingCents === 0 ? "Free" : m(o.shippingCents)}`,
    `Total paid: ${m(o.totalCents)}`,
    "",
    `Customer: ${o.name ?? "—"} <${o.email}> (${o.locale}) · ${o.member ? "member" : "guest"}`,
    "Ship to:",
    ...o.address,
    "",
    `${siteUrl()}/admin/orders`,
  ].join("\n");
  return {
    subject,
    preheader: `${o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}`,
    html: layout({ locale: "en", title: subject, body, footer: `${esc(BRAND.name)} · owner notification`, preheader: o.items.map((i) => `${i.qty}× ${i.name}`).join(", ") }),
    text,
  };
}

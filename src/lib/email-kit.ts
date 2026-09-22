/**
 * Email design kit for CMAC Beauty — pure HTML helpers, no DB / no network, so
 * templates can be rendered from scripts (scripts/render-email-previews.ts).
 *
 * Email-safe rules followed everywhere: table layout, inline CSS, 600px max,
 * `bgcolor` attributes on every coloured cell (Outlook + dark-mode inversion),
 * no pure-white text on transparent, web fonts with Georgia / Arial fallbacks,
 * alt text on every image, a hidden preheader, and bulletproof buttons
 * (padded cell + link, VML for Outlook desktop).
 */
import type { Locale } from "@/i18n/messages";
import { BRAND, siteUrl } from "./brand";

export const C = {
  cream: "#F5F1EA",
  paper: "#FFFDF9",
  blush: "#F7ECE4",
  ink: "#1F2422",
  soft: "#4A504D",
  faint: "#8A908D",
  terra: "#C97B63",
  terraDeep: "#A9604A",
  sage: "#4A5D4E",
  sageSoft: "#E6EBE4",
  line: "#E6DFD3",
  white: "#FFFDF9",
} as const;

export const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
export const SANS = "'Inter', Arial, Helvetica, sans-serif";

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Plain-text + HTML pair produced by every block. */
export type Block = { html: string; text: string };

// ---------------------------------------------------------------------------
// Names, links, images
// ---------------------------------------------------------------------------

/** "MARIE-ÈVE TREMBLAY" / "marie-ève" → "Marie-Ève". Null when nothing usable. */
export function firstNameOf(name: string | null | undefined): string | null {
  const first = String(name ?? "").trim().split(/\s+/)[0] ?? "";
  if (!first || first.length > 40 || /[@\d]/.test(first)) return null;
  const mixed = first !== first.toUpperCase() && first !== first.toLowerCase();
  if (mixed) return first;
  return first
    .toLowerCase()
    .replace(/(^|[-'’])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/** Adds UTM parameters to a site link (email clicks show up in analytics). */
export function utm(path: string, campaign: string, source = "email"): string {
  const url = path.startsWith("http") ? path : `${siteUrl()}${path}`;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=${source}&utm_medium=email&utm_campaign=${encodeURIComponent(campaign)}`;
}

/**
 * Email-sized product image. Cloudinary URLs get a fill crop (default 160×200,
 * 4:5) delivered as JPEG — Outlook can't show WebP/AVIF, so no f_auto here.
 * Other https URLs are returned unchanged; anything else → null.
 */
export function emailImage(url: string | null | undefined, w = 160, h = 200): string | null {
  if (!url || !/^https:\/\//i.test(url)) return null;
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/i);
  if (!m) return url;
  const rest = m[2];
  // Drop existing transformation segments (everything before the version / public id).
  const v = rest.match(/(?:^|\/)(v\d+\/.*)$/);
  const publicPart = v ? v[1] : rest;
  return `${m[1]}c_fill,w_${w},h_${h},g_auto/f_jpg/q_auto/${publicPart}`;
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

export function eyebrow(label: string, color: string = C.terra): string {
  return `<p style="margin:0 0 10px;font-family:${SANS};font-size:11px;line-height:1.4;letter-spacing:0.22em;text-transform:uppercase;font-weight:600;color:${color};">${esc(label)}</p>`;
}

export function h1(text: string): string {
  return `<h1 class="h1" style="margin:0 0 18px;font-family:${SERIF};font-size:36px;line-height:1.12;font-weight:400;letter-spacing:-0.01em;color:${C.ink};">${esc(text)}</h1>`;
}

export function h2(text: string): string {
  return `<h2 style="margin:0 0 14px;font-family:${SERIF};font-size:22px;line-height:1.25;font-weight:400;color:${C.ink};">${esc(text)}</h2>`;
}

export function para(html: string, opts: { size?: number; color?: string; margin?: string } = {}): string {
  return `<p style="margin:${opts.margin ?? "0 0 16px"};font-family:${SANS};font-size:${opts.size ?? 15}px;line-height:1.7;color:${opts.color ?? C.soft};">${html}</p>`;
}

/** Thin decorative rule. */
export function rule(margin = "28px 0"): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${margin};"><tr><td height="1" bgcolor="${C.line}" style="height:1px;line-height:1px;font-size:1px;background:${C.line};">&nbsp;</td></tr></table>`;
}

/** Vertical space (Outlook-safe). */
export function spacer(px: number): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="${px}" style="height:${px}px;line-height:${px}px;font-size:1px;">&nbsp;</td></tr></table>`;
}

/** Bulletproof pill button (VML roundrect for Outlook desktop). */
export function button(href: string, label: string, opts: { color?: string; align?: "left" | "center"; width?: number } = {}): string {
  const bg = opts.color ?? C.ink;
  const width = opts.width ?? 260;
  const align = opts.align ?? "left";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${align}">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(href)}" style="height:50px;v-text-anchor:middle;width:${width}px;" arcsize="50%" stroke="f" fillcolor="${bg}"><w:anchorlock/><center style="color:${C.cream};font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">${esc(label)}</center></v:roundrect><![endif]-->
<!--[if !mso]><!-- --><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:${align === "center" ? "0 auto" : "0"};"><tr><td bgcolor="${bg}" style="border-radius:999px;background:${bg};">
<a href="${esc(href)}" target="_blank" style="display:inline-block;padding:16px 32px;font-family:${SANS};font-size:14px;line-height:18px;font-weight:600;letter-spacing:0.02em;color:${C.cream};text-decoration:none;border-radius:999px;">${esc(label)}&nbsp;&nbsp;&rarr;</a>
</td></tr></table><!--<![endif]-->
</td></tr></table>`;
}

/** Soft rounded panel. */
export function panel(inner: string, opts: { bg?: string; border?: string; padding?: string; radius?: number; margin?: string } = {}): string {
  const bg = opts.bg ?? C.cream;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${opts.margin ?? "0 0 24px"};border-collapse:separate;"><tr><td bgcolor="${bg}" class="panel" style="padding:${opts.padding ?? "24px 26px"};background:${bg};border-radius:${opts.radius ?? 18}px;${opts.border ? `border:${opts.border};` : ""}">${inner}</td></tr></table>`;
}

/** Label / value row for totals tables. */
export function kv(label: string, valueHtml: string, opts: { strong?: boolean; color?: string } = {}): string {
  const size = opts.strong ? 18 : 14;
  return `<tr>
<td style="padding:6px 0;font-family:${opts.strong ? SERIF : SANS};font-size:${size}px;line-height:1.4;color:${opts.strong ? C.ink : C.faint};">${esc(label)}</td>
<td align="right" style="padding:6px 0 6px 12px;font-family:${opts.strong ? SERIF : SANS};font-size:${size}px;line-height:1.4;color:${opts.color ?? C.ink};white-space:nowrap;">${valueHtml}</td>
</tr>`;
}

/** "Ticket" block for a discount / reward code. */
export function ticket(opts: { label: string; headline: string; code: string; note?: string; fine?: string }): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;border-collapse:separate;"><tr><td bgcolor="${C.blush}" align="center" style="padding:30px 24px 26px;background:${C.blush};border:1.5px dashed ${C.terra};border-radius:20px;">
${eyebrow(opts.label)}
<p style="margin:0 0 18px;font-family:${SERIF};font-size:40px;line-height:1.05;font-weight:400;color:${C.ink};">${esc(opts.headline)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr><td bgcolor="${C.paper}" style="padding:14px 26px;background:${C.paper};border-radius:12px;border:1px solid ${C.line};font-family:'Courier New',Menlo,Consolas,monospace;font-size:24px;line-height:1.2;letter-spacing:0.22em;font-weight:700;color:${C.ink};">${esc(opts.code)}</td></tr></table>
${opts.note ? `<p style="margin:16px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.soft};">${esc(opts.note)}</p>` : ""}
${opts.fine ? `<p style="margin:6px 0 0;font-family:${SANS};font-size:12px;line-height:1.5;color:${C.faint};">${esc(opts.fine)}</p>` : ""}
</td></tr></table>`;
}

/** Team sign-off: "With care, / The CMAC team / CMAC Beauty · Montréal & L'Assomption". */
export function signOff(locale: Locale, closing?: string): Block {
  const close = closing ?? (locale === "fr" ? "Avec douceur," : "With care,");
  const team = locale === "fr" ? "L'équipe CMAC" : "The CMAC team";
  const place = locale === "fr" ? "CMAC Beauty · Montréal et L'Assomption" : "CMAC Beauty · Montréal & L'Assomption";
  return {
    html: `<p style="margin:0 0 4px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.soft};">${esc(close)}</p>
<p style="margin:0;font-family:${SERIF};font-size:30px;line-height:1.2;font-style:italic;font-weight:400;color:${C.ink};">${esc(team)}</p>
<p style="margin:2px 0 0;font-family:${SANS};font-size:12px;line-height:1.5;letter-spacing:0.08em;color:${C.faint};">${esc(place)}</p>`,
    text: `${close}\n${team}, ${place}`,
  };
}

// ---------------------------------------------------------------------------
// Footers
// ---------------------------------------------------------------------------

const FOOT = {
  en: { questions: "Questions? Just reply — it comes straight to us.", shipping: "Shipping & returns", club: "Glow Club", area: "Montréal & L'Assomption, Québec" },
  fr: { questions: "Une question ? Répondez simplement à ce courriel.", shipping: "Livraison et retours", club: "Glow Club", area: "Montréal et L'Assomption, Québec" },
} as const;

/** Standard footer for transactional email (no marketing codes). */
export function transactionalFooter(locale: Locale, campaign = "transactional"): Block {
  const f = FOOT[locale];
  const link = (href: string, label: string) =>
    `<a href="${esc(href)}" style="color:${C.soft};text-decoration:underline;">${esc(label)}</a>`;
  const ship = utm("/shipping-returns", campaign);
  const club = utm("/glow-club", campaign);
  return {
    html: `${esc(f.questions)}<br><a href="mailto:${BRAND.email}" style="color:${C.terraDeep};text-decoration:none;">${BRAND.email}</a><br><br>
${link(ship, f.shipping)} &nbsp;·&nbsp; ${link(club, f.club)} &nbsp;·&nbsp; ${link(utm("/", campaign), "cmacbeauty.ca")}<br><br>
${esc(BRAND.name)} · ${esc(f.area)}`,
    text: ["—", f.questions, BRAND.email, `${f.shipping}: ${siteUrl()}/shipping-returns`, `${f.club}: ${siteUrl()}/glow-club`, `${BRAND.name} · ${f.area}`].join("\n"),
  };
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------

export type LayoutInput = {
  locale: Locale;
  /** <title> — usually the subject. */
  title: string;
  preheader?: string;
  /** Main card content (already HTML). */
  body: string;
  /** Footer HTML (small print below the card). */
  footer: string;
  /** Optional content between the card and the footer (e.g. product cards). */
  after?: string;
};

/** The branded shell: wordmark header, cream canvas, paper card, small-print footer. */
export function layout(i: LayoutInput): string {
  const pre = i.preheader
    ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;color:${C.cream};">${esc(i.preheader)}${"&#8199;&#65279;&#847; ".repeat(60)}</div>`
    : "";
  return `<!doctype html>
<html lang="${i.locale === "fr" ? "fr-CA" : "en-CA"}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(i.title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>body,table,td,p,a,span,li{font-family:Arial,Helvetica,sans-serif !important;} h1,h2,.serif{font-family:Georgia,serif !important;}</style><![endif]-->
<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"><!--<![endif]-->
<style>
:root{color-scheme:light;supported-color-schemes:light;}
body{margin:0 !important;padding:0 !important;width:100% !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;}
img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
a{color:${C.terraDeep};}
a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;}
u + #body a{color:inherit;text-decoration:none;}
@media only screen and (max-width:620px){
  .wrap{padding:20px 12px 28px !important;}
  .card{padding:34px 22px 30px !important;border-radius:20px !important;}
  .h1{font-size:30px !important;line-height:1.15 !important;}
  .panel{padding:20px 18px !important;}
  .stack{display:block !important;width:100% !important;max-width:100% !important;padding:0 0 18px !important;}
  .hide-sm{display:none !important;}
  .thumb{width:64px !important;height:80px !important;}
}
</style>
</head>
<body id="body" bgcolor="${C.cream}" style="margin:0;padding:0;background:${C.cream};word-spacing:normal;">
${pre}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.cream}" style="background:${C.cream};">
<tr><td align="center" class="wrap" style="padding:36px 16px 44px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">
  <tr><td align="center" style="padding:0 0 26px;">
    <a href="${esc(utm("/", "header"))}" style="text-decoration:none;color:${C.ink};">
      <span class="serif" style="display:block;font-family:${SERIF};font-size:30px;line-height:1;letter-spacing:0.14em;font-weight:500;color:${C.ink};">CMAC</span>
      <span style="display:block;padding-top:7px;font-family:${SANS};font-size:10px;line-height:1;letter-spacing:0.5em;text-transform:uppercase;font-weight:600;color:${C.sage};">&nbsp;Beauty</span>
    </a>
  </td></tr>
  <tr><td bgcolor="${C.paper}" class="card" style="padding:48px 48px 44px;background:${C.paper};border-radius:26px;border:1px solid ${C.line};">
${i.body}
  </td></tr>
  ${i.after ? `<tr><td style="padding:28px 0 0;">${i.after}</td></tr>` : ""}
  <tr><td align="center" style="padding:30px 20px 0;font-family:${SANS};font-size:12px;line-height:1.7;color:${C.faint};">
${i.footer}
  </td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

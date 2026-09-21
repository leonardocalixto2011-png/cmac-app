/**
 * Marketing email (CASL): newsletter double opt-in request, welcome (WELCOME10),
 * Glow Club birthday reward, and admin campaigns.
 *
 * Every commercial message carries: sender name "CMAC Beauty", contact email,
 * the postal address from BUSINESS_MAILING_ADDRESS, why the person receives it,
 * a one-click unsubscribe link, and List-Unsubscribe / List-Unsubscribe-Post
 * headers. Campaigns are refused when the mailing address or Resend is missing.
 */
import type { Locale } from "@/i18n/messages";
import { BRAND, siteUrl } from "./brand";
import { C, card, emailFrom, esc, frame, logUnsent, sendEmail } from "./email";
import { emailConfigured, mailingAddress } from "./integrations";
import { markdownToHtml, markdownToText } from "./markdown";
import { formatMoneyFromCents } from "./utils";

export function unsubscribeUrl(token: string): string {
  return `${siteUrl()}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}
export function oneClickUnsubscribeUrl(token: string): string {
  return `${siteUrl()}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function listUnsubscribeHeaders(token: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${oneClickUnsubscribeUrl(token)}>, <mailto:${BRAND.email}?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

const FOOT = {
  en: {
    newsletter: "You're receiving this email because you subscribed to CMAC Beauty news at cmacbeauty.ca.",
    member:
      "You're receiving this email because you're a Glow Club member with a birthday saved in your CMAC Beauty account. Remove it from your profile to stop birthday emails.",
    unsubscribe: "Unsubscribe",
    unsubscribeText: "Unsubscribe in one click:",
    profile: "Manage my profile",
  },
  fr: {
    newsletter: "Vous recevez ce courriel parce que vous êtes abonné·e aux nouvelles de CMAC Beauty sur cmacbeauty.ca.",
    member:
      "Vous recevez ce courriel parce que vous êtes membre du Glow Club et que votre date d'anniversaire est enregistrée dans votre compte CMAC Beauty. Retirez-la de votre profil pour ne plus recevoir ce courriel.",
    unsubscribe: "Se désabonner",
    unsubscribeText: "Désabonnement en un clic :",
    profile: "Gérer mon profil",
  },
} as const;

/** CASL footer (HTML + text). Newsletter token → unsubscribe link; null → member (profile link). */
function caslFooter(locale: Locale, unsubscribeToken: string | null): { html: string; text: string } {
  const f = FOOT[locale];
  const address = mailingAddress() ?? BRAND.area;
  const reason = unsubscribeToken ? f.newsletter : f.member;
  const link = unsubscribeToken ? unsubscribeUrl(unsubscribeToken) : `${siteUrl()}/account/profile`;
  const label = unsubscribeToken ? f.unsubscribe : f.profile;
  const html = `${esc(reason)}<br>
<strong>${esc(BRAND.name)}</strong> · ${esc(address)} · <a href="mailto:${BRAND.email}" style="color:${C.terra};">${BRAND.email}</a><br>
<a href="${esc(link)}" style="color:${C.terra};">${esc(label)}</a>`;
  const text = [
    "—",
    reason,
    `${BRAND.name} · ${address} · ${BRAND.email}`,
    `${unsubscribeToken ? f.unsubscribeText : f.profile + ":"} ${link}`,
  ].join("\n");
  return { html, text };
}

const btn = (href: string, label: string) =>
  `<a href="${esc(href)}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:${C.ink};color:#fff;text-decoration:none;font-size:14px;font-weight:600;">${esc(label)} →</a>`;

// ---------------------------------------------------------------------------
// Double opt-in request (not promotional: identifies the sender, asks to confirm)
// ---------------------------------------------------------------------------

const CONFIRM = {
  en: {
    subject: "Please confirm your subscription to CMAC Beauty",
    title: "One click to confirm.",
    lead: "Thanks for signing up for CMAC Beauty news: new tools, routine guides and member offers. Please confirm it's really you — we won't send any newsletter until you do.",
    cta: "Yes, subscribe me",
    ignore: "Didn't sign up? Ignore this email and you won't hear from us.",
  },
  fr: {
    subject: "Confirmez votre abonnement à CMAC Beauty",
    title: "Un clic pour confirmer.",
    lead: "Merci de vous être inscrit·e aux nouvelles de CMAC Beauty : nouveaux outils, guides de routine et offres pour les membres. Confirmez que c'est bien vous — nous n'enverrons aucune infolettre avant votre confirmation.",
    cta: "Oui, je m'abonne",
    ignore: "Vous ne vous êtes pas inscrit·e ? Ignorez ce courriel, vous n'entendrez plus parler de nous.",
  },
} as const;

export async function sendConfirmRequest(to: string, locale: Locale, confirmToken: string): Promise<boolean> {
  const c = CONFIRM[locale];
  const url = `${siteUrl()}/newsletter/confirm?token=${encodeURIComponent(confirmToken)}`;
  const inner = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${C.soft};">${esc(c.lead)}</p>
    <p style="margin:0 0 18px;">${btn(url, c.cta)}</p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:${C.faint};">${esc(c.ignore)}</p>`;
  const text = [c.lead, "", url, "", c.ignore].join("\n");
  return sendEmail({ to, subject: c.subject, html: frame(locale, c.title, inner), text, replyTo: BRAND.email });
}

// ---------------------------------------------------------------------------
// Welcome (after confirmation) — WELCOME10
// ---------------------------------------------------------------------------

const WELCOME = {
  en: {
    subject: "Welcome to CMAC Beauty — your 10% code inside",
    title: "Welcome in.",
    lead: "You're confirmed. Here's 10% off your first order — enter the code at checkout.",
    leadNoCode: "You're confirmed. Thanks for joining — we'll keep it useful and occasional.",
    code: "Your code",
    shop: "Shop the ritual",
    club: "Want points on every order too? Join the Glow Club — it's free.",
    sig: "The CMAC team",
  },
  fr: {
    subject: "Bienvenue chez CMAC Beauty — votre code de 10 % à l'intérieur",
    title: "Bienvenue.",
    lead: "C'est confirmé. Voici 10 % de rabais sur votre première commande — entrez le code au moment du paiement.",
    leadNoCode: "C'est confirmé. Merci de votre inscription — on promet des courriels utiles et pas trop souvent.",
    code: "Votre code",
    shop: "Magasiner le rituel",
    club: "Envie de points sur chaque commande ? Joignez le Glow Club — c'est gratuit.",
    sig: "L'équipe CMAC",
  },
} as const;

/** Welcome email. Skipped (returns false) when the CASL mailing address isn't configured. */
export async function sendWelcome(
  to: string,
  locale: Locale,
  unsubscribeToken: string,
  code: string | null,
): Promise<boolean> {
  if (!mailingAddress()) {
    console.info("[marketing] welcome email skipped: BUSINESS_MAILING_ADDRESS not set");
    return false;
  }
  const c = WELCOME[locale];
  const foot = caslFooter(locale, unsubscribeToken);
  const lead = code ? c.lead : c.leadNoCode;
  const codeHtml = code
    ? card(c.code, `<p style="margin:0;font-family:Menlo,Consolas,monospace;font-size:22px;letter-spacing:0.12em;color:${C.ink};">${esc(code)}</p>`)
    : "";
  const shopUrl = `${siteUrl()}/shop?utm_source=newsletter&utm_medium=email&utm_campaign=welcome`;
  const inner = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${C.soft};">${esc(lead)}</p>
    ${codeHtml}
    <p style="margin:0 0 18px;">${btn(shopUrl, c.shop)}</p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.6;"><a href="${siteUrl()}/glow-club" style="color:${C.terra};">${esc(c.club)}</a></p>
    <p style="margin:0;font-size:15px;"><strong>${esc(c.sig)}</strong></p>`;
  const text = [lead, ...(code ? ["", `${c.code}: ${code}`] : []), "", shopUrl, "", c.club, `${siteUrl()}/glow-club`, "", c.sig, "", foot.text].join("\n");
  return sendEmail({
    to,
    subject: c.subject,
    html: frame(locale, c.title, inner, foot.html),
    text,
    replyTo: BRAND.email,
    headers: listUnsubscribeHeaders(unsubscribeToken),
  });
}

// ---------------------------------------------------------------------------
// Glow Club birthday reward
// ---------------------------------------------------------------------------

const BDAY = {
  en: {
    subject: "Happy birthday from CMAC Beauty — 15% off, on us",
    title: "Happy birthday.",
    lead: (n: string | null) =>
      `${n ? `${n}, a` : "A"} little something from the Glow Club: 15% off one order. The code works once and is also saved in your account.`,
    code: "Your birthday code",
    expires: (d: string) => `Valid until ${d}.`,
    cta: "Treat yourself",
  },
  fr: {
    subject: "Joyeux anniversaire de CMAC Beauty — 15 % de rabais, offert",
    title: "Joyeux anniversaire.",
    lead: (n: string | null) =>
      `${n ? `${n}, un` : "Un"} petit quelque chose du Glow Club : 15 % de rabais sur une commande. Le code fonctionne une fois et est aussi enregistré dans votre compte.`,
    code: "Votre code d'anniversaire",
    expires: (d: string) => `Valide jusqu'au ${d}.`,
    cta: "Se faire plaisir",
  },
} as const;

/** Birthday email. Skipped when the CASL mailing address isn't configured (code stays visible in the account). */
export async function sendBirthdayReward(
  to: string,
  locale: Locale,
  name: string | null,
  code: string,
  expiresLabel: string,
): Promise<boolean> {
  if (!mailingAddress()) return false;
  const c = BDAY[locale];
  const foot = caslFooter(locale, null);
  const shopUrl = `${siteUrl()}/shop?utm_source=glow-club&utm_medium=email&utm_campaign=birthday`;
  const inner = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${C.soft};">${esc(c.lead(name))}</p>
    ${card(c.code, `<p style="margin:0 0 6px;font-family:Menlo,Consolas,monospace;font-size:22px;letter-spacing:0.12em;">${esc(code)}</p><p style="margin:0;font-size:13px;color:${C.faint};">${esc(c.expires(expiresLabel))}</p>`)}
    <p style="margin:0;">${btn(shopUrl, c.cta)}</p>`;
  const text = [c.lead(name), "", `${c.code}: ${code}`, c.expires(expiresLabel), "", shopUrl, "", foot.text].join("\n");
  return sendEmail({ to, subject: c.subject, html: frame(locale, c.title, inner, foot.html), text, replyTo: BRAND.email });
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export type CampaignProduct = {
  slug: string;
  nameEn: string;
  nameFr: string;
  priceCents: number;
  image: string | null;
};

export type CampaignContent = {
  id: string;
  subjectEn: string;
  subjectFr: string;
  preheaderEn: string | null;
  preheaderFr: string | null;
  bodyEn: string;
  bodyFr: string;
  products: CampaignProduct[];
};

export type Recipient = { email: string; locale: Locale; unsubscribeToken: string };

function utm(url: string, campaignId: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=newsletter&utm_medium=email&utm_campaign=${encodeURIComponent(campaignId)}`;
}

function productCards(products: CampaignProduct[], locale: Locale, campaignId: string): { html: string; text: string } {
  if (!products.length) return { html: "", text: "" };
  const cells = products.map((p) => {
    const name = locale === "fr" ? p.nameFr : p.nameEn;
    const href = utm(`${siteUrl()}/shop/${p.slug}`, campaignId);
    const img = p.image
      ? `<img src="${esc(p.image)}" alt="${esc(name)}" width="240" style="display:block;width:100%;height:auto;border-radius:14px;background:${C.cream};">`
      : "";
    return `<td width="50%" valign="top" style="padding:6px;">
      <a href="${esc(href)}" style="text-decoration:none;color:${C.ink};">
        ${img}
        <p style="margin:10px 0 2px;font-family:Georgia,serif;font-size:15px;line-height:1.3;">${esc(name)}</p>
        <p style="margin:0;font-size:14px;font-weight:600;color:${C.terra};">${esc(formatMoneyFromCents(p.priceCents, locale))}</p>
      </a></td>`;
  });
  const rows: string[] = [];
  for (let i = 0; i < cells.length; i += 2) rows.push(`<tr>${cells[i]}${cells[i + 1] ?? `<td width="50%"></td>`}</tr>`);
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px;">${rows.join("")}</table>`;
  const text = products
    .map((p) => `${locale === "fr" ? p.nameFr : p.nameEn} — ${formatMoneyFromCents(p.priceCents, locale)}\n${utm(`${siteUrl()}/shop/${p.slug}`, campaignId)}`)
    .join("\n\n");
  return { html, text };
}

/** Renders one personalised campaign email. */
export function renderCampaign(c: CampaignContent, r: Recipient) {
  const fr = r.locale === "fr";
  const subject = fr ? c.subjectFr : c.subjectEn;
  const preheader = (fr ? c.preheaderFr : c.preheaderEn) || undefined;
  const body = fr ? c.bodyFr : c.bodyEn;
  const prods = productCards(c.products, r.locale, c.id);
  const foot = caslFooter(r.locale, r.unsubscribeToken);
  const inner = `${markdownToHtml(body)}${prods.html}`;
  const html = frame(r.locale, subject, inner, foot.html, preheader);
  const text = [markdownToText(body), prods.text, foot.text].filter(Boolean).join("\n\n");
  return { subject, html, text, headers: listUnsubscribeHeaders(r.unsubscribeToken) };
}

/** Why campaigns can't be sent right now (null = ready). */
export function campaignBlocker(): string | null {
  if (!emailConfigured()) return "RESEND_API_KEY is not set — sending is disabled until Resend is configured.";
  if (!mailingAddress())
    return "BUSINESS_MAILING_ADDRESS is not set. CASL requires a valid postal address in every marketing email — add it in Vercel → Settings → Environment Variables, then redeploy.";
  return null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Sends a campaign through Resend's batch API in chunks of ≤ 100, pausing
 * between requests to stay under the default 2 requests / second limit, with
 * a short back-off on 429.
 */
export async function sendCampaignBatches(
  c: CampaignContent,
  recipients: Recipient[],
): Promise<{ sent: number; failed: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);
    const payload = chunk.map((r) => {
      const m = renderCampaign(c, r);
      return { from: emailFrom(), to: r.email, subject: m.subject, html: m.html, text: m.text, reply_to: BRAND.email, headers: m.headers };
    });
    if (!apiKey) {
      payload.forEach((p) => logUnsent({ to: p.to, subject: p.subject, text: p.text }));
      failed += chunk.length;
      continue;
    }
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      try {
        const res = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) ok = true;
        else if (res.status === 429) await sleep(1500 * (attempt + 1));
        else {
          console.error(`[campaign] Resend batch ${res.status}: ${await res.text()}`);
          break;
        }
      } catch (err) {
        console.error("[campaign] batch failed", err);
        await sleep(1000);
      }
    }
    if (ok) sent += chunk.length;
    else failed += chunk.length;
    if (i + 100 < recipients.length) await sleep(600);
  }
  return { sent, failed };
}

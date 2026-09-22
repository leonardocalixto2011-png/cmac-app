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
import { emailFrom, frame, logUnsent, sendEmail } from "./email";
import { emailConfigured, mailingAddress } from "./integrations";
import { markdownToHtml, markdownToText } from "./markdown";
import { prisma } from "./prisma";
import { HOME_SETS, SET_TAG } from "./sets";
import { C, SANS, SERIF, emailImage, esc } from "./email-kit";
import { marketingFooter, renderBirthday, renderConfirmRequest, renderWelcome, type CardProduct } from "./email-templates";
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

/** CASL footer (HTML + text). Newsletter token → unsubscribe link; null → member (profile link). */
function caslFooter(locale: Locale, unsubscribeToken: string | null): { html: string; text: string } {
  return unsubscribeToken
    ? marketingFooter({ locale, kind: "newsletter", mailingAddress: mailingAddress(), unsubscribeUrl: unsubscribeUrl(unsubscribeToken) })
    : marketingFooter({ locale, kind: "member", mailingAddress: mailingAddress() });
}

// ---------------------------------------------------------------------------
// Double opt-in request (not promotional: identifies the sender, asks to confirm)
// ---------------------------------------------------------------------------

export async function sendConfirmRequest(to: string, locale: Locale, confirmToken: string): Promise<boolean> {
  const confirmUrl = `${siteUrl()}/newsletter/confirm?token=${encodeURIComponent(confirmToken)}`;
  const m = renderConfirmRequest({ locale, confirmUrl, mailingAddress: mailingAddress() });
  return sendEmail({ to, subject: m.subject, html: m.html, text: m.text, replyTo: BRAND.email });
}

// ---------------------------------------------------------------------------
// Welcome (after confirmation) — WELCOME10
// ---------------------------------------------------------------------------

/** Three "where to begin" cards: the first two homepage sets, then the first single product. */
export async function welcomeProducts(locale: Locale): Promise<CardProduct[]> {
  try {
    const rows = await prisma.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
    const sets = HOME_SETS.map((slug) => rows.find((r) => r.slug === slug)).filter((r): r is (typeof rows)[number] => Boolean(r));
    const single = rows.find((r) => !r.tags.includes(SET_TAG));
    return [...sets.slice(0, 2), ...(single ? [single] : [])].map((r) => ({
      slug: r.slug,
      name: locale === "fr" ? r.nameFr : r.nameEn,
      priceCents: r.priceCents,
      compareAtCents: r.compareAtCents,
      image: Array.isArray(r.images) ? ((r.images as string[])[0] ?? null) : null,
      isSet: r.tags.includes(SET_TAG),
    }));
  } catch (err) {
    console.error("[marketing] product cards lookup failed", err);
    return [];
  }
}

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
  const m = renderWelcome({
    locale,
    code,
    products: await welcomeProducts(locale),
    unsubscribeUrl: unsubscribeUrl(unsubscribeToken),
    mailingAddress: mailingAddress(),
  });
  return sendEmail({
    to,
    subject: m.subject,
    html: m.html,
    text: m.text,
    replyTo: BRAND.email,
    headers: listUnsubscribeHeaders(unsubscribeToken),
  });
}

// ---------------------------------------------------------------------------
// Glow Club birthday reward
// ---------------------------------------------------------------------------

/** Birthday email. Skipped when the CASL mailing address isn't configured (code stays visible in the account). */
export async function sendBirthdayReward(
  to: string,
  locale: Locale,
  name: string | null,
  code: string,
  expiresLabel: string,
): Promise<boolean> {
  if (!mailingAddress()) return false;
  const m = renderBirthday({ locale, name, code, expiresLabel, mailingAddress: mailingAddress() });
  return sendEmail({ to, subject: m.subject, html: m.html, text: m.text, replyTo: BRAND.email });
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
      ? `<img src="${esc(emailImage(p.image, 480, 600) ?? p.image)}" alt="${esc(name)}" width="240" style="display:block;width:100%;height:auto;border-radius:16px;background:${C.cream};border:1px solid ${C.line};">`
      : "";
    return `<td width="50%" valign="top" style="padding:6px;">
      <a href="${esc(href)}" style="text-decoration:none;color:${C.ink};">
        ${img}
        <p style="margin:10px 0 2px;font-family:${SERIF};font-size:16px;line-height:1.3;color:${C.ink};">${esc(name)}</p>
        <p style="margin:0;font-family:${SANS};font-size:14px;font-weight:600;color:${C.ink};">${esc(formatMoneyFromCents(p.priceCents, locale))}</p>
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

/**
 * Transactional email for CMAC Beauty. Uses Resend (REST) when RESEND_API_KEY
 * is set. Without it, nothing is sent: in development the full message is
 * logged to the console (so links can be followed); in production only the
 * recipient + subject are logged (never tokens / reset links).
 *
 * This file resolves data (DB lookups) and sends; the look lives in
 * ./email-kit.ts and the copy in ./email-templates.ts (pure, previewable with
 * `npx tsx scripts/render-email-previews.ts`).
 *
 * Customer emails (EN/FR per order / account locale): order confirmation,
 * shipping/tracking notice, account welcome, password reset, Glow Club reward
 * code. Owner emails: new order, contact-form forward. Marketing email
 * (newsletter opt-in, welcome, birthday, campaigns) lives in ./marketing.ts.
 */
import type { Locale } from "@/i18n/messages";
import { BRAND } from "./brand";
import { prisma } from "./prisma";
import { orderItems, type ShippingAddress } from "./shop";
import { SET_CONTENTS } from "./sets";
import { TIERS, merchandiseCents, pointsFor, tierFor } from "./loyalty-rules";
import { C, SANS, esc, eyebrow, h1, layout, panel, transactionalFooter } from "./email-kit";
import {
  renderAccountWelcome,
  renderOrderConfirmation,
  renderOwnerOrder,
  renderPasswordReset,
  renderRewardCode,
  renderShipped,
  type ItemView,
  type LoyaltyView,
  type OrderView,
  type OwnerOrderView,
} from "./email-templates";

export { C, esc } from "./email-kit";

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

export type SendInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

export function emailFrom(): string {
  return process.env.EMAIL_FROM || `${BRAND.name} <onboarding@resend.dev>`;
}

/** Logs an unsent email: full body in dev only (links / tokens never reach production logs). */
export function logUnsent(input: Pick<SendInput, "to" | "subject" | "text">): void {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[email:dev] to=${input.to} subject="${input.subject}"\n${input.text}`);
  } else {
    console.info(`[email] not configured (RESEND_API_KEY unset) — skipped "${input.subject}"`);
  }
}

/** Sends one email. Returns true when Resend accepted it. */
export async function sendEmail(input: SendInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logUnsent(input);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: emailFrom(),
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo,
        headers: input.headers,
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend responded ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}

/** Where owner notifications go. Falls back to the admin login email. */
export function ownerNotifyAddress(): string | null {
  return process.env.OWNER_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || null;
}

// ---------------------------------------------------------------------------
// Legacy shell helpers (campaigns, contact forward)
// ---------------------------------------------------------------------------

/** Titled panel. */
export function card(title: string, inner: string): string {
  return panel(`${eyebrow(title)}${inner}`, { bg: C.cream, margin: "0 0 18px" });
}

/** Branded email shell. `footerHtml` replaces the default footer (marketing emails pass the CASL footer). */
export function frame(locale: Locale, title: string, inner: string, footerHtml?: string, preheader?: string): string {
  return layout({
    locale,
    title,
    preheader,
    body: `${h1(title)}<div style="font-family:${SANS};font-size:15px;line-height:1.7;color:${C.soft};">${inner}</div>`,
    footer: footerHtml ?? transactionalFooter(locale).html,
  });
}

// ---------------------------------------------------------------------------
// Data resolution
// ---------------------------------------------------------------------------

export type OrderEmailData = {
  reference: string;
  locale: Locale;
  contactEmail: string;
  contactName: string | null;
  items: unknown;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingJson: unknown;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  /** Promotion code typed at checkout (display only). */
  promoCode?: string | null;
};

type ProductInfo = { nameEn: string; nameFr: string; image: string | null; supplierSku: string | null; shippingNote: string | null };

async function productInfo(slugs: string[]): Promise<Map<string, ProductInfo>> {
  const unique = [...new Set(slugs)];
  if (!unique.length) return new Map();
  try {
    const rows = await prisma.product.findMany({
      where: { slug: { in: unique } },
      select: { slug: true, nameEn: true, nameFr: true, images: true, supplierSku: true, shippingNote: true },
    });
    return new Map(
      rows.map((r) => [
        r.slug,
        {
          nameEn: r.nameEn,
          nameFr: r.nameFr,
          image: Array.isArray(r.images) ? ((r.images as string[])[0] ?? null) : null,
          supplierSku: r.supplierSku,
          shippingNote: r.shippingNote,
        },
      ]),
    );
  } catch (err) {
    console.error("[email] product lookup failed", err);
    return new Map();
  }
}

function allSlugs(items: ReturnType<typeof orderItems>): string[] {
  return items.flatMap((i) => [i.slug, ...(SET_CONTENTS[i.slug] ?? []).map((c) => c.slug)]);
}

function itemViews(d: OrderEmailData, products: Map<string, ProductInfo>): ItemView[] {
  const isFr = d.locale === "fr";
  return orderItems(d.items).map((i) => ({
    slug: i.slug,
    name: isFr ? i.nameFr : i.nameEn,
    options: Object.values((isFr ? i.options : i.optionsEn) ?? {}),
    qty: i.qty,
    unitCents: i.priceCents,
    image: products.get(i.slug)?.image ?? null,
    components: (SET_CONTENTS[i.slug] ?? []).flatMap((c) => {
      const p = products.get(c.slug);
      return p ? [{ slug: c.slug, name: isFr ? p.nameFr : p.nameEn, qty: c.qty, image: p.image }] : [];
    }),
  }));
}

/** Item rows (names, options, photos, set contents) for an order's items, in the given language. */
export async function orderItemViews(items: ReturnType<typeof orderItems>, locale: Locale): Promise<ItemView[]> {
  const products = await productInfo(allSlugs(items));
  return itemViews({ locale, items } as OrderEmailData, products);
}

/** Address lines for display: name, street, "City, QC  H2X 1Y4", Canada (+ phone for the owner). */
function addressLines(raw: unknown, withPhone: boolean): string[] {
  const s = raw as ShippingAddress | null | undefined;
  if (!s?.address) return [];
  const a = s.address;
  const country = a.country === "CA" ? "Canada" : a.country;
  return [s.name, a.line1, a.line2, [[a.city, a.state].filter(Boolean).join(", "), a.postal_code].filter(Boolean).join("  "), country, withPhone ? s.phone : null]
    .filter((x): x is string => Boolean(x && String(x).trim()))
    .map(String);
}

async function orderRow(reference: string) {
  try {
    return await prisma.order.findUnique({
      where: { reference },
      include: { customer: true, loyaltyEntries: { where: { reason: "ORDER_CREDIT" } } },
    });
  } catch (err) {
    console.error("[email] order lookup failed", err);
    return null;
  }
}

async function buildOrderView(d: OrderEmailData): Promise<{ view: OrderView; row: Awaited<ReturnType<typeof orderRow>>; products: Map<string, ProductInfo> }> {
  const items = orderItems(d.items);
  const [products, row] = await Promise.all([productInfo(allSlugs(items)), orderRow(d.reference)]);
  const discountCents = row?.discountCents ?? 0;
  let loyalty: LoyaltyView = null;
  if (row?.customer?.userId) {
    loyalty = {
      kind: "member",
      earned: row.loyaltyEntries[0]?.points ?? 0,
      balance: row.customer.points,
      tier: tierFor(row.customer.lifetimeSpendCents).id,
    };
  } else if (row) {
    // Guest: orders with this email attach to the account on sign-up and are credited then.
    loyalty = { kind: "guest", points: pointsFor(merchandiseCents(d.subtotalCents, discountCents), TIERS[0]) };
  }
  const view: OrderView = {
    locale: d.locale,
    reference: d.reference,
    placedAt: row?.createdAt ?? new Date(),
    name: d.contactName,
    email: d.contactEmail,
    items: itemViews(d, products),
    subtotalCents: d.subtotalCents,
    discountCents,
    promoCode: d.promoCode ?? null,
    shippingCents: d.shippingCents,
    totalCents: d.totalCents,
    address: addressLines(d.shippingJson, false),
    loyalty,
    trackingNumber: d.trackingNumber ?? null,
    trackingUrl: d.trackingUrl ?? null,
  };
  return { view, row, products };
}

// ---------------------------------------------------------------------------
// Order emails (customer)
// ---------------------------------------------------------------------------

export async function sendOrderConfirmation(d: OrderEmailData): Promise<void> {
  const { view } = await buildOrderView(d);
  const m = renderOrderConfirmation(view);
  await sendEmail({ to: d.contactEmail, subject: m.subject, html: m.html, text: m.text, replyTo: BRAND.email });
}

export async function sendShippingNotice(d: OrderEmailData): Promise<void> {
  const { view } = await buildOrderView(d);
  const m = renderShipped(view);
  await sendEmail({ to: d.contactEmail, subject: m.subject, html: m.html, text: m.text, replyTo: BRAND.email });
}

// ---------------------------------------------------------------------------
// Owner notifications
// ---------------------------------------------------------------------------

export async function sendOwnerOrderNotice(d: OrderEmailData): Promise<void> {
  const to = ownerNotifyAddress();
  if (!to) return;
  const items = orderItems(d.items);
  const [products, row] = await Promise.all([productInfo(allSlugs(items)), orderRow(d.reference)]);
  const view: OwnerOrderView = {
    reference: d.reference,
    placedAt: row?.createdAt ?? new Date(),
    name: d.contactName,
    email: d.contactEmail,
    locale: d.locale,
    items: items.map((i) => {
      const p = products.get(i.slug);
      return {
        name: i.nameEn,
        options: Object.values(i.optionsEn ?? {}),
        qty: i.qty,
        unitCents: i.priceCents,
        sku: p?.supplierSku ?? null,
        note: p?.shippingNote ?? null,
        components: (SET_CONTENTS[i.slug] ?? []).map((c) => ({
          name: products.get(c.slug)?.nameEn ?? c.slug,
          qty: c.qty,
          variant: c.variant,
        })),
      };
    }),
    subtotalCents: d.subtotalCents,
    discountCents: row?.discountCents ?? 0,
    promoCode: d.promoCode ?? null,
    shippingCents: d.shippingCents,
    totalCents: d.totalCents,
    address: addressLines(d.shippingJson, true),
    member: Boolean(row?.customer?.userId),
    pointsEarned: row?.customer?.userId ? (row.loyaltyEntries[0]?.points ?? 0) : null,
  };
  const m = renderOwnerOrder(view);
  await sendEmail({ to, subject: m.subject, html: m.html, text: m.text, replyTo: d.contactEmail });
}

export async function sendContactForward(m: { name: string; email: string; message: string; locale: Locale }): Promise<void> {
  const to = ownerNotifyAddress();
  if (!to) return;
  const subject = `Contact form · ${m.name}`;
  const inner = `
    ${card("From", `<p style="margin:0;font-size:14px;line-height:1.6;">${esc(m.name)}<br><a href="mailto:${esc(m.email)}" style="color:${C.terraDeep};">${esc(m.email)}</a><br>Locale: ${m.locale}</p>`)}
    ${card("Message", `<p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(m.message)}</p>`)}
    <p style="margin:0;font-size:13px;color:${C.faint};">Reply directly to this email to answer.</p>`;
  const text = [subject, "", `${m.name} <${m.email}> (${m.locale})`, "", m.message].join("\n");
  await sendEmail({ to, subject, html: frame("en", "New message", inner), text, replyTo: m.email });
}

// ---------------------------------------------------------------------------
// Accounts (customer)
// ---------------------------------------------------------------------------

export async function sendPasswordReset(to: string, locale: Locale, url: string): Promise<boolean> {
  const m = renderPasswordReset({ locale, url });
  return sendEmail({ to, subject: m.subject, html: m.html, text: m.text, replyTo: BRAND.email });
}

/** Sent once on registration (transactional: account created; no marketing codes). */
export async function sendAccountWelcome(
  to: string,
  locale: Locale,
  data: { name: string | null; creditedPoints: number; hasBirthday: boolean },
): Promise<boolean> {
  const m = renderAccountWelcome({ locale, ...data });
  return sendEmail({ to, subject: m.subject, html: m.html, text: m.text, replyTo: BRAND.email });
}

/** Sent when a member redeems points for a reward code (the code is also shown in /account). */
export async function sendRewardCode(
  to: string,
  locale: Locale,
  data: { name: string | null; code: string; amountOffCents: number; pointsSpent: number; balance: number },
): Promise<boolean> {
  const m = renderRewardCode({ locale, ...data });
  return sendEmail({ to, subject: m.subject, html: m.html, text: m.text, replyTo: BRAND.email });
}

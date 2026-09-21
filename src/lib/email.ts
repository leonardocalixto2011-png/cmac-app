/**
 * Transactional email for CMAC Beauty. Uses Resend (REST) when RESEND_API_KEY
 * is set; otherwise logs to the server console so flows work end-to-end in dev.
 *
 * Customer emails are bilingual (per order locale): order confirmation and
 * shipping/tracking notice. Owner emails: new order, contact-form forward.
 */
import type { Locale } from "@/i18n/messages";
import { BRAND, SHIPPING, POLICY, siteUrl } from "./brand";
import { formatMoneyFromCents } from "./utils";
import { orderItems, setRecipes, shippingLines } from "./shop";

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

type SendInput = { to: string | string[]; subject: string; html: string; text: string; replyTo?: string };

export async function sendEmail(input: SendInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || `${BRAND.name} <onboarding@resend.dev>`;
  if (!apiKey) {
    console.info(`[email:dev] to=${input.to} subject="${input.subject}"\n${input.text}`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo,
      }),
    });
    if (!res.ok) console.error(`[email] Resend responded ${res.status}: ${await res.text()}`);
  } catch (err) {
    console.error("[email] send failed", err);
  }
}

/** Where owner notifications go. Falls back to the admin login email. */
export function ownerNotifyAddress(): string | null {
  return process.env.OWNER_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || null;
}

// ---------------------------------------------------------------------------
// Shared HTML bits
// ---------------------------------------------------------------------------

const C = { cream: "#F5F1EA", ink: "#1F2422", soft: "#3B423F", faint: "#8A908D", terra: "#C97B63", sage: "#4A5D4E", line: "#E3DDD2", white: "#FFFDF9" };

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function row(label: string, value: string, strong = false): string {
  return `<tr>
    <td style="padding:7px 0;color:${C.faint};font-size:14px;vertical-align:top;">${esc(label)}</td>
    <td style="padding:7px 0 7px 16px;color:${strong ? C.terra : C.ink};font-size:14px;text-align:right;${strong ? "font-weight:600;" : ""}">${value}</td>
  </tr>`;
}

function card(title: string, inner: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border:1px solid ${C.line};border-radius:18px;background:${C.white};">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${C.terra};font-family:Arial,Helvetica,sans-serif;font-weight:600;">${esc(title)}</p>
      ${inner}
    </td></tr>
  </table>`;
}

function frame(locale: Locale, title: string, inner: string): string {
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:24px 12px;background:${C.cream};font-family:Arial,Helvetica,sans-serif;color:${C.ink};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
  <tr><td style="padding:0 0 14px;font-family:Georgia,serif;font-size:20px;font-weight:600;">CMAC <span style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${C.sage};margin-left:6px;">Beauty</span></td></tr>
  <tr><td style="padding:0 0 16px;font-size:26px;font-family:Georgia,serif;line-height:1.15;">${esc(title)}</td></tr>
  <tr><td>${inner}</td></tr>
  <tr><td style="padding:18px 4px 0;font-size:12px;color:${C.faint};line-height:1.5;">${esc(BRAND.name)} · ${esc(BRAND.area)} · <a href="mailto:${BRAND.email}" style="color:${C.terra};">${BRAND.email}</a></td></tr>
</table></body></html>`;
}

// ---------------------------------------------------------------------------
// Order emails (customer)
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
};

const COPY = {
  en: {
    confirmSubject: (ref: string) => `Order confirmed — ${ref}`,
    confirmTitle: "Your order is in.",
    hello: (n: string | null) => (n ? `Hi ${n},` : "Hi,"),
    confirmLead: `Thanks for your order. We're getting it ready — you'll receive a tracking number by email as soon as it ships. It usually leaves our supplier within ${SHIPPING.processingDays.min} to ${SHIPPING.processingDays.max} business days and arrives about ${SHIPPING.totalWeeks.min} to ${SHIPPING.totalWeeks.max} weeks after your order.`,
    items: "Your order",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    total: "Total",
    reference: "Reference",
    shipTo: "Shipping to",
    returns: `Returns: ${POLICY.returnDays} days on unused items in original packaging (hygiene items unopened). ${POLICY.warrantyMonths}-month coverage against manufacturing defects. Reply to this email for anything.`,
    shipSubject: (ref: string) => `Your order is on its way — ${ref}`,
    shipTitle: "Your parcel has shipped.",
    shipLead: `Good news — your order left the warehouse. Track it with the number below. Delivery usually takes ${SHIPPING.deliveryWeeks.min} to ${SHIPPING.deliveryWeeks.max} weeks; tracking can take a day or two to update.`,
    tracking: "Tracking number",
    track: "Track my parcel",
    seeYou: "Talk soon,",
    sig: "The CMAC team",
  },
  fr: {
    confirmSubject: (ref: string) => `Commande confirmée — ${ref}`,
    confirmTitle: "Votre commande est enregistrée.",
    hello: (n: string | null) => (n ? `Bonjour ${n},` : "Bonjour,"),
    confirmLead: `Merci pour votre commande. On la prépare — vous recevrez un numéro de suivi par courriel dès son expédition. Elle quitte généralement notre fournisseur en ${SHIPPING.processingDays.min} à ${SHIPPING.processingDays.max} jours ouvrables et arrive environ ${SHIPPING.totalWeeks.min} à ${SHIPPING.totalWeeks.max} semaines après votre commande.`,
    items: "Votre commande",
    subtotal: "Sous-total",
    shipping: "Livraison",
    free: "Gratuite",
    total: "Total",
    reference: "Référence",
    shipTo: "Livraison à",
    returns: `Retours : ${POLICY.returnDays} jours pour les articles inutilisés dans leur emballage d'origine (articles d'hygiène non ouverts). Garantie de ${POLICY.warrantyMonths} mois contre les défauts de fabrication. Répondez à ce courriel pour toute question.`,
    shipSubject: (ref: string) => `Votre commande est en route — ${ref}`,
    shipTitle: "Votre colis est expédié.",
    shipLead: `Bonne nouvelle — votre commande a quitté l'entrepôt. Suivez-la avec le numéro ci-dessous. La livraison prend généralement de ${SHIPPING.deliveryWeeks.min} à ${SHIPPING.deliveryWeeks.max} semaines ; le suivi peut prendre un jour ou deux avant de s'activer.`,
    tracking: "Numéro de suivi",
    track: "Suivre mon colis",
    seeYou: "À bientôt,",
    sig: "L'équipe CMAC",
  },
} as const;

function itemsTable(d: OrderEmailData): { html: string; text: string[] } {
  const money = (n: number) => formatMoneyFromCents(n, d.locale);
  const items = orderItems(d.items);
  const c = COPY[d.locale];
  const rows = items
    .map((i) => {
      const name = d.locale === "fr" ? i.nameFr : i.nameEn;
      const opts = Object.values((d.locale === "fr" ? i.options : i.optionsEn) ?? {});
      const optHtml = opts.length ? ` <span style="color:${C.faint};">(${esc(opts.join(", "))})</span>` : "";
      return row(`${i.qty} × ${name}`, `${money(i.priceCents * i.qty)}${optHtml}`);
    })
    .join("");
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${rows}
    ${row(c.subtotal, money(d.subtotalCents))}
    ${row(c.shipping, d.shippingCents === 0 ? c.free : money(d.shippingCents))}
    ${row(c.total, `<strong>${money(d.totalCents)}</strong>`, true)}
    ${row(c.reference, `<span style="font-family:Menlo,Consolas,monospace;font-size:12px;">${esc(d.reference.slice(-8).toUpperCase())}</span>`)}
  </table>`;
  const text = [
    ...items.map((i) => {
      const name = d.locale === "fr" ? i.nameFr : i.nameEn;
      const opts = Object.values((d.locale === "fr" ? i.options : i.optionsEn) ?? {});
      return `${i.qty} × ${name}${opts.length ? ` (${opts.join(", ")})` : ""} — ${money(i.priceCents * i.qty)}`;
    }),
    `${c.subtotal}: ${money(d.subtotalCents)}`,
    `${c.shipping}: ${d.shippingCents === 0 ? c.free : money(d.shippingCents)}`,
    `${c.total}: ${money(d.totalCents)}`,
    `${c.reference}: ${d.reference.slice(-8).toUpperCase()}`,
  ];
  return { html, text };
}

export async function sendOrderConfirmation(d: OrderEmailData): Promise<void> {
  const c = COPY[d.locale];
  const ref = d.reference.slice(-8).toUpperCase();
  const table = itemsTable(d);
  const addr = shippingLines(d.shippingJson);
  const inner = `
    <p style="margin:0 0 10px;font-size:15px;">${esc(c.hello(d.contactName))}</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${C.soft};">${esc(c.confirmLead)}</p>
    ${card(c.items, table.html)}
    ${addr.length ? card(c.shipTo, `<p style="margin:0;font-size:14px;line-height:1.6;">${addr.map(esc).join("<br>")}</p>`) : ""}
    <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:${C.faint};">${esc(c.returns)}</p>
    <p style="margin:0;font-size:15px;">${esc(c.seeYou)}<br><strong>${esc(c.sig)}</strong></p>`;
  const text = [c.hello(d.contactName), "", c.confirmLead, "", ...table.text, "", ...(addr.length ? [c.shipTo + ":", ...addr, ""] : []), c.returns, "", c.seeYou, c.sig].join("\n");
  await sendEmail({ to: d.contactEmail, subject: c.confirmSubject(ref), html: frame(d.locale, c.confirmTitle, inner), text, replyTo: BRAND.email });
}

export async function sendShippingNotice(d: OrderEmailData): Promise<void> {
  const c = COPY[d.locale];
  const ref = d.reference.slice(-8).toUpperCase();
  const table = itemsTable(d);
  const tracking = d.trackingNumber ?? "";
  const trackHtml = `
    <p style="margin:0 0 6px;font-size:13px;color:${C.faint};">${esc(c.tracking)}</p>
    <p style="margin:0 0 14px;font-family:Menlo,Consolas,monospace;font-size:16px;">${esc(tracking)}</p>
    ${d.trackingUrl ? `<a href="${esc(d.trackingUrl)}" style="display:inline-block;padding:11px 20px;border-radius:999px;background:${C.ink};color:#fff;text-decoration:none;font-size:13px;font-weight:600;">${esc(c.track)} →</a>` : ""}`;
  const inner = `
    <p style="margin:0 0 10px;font-size:15px;">${esc(c.hello(d.contactName))}</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${C.soft};">${esc(c.shipLead)}</p>
    ${card(c.tracking, trackHtml)}
    ${card(c.items, table.html)}
    <p style="margin:0;font-size:15px;">${esc(c.seeYou)}<br><strong>${esc(c.sig)}</strong></p>`;
  const text = [c.hello(d.contactName), "", c.shipLead, "", `${c.tracking}: ${tracking}`, d.trackingUrl ?? "", "", ...table.text, "", c.seeYou, c.sig].join("\n");
  await sendEmail({ to: d.contactEmail, subject: c.shipSubject(ref), html: frame(d.locale, c.shipTitle, inner), text, replyTo: BRAND.email });
}

// ---------------------------------------------------------------------------
// Owner notifications
// ---------------------------------------------------------------------------

export async function sendOwnerOrderNotice(d: OrderEmailData): Promise<void> {
  const to = ownerNotifyAddress();
  if (!to) return;
  const money = (n: number) => formatMoneyFromCents(n, "en");
  const ref = d.reference.slice(-8).toUpperCase();
  const table = itemsTable({ ...d, locale: "en" });
  const addr = shippingLines(d.shippingJson);
  const subject = `New order · ${money(d.totalCents)} · ${ref}`;
  // Sets: show the CJ recipe so the owner knows which components to order.
  const recipes = await setRecipes(orderItems(d.items).map((i) => i.slug)).catch(() => new Map<string, string>());
  const recipeRows = orderItems(d.items).flatMap((i) => {
    const r = recipes.get(i.slug);
    return r ? [{ label: `${i.qty} × ${i.nameEn}`, recipe: r }] : [];
  });
  const recipeHtml = recipeRows
    .map((x) => `<p style="margin:0 0 10px;font-size:13px;line-height:1.55;"><strong>${esc(x.label)}</strong><br>${esc(x.recipe)}</p>`)
    .join("");
  const inner = `
    ${card("Order", table.html)}
    ${recipeRows.length ? card("Set contents to order on CJ", recipeHtml) : ""}
    ${card("Customer", `<p style="margin:0;font-size:14px;line-height:1.6;">${esc(d.contactName ?? "—")}<br><a href="mailto:${esc(d.contactEmail)}" style="color:${C.terra};">${esc(d.contactEmail)}</a><br>Locale: ${d.locale}</p>`)}
    ${addr.length ? card("Ship to", `<p style="margin:0;font-size:14px;line-height:1.6;">${addr.map(esc).join("<br>")}</p>`) : ""}
    <p style="margin:0;"><a href="${siteUrl()}/admin/orders" style="display:inline-block;padding:10px 18px;border-radius:999px;background:${C.ink};color:#fff;text-decoration:none;font-size:13px;font-weight:600;">Open in admin → place the supplier order</a></p>`;
  const text = [
    subject,
    "",
    ...table.text,
    ...(recipeRows.length ? ["", "SET CONTENTS TO ORDER ON CJ:", ...recipeRows.map((x) => `${x.label}: ${x.recipe}`)] : []),
    "",
    `Customer: ${d.contactName ?? "—"} <${d.contactEmail}> (${d.locale})`, ...addr, "", `${siteUrl()}/admin/orders`].join("\n");
  await sendEmail({ to, subject, html: frame("en", "New order", inner), text, replyTo: d.contactEmail });
}

export async function sendContactForward(m: { name: string; email: string; message: string; locale: Locale }): Promise<void> {
  const to = ownerNotifyAddress();
  if (!to) return;
  const subject = `Contact form · ${m.name}`;
  const inner = `
    ${card("From", `<p style="margin:0;font-size:14px;line-height:1.6;">${esc(m.name)}<br><a href="mailto:${esc(m.email)}" style="color:${C.terra};">${esc(m.email)}</a><br>Locale: ${m.locale}</p>`)}
    ${card("Message", `<p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(m.message)}</p>`)}
    <p style="margin:0;font-size:13px;color:${C.faint};">Reply directly to this email to answer.</p>`;
  const text = [subject, "", `${m.name} <${m.email}> (${m.locale})`, "", m.message].join("\n");
  await sendEmail({ to, subject, html: frame("en", "New message", inner), text, replyTo: m.email });
}

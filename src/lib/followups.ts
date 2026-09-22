/**
 * Daily follow-up emails (run by /api/cron/daily):
 *
 * 1. Checkout reminder: a PENDING order whose buyer ticked the cart consent box
 *    and typed their email, left 3 h to 3 days ago, never paid (no later paid
 *    order with that email), not unsubscribed. One reminder per cart, linking to
 *    /cart?restore=<reference> which rebuilds the cart on any device.
 * 2. Review request: a FULFILLED order shipped 21 to 60 days ago, never asked
 *    before, customer hasn't opted out. Links to /review/<token>.
 *
 * Both are commercial messages (CASL): skipped while BUSINESS_MAILING_ADDRESS
 * or Resend isn't configured, so nothing is marked "sent" by mistake.
 */
import type { Locale } from "@/i18n/messages";
import { BRAND, SHIPPING, siteUrl } from "./brand";
import { orderItemViews, sendEmail } from "./email";
import { emailConfigured, mailingAddress } from "./integrations";
import { prisma } from "./prisma";
import { orderItems } from "./shop";
import { randomToken } from "./tokens";
import { renderCheckoutReminder, renderReviewRequest } from "./email-templates";

const HOUR = 3600e3;
const DAY = 24 * HOUR;

const loc = (l: string): Locale => (l === "fr" ? "fr" : "en");

export function restoreUrl(reference: string): string {
  return `${siteUrl()}/cart?restore=${encodeURIComponent(reference)}&utm_source=email&utm_medium=email&utm_campaign=cart-reminder`;
}
export function reviewUrl(token: string, locale: Locale): string {
  return `${siteUrl()}/review/${encodeURIComponent(token)}?lang=${locale}`;
}

function blocker(): string | null {
  if (!emailConfigured()) return "RESEND_API_KEY not configured";
  if (!mailingAddress()) return "BUSINESS_MAILING_ADDRESS not configured";
  return null;
}

export async function runCheckoutReminders(now: Date = new Date()): Promise<{ sent: number; skipped?: string }> {
  const skip = blocker();
  if (skip) return { sent: 0, skipped: skip };
  const candidates = await prisma.order.findMany({
    where: {
      status: "PENDING",
      newsletterOptIn: true,
      contactEmail: { not: "" },
      recoveryEmailSentAt: null,
      createdAt: { gte: new Date(now.getTime() - 3 * DAY), lte: new Date(now.getTime() - 3 * HOUR) },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const seen = new Set<string>();
  let sent = 0;
  for (const o of candidates) {
    const email = o.contactEmail.toLowerCase();
    if (seen.has(email)) continue; // newest cart per person only
    seen.add(email);
    const [paidLater, unsub, remindedRecently] = await Promise.all([
      prisma.order.count({ where: { contactEmail: { equals: email, mode: "insensitive" }, status: { in: ["PAID", "FULFILLED"] }, createdAt: { gte: o.createdAt } } }),
      prisma.subscriber.count({ where: { email, status: "UNSUBSCRIBED" } }),
      prisma.order.count({ where: { contactEmail: { equals: email, mode: "insensitive" }, recoveryEmailSentAt: { gte: new Date(now.getTime() - 7 * DAY) } } }),
    ]);
    // Claim first so overlapping runs can't double-send.
    const claim = await prisma.order.updateMany({ where: { id: o.id, recoveryEmailSentAt: null }, data: { recoveryEmailSentAt: now } });
    if (claim.count !== 1 || paidLater || unsub || remindedRecently) continue;
    const locale = loc(o.locale);
    const items = await orderItemViews(orderItems(o.items), locale);
    const m = renderCheckoutReminder({
      locale,
      items,
      restoreUrl: restoreUrl(o.reference),
      mailingAddress: mailingAddress(),
      freeShippingCents: SHIPPING.freeThresholdCents,
      subtotalCents: o.subtotalCents,
    });
    const ok = await sendEmail({
      to: o.contactEmail,
      subject: m.subject,
      html: m.html,
      text: m.text,
      replyTo: BRAND.email,
      headers: { "List-Unsubscribe": `<mailto:${BRAND.email}?subject=unsubscribe>` },
    });
    if (ok) sent++;
  }
  return { sent };
}

export async function runReviewRequests(now: Date = new Date()): Promise<{ sent: number; skipped?: string }> {
  const skip = blocker();
  if (skip) return { sent: 0, skipped: skip };
  const due = await prisma.order.findMany({
    where: {
      status: "FULFILLED",
      reviewRequestSentAt: null,
      fulfilledAt: { gte: new Date(now.getTime() - 60 * DAY), lte: new Date(now.getTime() - 21 * DAY) },
      contactEmail: { not: "" },
      OR: [{ customerId: null }, { customer: { reviewEmailsOptOut: false } }],
    },
    orderBy: { fulfilledAt: "asc" },
    take: 100,
  });
  let sent = 0;
  for (const o of due) {
    const token = o.reviewToken ?? randomToken(18);
    const claim = await prisma.order.updateMany({
      where: { id: o.id, reviewRequestSentAt: null },
      data: { reviewRequestSentAt: now, reviewToken: token },
    });
    if (claim.count !== 1) continue;
    const locale = loc(o.locale);
    const items = await orderItemViews(orderItems(o.items), locale);
    const m = renderReviewRequest({
      locale,
      name: o.contactName,
      reference: o.reference,
      items,
      reviewUrl: reviewUrl(token, locale),
      stopUrl: `${reviewUrl(token, locale)}&stop=1`,
      mailingAddress: mailingAddress(),
    });
    const ok = await sendEmail({ to: o.contactEmail, subject: m.subject, html: m.html, text: m.text, replyTo: BRAND.email });
    if (ok) sent++;
  }
  return { sent };
}

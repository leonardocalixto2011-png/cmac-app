/**
 * Newsletter subscriptions — CASL double opt-in (server-only).
 *
 * subscribe → PENDING + consent snapshot (when / where / exact wording shown)
 *           → confirmation email → /newsletter/confirm → CONFIRMED → welcome
 *           email with WELCOME10. Unsubscribe is one click (token), any time.
 */
import { prisma } from "./prisma";
import { isValidEmail } from "./utils";
import { randomToken } from "./tokens";
import { sendConfirmRequest, sendWelcome } from "./marketing";
import { emailConfigured } from "./integrations";
import { ensureWelcomeCode } from "./stripe-coupons";
import { BRAND } from "./brand";
import { translate, type Locale } from "@/i18n/messages";

export const CONSENT_SOURCES = ["footer", "popup", "register", "checkout", "account"] as const;
export type ConsentSource = (typeof CONSENT_SOURCES)[number];

/** The exact consent wording shown next to every signup form (stored as a snapshot). */
export function consentText(locale: Locale): string {
  return translate(locale, "consent.newsletter", { email: BRAND.email });
}

export type SubscribeOutcome = "pending" | "pending_no_email" | "already" | "invalid" | "error";

/**
 * Records consent and sends the confirmation email. Existing CONFIRMED
 * subscribers are left alone ("already"); PENDING / UNSUBSCRIBED get a fresh
 * consent record + a new confirmation link.
 */
export async function subscribeEmail(rawEmail: string, locale: Locale, source: ConsentSource): Promise<SubscribeOutcome> {
  const email = String(rawEmail ?? "").trim().toLowerCase();
  if (!isValidEmail(email) || email.length > 200) return "invalid";
  try {
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing?.status === "CONFIRMED") return "already";
    const confirmToken = randomToken();
    const consent = {
      status: "PENDING" as const,
      locale,
      consentAt: new Date(),
      consentSource: source,
      consentText: consentText(locale),
      confirmToken,
      confirmedAt: null,
      unsubscribedAt: null,
    };
    await prisma.subscriber.upsert({
      where: { email },
      create: { email, unsubscribeToken: randomToken(), ...consent },
      update: consent,
    });
    const sent = await sendConfirmRequest(email, locale, confirmToken);
    if (!emailConfigured()) return "pending_no_email";
    return sent ? "pending" : "error";
  } catch (err) {
    console.error("[newsletter] subscribe failed", err);
    return "error";
  }
}

export type ConfirmOutcome =
  | { ok: true; code: string | null; alreadyConfirmed: boolean }
  | { ok: false };

/** Confirms a PENDING subscription (idempotent) and sends the welcome email once. */
export async function confirmSubscription(token: string): Promise<ConfirmOutcome> {
  if (!token || token.length > 200) return { ok: false };
  const sub = await prisma.subscriber.findUnique({ where: { confirmToken: token } });
  if (!sub || sub.status === "UNSUBSCRIBED") return { ok: false };
  const code = await ensureWelcomeCode();
  if (sub.status === "CONFIRMED") return { ok: true, code, alreadyConfirmed: true };
  // Conditional update: only the first confirmation sends the welcome email.
  const res = await prisma.subscriber.updateMany({
    where: { id: sub.id, status: "PENDING" },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });
  if (res.count === 1) {
    const locale: Locale = sub.locale === "fr" ? "fr" : "en";
    await sendWelcome(sub.email, locale, sub.unsubscribeToken, code).catch((err) =>
      console.error("[newsletter] welcome email failed", err),
    );
  }
  return { ok: true, code, alreadyConfirmed: res.count !== 1 };
}

/** Looks up a subscriber by unsubscribe token (for the unsubscribe page). */
export async function findByUnsubscribeToken(token: string) {
  if (!token || token.length > 200) return null;
  return prisma.subscriber.findUnique({ where: { unsubscribeToken: token } });
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const sub = await findByUnsubscribeToken(token);
  if (!sub) return false;
  if (sub.status !== "UNSUBSCRIBED") {
    await prisma.subscriber.update({
      where: { id: sub.id },
      data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date(), confirmToken: null },
    });
  }
  return true;
}

export async function unsubscribeByEmail(email: string): Promise<void> {
  await prisma.subscriber.updateMany({
    where: { email: email.toLowerCase(), status: { not: "UNSUBSCRIBED" } },
    data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date(), confirmToken: null },
  });
}

export async function subscriberStatus(email: string) {
  const sub = await prisma.subscriber.findUnique({ where: { email: email.toLowerCase() }, select: { status: true } });
  return sub?.status ?? null;
}

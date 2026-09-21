"use server";

import { normalizeLocale } from "@/i18n/messages";
import { CONSENT_SOURCES, confirmSubscription, subscribeEmail, unsubscribeByToken, type ConsentSource } from "@/lib/newsletter";
import { LIMITS, rateLimit, requestIp } from "@/lib/rate-limit";

export type SubscribeResult = "pending" | "pending_no_email" | "already" | "invalid" | "error" | "limited";

/**
 * Newsletter signup (footer / popup). CASL double opt-in: stores the consent
 * snapshot as PENDING and emails a confirmation link. Throttled per email + IP.
 */
export async function subscribe(rawEmail: string, rawLocale: string, rawSource: string = "footer"): Promise<SubscribeResult> {
  const locale = normalizeLocale(rawLocale);
  const source: ConsentSource = (CONSENT_SOURCES as readonly string[]).includes(rawSource)
    ? (rawSource as ConsentSource)
    : "footer";
  const email = String(rawEmail ?? "").trim().toLowerCase();
  const [okIp, okEmail] = await Promise.all([
    rateLimit(`sub:ip:${await requestIp()}`, LIMITS.subscribeIp),
    rateLimit(`sub:e:${email}`, LIMITS.subscribeEmail),
  ]);
  if (!okIp || !okEmail) return "limited";
  return subscribeEmail(email, locale, source);
}

/** Called by the confirm page from the browser, so link scanners can't confirm on someone's behalf. */
export async function confirmNewsletter(token: string) {
  return confirmSubscription(String(token ?? ""));
}

export async function unsubscribeNewsletter(token: string): Promise<boolean> {
  return unsubscribeByToken(String(token ?? ""));
}

/**
 * Gift card rules. Pure, so the form, the server and the tests share them.
 *
 * Québec's Consumer Protection Act treats a gift card as a prepaid card (s. 187.1 ff.):
 * no expiry date, no fee to issue or use it, the conditions and the way to check the
 * balance are given before the sale, and a balance of $5 or less is refunded on request.
 * The page, the emails and these constants all follow from that.
 */

/** Fixed amounts. The top one covers the biggest set, and a cap limits stolen-card losses. */
export const GIFT_CARD_AMOUNTS = [2500, 5000, 7500, 10000, 15000, 20000] as const;
export const GIFT_CARD_DEFAULT_CENTS = 5000;
export const GIFT_CARD_REFUND_FLOOR_CENTS = 500;
export const GIFT_CARD_MAX = { name: 60, message: 300 } as const;

/** 9 a.m. in Montréal in winter, just before the daily cron (vercel.json, 14:00 UTC). */
const SEND_TIME_UTC = "T13:00:00Z";
const MAX_DAYS_AHEAD = 366;

export function isGiftCardAmount(cents: number): boolean {
  return (GIFT_CARD_AMOUNTS as readonly number[]).includes(cents);
}

export function isGiftCardCode(code: string): boolean {
  return /^CADEAU-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code);
}

/** A picked day → when to send. Nothing picked, or a day already reached, means now. */
export function parseSendDay(day: string | undefined, now: Date = new Date()): { ok: true; sendAt: Date | null } | { ok: false } {
  if (!day) return { ok: true, sendAt: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return { ok: false };
  const sendAt = new Date(`${day}${SEND_TIME_UTC}`);
  if (Number.isNaN(sendAt.getTime()) || sendAt.getTime() > now.getTime() + MAX_DAYS_AHEAD * 864e5) return { ok: false };
  return { ok: true, sendAt: sendAt > now ? sendAt : null };
}

/** One line of typed text: no line breaks, no control characters, capped. */
export function cleanLine(value: string | undefined, max: number = GIFT_CARD_MAX.name): string {
  return (value ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max);
}

/** The buyer's message: keeps line breaks, nothing else invisible. */
export function cleanMessage(value: string | undefined): string {
  return (value ?? "").replace(/\r\n/g, "\n").replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, " ").trim().slice(0, GIFT_CARD_MAX.message);
}

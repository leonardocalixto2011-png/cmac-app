/**
 * Signed, expiring tokens (password reset) + random tokens (newsletter).
 *
 * Reset token = base64url("<userId>.<expiresAtMs>") + "." + HMAC-SHA256 over
 * userId, expiry and the user's CURRENT password hash, keyed with AUTH_SECRET.
 * Stateless, 1 h expiry, and single-use: once the password changes, the hash
 * changes and every earlier link stops verifying.
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function b64url(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}

function sign(payload: string, passwordHash: string, secret: string): string {
  return createHmac("sha256", secret).update(`${payload}|${passwordHash}`).digest("base64url");
}

export function createResetToken(
  userId: string,
  passwordHash: string,
  secret: string,
  now: number = Date.now(),
): string {
  const payload = `${userId}.${now + RESET_TOKEN_TTL_MS}`;
  return `${b64url(payload)}.${sign(payload, passwordHash, secret)}`;
}

/** Reads the user id + expiry without trusting them (signature is checked in verifyResetToken). */
export function parseResetToken(token: string): { userId: string; expiresAt: number } | null {
  const [p] = String(token ?? "").split(".");
  if (!p) return null;
  let payload: string;
  try {
    payload = Buffer.from(p, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const dot = payload.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = payload.slice(0, dot);
  const expiresAt = Number(payload.slice(dot + 1));
  if (!userId || !Number.isFinite(expiresAt)) return null;
  return { userId, expiresAt };
}

export type ResetCheck = "ok" | "malformed" | "expired" | "bad_signature";

export function verifyResetToken(
  token: string,
  passwordHash: string,
  secret: string,
  now: number = Date.now(),
): ResetCheck {
  const parsed = parseResetToken(token);
  const sig = String(token ?? "").split(".")[1];
  if (!parsed || !sig) return "malformed";
  const expected = sign(`${parsed.userId}.${parsed.expiresAt}`, passwordHash, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "bad_signature";
  if (now > parsed.expiresAt) return "expired";
  return "ok";
}

/** URL-safe random token (newsletter confirm / unsubscribe). */
export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}

/** GLOW-XXXX-XXXX style code (no ambiguous 0/O/1/I). */
export function rewardCode(prefix: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]);
  return `${prefix}-${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

export function authSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

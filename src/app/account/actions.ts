"use server";

import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/auth";
import { isValidEmail } from "@/lib/utils";
import { LIMITS, rateLimit, requestIp } from "@/lib/rate-limit";
import { authSecret, createResetToken, parseResetToken, verifyResetToken } from "@/lib/tokens";
import { creditPastOrders, redeemPoints, type RedeemResult } from "@/lib/loyalty";
import { subscribeEmail, unsubscribeByEmail } from "@/lib/newsletter";
import { sendAccountWelcome, sendPasswordReset, sendRewardCode } from "@/lib/email";
import { emailConfigured } from "@/lib/integrations";
import { POINTS_PER_REWARD, REWARD_VALUE_CENTS } from "@/lib/loyalty-rules";
import { siteUrl } from "@/lib/brand";
import { LOCALE_COOKIE, normalizeLocale } from "@/i18n/messages";

export type ActionResult = { ok: true } | { ok: false; error: string };

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 200;

function validBirthday(month: number | null, day: number | null): boolean {
  if (month == null && day == null) return true;
  if (month == null || day == null) return false;
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1) return false;
  const daysIn = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysIn[month - 1];
}

function toIntOrNull(v: unknown): number | null {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

/** Signed-in customer (User + Customer) for mutations, or null. */
async function me() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER") return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { customer: true } });
  if (!user?.email) return null;
  return user;
}

// ---------------------------------------------------------------------------
// Sign-up
// ---------------------------------------------------------------------------

export async function registerCustomer(input: {
  name: string;
  email: string;
  password: string;
  birthMonth: string | number | null;
  birthDay: string | number | null;
  newsletter: boolean;
  locale: string;
}): Promise<ActionResult> {
  const name = String(input.name ?? "").trim().slice(0, 120);
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  const locale = normalizeLocale(input.locale);
  const birthMonth = toIntOrNull(input.birthMonth);
  const birthDay = toIntOrNull(input.birthDay);

  if (!name) return { ok: false, error: "name" };
  if (!isValidEmail(email) || email.length > 200) return { ok: false, error: "email" };
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) return { ok: false, error: "password" };
  if (!validBirthday(birthMonth, birthDay)) return { ok: false, error: "birthday" };

  if (!(await rateLimit(`register:ip:${await requestIp()}`, LIMITS.registerIp))) return { ok: false, error: "limited" };

  const existingUser = await prisma.user.findUnique({ where: { email } });
  // Generic message: never reveal whether (or what kind of) account exists.
  if (existingUser) return { ok: false, error: "taken" };

  const passwordHash = await bcrypt.hash(password, 12);
  let customerId: string;
  try {
    customerId = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { name, email, role: "CUSTOMER", passwordHash } });
      const customer = await tx.customer.upsert({
        where: { email },
        create: { email, name, locale, userId: user.id, birthMonth, birthDay },
        update: { userId: user.id, name, locale, birthMonth, birthDay },
      });
      // Attach earlier guest orders placed with this email.
      // TODO(email-verification): attach only after the email is verified — today anyone who
      // signs up with an address sees that address's past guest orders (items/status, city only).
      await tx.order.updateMany({
        where: { contactEmail: { equals: email, mode: "insensitive" }, customerId: null },
        data: { customerId: customer.id },
      });
      return customer.id;
    });
  } catch (err) {
    console.error("[account] register failed", err);
    return { ok: false, error: "taken" };
  }

  const creditedPoints = await creditPastOrders(customerId).catch((err) => {
    console.error("[account] backfill credit failed", err);
    return 0;
  });
  await sendAccountWelcome(email, locale, { name, creditedPoints, hasBirthday: birthMonth != null && birthDay != null }).catch((err) =>
    console.error("[account] welcome email failed", err),
  );
  if (input.newsletter) await subscribeEmail(email, locale, "register").catch(() => {});
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export async function requestPasswordReset(rawEmail: string, rawLocale: string): Promise<ActionResult> {
  const email = String(rawEmail ?? "").trim().toLowerCase();
  const locale = normalizeLocale(rawLocale);
  if (!isValidEmail(email)) return { ok: false, error: "email" };
  const [okIp, okEmail] = await Promise.all([
    rateLimit(`reset:ip:${await requestIp()}`, LIMITS.resetIp),
    rateLimit(`reset:e:${email}`, LIMITS.resetEmail),
  ]);
  if (!okIp || !okEmail) return { ok: false, error: "limited" };

  const user = await prisma.user.findUnique({ where: { email }, include: { customer: true } });
  // Reset is for customer accounts only (the owner's admin login is managed by env + seed).
  const eligible = user?.passwordHash && user.role === "CUSTOMER";
  if (!emailConfigured()) {
    if (eligible && process.env.NODE_ENV !== "production") {
      const token = createResetToken(user.id, user.passwordHash!, authSecret());
      console.info(`[account:dev] password reset link for ${email}: ${siteUrl()}/account/reset?token=${token}`);
    }
    return { ok: false, error: "unavailable" };
  }
  if (eligible) {
    const token = createResetToken(user.id, user.passwordHash!, authSecret());
    const emailLocale = normalizeLocale(user.customer?.locale ?? locale);
    await sendPasswordReset(email, emailLocale, `${siteUrl()}/account/reset?token=${encodeURIComponent(token)}`);
  }
  return { ok: true }; // same answer whether or not the account exists
}

export async function resetPassword(token: string, newPassword: string): Promise<ActionResult> {
  const password = String(newPassword ?? "");
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) return { ok: false, error: "password" };
  if (!(await rateLimit(`reset:ip:${await requestIp()}`, LIMITS.resetIp))) return { ok: false, error: "limited" };
  const parsed = parseResetToken(token);
  if (!parsed) return { ok: false, error: "invalid" };
  const user = await prisma.user.findUnique({ where: { id: parsed.userId } });
  if (!user?.passwordHash || user.role !== "CUSTOMER") return { ok: false, error: "invalid" };
  if (verifyResetToken(token, user.passwordHash, authSecret()) !== "ok") return { ok: false, error: "invalid" };
  // Conditional on the old hash → the token can't be used twice, even concurrently.
  const res = await prisma.user.updateMany({
    where: { id: user.id, passwordHash: user.passwordHash },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });
  return res.count === 1 ? { ok: true } : { ok: false, error: "invalid" };
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function updateProfile(input: {
  name: string;
  birthMonth: string | number | null;
  birthDay: string | number | null;
  locale: string;
}): Promise<ActionResult> {
  const user = await me();
  if (!user?.customer) return { ok: false, error: "auth" };
  const name = String(input.name ?? "").trim().slice(0, 120);
  const birthMonth = toIntOrNull(input.birthMonth);
  const birthDay = toIntOrNull(input.birthDay);
  const locale = normalizeLocale(input.locale);
  if (!name) return { ok: false, error: "name" };
  if (!validBirthday(birthMonth, birthDay)) return { ok: false, error: "birthday" };
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name } }),
    prisma.customer.update({ where: { id: user.customer.id }, data: { name, birthMonth, birthDay, locale } }),
    prisma.subscriber.updateMany({ where: { email: user.email! }, data: { locale } }),
  ]);
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/account", "layout");
  return { ok: true };
}

export async function changePassword(current: string, next: string): Promise<ActionResult> {
  const user = await me();
  if (!user?.passwordHash) return { ok: false, error: "auth" };
  if (String(next ?? "").length < MIN_PASSWORD || String(next).length > MAX_PASSWORD) return { ok: false, error: "password" };
  if (!(await rateLimit(`login:e:${user.email}`, LIMITS.loginEmail))) return { ok: false, error: "limited" };
  if (!(await bcrypt.compare(String(current ?? ""), user.passwordHash))) return { ok: false, error: "currentPassword" };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { ok: true };
}

export async function setNewsletter(on: boolean, rawLocale: string): Promise<ActionResult> {
  const user = await me();
  if (!user?.email) return { ok: false, error: "auth" };
  if (on) {
    if (!(await rateLimit(`sub:e:${user.email}`, LIMITS.subscribeEmail))) return { ok: false, error: "limited" };
    const r = await subscribeEmail(user.email, normalizeLocale(user.customer?.locale ?? rawLocale), "account");
    if (r === "error" || r === "invalid") return { ok: false, error: "generic" };
  } else {
    await unsubscribeByEmail(user.email);
  }
  revalidatePath("/account/profile");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Glow Club
// ---------------------------------------------------------------------------

export async function redeemReward(units: number): Promise<RedeemResult | { ok: false; error: "limited" | "auth" }> {
  const user = await me();
  if (!user?.customer) return { ok: false, error: "auth" };
  if (!(await rateLimit(`redeem:${user.customer.id}`, LIMITS.redeem))) return { ok: false, error: "limited" };
  const res = await redeemPoints(user.customer.id, Number(units));
  if (res.ok && user.email) {
    const after = await prisma.customer.findUnique({ where: { id: user.customer.id }, select: { points: true } }).catch(() => null);
    const pointsSpent = (res.amountOffCents / REWARD_VALUE_CENTS) * POINTS_PER_REWARD;
    await sendRewardCode(user.email, normalizeLocale(user.customer.locale), {
      name: user.customer.name ?? user.name,
      code: res.code,
      amountOffCents: res.amountOffCents,
      pointsSpent,
      balance: after?.points ?? Math.max(0, user.customer.points - pointsSpent),
    }).catch((err) => console.error("[account] reward email failed", err));
  }
  revalidatePath("/account");
  return res;
}

// ---------------------------------------------------------------------------
// Sign out / delete (Law 25)
// ---------------------------------------------------------------------------

export async function customerSignOut() {
  await signOut({ redirectTo: "/" });
}

/** Stable, non-reversible stand-in for an email kept on anonymised orders. */
function anonymisedEmail(email: string): string {
  const h = createHash("sha256").update(`${authSecret()}:${email.toLowerCase()}`).digest("hex").slice(0, 24);
  return `deleted-${h}@anonymised.invalid`;
}

/**
 * Deletes the member's account (Québec Law 25 right to deletion):
 *  - orders are kept for accounting (7 years) but detached and anonymised:
 *    email replaced by a keyed hash, contact name removed;
 *  - the Customer row (points ledger + reward codes cascade) and the User are deleted;
 *  - the newsletter subscription is set to UNSUBSCRIBED.
 */
export async function deleteAccount(password: string): Promise<ActionResult> {
  const user = await me();
  if (!user?.passwordHash) return { ok: false, error: "auth" };
  if (!(await rateLimit(`login:e:${user.email}`, LIMITS.loginEmail))) return { ok: false, error: "limited" };
  if (!(await bcrypt.compare(String(password ?? ""), user.passwordHash))) return { ok: false, error: "currentPassword" };
  const email = user.email!.toLowerCase();
  const anon = anonymisedEmail(email);

  await prisma.$transaction(async (tx) => {
    const orderWhere = user.customer
      ? { OR: [{ customerId: user.customer.id }, { contactEmail: { equals: email, mode: "insensitive" as const } }] }
      : { contactEmail: { equals: email, mode: "insensitive" as const } };
    const orders = await tx.order.findMany({ where: orderWhere, select: { id: true, shippingJson: true } });
    for (const o of orders) {
      // Keep only what tax records need (province / postal code / country); drop name, street, phone.
      const a = (o.shippingJson as { address?: Record<string, unknown> } | null)?.address;
      const shippingJson = a ? { address: { city: a.city ?? null, state: a.state ?? null, postal_code: a.postal_code ?? null, country: a.country ?? null } } : undefined;
      await tx.order.update({
        where: { id: o.id },
        data: { customerId: null, contactEmail: anon, contactName: null, ...(shippingJson ? { shippingJson } : {}) },
      });
    }
    if (user.customer) await tx.customer.delete({ where: { id: user.customer.id } });
    await tx.user.delete({ where: { id: user.id } });
  });
  await unsubscribeByEmail(email);
  await signOut({ redirect: false });
  return { ok: true };
}

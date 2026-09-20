"use server";

import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/utils";
import { normalizeLocale } from "@/i18n/messages";

export type SubscribeResult = "ok" | "already" | "invalid" | "error";

/** Stores a newsletter email in the Subscriber table. No external service. */
export async function subscribe(rawEmail: string, rawLocale: string): Promise<SubscribeResult> {
  const email = String(rawEmail ?? "").trim().toLowerCase();
  if (!isValidEmail(email) || email.length > 200) return "invalid";
  const locale = normalizeLocale(rawLocale);
  try {
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing) return "already";
    await prisma.subscriber.create({ data: { email, locale } });
    return "ok";
  } catch (err) {
    console.error("[newsletter] subscribe failed", err);
    return "error";
  }
}

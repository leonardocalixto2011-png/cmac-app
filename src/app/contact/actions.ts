"use server";

import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/utils";
import { normalizeLocale } from "@/i18n/messages";
import { sendContactForward } from "@/lib/email";

export type ContactResult = "ok" | "invalid" | "error";

export async function sendContact(input: {
  name: string;
  email: string;
  message: string;
  locale: string;
  /** honeypot — must stay empty */
  website?: string;
}): Promise<ContactResult> {
  if (input.website) return "ok"; // bot: pretend success, store nothing
  const name = String(input.name ?? "").trim().slice(0, 120);
  const email = String(input.email ?? "").trim().toLowerCase();
  const message = String(input.message ?? "").trim().slice(0, 4000);
  if (!name || !message || !isValidEmail(email)) return "invalid";
  const locale = normalizeLocale(input.locale);
  try {
    await prisma.contactMessage.create({ data: { name, email, message, locale } });
    await sendContactForward({ name, email, message, locale });
    return "ok";
  } catch (err) {
    console.error("[contact] failed", err);
    return "error";
  }
}

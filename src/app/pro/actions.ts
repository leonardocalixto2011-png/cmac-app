"use server";

import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/utils";
import { normalizeLocale } from "@/i18n/messages";
import { sendContactForward } from "@/lib/email";

export type ProResult = "ok" | "invalid" | "error";

/**
 * Salon / clinic partner request. Stored with the contact messages (prefixed
 * so the admin sees it at a glance) and forwarded to the owner like a
 * contact-form message, with the reply-to set to the salon.
 */
export async function sendProRequest(input: {
  salon: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  locale: string;
  /** honeypot — must stay empty */
  website?: string;
}): Promise<ProResult> {
  if (input.website) return "ok";
  const salon = String(input.salon ?? "").trim().slice(0, 120);
  const name = String(input.name ?? "").trim().slice(0, 120);
  const email = String(input.email ?? "").trim().toLowerCase();
  const phone = String(input.phone ?? "").trim().slice(0, 40);
  const city = String(input.city ?? "").trim().slice(0, 80);
  const note = String(input.message ?? "").trim().slice(0, 2000);
  if (!salon || !name || !isValidEmail(email)) return "invalid";
  const locale = normalizeLocale(input.locale);
  const message = [`[PRO] ${salon}`, city ? `City: ${city}` : null, phone ? `Phone: ${phone}` : null, "", note || "(no message)"]
    .filter((l) => l !== null)
    .join("\n");
  try {
    await prisma.contactMessage.create({ data: { name: `${name} — ${salon}`, email, message, locale } });
    await sendContactForward({ name: `PRO · ${salon} (${name})`, email, message, locale });
    return "ok";
  } catch (err) {
    console.error("[pro] failed", err);
    return "error";
  }
}

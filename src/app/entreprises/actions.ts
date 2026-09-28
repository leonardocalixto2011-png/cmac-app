"use server";

import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/utils";
import { normalizeLocale } from "@/i18n/messages";
import { sendContactForward } from "@/lib/email";

export type CorpResult = "ok" | "invalid" | "error";

/**
 * Corporate gift request (teams, clients, events). Stored with the contact
 * messages, prefixed so the admin sees it, and forwarded to the owner with the
 * requester as reply-to.
 */
export async function sendCorpRequest(input: {
  company: string;
  name: string;
  email: string;
  phone: string;
  quantity: string;
  message: string;
  locale: string;
  /** honeypot — must stay empty */
  website?: string;
}): Promise<CorpResult> {
  if (input.website) return "ok";
  const company = String(input.company ?? "").trim().slice(0, 120);
  const name = String(input.name ?? "").trim().slice(0, 120);
  const email = String(input.email ?? "").trim().toLowerCase();
  const phone = String(input.phone ?? "").trim().slice(0, 40);
  const quantity = String(input.quantity ?? "").trim().slice(0, 20);
  const note = String(input.message ?? "").trim().slice(0, 2000);
  if (!company || !name || !isValidEmail(email)) return "invalid";
  const locale = normalizeLocale(input.locale);
  const message = [`[CORPORATE] ${company}`, quantity ? `Quantity: ${quantity}` : null, phone ? `Phone: ${phone}` : null, "", note || "(no message)"]
    .filter((l) => l !== null)
    .join("\n");
  try {
    await prisma.contactMessage.create({ data: { name: `${name} — ${company}`, email, message, locale } });
    await sendContactForward({ name: `CORPORATE · ${company} (${name})`, email, message, locale });
    return "ok";
  } catch (err) {
    console.error("[entreprises] failed", err);
    return "error";
  }
}

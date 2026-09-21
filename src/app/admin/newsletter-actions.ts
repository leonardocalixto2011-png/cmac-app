"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { campaignBlocker, renderCampaign, sendCampaignBatches, type CampaignContent, type Recipient } from "@/lib/marketing";
import { sendEmail } from "@/lib/email";
import { BRAND } from "@/lib/brand";
import { randomToken } from "@/lib/tokens";

export type CampaignInput = {
  subjectEn: string;
  subjectFr: string;
  preheaderEn: string;
  preheaderFr: string;
  bodyEn: string;
  bodyFr: string;
  productSlugs: string[];
};

export type CampaignActionResult = { ok: true; message: string } | { ok: false; error: string };

async function toContent(input: CampaignInput, id: string): Promise<CampaignContent> {
  const subjectEn = input.subjectEn.trim().slice(0, 150);
  const subjectFr = input.subjectFr.trim().slice(0, 150);
  const bodyEn = input.bodyEn.trim();
  const bodyFr = input.bodyFr.trim();
  if (!subjectEn || !subjectFr) throw new Error("Both subjects (EN + FR) are required.");
  if (!bodyEn || !bodyFr) throw new Error("Both bodies (EN + FR) are required — French subscribers must get French.");
  const slugs = [...new Set(input.productSlugs.map((s) => s.trim()).filter(Boolean))].slice(0, 4);
  const rows = slugs.length
    ? await prisma.product.findMany({ where: { slug: { in: slugs }, active: true } })
    : [];
  const products = slugs.flatMap((slug) => {
    const p = rows.find((r) => r.slug === slug);
    if (!p) return [];
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    return [{ slug: p.slug, nameEn: p.nameEn, nameFr: p.nameFr, priceCents: p.priceCents, image: images[0] ?? null }];
  });
  return {
    id,
    subjectEn,
    subjectFr,
    preheaderEn: input.preheaderEn.trim().slice(0, 150) || null,
    preheaderFr: input.preheaderFr.trim().slice(0, 150) || null,
    bodyEn,
    bodyFr,
    products,
  };
}

/** Sends the EN and FR versions to the admin's own address (the owner notify / admin email). */
export async function sendCampaignTest(input: CampaignInput): Promise<CampaignActionResult> {
  const session = await requireAdmin();
  const blocker = campaignBlocker();
  if (blocker) return { ok: false, error: blocker };
  const to = session.user.email || process.env.ADMIN_EMAIL;
  if (!to) return { ok: false, error: "No admin email to send the test to." };
  let content: CampaignContent;
  try {
    content = await toContent(input, "test");
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid campaign." };
  }
  const token = `test-${randomToken(8)}`; // not a real subscriber token: the unsubscribe link shows the "invalid" page
  const results = await Promise.all(
    (["en", "fr"] as const).map((locale) => {
      const m = renderCampaign(content, { email: to, locale, unsubscribeToken: token });
      return sendEmail({ to, subject: `[TEST ${locale.toUpperCase()}] ${m.subject}`, html: m.html, text: m.text, replyTo: BRAND.email, headers: m.headers });
    }),
  );
  return results.every(Boolean)
    ? { ok: true, message: `Test sent to ${to} (EN + FR).` }
    : { ok: false, error: "Resend refused the test email — check the server logs." };
}

/** Sends to every CONFIRMED subscriber, personalised with their unsubscribe token + language. */
export async function sendCampaignToAll(input: CampaignInput): Promise<CampaignActionResult> {
  await requireAdmin();
  const blocker = campaignBlocker();
  if (blocker) return { ok: false, error: blocker };

  const subs = await prisma.subscriber.findMany({
    where: { status: "CONFIRMED" },
    select: { email: true, locale: true, unsubscribeToken: true },
    orderBy: { createdAt: "asc" },
  });
  if (!subs.length) return { ok: false, error: "No confirmed subscribers yet." };

  let campaignId: string;
  let content: CampaignContent;
  try {
    const draft = await toContent(input, "draft");
    const row = await prisma.campaign.create({
      data: {
        subjectEn: draft.subjectEn,
        subjectFr: draft.subjectFr,
        preheaderEn: draft.preheaderEn,
        preheaderFr: draft.preheaderFr,
        bodyEn: draft.bodyEn,
        bodyFr: draft.bodyFr,
        productSlugs: draft.products.map((p) => p.slug),
        recipients: subs.length,
        status: "SENDING",
      },
    });
    campaignId = row.id;
    content = { ...draft, id: row.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid campaign." };
  }

  const recipients: Recipient[] = subs.map((s) => ({
    email: s.email,
    locale: s.locale === "fr" ? "fr" : "en",
    unsubscribeToken: s.unsubscribeToken,
  }));
  const { sent, failed } = await sendCampaignBatches(content, recipients);
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      sentCount: sent,
      failedCount: failed,
      status: failed === 0 ? "SENT" : sent === 0 ? "FAILED" : "PARTIAL",
      sentAt: new Date(),
    },
  });
  revalidatePath("/admin/newsletter");
  return failed === 0
    ? { ok: true, message: `Sent to ${sent} subscriber${sent === 1 ? "" : "s"}.` }
    : { ok: false, error: `Sent ${sent}, failed ${failed}. See the server logs for Resend's response.` };
}

"use server";

import { prisma } from "@/lib/prisma";
import { reviewContext } from "@/lib/reviews";
import { rateLimit, requestIp } from "@/lib/rate-limit";

export type ReviewResult = { ok: true } | { ok: false; error: "INVALID" | "NOT_FOUND" | "LIMIT" | "ERROR" };

/** Saves one review (PENDING until an admin approves it). One review per product per order; re-submitting edits it. */
export async function submitReview(input: {
  token: string;
  slug: string;
  rating: number;
  title: string;
  body: string;
  authorName: string;
  locale: string;
}): Promise<ReviewResult> {
  const ip = await requestIp();
  if (!(await rateLimit(`review:${ip}`, { limit: 20, windowMs: 60 * 60 * 1000 }))) return { ok: false, error: "LIMIT" };

  const rating = Math.round(Number(input.rating));
  const title = input.title.trim().slice(0, 120) || null;
  const body = input.body.trim().slice(0, 2000);
  const authorName = input.authorName.trim().slice(0, 40);
  if (!(rating >= 1 && rating <= 5) || body.length < 10 || !authorName) return { ok: false, error: "INVALID" };

  const ctx = await reviewContext(input.token);
  if (!ctx || !ctx.items.some((i) => i.slug === input.slug)) return { ok: false, error: "NOT_FOUND" };

  const locale = input.locale === "fr" ? "fr" : "en";
  try {
    await prisma.review.upsert({
      where: { orderId_productSlug: { orderId: ctx.order.id, productSlug: input.slug } },
      create: { orderId: ctx.order.id, productSlug: input.slug, rating, title, body, authorName, locale },
      // An edit goes back to moderation.
      update: { rating, title, body, authorName, locale, status: "PENDING", approvedAt: null },
    });
    return { ok: true };
  } catch (err) {
    console.error("[reviews] submit failed", err);
    return { ok: false, error: "ERROR" };
  }
}

/** "Stop review requests" link from the email footer. */
export async function stopReviewEmails(token: string): Promise<boolean> {
  const ctx = await reviewContext(token);
  if (!ctx?.order.customerId) return Boolean(ctx);
  await prisma.customer.update({ where: { id: ctx.order.customerId }, data: { reviewEmailsOptOut: true } });
  return true;
}

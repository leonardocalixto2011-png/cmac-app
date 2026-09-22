/**
 * Customer reviews. Only buyers can review: the form lives behind the
 * per-order token emailed ~3 weeks after shipping (see followups.ts), so every
 * review is tied to a real paid order ("Verified buyer"). Reviews are
 * published after an admin check that removes only abusive / off-topic
 * content: negative reviews are published too (Competition Act: no curated
 * or fake reviews). Products never show made-up ratings.
 */
import { prisma } from "./prisma";
import { orderItems } from "./shop";

export type PublicReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  locale: string;
  incentivized: boolean;
  createdAt: Date;
};

export type ReviewSummary = { count: number; average: number; reviews: PublicReview[] };

export async function productReviews(slug: string, take = 20): Promise<ReviewSummary> {
  const where = { productSlug: slug, status: "APPROVED" as const };
  const [agg, reviews] = await Promise.all([
    prisma.review.aggregate({ where, _avg: { rating: true }, _count: { _all: true } }),
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, rating: true, title: true, body: true, authorName: true, locale: true, incentivized: true, createdAt: true },
    }),
  ]);
  return { count: agg._count._all, average: Math.round((agg._avg.rating ?? 0) * 10) / 10, reviews };
}

/** Ratings for many products at once (product cards). */
export async function ratingsBySlug(slugs: string[]): Promise<Map<string, { count: number; average: number }>> {
  if (!slugs.length) return new Map();
  const rows = await prisma.review.groupBy({
    by: ["productSlug"],
    where: { productSlug: { in: slugs }, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.productSlug, { count: r._count._all, average: Math.round((r._avg.rating ?? 0) * 10) / 10 }]));
}

/** The order behind a review link, with its reviewable products (one per slug). */
export async function reviewContext(token: string) {
  if (!token || token.length > 64) return null;
  const order = await prisma.order.findUnique({
    where: { reviewToken: token },
    include: { reviews: { select: { productSlug: true, rating: true } }, customer: { select: { id: true, reviewEmailsOptOut: true } } },
  });
  if (!order || (order.status !== "FULFILLED" && order.status !== "PAID")) return null;
  const slugs = [...new Set(orderItems(order.items).map((i) => i.slug))];
  const products = await prisma.product.findMany({ where: { slug: { in: slugs } }, select: { slug: true, nameEn: true, nameFr: true, images: true } });
  const items = slugs.flatMap((slug) => {
    const p = products.find((x) => x.slug === slug);
    if (!p) return [];
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    return [{ slug, nameEn: p.nameEn, nameFr: p.nameFr, image: images[0] ?? null, done: order.reviews.some((r) => r.productSlug === slug) }];
  });
  return { order, items };
}

/** Suggested public name: "Camille B." */
export function suggestedAuthor(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
}

/**
 * Customer reviews. Only buyers can review: the form lives behind the
 * per-order token emailed ~3 weeks after shipping (see followups.ts), so every
 * review is tied to a real paid order ("Verified buyer"). Reviews are
 * published after an admin check that removes only abusive / off-topic
 * content: negative reviews are published too (Competition Act: no curated
 * or fake reviews). Products never show made-up ratings.
 */
import { unstable_cache } from "next/cache";
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

/** Invalidated when a review is moderated in /admin. */
export const REVIEWS_TAG = "reviews";

// Every approved review in one cached read, for the same reason as the catalogue in
// shop.ts: a product page must not wake the database. The cache stores JSON, so
// createdAt comes back as a string.
const approvedReviews = unstable_cache(
  () =>
    prisma.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      select: { id: true, productSlug: true, rating: true, title: true, body: true, authorName: true, locale: true, incentivized: true, createdAt: true },
    }),
  ["approved-reviews"],
  { revalidate: 86400, tags: [REVIEWS_TAG] },
);

function averageOf(rows: { rating: number }[]) {
  return rows.length ? Math.round((rows.reduce((sum, r) => sum + r.rating, 0) / rows.length) * 10) / 10 : 0;
}

export async function productReviews(slug: string, take = 20): Promise<ReviewSummary> {
  const rows = (await approvedReviews()).filter((r) => r.productSlug === slug);
  return {
    count: rows.length,
    average: averageOf(rows),
    reviews: rows.slice(0, take).map(({ productSlug: _slug, ...r }) => ({ ...r, createdAt: new Date(r.createdAt) })),
  };
}

/** Ratings for many products at once (product cards). */
export async function ratingsBySlug(slugs: string[]): Promise<Map<string, { count: number; average: number }>> {
  if (!slugs.length) return new Map();
  const rows = await approvedReviews();
  return new Map(
    slugs.flatMap((slug) => {
      const own = rows.filter((r) => r.productSlug === slug);
      return own.length ? [[slug, { count: own.length, average: averageOf(own) }] as const] : [];
    }),
  );
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

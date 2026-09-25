import { prisma } from "./prisma";
import { shippingCentsForTier, type Tier } from "./loyalty-rules";
import { SET_CONTENTS, SET_TAG } from "./sets";

export type ProductOptionValue = { value: string; labelFr: string; labelEn: string };
export type ProductOption = { nameFr: string; nameEn: string; values: ProductOptionValue[] };
/** Short muted supplier clip (Cloudinary mp4) + poster frame. */
export type ProductVideo = { mp4: string; poster: string };

export type ProductView = {
  slug: string;
  nameFr: string;
  nameEn: string;
  tagline: string | null;
  taglineFr: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  priceCents: number;
  compareAtCents: number | null;
  tags: string[];
  images: string[];
  videos: ProductVideo[];
  options: ProductOption[];
  active: boolean;
};

export const COLLECTIONS = ["gifts", "sets", "hair", "cozy", "glow", "sculpt", "cool", "essentials", "the-ritual"] as const;
export type CollectionHandle = (typeof COLLECTIONS)[number];

export function isCollectionHandle(h: string): h is CollectionHandle {
  return (COLLECTIONS as readonly string[]).includes(h);
}

function toView(p: {
  slug: string;
  nameFr: string;
  nameEn: string;
  tagline: string | null;
  taglineFr: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  priceCents: number;
  compareAtCents: number | null;
  tags: string[];
  images: unknown;
  videos?: unknown;
  options: unknown;
  active: boolean;
}): ProductView {
  return {
    slug: p.slug,
    nameFr: p.nameFr,
    nameEn: p.nameEn,
    tagline: p.tagline,
    taglineFr: p.taglineFr,
    descriptionFr: p.descriptionFr,
    descriptionEn: p.descriptionEn,
    priceCents: p.priceCents,
    compareAtCents: p.compareAtCents,
    tags: p.tags ?? [],
    images: Array.isArray(p.images) ? (p.images as string[]) : [],
    videos: Array.isArray(p.videos)
      ? (p.videos as ProductVideo[]).filter((v) => v && typeof v.mp4 === "string" && typeof v.poster === "string")
      : [],
    options: Array.isArray(p.options) ? (p.options as ProductOption[]) : [],
    active: p.active,
  };
}

export async function listProducts(collection?: CollectionHandle): Promise<ProductView[]> {
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      // "the-ritual" = every single product (bundles excluded); the others are tag-based.
      // "gifts" reads the singular "gift" tag used on products.
      ...(collection === "the-ritual"
        ? { NOT: { tags: { has: SET_TAG } } }
        : collection
          ? { tags: { has: collection === "gifts" ? "gift" : collection } }
          : {}),
    },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toView);
}

export async function getProduct(slug: string): Promise<ProductView | null> {
  const p = await prisma.product.findUnique({ where: { slug } });
  return p && p.active ? toView(p) : null;
}

export type SetComponentView = {
  slug: string;
  nameEn: string;
  nameFr: string;
  image: string | null;
  qty: number;
};

/** Components of a set (contents order) for the "What's inside" grid. Empty for non-sets. */
export async function getSetComponents(slug: string): Promise<SetComponentView[]> {
  const contents = SET_CONTENTS[slug];
  if (!contents?.length) return [];
  const rows = await prisma.product.findMany({ where: { slug: { in: contents.map((c) => c.slug) }, active: true } });
  return contents.flatMap((c) => {
    const r = rows.find((x) => x.slug === c.slug);
    if (!r) return [];
    const images = Array.isArray(r.images) ? (r.images as string[]) : [];
    return [{ slug: r.slug, nameEn: r.nameEn, nameFr: r.nameFr, image: images[0] ?? null, qty: c.qty }];
  });
}

/** Fulfilment recipes (shippingNote) of ordered items that are sets: slug → recipe. Owner-facing only. */
export async function setRecipes(slugs: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(slugs)];
  if (!unique.length) return new Map();
  const rows = await prisma.product.findMany({
    where: { slug: { in: unique }, tags: { has: SET_TAG } },
    select: { slug: true, shippingNote: true },
  });
  return new Map(rows.map((r) => [r.slug, r.shippingNote || "Set: see /admin/products for its contents."]));
}

export type CartLineInput = { slug: string; qty: number; selected: Record<string, string> };

export type ValidatedLine = {
  productId: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  priceCents: number;
  qty: number;
  options: Record<string, string>; // nameFr -> labelFr
  optionsEn: Record<string, string>; // nameEn -> labelEn
};

/**
 * Validate a client cart against the DB. Throws on any invalid line.
 * `tier` = the signed-in member's Glow Club tier, resolved server-side from the
 * session (never from the client); it lowers the free-shipping threshold.
 */
export async function validateCart(
  lines: CartLineInput[],
  opts: { tier?: Tier | null } = {},
): Promise<{
  lines: ValidatedLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}> {
  if (!lines.length) throw new Error("EMPTY_CART");
  const slugs = [...new Set(lines.map((l) => l.slug))];
  const products = await prisma.product.findMany({ where: { slug: { in: slugs }, active: true } });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const out: ValidatedLine[] = [];
  for (const line of lines) {
    const p = bySlug.get(line.slug);
    if (!p) throw new Error("PRODUCT_UNAVAILABLE");
    const qty = Math.max(1, Math.min(10, Math.round(line.qty)));
    const opts = Array.isArray(p.options) ? (p.options as ProductOption[]) : [];

    const options: Record<string, string> = {};
    const optionsEn: Record<string, string> = {};
    for (const opt of opts) {
      const chosen = line.selected?.[opt.nameEn];
      const match = opt.values.find((v) => v.value === chosen);
      if (!match) throw new Error("OPTION_REQUIRED");
      options[opt.nameFr] = match.labelFr;
      optionsEn[opt.nameEn] = match.labelEn;
    }

    out.push({
      productId: p.id,
      slug: p.slug,
      nameFr: p.nameFr,
      nameEn: p.nameEn,
      priceCents: p.priceCents,
      qty,
      options,
      optionsEn,
    });
  }

  const subtotalCents = out.reduce((s, l) => s + l.priceCents * l.qty, 0);
  const shippingCents = shippingCentsForTier(subtotalCents, opts.tier ?? null);
  return { lines: out, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

export async function getOrderByReference(reference: string) {
  return prisma.order.findUnique({ where: { reference } });
}

export type OrderItem = {
  productId: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  priceCents: number;
  qty: number;
  options?: Record<string, string>;
  optionsEn?: Record<string, string>;
  /** Cart selection (option nameEn -> value); lets /cart?restore= rebuild the line. */
  selected?: Record<string, string>;
  /** Gift with purchase: shipped, shown at $0, never restored into a cart. */
  gift?: boolean;
};

export function orderItems(raw: unknown): OrderItem[] {
  return Array.isArray(raw) ? (raw as OrderItem[]) : [];
}

export type ShippingAddress = {
  name?: string | null;
  phone?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

export function shippingLines(raw: unknown): string[] {
  const s = raw as ShippingAddress | null | undefined;
  if (!s?.address) return [];
  const a = s.address;
  return [
    s.name,
    a.line1,
    a.line2,
    [a.city, a.state, a.postal_code].filter(Boolean).join(", "),
    a.country,
    s.phone,
  ]
    .filter((x): x is string => Boolean(x))
    .map(String);
}

/**
 * Cart lines rebuilt from an UNPAID order (reminder email link), at today's
 * prices and with today's product data. Paid / refunded orders and lines whose
 * product or option no longer exists are skipped.
 */
export async function restoreCartLines(reference: string) {
  const order = await prisma.order.findUnique({ where: { reference } });
  if (!order || (order.status !== "PENDING" && order.status !== "CANCELLED")) return null;
  const lines = orderItems(order.items).filter((l) => !l.gift);
  const products = await prisma.product.findMany({ where: { slug: { in: lines.map((l) => l.slug) }, active: true } });
  const out = [];
  for (const l of lines) {
    const p = products.find((x) => x.slug === l.slug);
    if (!p) continue;
    const opts = Array.isArray(p.options) ? (p.options as ProductOption[]) : [];
    const selected = l.selected ?? {};
    const optionLabelsFr: Record<string, string> = {};
    const optionLabelsEn: Record<string, string> = {};
    let ok = true;
    for (const o of opts) {
      const v = o.values.find((x) => x.value === selected[o.nameEn]);
      if (!v) {
        ok = false;
        break;
      }
      optionLabelsFr[o.nameFr] = v.labelFr;
      optionLabelsEn[o.nameEn] = v.labelEn;
    }
    if (!ok) continue;
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    out.push({
      slug: p.slug,
      qty: Math.max(1, Math.min(10, l.qty)),
      selected,
      nameFr: p.nameFr,
      nameEn: p.nameEn,
      priceCents: p.priceCents,
      image: images[0] ?? null,
      tags: p.tags,
      optionLabelsFr,
      optionLabelsEn,
    });
  }
  return out.length ? out : null;
}

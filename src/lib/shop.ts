import { prisma } from "./prisma";
import { shippingCentsFor } from "./brand";

export type ProductOptionValue = { value: string; labelFr: string; labelEn: string };
export type ProductOption = { nameFr: string; nameEn: string; values: ProductOptionValue[] };

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
  options: ProductOption[];
  active: boolean;
};

export const COLLECTIONS = ["glow", "sculpt", "cool", "the-ritual"] as const;
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
    options: Array.isArray(p.options) ? (p.options as ProductOption[]) : [],
    active: p.active,
  };
}

export async function listProducts(collection?: CollectionHandle): Promise<ProductView[]> {
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      ...(collection && collection !== "the-ritual" ? { tags: { has: collection } } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toView);
}

export async function getProduct(slug: string): Promise<ProductView | null> {
  const p = await prisma.product.findUnique({ where: { slug } });
  return p && p.active ? toView(p) : null;
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

/** Validate a client cart against the DB. Throws on any invalid line. */
export async function validateCart(lines: CartLineInput[]): Promise<{
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
  const shippingCents = shippingCentsFor(subtotalCents);
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

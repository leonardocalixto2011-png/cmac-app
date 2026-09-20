"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "@/auth";
import { sendShippingNotice } from "@/lib/email";
import { normalizeLocale } from "@/i18n/messages";
import { slugify } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

const ORDER_STATUSES: OrderStatus[] = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"];

export async function adminSignOut() {
  await signOut({ redirectTo: "/admin/login" });
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export async function setOrderStatus(id: string, status: string) {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status as OrderStatus)) throw new Error("BAD_STATUS");
  await prisma.order.update({
    where: { id },
    data: {
      status: status as OrderStatus,
      fulfilledAt: status === "FULFILLED" ? new Date() : status === "PAID" ? null : undefined,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

/**
 * "Mark fulfilled": stores tracking + supplier order id, sets FULFILLED and
 * fulfilledAt, and emails the customer their tracking (EN/FR per order locale).
 */
export async function fulfilOrder(
  id: string,
  data: { trackingNumber: string; trackingUrl: string; supplierOrderId: string; notify: boolean },
) {
  await requireAdmin();
  const trackingNumber = data.trackingNumber.trim();
  if (!trackingNumber) throw new Error("TRACKING_REQUIRED");
  const trackingUrl = data.trackingUrl.trim() || null;
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) throw new Error("BAD_TRACKING_URL");

  const order = await prisma.order.update({
    where: { id },
    data: {
      status: "FULFILLED",
      fulfilledAt: new Date(),
      trackingNumber,
      trackingUrl,
      supplierOrderId: data.supplierOrderId.trim() || null,
    },
  });

  if (data.notify && order.contactEmail) {
    await sendShippingNotice({
      reference: order.reference,
      locale: normalizeLocale(order.locale),
      contactEmail: order.contactEmail,
      contactName: order.contactName,
      items: order.items,
      subtotalCents: order.subtotalCents,
      shippingCents: order.shippingCents,
      totalCents: order.totalCents,
      shippingJson: order.shippingJson,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export type ProductInput = {
  nameEn: string;
  nameFr: string;
  tagline: string;
  taglineFr: string;
  descriptionEn: string;
  descriptionFr: string;
  priceDollars: number;
  compareAtDollars: number | null;
  tagsCsv: string;
  imagesCsv: string;
  optionsJson: string;
  active: boolean;
  supplierUrl: string;
  supplierSku: string;
  shippingNote: string;
};

function parseProductInput(data: ProductInput) {
  const nameEn = data.nameEn.trim();
  const nameFr = data.nameFr.trim();
  if (!nameEn || !nameFr) throw new Error("NAME_REQUIRED");
  let options: unknown = [];
  const raw = data.optionsJson.trim();
  if (raw) {
    try {
      options = JSON.parse(raw);
    } catch {
      throw new Error("BAD_OPTIONS_JSON");
    }
    if (!Array.isArray(options)) throw new Error("BAD_OPTIONS_JSON");
  }
  const priceCents = Math.max(0, Math.round(Number(data.priceDollars) * 100));
  const compareAtCents =
    data.compareAtDollars != null && Number(data.compareAtDollars) > 0
      ? Math.round(Number(data.compareAtDollars) * 100)
      : null;
  return {
    nameEn,
    nameFr,
    tagline: data.tagline.trim() || null,
    taglineFr: data.taglineFr.trim() || null,
    descriptionEn: data.descriptionEn.trim() || null,
    descriptionFr: data.descriptionFr.trim() || null,
    priceCents,
    compareAtCents,
    tags: data.tagsCsv
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
    images: data.imagesCsv
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean),
    options: options as object,
    active: data.active,
    supplierUrl: data.supplierUrl.trim() || null,
    supplierSku: data.supplierSku.trim() || null,
    shippingNote: data.shippingNote.trim() || null,
  };
}

function revalidateShop() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/shop/[slug]", "page");
  revalidatePath("/collections/[handle]", "page");
  revalidatePath("/admin/products");
}

export async function createProduct(data: ProductInput) {
  await requireAdmin();
  const parsed = parseProductInput(data);
  const base = slugify(parsed.nameEn) || "product";
  let slug = base;
  for (let n = 2; await prisma.product.findUnique({ where: { slug } }); n++) slug = `${base}-${n}`;
  const count = await prisma.product.count();
  await prisma.product.create({ data: { ...parsed, slug, sortOrder: count } });
  revalidateShop();
}

export async function updateProduct(slug: string, data: ProductInput) {
  await requireAdmin();
  const parsed = parseProductInput(data);
  await prisma.product.update({ where: { slug }, data: parsed });
  revalidateShop();
}

export async function deleteProduct(slug: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { slug } });
  revalidateShop();
}

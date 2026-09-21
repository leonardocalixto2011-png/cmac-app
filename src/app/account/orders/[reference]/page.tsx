import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/account";
import { serverT } from "@/i18n/server";
import { orderItems } from "@/lib/shop";
import { OrderDetail } from "@/components/account/Orders";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ reference: string }> }): Promise<Metadata> {
  const { t } = await serverT();
  const { reference } = await params;
  return { title: t("acc.order", { ref: reference.slice(-8).toUpperCase() }) };
}

export default async function AccountOrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const { customer } = await requireMember(`/account/orders/${reference}`);
  const order = await prisma.order.findUnique({
    where: { reference },
    include: { loyaltyEntries: { where: { reason: "ORDER_CREDIT" }, select: { points: true } } },
  });
  // Ownership check: only the member's own orders (404 otherwise, no hint that it exists).
  if (!order || order.customerId !== customer.id || order.status === "PENDING") notFound();

  // Only the city / province are shown (not the full address) — see the email-verification TODO
  // in src/app/account/actions.ts (guest orders are attached by email at sign-up).
  const addr = (order.shippingJson as { address?: { city?: string | null; state?: string | null } } | null)?.address;
  const shipTo = [addr?.city, addr?.state].filter(Boolean).join(", ");

  return (
    <OrderDetail
      order={{
        reference: order.reference,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        items: orderItems(order.items).map((i) => ({
          slug: i.slug,
          nameEn: i.nameEn,
          nameFr: i.nameFr,
          qty: i.qty,
          priceCents: i.priceCents,
          optionsEn: Object.values(i.optionsEn ?? {}),
          optionsFr: Object.values(i.options ?? {}),
        })),
        subtotalCents: order.subtotalCents,
        discountCents: order.discountCents,
        shippingCents: order.shippingCents,
        totalCents: order.totalCents,
        trackingNumber: order.status === "FULFILLED" ? order.trackingNumber : null,
        trackingUrl: order.status === "FULFILLED" ? order.trackingUrl : null,
        shipTo,
        pointsEarned: order.loyaltyEntries[0]?.points ?? null,
      }}
    />
  );
}

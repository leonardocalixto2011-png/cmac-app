import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/account";
import { serverT } from "@/i18n/server";
import { orderItems } from "@/lib/shop";
import { OrdersList } from "@/components/account/Orders";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("acc.ordersPageTitle") };
}

export default async function AccountOrdersPage() {
  const { customer } = await requireMember("/account/orders");
  const orders = await prisma.order.findMany({
    where: { customerId: customer.id, status: { not: "PENDING" } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <OrdersList
      orders={orders.map((o) => ({
        reference: o.reference,
        status: o.status,
        totalCents: o.totalCents,
        createdAt: o.createdAt.toISOString(),
        count: orderItems(o.items).reduce((s, i) => s + i.qty, 0),
      }))}
    />
  );
}

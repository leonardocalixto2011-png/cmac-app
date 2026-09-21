import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/account";
import { serverT } from "@/i18n/server";
import { stripeConfigured } from "@/lib/stripe";
import { orderItems } from "@/lib/shop";
import { AccountDashboard } from "@/components/account/AccountDashboard";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("acc.eyebrow") };
}

export default async function AccountPage() {
  const { user, customer } = await requireMember("/account");
  const now = new Date();
  const [orders, codes, entries] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: customer.id, status: { not: "PENDING" } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.rewardCode.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.loyaltyEntry.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  return (
    <AccountDashboard
      name={customer.name ?? user.name ?? null}
      points={customer.points}
      lifetimeSpendCents={customer.lifetimeSpendCents}
      redeemEnabled={stripeConfigured()}
      orders={orders.map((o) => ({
        reference: o.reference,
        status: o.status,
        totalCents: o.totalCents,
        createdAt: o.createdAt.toISOString(),
        count: orderItems(o.items).reduce((s, i) => s + i.qty, 0),
      }))}
      codes={codes.map((c) => ({
        code: c.code,
        kind: c.kind,
        amountOffCents: c.amountOffCents,
        percentOff: c.percentOff,
        expiresAt: c.expiresAt?.toISOString() ?? null,
        redeemedAt: c.redeemedAt?.toISOString() ?? null,
        expired: c.expiresAt ? c.expiresAt < now : false,
      }))}
      entries={entries.map((e) => ({ id: e.id, points: e.points, reason: e.reason, createdAt: e.createdAt.toISOString() }))}
    />
  );
}

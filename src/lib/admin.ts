import { auth } from "@/auth";
import { prisma } from "./prisma";

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("UNAUTHORIZED");
  return session;
}

export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function dashboardData() {
  const since30 = new Date(Date.now() - 30 * 864e5);
  const [recent, paidCount, pendingFulfil, subscribers, messages, revenue30] = await Promise.all([
    prisma.order.findMany({ where: { status: { not: "PENDING" } }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.order.count({ where: { status: { in: ["PAID", "FULFILLED"] } } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.subscriber.count({ where: { status: "CONFIRMED" } }),
    prisma.contactMessage.count(),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { status: { in: ["PAID", "FULFILLED"] }, createdAt: { gte: since30 } },
    }),
  ]);
  return { recent, paidCount, pendingFulfil, subscribers, messages, revenue30Cents: revenue30._sum.totalCents ?? 0 };
}

export async function adminListOrders(filter: { status?: string } = {}) {
  const status = filter.status && filter.status !== "ALL" ? filter.status : undefined;
  return prisma.order.findMany({
    where: status ? { status: status as never } : { status: { not: "PENDING" } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function adminListProducts() {
  return prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function adminListSubscribers() {
  return prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
}

export async function adminListMessages() {
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
}

export async function adminListCustomers(q?: string) {
  const query = q?.trim();
  const customers = await prisma.customer.findMany({
    where: {
      userId: { not: null },
      ...(query
        ? { OR: [{ email: { contains: query, mode: "insensitive" } }, { name: { contains: query, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { _count: { select: { orders: { where: { status: { in: ["PAID", "FULFILLED"] } } } } } },
  });
  const subs = await prisma.subscriber.findMany({
    where: { email: { in: customers.map((c) => c.email) } },
    select: { email: true, status: true },
  });
  const subBy = new Map(subs.map((s) => [s.email, s.status]));
  return customers.map((c) => ({ ...c, orderCount: c._count.orders, newsletter: subBy.get(c.email) ?? null }));
}

export async function adminCustomerLedger(customerId: string) {
  return prisma.loyaltyEntry.findMany({ where: { customerId }, orderBy: { createdAt: "desc" }, take: 20 });
}

export async function newsletterStats() {
  const [grouped, campaigns] = await Promise.all([
    prisma.subscriber.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  const count = (s: string) => grouped.find((g) => g.status === s)?._count._all ?? 0;
  return {
    confirmed: count("CONFIRMED"),
    pending: count("PENDING"),
    unsubscribed: count("UNSUBSCRIBED"),
    campaigns,
  };
}

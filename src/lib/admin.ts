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
    prisma.subscriber.count(),
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

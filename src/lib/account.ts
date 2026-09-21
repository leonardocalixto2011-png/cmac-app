/**
 * Customer-account helpers (server-only). A Glow Club member is a Customer
 * row linked to an Auth.js User (role CUSTOMER).
 */
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "./prisma";
import { tierFor, type Tier } from "./loyalty-rules";

export const ACCOUNT_LOGIN = "/account/login";

/** Signed-in customer session or null (admins are not customers here). */
export async function customerSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER") return null;
  return session;
}

/**
 * The signed-in member: User + Customer (Customer created on the fly if a
 * legacy user has none). Redirects to the login page otherwise; admins go to /admin.
 */
export async function requireMember(from = "/account") {
  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect("/admin");
  if (!session?.user?.id) redirect(`${ACCOUNT_LOGIN}?from=${encodeURIComponent(from)}`);
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { customer: true } });
  if (!user || !user.email) redirect(`${ACCOUNT_LOGIN}?from=${encodeURIComponent(from)}`);
  let customer = user.customer;
  if (!customer) {
    customer = await prisma.customer.upsert({
      where: { email: user.email },
      create: { email: user.email, name: user.name, userId: user.id },
      update: { userId: user.id },
    });
  }
  return { user, customer };
}

/**
 * Tier of the signed-in member, for server-side shipping (checkout) and the
 * cart preview. null = guest (standard rules). Never trusts the client.
 */
export async function currentMemberTier(): Promise<{ tier: Tier; customerId: string; email: string } | null> {
  const session = await customerSession();
  if (!session) return null;
  const customer = await prisma.customer.findUnique({ where: { userId: session.user.id } });
  if (!customer) return null;
  return { tier: tierFor(customer.lifetimeSpendCents), customerId: customer.id, email: customer.email };
}

/** What the layout needs about the viewer (account icon label, popup suppression). */
export async function viewerInfo(): Promise<{ signedIn: boolean; subscribed: boolean }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { signedIn: false, subscribed: false };
    const email = session.user.email?.toLowerCase();
    const sub = email ? await prisma.subscriber.findUnique({ where: { email }, select: { status: true } }) : null;
    return { signedIn: true, subscribed: sub?.status === "CONFIRMED" || sub?.status === "PENDING" };
  } catch {
    return { signedIn: false, subscribed: false };
  }
}

/**
 * "Le Convoi" — shared dispatch dates.
 *
 * Why it saves money, honestly: every parcel still travels on its own (each
 * customer has her own address), so nothing is merged in a box. What is shared
 * is the BUYING DAY. When all the convoy orders are placed with the supplier at
 * once, the items fall into quantity price tiers and the per-order handling is
 * done once, which is what pays for the free shipping we give convoy members.
 *
 * The deal, stated the same way everywhere: you accept a fixed dispatch date,
 * we drop the $9.99 shipping, no minimum. Nothing else changes: same products,
 * same prices, same returns.
 *
 * Convoys close on the 1st and the 15th at 23:59 Montréal time, and the
 * supplier order goes out the next morning.
 */
import { prisma } from "./prisma";
import { SHIPPING } from "./brand";

const TZ = "America/Toronto";

/** The UTC instant whose Montréal wall-clock time is the given date and time (handles daylight saving). */
function montrealInstant(year: number, month: number, day: number, hour: number, minute: number): Date {
  let guess = Date.UTC(year, month, day, hour, minute);
  for (let i = 0; i < 2; i++) {
    const p = new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(guess));
    const get = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
    const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"));
    guess += Date.UTC(year, month, day, hour, minute) - asUtc;
  }
  return new Date(guess);
}

/** Montréal calendar parts of an instant. */
function montrealParts(d: Date): { y: number; m: number; d: number } {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const get = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
  return { y: get("year"), m: get("month") - 1, d: get("day") };
}

export type DropView = {
  id: string;
  code: string;
  closesAt: Date;
  ordersOn: Date;
  /** Orders already in this convoy (count only — never who they are). */
  members: number;
  /** Delivery window shown to customers, computed from the supplier order day. */
  deliveryFrom: Date;
  deliveryTo: Date;
};

/** Next 1st or 15th at 23:59 Montréal, as a UTC instant. */
export function nextCloseDate(now: Date = new Date()): Date {
  const { y, m, d } = montrealParts(now);
  return d < 15 ? montrealInstant(y, m, 15, 23, 59) : montrealInstant(y, m + 1, 1, 23, 59);
}

export function dropCode(closesAt: Date): string {
  const { y, m, d } = montrealParts(closesAt);
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Delivery window: supplier order day + processing + transit (business days approximated as calendar days × 1.4). */
export function deliveryWindow(ordersOn: Date): { from: Date; to: Date } {
  const days = (n: number) => new Date(ordersOn.getTime() + Math.round(n * 1.4) * 864e5);
  return {
    from: days(SHIPPING.processingDays.min + SHIPPING.deliveryBusinessDays.min),
    to: days(SHIPPING.processingDays.max + SHIPPING.deliveryBusinessDays.max),
  };
}

function toView(d: { id: string; code: string; closesAt: Date; ordersOn: Date }, members: number): DropView {
  const w = deliveryWindow(d.ordersOn);
  return { id: d.id, code: d.code, closesAt: d.closesAt, ordersOn: d.ordersOn, members, deliveryFrom: w.from, deliveryTo: w.to };
}

/**
 * The convoy customers can join right now, creating it if the calendar says a
 * new one should be open. Returns null only if the database is unreachable.
 */
export async function openDrop(now: Date = new Date()): Promise<DropView | null> {
  try {
    const closesAt = nextCloseDate(now);
    const code = dropCode(closesAt);
    const ordersOn = new Date(closesAt.getTime() + 9 * 3600e3); // the next morning in Montréal
    const drop = await prisma.drop.upsert({
      where: { code },
      update: {},
      create: { code, closesAt, ordersOn, status: "OPEN" },
    });
    const members = await prisma.order.count({ where: { dropId: drop.id, status: { in: ["PAID", "FULFILLED"] } } });
    return toView(drop, members);
  } catch (err) {
    console.error("[drops] openDrop failed", err);
    return null;
  }
}

/** Same as openDrop but never creates anything (used where a read-only view is enough). */
export async function currentDrop(now: Date = new Date()): Promise<DropView | null> {
  try {
    const drop = await prisma.drop.findFirst({
      where: { status: "OPEN", closesAt: { gt: now } },
      orderBy: { closesAt: "asc" },
    });
    if (!drop) return null;
    const members = await prisma.order.count({ where: { dropId: drop.id, status: { in: ["PAID", "FULFILLED"] } } });
    return toView(drop, members);
  } catch {
    return null;
  }
}

/** Convoys whose close date has passed and that still need the supplier order. */
export async function dropsToClose(now: Date = new Date()) {
  return prisma.drop.findMany({ where: { status: "OPEN", closesAt: { lte: now } }, orderBy: { closesAt: "asc" } });
}

/** Admin view: one convoy with its orders and a merged shopping list for the supplier. */
export async function dropDetail(code: string) {
  const drop = await prisma.drop.findUnique({
    where: { code },
    include: { orders: { where: { status: { in: ["PAID", "FULFILLED"] } }, orderBy: { createdAt: "asc" } } },
  });
  if (!drop) return null;
  const lines = new Map<string, { slug: string; name: string; qty: number }>();
  for (const o of drop.orders) {
    for (const i of Array.isArray(o.items) ? (o.items as { slug: string; nameEn: string; qty: number }[]) : []) {
      const row = lines.get(i.slug) ?? { slug: i.slug, name: i.nameEn, qty: 0 };
      row.qty += i.qty;
      lines.set(i.slug, row);
    }
  }
  return { drop, shoppingList: [...lines.values()].sort((a, b) => b.qty - a.qty) };
}

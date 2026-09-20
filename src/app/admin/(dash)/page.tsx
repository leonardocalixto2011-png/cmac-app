import Link from "next/link";
import { dashboardData } from "@/lib/admin";
import { fmtDateTime } from "@/lib/fmt";
import { formatMoneyFromCents } from "@/lib/utils";
import { orderItems } from "@/lib/shop";
import { StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const d = await dashboardData();

  const stats = [
    { label: "To fulfil", value: String(d.pendingFulfil), href: "/admin/orders?status=PAID" },
    { label: "Paid orders (all time)", value: String(d.paidCount), href: "/admin/orders" },
    { label: "Revenue · 30 days", value: formatMoneyFromCents(d.revenue30Cents, "en"), href: "/admin/orders" },
    { label: "Subscribers", value: String(d.subscribers), href: "/admin/subscribers" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)]">Dashboard</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl bg-warm-white p-4 transition-shadow hover:shadow-[var(--shadow-card)]">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{s.value}</p>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[1.2rem]">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-terra underline underline-offset-2">
            All orders →
          </Link>
        </div>
        {d.recent.length === 0 ? (
          <p className="text-sm text-ink-faint">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--line)] rounded-2xl bg-warm-white">
            {d.recent.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-[0.9rem]">
                <span className="w-[140px] text-ink-faint">{fmtDateTime(o.createdAt, "en")}</span>
                <span className="flex-1">
                  {o.contactName || o.contactEmail || "—"}
                  <span className="block text-[0.8rem] text-ink-faint">
                    {orderItems(o.items)
                      .map((i) => `${i.qty}× ${i.nameEn}`)
                      .join(", ")}
                  </span>
                </span>
                <span className="tabular-nums">{formatMoneyFromCents(o.totalCents, "en")}</span>
                <StatusPill status={o.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-[0.8rem] text-ink-faint">
        {d.messages} contact message{d.messages === 1 ? "" : "s"} stored (forwarded to the owner email when Resend is configured).
      </p>
    </div>
  );
}

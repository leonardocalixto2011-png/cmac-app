import Link from "next/link";
import { dashboardData } from "@/lib/admin";
import { fmtDateTime } from "@/lib/fmt";
import { formatMoneyFromCents } from "@/lib/utils";
import { orderItems } from "@/lib/shop";
import { StatusPill } from "@/components/admin/ui";
import { integrationStatus } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const d = await dashboardData();
  const integrations = integrationStatus();

  const stats = [
    { label: "To fulfil", value: String(d.pendingFulfil), href: "/admin/orders?status=PAID" },
    { label: "Paid orders (all time)", value: String(d.paidCount), href: "/admin/orders" },
    { label: "Revenue · 30 days", value: formatMoneyFromCents(d.revenue30Cents, "en"), href: "/admin/orders" },
    { label: "Confirmed subscribers", value: String(d.subscribers), href: "/admin/newsletter" },
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

      <section aria-labelledby="integrations-title" className="rounded-2xl bg-warm-white p-4">
        <h2 id="integrations-title" className="text-[1.05rem]">Integrations</h2>
        <p className="mt-1 text-[0.8rem] text-ink-faint">
          Reads whether each environment variable is set in Vercel (values are never shown). Missing ones disable the matching feature gracefully.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {integrations.map((i) => (
            <li
              key={i.key}
              title={i.env}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.8rem] font-semibold ${i.ok ? "bg-sage/15 text-sage" : "bg-terra/10 text-terra"}`}
            >
              <span aria-hidden>{i.ok ? "✓" : "✗"}</span>
              {i.label}
              <span className="sr-only-text">{i.ok ? "configured" : "not configured"}</span>
            </li>
          ))}
        </ul>
        {integrations.some((i) => !i.ok) && (
          <p className="mt-3 text-[0.8rem] text-ink-soft">
            Not configured → Resend: no emails are sent (order confirmations, password resets, newsletter). Mailing address: newsletter campaigns,
            welcome and birthday emails are blocked (CASL). Cron: no birthday rewards. See CLAUDE.md → Owner setup.
          </p>
        )}
      </section>

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

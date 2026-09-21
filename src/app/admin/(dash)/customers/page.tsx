import { adminListCustomers } from "@/lib/admin";
import { fmtDateTime } from "@/lib/fmt";
import { formatMoneyFromCents } from "@/lib/utils";
import { tierFor } from "@/lib/loyalty-rules";
import { PointsAdjust } from "./PointsAdjust";

export const dynamic = "force-dynamic";

const TIER_LABEL = { glow: "Glow", radiance: "Radiance", icon: "Icon" } as const;
const NL_STYLE: Record<string, string> = {
  CONFIRMED: "bg-sage/15 text-sage",
  PENDING: "bg-gold/25 text-ink",
  UNSUBSCRIBED: "bg-cream-2 text-ink-faint",
};

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const rows = await adminListCustomers(q);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)]">Customers</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Glow Club members (customers with an account). Tier = lifetime merchandise spend: Glow 0+, Radiance $250+, Icon $600+. Points: 1 / 1.25 / 1.5 per $1.
          </p>
        </div>
        <form className="flex gap-2" action="/admin/customers">
          <input name="q" defaultValue={q ?? ""} placeholder="Search name or email" className="field w-[220px] py-2 text-[0.85rem]" />
          <button type="submit" className="btn btn--sm">
            Search
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-ink-faint">No members yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-warm-white">
          <table className="w-full min-w-[860px] border-collapse text-[0.88rem]">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint">
                <th className="px-4 py-2 font-semibold">Member</th>
                <th className="px-4 py-2 font-semibold">Tier</th>
                <th className="px-4 py-2 text-right font-semibold">Points</th>
                <th className="px-4 py-2 text-right font-semibold">Lifetime spend</th>
                <th className="px-4 py-2 text-right font-semibold">Orders</th>
                <th className="px-4 py-2 font-semibold">Newsletter</th>
                <th className="px-4 py-2 font-semibold">Adjust points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-[var(--line)]/70 align-top">
                  <td className="px-4 py-3">
                    <span className="block font-medium">{c.name || "—"}</span>
                    <span className="block text-ink-soft">{c.email}</span>
                    <span className="block text-[0.75rem] text-ink-faint">
                      Since {fmtDateTime(c.createdAt, "en")} · {c.locale.toUpperCase()}
                      {c.birthMonth ? ` · 🎂 ${c.birthMonth}/${c.birthDay}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">{TIER_LABEL[tierFor(c.lifetimeSpendCents).id]}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.points}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatMoneyFromCents(c.lifetimeSpendCents, "en")}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.orderCount}</td>
                  <td className="px-4 py-3">
                    {c.newsletter ? (
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold ${NL_STYLE[c.newsletter]}`}>{c.newsletter.toLowerCase()}</span>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <PointsAdjust customerId={c.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

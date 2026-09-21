import { adminListSubscribers } from "@/lib/admin";
import { fmtDateTime } from "@/lib/fmt";

export const dynamic = "force-dynamic";

export default async function AdminSubscribers() {
  const rows = await adminListSubscribers();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)]">Subscribers</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {rows.length} newsletter signup{rows.length === 1 ? "" : "s"} with their CASL consent record. Only CONFIRMED ones receive campaigns (see{" "}
            <a href="/admin/newsletter" className="text-terra underline">Newsletter</a>).
          </p>
        </div>
        <a href="/admin/subscribers/export" className="btn btn--sm" download>
          Export CSV
        </a>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-ink-faint">No subscribers yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-warm-white">
          <table className="w-full min-w-[640px] border-collapse text-[0.9rem]">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-[0.72rem] uppercase tracking-[0.12em] text-ink-faint">
                <th className="px-4 py-2 font-semibold">Email</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Source</th>
                <th className="px-4 py-2 font-semibold">Locale</th>
                <th className="px-4 py-2 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-[var(--line)]/70">
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2 text-[0.8rem] font-semibold">{s.status}</td>
                  <td className="px-4 py-2 text-ink-soft">{s.consentSource ?? "—"}</td>
                  <td className="px-4 py-2 uppercase">{s.locale}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-ink-faint">{fmtDateTime(s.createdAt, "en")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

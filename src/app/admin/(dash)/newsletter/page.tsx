import { newsletterStats, adminListProducts } from "@/lib/admin";
import { campaignBlocker } from "@/lib/marketing";
import { fmtDateTime } from "@/lib/fmt";
import { CampaignComposer } from "./CampaignComposer";

export const dynamic = "force-dynamic";
// Campaign sends run inside the server action (Resend batch, ≤ 100 per request, paced).
export const maxDuration = 300;

export default async function AdminNewsletter() {
  const [stats, products] = await Promise.all([newsletterStats(), adminListProducts()]);
  const blocker = campaignBlocker();

  const cards = [
    { label: "Confirmed", value: stats.confirmed, note: "receive campaigns" },
    { label: "Pending", value: stats.pending, note: "haven't confirmed (incl. pre-CASL signups)" },
    { label: "Unsubscribed", value: stats.unsubscribed, note: "never emailed again" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)]">Newsletter</h1>
          <p className="mt-1 max-w-[70ch] text-sm text-ink-soft">
            CASL double opt-in: only <strong>confirmed</strong> subscribers receive campaigns. Every email is sent in the subscriber&apos;s language with
            the sender, contact email, mailing address, the reason they receive it and a one-click unsubscribe.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/subscribers" className="btn btn--ghost btn--sm">
            All subscribers
          </a>
          <a href="/admin/subscribers/export" className="btn btn--sm" download>
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-warm-white p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{c.value}</p>
            <p className="text-[0.75rem] text-ink-faint">{c.note}</p>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-[1.2rem]">New campaign</h2>
        {blocker && (
          <p className="rounded-2xl bg-terra/10 px-4 py-3 text-sm text-terra" role="alert">
            <strong>Sending is disabled.</strong> {blocker}
          </p>
        )}
        <CampaignComposer
          disabled={Boolean(blocker)}
          confirmed={stats.confirmed}
          products={products.filter((p) => p.active).map((p) => ({ slug: p.slug, name: p.nameEn }))}
        />
      </section>

      <section>
        <h2 className="mb-3 text-[1.2rem]">Recent campaigns</h2>
        {stats.campaigns.length === 0 ? (
          <p className="text-sm text-ink-faint">No campaigns sent yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--line)] rounded-2xl bg-warm-white">
            {stats.campaigns.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-[0.9rem]">
                <span className="w-[150px] text-ink-faint">{fmtDateTime(c.sentAt ?? c.createdAt, "en")}</span>
                <span className="min-w-0 flex-1">
                  {c.subjectEn}
                  <span className="block text-[0.8rem] text-ink-faint">{c.subjectFr}</span>
                </span>
                <span className="tabular-nums text-ink-soft">
                  {c.sentCount}/{c.recipients} sent{c.failedCount ? ` · ${c.failedCount} failed` : ""}
                </span>
                <span className="rounded-full bg-cream-2 px-2.5 py-0.5 text-[0.72rem] font-semibold">{c.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

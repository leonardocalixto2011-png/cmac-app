import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fmtDateTime } from "@/lib/fmt";
import { cn } from "@/lib/utils";
import { ReviewModeration } from "./ReviewModeration";

export const dynamic = "force-dynamic";

const FILTERS = ["PENDING", "APPROVED", "REJECTED"] as const;

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const current = FILTERS.find((f) => f === status) ?? "PENDING";
  const [reviews, counts] = await Promise.all([
    prisma.review.findMany({
      where: { status: current },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { order: { select: { reference: true, contactEmail: true } } },
    }),
    prisma.review.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)]">Reviews</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Only buyers can review (link emailed ~3 weeks after shipping). Approve every honest review, <strong>including negative ones</strong>:
          reject only abuse, spam, personal information or off-topic text. Hiding bad reviews is misleading under the Competition Act.
          Tick “gifted” for creators who got the product free: the page then says so.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f} href={`/admin/reviews?status=${f}`} className={cn("pill", current === f && "is-active")}>
            {f.charAt(0) + f.slice(1).toLowerCase()} ({count(f)})
          </Link>
        ))}
      </div>
      {reviews.length === 0 ? (
        <p className="text-sm text-ink-faint">No reviews here yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((r) => (
            <li key={r.id} className="grid gap-3 rounded-2xl bg-warm-white p-4 md:grid-cols-[1fr_auto]">
              <div className="text-[0.9rem]">
                <p className="flex flex-wrap items-center gap-2 text-[0.8rem] text-ink-faint">
                  <span className="text-terra">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span>{r.productSlug}</span>
                  <span>· #{r.order.reference.slice(-8).toUpperCase()}</span>
                  <span>· {fmtDateTime(r.createdAt, "en")}</span>
                  <span className="rounded-full bg-cream-2 px-2 text-[0.7rem] font-semibold uppercase">{r.locale}</span>
                </p>
                {r.title && <p className="mt-1 font-semibold">{r.title}</p>}
                <p className="mt-1 whitespace-pre-line">{r.body}</p>
                <p className="mt-1 text-[0.8rem] text-ink-soft">
                  — {r.authorName} ({r.order.contactEmail})
                </p>
              </div>
              <ReviewModeration id={r.id} status={r.status} incentivized={r.incentivized} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

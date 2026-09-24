import { prisma } from "@/lib/prisma";
import { deliveryWindow, openDrop } from "@/lib/drops";
import { orderItems, shippingLines } from "@/lib/shop";
import { fmtDate, fmtDateTime } from "@/lib/fmt";
import { formatMoneyFromCents } from "@/lib/utils";
import { CloseDropButton } from "./CloseDropButton";

export const dynamic = "force-dynamic";

const MTL = { timeZone: "America/Toronto" } as const;

/**
 * Convoys: one row per shared dispatch date, with the merged shopping list to
 * paste into the supplier order, and every participant's parcel contents.
 */
export default async function AdminConvoys() {
  await openDrop().catch(() => null); // makes sure the next one exists
  const drops = await prisma.drop.findMany({
    orderBy: { closesAt: "desc" },
    take: 12,
    include: { orders: { where: { status: { in: ["PAID", "FULFILLED"] } }, orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)]">Convoys</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Customers who tick “join the convoy” pay no shipping and accept a shared dispatch date (the 1st and the 15th).
          On the dispatch morning, place <strong>one supplier order</strong> using the merged list below, then fulfil each
          order normally with its own tracking number. Parcels are never merged: each address gets its own.
        </p>
      </div>

      {drops.map((d) => {
        const win = deliveryWindow(d.ordersOn);
        const lines = new Map<string, { name: string; qty: number }>();
        let revenue = 0;
        for (const o of d.orders) {
          revenue += o.totalCents;
          for (const i of orderItems(o.items)) {
            const row = lines.get(i.slug) ?? { name: i.nameEn, qty: 0 };
            row.qty += i.qty;
            lines.set(i.slug, row);
          }
        }
        const shopping = [...lines.entries()].sort((a, b) => b[1].qty - a[1].qty);
        const due = d.status === "OPEN" && d.closesAt <= new Date();

        return (
          <section key={d.id} className="rounded-2xl bg-warm-white p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h2 className="font-display text-[1.25rem]">
                  Convoy {d.code}{" "}
                  <span className="ml-2 rounded-full bg-cream-2 px-2 py-0.5 align-middle text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                    {d.status}
                  </span>
                </h2>
                <p className="mt-1 text-[0.85rem] text-ink-soft">
                  Closes {d.closesAt.toLocaleString("en-CA", MTL)} · order the supplier on{" "}
                  <strong>{d.ordersOn.toLocaleDateString("en-CA", MTL)}</strong> · customers were promised delivery{" "}
                  {fmtDate(win.from, "en")}–{fmtDate(win.to, "en")}
                </p>
              </div>
              <div className="text-right text-[0.9rem]">
                <p className="font-semibold">
                  {d.orders.length} order{d.orders.length === 1 ? "" : "s"} · {formatMoneyFromCents(revenue, "en")}
                </p>
                {due && <p className="text-terra">Ready to order</p>}
              </div>
            </div>

            {d.orders.length === 0 ? (
              <p className="mt-3 text-sm text-ink-faint">Nobody has joined this convoy yet.</p>
            ) : (
              <>
                <h3 className="mt-4 font-ui text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                  Supplier shopping list
                </h3>
                <ul className="mt-2 grid gap-1 text-[0.9rem] sm:grid-cols-2">
                  {shopping.map(([slug, row]) => (
                    <li key={slug} className="flex justify-between gap-3 rounded-xl bg-cream-2 px-3 py-1.5">
                      <span>{row.name}</span>
                      <span className="font-semibold tabular-nums">× {row.qty}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-5 font-ui text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                  Parcels
                </h3>
                <ul className="mt-2 flex flex-col gap-2 text-[0.85rem]">
                  {d.orders.map((o) => (
                    <li key={o.id} className="rounded-xl bg-cream-2 px-3 py-2">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[0.78rem] text-ink-faint">#{o.reference.slice(-8).toUpperCase()}</span>
                        <span className="font-semibold">{o.contactName || o.contactEmail}</span>
                        <span className="text-ink-faint">{fmtDateTime(o.createdAt, "en")}</span>
                      </p>
                      <p className="mt-1 whitespace-pre-line text-ink-soft">{shippingLines(o.shippingJson).join("\n")}</p>
                      <p className="mt-1">
                        {orderItems(o.items)
                          .map((i) => `${i.qty} × ${i.nameEn}${Object.values(i.optionsEn ?? {}).length ? ` (${Object.values(i.optionsEn ?? {}).join(", ")})` : ""}`)
                          .join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {d.status !== "SHIPPED" && <CloseDropButton code={d.code} status={d.status} />}
          </section>
        );
      })}
    </div>
  );
}

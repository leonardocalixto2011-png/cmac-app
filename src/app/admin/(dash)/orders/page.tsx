import Link from "next/link";
import { adminListOrders } from "@/lib/admin";
import { fmtDateTime } from "@/lib/fmt";
import { formatMoneyFromCents, cn } from "@/lib/utils";
import { orderItems, shippingLines } from "@/lib/shop";
import { OrderStatusControl, FulfilForm, ORDER_LABEL } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "PAID", "FULFILLED", "CANCELLED", "REFUNDED", "PENDING"];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const current = status && FILTERS.includes(status) ? status : "ALL";
  const orders = await adminListOrders({ status: current });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)]">Orders</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Paid orders need a supplier order. Once you have the tracking, use “Mark fulfilled” — the customer gets an email in their language.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f} href={f === "ALL" ? "/admin/orders" : `/admin/orders?status=${f}`} className={cn("pill", current === f && "is-active")}>
            {f === "ALL" ? "All" : ORDER_LABEL[f]}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-ink-faint">No orders.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => {
            const items = orderItems(o.items);
            const addr = shippingLines(o.shippingJson);
            return (
              <li key={o.id} className="grid gap-4 rounded-2xl bg-warm-white p-4 md:grid-cols-[1fr_1fr_auto]">
                <div className="text-[0.9rem]">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[0.78rem] text-ink-faint">#{o.reference.slice(-8).toUpperCase()}</span>
                    <span className="text-ink-faint">{fmtDateTime(o.createdAt, "en")}</span>
                    <span className="rounded-full bg-cream-2 px-2 text-[0.7rem] font-semibold uppercase">{o.locale}</span>
                  </p>
                  <p className="mt-1 font-semibold">{o.contactName || "—"}</p>
                  <p>
                    <a href={`mailto:${o.contactEmail}`} className="text-terra underline-offset-2 hover:underline">
                      {o.contactEmail || "—"}
                    </a>
                  </p>
                  {addr.length > 0 && <p className="mt-2 whitespace-pre-line text-[0.82rem] text-ink-soft">{addr.slice(1).join("\n")}</p>}
                </div>

                <div className="text-[0.88rem]">
                  {items.map((it, idx) => (
                    <p key={idx}>
                      {it.qty}× {it.nameEn}
                      {it.optionsEn && Object.values(it.optionsEn).length > 0 && (
                        <span className="text-ink-faint"> ({Object.values(it.optionsEn).join(", ")})</span>
                      )}
                    </p>
                  ))}
                  <p className="mt-2 text-ink-soft">
                    {formatMoneyFromCents(o.subtotalCents, "en")} + {o.shippingCents === 0 ? "free shipping" : formatMoneyFromCents(o.shippingCents, "en")} ={" "}
                    <strong className="text-ink">{formatMoneyFromCents(o.totalCents, "en")}</strong>
                  </p>
                  {o.trackingNumber && (
                    <p className="mt-2 text-[0.82rem]">
                      Tracking:{" "}
                      {o.trackingUrl ? (
                        <a href={o.trackingUrl} target="_blank" rel="noopener" className="text-terra underline">
                          {o.trackingNumber}
                        </a>
                      ) : (
                        <span className="font-mono">{o.trackingNumber}</span>
                      )}
                      {o.supplierOrderId && <span className="text-ink-faint"> · supplier {o.supplierOrderId}</span>}
                    </p>
                  )}
                  {o.stripePaymentIntentId && <p className="mt-1 font-mono text-[0.7rem] text-ink-faint">{o.stripePaymentIntentId}</p>}
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <OrderStatusControl id={o.id} status={o.status} />
                  {(o.status === "PAID" || o.status === "FULFILLED") && (
                    <FulfilForm
                      id={o.id}
                      initial={{
                        trackingNumber: o.trackingNumber ?? "",
                        trackingUrl: o.trackingUrl ?? "",
                        supplierOrderId: o.supplierOrderId ?? "",
                      }}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { setOrderStatus, fulfilOrder } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export const ORDER_LABEL: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid — to fulfil",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-cream-2 text-ink-faint",
  PAID: "bg-terra/15 text-terra",
  FULFILLED: "bg-sage/15 text-sage",
  CANCELLED: "bg-cream-2 text-ink-faint line-through",
  REFUNDED: "bg-cream-2 text-ink-faint",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold", STATUS_STYLE[status])}>
      {ORDER_LABEL[status] ?? status}
    </span>
  );
}

export function OrderStatusControl({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(() => setOrderStatus(id, e.target.value))}
      className="field w-auto px-2 py-1 text-[0.8rem]"
      aria-label="Change order status"
    >
      {Object.keys(ORDER_LABEL).map((s) => (
        <option key={s} value={s}>
          {ORDER_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

export function FulfilForm({
  id,
  initial,
}: {
  id: string;
  initial: { trackingNumber: string; trackingUrl: string; supplierOrderId: string };
}) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(initial);
  const [notify, setNotify] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn--sm">
        {initial.trackingNumber ? "Edit tracking" : "Mark fulfilled"}
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        start(async () => {
          try {
            await fulfilOrder(id, { ...f, notify });
            setMsg(notify ? "Saved · customer emailed ✓" : "Saved ✓");
            setTimeout(() => setOpen(false), 1200);
          } catch (err) {
            setMsg(err instanceof Error ? err.message : "Error");
          }
        });
      }}
      className="flex flex-col gap-2 rounded-2xl border border-[var(--line)] bg-warm-white p-3"
    >
      <input className="field text-[0.85rem]" placeholder="Tracking number *" required value={f.trackingNumber} onChange={(e) => setF({ ...f, trackingNumber: e.target.value })} />
      <input className="field text-[0.85rem]" placeholder="Tracking URL (https://…)" value={f.trackingUrl} onChange={(e) => setF({ ...f, trackingUrl: e.target.value })} />
      <input className="field text-[0.85rem]" placeholder="Supplier (CJ) order id" value={f.supplierOrderId} onChange={(e) => setF({ ...f, supplierOrderId: e.target.value })} />
      <label className="flex items-center gap-2 text-[0.8rem] text-ink-soft">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
        Email the customer their tracking
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn--sm">
          {pending ? "…" : "Save & mark fulfilled"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[0.8rem] text-ink-faint underline">
          Cancel
        </button>
        {msg && <span className="text-[0.8rem] text-ink-soft">{msg}</span>}
      </div>
    </form>
  );
}

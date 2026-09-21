"use client";

import { useState, useTransition } from "react";
import { adjustCustomerPoints } from "@/app/admin/actions";

/** Manual +/- points with a mandatory reason (written to the ledger). */
export function PointsAdjust({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button type="button" className="text-[0.8rem] text-terra underline underline-offset-2" onClick={() => setOpen(true)}>
        Adjust…
      </button>
    );
  }
  return (
    <form
      className="flex w-[220px] flex-col gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        start(async () => {
          try {
            await adjustCustomerPoints(customerId, Number(points), reason);
            setMsg("Saved ✓");
            setPoints("");
            setReason("");
          } catch (err) {
            setMsg(err instanceof Error ? err.message : "Error");
          }
        });
      }}
    >
      <input className="field py-1.5 text-[0.8rem]" type="number" step={1} placeholder="+50 or -20" value={points} onChange={(e) => setPoints(e.target.value)} required />
      <input className="field py-1.5 text-[0.8rem]" placeholder="Reason (required)" maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)} required />
      <div className="flex items-center gap-2">
        <button type="submit" className="btn btn--sm" disabled={pending}>
          {pending ? "…" : "Apply"}
        </button>
        <button type="button" className="text-[0.75rem] text-ink-faint underline" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
      {msg && <span className="text-[0.75rem] text-ink-soft">{msg}</span>}
    </form>
  );
}

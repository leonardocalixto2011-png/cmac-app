"use client";

import { useState, useTransition } from "react";
import { moderateReview } from "@/app/admin/review-actions";

export function ReviewModeration({ id, status, incentivized }: { id: string; status: string; incentivized: boolean }) {
  const [gifted, setGifted] = useState(incentivized);
  const [pending, start] = useTransition();
  const act = (next: "APPROVED" | "REJECTED") => start(() => moderateReview(id, next, gifted));
  return (
    <div className="flex flex-col items-start gap-2 text-[0.85rem] md:items-end">
      <label className="flex items-center gap-2 text-ink-soft">
        <input type="checkbox" checked={gifted} onChange={(e) => setGifted(e.target.checked)} />
        Gifted product
      </label>
      <div className="flex gap-2">
        {status !== "APPROVED" && (
          <button type="button" disabled={pending} className="btn btn--sm" onClick={() => act("APPROVED")}>
            Approve
          </button>
        )}
        {status !== "REJECTED" && (
          <button type="button" disabled={pending} className="btn btn--ghost btn--sm" onClick={() => act("REJECTED")}>
            Reject
          </button>
        )}
      </div>
    </div>
  );
}

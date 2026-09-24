"use client";

import { useTransition } from "react";
import { setDropStatus } from "@/app/admin/convoy-actions";

const NEXT: Record<string, { to: "CLOSED" | "ORDERED" | "SHIPPED"; label: string }> = {
  OPEN: { to: "CLOSED", label: "Close it (stop new joins)" },
  CLOSED: { to: "ORDERED", label: "Mark as ordered from the supplier" },
  ORDERED: { to: "SHIPPED", label: "Mark as shipped" },
};

export function CloseDropButton({ code, status }: { code: string; status: string }) {
  const [pending, start] = useTransition();
  const next = NEXT[status];
  if (!next) return null;
  return (
    <button type="button" disabled={pending} className="btn btn--ghost btn--sm mt-4" onClick={() => start(() => setDropStatus(code, next.to))}>
      {pending ? "…" : next.label}
    </button>
  );
}

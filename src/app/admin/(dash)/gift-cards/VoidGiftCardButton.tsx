"use client";

import { useTransition } from "react";
import { creditBackGiftCard, voidGiftCard } from "@/app/admin/gift-card-actions";

export function VoidGiftCardButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="btn btn--ghost btn--sm"
      onClick={() => {
        if (window.confirm("Void this card? Its code stops working. Refund the buyer in Stripe separately.")) start(() => voidGiftCard(id));
      }}
    >
      {pending ? "…" : "Void"}
    </button>
  );
}

export function CreditGiftCardButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="btn btn--ghost btn--sm"
      onClick={() => {
        const cents = Math.round(Number(window.prompt("Amount to put back on this card, in dollars (for a refunded order). The holder gets a new code by email.")) * 100);
        if (cents > 0) start(() => creditBackGiftCard(id, cents));
      }}
    >
      {pending ? "…" : "Credit back"}
    </button>
  );
}

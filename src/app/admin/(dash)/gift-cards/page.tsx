import { prisma } from "@/lib/prisma";
import { formatMoneyFromCents } from "@/lib/utils";
import { fmtDate } from "@/lib/fmt";
import type { GiftCardUse } from "@/lib/gift-cards";
import { CreditGiftCardButton, VoidGiftCardButton } from "./VoidGiftCardButton";

export const dynamic = "force-dynamic";

export default async function AdminGiftCards() {
  const cards = await prisma.giftCard.findMany({ where: { status: { not: "PENDING" } }, orderBy: { createdAt: "desc" }, take: 200 });
  const owed = cards.filter((c) => c.status === "ACTIVE").reduce((sum, c) => sum + c.balanceCents, 0);

  return (
    <div>
      <h1 className="text-[1.8rem]">Gift cards</h1>
      <p className="mt-2 text-[0.92rem] text-ink-soft">
        Outstanding balance: <strong className="text-ink">{formatMoneyFromCents(owed)}</strong>. This money is owed in products, not profit, and it never expires.
      </p>
      <p className="mt-1 text-[0.85rem] text-ink-faint">To refund a card: void it here, then refund the payment in Stripe.</p>

      {cards.length === 0 ? (
        <p className="mt-8 text-ink-soft">No gift cards sold yet.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {cards.map((c) => {
            const uses = c.uses as GiftCardUse[];
            return (
              <li key={c.id} className="rounded-2xl bg-warm-white p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-display text-[1.2rem] tabular-nums">
                    {formatMoneyFromCents(c.balanceCents)}
                    <span className="ml-2 text-[0.85rem] text-ink-faint">of {formatMoneyFromCents(c.amountCents)}</span>
                  </p>
                  <p className="font-ui text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">{c.status}</p>
                </div>
                <p className="mt-1 font-mono text-[0.85rem]">{c.code ?? "code being issued"}</p>
                <p className="mt-1 text-[0.85rem] text-ink-soft">
                  Bought {c.paidAt ? fmtDate(c.paidAt, "en") : "?"} by {c.buyerEmail ?? "unknown"} · goes to {c.toEmail ?? "the buyer"} ·{" "}
                  {c.sentAt ? `sent ${fmtDate(c.sentAt, "en")}` : c.sendAt ? `leaves ${fmtDate(c.sendAt, "en")}` : "not sent yet"}
                </p>
                {uses.length > 0 && (
                  <ul className="mt-1 text-[0.82rem] text-ink-soft">
                    {uses.map((u) => (
                      <li key={u.reference}>
                        {formatMoneyFromCents(u.amountCents)} on order {u.reference.slice(-8).toUpperCase()}, {fmtDate(new Date(u.at), "en")}
                      </li>
                    ))}
                  </ul>
                )}
                {c.status !== "CANCELLED" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CreditGiftCardButton id={c.id} />
                    {c.status === "ACTIVE" && <VoidGiftCardButton id={c.id} />}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

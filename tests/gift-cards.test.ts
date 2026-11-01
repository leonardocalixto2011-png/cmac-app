import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

type Row = Record<string, unknown> & { id: string };

const h = vi.hoisted(() => {
  const rows = new Map<string, Row>();
  const matches = (row: Row, where: Record<string, unknown>): boolean =>
    Object.entries(where).every(([key, want]) => {
      if (key === "OR") return (want as Record<string, unknown>[]).some((w) => matches(row, w));
      const got = row[key] ?? null;
      if (want && typeof want === "object" && !(want instanceof Date)) {
        const w = want as { in?: unknown[]; not?: unknown; lte?: Date };
        if (w.in) return w.in.includes(got);
        if ("not" in w) return got !== w.not;
        if (w.lte) return got !== null && (got as Date) <= w.lte;
      }
      return got === want;
    });
  const prisma = {
    giftCard: {
      findUnique: async ({ where }: { where: Record<string, unknown> }) => {
        const row = [...rows.values()].find((r) => matches(r, where));
        return row ? { ...row } : null;
      },
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        const row = [...rows.values()].find((r) => matches(r, where));
        return row ? { ...row } : null;
      },
      findMany: async ({ where }: { where: Record<string, unknown> }) => [...rows.values()].filter((r) => matches(r, where)).map((r) => ({ id: r.id })),
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = rows.get(where.id)!;
        Object.assign(row, data);
        return { ...row };
      },
      updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        const hits = [...rows.values()].filter((r) => matches(r, where));
        hits.forEach((r) => Object.assign(r, data));
        return { count: hits.length };
      },
    },
  };
  const coupons = new Map<string, { amount_off: number }>();
  const codes: { id: string; code: string; coupon: string; active: boolean }[] = [];
  const stripe = {
    coupons: {
      retrieve: async (id: string) => {
        const c = coupons.get(id);
        if (!c) throw Object.assign(new Error("missing"), { statusCode: 404 });
        return { id, ...c };
      },
      create: async ({ id, amount_off }: { id: string; amount_off: number }) => {
        coupons.set(id, { amount_off });
        return { id, amount_off };
      },
    },
    promotionCodes: {
      create: vi.fn(async ({ code, promotion }: { code: string; promotion: { coupon: string } }) => {
        const row = { id: `promo_${codes.length + 1}`, code, coupon: promotion.coupon, active: true };
        codes.push(row);
        return row;
      }),
      update: async (id: string, data: { active: boolean }) => Object.assign(codes.find((c) => c.id === id)!, data),
    },
  };
  const mail = {
    sendGiftCard: vi.fn(async (..._args: unknown[]) => true),
    sendGiftCardReceipt: vi.fn(async (..._args: unknown[]) => true),
    sendGiftCardBalance: vi.fn(async (..._args: unknown[]) => true),
    sendOwnerGiftCardNotice: vi.fn(async (..._args: unknown[]) => true),
    sendOwnerGiftCardProblem: vi.fn(async (..._args: unknown[]) => true),
  };
  return { rows, prisma, coupons, codes, stripe, mail };
});

vi.mock("@/lib/prisma", () => ({ prisma: h.prisma }));
vi.mock("@/lib/stripe", () => ({ getStripe: () => h.stripe }));
vi.mock("@/lib/email", () => h.mail);

import { cancelGiftCard, creditGiftCard, fulfilGiftCard, giftCardBalance, redeemGiftCode, runGiftCards } from "@/lib/gift-cards";
import { cleanLine, cleanMessage, isGiftCardAmount, isGiftCardCode, parseSendDay } from "@/lib/gift-card-rules";
import { renderGiftCard, renderGiftCardBalance, renderGiftCardReceipt } from "@/lib/email-templates";

const session = { payment_intent: "pi_1", customer_details: { email: "Giver@Example.com", name: "Giver" } } as unknown as Stripe.Checkout.Session;
const order = { reference: "order-ref-12345678", contactEmail: "holder@example.com" };

function pending(over: Partial<Row> = {}) {
  const row: Row = {
    id: "card1",
    status: "PENDING",
    amountCents: 5000,
    balanceCents: 5000,
    code: null,
    stripePromotionCodeId: null,
    buyerEmail: null,
    buyerName: null,
    fromName: "Sam",
    toName: "Alex",
    toEmail: "alex@example.com",
    message: null,
    locale: "fr",
    sendAt: null,
    sentAt: null,
    receiptSentAt: null,
    balanceNoticeTo: null,
    uses: [],
    ...over,
  };
  h.rows.set(row.id, row);
  return row;
}

beforeEach(() => {
  h.rows.clear();
  h.coupons.clear();
  h.codes.length = 0;
  vi.clearAllMocks();
  for (const fn of Object.values(h.mail)) fn.mockResolvedValue(true);
});

describe("a paid card", () => {
  it("gets one code worth its amount, goes to the recipient, and the giver gets a receipt", async () => {
    pending();
    expect(await fulfilGiftCard("card1", session)).toBe(true);
    const card = h.rows.get("card1")!;
    expect(card.status).toBe("ACTIVE");
    expect(card.buyerEmail).toBe("giver@example.com");
    expect(isGiftCardCode(card.code as string)).toBe(true);
    expect(h.codes).toHaveLength(1);
    expect(h.coupons.get(h.codes[0].coupon)?.amount_off).toBe(5000);
    expect(h.mail.sendGiftCard.mock.calls[0][0]).toBe("alex@example.com");
    expect(h.mail.sendGiftCardReceipt.mock.calls[0][0]).toBe("giver@example.com");
    expect(h.mail.sendOwnerGiftCardNotice).toHaveBeenCalledTimes(1);
  });

  it("changes nothing when Stripe sends the webhook again", async () => {
    pending();
    await fulfilGiftCard("card1", session);
    await fulfilGiftCard("card1", session);
    expect(h.codes).toHaveLength(1);
    expect(h.mail.sendGiftCard).toHaveBeenCalledTimes(1);
    expect(h.mail.sendGiftCardReceipt).toHaveBeenCalledTimes(1);
    expect(h.mail.sendOwnerGiftCardNotice).toHaveBeenCalledTimes(1);
  });

  it("goes to the buyer, with no separate receipt, when no recipient was given", async () => {
    pending({ toEmail: null });
    await fulfilGiftCard("card1", session);
    expect(h.mail.sendGiftCard.mock.calls[0][0]).toBe("giver@example.com");
    expect(h.mail.sendGiftCardReceipt).not.toHaveBeenCalled();
  });

  it("asks Stripe to retry when the email didn't leave, then sends it once", async () => {
    pending();
    h.mail.sendGiftCard.mockResolvedValueOnce(false);
    expect(await fulfilGiftCard("card1", session)).toBe(false);
    expect(h.rows.get("card1")!.sentAt).toBeNull();
    expect(await fulfilGiftCard("card1", session)).toBe(true);
    expect(h.rows.get("card1")!.sentAt).not.toBeNull();
    expect(h.codes).toHaveLength(1);
    expect(h.mail.sendGiftCardReceipt).toHaveBeenCalledTimes(1);
  });

  it("issues nothing for a card that was never paid", async () => {
    pending();
    expect((await runGiftCards()).due).toBe(0);
    expect(h.codes).toHaveLength(0);
  });
});

describe("a card for Christmas morning", () => {
  const sendAt = new Date("2026-12-25T13:00:00Z");

  it("waits for its day, though the giver has the receipt at once", async () => {
    pending({ sendAt });
    await fulfilGiftCard("card1", session);
    expect(h.mail.sendGiftCard).not.toHaveBeenCalled();
    expect(h.mail.sendGiftCardReceipt).toHaveBeenCalledTimes(1);

    await runGiftCards(new Date("2026-12-24T14:00:00Z"));
    expect(h.mail.sendGiftCard).not.toHaveBeenCalled();

    await runGiftCards(new Date("2026-12-25T14:00:00Z"));
    expect(h.mail.sendGiftCard).toHaveBeenCalledTimes(1);

    await runGiftCards(new Date("2026-12-26T14:00:00Z"));
    expect(h.mail.sendGiftCard).toHaveBeenCalledTimes(1);
  });
});

describe("spending a card", () => {
  beforeEach(async () => {
    pending();
    await fulfilGiftCard("card1", session);
  });
  const promoId = () => h.rows.get("card1")!.stripePromotionCodeId as string;

  it("keeps what wasn't spent: a new code for the exact balance, sent to whoever used it", async () => {
    const firstCode = h.rows.get("card1")!.code;
    const result = await redeemGiftCode([promoId()], order, 3200);
    expect(result).toMatchObject({ spentCents: 3200, balanceCents: 1800 });
    const card = h.rows.get("card1")!;
    expect(card.status).toBe("ACTIVE");
    expect(card.code).not.toBe(firstCode);
    expect(h.coupons.get(h.codes[1].coupon)?.amount_off).toBe(1800);
    expect(h.mail.sendGiftCardBalance.mock.calls[0][0]).toBe("holder@example.com");
    expect(card.balanceNoticeTo).toBeNull();
  });

  it("can't subtract twice for the same spent code", async () => {
    const spent = promoId();
    await redeemGiftCode([spent], order, 3200);
    expect(await redeemGiftCode([spent], order, 3200)).toBeNull();
    expect(h.rows.get("card1")!.balanceCents).toBe(1800);
  });

  it("works down to zero across two orders, then stops", async () => {
    await redeemGiftCode([promoId()], order, 3200);
    await redeemGiftCode([promoId()], { ...order, reference: "second-order" }, 1800);
    const card = h.rows.get("card1")!;
    expect(card.status).toBe("USED");
    expect(card.balanceCents).toBe(0);
    expect((card.uses as unknown[]).length).toBe(2);
    expect(h.codes).toHaveLength(2);
  });

  it("ends the card when the order takes all of it", async () => {
    await redeemGiftCode([promoId()], order, 9999);
    expect(h.rows.get("card1")).toMatchObject({ status: "USED", balanceCents: 0 });
    expect(h.mail.sendGiftCardBalance).not.toHaveBeenCalled();
  });

  it("ignores other promo codes", async () => {
    expect(await redeemGiftCode(["promo_bf20"], order, 1000)).toBeNull();
    expect(h.rows.get("card1")!.balanceCents).toBe(5000);
  });

  it("recovers on the daily run when Stripe fails on the balance code", async () => {
    h.stripe.promotionCodes.create.mockRejectedValueOnce(new Error("stripe down"));
    await expect(redeemGiftCode([promoId()], order, 3200)).rejects.toThrow();
    const stuck = h.rows.get("card1")!;
    expect(stuck.balanceCents).toBe(1800);
    expect(stuck.stripePromotionCodeId).toBeNull();
    const reserved = stuck.code;

    await runGiftCards();
    const card = h.rows.get("card1")!;
    expect(card.stripePromotionCodeId).not.toBeNull();
    expect(card.code).toBe(reserved);
    expect(h.mail.sendGiftCardBalance).toHaveBeenCalledTimes(1);
  });

  it("reports the balance by code, and nothing for a spent or unknown code", async () => {
    const code = h.rows.get("card1")!.code as string;
    expect(await giftCardBalance(code.toLowerCase())).toBe(5000);
    await redeemGiftCode([promoId()], order, 3200);
    expect(await giftCardBalance(code)).toBeNull();
    expect(await giftCardBalance("CADEAU-AAAA-BBBB")).toBeNull();
    expect(await giftCardBalance("WELCOME10")).toBeNull();
  });

  it("puts a refunded order back on a spent card, under a new code", async () => {
    await redeemGiftCode([promoId()], order, 5000);
    expect(h.rows.get("card1")!.status).toBe("USED");
    await creditGiftCard("card1", 2000);
    const card = h.rows.get("card1")!;
    expect(card).toMatchObject({ status: "ACTIVE", balanceCents: 2000 });
    expect(h.coupons.get(h.codes[1].coupon)?.amount_off).toBe(2000);
    expect(h.mail.sendGiftCardBalance.mock.calls[0][0]).toBe("alex@example.com");
  });

  it("retires the live code when crediting a card that still has one", async () => {
    const live = promoId();
    await creditGiftCard("card1", 1000);
    expect(h.codes.find((c) => c.id === live)?.active).toBe(false);
    expect(h.rows.get("card1")!.balanceCents).toBe(6000);
    expect(h.coupons.get(h.codes[1].coupon)?.amount_off).toBe(6000);
  });

  it("stops the code working when the card is voided", async () => {
    const promo = promoId();
    await cancelGiftCard("card1");
    expect(h.rows.get("card1")!.status).toBe("CANCELLED");
    expect(h.codes.find((c) => c.id === promo)?.active).toBe(false);
    expect(await redeemGiftCode([promo], order, 1000)).toBeNull();
  });
});

describe("gift card rules", () => {
  it("takes only the listed amounts", () => {
    expect(isGiftCardAmount(5000)).toBe(true);
    expect(isGiftCardAmount(1)).toBe(false);
    expect(isGiftCardAmount(50000)).toBe(false);
  });

  it("sends now unless the day is still ahead, and refuses nonsense", () => {
    const now = new Date("2026-12-01T15:00:00Z");
    expect(parseSendDay("", now)).toEqual({ ok: true, sendAt: null });
    expect(parseSendDay("2026-11-30", now)).toEqual({ ok: true, sendAt: null });
    expect(parseSendDay("2026-12-25", now)).toEqual({ ok: true, sendAt: new Date("2026-12-25T13:00:00Z") });
    expect(parseSendDay("2028-12-25", now)).toEqual({ ok: false });
    expect(parseSendDay("Christmas", now)).toEqual({ ok: false });
  });

  it("leaves the message its line breaks and nothing else invisible", () => {
    expect(cleanMessage("Joyeux\r\nNoël\u0007 !")).toBe("Joyeux\nNoël  !");
    expect(cleanLine("Alex\nBcc: x@example.com")).toBe("Alex Bcc: x@example.com");
    expect(cleanLine("x".repeat(200))).toHaveLength(60);
  });
});

describe("gift card emails", () => {
  const base = { locale: "fr" as const, toName: "Alex", fromName: "Sam", message: null, balanceCents: 5000, code: "CADEAU-AAAA-BBBB" };

  it("states the terms Québec requires, in the buyer's language", () => {
    const fr = renderGiftCard(base);
    expect(fr.subject).toContain("Sam");
    expect(fr.text).toContain("CADEAU-AAAA-BBBB");
    expect(fr.text).toContain("Aucune date d'expiration");
    expect(fr.text).toContain("/gift-card");
    expect(renderGiftCard({ ...base, locale: "en" }).text).toContain("No expiry date");
  });

  it("never lets the buyer's words become markup", () => {
    const html = renderGiftCard({ ...base, fromName: "<b>Sam</b>", message: "<img src=x onerror=alert(1)>\nbye" }).html;
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<b>Sam</b>");
    expect(html).toContain("&lt;img src=x");
  });

  it("tells the giver when it leaves, in Montréal time", () => {
    const m = renderGiftCardReceipt({ locale: "fr", name: "Sam", toName: "Alex", toEmail: "alex@example.com", amountCents: 5000, code: "CADEAU-AAAA-BBBB", sendAt: new Date("2026-12-25T13:00:00Z") });
    expect(m.text).toContain("25 décembre");
    expect(m.text).toContain("alex@example.com");
  });

  it("shows cents on a balance that has them", () => {
    expect(renderGiftCardBalance({ locale: "en", code: "CADEAU-AAAA-BBBB", balanceCents: 1801 }).subject).toContain("18.01");
    expect(renderGiftCardBalance({ locale: "en", code: "CADEAU-AAAA-BBBB", balanceCents: 1800 }).subject).toContain("$18");
  });
});

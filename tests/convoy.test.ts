import { describe, expect, it } from "vitest";
import { deliveryWindow, dropCode, nextCloseDate } from "@/lib/drops";
import { renderOrderConfirmation, type OrderView } from "@/lib/email-templates";

const mtl = (d: Date) => d.toLocaleString("en-CA", { timeZone: "America/Toronto", hour12: false });

describe("convoy dates", () => {
  it("closes on the next 1st or 15th at 23:59 Montréal, through daylight saving", () => {
    // Late September → next close is October 1st (EDT, UTC−4)
    const oct = nextCloseDate(new Date("2026-09-24T18:00:00Z"));
    expect(mtl(oct)).toContain("2026-10-01");
    expect(mtl(oct)).toContain("23:59");
    expect(dropCode(oct)).toBe("2026-10-01");

    // Early October → the 15th
    expect(dropCode(nextCloseDate(new Date("2026-10-05T18:00:00Z")))).toBe("2026-10-15");

    // Late November → December 1st, now EST (UTC−5)
    const dec = nextCloseDate(new Date("2026-11-20T18:00:00Z"));
    expect(mtl(dec)).toContain("2026-12-01");
    expect(mtl(dec)).toContain("23:59");
  });

  it("promises a delivery window that starts after the supplier order day", () => {
    const ordersOn = new Date("2026-10-02T12:59:00Z");
    const w = deliveryWindow(ordersOn);
    expect(w.from.getTime()).toBeGreaterThan(ordersOn.getTime());
    expect(w.to.getTime()).toBeGreaterThan(w.from.getTime());
  });
});

describe("convoy in the confirmation email", () => {
  const base: OrderView = {
    locale: "fr",
    reference: "ckconvoy12345678",
    placedAt: new Date("2026-09-24T15:00:00Z"),
    name: "Camille Gagnon",
    email: "camille@example.com",
    items: [{ slug: "facial-ice-roller", name: "Rouleau de glace", options: [], qty: 1, unitCents: 2699, image: null, components: [] }],
    subtotalCents: 2699,
    discountCents: 0,
    promoCode: null,
    shippingCents: 0,
    totalCents: 2699,
    address: ["Camille Gagnon", "1 rue Test", "Montréal, QC  H2X 1Y4", "Canada"],
    loyalty: null,
    convoy: {
      code: "2026-10-01",
      ordersOn: new Date("2026-10-02T12:59:00Z"),
      deliveryFrom: new Date("2026-10-16T12:59:00Z"),
      deliveryTo: new Date("2026-10-30T12:59:00Z"),
    },
  };

  it("repeats the dispatch day, the window and the cancellation option", () => {
    const m = renderOrderConfirmation(base);
    expect(m.text).toContain("2 octobre");
    expect(m.text).toContain("16 octobre");
    expect(m.text).toContain("30 octobre");
    expect(m.text).toContain("rembourse");
  });

  it("says nothing about convoys for a solo order", () => {
    const m = renderOrderConfirmation({ ...base, convoy: null });
    expect(m.text).not.toContain("convoi");
  });
});

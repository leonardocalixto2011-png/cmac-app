import { describe, expect, it } from "vitest";
import { PICKUP } from "@/lib/pickup";
import { renderOrderConfirmation, type OrderView } from "@/lib/email-templates";

const base: OrderView = {
  locale: "fr",
  reference: "ckpickup12345678",
  placedAt: new Date("2026-09-28T15:00:00Z"),
  name: "Camille Gagnon",
  email: "camille@example.com",
  items: [{ slug: "facial-ice-roller", name: "Rouleau de glace", options: [], qty: 1, unitCents: 2699, image: null, components: [] }],
  subtotalCents: 2699,
  discountCents: 0,
  promoCode: null,
  shippingCents: 0,
  totalCents: 2699,
  address: [],
  loyalty: null,
  convoy: null,
  pickup: true,
};

describe("local pickup in the confirmation email", () => {
  it("tells the customer we write to arrange it, and never promises 48 h while stock is elsewhere", () => {
    const m = renderOrderConfirmation(base);
    expect(m.text).toMatch(/ramassage/i);
    expect(m.text).toContain(PICKUP.cityFr);
    // The wait only shrinks once we hold stock here; until then the email must not claim otherwise.
    expect(m.text.includes("48 h")).toBe(PICKUP.localStock);
  });

  it("says nothing about pickup for a shipped order", () => {
    const m = renderOrderConfirmation({ ...base, pickup: false, shippingCents: 999, totalCents: 3698, address: ["Camille Gagnon", "1 rue Test", "Montréal, QC  H2X 1Y4", "Canada"] });
    expect(m.text).not.toMatch(/ramassage/i);
  });

  it("works in English too", () => {
    const m = renderOrderConfirmation({ ...base, locale: "en" });
    expect(m.text).toMatch(/local pickup/i);
    expect(m.subject).toBeTruthy();
  });
});

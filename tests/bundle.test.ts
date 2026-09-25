import { describe, expect, it } from "vitest";
import { applyBundle, bundleFor } from "@/lib/bundle";

const quiet = new Date("2026-10-10T12:00:00Z"); // no seasonal code running
const blackFriday = new Date("2026-11-28T12:00:00Z"); // BF20 live

describe("build-your-own-set tiers", () => {
  it("does nothing under 3 single items", () => {
    const s = bundleFor([{ slug: "facial-ice-roller", priceCents: 2699, qty: 2 }], quiet);
    expect(s.percent).toBe(0);
    expect(s.savingCents).toBe(0);
    expect(s.next).toEqual({ items: 1, percent: 10 });
  });

  it("takes 10 % at 3 items and 15 % at 5, per line, rounded", () => {
    const lines = [
      { slug: "facial-ice-roller", priceCents: 2699, qty: 1 },
      { slug: "satin-scrunchie", priceCents: 1299, qty: 2 },
    ];
    const three = applyBundle(lines, quiet);
    expect(three.percent).toBe(10);
    expect(three.lines[0].priceCents).toBe(2429);
    expect(three.lines[1].priceCents).toBe(1169);
    expect(three.savingCents).toBe(2699 - 2429 + (1299 - 1169) * 2);

    const five = bundleFor([...lines, { slug: "spa-headband", priceCents: 1299, qty: 2 }], quiet);
    expect(five.percent).toBe(15);
    expect(five.next).toBeNull();
  });

  it("ignores sets and the $0 gift, but keeps them in the cart", () => {
    const lines = [
      { slug: "set-full-ritual", priceCents: 16999, qty: 1 },
      { slug: "satin-scrunchie", priceCents: 0, qty: 1 },
      { slug: "facial-ice-roller", priceCents: 2699, qty: 3 },
    ];
    const r = applyBundle(lines, quiet);
    expect(r.percent).toBe(10);
    expect(r.lines[0].priceCents).toBe(16999);
    expect(r.lines[1].priceCents).toBe(0);
    expect(r.lines[2].priceCents).toBe(2429);
  });

  it("pauses while a seasonal code campaign runs", () => {
    const s = bundleFor([{ slug: "facial-ice-roller", priceCents: 2699, qty: 5 }], blackFriday);
    expect(s.percent).toBe(0);
    expect(s.paused).toBe(true);
    expect(s.next).toBeNull();
  });
});

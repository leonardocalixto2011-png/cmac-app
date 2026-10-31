import { describe, expect, it } from "vitest";
import { holidayCutoff } from "@/lib/brand";
import { activePromo, PROMOS } from "@/lib/promos";
import { CHRISTMAS, christmasOrderDay, christmasPhase } from "@/lib/season";

describe("christmasPhase", () => {
  it("stays off for Halloween and switches on at midnight in Montréal", () => {
    expect(christmasPhase(new Date("2026-11-01T03:59:00Z"))).toBeNull();
    expect(christmasPhase(new Date(CHRISTMAS.startsAt))).toBe("order");
  });

  it("still takes orders for Christmas on the last day, then says it can't promise", () => {
    expect(christmasPhase(new Date(2026, 10, 26, 18))).toBe("order");
    expect(christmasPhase(new Date(2026, 10, 27, 1))).toBe("late");
  });

  it("switches off the day after Christmas", () => {
    expect(christmasPhase(new Date("2026-12-25T23:00:00Z"))).toBe("late");
    expect(christmasPhase(new Date(CHRISTMAS.endsAt))).toBeNull();
  });
});

describe("the order date", () => {
  it("names the day the campaign bars name", () => {
    expect(christmasOrderDay("en", new Date("2026-11-02T12:00:00Z"))).toBe("November 26");
    expect(christmasOrderDay("fr", new Date("2026-11-02T12:00:00Z"))).toBe("26 novembre");
  });

  it("counts until the end of that day", () => {
    expect(holidayCutoff(new Date(2026, 10, 26, 23, 30))).not.toBeNull();
    expect(holidayCutoff(new Date(2026, 10, 27, 0, 30))).toBeNull();
  });
});

describe("the campaign bar through the season", () => {
  const at = (iso: string) => activePromo(new Date(iso))?.id;

  it("always says something true about delivery", () => {
    expect(at("2026-11-02T12:00:00Z")).toBe("christmas-order-by-2026");
    expect(at("2026-11-21T12:00:00Z")).toBe("black-friday-week-2026");
    expect(at("2026-11-28T12:00:00Z")).toBe("black-friday-2026");
    expect(at("2026-12-10T12:00:00Z")).toBe("christmas-late-2026");
    expect(at("2026-12-27T12:00:00Z")).toBe("boxing-day-2026");
  });

  it("asks Stripe only for campaigns that have a code", () => {
    expect(PROMOS.filter((p) => p.code === null).every((p) => p.percentOff === 0)).toBe(true);
  });
});

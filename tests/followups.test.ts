import { describe, expect, it } from "vitest";
import { renderCheckoutReminder, renderReviewRequest, type ItemView } from "@/lib/email-templates";
import { suggestedAuthor } from "@/lib/reviews";

const items: ItemView[] = [{ slug: "nail-care-pen", name: "5-in-1 Nail Care Pen", options: [], qty: 1, unitCents: 2999, image: null, components: [] }];
const ADDRESS = "CMAC Beauty, 209 rue Paré, L'Assomption (QC) J5W 0K5, Canada";

describe("checkout reminder", () => {
  it("carries the restore link, the free-shipping gap and the CASL footer", () => {
    const m = renderCheckoutReminder({ locale: "fr", items, restoreUrl: "https://cmacbeauty.ca/cart?restore=abc", mailingAddress: ADDRESS, freeShippingCents: 7500, subtotalCents: 2999 });
    expect(m.subject).toContain("panier");
    expect(m.text).toContain("https://cmacbeauty.ca/cart?restore=abc");
    expect(m.text).toContain("45,01");
    expect(m.text).toContain("209 rue Paré");
    expect(m.text).toContain("mailto:bonjour@cmacbeauty.ca?subject=unsubscribe");
    expect(m.text).toContain("seul rappel");
  });
});

describe("review request", () => {
  it("links to the review form and to the stop link", () => {
    const m = renderReviewRequest({
      locale: "en",
      name: "camille gagnon",
      reference: "ckabcdef12345678",
      items,
      reviewUrl: "https://cmacbeauty.ca/review/tok?lang=en",
      stopUrl: "https://cmacbeauty.ca/review/tok?lang=en&stop=1",
      mailingAddress: ADDRESS,
    });
    expect(m.subject).toContain("review");
    expect(m.html).toContain("Camille");
    expect(m.text).toContain("https://cmacbeauty.ca/review/tok?lang=en&stop=1");
    expect(m.text).toContain("less-good reviews are both published");
    expect(m.text).toContain("209 rue Paré");
  });
});

describe("review author", () => {
  it("suggests first name + last initial", () => {
    expect(suggestedAuthor("Camille Gagnon")).toBe("Camille G.");
    expect(suggestedAuthor("Camille")).toBe("Camille");
    expect(suggestedAuthor(null)).toBe("");
  });
});

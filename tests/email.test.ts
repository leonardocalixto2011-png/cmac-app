import { describe, expect, it } from "vitest";
import { emailImage, firstNameOf } from "@/lib/email-kit";
import { carrierFromUrl, renderOrderConfirmation, tipsFor, type OrderView } from "@/lib/email-templates";

describe("email helpers", () => {
  it("extracts a friendly first name", () => {
    expect(firstNameOf("MARIE-ÈVE TREMBLAY")).toBe("Marie-Ève");
    expect(firstNameOf("camille gagnon")).toBe("Camille");
    expect(firstNameOf("DeShawn Smith")).toBe("DeShawn");
    expect(firstNameOf("  ")).toBeNull();
    expect(firstNameOf(null)).toBeNull();
  });
  it("resizes Cloudinary images to JPEG and leaves others alone", () => {
    const src = "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013183/cmac/products/led/final-0";
    expect(emailImage(src)).toBe("https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_160,h_200,g_auto/f_jpg/q_auto/v1790013183/cmac/products/led/final-0");
    expect(emailImage("https://cmacbeauty.ca/sets/a.jpg")).toBe("https://cmacbeauty.ca/sets/a.jpg");
    expect(emailImage("http://insecure/a.jpg")).toBeNull();
  });
  it("guesses the carrier from the tracking link", () => {
    expect(carrierFromUrl("https://www.canadapost-postescanada.ca/track?x")).toBe("Canada Post");
    expect(carrierFromUrl("https://cjpacket.com/?trackingNumber=1")).toBe("CJPacket");
    expect(carrierFromUrl(null)).toBeNull();
  });
  it("dedupes tips and expands sets", () => {
    const tips = tipsFor(
      [
        { slug: "set-x", name: "Set", options: [], qty: 1, unitCents: 1, image: null, components: [
          { slug: "satin-scrunchie", name: "Scrunchie", qty: 1, image: null },
          { slug: "satin-sleep-mask", name: "Mask", qty: 1, image: null },
          { slug: "facial-ice-roller", name: "Roller", qty: 1, image: null },
        ] },
      ],
      "en",
    );
    expect(tips.map((t) => t.name)).toEqual(["Scrunchie", "Roller"]);
  });
});

describe("order confirmation", () => {
  const base: OrderView = {
    locale: "fr", reference: "abc123def456", placedAt: new Date("2026-09-21T12:00:00Z"), name: null, email: "a@example.com",
    items: [{ slug: "facial-ice-roller", name: "Rouleau", options: ["Rose"], qty: 1, unitCents: 2699, image: null, components: [] }],
    subtotalCents: 2699, discountCents: 0, promoCode: null, shippingCents: 999, totalCents: 3698, address: [], loyalty: { kind: "guest", points: 26 },
  };
  it("has bilingual subjects, a greeting fallback and a plain-text version", () => {
    const fr = renderOrderConfirmation(base);
    expect(fr.subject).toBe("Votre rituel CMAC est confirmé ✨ (commande n° 23DEF456)");
    expect(fr.text).toContain("Bonjour,");
    expect(fr.text).toContain("Leonart, CMAC Beauty");
    const en = renderOrderConfirmation({ ...base, locale: "en" });
    expect(en.subject).toBe("Your CMAC ritual is confirmed ✨ (Order #23DEF456)");
    expect(en.text).toContain("Hi there,");
    expect(en.html).toContain("26 points are waiting for you");
  });
});

/**
 * One-off preview of a shipping notice with the "goes with your order" block.
 *   npx tsx scripts/preview-shipped-one.ts <out.html>
 * Touches nothing: no database, no Stripe, no email.
 */
import { writeFileSync } from "node:fs";
import { renderShipped, type OrderView } from "../src/lib/email-templates";
import { promoToMention } from "../src/lib/promos";

const view: OrderView = {
  locale: "en",
  reference: "cmwbo5nt50004js08hq95ey9i",
  placedAt: new Date("2026-11-11T05:19:00Z"),
  name: "Selena Martin",
  email: "customer@example.com",
  items: [
    {
      slug: "satin-bonnet",
      name: "Adjustable Satin Bonnet",
      qty: 1,
      priceCents: 1699,
      options: ["Coffee"],
      image: null,
      components: [],
    } as unknown as OrderView["items"][number],
  ],
  subtotalCents: 1699,
  discountCents: 170,
  promoCode: "WELCOME10",
  shippingCents: 0,
  totalCents: 1699,
  address: [],
  pickup: false,
  convoy: null,
  loyalty: null,
  trackingNumber: "CACAINIAO00008849483",
  trackingUrl: "https://t.17track.net/en#nums=CACAINIAO00008849483",
};

const m = renderShipped(view, {
  products: [
    { slug: "set-silky-hair", name: "Silky Hair Box", priceCents: 4599, compareAtCents: null, image: "https://cmacbeauty.ca/sets/set-silky-hair.jpg", isSet: true },
    { slug: "heatless-curl-set", name: "Heatless Curl Set", priceCents: 2499, compareAtCents: null, image: null, isSet: false },
    { slug: "hair-towel-wrap", name: "Hair Towel Wrap", priceCents: 1799, compareAtCents: null, image: null, isSet: false },
  ],
  promo: promoToMention("en", new Date("2026-11-14T04:00:00Z")),
  mailingAddress: "6894 boul. Gouin Est, Montréal (Québec)",
});
writeFileSync(process.argv[2], m.html);
console.log(m.subject + "\n\n" + m.text);

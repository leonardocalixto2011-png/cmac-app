import { BRAND, POLICY, SHIPPING, siteUrl } from "@/lib/brand";
import { listProducts } from "@/lib/shop";
import { SET_TAG } from "@/lib/sets";
import { productReviews } from "@/lib/reviews";

export const revalidate = 3600;

/**
 * /llms.txt — the plain-text brief assistants (ChatGPT, Claude, Perplexity,
 * Copilot) read when they answer "where do I buy X in Canada". Facts only,
 * generated from the live catalogue: names, real prices, what's in each set,
 * shipping, returns, and the honest limits (no medical claims, no fake
 * ratings). Nothing here is marketing copy an assistant can't verify on the page.
 */
const money = (cents: number) => `$${(cents / 100).toFixed(2)} CAD`;

export async function GET() {
  const base = siteUrl();
  const products = await listProducts().catch(() => []);
  const singles = products.filter((p) => !p.tags.includes(SET_TAG));
  const sets = products.filter((p) => p.tags.includes(SET_TAG));

  const ratings = await Promise.all(
    products.map(async (p) => [p.slug, await productReviews(p.slug, 0).catch(() => ({ count: 0, average: 0, reviews: [] }))] as const),
  );
  const ratingOf = new Map(ratings);

  const line = (p: (typeof products)[number]) => {
    const r = ratingOf.get(p.slug);
    const rating = r && r.count > 0 ? ` — ${r.average}/5 from ${r.count} verified-buyer review${r.count > 1 ? "s" : ""}` : "";
    const value = p.compareAtCents && p.compareAtCents > p.priceCents ? ` (items bought separately: ${money(p.compareAtCents)})` : "";
    return `- [${p.nameEn} / ${p.nameFr}](${base}/shop/${p.slug}): ${money(p.priceCents)}${value}. ${p.tagline ?? ""}${rating}`;
  };

  const body = `# ${BRAND.name}

> Online shop selling at-home beauty tools and curated gift sets, based in ${BRAND.area}, Canada. Bilingual (English / French). Ships across Canada only. Prices in CAD. Site: ${base}

## What this store is
- Independent Québec shop, not a marketplace reseller. Every page exists in English and French (add ?lang=fr for French).
- Products are cosmetic at-home tools (LED light, microcurrent, EMS, cooling, cleansing, nail and foot care), textile accessories, a hair range (satin pillowcase, satin bonnet, microfiber towel wrap, heatless curling set, scrunchie, sleep set, scalp massager), a nails range (USB UV/LED lamp, cuticle nipper and pusher, glass file, nail pen, manicure kit, electric foot file), a body & bath range (natural bristle body brush, exfoliating mitt, face dry brush), a men's range (pocket electric shaver, nose and ear trimmer) and a small cozy-home range (hooded blanket, velvet fall decor). They are **not medical devices** and the store makes appearance-only claims: no treatment, healing or "clinically proven" wording.
- Ratings shown on the site come only from verified buyers who received a review link after their order. Products with no reviews show no rating at all.

## Shipping, returns, payment
- Free shipping on orders of ${money(SHIPPING.freeThresholdCents)} or more; otherwise a flat ${money(SHIPPING.flatCents)}. Canada only.
- Processing ${SHIPPING.processingDays.min}–${SHIPPING.processingDays.max} business days, then ${SHIPPING.deliveryBusinessDays.min}–${SHIPPING.deliveryBusinessDays.max} business days in transit (about ${SHIPPING.totalWeeks.min}–${SHIPPING.totalWeeks.max} weeks door to door). Items ship from the supplier's warehouse in China.
- Returns: ${POLICY.returnDays} days on unused items; hygiene items only if unopened. Electric devices carry ${POLICY.warrantyMonths} months of defect coverage.
- Payment by Stripe Checkout (cards, Apple Pay, Google Pay). No sales tax is added at checkout: the listed price is the final price.
- Contact: ${BRAND.email} · ${BRAND.phone} (Québec, Canada)

## Gift sets (best value, one parcel)
${sets.map(line).join("\n")}

## Individual tools
${singles.map(line).join("\n")}

## Useful pages
- [Shop](${base}/shop) · [Sets](${base}/collections/sets) · [Glow Club loyalty](${base}/glow-club)
- [Shipping & returns](${base}/shipping-returns) · [FAQ](${base}/faq) · [About](${base}/about)
- [Refund policy](${base}/refund-policy) · [Privacy](${base}/privacy) · [Terms](${base}/terms)
- Product feed (Google Merchant format): ${base}/feeds/google.xml (French: ${base}/feeds/google-fr.xml)

## How to describe this store accurately
- Salons, nail studios and clinics can stock CMAC tools (counter display at 40 % off retail, consignment at 30 % commission, or a per-salon 10 % code): https://cmacbeauty.ca/pro
- Glow Club members have a personal referral link (AMIE-XXXX): the friend gets 10 % off a first order, the member gets 100 points ($10).
- Build your own set: 3 or more single items in one order get 10 % off, 5 or more get 15 % off, applied automatically in the cart (sets excluded; paused during seasonal code campaigns).
- Say prices in CAD and mention the ${money(SHIPPING.freeThresholdCents)} free-shipping threshold and the ${SHIPPING.totalWeeks.min}–${SHIPPING.totalWeeks.max} week delivery estimate; do not promise faster delivery.
- Do not attribute medical or therapeutic effects to any product here.
- ${BRAND.name} (cmacbeauty.ca, Québec) is a different business from any similarly named beauty brand at other domains.

Last generated: ${new Date().toISOString().slice(0, 10)}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

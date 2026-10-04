// Google Merchant Center feed builder (EN + FR). Used by /feeds/google.xml and /feeds/google-fr.xml.
import { BRAND, SHIPPING, siteUrl } from "@/lib/brand";
import { listProducts } from "@/lib/shop";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const plain = (html: string | null) =>
  (html ?? "")
    .replace(/<\/(p|li|h3)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4900);

const money = (cents: number) => `${(cents / 100).toFixed(2)} CAD`;

const DEFAULT_CATEGORY = "Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools > Skin Care Tools";
/** Non-device add-ons get a closer Google category than the default skin-care-tool one. */
/** Our own breadcrumb for Google: coarse, stable, and useful for bid grouping later. */
function productType(p: { tags: string[] }, fr: boolean): string {
  const map: Record<string, [string, string]> = {
    sets: ["Gift sets", "Coffrets"],
    hair: ["Hair", "Cheveux"],
    nails: ["Nails", "Ongles"],
    body: ["Body & bath", "Corps et bain"],
    men: ["Men", "Hommes"],
    cozy: ["Cozy home", "Cocooning"],
    glow: ["Glow", "Éclat"],
    sculpt: ["Sculpt", "Sculpter"],
    cool: ["Cooling", "Fraîcheur"],
  };
  const hit = p.tags.map((t) => map[t]).find(Boolean);
  const head = fr ? "Beauté" : "Beauty";
  return hit ? `${head} > ${fr ? hit[1] : hit[0]}` : head;
}

const CATEGORY_BY_SLUG: Record<string, string> = {
  "satin-scrunchie": "Apparel & Accessories > Clothing Accessories > Hair Accessories",
  "pink-shell-makeup-pouch": "Luggage & Bags > Cosmetic & Toiletry Bags",
  "travel-makeup-organizer": "Luggage & Bags > Cosmetic & Toiletry Bags",
  "cozy-fleece-socks": "Apparel & Accessories > Clothing > Underwear & Socks > Socks",
  "satin-beauty-sleep-set": "Health & Beauty > Personal Care",
  "set-fall-basket": "Health & Beauty > Personal Care",
  "nail-care-pen": "Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools > Nail Tools",
  "rose-gold-manicure-kit": "Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools > Nail Tools",
  "gel-manicure-gloves": "Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools > Nail Tools",
  "electric-foot-file": "Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools > Nail Tools",
};

/**
 * Single-unit commodities we do not advertise, because Shopping puts our unit
 * price beside a multipack and we lose by 3-8x (Amazon.ca, checked 2026-09-28:
 * 5-8 satin scrunchies $11.99, 2 satin pillowcases $9.75, 4 sleep masks $9.89,
 * 6 spa headbands $21.99, fleece socks ~$5/pair, hooded blankets from $37.72).
 *
 * The cause is structural, not a bad supplier deal: per-unit dropship shipping
 * is nearly flat, so on a $0.33 scrunchie the $3.81 parcel is 92% of our cost.
 * Inside a set parcel the same scrunchie adds ~$0.40, which is why these items
 * still earn their place as set components — just not as standalone ads. One
 * impression of a lone $12.99 scrunchie next to a $11.99 eight-pack costs us
 * the credibility of the LED mask, where we are the cheapest in the country.
 *
 * Revisit each line when local stock lands (multipacks become possible) or the
 * price moves; they stay purchasable on the site throughout.
 */
const FEED_EXCLUDE = new Set([
  "satin-scrunchie",
  "satin-pillowcase",
  "satin-sleep-mask",
  "spa-headband",
  "cozy-fleece-socks",
  "hooded-sherpa-blanket",
  "facial-ice-roller",
]);

/**
 * Every feed image is served from our own domain.
 *
 * Pinterest ingested the feed twice (2026-10-02 and 10-03) with the same result:
 * 7 products rejected with "cannot fetch image" and 22 extra images answered 429.
 * The rejected products were exactly the ones whose main image sat on
 * res.cloudinary.com — the LED mask among them — while all 32 products with a
 * main image on cmacbeauty.ca went through. Pre-warming the Cloudinary URLs
 * changed nothing, so it is the crawler being refused, not a cold cache.
 * Supplier CDNs (CJ, Aliyun) refuse hotlinks the same way.
 *
 * Routing through /_next/image makes Vercel fetch each source once and cache
 * it; crawlers only ever talk to us. f_auto becomes f_jpg so the answer is a
 * JPEG, which every catalog accepts.
 */
function feedImage(url: string, base: string): string {
  if (url.startsWith(base) || url.startsWith("/")) return url.startsWith("/") ? `${base}${url}` : url;
  const src = url.replace("/f_auto/", "/f_jpg/");
  return `${base}/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75`;
}

export async function buildGoogleFeed(locale: "en" | "fr"): Promise<Response> {
  const base = siteUrl();
  const products = await listProducts();
  const fr = locale === "fr";

  const items = products
    .filter((p) => p.images.length > 0 && !FEED_EXCLUDE.has(p.slug))
    .map((p) => {
      // Sets: compareAt = the items bought separately, not a former price → never a Google sale_price.
      const onSale = !p.tags.includes("sets") && p.compareAtCents != null && p.compareAtCents > p.priceCents;
      const name = fr ? p.nameFr : p.nameEn;
      const tag = fr ? p.taglineFr : p.tagline;
      // Google Shopping matches the title against the query: brand + product words win,
      // taglines do not. The tagline still opens the description, where it sells.
      const title = `${BRAND.name} ${name}`;
      const body = plain(fr ? p.descriptionFr : p.descriptionEn);
      const desc = [tag, body].filter(Boolean).join(" — ") || title;
      const extra = p.images
        .slice(1, 10)
        .map((u) => `<g:additional_image_link>${esc(feedImage(u, base))}</g:additional_image_link>`)
        .join("");
      return `
    <item>
      <g:id>${esc(fr ? `${p.slug}-fr` : p.slug)}</g:id>
      <g:item_group_id>${esc(p.slug)}</g:item_group_id>
      <g:title>${esc(title.slice(0, 150))}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>${esc(`${base}/shop/${p.slug}${fr ? "?lang=fr" : ""}`)}</g:link>
      <g:image_link>${esc(feedImage(p.images[0], base))}</g:image_link>${extra}
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${esc(BRAND.name)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>${p.tags.includes("sets") ? `
      <g:is_bundle>yes</g:is_bundle>` : ""}
      <g:product_type>${esc(productType(p, fr))}</g:product_type>
      <g:google_product_category>${esc(CATEGORY_BY_SLUG[p.slug] ?? DEFAULT_CATEGORY)}</g:google_product_category>
      <g:price>${money(onSale ? p.compareAtCents! : p.priceCents)}</g:price>${onSale ? `
      <g:sale_price>${money(p.priceCents)}</g:sale_price>` : ""}
      <g:shipping>
        <g:country>CA</g:country>
        <g:service>Standard</g:service>
        <g:price>${money(p.priceCents >= SHIPPING.freeThresholdCents ? 0 : SHIPPING.flatCents)}</g:price>
        <g:min_handling_time>${SHIPPING.processingDays.min}</g:min_handling_time>
        <g:max_handling_time>${SHIPPING.processingDays.max}</g:max_handling_time>
        <g:min_transit_time>${SHIPPING.deliveryBusinessDays.min}</g:min_transit_time>
        <g:max_transit_time>${SHIPPING.deliveryBusinessDays.max}</g:max_transit_time>
      </g:shipping>
      <g:custom_label_0>${esc(p.tags.join(" "))}</g:custom_label_0>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(BRAND.name)}</title>
    <link>${esc(base)}</link>
    <description>${esc(fr ? `Flux de produits ${BRAND.name}` : `${BRAND.name} product feed`)}</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}

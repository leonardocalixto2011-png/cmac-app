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
const CATEGORY_BY_SLUG: Record<string, string> = {
  "satin-scrunchie": "Apparel & Accessories > Clothing Accessories > Hair Accessories",
  "pink-shell-makeup-pouch": "Luggage & Bags > Cosmetic & Toiletry Bags",
  "travel-makeup-organizer": "Luggage & Bags > Cosmetic & Toiletry Bags",
  "cozy-fleece-socks": "Apparel & Accessories > Clothing > Underwear & Socks > Socks",
  "satin-beauty-sleep-set": "Health & Beauty > Personal Care",
};

export async function buildGoogleFeed(locale: "en" | "fr"): Promise<Response> {
  const base = siteUrl();
  const products = await listProducts();
  const fr = locale === "fr";

  const items = products
    .filter((p) => p.images.length > 0)
    .map((p) => {
      const onSale = p.compareAtCents != null && p.compareAtCents > p.priceCents;
      const name = fr ? p.nameFr : p.nameEn;
      const tag = fr ? p.taglineFr : p.tagline;
      const title = tag ? `${name} – ${tag}` : name;
      const desc = plain(fr ? p.descriptionFr : p.descriptionEn) || title;
      const extra = p.images
        .slice(1, 10)
        .map((u) => `<g:additional_image_link>${esc(u)}</g:additional_image_link>`)
        .join("");
      return `
    <item>
      <g:id>${esc(fr ? `${p.slug}-fr` : p.slug)}</g:id>
      <g:item_group_id>${esc(p.slug)}</g:item_group_id>
      <g:title>${esc(title.slice(0, 150))}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>${esc(`${base}/shop/${p.slug}${fr ? "?lang=fr" : ""}`)}</g:link>
      <g:image_link>${esc(p.images[0])}</g:image_link>${extra}
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${esc(BRAND.name)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>${p.tags.includes("sets") ? `
      <g:is_bundle>yes</g:is_bundle>` : ""}
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

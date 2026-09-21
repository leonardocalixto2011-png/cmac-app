// Google Merchant Center product feed (free Shopping listings + ads later).
// Submit https://cmacbeauty.ca/feeds/google.xml as a "scheduled fetch" data source.
import { BRAND, SHIPPING, siteUrl } from "@/lib/brand";
import { listProducts } from "@/lib/shop";

export const revalidate = 3600;

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

export async function GET() {
  const base = siteUrl();
  const products = await listProducts();

  const items = products
    .filter((p) => p.images.length > 0)
    .map((p) => {
      const onSale = p.compareAtCents != null && p.compareAtCents > p.priceCents;
      const title = p.tagline ? `${p.nameEn} – ${p.tagline}` : p.nameEn;
      const extra = p.images
        .slice(1, 10)
        .map((u) => `<g:additional_image_link>${esc(u)}</g:additional_image_link>`)
        .join("");
      return `
    <item>
      <g:id>${esc(p.slug)}</g:id>
      <g:title>${esc(title.slice(0, 150))}</g:title>
      <g:description>${esc(plain(p.descriptionEn) || title)}</g:description>
      <g:link>${esc(`${base}/shop/${p.slug}`)}</g:link>
      <g:image_link>${esc(p.images[0])}</g:image_link>${extra}
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${esc(BRAND.name)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Cosmetic Tools &gt; Skin Care Tools</g:google_product_category>
      <g:price>${money(onSale ? p.compareAtCents! : p.priceCents)}</g:price>${onSale ? `
      <g:sale_price>${money(p.priceCents)}</g:sale_price>` : ""}
      <g:shipping>
        <g:country>CA</g:country>
        <g:service>Standard</g:service>
        <g:price>${money(p.priceCents >= SHIPPING.freeThresholdCents ? 0 : SHIPPING.flatCents)}</g:price>
        <g:min_handling_time>1</g:min_handling_time>
        <g:max_handling_time>3</g:max_handling_time>
        <g:min_transit_time>7</g:min_transit_time>
        <g:max_transit_time>15</g:max_transit_time>
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
    <description>${esc(`${BRAND.name} product feed`)}</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}

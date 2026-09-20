import { adminListProducts } from "@/lib/admin";
import { ProductsManager } from "./ProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const rows = await adminListProducts();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[clamp(1.6rem,1.3rem+1.4vw,2.2rem)]">Products</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Tags decide collections: <code>glow</code>, <code>sculpt</code>, <code>cool</code> (+ <code>new</code> for the badge,{" "}
          <code>hygiene</code> hides the warranty line). Images are URLs, one per line. Copy stays cosmetic / appearance-only
          (no “treats”, “heals”, “stimulates collagen”, “clinically proven”).
        </p>
      </div>
      <ProductsManager
        products={rows.map((p) => ({
          slug: p.slug,
          nameEn: p.nameEn,
          nameFr: p.nameFr,
          tagline: p.tagline ?? "",
          taglineFr: p.taglineFr ?? "",
          descriptionEn: p.descriptionEn ?? "",
          descriptionFr: p.descriptionFr ?? "",
          priceDollars: p.priceCents / 100,
          compareAtDollars: p.compareAtCents != null ? p.compareAtCents / 100 : null,
          tagsCsv: p.tags.join(", "),
          imagesCsv: (Array.isArray(p.images) ? (p.images as string[]) : []).join("\n"),
          optionsJson: JSON.stringify(p.options ?? [], null, 2),
          active: p.active,
          supplierUrl: p.supplierUrl ?? "",
          supplierSku: p.supplierSku ?? "",
          shippingNote: p.shippingNote ?? "",
        }))}
      />
    </div>
  );
}

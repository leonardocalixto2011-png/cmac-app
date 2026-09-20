import type { Metadata } from "next";
import { listProducts } from "@/lib/shop";
import { serverT } from "@/i18n/server";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("shop.title"), description: t("shop.intro"), alternates: { canonical: "/shop" } };
}

export default async function ShopPage() {
  const { t } = await serverT();
  const products = await listProducts();
  return (
    <section className="section-pad">
      <div className="wrap">
        <ProductGrid products={products} title={t("shop.title")} intro={t("shop.intro")} />
      </div>
    </section>
  );
}

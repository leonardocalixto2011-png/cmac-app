import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isCollectionHandle, listProducts } from "@/lib/shop";
import { serverT } from "@/i18n/server";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  if (!isCollectionHandle(handle)) return { title: "Shop" };
  const { t } = await serverT();
  return {
    title: t(`coll.${handle}.t`),
    description: t(`coll.${handle}.d`),
    alternates: { canonical: `/collections/${handle}` },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (!isCollectionHandle(handle)) notFound();
  const { t } = await serverT();
  const products = await listProducts(handle);

  return (
    <section className="section-pad">
      <div className="wrap">
        <ProductGrid
          products={products}
          title={t(`coll.${handle}.t`)}
          intro={t(`coll.${handle}.d`)}
          eyebrow={t("shop.title")}
          showFilters={false}
        />
      </div>
    </section>
  );
}

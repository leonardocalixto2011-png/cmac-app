import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isCollectionHandle, listProducts } from "@/lib/shop";
import { serverT } from "@/i18n/server";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { JsonLd, breadcrumbLd, itemListLd } from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  if (!isCollectionHandle(handle)) return { title: "Shop" };
  const { t } = await serverT();
  return {
    title: t(`coll.${handle}.t`),
    description: t(`coll.${handle}.d`),
    alternates: {
      canonical: `/collections/${handle}`,
      languages: { "en-CA": `/collections/${handle}`, "fr-CA": `/collections/${handle}?lang=fr`, "x-default": `/collections/${handle}` },
    },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (!isCollectionHandle(handle)) notFound();
  const { t, locale } = await serverT();
  const products = await listProducts(handle);

  return (
    <section className="section-pad">
      <JsonLd data={itemListLd(t(`coll.${handle}.t`), products, locale)} />
      <JsonLd data={breadcrumbLd([{ name: t("shop.title"), path: "/shop" }, { name: t(`coll.${handle}.t`), path: `/collections/${handle}` }])} />
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

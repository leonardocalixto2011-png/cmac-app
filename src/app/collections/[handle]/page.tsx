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

  // Gift guide: people shop gifts by budget, so the page is split that way.
  const bands =
    handle === "gifts"
      ? ([
          ["small", products.filter((p) => p.priceCents < 2500)],
          ["mid", products.filter((p) => p.priceCents >= 2500 && p.priceCents < 8500)],
          ["large", products.filter((p) => p.priceCents >= 8500)],
        ] as const)
      : null;

  return (
    <section className="section-pad">
      <JsonLd data={itemListLd(t(`coll.${handle}.t`), products, locale)} />
      <JsonLd data={breadcrumbLd([{ name: t("shop.title"), path: "/shop" }, { name: t(`coll.${handle}.t`), path: `/collections/${handle}` }])} />
      <div className="wrap">
        {bands ? (
          <div className="flex flex-col gap-16">
            {bands
              .filter(([, list]) => list.length > 0)
              .map(([key, list], i) => (
                <ProductGrid
                  key={key}
                  products={list}
                  title={i === 0 ? t(`coll.${handle}.t`) : t(`gifts.band.${key}`)}
                  intro={i === 0 ? t(`coll.${handle}.d`) : t(`gifts.band.${key}D`)}
                  eyebrow={i === 0 ? t("shop.title") : t(`gifts.band.${key}`)}
                  showFilters={false}
                />
              ))}
          </div>
        ) : (
          <ProductGrid
            products={products}
            title={t(`coll.${handle}.t`)}
            intro={t(`coll.${handle}.d`)}
            eyebrow={t("shop.title")}
            showFilters={false}
          />
        )}
      </div>
    </section>
  );
}

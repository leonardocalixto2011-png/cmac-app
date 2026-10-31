import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { gridReady, isCollectionHandle, listProducts } from "@/lib/shop";
import { serverT } from "@/i18n/server";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ChristmasDates, ChristmasGuide } from "@/components/sections/Christmas";
import { Snow } from "@/components/motion/Snow";
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
  const products = gridReady(await listProducts(handle));

  if (handle === "christmas") {
    const stocking = gridReady(await listProducts("gifts")).filter((p) => p.priceCents < 2500);
    return (
      <>
        <JsonLd data={itemListLd(t(`coll.${handle}.t`), products, locale)} />
        <JsonLd data={breadcrumbLd([{ name: t("shop.title"), path: "/shop" }, { name: t(`coll.${handle}.t`), path: `/collections/${handle}` }])} />
        <header className="xmas-head">
          <Snow className="cmac-snow" />
          <div className="wrap xmas-head__copy">
            <span className="eyebrow">{t("xmas.eyebrow")}</span>
            <h1>{t(`coll.${handle}.t`)}</h1>
            <p>{t(`coll.${handle}.d`)}</p>
          </div>
        </header>
        <ChristmasDates />
        <section className="section-pad">
          <div className="wrap flex flex-col gap-16">
            <ChristmasGuide products={products} compact />
            {stocking.length > 0 && (
              <ProductGrid products={stocking} title={t("gifts.band.small")} intro={t("gifts.band.smallD")} eyebrow={t("coll.christmas.t")} showFilters={false} />
            )}
          </div>
        </section>
      </>
    );
  }

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
            <header className="mx-auto max-w-[68ch] text-center">
              <span className="eyebrow">{t("shop.title")}</span>
              <h1 className="mt-3 text-[clamp(2rem,1.5rem+2.4vw,3.2rem)]">{t(`coll.${handle}.t`)}</h1>
              <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-soft">{t(`coll.${handle}.d`)}</p>
            </header>
            {bands
              .filter(([, list]) => list.length > 0)
              .map(([key, list]) => (
                <ProductGrid
                  key={key}
                  products={list}
                  title={t(`gifts.band.${key}`)}
                  intro={t(`gifts.band.${key}D`)}
                  eyebrow={t(`coll.${handle}.t`)}
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

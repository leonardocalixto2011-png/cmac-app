import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getSetComponents } from "@/lib/shop";
import { serverLocale } from "@/i18n/server";
import { stripHtml } from "@/lib/utils";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { JsonLd, breadcrumbLd, productLd } from "@/components/JsonLd";
import { productReviews } from "@/lib/reviews";
import { ProductReviews } from "@/components/reviews/ProductReviews";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await serverLocale();
  const p = await getProduct(slug).catch(() => null);
  if (!p) return { title: "Shop" };
  const name = locale === "fr" ? p.nameFr : p.nameEn;
  const tagline = locale === "fr" ? p.taglineFr ?? p.tagline : p.tagline;
  const desc = stripHtml((locale === "fr" ? p.descriptionFr : p.descriptionEn) ?? "").slice(0, 155);
  return {
    title: tagline ? `${name} — ${tagline}` : name,
    description: desc || undefined,
    alternates: {
      canonical: `/shop/${p.slug}`,
      languages: { "en-CA": `/shop/${p.slug}`, "fr-CA": `/shop/${p.slug}?lang=fr`, "x-default": `/shop/${p.slug}` },
    },
    openGraph: { images: p.images.length ? [p.images[0]] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await serverLocale();
  const product = await getProduct(slug);
  if (!product) notFound();
  const [components, reviews] = await Promise.all([
    getSetComponents(product.slug),
    productReviews(product.slug).catch(() => ({ count: 0, average: 0, reviews: [] })),
  ]);

  return (
    <section className="section-pad">
      <JsonLd data={productLd(product, locale, reviews)} />
      <JsonLd
        data={breadcrumbLd([
          { name: locale === "fr" ? "Boutique" : "Shop", path: "/shop" },
          { name: locale === "fr" ? product.nameFr : product.nameEn, path: `/shop/${product.slug}` },
        ])}
      />
      <div className="wrap">
        <ProductDetail product={product} components={components} />
        <ProductReviews summary={reviews} locale={locale} />
      </div>
    </section>
  );
}

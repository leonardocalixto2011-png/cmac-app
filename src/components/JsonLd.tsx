import { BRAND, POLICY, SHIPPING, siteUrl } from "@/lib/brand";
import { stripHtml } from "@/lib/utils";
import type { Locale } from "@/i18n/messages";

/** Renders a <script type="application/ld+json"> block. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export function organizationLd() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: base,
    logo: `${base}/icon.svg`,
    email: BRAND.email,
    telephone: BRAND.phoneHref,
    areaServed: "CA",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Montréal",
      addressRegion: "QC",
      addressCountry: "CA",
    },
  };
}

export function productLd(
  p: {
    slug: string;
    nameEn: string;
    nameFr: string;
    descriptionEn: string | null;
    descriptionFr: string | null;
    priceCents: number;
    images: string[];
  },
  locale: Locale = "en",
  rating?: { count: number; average: number; reviews: { rating: number; authorName: string; body: string; createdAt: Date }[] } | null,
) {
  const base = siteUrl();
  const name = locale === "fr" ? p.nameFr : p.nameEn;
  const desc = locale === "fr" ? p.descriptionFr : p.descriptionEn;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: stripHtml(desc ?? "").slice(0, 400),
    image: p.images.map((i) => (i.startsWith("http") ? i : `${base}${i}`)),
    brand: { "@type": "Brand", name: BRAND.name },
    // Only real, approved verified-buyer reviews (never placeholders).
    ...(rating && rating.count > 0
      ? {
          aggregateRating: { "@type": "AggregateRating", ratingValue: rating.average, reviewCount: rating.count, bestRating: 5, worstRating: 1 },
          review: rating.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
            author: { "@type": "Person", name: r.authorName },
            datePublished: r.createdAt.toISOString().slice(0, 10),
            reviewBody: r.body.slice(0, 500),
          })),
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: `${base}/shop/${p.slug}`,
      priceCurrency: "CAD",
      price: (p.priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10),
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: BRAND.name },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "CA" },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: (p.priceCents >= SHIPPING.freeThresholdCents ? 0 : SHIPPING.flatCents) / 100,
          currency: "CAD",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: SHIPPING.processingDays.min, maxValue: SHIPPING.processingDays.max, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: SHIPPING.deliveryBusinessDays.min, maxValue: SHIPPING.deliveryBusinessDays.max, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "CA",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: POLICY.returnDays,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
      },
    },
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

/** Breadcrumbs: assistants and search engines use them to place a page in the shop. */
export function breadcrumbLd(trail: { name: string; path: string }[]) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: `${base}${t.path}` })),
  };
}

/** A collection page as a list of products, with prices, so an answer engine can compare. */
export function itemListLd(
  name: string,
  products: { slug: string; nameEn: string; nameFr: string; priceCents: number }[],
  locale: Locale = "en",
) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${base}/shop/${p.slug}`,
      name: locale === "fr" ? p.nameFr : p.nameEn,
    })),
  };
}

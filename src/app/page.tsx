import { listProducts } from "@/lib/shop";
import { HOME_PICKS, HOME_SETS } from "@/lib/sets";
import { serverLocale } from "@/i18n/server";
import { faqItems } from "@/content/faq";
import { SHIPPING } from "@/lib/brand";
import { formatWholeDollars } from "@/lib/utils";
import { JsonLd, faqLd } from "@/components/JsonLd";
import { Hero } from "@/components/sections/Hero";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Routine } from "@/components/sections/Routine";
import { FounderNote } from "@/components/sections/FounderNote";
import { Faq } from "@/components/sections/Faq";
import { Newsletter } from "@/components/sections/Newsletter";
import { PriceProof } from "@/components/sections/PriceProof";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await serverLocale();
  const products = await listProducts().catch(() => []);
  const picks = HOME_PICKS.flatMap((slug) => products.filter((p) => p.slug === slug));
  const homeSets = HOME_SETS.flatMap((slug) => products.filter((p) => p.slug === slug));
  const productNames = Object.fromEntries(products.map((p) => [p.slug, { en: p.nameEn, fr: p.nameFr }]));
  const faq = faqItems(locale, formatWholeDollars(SHIPPING.freeThresholdCents, locale)).slice(0, 4);

  return (
    <>
      <JsonLd data={faqLd(faq)} />
      <Hero />
      <FeaturedProducts products={picks} />
      <FeaturedProducts products={homeSets} variant="sets" />
      <PriceProof products={products} locale={locale} />
      <Routine productNames={productNames} />
      <FounderNote />
      <Faq limit={4} />
      <Newsletter />
    </>
  );
}

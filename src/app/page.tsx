import { listProducts } from "@/lib/shop";
import { serverLocale } from "@/i18n/server";
import { faqItems } from "@/content/faq";
import { SHIPPING } from "@/lib/brand";
import { formatWholeDollars } from "@/lib/utils";
import { JsonLd, faqLd } from "@/components/JsonLd";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Benefits } from "@/components/sections/Benefits";
import { Routine } from "@/components/sections/Routine";
import { FounderNote } from "@/components/sections/FounderNote";
import { Faq } from "@/components/sections/Faq";
import { Newsletter } from "@/components/sections/Newsletter";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await serverLocale();
  const products = await listProducts().catch(() => []);
  const productNames = Object.fromEntries(products.map((p) => [p.slug, { en: p.nameEn, fr: p.nameFr }]));
  const faq = faqItems(locale, formatWholeDollars(SHIPPING.freeThresholdCents, locale)).slice(0, 5);

  return (
    <>
      <JsonLd data={faqLd(faq)} />
      <Hero />
      <Marquee />
      <FeaturedProducts products={products} />
      <Benefits />
      <Routine productNames={productNames} />
      <FounderNote />
      <Faq limit={5} />
      <Newsletter />
    </>
  );
}

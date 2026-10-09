import { listProducts } from "@/lib/shop";
import { HOME_PICKS, HOME_SETS } from "@/lib/sets";
import { serverLocale } from "@/i18n/server";
import { faqItems } from "@/content/faq";
import { SHIPPING } from "@/lib/brand";
import { formatMoneyFromCents, formatWholeDollars } from "@/lib/utils";
import { JsonLd, faqLd } from "@/components/JsonLd";
import { Hero, type HeroSlide } from "@/components/sections/Hero";
import { Sky } from "@/components/motion/Sky";
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
  // Three devices take turns on the hero stage, each with its own light.
  const STAGE: [string, HeroSlide["light"]][] = [
    ["led-red-light-mask", "led"],
    ["microcurrent-facial-lift-device", "silver"],
    ["sonic-silicone-cleansing-brush", "rose"],
  ];
  const slides: HeroSlide[] = STAGE.flatMap(([slug, light]) => {
    const p = products.find((x) => x.slug === slug);
    return p && p.images[0]
      ? [{ slug, light, image: p.images[0], name: locale === "fr" ? p.nameFr : p.nameEn, price: formatMoneyFromCents(p.priceCents, locale) }]
      : [];
  });
  // Never an empty stage: if the catalogue is unreachable, the mask alone.
  if (!slides.length)
    slides.push({
      slug: "led-red-light-mask",
      light: "led",
      image: "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_1200,h_1500/f_auto/q_auto/v1790013183/cmac/products/led-red-light-mask/final-0",
      name: locale === "fr" ? "Masque LED lumière rouge" : "LED Red Light Mask",
      price: formatMoneyFromCents(5999, locale),
    });
  const faq = faqItems(locale, formatWholeDollars(SHIPPING.freeThresholdCents, locale)).slice(0, 4);

  return (
    <div className="cmac-skyline">
      <Sky />
      <JsonLd data={faqLd(faq)} />
      <Hero slides={slides} />
      <FeaturedProducts products={picks} />
      <FeaturedProducts products={homeSets} variant="sets" />
      <PriceProof products={products} locale={locale} />
      <Routine productNames={productNames} />
      <FounderNote />
      <Faq limit={4} />
      <Newsletter />
    </div>
  );
}

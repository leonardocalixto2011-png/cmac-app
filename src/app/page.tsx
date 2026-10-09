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
  // Transparent, sharpened cut-outs (alpha-0) so the light and the satin show around
  // the product with clean edges.
  const ALPHA = (v: string, slug: string) => `https://res.cloudinary.com/dmlolrov/image/upload/v${v}/cmac/products/${slug}/alpha-0`;
  const STAGE: [string, HeroSlide["light"], string][] = [
    ["led-red-light-mask", "led", ALPHA("1791567103", "led-red-light-mask")],
    ["microcurrent-facial-lift-device", "silver", ALPHA("1791567102", "microcurrent-facial-lift-device")],
    ["sonic-silicone-cleansing-brush", "rose", ALPHA("1791567127", "sonic-silicone-cleansing-brush")],
  ];
  const slides: HeroSlide[] = STAGE.flatMap(([slug, light, image]) => {
    const p = products.find((x) => x.slug === slug);
    return p
      ? [{ slug, light, image, name: locale === "fr" ? p.nameFr : p.nameEn, price: formatMoneyFromCents(p.priceCents, locale) }]
      : [];
  });
  // Never an empty stage: if the catalogue is unreachable, the mask alone.
  if (!slides.length)
    slides.push({
      slug: "led-red-light-mask",
      light: "led",
      image: ALPHA("1791567103", "led-red-light-mask"),
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
      <FounderNote />
      <Faq limit={4} />
      {/* The ritual closes the evening and hands over to the night of the newsletter. */}
      <Routine productNames={productNames} />
      <Newsletter />
    </div>
  );
}

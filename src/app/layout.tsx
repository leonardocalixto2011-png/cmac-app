import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { serverLocale } from "@/i18n/server";
import { translate } from "@/i18n/messages";
import { CartProvider } from "@/components/shop/CartProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Motion } from "@/components/Motion";
import { JsonLd, organizationLd } from "@/components/JsonLd";
import { BRAND, SHIPPING, siteUrl } from "@/lib/brand";
import { formatWholeDollars } from "@/lib/utils";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await serverLocale();
  const free = formatWholeDollars(SHIPPING.freeThresholdCents, locale);
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: translate(locale, "meta.title"),
      template: `%s | ${BRAND.name}`,
    },
    description: translate(locale, "meta.desc", { free }),
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      alternateLocale: locale === "fr" ? "en_CA" : "fr_CA",
      siteName: BRAND.name,
      url: siteUrl(),
    },
    alternates: { canonical: "/" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await serverLocale();

  return (
    <html lang={locale} className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <JsonLd data={organizationLd()} />
        <LocaleProvider initialLocale={locale}>
          <CartProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-cream"
            >
              {translate(locale, "nav.skip")}
            </a>
            <Nav />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <Motion />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

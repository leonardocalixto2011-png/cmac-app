import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { serverLocale } from "@/i18n/server";
import { translate } from "@/i18n/messages";
import { CartProvider } from "@/components/shop/CartProvider";
import { Nav } from "@/components/Nav";
import { PromoBar } from "@/components/PromoBar";
import { Footer } from "@/components/Footer";
import { Motion } from "@/components/Motion";
import { PageFade } from "@/components/PageFade";
import { CartToast } from "@/components/CartToast";
import { ScrollProgress } from "@/components/ScrollProgress";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { Pixels } from "@/components/Pixels";
import { Analytics } from "@vercel/analytics/next";
import { viewerInfo } from "@/lib/account";
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
    // Site ownership: Google (Merchant Center / Search Console), Bing, Pinterest.
    verification: {
      google: "3Y5jJTLPAdn8fgAlviB09-w9Aae8hd2F2yHkenbFbfI",
      other: {
        "msvalidate.01": "16BA849697D27C1862C7FD357DCE88F6",
        "p:domain_verify": "d8398fdbd8f5e522bb3b6c3eb188234e",
      },
    },
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
    alternates: { canonical: "/", languages: { "en-CA": "/", "fr-CA": "/?lang=fr", "x-default": "/" } },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, viewer] = await Promise.all([serverLocale(), viewerInfo()]);

  return (
    // suppressHydrationWarning: the inline script below adds the "js" class before React hydrates.
    <html lang={locale} suppressHydrationWarning className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Marks the document as scripted before first paint; the scroll-reveal CSS only hides content under html.js. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <JsonLd data={organizationLd()} />
        <LocaleProvider initialLocale={locale}>
          <CartProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-cream"
            >
              {translate(locale, "nav.skip")}
            </a>
            <PromoBar />
            <Nav signedIn={viewer.signedIn} />
            <main id="main" className="flex-1">
              <PageFade>{children}</PageFade>
            </main>
            <Footer />
            <Motion />
            <ScrollProgress />
            <CartToast />
            <NewsletterPopup suppressed={viewer.signedIn && viewer.subscribed} />
            <Pixels />
            {/* Cookieless visit counts (no personal data, no consent needed) — enable it once in the Vercel dashboard. */}
            <Analytics />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

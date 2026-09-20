import type { Metadata } from "next";
import { serverT } from "@/i18n/server";
import { faqItems } from "@/content/faq";
import { SHIPPING } from "@/lib/brand";
import { formatWholeDollars } from "@/lib/utils";
import { JsonLd, faqLd } from "@/components/JsonLd";
import { Faq } from "@/components/sections/Faq";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return { title: t("footer.faq"), description: t("faq.lead"), alternates: { canonical: "/faq" } };
}

export default async function FaqPage() {
  const { locale } = await serverT();
  const items = faqItems(locale, formatWholeDollars(SHIPPING.freeThresholdCents, locale));
  return (
    <>
      <JsonLd data={faqLd(items)} />
      <Faq asPage />
    </>
  );
}

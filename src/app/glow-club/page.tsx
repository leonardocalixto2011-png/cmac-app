import type { Metadata } from "next";
import { auth } from "@/auth";
import { serverT } from "@/i18n/server";
import { JsonLd, faqLd } from "@/components/JsonLd";
import { GlowClubView, GLOW_FAQ_COUNT } from "@/components/glow/GlowClubView";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return {
    title: t("glow.metaTitle"),
    description: t("glow.metaDesc"),
    alternates: { canonical: "/glow-club" },
  };
}

export default async function GlowClubPage() {
  const { t } = await serverT();
  const session = await auth();
  const faq = Array.from({ length: GLOW_FAQ_COUNT }, (_, i) => ({ q: t(`glow.faq.${i + 1}.q`), a: t(`glow.faq.${i + 1}.a`) }));
  return (
    <>
      <JsonLd data={faqLd(faq)} />
      <GlowClubView signedIn={session?.user?.role === "CUSTOMER"} />
    </>
  );
}

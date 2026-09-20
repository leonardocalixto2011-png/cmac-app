import type { Metadata } from "next";
import { serverLocale } from "@/i18n/server";
import { PAGES } from "@/content/pages";
import { LongForm } from "@/components/LongForm";
import { FounderNote } from "@/components/sections/FounderNote";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await serverLocale();
  const c = PAGES.about[locale];
  return { title: locale === "fr" ? "À propos" : "About", description: c.blocks[0]?.p?.[0]?.slice(0, 155), alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const locale = await serverLocale();
  return (
    <>
      <section className="section-pad">
        <div className="wrap">
          <LongForm page="about" eyebrow={locale === "fr" ? "À propos" : "About"} />
        </div>
      </section>
      <FounderNote />
    </>
  );
}

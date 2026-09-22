import type { Metadata } from "next";
import Link from "next/link";
import { serverT } from "@/i18n/server";
import { JOURNAL } from "@/content/journal";
import { JsonLd, breadcrumbLd } from "@/components/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await serverT();
  const fr = locale === "fr";
  return {
    title: fr ? "Journal — guides d'achat honnêtes" : "Journal — honest buying guides",
    description: fr
      ? "Guides d'achat clairs sur les outils de beauté à domicile au Canada : prix réels, à qui ça convient, et quand s'abstenir."
      : "Clear buying guides for at-home beauty tools in Canada: real prices, who they suit, and when to skip them.",
    alternates: { canonical: "/journal", languages: { "en-CA": "/journal", "fr-CA": "/journal?lang=fr", "x-default": "/journal" } },
  };
}

export default async function JournalPage() {
  const { locale } = await serverT();
  const fr = locale === "fr";
  const articles = JOURNAL[locale];
  return (
    <section className="section-pad">
      <JsonLd data={breadcrumbLd([{ name: "Journal", path: "/journal" }])} />
      <div className="wrap mx-auto max-w-[820px]">
        <span className="eyebrow">Journal</span>
        <h1 className="mt-3 text-[clamp(2rem,1.5rem+2.4vw,3.2rem)]">{fr ? "Des guides d'achat honnêtes" : "Honest buying guides"}</h1>
        <p className="mt-4 max-w-[60ch] text-[1.05rem] leading-relaxed text-ink-soft">
          {fr
            ? "Ce qu'on aurait voulu lire avant d'acheter : les prix réels au Canada, ce que chaque tranche donne vraiment, et les cas où il vaut mieux s'abstenir."
            : "What we wish we'd read before buying: real Canadian prices, what each price band actually gets you, and the cases where you should skip it."}
        </p>
        <ul className="mt-10 flex flex-col divide-y divide-[var(--line)]">
          {articles.map((a) => (
            <li key={a.slug} className="py-6">
              <p className="text-[0.8rem] text-ink-faint">
                {new Date(a.updated).toLocaleDateString(fr ? "fr-CA" : "en-CA", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <h2 className="mt-1 text-[1.35rem]">
                <Link href={`/journal/${a.slug}`} className="hover:text-terra">
                  {a.title}
                </Link>
              </h2>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-soft">{a.answer}</p>
              <Link href={`/journal/${a.slug}`} className="mt-3 inline-block text-[0.9rem] font-semibold text-terra underline-offset-4 hover:underline">
                {fr ? "Lire le guide" : "Read the guide"} →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

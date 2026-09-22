import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serverT } from "@/i18n/server";
import { articleBySlug, JOURNAL_SLUGS } from "@/content/journal";
import { BRAND, siteUrl } from "@/lib/brand";
import { listProducts } from "@/lib/shop";
import { formatMoneyFromCents } from "@/lib/utils";
import { JsonLd, breadcrumbLd, faqLd } from "@/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await serverT();
  const a = articleBySlug(locale, slug);
  if (!a) return { title: "Journal" };
  return {
    title: a.title,
    description: a.answer.slice(0, 300),
    alternates: {
      canonical: `/journal/${a.slug}`,
      languages: { "en-CA": `/journal/${a.slug}`, "fr-CA": `/journal/${a.slug}?lang=fr`, "x-default": `/journal/${a.slug}` },
    },
    openGraph: { type: "article", publishedTime: a.updated, modifiedTime: a.updated },
  };
}

/** Article + FAQ structured data: the two shapes answer engines quote from. */
function articleLd(a: NonNullable<ReturnType<typeof articleBySlug>>, locale: string) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.answer,
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    datePublished: a.updated,
    dateModified: a.updated,
    mainEntityOfPage: `${base}/journal/${a.slug}`,
    author: { "@type": "Organization", name: BRAND.name, url: base },
    publisher: { "@type": "Organization", name: BRAND.name, url: base, logo: { "@type": "ImageObject", url: `${base}/icon.svg` } },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!JOURNAL_SLUGS.includes(slug)) notFound();
  const { locale } = await serverT();
  const fr = locale === "fr";
  const a = articleBySlug(locale, slug);
  if (!a) notFound();

  const all = await listProducts().catch(() => []);
  const related = a.related.flatMap((s) => all.filter((p) => p.slug === s));

  return (
    <section className="section-pad">
      <JsonLd data={articleLd(a, locale)} />
      <JsonLd data={faqLd(a.faq)} />
      <JsonLd data={breadcrumbLd([{ name: "Journal", path: "/journal" }, { name: a.title, path: `/journal/${a.slug}` }])} />
      <article className="wrap mx-auto max-w-[760px]">
        <Link href="/journal" className="text-[0.85rem] text-ink-soft hover:text-terra">
          ← Journal
        </Link>
        <h1 className="mt-4 text-[clamp(2rem,1.5rem+2.4vw,3rem)]">{a.title}</h1>
        <p className="mt-2 text-[0.82rem] text-ink-faint">
          {fr ? "Mis à jour le " : "Updated "}
          {new Date(a.updated).toLocaleDateString(fr ? "fr-CA" : "en-CA", { year: "numeric", month: "long", day: "numeric" })} · {BRAND.name}
        </p>

        <p className="mt-6 rounded-2xl bg-warm-white px-5 py-4 text-[1.02rem] font-medium leading-relaxed text-ink">{a.answer}</p>
        <p className="mt-6 text-[1.02rem] leading-relaxed text-ink-soft">{a.intro}</p>

        <div className="prose mt-8">
          {a.blocks.map((b, i) => (
            <section key={i}>
              {b.h && <h2>{b.h}</h2>}
              {"p" in b && b.p?.map((p, j) => <p key={j}>{p}</p>)}
              {"ul" in b && b.ul && (
                <ul>
                  {b.ul.map((li, j) => (
                    <li key={j}>{li}</li>
                  ))}
                </ul>
              )}
              {"table" in b && (
                <div className="not-prose my-5 overflow-x-auto">
                  <table className="w-full border-collapse text-[0.92rem]">
                    <thead>
                      <tr className="border-b border-[var(--line)] text-left">
                        {b.table.head.map((h) => (
                          <th key={h} className="py-2 pr-4 font-ui text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b.table.rows.map((row, r) => (
                        <tr key={r} className="border-b border-[var(--line)] align-top">
                          {row.map((cell, c) => (
                            <td key={c} className="py-3 pr-4 text-ink-soft">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>

        <h2 className="mt-12 text-[1.5rem]">{fr ? "Questions fréquentes" : "Frequently asked"}</h2>
        <dl className="mt-4 flex flex-col divide-y divide-[var(--line)]">
          {a.faq.map((f) => (
            <div key={f.q} className="py-4">
              <dt className="font-display text-[1.08rem]">{f.q}</dt>
              <dd className="mt-1 text-[0.98rem] leading-relaxed text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-[1.5rem]">{fr ? "Mentionnés dans ce guide" : "Mentioned in this guide"}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={`/shop/${p.slug}`} className="flex items-center justify-between gap-3 rounded-2xl bg-warm-white px-4 py-3 hover:text-terra">
                    <span>{fr ? p.nameFr : p.nameEn}</span>
                    <span className="font-ui text-[0.9rem] font-semibold tabular-nums">{formatMoneyFromCents(p.priceCents, locale)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </section>
  );
}

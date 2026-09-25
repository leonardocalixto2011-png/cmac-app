import type { Metadata } from "next";
import Link from "next/link";
import { serverT } from "@/i18n/server";
import { ProForm } from "@/components/ProForm";
import { JsonLd } from "@/components/JsonLd";
import { BRAND, siteUrl } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return {
    title: t("pro.metaTitle"),
    description: t("pro.metaDesc"),
    alternates: { canonical: "/pro", languages: { "en-CA": "/pro", "fr-CA": "/pro?lang=fr", "x-default": "/pro" } },
  };
}

/**
 * Salons, nail studios, estheticians and clinics: counter display or
 * consignment, a code per salon, no ads to pay. The form lands in the owner's
 * inbox like a contact message.
 */
export default async function ProPage() {
  const { t, locale } = await serverT();
  const offers = [1, 2, 3].map((n) => ({ title: t(`pro.offer${n}.t`), body: t(`pro.offer${n}.b`) }));
  const steps = [1, 2, 3, 4].map((n) => t(`pro.step${n}`));
  const faq = [1, 2, 3].map((n) => ({ q: t(`pro.faq${n}.q`), a: t(`pro.faq${n}.a`) }));
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    url: `${siteUrl()}/pro`,
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <JsonLd data={ld} />
      <section className="section-pad">
        <div className="wrap">
          <div className="mx-auto max-w-[980px]">
            <span className="eyebrow" data-reveal>
              {t("pro.eyebrow")}
            </span>
            <h1 className="mt-3 max-w-[16ch] text-[clamp(2rem,1.5rem+2.4vw,3.2rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
              {t("pro.title")}
            </h1>
            <p className="mt-4 max-w-[62ch] text-ink-soft" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
              {t("pro.lead")}
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-[980px] gap-4 md:grid-cols-3">
            {offers.map((o, i) => (
              <div key={o.title} className="rounded-[var(--radius-card)] bg-warm-white p-6" data-reveal style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
                <p className="font-ui text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-terra">0{i + 1}</p>
                <h2 className="mt-2 text-[1.2rem]">{o.title}</h2>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-soft">{o.body}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 grid max-w-[980px] gap-10 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-[1.5rem]" data-reveal>
                {t("pro.howTitle")}
              </h2>
              <ol className="mt-4 space-y-3 text-[0.95rem] text-ink-soft">
                {steps.map((s, i) => (
                  <li key={s} className="flex gap-3" data-reveal style={{ "--d": `${i * 60}ms` } as React.CSSProperties}>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-[0.75rem] font-semibold text-cream">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 space-y-4">
                {faq.map((f) => (
                  <details key={f.q} className="rounded-2xl bg-warm-white px-5 py-4" data-reveal>
                    <summary className="cursor-pointer font-medium text-ink">{f.q}</summary>
                    <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-soft">{f.a}</p>
                  </details>
                ))}
              </div>
              <p className="mt-8 text-[0.85rem] text-ink-soft">
                {t("pro.direct")}{" "}
                <a href={`mailto:${BRAND.email}?subject=Salon%20partner`} className="font-semibold text-terra underline-offset-4 hover:underline">
                  {BRAND.email}
                </a>{" "}
                ·{" "}
                <a href={`tel:${BRAND.phoneHref}`} className="font-semibold text-terra underline-offset-4 hover:underline">
                  {BRAND.phone}
                </a>
                {" · "}
                <Link href="/collections/sets" className="underline underline-offset-4">
                  {t("pro.seeSets")}
                </Link>
              </p>
            </div>
            <ProForm />
          </div>
        </div>
      </section>
    </>
  );
}

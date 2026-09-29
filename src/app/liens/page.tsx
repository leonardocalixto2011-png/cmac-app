import type { Metadata } from "next";
import Link from "next/link";
import { serverT } from "@/i18n/server";
import { BRAND } from "@/lib/brand";
import { holidayCutoff } from "@/lib/brand";
import { openDrop } from "@/lib/drops";
import { activePromo, promoText } from "@/lib/promos";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverT();
  return {
    title: t("links.metaTitle"),
    description: t("links.metaDesc"),
    alternates: { canonical: "/liens", languages: { "en-CA": "/liens", "fr-CA": "/liens?lang=fr", "x-default": "/liens" } },
    // A link-in-bio page competes with the real pages in search; keep it out of the index.
    robots: { index: false, follow: true },
  };
}

/**
 * One link for every bio: Instagram, TikTok, the QR card at the Couca studio.
 * Everything we want a newcomer to find, in the order we want them to find it,
 * with the seasonal card first so the page changes itself through the year.
 */
export default async function LinksPage() {
  const { t, locale } = await serverT();
  const drop = await openDrop().catch(() => null);
  const promo = activePromo();
  const cutoff = holidayCutoff();
  const fmt = (d: Date) => d.toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { month: "long", day: "numeric", timeZone: "America/Toronto" });

  const cards: { href: string; title: string; body: string; accent?: boolean }[] = [];

  if (promo) {
    const p = promoText(promo, locale);
    cards.push({ href: promo.href, title: p.label, body: `${p.detail} — ${promo.code}`, accent: true });
  }
  if (cutoff) {
    cards.push({
      href: "/collections/gifts",
      title: t("links.gifts.t"),
      body: t("links.gifts.b", { date: fmt(cutoff) }),
      accent: !promo,
    });
  }
  cards.push({ href: "/shop", title: t("links.shop.t"), body: t("links.shop.b") });
  if (drop) {
    cards.push({ href: "/convoi", title: t("links.convoy.t"), body: t("links.convoy.b", { date: fmt(drop.closesAt) }) });
  }
  cards.push(
    { href: "/glow-club", title: t("links.club.t"), body: t("links.club.b") },
    { href: "/pro", title: t("links.pro.t"), body: t("links.pro.b") },
    { href: "/entreprises", title: t("links.corp.t"), body: t("links.corp.b") },
  );

  return (
    <section className="section-pad">
      <div className="wrap">
        <div className="mx-auto max-w-[560px]">
          <div className="text-center">
            <span className="eyebrow" data-reveal>
              {BRAND.tagline}
            </span>
            <h1 className="mt-3 text-[clamp(1.8rem,1.4rem+2vw,2.6rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
              {t("links.title")}
            </h1>
            <p className="mt-3 text-[0.95rem] text-ink-soft" data-reveal style={{ "--d": "140ms" } as React.CSSProperties}>
              {t("links.lead")}
            </p>
          </div>

          <ul className="mt-8 flex flex-col gap-3">
            {cards.map((c, i) => (
              <li key={c.href + c.title} data-reveal style={{ "--d": `${i * 60}ms` } as React.CSSProperties}>
                <Link
                  href={c.href}
                  className={
                    c.accent
                      ? "group flex items-center gap-4 rounded-[var(--radius-card)] bg-ink px-5 py-4 text-cream transition-transform hover:-translate-y-0.5"
                      : "group flex items-center gap-4 rounded-[var(--radius-card)] bg-warm-white px-5 py-4 transition-transform hover:-translate-y-0.5"
                  }
                >
                  <span className="min-w-0 flex-1">
                    <span className={c.accent ? "block font-semibold text-cream" : "block font-semibold text-ink"}>{c.title}</span>
                    <span className={c.accent ? "mt-0.5 block text-[0.85rem] text-sage-light" : "mt-0.5 block text-[0.85rem] text-ink-soft"}>{c.body}</span>
                  </span>
                  <span aria-hidden="true" className={c.accent ? "text-terra-2" : "text-terra"}>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-center text-[0.85rem] text-ink-soft">
            <a href={`mailto:${BRAND.email}`} className="font-semibold text-terra underline-offset-4 hover:underline">
              {BRAND.email}
            </a>
            {" · "}
            <a href={`tel:${BRAND.phoneHref}`} className="font-semibold text-terra underline-offset-4 hover:underline">
              {BRAND.phone}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

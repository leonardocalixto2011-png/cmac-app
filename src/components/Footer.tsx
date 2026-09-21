"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";
import { LangToggle } from "./LangToggle";
import { BRAND } from "@/lib/brand";

export function Footer() {
  const { t, locale } = useLocale();
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (pathname?.startsWith("/admin")) return null;

  const cols = [
    {
      title: t("footer.shop"),
      links: [
        { href: "/shop", label: t("nav.shop") },
        { href: "/collections/the-ritual", label: t("coll.the-ritual.t") },
        { href: "/collections/sets", label: t("nav.sets") },
        { href: "/collections/glow", label: t("nav.glow") },
        { href: "/collections/sculpt", label: t("nav.sculpt") },
        { href: "/collections/cool", label: t("nav.cool") },
        { href: "/collections/essentials", label: t("nav.essentials") },
      ],
    },
    {
      title: t("footer.help"),
      links: [
        { href: "/about", label: t("nav.about") },
        { href: "/faq", label: t("footer.faq") },
        { href: "/shipping-returns", label: t("footer.shipping") },
        { href: "/contact", label: t("footer.contact") },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { href: "/privacy", label: t("footer.privacy") },
        { href: "/terms", label: t("footer.terms") },
        { href: "/refund-policy", label: t("footer.refund") },
      ],
    },
  ];

  return (
    <footer className="bg-ink py-[clamp(3.5rem,2.5rem+5vw,6rem)] text-cream">
      <div className="wrap grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <span className="flex flex-col leading-none">
            <b className="font-display text-2xl font-semibold text-cream">CMAC</b>
            <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.34em] text-terra-2">Beauty</span>
          </span>
          <p className="mt-4 max-w-[34ch] text-[0.94rem] text-sage-light">{t("footer.tag")}</p>
          <p className="mt-4 text-[0.88rem] text-sage-light">
            <a href={`mailto:${BRAND.email}`} className="underline-offset-4 hover:underline">
              {BRAND.email}
            </a>
          </p>
          <p className="mt-1 text-[0.88rem] text-ink-faint">{locale === "fr" ? BRAND.areaFr : BRAND.area}</p>
          <div className="mt-5 flex items-center gap-3">
            <span className="text-[0.72rem] uppercase tracking-[0.2em] text-ink-faint">{t("footer.language")}</span>
            <LangToggle onDark />
          </div>
        </div>

        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h4 className="mb-4 font-ui text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-terra-2">{c.title}</h4>
            <ul className="flex flex-col gap-2.5 text-[0.94rem]">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sage-light transition-colors hover:text-cream">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="wrap mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-[0.78rem] text-ink-faint">
        <p className="max-w-[80ch]">{t("footer.disclaimer")}</p>
        <p>
          © {year} {BRAND.name}. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}

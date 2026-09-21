"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";
import { useCart } from "./shop/CartProvider";
import { Icon } from "./Icon";
import { LangToggle } from "./LangToggle";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/shop", key: "nav.shop" },
  { href: "/collections/sets", key: "nav.sets" },
  { href: "/collections/glow", key: "nav.glow" },
  { href: "/collections/sculpt", key: "nav.sculpt" },
  { href: "/collections/cool", key: "nav.cool" },
  { href: "/glow-club", key: "nav.glowClub" },
  { href: "/about", key: "nav.about" },
] as const;

export function Nav({ signedIn = false }: { signedIn?: boolean }) {
  const { t } = useLocale();
  const pathname = usePathname();
  const cart = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", open);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[100] flex h-[var(--nav-h)] items-center border-b transition-[border-color,box-shadow] duration-300",
          "bg-[color-mix(in_srgb,var(--color-cream)_84%,transparent)] backdrop-blur-[14px]",
          scrolled ? "border-[var(--line)] shadow-[0_10px_30px_-24px_rgba(31,36,34,0.4)]" : "border-transparent",
        )}
      >
        <div className="wrap flex w-full items-center justify-between gap-5">
          <Link href="/" className="flex flex-col leading-none text-ink" aria-label={`${t("nav.home")} — ${BRAND.name}`}>
            <span className="font-display text-[1.35rem] font-semibold tracking-[0.01em]">CMAC</span>
            <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.34em] text-sage">Beauty</span>
          </Link>

          <nav aria-label={t("nav.home")} className="hidden items-center gap-[clamp(0.9rem,2vw,1.7rem)] lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-1.5 text-[0.9rem] font-medium tracking-[0.01em] text-ink-soft transition-colors hover:text-ink"
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LangToggle />
            <Link
              href="/account"
              aria-label={signedIn ? t("nav.account") : t("nav.signIn")}
              title={signedIn ? t("nav.account") : t("nav.signIn")}
              className="relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[var(--line)] text-ink transition-colors hover:border-ink"
            >
              <Icon name="user" width={19} height={19} />
              {signedIn && <span aria-hidden className="absolute right-[7px] top-[7px] h-2 w-2 rounded-full bg-terra ring-2 ring-cream" />}
            </Link>
            <Link
              href="/cart"
              aria-label={`${t("nav.cart")}${cart.count ? ` (${cart.count})` : ""}`}
              className="relative inline-flex h-[42px] items-center gap-1.5 rounded-full bg-ink px-3.5 text-[0.82rem] font-semibold text-cream transition-colors hover:bg-terra"
            >
              <Icon name="cart" width={18} height={18} />
              <span className="hidden sm:inline">{t("nav.cart")}</span>
              {cart.count > 0 && (
                <span className="inline-grid h-5 min-w-5 place-items-center rounded-full bg-terra px-1 text-[0.68rem] tabular-nums text-white">
                  {cart.count}
                </span>
              )}
            </Link>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-drawer"
              aria-label={open ? t("nav.menuClose") : t("nav.menuOpen")}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[var(--line)] text-ink lg:hidden"
            >
              <Icon name={open ? "close" : "menu"} width={20} height={20} />
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-drawer"
        aria-hidden={!open}
        className={cn(
          "fixed inset-x-0 bottom-0 top-[var(--nav-h)] z-[95] flex flex-col gap-1 overflow-y-auto bg-cream px-[clamp(1.25rem,5vw,2.75rem)] pb-10 pt-8 transition-transform duration-[420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] lg:hidden",
          open ? "translate-y-0" : "-translate-y-[110%]",
        )}
      >
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="border-b border-[var(--line)] py-3 font-display text-[1.7rem] font-medium text-ink hover:text-terra"
          >
            {t(l.key)}
          </Link>
        ))}
        <Link href="/account" onClick={() => setOpen(false)} className="btn btn--ghost btn--block mt-6">
          <Icon name="user" />
          {signedIn ? t("nav.account") : t("nav.signIn")}
        </Link>
        <Link href="/cart" onClick={() => setOpen(false)} className="btn btn--block mt-3">
          <Icon name="cart" />
          {t("nav.cart")}
          {cart.count > 0 ? ` (${cart.count})` : ""}
        </Link>
        <p className="mt-auto pt-8 text-sm text-ink-faint">{BRAND.area}</p>
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";

/**
 * The homepage's changing backdrop. Each section declares the light it wants
 * (data-sky="dusk" | "cream" | "linen" | "paper" | "warm"); whichever section
 * holds the middle of the screen sets the colour of a fixed layer behind the
 * page, which eases from one to the next. A soft glow drifts across it as the
 * page is read. Sections opt in by leaving their own background transparent
 * inside .cmac-skyline (globals.css).
 */
const SKIES: Record<string, { bg: string; glow: string }> = {
  dusk: { bg: "#f3e8de", glow: "rgba(231, 179, 160, 0.55)" },
  cream: { bg: "#f5f1ea", glow: "rgba(217, 179, 112, 0.28)" },
  linen: { bg: "#efe6da", glow: "rgba(201, 123, 99, 0.24)" },
  paper: { bg: "#f1ece3", glow: "rgba(110, 130, 114, 0.22)" },
  warm: { bg: "#f6ede3", glow: "rgba(228, 164, 142, 0.32)" },
};

export function Sky() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (name: string) => {
      const s = SKIES[name];
      if (!s) return;
      el.style.setProperty("--sky", s.bg);
      el.style.setProperty("--sky-glow", s.glow);
    };
    apply("dusk");

    const sections = [...document.querySelectorAll<HTMLElement>("[data-sky]")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) apply((e.target as HTMLElement).dataset.sky ?? "");
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => io.disconnect();
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        el.style.setProperty("--sky-p", (max > 0 ? window.scrollY / max : 0).toFixed(4));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="cmac-sky" aria-hidden="true">
      <span className="cmac-sky__glow" />
    </div>
  );
}

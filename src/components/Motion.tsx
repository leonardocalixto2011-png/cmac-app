"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll reveal ([data-reveal] → .is-in) and counting stats ([data-count]).
 * The 3D tilt, cursor glow and magnetic buttons were removed on 2026-10-09:
 * a premium page is mostly still.
 * Mounted once in the root layout; re-runs on every route change and watches
 * the DOM for late-mounted sections. Honours prefers-reduced-motion.
 */
export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasIO = "IntersectionObserver" in window;
    const cleanups: Array<() => void> = [];

    function reveal() {
      const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
      if (!els.length) return;
      if (!hasIO || reduce) {
        els.forEach((e) => e.classList.add("is-in"));
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            if (en.isIntersecting) {
              en.target.classList.add("is-in");
              io.unobserve(en.target);
            }
          }
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
      );
      els.forEach((e) => io.observe(e));
      cleanups.push(() => io.disconnect());
    }


    function counters() {
      document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        if (el.dataset.countDone) return;
        const target = parseFloat(el.dataset.count ?? "0");
        const suffix = el.dataset.suffix ?? "";
        const finish = () => {
          el.dataset.countDone = "1";
          el.textContent = target + suffix;
        };
        if (reduce || !hasIO) {
          finish();
          return;
        }
        const run = () => {
          el.dataset.countDone = "1";
          let start: number | null = null;
          const step = (t: number) => {
            if (start === null) start = t;
            const p = Math.min((t - start) / 1400, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        };
        const io = new IntersectionObserver(
          (en) => {
            if (en[0]?.isIntersecting) {
              run();
              io.disconnect();
            }
          },
          { threshold: 0.5 },
        );
        io.observe(el);
        cleanups.push(() => io.disconnect());
      });
    }



    const init = () => {
      reveal();
      counters();
    };
    init();

    // Late-mounted content (client navigation, streamed sections).
    let scheduled = false;
    const mo = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        init();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    cleanups.push(() => mo.disconnect());

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}

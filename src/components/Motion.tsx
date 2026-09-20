"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Port of cmac-motion.js: scroll reveal ([data-reveal] → .is-in), 3D card
 * tilt (.tilt), counting stats ([data-count]) and cursor glow ([data-glow]).
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

    function tilt() {
      if (reduce || !window.matchMedia("(hover:hover)").matches) return;
      document.querySelectorAll<HTMLElement>(".tilt").forEach((card) => {
        if (card.dataset.tiltBound) return;
        card.dataset.tiltBound = "1";
        const move = (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-6px)`;
        };
        const leave = () => {
          card.style.transform = "";
        };
        card.addEventListener("mousemove", move);
        card.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          card.removeEventListener("mousemove", move);
          card.removeEventListener("mouseleave", leave);
          delete card.dataset.tiltBound;
        });
      });
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

    function glow() {
      if (reduce) return;
      document.querySelectorAll<HTMLElement>("[data-glow]").forEach((sec) => {
        if (sec.dataset.glowBound) return;
        sec.dataset.glowBound = "1";
        const move = (e: PointerEvent) => {
          const r = sec.getBoundingClientRect();
          sec.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
          sec.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
        };
        sec.addEventListener("pointermove", move);
        cleanups.push(() => {
          sec.removeEventListener("pointermove", move);
          delete sec.dataset.glowBound;
        });
      });
    }

    const init = () => {
      reveal();
      tilt();
      counters();
      glow();
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

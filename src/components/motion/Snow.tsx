"use client";

import { useEffect, useRef } from "react";

/**
 * Soft snow for the dark Christmas surfaces. Decor, drawn behind the content.
 *
 * Cheap on purpose, like SilkCanvas: capped at 30 fps and paused when off-screen or
 * the tab is hidden. Under prefers-reduced-motion it draws one still frame.
 */
type Flake = { x: number; y: number; r: number; speed: number; sway: number; phase: number; alpha: number };

const FRAME_MS = 1000 / 30;

function makeFlake(w: number, h: number): Flake {
  const depth = Math.random();
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.8 + depth * 2,
    speed: 7 + depth * 16, // px per second
    sway: 6 + Math.random() * 14,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.25 + depth * 0.5,
  };
}

export function Snow({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let flakes: Flake[] = [];
    let raf = 0;
    let last = 0;
    let visible = true;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        const x = f.x + Math.sin(time / 1800 + f.phase) * f.sway;
        ctx.globalAlpha = f.alpha;
        ctx.beginPath();
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#fff8ec";
      flakes = Array.from({ length: Math.min(90, Math.round((w * h) / 14000)) }, () => makeFlake(w, h));
      if (still) draw(0);
    };

    const tick = (time: number) => {
      raf = requestAnimationFrame(tick);
      if (time - last < FRAME_MS) return;
      const dt = Math.min(0.1, (time - last) / 1000);
      last = time;
      for (const f of flakes) {
        f.y += f.speed * dt;
        if (f.y > h + 4) {
          f.y = -4;
          f.x = Math.random() * w;
        }
      }
      draw(time);
    };
    const start = () => {
      if (still || raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const sizes = new ResizeObserver(resize);
    sizes.observe(canvas);
    const seen = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    seen.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      sizes.disconnect();
      seen.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

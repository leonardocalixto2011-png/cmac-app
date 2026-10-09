"use client";

import { useEffect, useRef } from "react";

/**
 * A slow, flowing satin surface drawn by a fragment shader: the hero's
 * backdrop. It is decor, never product, so it can be generated.
 *
 * Cheap on purpose: rendered at half resolution (CSS scales it up, which also
 * softens it), capped at 30 fps, paused when off-screen or the tab is hidden,
 * and not started at all under prefers-reduced-motion or without WebGL; the
 * CSS gradient behind the canvas is the fallback in every one of those cases.
 */
const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_t;
uniform vec3 u_a;
uniform vec3 u_b;
uniform vec3 u_c;

// Folded sine field: long diagonal folds, like satin lying on a bed.
float folds(vec2 p, float t) {
  float v = 0.0;
  v += sin(p.x * 1.6 + p.y * 0.9 + t * 0.35);
  v += 0.6 * sin(p.x * -0.7 + p.y * 2.1 - t * 0.27 + sin(p.x * 0.8 + t * 0.2));
  v += 0.12 * sin((p.x + p.y) * 3.1 + t * 0.45);
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (uv - 0.5) * vec2(u_res.x / u_res.y, 1.0) * 2.4;
  // Rotate ~30 degrees and stretch: long diagonal folds, like fabric lying on a bed.
  p = mat2(0.866, -0.5, 0.5, 0.866) * p;
  p *= vec2(1.0, 0.5);
  float t = u_t * 0.5;
  float f = folds(p, t);
  // Sheen: the derivative of the folds, so light catches the ridges.
  float e = 0.02;
  float dx = folds(p + vec2(e, 0.0), t) - f;
  float dy = folds(p + vec2(0.0, e), t) - f;
  vec3 n = normalize(vec3(-dx * 9.0, -dy * 9.0, 1.0));
  vec3 l = normalize(vec3(-0.45, 0.55, 0.7));
  float diff = clamp(dot(n, l), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 48.0);
  vec3 base = mix(u_a, u_b, smoothstep(-1.6, 1.6, f));
  base = mix(base, u_c, smoothstep(0.55, 1.0, uv.x * 0.6 + (1.0 - uv.y) * 0.5) * 0.55);
  vec3 col = base * (0.62 + 0.45 * diff) + spec * 0.35;
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export function SilkCanvas({
  colors = ["#f5f1ea", "#efe2d6", "#e7c3b2"],
  className = "",
}: {
  colors?: [string, string, string];
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uT = gl.getUniformLocation(prog, "u_t");
    const [a, b, c] = colors.map(hex);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_a"), a);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_b"), b);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_c"), c);

    const size = () => {
      const r = canvas.getBoundingClientRect();
      const scale = 0.5 * Math.min(window.devicePixelRatio || 1, 1.5); // softer and cheap
      canvas.width = Math.max(1, Math.round(r.width * scale));
      canvas.height = Math.max(1, Math.round(r.height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    // The loop exists only while the canvas is on screen and the tab is visible.
    let raf = 0;
    let last = 0;
    let visible = true;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return;
      last = now;
      gl.uniform1f(uT, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const start = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver((e) => {
      visible = !!e[0]?.isIntersecting;
      start();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", start);
    start();
    canvas.dataset.running = "1";
    // A lost GPU context leaves a broken-canvas glyph in some browsers: fall back to the gradient.
    const lost = (e: Event) => {
      e.preventDefault();
      delete canvas.dataset.running;
      visible = false;
    };
    canvas.addEventListener("webglcontextlost", lost);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", start);
      canvas.removeEventListener("webglcontextlost", lost);
      ro.disconnect();
      io.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // colours are static per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} className={`cmac-silk ${className}`} aria-hidden="true" />;
}

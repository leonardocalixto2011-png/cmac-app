import type { ImageLoaderProps } from "next/image";

/**
 * next/image loader for our Cloudinary photos.
 *
 * Without it every product photo was compressed twice: Cloudinary encoded it
 * (q_auto), then Vercel's optimizer decoded and re-encoded it at quality 75,
 * which is what softened edges and fine texture. Here Cloudinary does the one
 * and only encode, at the exact width the browser asks for (so a phone with a
 * 3x screen gets a 3x image), with a light sharpen after the resize and the
 * "good" quality preset. It also takes the load off Vercel's image quota.
 *
 * f_auto keeps transparency (WebP/AVIF carry alpha), so the background-removed
 * cut-outs stay transparent.
 *
 * Non-Cloudinary sources (our /products/*.jpg, supplier CDNs) go through the
 * built-in optimizer exactly as before.
 */
const MARKER = "res.cloudinary.com/dmlolrov/image/upload/";

export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  const at = src.indexOf(MARKER);
  if (at < 0) return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
  const head = src.slice(0, at + MARKER.length);
  const parts = src.slice(at + MARKER.length).split("/");
  // The public id starts at the version segment (v123…) or, without one, at "cmac".
  let i = parts.findIndex((p) => /^v\d+$/.test(p) || p === "cmac");
  if (i < 0) i = parts.length - 1;
  // Keep the creative part of the chain (crop, background removal), drop the
  // delivery part (format, quality), which we set once at the end.
  const chain = parts.slice(0, i).filter((p) => !/^(f_auto|q_auto(:\w+)?|f_jpg|f_png)$/.test(p));
  const q = quality && quality >= 90 ? "q_auto:best" : "q_auto:good";
  const delivery = [`c_limit,w_${width}`, "e_sharpen:60", "f_auto", q].join("/");
  return `${head}${[...chain, delivery, ...parts.slice(i)].join("/")}`;
}

export default cloudinaryLoader;

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";
import { COLLECTIONS, listProducts } from "@/lib/shop";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...COLLECTIONS.map((h) => ({ url: `${base}/collections/${h}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/glow-club`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/shipping-returns`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  let products: MetadataRoute.Sitemap = [];
  try {
    const rows = await listProducts();
    products = rows.map((p) => ({ url: `${base}/shop/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 }));
  } catch {
    /* DB unavailable at build — ship the static routes */
  }

  return [...staticRoutes, ...products];
}

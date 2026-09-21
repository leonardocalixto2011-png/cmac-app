import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/cart", "/shop/thanks", "/api/", "/account", "/newsletter/"] },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

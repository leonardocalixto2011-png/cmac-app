import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product images are plain URLs edited in /admin/products (supplier CDN,
    // Vercel Blob, or any https host). Tighten to specific hosts if desired.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;

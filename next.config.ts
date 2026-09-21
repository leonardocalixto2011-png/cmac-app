import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos come from the CJdropshipping CDNs (seeded catalogue).
    // The final wildcard keeps admin-pasted URLs from any https host working
    // (Vercel Blob, another supplier…); remove it to lock images to CJ only.
    remotePatterns: [
      { protocol: "https", hostname: "oss-cf.cjdropshipping.com" },
      { protocol: "https", hostname: "cf.cjdropshipping.com" },
      { protocol: "https", hostname: "cbu01.alicdn.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;

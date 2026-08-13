import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Pin Turbopack's workspace root to THIS project. Without this, a stray
  // lockfile in the home directory (~/package-lock.json) made Next infer
  // ~/ as the root, so Turbopack watched the entire home folder for file
  // changes — pegging CPU/memory and freezing the machine. Locking the
  // root here keeps the dev watcher scoped to the project only.
  turbopack: {
    root: path.join(__dirname),
  },

  // Image optimization defaults
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      // Allow editorial placeholder hosts; tighten for production
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.pharmaguide.io" },
      { protocol: "https", hostname: "pharmaguide.io" },
    ],
  },

  // Premium font loading via next/font handles preload automatically.
  experimental: {
    optimizePackageImports: ["framer-motion", "clsx", "tailwind-merge"],
  },

  // Print → web entry points.
  //
  // /card is the URL encoded in the QR on the business card. The card is
  // permanent; the destination is not. Keeping a first-party redirect in
  // between means the printed code never goes stale — when the app ships,
  // repoint the destination here and every card already in someone's wallet
  // starts landing on the app.
  //
  // KEEP THIS TEMPORARY (307) FOREVER. `permanent: true` emits a 301, which
  // browsers cache indefinitely: anyone who scanned once would keep hitting
  // the old destination after a repoint, and you cannot clear their cache.
  //
  // The utm_campaign value is the per-event knob — change it before each
  // conference print run; utm_source/medium stay put so all card traffic
  // rolls up together in GA.
  async redirects() {
    return [
      {
        source: "/card",
        destination:
          "/?utm_source=business-card&utm_medium=qr&utm_campaign=conference-2026",
        permanent: false,
      },
    ];
  },

  // Security + SEO friendly headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;

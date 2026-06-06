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

  // Security + SEO friendly headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;

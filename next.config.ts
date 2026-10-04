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
  //
  // Not inlineCss (tried 2026-10-04, reverted): it removed the CSS request
  // and a real throttled cold load got faster (LCP ~1.9 → ~0.9 s), but the
  // HTML grew 195 → 444 KB (Next also embeds the CSS in the RSC payload)
  // and PageSpeed mobile fell 76 → 64/65: Lighthouse records an unthrottled
  // trace where the whole document is parsed before first paint, then
  // scales it, so HTML size dominates its LCP estimate.
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
  // One path per printed surface, so GA can tell them apart: utm_source is
  // the surface, utm_campaign groups the print run. When the app ships,
  // change PRINT_DESTINATION once and every piece of paper already in the
  // wild follows — that is the entire reason this indirection exists.
  async redirects() {
    const PRINT_DESTINATION = "/";
    const printed = [
      { source: "/card", utmSource: "business-card", campaign: "conference-2026" },
      { source: "/pharmacy", utmSource: "pharmacy-counter", campaign: "counter-cards-2026" },
      { source: "/gym", utmSource: "gym-counter", campaign: "counter-cards-2026" },
    ];
    const printRedirects = printed.map(({ source, utmSource, campaign }) => ({
      source,
      destination: `${PRINT_DESTINATION}?utm_source=${utmSource}&utm_medium=qr&utm_campaign=${campaign}`,
      permanent: false,
    }));

    // One canonical host. www.pharmaguide.io is attached to the Vercel
    // project and was serving a full duplicate of the site (HTTP 200);
    // canonical tags are only a hint and many AI crawlers ignore them.
    // Permanent (308) is right here — unlike the print links, this
    // destination never changes.
    const apex = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pharmaguide.io");
    const hostRedirects =
      apex.hostname.includes(".") && !apex.hostname.startsWith("www.")
        ? [
            {
              source: "/:path*",
              has: [{ type: "host" as const, value: `www.${apex.hostname}` }],
              destination: `${apex.origin}/:path*`,
              permanent: true,
            },
          ]
        : [];

    // Addresses left over from the WordPress site that Google still
    // crawls (Search Console, 2026-10-04). Only URLs with an exact
    // equivalent are redirected; the rest (e.g. /power-of-magnesium)
    // stay 404 — redirecting to an unrelated page reads as a soft 404.
    const legacyRedirects = [
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/home/privacy", destination: "/privacy", permanent: true },
      { source: "/index.php", destination: "/", permanent: true },
    ];

    return [...hostRedirects, ...printRedirects, ...legacyRedirects];
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
          // X-XSS-Protection removed: browsers dropped the XSS auditor it
          // controlled, and OWASP now advises against sending it.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Newsreader } from "next/font/google";
import { ClarityProvider } from "@/components/analytics/ClarityProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { VercelInsights } from "@/components/analytics/VercelInsights";
import { ChatLauncherGate } from "@/components/chat/ChatLauncherGate";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { JsonLd } from "@/components/shared/JsonLd";
import { PAGES } from "@/lib/pages";
import { siteGraph } from "@/lib/schema";
import { ogImagePath, OG_SIZE } from "@/lib/seo";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  // Not preloaded: nothing in the first viewport is set in the serif, and
  // its two preloads competed with the CSS for bandwidth on slow mobile.
  preload: false,
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF9F6" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0E10" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * Site-wide defaults only. Every route sets its own title, description,
 * canonical and social tags through lib/seo.ts — deliberately no
 * `alternates.canonical` here: a child route that forgot its own would
 * inherit "/" and tell Google it was a duplicate of the homepage.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: PAGES.home.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.legalName,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    images: [{ url: ogImagePath.page("home"), ...OG_SIZE, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    site: site.twitter,
    creator: site.twitter,
    images: [{ url: ogImagePath.page("home"), ...OG_SIZE, alt: site.name }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Search-engine ownership verification. Next.js emits each <meta> only
  // when its env var is set, so tokens change without a code change.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION
        ? { "yandex-verification": process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION }
        : {}),
    },
  },
  category: "health",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        newsreader.variable,
        "scroll-smooth antialiased"
      )}
      suppressHydrationWarning
    >
      <head>
        {/* Icons and the manifest <link> are emitted by Next.js from the
            app/ file conventions (icon*.png, apple-icon.png, manifest.ts) —
            a hand-written manifest <link> here duplicated it. */}

        {/* Analytics origins, warmed early.
            GA and Clarity load post-hydration (afterInteractive / useEffect),
            so they never block first paint — but the browser still pays a full
            DNS + TCP + TLS handshake for each one at the moment it fetches
            them. Lighthouse measured 300-354ms per origin on simulated slow
            4G across five hosts.

            `dns-prefetch` only — deliberately NOT `preconnect`. Preconnect
            completes the TLS handshake at parse time, and on a throttled
            connection that bandwidth competes with the critical CSS and font.
            Google's guidance is to preconnect only origins on the critical
            path; GA and Clarity load after hydration, so they are not on it.

            Measured on production, Lighthouse mobile: preconnect 59-61 over
            four runs (FCP 4.8-5.2s), dns-prefetch 61 over three (FCP
            4.5-4.6s). An earlier single run with no hints at all scored 66 /
            FCP 3.1s, but one sample against seven is not a baseline — treat
            these hints as neutral-to-marginal, not as a proven win. They are
            kept because dns-prefetch resolves DNS without opening a socket,
            which costs essentially nothing and helps real-world DNS latency
            that Lighthouse's simulated throttling does not model well.

            The actual bottleneck is JavaScript volume (see the unused-JS and
            legacy-JS audits), not connection setup. */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://scripts.clarity.ms" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://c.clarity.ms" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        {/* Site-wide entities, once: Organization, WebSite, and every person
            the site credits. Pages reference these by @id (lib/schema.ts). */}
        <JsonLd nodes={siteGraph()} />
        {/* Scroll reveals start at opacity 0 until JavaScript runs. Without
            JavaScript they would stay invisible — show everything instead. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<style>[style*="opacity:0"]{opacity:1!important;transform:none!important}</style>',
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[600] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <MotionProvider>
          {children}
          {/* Floating "Ask PharmaGuide AI" chat launcher. Hidden on
              legal/disclosure routes; fades in after first scroll past
              the hero on every other page. See ChatLauncherGate. */}
          <ChatLauncherGate />
        </MotionProvider>
        <VercelInsights />
        <ClarityProvider />
        <GoogleAnalytics />
      </body>
    </html>
  );
}

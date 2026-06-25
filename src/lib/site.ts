/**
 * Site-wide constants — single source for SEO, nav, social.
 * Anything that appears in multiple places lives here.
 */

export const site = {
  name: "PharmaGuide",
  tagline: "Supplement intelligence.",
  description:
    "See how your supplements, medications, and timing work together — not one bottle at a time. Cross-referenced catalog of 180,000+ products with evidence-graded interaction analysis.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pharmaguide.io",
  locale: "en_US",
  lang: "en-US",
  country: "US",
  email: "info@pharmaguide.io",
  city: "Boston, MA",
  twitter: "@pharmaguideai",
} as const;

/**
 * Top-level header nav. Order is by visit intent:
 *   Features        — what the product actually does (most-clicked)
 *   How It Works    — anchors to homepage section (no separate page;
 *                     /features + /methodology cover that content)
 *   Methodology     — credibility signal for a YMYL health product
 *   Blog            — content depth + SEO
 *   About           — story page, lowest-priority click
 *
 * 5 items reads cleanly at desktop widths. Mobile stacks in the
 * full-screen overlay. If a 6th tab gets added later, drop Methodology
 * to the footer-only and keep Features/How/Blog/About visible.
 */
export const nav = [
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Methodology", href: "/methodology" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;

/**
 * Footer nav — restructured to match the legacy pharmaguide.io footer:
 *   Product   — Features, How It Works, Methodology, FAQ + a "Healthcare
 *               Pros (2026)" coming-soon badge item that the Footer renders
 *               as a non-link with a small pill instead of an <a>.
 *   Company   — About, Blog, Careers, Press
 *   Legal     — Privacy, Terms, HIPAA, Accessibility
 *
 * `comingSoon` flag tells the Footer to render the row as a span+badge
 * instead of a Link. Optional `badge` text overrides the default "Soon".
 */
export const footerNav = {
  product: [
    { label: "Features", href: "/features" },
    // "How It Works" is the homepage section anchor — we don't build a
    // separate /how-it-works page because /features (6 pillars) and
    // /methodology (5-step verification process) already cover that
    // content. Pointing the link at the homepage section is the right
    // call: visitors who click here get the 3-card overview, then the
    // homepage's natural flow into Ladder + Real-Life Moments + the rest.
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Methodology", href: "/methodology" },
    { label: "FAQ", href: "/faq" },
    {
      label: "Healthcare Pros",
      href: "/hipaa#professional-tier",
      comingSoon: true,
      badge: "2026",
    },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "HIPAA", href: "/hipaa" },
    { label: "Accessibility", href: "/accessibility" },
  ],
} as const;

/**
 * Trust-badge row inside the footer. Concrete claims with icons —
 * matches the legacy footer's pg-footer__trust-bar. Each item maps to
 * an inline SVG inside the Footer component.
 */
export const footerTrustBadges = [
  { label: "HIPAA Compliant", icon: "shield-check" },
  { label: "AES-256 Encrypted", icon: "lock" },
  { label: "Offline-First", icon: "clock" },
  { label: "No Data Selling", icon: "globe" },
] as const;

/**
 * Tiny single-line badge row (sits in the bottom-right above the
 * copyright). Kept short — the marquee trust signals live in the
 * trust-bar above this. These are the value claims, not the security
 * claims.
 */
export const footerBadges = [
  "Evidence-graded",
  "On-device analysis",
  "Clinician-informed",
] as const;

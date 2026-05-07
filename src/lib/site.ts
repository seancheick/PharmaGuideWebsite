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
  country: "US",
  email: "info@pharmaguide.io",
  city: "Boston, MA",
  twitter: "@pharmaguide",
} as const;

export const nav = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Methodology", href: "/methodology" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;

export const footerNav = {
  product: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Methodology", href: "/methodology" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Press", href: "/press" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Accessibility", href: "/accessibility" },
  ],
} as const;

export const footerBadges = [
  "Evidence-graded",
  "On-device analysis",
  "Privacy-first",
  "Clinician-informed",
] as const;

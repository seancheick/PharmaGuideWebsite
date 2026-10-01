import type { Metadata, MetadataRoute } from "next";
import { ACCESSIBILITY_DOC } from "./accessibility";
import { HIPAA_DOC } from "./hipaa";
import { formatLegalDate } from "./legal";
import { METHODOLOGY_LAST_UPDATED } from "./methodology";
import { PRIVACY_DOC } from "./privacy";
import { breadcrumbNode, webPageNode, type SchemaNode, type WebPageInput } from "./schema";
import { buildMetadata, ogImagePath } from "./seo";
import { site } from "./site";
import { TERMS_DOC } from "./terms";

/**
 * Page registry — the single record of every static route.
 *
 * One entry drives: <title> + description + canonical + social tags
 * (pageMetadata), the share card (/og/page/[key]), the WebPage and
 * breadcrumb JSON-LD (pageSchema), /sitemap.xml and /llms.txt.
 * Add a route here and it is wired everywhere; nothing else to remember.
 *
 * Titles lead with what people search for — nobody searches a new brand
 * name yet. Descriptions stay ≤160 characters so snippets don't truncate.
 */

export type PageKey =
  | "home"
  | "features"
  | "methodology"
  | "about"
  | "faq"
  | "blog"
  | "press"
  | "careers"
  | "privacy"
  | "terms"
  | "hipaa"
  | "accessibility";

export interface PageEntry {
  path: string;
  /** SEO title segment ("Features: …"); the home title is absolute. */
  title: string;
  description: string;
  /** Short name for breadcrumbs and link lists. */
  label: string;
  /** schema.org WebPage subtype. */
  schemaType?: WebPageInput["type"];
  /** Real content date, when one exists — never the build time. */
  lastModified?: string;
  /** Share-card copy: small caps eyebrow, headline, italic accent line. */
  og: { eyebrow: string; headline: string; accent: string };
  sitemap: { priority: number; changeFrequency: "weekly" | "monthly" | "yearly" };
  /** llms.txt listing: which section, and the one-line summary. */
  llms?: { section: "product" | "trust"; summary: string };
}

export const PAGES: Record<PageKey, PageEntry> = {
  home: {
    path: "/",
    title: `${site.name} — Supplement & Medication Interaction Checker`,
    description: site.description,
    label: "Home",
    og: {
      eyebrow: "The supplement & medication co-pilot",
      headline: "Your supplements don’t act in isolation.",
      accent: "Neither should your check.",
    },
    sitemap: { priority: 1, changeFrequency: "weekly" },
    llms: { section: "product", summary: "What PharmaGuide is and why it exists" },
  },
  features: {
    path: "/features",
    title: "Features: Interactions, Depletions & Recalls",
    description:
      "Whole-stack interaction checks, medication-nutrient depletion, ingredient transparency, personal fit, dose accumulation, and FDA recall alerts.",
    label: "Features",
    og: { eyebrow: "Features", headline: "Your whole stack,", accent: "checked as a system." },
    sitemap: { priority: 0.95, changeFrequency: "monthly" },
    llms: {
      section: "product",
      summary:
        "Six product pillars — interactions, medication-nutrient depletions, ingredient & quality transparency, personal fit, nutrient accumulation tracking, and live FDA recall monitoring",
    },
  },
  methodology: {
    path: "/methodology",
    title: "How We Verify Supplement Interaction Data",
    description:
      "Our four primary sources, five-step verification process, and clinical review — and exactly where human judgment takes over from software.",
    label: "Methodology",
    lastModified: METHODOLOGY_LAST_UPDATED,
    og: { eyebrow: "Methodology", headline: "How we verify", accent: "every interaction." },
    sitemap: { priority: 0.9, changeFrequency: "monthly" },
    llms: {
      section: "product",
      summary:
        "How we source, verify, and ship interaction data — the four primary sources (FDA, NIH, PubMed, professional clinical references), the five-step verification process, the medical advisory team",
    },
  },
  about: {
    path: "/about",
    title: "About: Our Mission & Clinical Team",
    description:
      "Why PharmaGuide exists and who builds it. The supplement industry was built to sell, not to protect you. We're closing that gap.",
    label: "About",
    schemaType: "AboutPage",
    og: { eyebrow: "About", headline: "Built to protect,", accent: "not to sell." },
    sitemap: { priority: 0.6, changeFrequency: "monthly" },
    llms: { section: "product", summary: "Why PharmaGuide exists, and the founder and clinicians behind it" },
  },
  faq: {
    path: "/faq",
    title: "FAQ: Supplement Interactions, Privacy & Launch",
    description:
      "What PharmaGuide checks, how interaction evidence is graded, where your health data stays, pricing, and when the apps open.",
    label: "FAQ",
    schemaType: "FAQPage",
    og: { eyebrow: "FAQ", headline: "Questions, answered", accent: "plainly." },
    sitemap: { priority: 0.7, changeFrequency: "monthly" },
    llms: {
      section: "product",
      summary: "What it is, privacy, accuracy, evidence, pricing, special populations, and launch timing",
    },
  },
  blog: {
    path: "/blog",
    title: "Supplement & Medication Safety Articles",
    description:
      "Evidence-based guides on supplement–drug interactions, medication-nutrient depletion, ingredient quality, and recalls — each one cited, dated, and signed.",
    label: "Blog",
    schemaType: "CollectionPage",
    og: { eyebrow: "Articles", headline: "What the evidence", accent: "actually says." },
    sitemap: { priority: 0.85, changeFrequency: "weekly" },
    llms: { section: "product", summary: "All articles, newest first" },
  },
  press: {
    path: "/press",
    title: "Press Kit & Media Resources",
    description:
      "Press kit for PharmaGuide. Boilerplate descriptions, leadership bios, brand assets, and the press contact. We respond within one business day.",
    label: "Press",
    og: { eyebrow: "Press & media", headline: "Press kit", accent: "and media resources." },
    sitemap: { priority: 0.5, changeFrequency: "monthly" },
    llms: { section: "product", summary: "Company facts, boilerplate, leadership bios, and the press contact" },
  },
  careers: {
    path: "/careers",
    title: "Careers: Build Supplement Safety Software",
    description:
      "Build an on-device drug-and-supplement interaction engine — depletions, dose accumulation, recalls. Direct clinical impact and ground-floor ownership.",
    label: "Careers",
    og: { eyebrow: "Careers", headline: "Direct clinical impact.", accent: "Ground-floor ownership." },
    sitemap: { priority: 0.5, changeFrequency: "monthly" },
  },
  privacy: {
    path: "/privacy",
    title: "Privacy Policy",
    description: `What PharmaGuide collects, why, and how to control it. Your medications and conditions stay on your device. Updated ${formatLegalDate(PRIVACY_DOC.lastUpdated)}.`,
    label: "Privacy",
    lastModified: PRIVACY_DOC.lastUpdated,
    og: { eyebrow: "Privacy policy", headline: "Your health details", accent: "stay on your device." },
    sitemap: { priority: 0.5, changeFrequency: "yearly" },
    llms: {
      section: "trust",
      summary: "What we collect, why, and how to control it. Medications, conditions and health profile stay on-device, never on our servers",
    },
  },
  terms: {
    path: "/terms",
    title: "Terms of Service",
    description: `Eligibility, medical disclaimer, acceptable use, and the rules of the road for PharmaGuide. Updated ${formatLegalDate(TERMS_DOC.lastUpdated)}.`,
    label: "Terms",
    lastModified: TERMS_DOC.lastUpdated,
    og: { eyebrow: "Terms of service", headline: "An educational tool,", accent: "not medical advice." },
    sitemap: { priority: 0.5, changeFrequency: "yearly" },
    llms: {
      section: "trust",
      summary: "Eligibility, medical disclaimer, acceptable use. Educational tool, not a substitute for medical advice",
    },
  },
  hipaa: {
    path: "/hipaa",
    title: "HIPAA Statement",
    description: `Where HIPAA applies to PharmaGuide, why we use its Security Rule as a design baseline, and how on-device data changes the equation. Updated ${formatLegalDate(HIPAA_DOC.lastUpdated)}.`,
    label: "HIPAA",
    lastModified: HIPAA_DOC.lastUpdated,
    og: { eyebrow: "HIPAA statement", headline: "Where HIPAA applies —", accent: "and why we design to it anyway." },
    sitemap: { priority: 0.4, changeFrequency: "yearly" },
    llms: {
      section: "trust",
      summary:
        "Where HIPAA actually applies, why we use the Security Rule as a design baseline, what the Healthcare Pros tier will cover",
    },
  },
  accessibility: {
    path: "/accessibility",
    title: "Accessibility Statement",
    description: `Our WCAG 2.2 AA target, what's in place across the website and apps, what's in progress, and how to report a barrier. Updated ${formatLegalDate(ACCESSIBILITY_DOC.lastUpdated)}.`,
    label: "Accessibility",
    lastModified: ACCESSIBILITY_DOC.lastUpdated,
    og: { eyebrow: "Accessibility", headline: "WCAG 2.2 AA —", accent: "and what's still owed." },
    sitemap: { priority: 0.4, changeFrequency: "yearly" },
    llms: { section: "trust", summary: "WCAG 2.2 AA target, what's in place, what's still owed" },
  },
};

export const PAGE_KEYS = Object.keys(PAGES) as PageKey[];

export function isPageKey(value: string): value is PageKey {
  return value in PAGES;
}

export function pageMetadata(key: PageKey): Metadata {
  const p = PAGES[key];
  return buildMetadata({
    title: p.title,
    absoluteTitle: key === "home",
    description: p.description,
    path: p.path,
    image: { path: ogImagePath.page(key), alt: `${p.og.headline} ${p.og.accent}` },
  });
}

/** WebPage + breadcrumb nodes for a registered page. */
export function pageSchema(
  key: PageKey,
  overrides: Partial<Omit<WebPageInput, "path">> = {}
): SchemaNode[] {
  const p = PAGES[key];
  const isHome = key === "home";
  const nodes: SchemaNode[] = [
    webPageNode({
      path: p.path,
      name: isHome ? site.name : p.title,
      description: p.description,
      type: p.schemaType,
      image: ogImagePath.page(key),
      dateModified: p.lastModified,
      breadcrumb: !isHome,
      ...overrides,
    }),
  ];
  if (!isHome) {
    nodes.push(
      breadcrumbNode(p.path, [
        { name: PAGES.home.label, path: "/" },
        { name: p.label, path: p.path },
      ])
    );
  }
  return nodes;
}

export function pageSitemapEntry(
  key: PageKey,
  lastModified?: string
): MetadataRoute.Sitemap[number] {
  const p = PAGES[key];
  const date = lastModified ?? p.lastModified;
  return {
    url: p.path === "/" ? site.url : `${site.url}${p.path}`,
    ...(date ? { lastModified: new Date(date) } : {}),
    changeFrequency: p.sitemap.changeFrequency,
    priority: p.sitemap.priority,
  };
}

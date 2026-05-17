/**
 * Blog types + client-safe helpers (NO node:fs imports).
 *
 * Why split: client components (BlogHubClient, BlogCard) need the
 * type definitions and pure helpers (formatBlogDate, getCategory,
 * CATEGORIES). The full blog.ts uses `node:fs` to read MDX files at
 * build time, which Turbopack cannot bundle into a client module —
 * even with type-only imports, since the bundler resolves the entire
 * module first.
 *
 * Server code (sitemap, server pages) should import from `./blog`,
 * which re-exports everything here PLUS the fs-based loaders.
 */

export interface BlogCategory {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
}

export const CATEGORIES: readonly BlogCategory[] = [
  {
    id: "health-education",
    label: "Health Education",
    shortLabel: "Education",
    description:
      "Research-backed guides on safe supplementation — interactions, depletions, quality, and how to build a smarter regimen.",
  },
  {
    // id stays "ingredient-spotlights" for URL stability — renaming the
    // visible labels only. Old label "Ingredient Spotlights" overlapped
    // with the "Spotlight" featured-pill on the blog hub and read as
    // a feature flag rather than a category. "Deep Dives" is clearer.
    id: "ingredient-spotlights",
    label: "Ingredient Deep Dives",
    shortLabel: "Deep Dive",
    description:
      "Deep dives into specific ingredients — what the evidence actually says, dosing, risks, and what to look for on a label.",
  },
  {
    id: "interactions-stacks",
    label: "Interactions & Stacks",
    shortLabel: "Interactions",
    description:
      "Drug-supplement interactions, supplement-supplement conflicts, and how to design a stack that actually works together.",
  },
  {
    id: "news-research",
    label: "News & Research",
    shortLabel: "News",
    description:
      "Emerging research, FDA updates, and the supplement-industry signal worth paying attention to.",
  },
  {
    id: "safety-alerts",
    label: "Safety Alerts",
    shortLabel: "Alerts",
    description:
      "FDA recalls, FAERS adverse-event signals, contamination findings, and warnings on dangerous combinations.",
  },
];

export function getCategory(id: string): BlogCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  updatedAt?: string;
  author: string;
  reviewer?: string;
  featured?: boolean;
  image?: string;
  tags?: string[];
  readTime: string;
  wordCount: number;
  content: string;
  // Governance fields (written by pg-blog-mdx skill).
  // YAML uses snake_case (review_required, risk_score, evidence_level);
  // the parser in blog.ts maps to these camelCase keys on load.
  reviewRequired?: boolean;
  riskScore?: number;
  evidenceLevel?: "Strong" | "Moderate" | "Limited" | "Mixed";
}

export function formatBlogDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Shared types + helpers for legal pages (Privacy / Terms / HIPAA /
 * Accessibility). All four pages share the same structural shape:
 *   • Hero with eyebrow, italic-serif punchline, "Last updated" date
 *   • Optional intro / executive summary block
 *   • Numbered sections with hairline-divided rows
 *   • Sticky table of contents (desktop) / collapsible (mobile)
 *   • Contact line at the bottom
 *
 * Each page exports a LegalDocument object that the shared LegalPage
 * component renders.
 *
 * Inline emphasis: section bodies use **bold** + [link](/url) markdown-
 * ish syntax, parsed by the same renderer used in FAQClient. Keeps the
 * data file readable without a markdown dependency.
 */

export interface LegalSection {
  /** kebab-case anchor id — appears in URLs like /privacy#data-collection */
  id: string;
  /** Section number — "1", "2", "3.1" — controls visual hierarchy */
  num: string;
  /** Section title — shown in TOC and as the heading */
  title: string;
  /**
   * Section body. Plain prose with **bold** and [link](/url) inline
   * emphasis. Use double-newline `\n\n` to start a new paragraph,
   * single newline `\n` becomes a soft break inside a paragraph.
   */
  body: string;
}

export interface LegalDocument {
  /** Page eyebrow (e.g. "PRIVACY POLICY") */
  eyebrow: string;
  /** Title — first part lands in ink */
  titleLead: string;
  /** Title — second part lands in italic-serif accent */
  titleEm: string;
  /** Subhead — one-line plain English summary */
  subhead: string;
  /** ISO 8601 date string for last-updated, e.g. "2026-05-08" */
  lastUpdated: string;
  /** Optional executive summary above the TOC */
  summary?: {
    title: string;
    /** 3-5 short bullet-style points covering the highlights */
    points: string[];
  };
  /** All numbered sections in order */
  sections: LegalSection[];
}

/**
 * Format an ISO date string as a human-readable display string.
 * Used in the LegalPage hero ("Last updated May 8, 2026").
 */
export function formatLegalDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

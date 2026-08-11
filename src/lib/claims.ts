/**
 * Statistical claims made on the marketing site — one auditable record each.
 *
 * Every number we put in front of a visitor needs three things attached to it:
 * the primary source, the arithmetic that turns that source into the figure we
 * display, and the boundary of what the figure does NOT say. This module holds
 * all three so a future editor can re-verify a claim without re-doing the
 * research, and so the rendered copy can't drift from the citation.
 *
 * Rule for adding an entry: quote the source verbatim, link the page you
 * actually read, record the date you read it, and write the boundary line
 * before you write the headline number.
 */

export type Claim = {
  /** What we render, e.g. "4,100+". Never a bare rounded number without the qualifier. */
  display: string;
  /** The figure as published by the source, before any arithmetic. */
  sourceValue: string;
  /** How `display` is derived from `sourceValue`. Written out, not implied. */
  derivation: string;
  /** Verbatim sentence from the source. Do not paraphrase this field. */
  quote: string;
  sourceLabel: string;
  sourceUrl: string;
  /** The source's own review/publication date, as shown on the page. */
  sourceReviewed: string;
  /** When we last opened the page and confirmed the quote still matches. */
  verified: string;
  /** What this figure does NOT establish. The counterweight to the headline. */
  boundary: string;
};

/**
 * The homepage's headline statistic.
 *
 * Verified 2026-08-11 by loading the CDC page in a browser. Note for whoever
 * checks next: cdc.gov returns HTTP 403 to plain HTTP clients (Akamai edge
 * block), so `curl` and fetch-based tools will fail on this URL. Use a real
 * browser. The figure is a floor ("more than 1.5 million"), which is why we
 * render "4,100+" with the plus and never "4,110" — precision we don't have.
 */
export const ADE_ER_VISITS: Claim = {
  display: "4,100+",
  sourceValue: "more than 1,500,000 ED visits per year",
  derivation: "1,500,000 ÷ 365 = 4,109.6 per day, floored to 4,100+",
  quote:
    "More than 1.5 million people visit emergency departments for ADEs each " +
    "year in the United States, and almost 500,000 require hospitalization.",
  sourceLabel: "CDC — FastStats: Medication Safety Data",
  sourceUrl:
    "https://www.cdc.gov/medication-safety/data-research/facts-stats/index.html",
  sourceReviewed: "April 17, 2024",
  verified: "2026-08-11",
  boundary:
    "Counts adverse drug events of every kind, not supplement interactions. " +
    "CDC attributes the leading share to anticoagulants (21%), diabetes " +
    "agents (14%), and antibiotics (13%) — prescription medicines. The page " +
    "does not characterize this count as preventable, so neither do we, and " +
    "it does not break out how many events involve an interaction.",
};

/**
 * The supplement-specific figure, cited on /about. Kept here so the two
 * numbers stay reconciled — a visitor who does the math between them should
 * find the difference already explained rather than discover a discrepancy.
 */
export const SUPPLEMENT_ER_VISITS: Claim = {
  display: "23,000",
  sourceValue: "23,005 ED visits per year (95% CI 18,611–27,398)",
  derivation: "Point estimate rounded to the nearest thousand",
  quote:
    "an estimated 23,000 emergency department visits in the United States " +
    "every year are attributed to adverse events related to dietary supplements",
  sourceLabel:
    "Geller AI et al., Emergency Department Visits for Adverse Events " +
    "Related to Dietary Supplements. N Engl J Med 2015;373:1531-40",
  sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/26465986/",
  sourceReviewed: "Study period 2004–2013",
  verified: "2026-08-11",
  boundary:
    "Adverse events related to supplements overall — dominated by " +
    "weight-loss and energy products, and by unsupervised ingestion in " +
    "children. It is not an interaction-specific figure, and it is roughly " +
    "63 visits a day, two orders of magnitude below the all-drug ADE count.",
};

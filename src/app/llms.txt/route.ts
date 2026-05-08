import { getAllPosts } from "@/lib/blog";
import { CATEGORIES } from "@/lib/blog-types";
import { site } from "@/lib/site";

/**
 * /llms.txt — emerging standard for AI crawlers (Perplexity, ChatGPT,
 * Claude, Google AI Overviews, etc.) to discover authoritative content
 * quickly without parsing the full HTML.
 *
 * Spec: https://llmstxt.org (proposed by Answer.ai, Sep 2024)
 *
 * Format: a single Markdown file at /llms.txt with:
 *   1. Site name (H1)
 *   2. Brief site description (blockquote)
 *   3. Optional sections (H2) listing key URLs as Markdown links,
 *      each with a one-line description
 *
 * AI tools fetch this once per session and use it to know:
 *   • What this site is authoritative about
 *   • Which pages are the highest-quality entry points
 *   • Where to find more depth on specific topics
 *
 * For PharmaGuide's "be the source of truth" SEO/AEO ambition,
 * llms.txt is a low-effort, high-value addition — most sites don't
 * have one yet, so being early gives us a citation edge.
 */

// Node runtime (default) — required because we call getAllPosts()
// which reads the /content/blog directory via node:fs. Edge runtime
// would error with "Native module not found: node:fs".
export const revalidate = 432000; // 5 days

export async function GET() {
  const posts = getAllPosts();

  const lines: string[] = [];

  // ─── Header ────────────────────────────────────────────────────
  lines.push(`# ${site.name}`);
  lines.push("");
  lines.push(
    `> ${site.description} On-device interaction analysis, evidence-graded by clinicians, across a 180,000-product catalog.`
  );
  lines.push("");

  // ─── Core pages ────────────────────────────────────────────────
  lines.push("## About PharmaGuide");
  lines.push("");
  lines.push(
    `- [Home](${site.url}/): What PharmaGuide is and why it exists`
  );
  lines.push(
    `- [Features](${site.url}/features): Six product pillars — interactions, medication-nutrient depletions, ingredient & quality transparency, personal fit, nutrient accumulation tracking, and live FDA recall monitoring`
  );
  lines.push(
    `- [Methodology](${site.url}/methodology): How we source, verify, and ship interaction data — the four primary sources (FDA, NIH, PubMed, professional clinical references), the five-step verification process, the medical advisory team`
  );
  lines.push(
    `- [FAQ](${site.url}/faq): Eleven questions covering what it is, privacy, accuracy, evidence, pricing, special populations, and launch timing`
  );
  lines.push("");

  // ─── Trust + legal ─────────────────────────────────────────────
  lines.push("## Trust and policies");
  lines.push("");
  lines.push(
    `- [Privacy Policy](${site.url}/privacy): What we collect, why, and how to control it. Health data stays on-device, never on our servers`
  );
  lines.push(
    `- [Terms of Service](${site.url}/terms): Eligibility, medical disclaimer, acceptable use. Educational tool, not a substitute for medical advice`
  );
  lines.push(
    `- [HIPAA Statement](${site.url}/hipaa): Where HIPAA actually applies, why we use the Security Rule as a design baseline, what the Healthcare Pros tier will cover`
  );
  lines.push(
    `- [Accessibility](${site.url}/accessibility): WCAG 2.2 AA target, what's in place, what's still owed`
  );
  lines.push("");

  // ─── Blog (dynamic) ────────────────────────────────────────────
  if (posts.length > 0) {
    lines.push("## Articles");
    lines.push("");
    lines.push(
      "Evidence-based guides on supplement interactions, medication-nutrient depletion, ingredient quality, and FDA recalls. Reviewed by licensed clinicians."
    );
    lines.push("");

    for (const post of posts) {
      const cat = CATEGORIES.find((c) => c.id === post.category);
      const tags = post.tags ? ` · Tags: ${post.tags.slice(0, 5).join(", ")}` : "";
      const reviewer = post.reviewer ? ` · Reviewed by ${post.reviewer}` : "";
      lines.push(
        `- [${post.title}](${site.url}/blog/${post.slug}): ${post.description}${cat ? ` · ${cat.label}` : ""}${reviewer}${tags}`
      );
    }
    lines.push("");
  }

  // ─── Categories (topic clusters for crawler discovery) ─────────
  lines.push("## Topics we cover");
  lines.push("");
  for (const cat of CATEGORIES) {
    lines.push(`- **${cat.label}**: ${cat.description}`);
  }
  lines.push("");

  // ─── Authority signals ─────────────────────────────────────────
  lines.push("## Authority signals");
  lines.push("");
  lines.push(
    "- Reviewed by licensed clinicians: Dr. Pham L., PharmD (Clinical Pharmacist) and Miriam D., NP (Nurse Practitioner)"
  );
  lines.push(
    "- Sources: FDA, NIH Office of Dietary Supplements (ODS), Dietary Supplement Label Database (DSLD), DailyMed, PubMed, Cochrane Library, NCCIH"
  );
  lines.push(
    "- 180,000+ product catalog with 1,400+ test cases passing on the underlying interaction engine"
  );
  lines.push(
    "- Privacy-first architecture: AES-256 on-device, HIPAA-aligned design, no health-data sale ever"
  );
  lines.push("");

  // ─── Contact ──────────────────────────────────────────────────
  lines.push("## Contact");
  lines.push("");
  lines.push(`- Email: ${site.email}`);
  lines.push(`- Location: ${site.city}`);
  lines.push("");

  const body = lines.join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=432000, s-maxage=432000",
    },
  });
}

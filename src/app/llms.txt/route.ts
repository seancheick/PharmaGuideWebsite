import { CATEGORIES, getAllPosts, getCategory, postModified } from "@/lib/blog";
import { FAQ_ITEMS } from "@/lib/faq";
import { PAGES, PAGE_KEYS } from "@/lib/pages";
import { CLINICIANS, PEOPLE, displayName } from "@/lib/people";
import { absoluteUrl } from "@/lib/schema";
import { site } from "@/lib/site";

/**
 * /llms.txt — a Markdown index of the site for AI tools (llmstxt.org).
 *
 * Google has said it ignores llms.txt (Search Central, June 2026); some
 * other AI tools read it. It costs nothing to keep, so it stays — but it
 * is generated entirely from the page registry, people registry and blog
 * so it can never say something the site itself doesn't.
 *
 * Node runtime: getAllPosts() reads /content/blog via node:fs.
 */

export const revalidate = 432000; // 5 days

function pageLines(section: "product" | "trust"): string[] {
  return PAGE_KEYS.filter((key) => PAGES[key].llms?.section === section).map((key) => {
    const p = PAGES[key];
    const summary =
      key === "faq" ? `${FAQ_ITEMS.length} questions — ${p.llms!.summary}` : p.llms!.summary;
    return `- [${p.label}](${absoluteUrl(p.path)}): ${summary}`;
  });
}

export async function GET() {
  const posts = getAllPosts();

  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.description} Interaction analysis runs on-device.`,
    "",
    "## About PharmaGuide",
    "",
    ...pageLines("product"),
    "",
    "## Trust and policies",
    "",
    ...pageLines("trust"),
    "",
  ];

  if (posts.length > 0) {
    lines.push(
      "## Articles",
      "",
      "Evidence-based guides on supplement interactions, medication-nutrient depletion, ingredient quality, and FDA recalls. Each lists its author, publication and update dates, and — where a clinician reviewed it — the reviewer.",
      ""
    );
    for (const post of posts) {
      const parts = [post.description];
      const cat = getCategory(post.category);
      if (cat) parts.push(cat.label);
      parts.push(`By ${displayName(PEOPLE[post.authorId])}`);
      if (post.reviewerId) parts.push(`Reviewed by ${displayName(PEOPLE[post.reviewerId])}`);
      parts.push(`Updated ${postModified(post)}`);
      lines.push(`- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)}): ${parts.join(" · ")}`);
    }
    lines.push("");
  }

  lines.push("## Topics we cover", "");
  for (const cat of CATEGORIES) lines.push(`- **${cat.label}**: ${cat.description}`);
  lines.push(
    "",
    "## Clinical reviewers",
    "",
    ...CLINICIANS.map(
      (p) => `- [${displayName(p)}](${absoluteUrl(`/about#${p.id}`)}): ${p.jobTitle} — ${p.bio}`
    ),
    "",
    "## Sources",
    "",
    "- FDA, NIH Office of Dietary Supplements (ODS), Dietary Supplement Label Database (DSLD), DailyMed, PubMed, Cochrane Library, NCCIH",
    "",
    "## Contact",
    "",
    `- Email: ${site.email}`,
    `- Press: ${site.pressEmail}`,
    `- Location: ${site.city}`,
    ""
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=432000, s-maxage=432000",
    },
  });
}

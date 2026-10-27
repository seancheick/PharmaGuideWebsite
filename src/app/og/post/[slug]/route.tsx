import { notFound } from "next/navigation";
import { getCategory, getPostBySlug, getRenderableSlugs, recallCountLabel } from "@/lib/blog";
import { renderOgCard, splitTitle } from "@/lib/og";
import { PEOPLE, displayName } from "@/lib/people";

/** Share card for each article: category, title, and who signed it. */

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getRenderableSlugs().map((slug) => ({ slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Weekly recall roundup: series cover with the week and recall count.
  if (post.recall) {
    const label = recallCountLabel(post.recall);
    return renderOgCard({
      eyebrow: "PharmaGuide Weekly",
      headline: "Supplement recalls",
      accent: post.recall.week,
      stat: { value: String(post.recall.count), label: label.replace(/^\d+ /, "") },
      footnote: "Restated from official FDA notices · Exact lots",
    });
  }

  const signer = post.reviewerId
    ? `Reviewed by ${displayName(PEOPLE[post.reviewerId])}`
    : `By ${displayName(PEOPLE[post.authorId])}`;

  return renderOgCard({
    eyebrow: getCategory(post.category)?.label ?? "Article",
    ...splitTitle(post.title),
    footnote: `${signer} · ${post.readTime}`,
  });
}

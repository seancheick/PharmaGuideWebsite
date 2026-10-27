import { notFound } from "next/navigation";
import { getCategory, getPostBySlug, getRenderableSlugs } from "@/lib/blog";
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

  const signer = post.reviewerId
    ? `Reviewed by ${displayName(PEOPLE[post.reviewerId])}`
    : `By ${displayName(PEOPLE[post.authorId])}`;

  return renderOgCard({
    eyebrow: getCategory(post.category)?.label ?? "Article",
    ...splitTitle(post.title),
    footnote: `${signer} · ${post.readTime}`,
  });
}

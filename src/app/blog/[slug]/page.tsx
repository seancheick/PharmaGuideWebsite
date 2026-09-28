import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsletterCTA } from "@/components/faq/NewsletterCTA";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogShare } from "@/components/blog/BlogShare";
import { mdxComponents } from "@/components/blog/MdxComponents";
import { ClinicianBadge } from "@/components/shared/ClinicianBadge";
import { JsonLd } from "@/components/shared/JsonLd";
import {
  formatBlogDate,
  getAllPosts,
  getCategory,
  getPostBySlug,
  getRelatedPosts,
  postModified,
} from "@/lib/blog";
import { PEOPLE, displayName, profilePath } from "@/lib/people";
import {
  absoluteUrl,
  breadcrumbNode,
  ref,
  schemaId,
  webPageNode,
} from "@/lib/schema";
import { buildMetadata, ogImagePath } from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * /blog/[slug] — individual blog post page.
 *
 * MDX content is rendered server-side via next-mdx-remote/rsc which
 * compiles the MDX at build time and emits HTML — no client JS needed
 * for the post body itself. Custom components (Callout, EvidencePill)
 * are mapped through the mdxComponents map.
 *
 * Generates static paths from /content/blog at build time, so each
 * post is a fully static HTML page on Vercel's edge.
 */

export const revalidate = 432000; // 5 days

// Static-generation: emit a route per post at build time
export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

// Per-post metadata — drives <title>, OG, Twitter, canonical
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  return buildMetadata({
    title: post.seoTitle ?? post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: { path: ogImagePath.post(post.slug), alt: post.title },
    article: {
      publishedTime: post.date,
      modifiedTime: postModified(post),
      authors: [absoluteUrl(profilePath(PEOPLE[post.authorId]))],
      section: getCategory(post.category)?.label,
      tags: post.tags,
    },
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const category = getCategory(post.category);
  const related = getRelatedPosts(post, 3);

  const author = PEOPLE[post.authorId];
  const reviewer = post.reviewerId ? PEOPLE[post.reviewerId] : undefined;
  const modified = postModified(post);
  const path = `/blog/${post.slug}`;
  const articleId = `${absoluteUrl(path)}#article`;

  // MedicalWebPage carries the clinical review (schema.org defines
  // reviewedBy/lastReviewed on WebPage); the BlogPosting is its main
  // entity. Author and reviewer point at the Person nodes the root layout
  // emits from lib/people.ts.
  const schema = [
    webPageNode({
      path,
      name: post.seoTitle ?? post.title,
      description: post.description,
      type: "MedicalWebPage",
      image: ogImagePath.post(post.slug),
      datePublished: post.date,
      dateModified: modified,
      reviewedBy: reviewer,
      lastReviewed: post.reviewedAt,
      mainEntity: articleId,
    }),
    {
      "@type": "BlogPosting",
      "@id": articleId,
      headline: post.title,
      description: post.description,
      url: absoluteUrl(path),
      image: [
        ...(post.image ? [absoluteUrl(post.image)] : []),
        absoluteUrl(ogImagePath.post(post.slug)),
      ],
      datePublished: post.date,
      dateModified: modified,
      author: ref(schemaId.person(author)),
      publisher: ref(schemaId.organization),
      mainEntityOfPage: ref(schemaId.webpage(path)),
      isPartOf: ref(schemaId.webpage("/blog")),
      inLanguage: site.lang,
      wordCount: post.wordCount,
      ...(post.tags ? { keywords: post.tags.join(", ") } : {}),
      ...(category ? { articleSection: category.label } : {}),
    },
    breadcrumbNode(path, [
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path },
    ]),
  ];

  return (
    <>
      <Header />
      <main id="main">
        {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
        <section
          aria-labelledby="post-hero-heading"
          className="relative pt-24 pb-section-y-sm overflow-hidden sm:pt-28 md:pt-32"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div
              className="absolute h-[140px] w-[480px] rounded-pill bg-accent/[0.06] blur-3xl"
              style={{ top: "-40px", right: "-160px", transform: "rotate(-10deg)" }}
            />
          </div>

          <div className="container relative mx-auto">
            <div className="mx-auto max-w-3xl">
              {/* Breadcrumb back-link */}
              <Link
                href="/blog"
                aria-label="Back to blog"
                className="inline-flex items-center gap-1.5 font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-muted transition-colors duration-fast ease-smooth hover:text-ink"
              >
                <span aria-hidden="true">←</span>
                Blog
              </Link>

              {/* Category eyebrow */}
              {category && (
                <p className="mt-8 font-mono text-eyebrow font-medium uppercase tracking-[0.16em] text-accent">
                  {category.label}
                </p>
              )}

              {/* Title */}
              <h1
                id="post-hero-heading"
                className="mt-5 text-balance text-display-md leading-[1.1] text-ink md:mt-6"
              >
                {post.title}
              </h1>

              {/* Description / dek */}
              <p className="mt-6 max-w-prose text-body-xl leading-relaxed text-muted md:mt-7">
                {post.description}
              </p>

              {/* Meta strip — author + dates + read time */}
              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-6 font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle md:mt-12">
                <span>
                  By{" "}
                  <Link
                    href={profilePath(author)}
                    className="text-foreground/85 underline decoration-foreground/25 underline-offset-[3px] transition-colors duration-fast ease-smooth hover:text-link hover:decoration-link/60"
                  >
                    {displayName(author)}
                  </Link>
                </span>
                <span aria-hidden="true" className="text-border-strong">·</span>
                <span>
                  Published <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
                </span>
                {modified !== post.date && (
                  <>
                    <span aria-hidden="true" className="text-border-strong">·</span>
                    <span className="text-foreground/85">
                      Updated <time dateTime={modified}>{formatBlogDate(modified)}</time>
                    </span>
                  </>
                )}
                <span aria-hidden="true" className="text-border-strong">·</span>
                <span>{post.readTime}</span>
              </div>

              {/* Clinical review — who checked this, linked to their
                  credentials. Only rendered when a reviewer signed off. */}
              {reviewer && (
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-border bg-surface/70 px-4 py-3 shadow-xs backdrop-blur-sm sm:inline-flex">
                  <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent">
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0"
                    >
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
                      <path
                        d="M5 8.2l2 2L11 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Clinically reviewed
                    {post.reviewedAt && (
                      <time dateTime={post.reviewedAt} className="text-subtle">
                        {formatBlogDate(post.reviewedAt)}
                      </time>
                    )}
                  </span>
                  <ClinicianBadge clinician={reviewer} />
                </div>
              )}

              {/* Share rail — compact horizontal row directly under the
                  byline. Client island (clipboard API needs JS); rest
                  of the hero is server-rendered. */}
              <BlogShare
                url={`${site.url}/blog/${post.slug}`}
                title={post.title}
                description={post.description}
              />
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━ ARTICLE BODY ━━━━━━━━━━━━━━━━━━ */}
        <section
          aria-label="Article body"
          className="relative pb-section-y"
        >
          <div className="container relative mx-auto">
            <article className="mx-auto max-w-3xl">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                  },
                }}
              />
            </article>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━ RELATED POSTS ━━━━━━━━━━━━━━━━━━ */}
        {related.length > 0 && (
          <section
            aria-labelledby="related-heading"
            className="relative section-y-sm bg-surface-raised/40"
          >
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />

            <div className="container relative mx-auto">
              <div className="mx-auto max-w-6xl">
                <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
                  Related reading
                </p>
                <h2
                  id="related-heading"
                  className="mt-5 text-balance text-display-md text-ink md:mt-6"
                >
                  More from{" "}
                  <span className="font-serif italic text-accent">
                    {related.every((p) => p.category === post.category)
                      ? (category?.label ?? "the blog")
                      : "the blog"}.
                  </span>
                </h2>

                <ul className="mt-10 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-3 lg:gap-6">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <BlogCard post={p} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <NewsletterCTA />
      </main>
      <Footer />

      <JsonLd nodes={schema} />
    </>
  );
}

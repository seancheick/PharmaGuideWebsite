import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsletterCTA } from "@/components/faq/NewsletterCTA";
import { BlogCard } from "@/components/blog/BlogCard";
import { mdxComponents } from "@/components/blog/MdxComponents";
import {
  formatBlogDate,
  getAllPosts,
  getCategory,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog";
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

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${site.url}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${site.url}/blog/${post.slug}`,
      siteName: site.name,
      locale: site.locale,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [post.author],
      ...(post.tags ? { tags: post.tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
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

  // BlogPosting + Breadcrumb JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${site.url}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    url: `${site.url}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: site.lang,
    wordCount: post.wordCount,
    author: {
      "@type": "Person",
      name: post.author,
    },
    ...(post.reviewer
      ? {
          reviewedBy: {
            "@type": "Person",
            name: post.reviewer,
          },
        }
      : {}),
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/icon2.png`,
      },
    },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    ...(post.tags ? { keywords: post.tags.join(", ") } : {}),
    ...(category
      ? { articleSection: category.label }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${site.url}/blog/${post.slug}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: site.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${site.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${site.url}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <Header />
      <main id="main">
        {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
        <section
          aria-labelledby="post-hero-heading"
          className="relative section-y-sm overflow-hidden"
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

              {/* Meta strip — author + date + read time */}
              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-6 font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle md:mt-12">
                <span>
                  By <span className="text-foreground/85">{post.author}</span>
                </span>
                {post.reviewer && (
                  <>
                    <span aria-hidden="true" className="text-border-strong">·</span>
                    <span>
                      Reviewed by{" "}
                      <span className="text-foreground/85">{post.reviewer}</span>
                    </span>
                  </>
                )}
                <span aria-hidden="true" className="text-border-strong">·</span>
                <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
                <span aria-hidden="true" className="text-border-strong">·</span>
                <span>{post.readTime}</span>
              </div>
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
                  Keep reading
                </p>
                <h2
                  id="related-heading"
                  className="mt-5 text-balance text-display-md text-ink md:mt-6"
                >
                  More from{" "}
                  <span className="font-serif italic text-accent">
                    {category?.label ?? "the blog"}.
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

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}

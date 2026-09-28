import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsletterCTA } from "@/components/faq/NewsletterCTA";
import { BlogHubClient } from "@/components/blog/BlogHubClient";
import { EditorialStandards } from "@/components/blog/EditorialStandards";
import { CATEGORIES, getAllPosts, getFeaturedPost, toCardPost } from "@/lib/blog";
import { JsonLd } from "@/components/shared/JsonLd";
import { pageMetadata, pageSchema } from "@/lib/pages";
import { absoluteUrl } from "@/lib/schema";

/**
 * /blog — the hub.
 *
 * Server-rendered. Reads posts from /content/blog at build time,
 * passes them to the BlogHubClient which handles search + category
 * filter as a client island.
 *
 * Sections:
 *   Hero        eyebrow + italic-serif punchline + subhead
 *   (Hub UI is rendered by BlogHubClient — featured + filter + grid)
 *   Editorial   trust block matching the legacy WP "Editorial Standards"
 *   Newsletter  reuse the same CTA from /faq
 *
 * ISR 5d so a new MDX commit propagates without a full rebuild.
 */

export const revalidate = 432000; // 5 days

export const metadata = pageMetadata("blog");

export default function BlogHubPage() {
  const posts = getAllPosts();
  const featured = getFeaturedPost();
  const schema = pageSchema("blog", {
    extra: {
      mainEntity: {
        "@type": "ItemList",
        itemListElement: posts.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(`/blog/${p.slug}`),
          name: p.title,
        })),
      },
    },
  });

  return (
    <>
      <Header />
      <main id="main">
        {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
        <section
          aria-labelledby="blog-hero-heading"
          className="relative pt-24 pb-section-y-sm overflow-hidden sm:pt-28 md:pt-32"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div
              className="absolute h-[160px] w-[520px] rounded-pill bg-accent/[0.06] blur-3xl"
              style={{ top: "-50px", right: "-180px", transform: "rotate(-10deg)" }}
            />
          </div>

          <div className="container relative mx-auto">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7">
              <p className="font-mono text-h3 font-medium uppercase tracking-[0.14em] text-accent">
                Blog
              </p>

              <h1
                id="blog-hero-heading"
                className="text-balance text-display-lg leading-[1.06] text-ink"
              >
                The science behind{" "}
                <span className="font-serif italic text-accent">
                  what you take.
                </span>
              </h1>

              <p className="max-w-prose text-body-lg leading-relaxed text-muted">
                Evidence-based guides on supplement interactions, medication
                depletions, ingredient quality, and the recalls that don&apos;t
                make headlines. Translated into clear, practical guidance.
              </p>

              {/* Trust trinity — reframed without "AI-Powered" */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
                <span>Evidence-based</span>
                <span aria-hidden="true" className="text-border-strong">·</span>
                <span>Clinician-reviewed</span>
                <span aria-hidden="true" className="text-border-strong">·</span>
                <span>Privacy-first</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hub interactive area (featured + filter + grid) */}
        <BlogHubClient
          posts={posts.map(toCardPost)}
          featured={featured && toCardPost(featured)}
          categories={CATEGORIES}
        />

        {/* Compact editorial-standards strip — replaces the heavy
            decorated section that lived here previously. Per direction:
            "should be at the bottom, compact, not over-decorated." */}
        <EditorialStandards />

        {/* Newsletter — reuse from /faq for cross-promotion */}
        <NewsletterCTA />
      </main>
      <Footer />
      <JsonLd nodes={schema} />
    </>
  );
}

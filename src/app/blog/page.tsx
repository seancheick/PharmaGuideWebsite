import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsletterCTA } from "@/components/faq/NewsletterCTA";
import { BlogHubClient } from "@/components/blog/BlogHubClient";
import { EditorialStandards } from "@/components/blog/EditorialStandards";
import { CATEGORIES, getAllPosts, getFeaturedPost } from "@/lib/blog";
import { site } from "@/lib/site";

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

const description =
  "Evidence-based guides on supplement interactions, medication-nutrient depletion, ingredient quality, and the recalls that don't make headlines. Reviewed by licensed clinicians.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: `${site.url}/blog` },
  openGraph: {
    title: "Blog",
    description,
    url: `${site.url}/blog`,
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description,
  },
};

export default function BlogHubPage() {
  const posts = getAllPosts();
  const featured = getFeaturedPost();

  // Blog schema — gives crawlers a structured anchor for the hub
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${site.url}/blog#blog`,
    name: "PharmaGuide Blog",
    description,
    url: `${site.url}/blog`,
    inLanguage: site.locale,
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/icon2.png`,
      },
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      "@id": `${site.url}/blog/${p.slug}`,
      headline: p.title,
      description: p.description,
      url: `${site.url}/blog/${p.slug}`,
      datePublished: p.date,
      dateModified: p.date,
      author: { "@type": "Person", name: p.author },
      ...(p.reviewer
        ? {
            reviewedBy: { "@type": "Person", name: p.reviewer },
          }
        : {}),
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${site.url}/blog#breadcrumb`,
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
    ],
  };

  return (
    <>
      <Header />
      <main id="main">
        {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
        <section
          aria-labelledby="blog-hero-heading"
          className="relative section-y-sm overflow-hidden"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div
              className="absolute h-[160px] w-[520px] rounded-pill bg-accent/[0.06] blur-3xl"
              style={{ top: "-50px", right: "-180px", transform: "rotate(-10deg)" }}
            />
          </div>

          <div className="container relative mx-auto">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7">
              <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
                Blog
              </p>

              <h1
                id="blog-hero-heading"
                className="text-balance text-display-lg leading-[1.06] text-ink"
              >
                Scan smart.{" "}
                <span className="font-serif italic text-accent">
                  Stack safely.
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
          posts={posts}
          featured={featured}
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

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}

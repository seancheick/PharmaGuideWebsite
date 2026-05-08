import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsletterCTA } from "@/components/faq/NewsletterCTA";
import { BlogHubClient } from "@/components/blog/BlogHubClient";
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

        {/* ━━━━━━━━━━━━━━━━━━ EDITORIAL TRUST ━━━━━━━━━━━━━━━━━━ */}
        <section
          aria-labelledby="editorial-heading"
          className="relative section-y-sm bg-surface-raised/40"
        >
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />

          <div className="container relative mx-auto">
            <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
              <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
                Editorial standards
              </p>
              <h2
                id="editorial-heading"
                className="mt-5 text-balance text-display-md text-ink md:mt-6"
              >
                How we ensure accuracy{" "}
                <span className="font-serif italic">in every article.</span>
              </h2>

              <ul className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-14 md:gap-6 lg:grid-cols-4">
                {[
                  {
                    title: "Evidence-based",
                    body: "Every claim is sourced — PubMed, NIH, FDA, peer-reviewed clinical literature.",
                  },
                  {
                    title: "Expert reviewed",
                    body: "Clinical pharmacist + nurse practitioner sign off on every post before it ships.",
                  },
                  {
                    title: "Regularly updated",
                    body: "Content revisited when new research emerges. Updates are dated and visible.",
                  },
                  {
                    title: "Editorially independent",
                    body: "Content is never influenced by sponsors, affiliates, or advertisers. We don't accept either.",
                  },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-6 text-left shadow-sm"
                  >
                    <p className="font-serif text-h3 italic leading-tight text-ink">
                      {item.title}
                    </p>
                    <p className="text-body-sm leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Reviewer credits */}
              <div className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-14 md:gap-6">
                {[
                  {
                    initials: "PL",
                    name: "Dr. Pham L.",
                    title: "Clinical Pharmacist · PharmD",
                  },
                  {
                    initials: "MD",
                    name: "Miriam D.",
                    title: "Nurse Practitioner · MSN",
                  },
                ].map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 text-left shadow-sm md:p-6"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-background"
                    >
                      <span className="font-serif text-h3 italic">{m.initials}</span>
                    </span>
                    <div>
                      <p className="font-serif text-h3 italic leading-tight text-ink">
                        {m.name}
                      </p>
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle">
                        {m.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

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

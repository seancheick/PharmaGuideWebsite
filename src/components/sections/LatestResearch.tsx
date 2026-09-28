"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { BlogCard } from "@/components/blog/BlogCard";
import type { BlogCardPost } from "@/lib/blog-types";
import { fadeUpContainer, fadeUpItem } from "@/lib/tokens";

/**
 * Latest research — the homepage's bridge into the articles.
 *
 * The homepage is the site's strongest page and linked to no article at
 * all, so the posts earned authority only through /blog. Three newest
 * posts, same BlogCard as the hub, same reveal rhythm as every other
 * section. Header is left-aligned with the "all articles" link opposite,
 * newsroom-style, so it reads as a shelf rather than another pitch.
 */
export function LatestResearch({ posts }: { posts: BlogCardPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="latest-research-heading" className="section-y relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute h-[140px] w-[480px] rounded-pill bg-accent/[0.05] blur-3xl"
          style={{ top: "12%", left: "-160px", transform: "rotate(10deg)" }}
        />
      </div>

      <div className="container relative mx-auto">
        <m.div
          variants={fadeUpContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10"
        >
          <div className="flex max-w-2xl flex-col gap-5 md:gap-6">
            <m.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              From the research desk
            </m.p>
            <m.h2
              id="latest-research-heading"
              variants={fadeUpItem}
              className="text-balance text-display-lg leading-[1.06] text-ink"
            >
              What the evidence <span className="font-serif italic text-accent">actually says.</span>
            </m.h2>
            <m.p variants={fadeUpItem} className="max-w-prose text-body-lg leading-relaxed text-muted">
              Plain-language guides to the research behind common supplement and medication
              questions — every claim cited, every article dated and signed.
            </m.p>
          </div>

          <m.div variants={fadeUpItem} className="shrink-0">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-5 py-2.5 text-body-sm font-medium text-ink shadow-xs transition-[border-color,box-shadow,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            >
              All articles
              <span
                aria-hidden="true"
                className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </m.div>
        </m.div>

        <m.ul
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 md:mt-16 lg:grid-cols-3 lg:gap-6"
        >
          {posts.map((post) => (
            <m.li key={post.slug} variants={fadeUpItem}>
              <BlogCard post={post} />
            </m.li>
          ))}
        </m.ul>
      </div>
    </section>
  );
}

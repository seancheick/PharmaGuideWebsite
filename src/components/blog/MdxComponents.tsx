import Image from "next/image";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

/**
 * Custom MDX components for blog posts.
 *
 * Maps standard markdown elements (h1, h2, p, ul, etc.) to the site's
 * design tokens, and provides custom components writers can drop into
 * post bodies (`<Callout>`, `<EvidencePill>`, etc.).
 *
 * Used by next-mdx-remote in BlogPostLayout.tsx.
 *
 * Typography rhythm: same italic-serif punchline pattern as the rest
 * of the site. h2 = italic-serif, h3 = ink medium, body in muted with
 * text-body and 1.7 leading for long-form readability.
 */

export const mdxComponents: MDXComponents = {
  // ─── Headings ──────────────────────────────────────────────────────
  h1: ({ children, ...props }) => (
    <h2
      className="mt-12 text-balance font-serif text-display-md italic leading-tight text-ink first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mt-12 text-balance font-serif text-h1 italic leading-tight text-ink"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-10 text-balance text-h2 font-medium leading-snug tracking-[-0.012em] text-ink"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="mt-8 font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-foreground/85"
      {...props}
    >
      {children}
    </h4>
  ),

  // ─── Body text ─────────────────────────────────────────────────────
  p: ({ children, ...props }) => (
    <p className="mt-5 text-body leading-[1.75] text-foreground/85" {...props}>
      {children}
    </p>
  ),

  // ─── Lists ─────────────────────────────────────────────────────────
  ul: ({ children, ...props }) => (
    <ul
      className="mt-5 flex flex-col gap-2.5 pl-1 text-body leading-[1.7] text-foreground/85 marker:text-accent [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-1 [&_li]:before:top-[0.7em] [&_li]:before:block [&_li]:before:h-1 [&_li]:before:w-1 [&_li]:before:rounded-full [&_li]:before:bg-accent"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="mt-5 ml-5 flex list-decimal flex-col gap-2.5 text-body leading-[1.7] text-foreground/85 marker:text-accent marker:font-medium"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => <li {...props}>{children}</li>,

  // ─── Inline emphasis ───────────────────────────────────────────────
  strong: ({ children, ...props }) => (
    <strong className="font-medium text-ink" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="font-serif italic text-ink" {...props}>
      {children}
    </em>
  ),

  // ─── Links ─────────────────────────────────────────────────────────
  a: ({ href, children, ...props }) => {
    const isExternal = typeof href === "string" && /^https?:\/\//.test(href);
    const isInternal = typeof href === "string" && href.startsWith("/");
    const className =
      "text-accent underline decoration-accent/40 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:decoration-accent";

    if (isInternal) {
      return (
        <Link href={href!} className={className} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        className={className}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },

  // ─── Quotes + code + dividers ──────────────────────────────────────
  // ─── Markdown-syntax images ────────────────────────────────────────
  // Plain ![alt](src) in MDX becomes an <img>, which doesn't get
  // next/image optimization. Map img → an unoptimized but properly
  // styled wrapper. For meaningful in-post imagery, writers should
  // use <PostImage> below — it gets full next/image optimization +
  // optional captions.
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      <figure className="my-10 md:my-12">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-subtle">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt ?? ""} className="h-auto w-full" />
        </div>
        {alt && (
          <figcaption className="mt-3 text-balance text-center text-body-sm italic leading-relaxed text-subtle">
            {alt}
          </figcaption>
        )}
      </figure>
    ) : null,

  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-8 border-l-2 border-accent/50 pl-5 font-serif text-h3 italic leading-snug text-ink [&>p]:mt-0"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }) => (
    <code
      className="rounded-md bg-surface-subtle px-1.5 py-0.5 font-mono text-[0.9em] text-ink"
      {...props}
    >
      {children}
    </code>
  ),
  hr: () => (
    <hr className="my-12 border-0 border-t border-border" aria-hidden="true" />
  ),

  // ─── Custom components writers can drop into post bodies ───────────

  /**
   * Inline callout box. Three tones:
   *   info   — neutral teal accent (default)
   *   accent — stronger teal background, for CTA-flavored callouts
   *   warn   — amber, for safety / caution callouts
   */
  Callout: ({
    tone = "info",
    children,
  }: {
    tone?: "info" | "accent" | "warn";
    children: React.ReactNode;
  }) => {
    const styles = {
      info: "border-border bg-surface-subtle",
      accent: "border-accent/30 bg-accent/[0.06]",
      warn: "border-severity-caution/40 bg-severity-caution/[0.08]",
    } as const;
    return (
      <aside
        className={cn(
          "my-8 rounded-2xl border p-6 text-body leading-relaxed text-foreground/85 [&>p]:mt-0 [&>p+p]:mt-3 sm:p-7",
          styles[tone]
        )}
      >
        {children}
      </aside>
    );
  },

  /**
   * Evidence-level pill — tiny chip writers can drop inline to label
   * a claim with the in-app evidence level (Established, Probable,
   * Moderate, Limited, Theoretical).
   */
  EvidencePill: ({ level }: { level: string }) => (
    <span className="ml-1 inline-flex items-center gap-1.5 rounded-pill bg-accent/[0.08] px-2.5 py-0.5 align-middle font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-accent">
      <span aria-hidden="true" className="block h-1 w-1 rounded-full bg-accent" />
      {level}
    </span>
  ),

  /**
   * In-post image with optional caption.
   *
   * Usage in MDX:
   *   <PostImage
   *     src="/blog/medication-depletion-guide/pills-on-counter.jpg"
   *     alt="Three orange prescription bottles on a kitchen counter"
   *     caption="Long-term prescription users often don't realize what's depleting"
   *     width={1600}
   *     height={1000}
   *   />
   *
   * Pass `priority` for above-the-fold images (e.g. the very first
   * image in a long post). Otherwise next/image lazy-loads.
   *
   * Aspect ratio is locked by the caller via width/height (next/image
   * requirement). Use 16:10 (1600×1000) or 16:9 (1600×900) for hero-
   * style; 4:3 (1600×1200) for documentary; square (1600×1600) for
   * subject-focused.
   *
   * The full markdown ![alt](src) syntax also still works (handled
   * separately above), but loses the caption + next/image optimization.
   * Use this component for meaningful in-post imagery.
   */
  PostImage: ({
    src,
    alt,
    caption,
    width = 1600,
    height = 1000,
    priority = false,
  }: {
    src: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
    priority?: boolean;
  }) => (
    <figure className="my-10 md:my-12">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-subtle">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1080px) 720px, 720px"
          className="h-auto w-full"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-balance text-center text-body-sm italic leading-relaxed text-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  ),
};

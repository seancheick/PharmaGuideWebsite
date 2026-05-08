import Image from "next/image";
import type { BlogPost, BlogCategory } from "@/lib/blog-types";
import { getCategory } from "@/lib/blog-types";
import { cn } from "@/lib/utils";

/**
 * BlogCardCover — the visual top of every blog card.
 *
 * Two modes:
 *   1. Real image — when post.image is set, renders via next/image
 *      with `fill` + `object-cover`. Standard editorial look.
 *
 *   2. Programmatic brand fallback — when post.image is missing,
 *      renders a deterministic SVG composition: deep-teal gradient,
 *      large category label as background type, faint capsule shapes,
 *      subtle grid lines. No two posts in the same category look
 *      identical because the seed (post.slug) shifts the geometry.
 *
 * The fallback ensures the blog hub never has empty card-tops, even
 * when content is mid-write. Posts without uploaded photos still look
 * editorial, branded, and intentional.
 *
 * Aspect ratio is controlled by the parent (default 16:10 in BlogCard,
 * 4:3 in BlogFeaturedCard's mobile mode, etc.). The cover fills 100%
 * of whatever box wraps it.
 */

interface BlogCardCoverProps {
  post: BlogPost;
  /** Sizes hint for next/image. Default tuned for the 3-col grid. */
  sizes?: string;
  /** Extra classes for the wrapper (e.g. group-hover scale). */
  className?: string;
  /** Force programmatic mode even if post.image exists (rare). */
  forceFallback?: boolean;
}

export function BlogCardCover({
  post,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className,
  forceFallback = false,
}: BlogCardCoverProps) {
  const cat = getCategory(post.category);

  if (post.image && !forceFallback) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[700ms] ease-emphasized group-hover:scale-[1.03]"
        />
        {/* Top gradient — keeps the category badge legible on light photos */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent"
        />
      </div>
    );
  }

  // ─── Programmatic fallback ───────────────────────────────────────
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-accent",
        className
      )}
    >
      <FallbackArt post={post} category={cat} />
    </div>
  );
}

// ─── Programmatic fallback art ───────────────────────────────────────
// Deterministic per-post composition. Each category has a signature
// hue + decorative pattern. The post's slug seeds a small offset so
// no two posts look identical.

function FallbackArt({
  post,
  category,
}: {
  post: BlogPost;
  category: BlogCategory | undefined;
}) {
  // Deterministic seed from slug — produces a number 0-99 for offset
  const seed = hashSlug(post.slug);
  const offsetA = (seed % 40) - 20; // -20 to 19
  const offsetB = ((seed * 7) % 40) - 20;

  return (
    <>
      {/* Base deep-teal background (already on wrapper bg-accent) */}

      {/* Soft accent halo — top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-[140%] w-[80%] rounded-pill bg-white/[0.08] blur-3xl"
        style={{
          top: `${-30 + offsetA}%`,
          right: `${-20 + offsetB}%`,
          transform: "rotate(-12deg)",
        }}
      />
      {/* Second halo — bottom-left for asymmetric depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-[80%] w-[60%] rounded-pill bg-white/[0.05] blur-2xl"
        style={{
          bottom: `${-20 - offsetA}%`,
          left: `${-15 + offsetA}%`,
          transform: "rotate(8deg)",
        }}
      />

      {/* Subtle grid overlay — gives the surface texture */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id={`grid-${post.slug}`}
            x="0"
            y="0"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              stroke="white"
              strokeWidth="0.5"
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${post.slug})`} />
      </svg>

      {/* Category label — large, low-opacity, italic-serif type as bg */}
      {category && (
        <p
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-serif italic leading-none text-white/[0.08]"
          style={{
            fontSize: "clamp(60px, 18vw, 180px)",
            letterSpacing: "-0.04em",
          }}
        >
          {category.shortLabel}
        </p>
      )}

      {/* Brand mark — dot in top-left */}
      <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 sm:left-6 sm:top-6">
        <span className="block h-2 w-2 rounded-full bg-white/85" />
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white/85">
          PharmaGuide
        </span>
      </div>
    </>
  );
}

// Small deterministic hash so the same slug produces the same offset.
function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

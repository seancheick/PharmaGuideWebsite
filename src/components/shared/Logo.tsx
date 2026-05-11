import Image from "next/image";

/**
 * Brand logo mark — 3D-rendered cross + leaves icon.
 *
 * Used alongside the live "PharmaGuide" wordmark text (always in
 * Geist Sans, color set by the parent) — so this component renders
 * ONLY the icon, never the wordmark. That keeps typography consistent
 * with the rest of the UI.
 *
 * The icon is multi-color (teal + white + green) and intentionally
 * does NOT recolor with `currentColor` — it's a rendered illustration,
 * not a symbolic mark. It reads on both the warm cream header surface
 * and the deep teal footer surface; if a dedicated dark-bg variant is
 * ever produced, swap the `src` here conditionally.
 *
 * `alt=""` is intentional. The text "PharmaGuide" sits next to this
 * icon in every usage — making the icon decorative for screen readers
 * avoids the double-announce "PharmaGuide PharmaGuide" anti-pattern.
 *
 * Source asset: 584×525 transparent WebP. Next.js auto-serves AVIF/
 * WebP per browser, downscaled to the requested display dimensions.
 */

type LogoSize = "sm" | "md" | "lg";

// Sized to feel visually balanced next to the wordmark text at each
// surface's font size. The intrinsic aspect ratio is 584:525 (≈1.11:1).
const SIZES: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 28, height: 25 }, // Header pill — sits next to text-body wordmark
  md: { width: 36, height: 32 }, // Footer — sits next to text-[1.5rem] wordmark
  lg: { width: 64, height: 58 }, // Reserved for future marketing-page hero use
};

interface LogoProps {
  size?: LogoSize;
  /**
   * Set to true when the logo appears above the fold (header).
   * Skips lazy-loading so the image starts fetching immediately.
   */
  priority?: boolean;
  className?: string;
}

export function Logo({ size = "sm", priority = false, className }: LogoProps) {
  const { width, height } = SIZES[size];
  return (
    <Image
      src="/brand/logo-icon.webp"
      alt=""
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}

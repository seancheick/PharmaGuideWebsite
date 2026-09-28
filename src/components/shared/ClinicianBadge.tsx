import Image from "next/image";
import Link from "next/link";
import { displayName, profilePath, type Person } from "@/lib/people";
import { cn } from "@/lib/utils";

/**
 * ClinicianBadge — compact reviewer chip used across surfaces.
 *
 * Replaces the per-page bespoke treatments of the same two reviewer
 * names (Laurie Pham, Miriam Farez) that previously appeared on About,
 * Methodology, Blog editorial strip, Press leadership, and blog post
 * bylines with inconsistent styling, sizes, and color choices.
 *
 * Visual contract — small, modern, no bulky card chrome:
 *   • 32×32 (sm) / 36×36 (md) avatar — photo with object-cover and
 *     ring-1 fallback
 *   • Inline-flex layout: avatar · stack(name, role)
 *   • Name in text-body-sm font-medium, role in text-overline mono caps
 *   • Links to the person's card on /about (profilePath) — the same URL
 *     the JSON-LD uses as their profile. Pass href={null} for no link.
 *   • Data comes from lib/people.ts; this file only renders it.
 *
 * Variant `inline` is even smaller (28×28 avatar, single line name+role
 * on one row) for use inside ribbons / source strips.
 */

export function ClinicianBadge({
  clinician,
  size = "sm",
  href,
  className,
}: {
  clinician: Person;
  size?: "sm" | "md" | "inline";
  /** Set to null to render without a link */
  href?: string | null;
  className?: string;
}) {
  const avatarSize = size === "md" ? 36 : size === "inline" ? 28 : 32;
  const name = displayName(clinician);
  const link = href === undefined ? profilePath(clinician) : href;

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        size === "inline" ? "gap-2" : "",
        className
      )}
    >
      {clinician.photo ? (
        <Image
          src={clinician.photo}
          alt=""
          // 2x natural width so retina screens get a crisp downscale
          // rather than upscaling a too-small source variant.
          width={avatarSize * 2}
          height={avatarSize * 2}
          quality={95}
          className="shrink-0 rounded-full object-cover ring-1 ring-border"
          style={{ width: avatarSize, height: avatarSize }}
        />
      ) : (
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent text-background"
          style={{ width: avatarSize, height: avatarSize }}
        >
          <span className="font-serif text-[12px] italic">
            {clinician.initials ?? "?"}
          </span>
        </span>
      )}

      {size === "inline" ? (
        <span className="text-body-sm leading-tight text-ink">
          {clinician.name}
          <span className="ml-1.5 font-mono text-overline uppercase text-subtle">
            {clinician.credential ?? clinician.jobTitle}
          </span>
        </span>
      ) : (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-body-sm font-medium text-ink">
            {name}
          </span>
          <span className="font-mono text-overline uppercase text-subtle">
            {clinician.jobTitle}
          </span>
        </span>
      )}
    </span>
  );

  if (link) {
    return (
      <Link
        href={link}
        className="inline-flex transition-opacity duration-fast ease-smooth hover:opacity-80"
      >
        {content}
      </Link>
    );
  }
  return content;
}

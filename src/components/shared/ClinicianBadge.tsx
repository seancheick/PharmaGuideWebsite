import Image from "next/image";
import Link from "next/link";
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
 *   • Optional `as="link"` wraps the whole badge in a Link to
 *     /about#team so a reader can click through to the clinician's
 *     section (until per-clinician profile pages exist)
 *
 * Variant `inline` is even smaller (28×28 avatar, single line name+role
 * on one row) for use inside ribbons / source strips.
 */

export type Clinician = {
  name: string;
  photo: string;
  /** Mono-caps role line (e.g. "DOCTOR OF PHARMACY") */
  role: string;
  /** Falls back to initials in a teal disc if photo missing */
  initials?: string;
};

export const CLINICIANS = {
  laurie: {
    name: "Laurie Pham, PharmD",
    photo: "/team/laurie-pham.webp",
    role: "Doctor of Pharmacy",
    initials: "LP",
  },
  miriam: {
    name: "Miriam Farez, NP",
    photo: "/team/miriam-farez.webp",
    role: "Nurse Practitioner",
    initials: "MF",
  },
} as const satisfies Record<string, Clinician>;

export function ClinicianBadge({
  clinician,
  size = "sm",
  href = "/about#team",
  className,
}: {
  clinician: Clinician;
  size?: "sm" | "md" | "inline";
  /** Set to null to render without a link */
  href?: string | null;
  className?: string;
}) {
  const avatarSize = size === "md" ? 36 : size === "inline" ? 28 : 32;

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
          alt={clinician.name}
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
            {clinician.role}
          </span>
        </span>
      ) : (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-body-sm font-medium text-ink">
            {clinician.name}
          </span>
          <span className="font-mono text-overline uppercase text-subtle">
            {clinician.role}
          </span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex transition-opacity duration-fast ease-smooth hover:opacity-80"
      >
        {content}
      </Link>
    );
  }
  return content;
}

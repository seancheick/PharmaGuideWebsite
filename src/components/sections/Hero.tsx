import Link from "next/link";
import { PhoneMockup } from "@/components/hero/PhoneMockup";

/**
 * Hero — first viewport, two-column on desktop, stacked on mobile.
 *
 * Server-rendered for fast LCP. Entrance animations use CSS keyframes
 * (`animate-fade-up` from tailwind config) with arbitrary `animation-delay`
 * utilities for stagger — no JS needed for this part. The phone column is
 * a client component (PhoneMockup → AppUILoop) since it runs an async loop.
 *
 * Halo gradient backdrop (`halo-hero`) provides ambient color from the top
 * without overpowering. Padding-top accounts for the floating header.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative halo-hero pb-section-y pt-24 sm:pt-28 md:pt-32"
      aria-label="Hero"
    >
      <div className="container mx-auto">
        <div className="grid items-center gap-14 md:grid-cols-[1.05fr_1fr] md:gap-12 lg:gap-20">
          {/* Copy column */}
          <div className="space-y-8 md:space-y-10">
            <p className="animate-fade-up font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
              On-device supplement safety
            </p>

            <h1 className="animate-fade-up text-display-xl text-ink [animation-delay:80ms]">
              Your supplements don&apos;t work in isolation.
              <br />
              <span className="text-muted">Neither should your check.</span>
            </h1>

            <p className="animate-fade-up max-w-prose text-body-xl text-muted [animation-delay:160ms]">
              See how your supplements, medications, and timing work together —
              not one bottle at a time.
            </p>

            <p className="animate-fade-up text-body-sm text-muted [animation-delay:240ms]">
              <span className="font-medium text-ink tnum">180,000+</span> products
              <span className="mx-1.5 text-border-strong">·</span>
              Evidence-graded
              <span className="mx-1.5 text-border-strong">·</span>
              Clinician-informed
            </p>

            <div className="animate-fade-up flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:gap-6 [animation-delay:320ms]">
              <Link
                href="#waitlist"
                className="inline-flex items-center justify-center gap-1.5 rounded-pill bg-accent px-5 py-2.5 text-body-sm font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-fast ease-smooth hover:bg-accent-strong hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              >
                Request Access
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="#problem"
                className="group inline-flex items-center gap-1.5 text-body-sm text-muted transition-colors duration-fast ease-smooth hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              >
                Why interactions matter
                <span
                  aria-hidden="true"
                  className="transition-transform duration-fast ease-smooth group-hover:translate-y-0.5"
                >
                  ↓
                </span>
              </a>
            </div>
          </div>

          {/* Phone column */}
          <div className="animate-fade-up [animation-delay:200ms]">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

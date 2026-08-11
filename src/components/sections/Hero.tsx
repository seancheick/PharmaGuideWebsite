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
      className="halo-hero relative overflow-x-clip pb-section-y pt-24 sm:pt-28"
      aria-label="Hero"
    >
      <div className="container mx-auto">
        {/* Copy column widened from 1.05fr to 1.2fr and the gap pulled in.
            An extra ~100px of measure is what takes the headline from five
            wrapped lines to four — cheaper vertical space than shrinking
            the type further, and the phone mockup reads fine narrower.

            Two columns start at lg, not md: at exactly 768px the split left
            the copy ~340px wide, which wrapped the CTA labels and squeezed
            the phone against the header. Tablets now get the stacked mobile
            layout, which has room for the headline at full measure.     */}
        <div className="grid items-center gap-14 lg:grid-cols-[1.2fr_0.9fr] lg:items-start lg:gap-14">
          {/* Copy column — rhythm tightened from space-y-8/10. Six children
              at 40px apart spent 200px of vertical budget on air; 24/28px
              still reads as editorial spacing and buys back the room that
              puts the CTA pair above the fold. */}
          <div className="space-y-6 md:space-y-7">
            <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
              The supplement &amp; medication co-pilot
            </p>

            <h1 className="text-display-hero text-ink">
              Your supplements don&apos;t work in isolation.
              <br />
              <span className="text-accent">Neither should your check.</span>
            </h1>

            {/* One personal promise — replaces the feature inventory
                (interactions, depletions, dose overlap, recalls, quality)
                that used to live here. That list is real, but it made the
                hero a spec sheet; it now lives on /features, linked below
                the trust pills. What the hero owes a first-time visitor is
                the outcome, stated as decision support — not advice.   */}
            <p className="max-w-prose animate-fade-up text-body-xl text-muted">
              Know whether this supplement is right for you — before it conflicts
              with your medications, conditions, or existing stack.
            </p>

            <div className="flex animate-fade-up flex-wrap items-center gap-x-5 gap-y-2 text-body-sm text-muted [animation-delay:80ms]">
              <span className="inline-flex items-center gap-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                  aria-hidden="true"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <span className="tnum font-medium text-ink">180,000+</span> products
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                  aria-hidden="true"
                >
                  <path d="M9 3h6v2H9zM12 5v3" />
                  <path d="M15.5 11h-7l-1 9h9l-1-9z" />
                  <circle cx="12" cy="15" r="1.5" />
                </svg>
                FDA · NIH · PubMed verified
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                  aria-hidden="true"
                >
                  <path d="M19 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Private by design
              </span>
            </div>

            {/* Tertiary deep-dive link — pulled out of the subhead so it
                stops competing with the primary CTA. Quiet mono caps,
                under the trust row, above the action buttons.          */}
            <Link
              href="/features"
              className="inline-flex w-fit animate-fade-up items-center gap-1.5 font-mono text-eyebrow uppercase text-accent transition-colors duration-fast ease-smooth [animation-delay:120ms] hover:text-accent-strong"
            >
              See everything we check
              <span aria-hidden="true">→</span>
            </Link>

            {/* CTA pair — the primary is the visitor's job ("Check my
                stack"), not ours ("Join the beta"). Both land on the same
                waitlist form because joining IS how you get a stack check
                today, so the secondary says "waitlist" out loud and the
                caption dates the promise: nobody should click "Check my
                stack" expecting an instant answer and find a signup form.
                When the app ships, the primary repoints and the caption
                comes out. Replaces the old "Why interactions matter ↓"
                scroll cue — three actions in one hero was one too many,
                and #problem is the next section anyway.                */}
            <div className="animate-fade-up pt-2 [animation-delay:160ms]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href="#waitlist"
                  /* border-transparent so the filled and outlined pills share
                     a box model and line up to the pixel. */
                  className="focus-visible:outline-offset-3 inline-flex items-center justify-center gap-1.5 rounded-pill border border-transparent bg-accent px-5 py-3 text-body-sm font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-fast ease-smooth hover:bg-accent-strong hover:shadow-glow focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Check my stack
                  <span aria-hidden="true">→</span>
                </Link>

                <Link
                  href="#waitlist"
                  className="focus-visible:outline-offset-3 inline-flex items-center justify-center gap-1.5 rounded-pill border border-border bg-surface px-5 py-3 text-body-sm font-medium text-ink shadow-xs transition-[transform,border-color,background-color] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Join the beta waitlist
                </Link>
              </div>

              {/* Sets expectation before the click, not after it. Mirrors the
                  waitlist section's own trust note so the two agree. Sits
                  inside the CTA block rather than taking its own space-y
                  slot — it belongs to the buttons, not beside them. */}
              <p className="mt-3 text-body-sm text-subtle">
                Free during beta · opening in waves through 2026
              </p>
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

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
      className="halo-hero relative overflow-x-clip pb-section-y pt-24 sm:pt-28 md:pt-32"
      aria-label="Hero"
    >
      <div className="container mx-auto">
        <div className="grid items-center gap-14 md:grid-cols-[1.05fr_1fr] md:gap-12 lg:gap-20">
          {/* Copy column */}
          <div className="space-y-8 md:space-y-10">
            <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
              The supplement &amp; medication co-pilot
            </p>

            <h1 className="text-display-xl text-ink">
              Your supplements don&apos;t work in isolation.
              <br />
              <span className="text-accent">Neither should your check.</span>
            </h1>

            {/* Subhead broadened: covers the full product surface
                (interactions, depletions, recalls, quality, fit) and now
                names the personalization + privacy posture that the app
                actually ships — checked against your conditions and
                medications, computed on-device. Kept as decision-support
                framing, not medical advice. Inline `/features` link lives
                in the tertiary link under the trust pills.             */}
            <p className="max-w-prose animate-fade-up text-body-xl text-muted">
              Check interactions, medication-nutrient depletions, dose overlap, FDA recalls, and
              ingredient quality across your full stack — personalized to your conditions and
              medications, privately on your device.
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

            <div className="flex animate-fade-up flex-col gap-4 pt-2 [animation-delay:160ms] sm:flex-row sm:items-center sm:gap-6">
              <Link
                href="#waitlist"
                className="focus-visible:outline-offset-3 inline-flex items-center justify-center gap-1.5 rounded-pill bg-accent px-5 py-3 text-body-sm font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-fast ease-smooth hover:bg-accent-strong hover:shadow-glow focus-visible:outline-2 focus-visible:outline-accent"
              >
                Join the beta
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="#problem"
                className="focus-visible:outline-offset-3 group inline-flex items-center gap-1.5 py-2 text-body-sm font-medium text-accent transition-colors duration-fast ease-smooth hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-accent"
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

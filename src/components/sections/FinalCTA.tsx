"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * Final CTA — the cinematic close.
 *
 * Conversion moment. Restrained — no urgency tactics, no countdown timers,
 * no "limited spots." Tone is "opening in waves" — by invitation, calm.
 *
 * Compressed: this section now does ONE job — capture the email. Everything
 * else (capability list, app stores, disclaimer, FAQ link) moved to the
 * footer so we don't have a "double footer" feel.
 *
 * Surface: bg-surface (not surface-subtle) + soft accent halo above so the
 * conversion moment reads brighter than the sections around it. Footer
 * (dark) provides the visual anchor below — together they give the page
 * a real ending.
 *
 * Social proof slot is designed but hidden until it has real numbers.
 */

// Toggle to true once you have a real waitlist count or named advisor to feature.
const SHOW_SOCIAL_PROOF = false;

export function FinalCTA() {
  const [email, setEmail] = useState("");
  const [stack, setStack] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }
    // TODO: wire to MailerLite or similar
    setSubmitted(true);
  };

  return (
    <section
      id="waitlist"
      aria-labelledby="cta-heading"
      className="relative section-y bg-background"
    >
      {/* Layered accent halo — radial bloom from upper-center.
          Stronger than the previous version (0.08 vs 0.05) and positioned
          higher so the eye reads "this section is brighter, this is the
          moment." Kept sub-1.0 alpha so it never goes neon. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{
          background:
            "radial-gradient(55% 75% at 50% 25%, rgb(24 59 63 / 0.08), transparent 70%)",
        }}
      />
      {/* Subtle warm under-glow at the bottom — helps the transition into
          the dark footer feel like a deliberate handoff, not a hard cut. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgb(244 242 238 / 0.5) 100%)",
        }}
      />

      <div className="container relative mx-auto">
        <motion.div
          variants={fadeUpContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="mx-auto flex max-w-2xl flex-col items-center gap-7 text-center md:gap-9"
        >
          {/* Social proof slot — hidden until real numbers exist */}
          {SHOW_SOCIAL_PROOF && (
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/65"
            >
              Joining 1,200+ early members
            </motion.p>
          )}

          <motion.h2
            id="cta-heading"
            variants={fadeUpItem}
            className="text-balance text-display-lg text-ink"
          >
            Opening
            <br />
            <span className="font-serif italic">in waves.</span>
          </motion.h2>

          <motion.p
            variants={fadeUpItem}
            className="max-w-prose text-body-lg leading-relaxed text-muted"
          >
            Join the beta and be among the first to use PharmaGuide as we
            prepare for launch.
          </motion.p>

          {/* Form */}
          <motion.div variants={fadeUpItem} className="w-full max-w-lg">
            {submitted ? (
              <SuccessState />
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="sr-only" htmlFor="cta-email">
                  Email address
                </label>
                <input
                  id="cta-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-pill border border-border bg-surface px-5 py-3.5 text-body text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-fast ease-smooth placeholder:text-subtle focus:border-accent focus:shadow-glow"
                />

                <label className="sr-only" htmlFor="cta-stack">
                  Optional: what supplements or medications do you currently take?
                </label>
                <textarea
                  id="cta-stack"
                  rows={2}
                  placeholder="Optional — what do you take? e.g. magnesium glycinate, vitamin D, metformin"
                  value={stack}
                  onChange={(e) => setStack(e.target.value)}
                  className="w-full resize-none rounded-2xl border border-border bg-surface px-5 py-3.5 text-body-sm leading-relaxed text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-fast ease-smooth placeholder:text-subtle focus:border-accent focus:shadow-glow"
                />

                <button
                  type="submit"
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-pill bg-accent px-6 py-3.5 text-body font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
                >
                  Request early access
                  <span aria-hidden="true">→</span>
                </button>
              </form>
            )}

            {/* Trust note — three pieces, all on one line on desktop.
                This is the only post-form line. Disclaimer + app stores
                + FAQ live in the footer now so this section has one job
                and one job only: capture the email.                    */}
            <p className="mt-4 text-body-sm text-muted">
              Free during beta
              <span className="mx-2 text-border-strong">·</span>
              No credit card
              <span className="mx-2 text-border-strong">·</span>
              We never sell your health data
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function SuccessState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.reveal}
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-7 text-center shadow-sm"
      )}
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-severity-safe/15"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 7l3 3 5-6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-severity-safe"
          />
        </svg>
      </span>
      <p className="font-serif text-h3 italic text-ink">You&apos;re in.</p>
      <p className="text-body-sm text-muted">
        Watch your inbox — we&apos;ll send a confirmation when your wave opens.
      </p>
    </motion.div>
  );
}

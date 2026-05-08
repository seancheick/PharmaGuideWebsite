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
 * Includes the four post-launch trust items the user requested:
 *   • Free during beta · No credit card · We never sell health data
 *   • App Store + Google Play coming soon
 *   • "Inside the beta" — concrete capability list (5 short bullets)
 *   • Disclaimer line that closes the conceptual frame
 *
 * Social proof slot is designed but hidden until it has real numbers.
 */

const BETA_FEATURES = [
  "Scan supplement labels",
  "Check medication conflicts",
  "Understand timing interactions",
  "Save and review your stack",
  "Export reports for appointments",
] as const;

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
      className="relative section-y bg-surface-subtle/40"
    >
      {/* Soft accent halo behind the form */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[60%]"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 30%, rgb(24 59 63 / 0.05), transparent 70%)",
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

            {/* Trust note — three pieces, all on one line on desktop */}
            <p className="mt-4 text-body-sm text-muted">
              Free during beta
              <span className="mx-2 text-border-strong">·</span>
              No credit card
              <span className="mx-2 text-border-strong">·</span>
              We never sell your health data
            </p>
          </motion.div>

          {/* Inside the beta — concrete capability preview, restrained */}
          <motion.div
            variants={fadeUpItem}
            className="mt-6 w-full max-w-lg border-t border-border/70 pt-8 text-left"
          >
            <p className="text-center font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-foreground/65">
              Inside the beta
            </p>
            <ul className="mx-auto mt-5 grid max-w-md gap-2.5 text-body-sm text-ink sm:grid-cols-1">
              {BETA_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-[8px] block h-1 w-1 shrink-0 rounded-full bg-accent"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* App stores — coming soon */}
          <motion.p
            variants={fadeUpItem}
            className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-subtle"
          >
            iOS + Android
            <span className="mx-2 text-border-strong">·</span>
            App Store + Google Play
            <span className="mx-2 text-border-strong">·</span>
            Coming soon
          </motion.p>

          {/* Disclaimer — closes the conceptual frame */}
          <motion.p
            variants={fadeUpItem}
            className="max-w-prose text-balance pt-2 text-body-sm leading-relaxed text-muted"
          >
            PharmaGuide is not a replacement for medical care. It&apos;s a
            clearer way to understand what may deserve a second look.
          </motion.p>

          {/* Tiny FAQ link — escape hatch for objections we didn't address */}
          <motion.a
            variants={fadeUpItem}
            href="/faq"
            className="group inline-flex items-center gap-1.5 text-body-sm text-muted transition-colors duration-fast ease-smooth hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
          >
            More questions? Read the FAQ
            <span
              aria-hidden="true"
              className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
            >
              →
            </span>
          </motion.a>
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

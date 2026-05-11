"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import { joinBetaWaitlist } from "@/app/actions/subscribe";
import { isValidEmail } from "@/lib/validation";
import { cn } from "@/lib/utils";

/**
 * Final CTA — the cinematic close.
 *
 * Conversion moment. Restrained — no urgency tactics, no countdown timers,
 * no "limited spots." Tone is "opening in waves" — by invitation, calm.
 *
 * Layout: two columns at md+, stacked on mobile.
 *   Left  — headline + subhead + form + trust note
 *   Right — "Inside the beta" preview: 3 italic-serif capability rows
 *           with mono numbering and hairline dividers. NOT a bullet
 *           stack — typography does the work. Mirrors the HowItWorks
 *           cards' angle so the page closes on the same product story.
 *
 * Submit goes through a server action (joinBetaWaitlist) which:
 *   1. Adds the email to the Resend "beta-waitlist" Audience
 *   2. Sends a branded welcome email via React Email template
 *
 * No MailerLite, no third-party form scripts — entire pipe is in our
 * own code so we can customize copy, retries, and email design.
 */

const SHOW_SOCIAL_PROOF = false;

const BETA_CAPABILITIES = [
  {
    num: "01",
    title: "Scan & search",
    body: "180,000+ product catalog, pre-loaded on your device. Sub-10ms lookup, even offline.",
  },
  {
    num: "02",
    title: "Verdicts with reasoning",
    body: "Every interaction includes the mechanism, evidence level, and recommendation — in plain English.",
  },
  {
    num: "03",
    title: "Personal Fit",
    body: "Adapts to your conditions, medications, and goals. Recomputed fresh, never cached, never sold.",
  },
] as const;

export function FinalCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    setSubmitting(true);
    setError("");

    // Honeypot — bots fill any input named "company"; real users never
    // see it. Server silently no-ops if non-empty.
    const formData = new FormData(e.currentTarget);
    const company = (formData.get("company") as string | null) ?? "";

    try {
      const result = await joinBetaWaitlist({ email, company });
      if (result.ok) {
        setSubmitted(true);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Something went wrong. Try again in a moment?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="waitlist"
      aria-labelledby="cta-heading"
      className="relative section-y bg-background"
    >
      {/* Layered accent halo from upper-center */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{
          background:
            "radial-gradient(55% 75% at 50% 25%, rgb(var(--color-accent) / 0.08), transparent 70%)",
        }}
      />
      {/* Warm under-glow handing off to the dark footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgb(var(--color-surface-subtle) / 0.5) 100%)",
        }}
      />

      <div className="container relative mx-auto">
        <motion.div
          variants={fadeUpContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-16 lg:gap-20"
        >
          {/* ─── LEFT COLUMN: headline + form ─── */}
          <div className="flex flex-col items-center gap-7 text-center md:items-start md:text-left md:gap-8">
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
              className="text-balance text-display-lg leading-[1.06] text-ink"
            >
              Opening{" "}
              <span className="font-serif italic text-accent">in waves.</span>
            </motion.h2>

            <motion.p
              variants={fadeUpItem}
              className="max-w-prose text-body-lg leading-relaxed text-muted"
            >
              Join the beta and be among the first to use PharmaGuide as we
              prepare for launch.
            </motion.p>

            <motion.div variants={fadeUpItem} className="w-full max-w-lg">
              {submitted ? (
                <SuccessState />
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  {/* Honeypot — off-screen, aria-hidden, not tabbable.
                      Bots auto-fill all inputs; real users never see it. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0"
                  >
                    <label htmlFor="cta-company">
                      Company (leave blank)
                      <input
                        id="cta-company"
                        type="text"
                        name="company"
                        tabIndex={-1}
                        autoComplete="off"
                        defaultValue=""
                      />
                    </label>
                  </div>

                  <label className="sr-only" htmlFor="cta-email">
                    Email address
                  </label>
                  <input
                    id="cta-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    className="w-full rounded-pill border border-border bg-surface px-5 py-3.5 text-body text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-fast ease-smooth placeholder:text-subtle focus:border-accent focus:shadow-glow disabled:opacity-60"
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      "mt-1 inline-flex items-center justify-center gap-2 rounded-pill bg-accent px-6 py-3.5 text-body font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-fast ease-smooth focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
                      submitting
                        ? "cursor-wait opacity-80"
                        : "hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-glow"
                    )}
                  >
                    {submitting ? "Sending…" : "Join the beta"}
                    {!submitting && <span aria-hidden="true">→</span>}
                  </button>
                  {error && (
                    <p
                      role="alert"
                      className="mt-1 text-body-sm text-severity-avoid"
                    >
                      {error}
                    </p>
                  )}
                </form>
              )}

              {/* Trust note */}
              <p className="mt-4 text-body-sm text-muted">
                Free during beta
                <span className="mx-2 text-border-strong">·</span>
                No credit card
                <span className="mx-2 text-border-strong">·</span>
                We never sell your health data
              </p>
            </motion.div>
          </div>

          {/* ─── RIGHT COLUMN: Inside the beta preview ─── */}
          {/* Was <motion.aside> — switched to <motion.div> because axe
              flags <aside> inside <main> as a nested complementary
              landmark. The h3 + ul inside still gives screen readers
              a labeled list, no semantic loss.                      */}
          <motion.div
            variants={fadeUpItem}
            className="relative w-full"
          >
            {/* Soft accent halo behind the preview block */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-accent/[0.04] blur-2xl"
            />

            <div className="relative">
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-subtle">
                Inside the beta
              </p>

              <ul className="mt-6 divide-y divide-border/70 border-y border-border/70">
                {BETA_CAPABILITIES.map((cap) => (
                  <li key={cap.num} className="py-5 first:pt-6 last:pb-6">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[10px] font-medium tabular-nums uppercase tracking-[0.18em] text-accent">
                        {cap.num}
                      </span>
                      <h3 className="font-serif text-h3 italic leading-snug text-ink">
                        {cap.title}
                      </h3>
                    </div>
                    <p className="mt-2 max-w-[36ch] pl-[1.6rem] text-body-sm leading-relaxed text-muted">
                      {cap.body}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                + everything that ships at launch
              </p>
            </div>
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
      <p className="font-serif text-h3 italic text-ink">You&apos;re on the list.</p>
      <p className="text-body-sm text-muted">
        We sent a confirmation to your inbox. Your wave opens through 2026 — we&apos;ll write again then.
      </p>
    </motion.div>
  );
}

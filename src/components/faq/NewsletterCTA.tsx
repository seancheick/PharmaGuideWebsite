"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import { subscribeToNewsletter } from "@/app/actions/subscribe";
import { isValidEmail } from "@/lib/validation";
import { cn } from "@/lib/utils";

/**
 * Newsletter CTA — used at the bottom of /faq.
 *
 * Different intent from the homepage's beta CTA. The homepage asks
 * "are you ready to commit to using the product?" This asks "are you
 * ready to stay informed?" — much lower commitment, broader audience.
 *
 * Mirrors FinalCTA's visual structure (radial halo, italic-serif
 * punchline, pill button, trust note) so the page resolves into the
 * same conversion-moment register the homepage ends on. Different
 * copy + email-only field (no supplement-stack textarea).
 *
 * On submit: client-side validation only for now. Wire to Resend /
 * Mailerlite / Loops once the email provider is chosen.
 */

export function NewsletterCTA() {
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

    const formData = new FormData(e.currentTarget);
    const company = (formData.get("company") as string | null) ?? "";

    try {
      const result = await subscribeToNewsletter({ email, company });
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
      aria-labelledby="newsletter-heading"
      className="relative section-y bg-background"
    >
      {/* Soft accent halo (matches FinalCTA pattern) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{
          background:
            "radial-gradient(55% 75% at 50% 25%, rgb(var(--color-accent) / 0.08), transparent 70%)",
        }}
      />
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
          <motion.h2
            id="newsletter-heading"
            variants={fadeUpItem}
            className="text-balance text-display-lg leading-[1.06] text-ink"
          >
            Stay in{" "}
            <span className="font-serif italic">the loop.</span>
          </motion.h2>

          <motion.p
            variants={fadeUpItem}
            className="max-w-prose text-body-lg leading-relaxed text-muted"
          >
            Latest research, supplement recalls, interaction updates, and the
            health industry&apos;s signal — distilled. One email, no noise.
          </motion.p>

          <motion.div variants={fadeUpItem} className="w-full max-w-lg">
            {submitted ? (
              <SuccessState />
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Honeypot — off-screen, aria-hidden, not tabbable. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0"
                >
                  <label htmlFor="newsletter-company">
                    Company (leave blank)
                    <input
                      id="newsletter-company"
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                      defaultValue=""
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                  <label className="sr-only" htmlFor="newsletter-email">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    className="flex-1 rounded-pill border border-border bg-surface px-5 py-3.5 text-body text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-fast ease-smooth placeholder:text-subtle focus:border-accent focus:shadow-glow disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-pill bg-accent px-6 py-3.5 text-body font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-fast ease-smooth focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
                      submitting
                        ? "cursor-wait opacity-80"
                        : "hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-glow"
                    )}
                  >
                    {submitting ? "Sending…" : "Subscribe"}
                    {!submitting && <span aria-hidden="true">→</span>}
                  </button>
                </div>
                {error && (
                  <p
                    role="alert"
                    className="text-body-sm text-severity-avoid"
                  >
                    {error}
                  </p>
                )}
              </form>
            )}

            <p className="mt-4 text-body-sm text-muted">
              Roughly monthly
              <span className="mx-2 text-border-strong">·</span>
              No spam
              <span className="mx-2 text-border-strong">·</span>
              Unsubscribe anytime
            </p>
          </motion.div>

          {/* Tiny help line — replaces the standalone "Can't find
              your answer?" strip with an inline contact link */}
          <motion.p
            variants={fadeUpItem}
            className="text-body-sm text-muted"
          >
            Still have a specific question?{" "}
            <a
              href="mailto:info@pharmaguide.io"
              className="text-accent underline decoration-accent/40 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:decoration-accent"
            >
              info@pharmaguide.io
            </a>
          </motion.p>
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
        Watch your inbox — first dispatch arrives soon.
      </p>
    </motion.div>
  );
}

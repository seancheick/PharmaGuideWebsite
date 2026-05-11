"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { requestProvidersAccess } from "@/app/actions/subscribe";
import { isValidEmail } from "@/lib/validation";
import { transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * Healthcare Pros early-access form — embedded in HIPAA section 5.
 *
 * Clinicians reading the HIPAA page are the highest-intent visitors on
 * the site for the 2026 Pro tier. Replacing the passive mailto with a
 * structured 3-field form converts that intent into a lead the team
 * receives directly at providers@pharmaguide.io.
 *
 * Fields: role (required), email (required), organization (optional),
 * notes (optional). Same honeypot + rate-limit posture as the beta
 * waitlist form.
 */

const ROLES = [
  "Pharmacist",
  "Physician",
  "Nurse Practitioner",
  "Other",
] as const;

type Role = (typeof ROLES)[number];

export function HipaaProvidersForm() {
  const [role, setRole] = useState<Role>("Pharmacist");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [notes, setNotes] = useState("");
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
      const result = await requestProvidersAccess({
        email,
        role,
        organization: org,
        notes,
        company,
      });
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

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.reveal}
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
      >
        <p className="font-serif text-h3 italic leading-tight text-ink">
          You&apos;re on the list.
        </p>
        <p className="mt-2 text-body-sm leading-relaxed text-muted">
          Thanks — we&apos;ll be in touch as the Healthcare Pros tier opens
          in 2026. If you have a specific use case, reply to the
          confirmation thread and a human will respond within 5 business
          days.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-7"
      aria-label="Healthcare Pros early-access request"
    >
      <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-accent">
        Healthcare Pros · early access
      </p>
      <p className="mt-3 font-serif text-h3 italic leading-snug text-ink">
        Tell us a little, and we&apos;ll reach out as the Pro tier opens.
      </p>

      {/* Honeypot — bots auto-fill, real users never see */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0"
      >
        <label htmlFor="providers-company">
          Company (leave blank)
          <input
            id="providers-company"
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Role */}
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/75">
            Role
          </span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            disabled={submitting}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-body-sm text-ink outline-none transition-[border-color,box-shadow] duration-fast ease-smooth focus:border-accent focus:shadow-glow disabled:opacity-60"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        {/* Email */}
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/75">
            Work email
          </span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@clinic.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-body-sm text-ink outline-none transition-[border-color,box-shadow] duration-fast ease-smooth placeholder:text-subtle focus:border-accent focus:shadow-glow disabled:opacity-60"
          />
        </label>

        {/* Organization (optional) */}
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/75">
            Organization
            <span className="ml-1.5 normal-case tracking-normal text-subtle">
              (optional)
            </span>
          </span>
          <input
            type="text"
            autoComplete="organization"
            placeholder="Practice, hospital, or institution"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            disabled={submitting}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-body-sm text-ink outline-none transition-[border-color,box-shadow] duration-fast ease-smooth placeholder:text-subtle focus:border-accent focus:shadow-glow disabled:opacity-60"
          />
        </label>

        {/* Notes (optional) */}
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/75">
            Use case
            <span className="ml-1.5 normal-case tracking-normal text-subtle">
              (optional)
            </span>
          </span>
          <textarea
            rows={3}
            placeholder="What would you use PharmaGuide for in your practice?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={submitting}
            className="w-full resize-y rounded-xl border border-border bg-background px-4 py-2.5 text-body-sm leading-relaxed text-ink outline-none transition-[border-color,box-shadow] duration-fast ease-smooth placeholder:text-subtle focus:border-accent focus:shadow-glow disabled:opacity-60"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-pill bg-accent px-6 py-3 text-body-sm font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-fast ease-smooth focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
            submitting
              ? "cursor-wait opacity-80"
              : "hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-glow"
          )}
        >
          {submitting ? "Sending…" : "Request early access"}
          {!submitting && <span aria-hidden="true">→</span>}
        </button>
        <p className="text-body-sm text-muted">
          BAA support · audit-ready by launch
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-body-sm text-severity-avoid">
          {error}
        </p>
      )}
    </form>
  );
}

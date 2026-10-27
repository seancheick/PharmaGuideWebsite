"use client";

import { useState } from "react";
import { requestSafetyBrief } from "@/app/actions/subscribe";
import { track, type BriefPlacement } from "@/lib/analytics";
import { markBriefRequested } from "@/lib/brief-offer";
import { isValidEmail } from "@/lib/validation";
import { cn } from "@/lib/utils";

/**
 * Safety Brief request form — the one form behind every brief offer
 * (/checklist, the blog dialog and sheet, the end-of-article offer).
 *
 * Same defensive pattern as the other subscribe surfaces: client-side
 * format check, honeypot field named "company" (bots fill it, humans
 * never see it), server action handles rate limiting + Resend.
 *
 * Only a server `ok: true` counts as a request: it silences the automatic
 * offer (lib/brief-offer.ts) and fires onSuccess. Errors stay retryable.
 */
interface BriefFormProps {
  /** Prefix for element ids, so two forms on one page don't collide. */
  idPrefix: string;
  placement: BriefPlacement;
  onSuccess?: () => void;
}

export function BriefForm({ idPrefix, placement, onSuccess }: BriefFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const inputId = `${idPrefix}-email`;
  const helpId = `${idPrefix}-help`;
  const errorId = `${idPrefix}-error`;

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
      const result = await requestSafetyBrief({ email, company });
      track("brief_offer", { action: "submit", placement, ok: result.ok });
      if (result.ok) {
        markBriefRequested();
        setSubmitted(result.message);
        onSuccess?.();
      } else {
        setError(result.message);
      }
    } catch {
      track("brief_offer", { action: "submit", placement, ok: false });
      setError("Something went wrong. Try again in a moment?");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-accent/20 bg-white p-8 text-center" role="status">
        <p className="font-serif text-2xl italic text-ink">Check your inbox.</p>
        <p className="mt-2 text-muted">
          {submitted} Screenshot the eight-checks page before your next store run.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      {/* Honeypot — hidden from humans, bots fill it. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 opacity-0"
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${errorId} ${helpId}` : helpId}
          className={cn(
            "w-full flex-1 rounded-full border border-border bg-white px-5 py-3.5",
            "text-ink placeholder:text-muted/60",
            "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          )}
        />
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "rounded-full bg-accent px-7 py-3.5 font-medium text-white",
            "transition-opacity hover:opacity-90 disabled:opacity-60"
          )}
        >
          {submitting ? "Sending..." : "Email me the free brief"}
        </button>
      </div>
      {error && (
        <p id={errorId} className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <p id={helpId} className="mt-3 text-sm text-muted">
        We&apos;ll email you the brief and add you to the PharmaGuide newsletter and beta list.
        Unsubscribe anytime.
      </p>
    </form>
  );
}

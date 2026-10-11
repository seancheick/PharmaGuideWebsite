import type { Metadata } from "next";
import { ChecklistForm } from "./ChecklistForm";

export const metadata: Metadata = {
  title: "Get the free Supplement Safety Brief | PharmaGuide",
  description:
    "The Supplement Safety Intelligence Brief: 12 pharmacist-reviewed sections on labels, doses, hidden ingredients, and interactions. Free.",
};

/**
 * /checklist — the lead-magnet landing page for the Instagram funnel.
 *
 * Reel says "comment MAGNESIUM" -> manual DM sends this URL -> visitor
 * enters email -> Resend delivers the brief PDF link and adds them to
 * the beta audience.
 *
 * Copy rules: no clinical claims on this page (the brief itself is the
 * Laurie-reviewed substance). Describe the brief, don't practice pharmacy.
 * No em dashes in copy.
 */

const BULLETS = [
  {
    title: "Read any label in 60 seconds",
    body: "The five lines that actually matter, and the marketing to ignore.",
  },
  {
    title: "Spot the traps",
    body: "Proprietary blends, hidden doses, and the seals worth trusting.",
  },
  {
    title: "Check your combinations",
    body: "Interactions people miss, upper limits that stack across bottles.",
  },
] as const;

export default function ChecklistPage() {
  return (
    <main className="bg-background text-ink">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center sm:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Free field guide</p>

        <h1 className="mt-4 font-serif text-4xl italic leading-tight sm:text-5xl">
          Know what you&apos;re actually taking.
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          The Supplement Safety Intelligence Brief: 12 pharmacist-reviewed sections on labels,
          doses, hidden ingredients, and interactions. Built on primary research, written for real
          life.
        </p>

        <ul className="mt-8 w-full space-y-3 text-left">
          {BULLETS.map((b) => (
            <li key={b.title} className="rounded-2xl border border-border bg-white px-5 py-4">
              <p className="font-medium">{b.title}</p>
              <p className="mt-1 text-sm text-muted">{b.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 w-full">
          <ChecklistForm />
        </div>

        <p className="mt-8 text-xs text-muted">
          Reviewed by Laurie Pham, PharmD. Educational only, not medical advice.
        </p>
      </div>
    </main>
  );
}

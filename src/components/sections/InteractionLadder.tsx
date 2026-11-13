"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Interaction Ladder — the five levels a finding can land on.
 *
 * Rebuilt 2026-11-13 from a tab strip + wide detail panel into an actual
 * ladder: five rungs, each one line (level, plain meaning, one example),
 * one rung open at a time for the reasoning. It opens on Caution with
 * calcium + levothyroxine, the finding the scan section above just showed.
 *
 * Every example is a current pipeline rule, re-read on 2026-11-13 from
 * PharmaGuide_Pipeline scripts/data/ingredient_interaction_rules.json. The
 * tier and the evidence word are the rule's own `severity` and
 * `evidence_level`; the text condenses its `mechanism` and `action`. When a
 * rule changes tier, change the example — an example under the wrong rung
 * is a wrong clinical claim (the previous set had drifted on two of five).
 *
 *   contraindicated  5_htp × antidepressants_ssri_snri      established
 *   avoid            st_johns_wort × doacs                  established
 *   caution          calcium × thyroid_medications          established
 *   monitor          coq10 × vitamin_k_antagonists          probable
 *   informational    l_theanine × antihypertensives         theoretical
 *
 * The evidence levels are deliberately not all "Established": the section
 * says we state it when evidence is incomplete, so two rungs show it.
 *
 * Each tier keeps its own shape (triangle / circle / diamond / ring /
 * square) so the level never depends on colour alone.
 */

type TierId = "contraindicated" | "avoid" | "caution" | "monitor" | "safe";
type Shape = "triangle" | "circle" | "diamond" | "ring" | "square";
/** The pipeline's `evidence_level` vocabulary. */
type EvidenceLevel = "Established" | "Probable" | "Moderate" | "Limited" | "Theoretical";

interface TierData {
  id: TierId;
  label: string;
  /** What this level means, in a few words. */
  meaning: string;
  pair: string;
  why: string;
  action: string;
  evidence: EvidenceLevel;
  basis: string;
  shape: Shape;
  textClass: string;
  barClass: string;
}

const TIERS: readonly TierData[] = [
  {
    id: "contraindicated",
    label: "Contraindicated",
    meaning: "Do not combine.",
    pair: "5-HTP + an SSRI antidepressant",
    why: "5-HTP is turned into serotonin, and SSRIs keep serotonin active for longer. Together they can raise serotonin activity enough to contribute to serotonin syndrome.",
    action:
      "Do not take them together, and do not stop or switch your antidepressant to use 5-HTP. Your prescriber plans any change.",
    evidence: "Established",
    basis: "Health Canada 5-HTP monograph",
    shape: "triangle",
    textClass: "text-severity-contraindicated",
    barClass: "bg-severity-contraindicated",
  },
  {
    id: "avoid",
    label: "Avoid",
    meaning: "Avoid unless your prescriber manages it.",
    pair: "St. John's wort + apixaban",
    why: "St. John's wort speeds up the pathways that clear apixaban and similar blood thinners, lowering drug levels and protection against stroke or clots.",
    action: "Avoid combining unless your prescriber explicitly manages it.",
    evidence: "Established",
    basis: "FDA drug labeling",
    shape: "circle",
    textClass: "text-severity-avoid",
    barClass: "bg-severity-avoid",
  },
  {
    id: "caution",
    label: "Caution",
    meaning: "Take with care. Timing, dose or context matters.",
    pair: "Calcium + levothyroxine",
    why: "Calcium binds levothyroxine in the gut and reduces how much is absorbed when the two are taken together.",
    action: "Separate doses by at least 4 hours. Take levothyroxine on an empty stomach.",
    evidence: "Established",
    basis: "Multiple controlled studies · FDA-labeled",
    shape: "diamond",
    textClass: "text-severity-caution",
    barClass: "bg-severity-caution",
  },
  {
    id: "monitor",
    label: "Monitor",
    meaning: "Keep your prescriber informed and watch for changes.",
    pair: "CoQ10 + warfarin",
    why: "The warfarin label lists CoQ10 among products that may reduce warfarin's effect. Clinical evidence is mixed.",
    action:
      "Tell your anticoagulation team before you start, stop or change CoQ10, so they can decide whether your INR needs extra checks.",
    evidence: "Probable",
    basis: "FDA drug labeling · mixed clinical studies",
    shape: "ring",
    textClass: "text-severity-monitor",
    barClass: "bg-severity-monitor",
  },
  {
    id: "safe",
    label: "Informational",
    meaning: "Good to know.",
    pair: "L-theanine + blood-pressure medicine",
    why: "L-theanine has blunted short-term rises in blood pressure in small studies. Those studies do not establish a harmful interaction with blood-pressure medicines.",
    action: "Mention L-theanine to your prescriber. Nothing else to do.",
    evidence: "Theoretical",
    basis: "Small human studies · animal data",
    shape: "square",
    textClass: "text-severity-safe",
    barClass: "bg-severity-safe",
  },
];

function TierShape({ shape, className }: { shape: Shape; className: string }) {
  const common = "h-[14px] w-[14px] shrink-0";
  switch (shape) {
    case "triangle":
      return (
        <svg viewBox="0 0 14 14" className={cn(common, className)} aria-hidden="true">
          <path d="M7 1 L13 13 L1 13 Z" fill="currentColor" />
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 14 14" className={cn(common, className)} aria-hidden="true">
          <circle cx="7" cy="7" r="6" fill="currentColor" />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 14 14" className={cn(common, className)} aria-hidden="true">
          <path d="M7 1 L13 7 L7 13 L1 7 Z" fill="currentColor" />
        </svg>
      );
    case "ring":
      return (
        <svg viewBox="0 0 14 14" className={cn(common, className)} aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "square":
      return (
        <svg viewBox="0 0 14 14" className={cn(common, className)} aria-hidden="true">
          <rect x="1.5" y="1.5" width="11" height="11" fill="currentColor" />
        </svg>
      );
  }
}

export function InteractionLadder() {
  const [openId, setOpenId] = useState<TierId>("caution");

  return (
    <section
      id="interaction-ladder"
      aria-labelledby="ladder-heading"
      className="section-y-sm relative bg-surface-subtle"
    >
      <div className="container mx-auto grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] lg:items-start lg:gap-14">
        <div className="lg:sticky lg:top-28">
          <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
            The ladder
          </p>
          <h2 id="ladder-heading" className="mt-3 text-balance text-display-sm text-ink lg:mt-4">
            Five levels. <span className="font-serif italic text-accent">One clear next step.</span>
          </h2>
          <p className="mt-3 max-w-[38ch] text-body leading-relaxed text-muted lg:mt-4">
            Every finding lands on one of five levels, with the reason, the evidence behind it and
            what to do.
          </p>
          <p className="mt-4 max-w-[38ch] font-serif text-body italic text-muted">
            When evidence is incomplete, we say so directly.
          </p>
          <p className="mt-5 font-mono text-overline font-medium uppercase tracking-[0.12em] text-subtle">
            <span className="lg:hidden">Tap a level to see an example ↓</span>
            <span className="hidden lg:inline">Click a level to see an example →</span>
          </p>
        </div>

        <ol className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {TIERS.map((tier, i) => {
            const open = tier.id === openId;
            return (
              <li key={tier.id} className={cn("relative", i > 0 && "border-t border-border")}>
                <span
                  aria-hidden="true"
                  className={cn(
                    "duration-base absolute inset-y-0 left-0 w-[3px] transition-opacity ease-smooth",
                    tier.barClass,
                    open ? "opacity-100" : "opacity-0"
                  )}
                />
                <h3>
                  <button
                    type="button"
                    id={`tier-${tier.id}`}
                    aria-expanded={open}
                    aria-controls={`tier-panel-${tier.id}`}
                    onClick={() => setOpenId(tier.id)}
                    className={cn(
                      "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-5 py-3.5 text-left transition-colors duration-fast ease-smooth focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:grid-cols-[auto_11.5rem_minmax(0,1fr)_auto] sm:px-6",
                      open ? "bg-surface-raised" : "hover:bg-surface-raised/60"
                    )}
                  >
                    <TierShape shape={tier.shape} className={tier.textClass} />
                    <span
                      className={cn(
                        "font-mono text-eyebrow font-medium uppercase tracking-[0.1em]",
                        tier.textClass
                      )}
                    >
                      {tier.label}
                    </span>
                    <span className="col-span-3 col-start-1 mt-1 text-body-sm leading-snug text-ink sm:col-span-1 sm:col-start-auto sm:mt-0">
                      {tier.meaning}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                      className={cn(
                        "duration-base col-start-3 row-start-1 text-subtle transition-transform ease-smooth sm:col-start-4",
                        open && "rotate-180"
                      )}
                    >
                      <path
                        d="M2.5 4.5L6 8l3.5-3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </h3>
                {/* Grid-rows 0fr → 1fr: the reasoning opens without a measured
                    height, and stays in the markup for crawlers and no-JS. */}
                <div
                  id={`tier-panel-${tier.id}`}
                  role="region"
                  aria-labelledby={`tier-${tier.id}`}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-slow ease-emphasized motion-reduce:transition-none",
                    open ? "grid-rows-[1fr] bg-surface-raised" : "grid-rows-[0fr]"
                  )}
                >
                  <div className={cn("overflow-hidden", !open && "invisible")}>
                    <div className="grid gap-x-8 gap-y-3 px-5 pb-5 pt-1 sm:px-6 md:grid-cols-[minmax(0,1fr)_11rem]">
                      <div>
                        <p className="font-serif text-h3 italic leading-snug text-ink">
                          {tier.pair}
                        </p>
                        <p className="mt-2 text-body-sm leading-relaxed text-muted">{tier.why}</p>
                        <p className="mt-2 text-body-sm leading-relaxed text-ink">
                          <span className="font-medium">What to do: </span>
                          {tier.action}
                        </p>
                      </div>
                      <div className="border-t border-border pt-3 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                        <p className="font-mono text-overline font-medium uppercase tracking-[0.12em] text-subtle">
                          Evidence
                        </p>
                        <p className="mt-1 font-serif text-[19px] italic leading-none text-accent-strong">
                          {tier.evidence}
                        </p>
                        <p className="mt-2 text-[12px] leading-snug text-muted">{tier.basis}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

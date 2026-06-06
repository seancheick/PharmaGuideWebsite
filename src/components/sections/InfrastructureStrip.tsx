"use client";

import { motion } from "framer-motion";
import { transitions } from "@/lib/tokens";

/**
 * Infrastructure Strip — quiet divider between Hero and Problem.
 *
 * Acts as a subtle "register change" rather than a full section. Three
 * platform claims, dot-separated on tablet+, stacked on mobile. Fade-in on
 * scroll into view (no movement) — matches the "Apple-like" pacing target.
 *
 * Visual:
 *   - Faint surface-subtle band (~30% opacity) so it reads as its own register
 *     without competing with the hero halo above or the Problem section below.
 *   - Thin top + bottom borders for definition.
 *   - Mono-cased eyebrow type, generously tracked, in muted color.
 */
export function InfrastructureStrip() {
  return (
    <section
      aria-label="Platform principles"
      className="relative border-y border-border/60 bg-surface-subtle/30"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={transitions.reveal}
        className="container mx-auto py-6 sm:py-7"
      >
        <p className="flex flex-col items-center gap-2 text-center font-mono text-eyebrow font-medium uppercase tracking-[var(--ls-eyebrow)] text-muted sm:flex-row sm:justify-center sm:gap-0">
          <span>Every claim traceable to source</span>
          <span aria-hidden="true" className="hidden text-border-strong sm:mx-4 sm:inline">
            ·
          </span>
          <span>Clinician-informed content</span>
          <span aria-hidden="true" className="hidden text-border-strong sm:mx-4 sm:inline">
            ·
          </span>
          <span>Health data never leaves your device</span>
        </p>
      </motion.div>
    </section>
  );
}

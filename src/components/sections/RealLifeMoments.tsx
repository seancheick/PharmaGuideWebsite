"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { fadeUpContainer, fadeUpItem } from "@/lib/tokens";
import { MOMENTS, type Moment, type SeverityTier } from "@/lib/moments";
import { cn } from "@/lib/utils";

/**
 * Real-Life Moments — Oura-style horizontal carousel.
 *
 * Each card is a 300×440 portrait scene with a full-bleed image, frosted
 * glass category pill, plus button (top-right, rotates 45° to close), and
 * a serif title at the bottom. Click anywhere on a compact card to open it
 * — the card expands inline (~880px wide) and reveals two insight panels
 * on the right: a member spotlight quote, and a PharmaGuide flag detail
 * with severity color, mechanism, and meta row.
 *
 * Controls: prev/next arrows, scroll progress bar, ESC to close.
 *
 * Image strategy: Unsplash placeholder URLs in V1. Swap to Cloudinary URLs
 * by editing src/lib/moments.ts. See `images.json` at repo root for the AI
 * generation prompts.
 */

const SEV_STYLES: Record<
  SeverityTier,
  { dot: string; text: string; chipBg: string }
> = {
  monitor: {
    dot: "bg-severity-monitor",
    text: "text-severity-monitor",
    chipBg: "bg-severity-monitor/15",
  },
  caution: {
    dot: "bg-severity-caution",
    text: "text-severity-caution",
    chipBg: "bg-severity-caution/15",
  },
  avoid: {
    dot: "bg-severity-avoid",
    text: "text-severity-avoid",
    chipBg: "bg-severity-avoid/15",
  },
  safe: {
    dot: "bg-severity-safe",
    text: "text-severity-safe",
    chipBg: "bg-severity-safe/15",
  },
  contraindicated: {
    dot: "bg-severity-contraindicated",
    text: "text-severity-contraindicated",
    chipBg: "bg-severity-contraindicated/15",
  },
};

export function RealLifeMoments() {
  const [openIdx, setOpenIdx] = useState<number>(-1);
  const [progress, setProgress] = useState({ width: 30, left: 0 });
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  const updateProgress = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    const pct = max > 0 ? rail.scrollLeft / max : 0;
    const w = Math.max(15, (rail.clientWidth / rail.scrollWidth) * 100);
    setProgress({ width: w, left: pct * (100 - w) });
  }, []);

  // Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openIdx >= 0) setOpenIdx(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx]);

  // When a card opens, scroll it gently into view
  useEffect(() => {
    if (openIdx < 0) return;
    const card = cardRefs.current[openIdx];
    const rail = railRef.current;
    if (!card || !rail) return;
    requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();
      if (rect.right > railRect.right - 24) {
        rail.scrollBy({
          left: rect.right - railRect.right + 40,
          behavior: "smooth",
        });
      } else if (rect.left < railRect.left + 24) {
        rail.scrollBy({
          left: rect.left - railRect.left - 40,
          behavior: "smooth",
        });
      }
      updateProgress();
    });
  }, [openIdx, updateProgress]);

  // Update progress on scroll/resize/mount
  useEffect(() => {
    updateProgress();
    const rail = railRef.current;
    if (!rail) return;
    rail.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      rail.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [updateProgress]);

  const scrollByPage = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    if (openIdx >= 0) setOpenIdx(-1);
    const step = Math.round(rail.clientWidth * 0.7);
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section
      id="real-life-moments"
      aria-labelledby="moments-heading"
      className="relative bg-surface-subtle py-section-y"
    >
      {/* Header */}
      <div className="container mx-auto">
        <motion.div
          variants={fadeUpContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="max-w-3xl"
        >
          <motion.p
            variants={fadeUpItem}
            className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
          >
            Built for real life
          </motion.p>

          <motion.h2
            id="moments-heading"
            variants={fadeUpItem}
            className="mt-5 text-balance text-display-lg text-ink"
          >
            The moments people don&apos;t realize
            <br />
            <span className="font-serif italic">they need this.</span>
          </motion.h2>

          <motion.p
            variants={fadeUpItem}
            className="mt-6 max-w-prose text-body-lg leading-relaxed text-muted"
          >
            PharmaGuide helps you catch risks, avoid conflicts, and make smarter
            decisions before you take your next dose.
          </motion.p>
        </motion.div>
      </div>

      {/* Carousel rail */}
      <div
        ref={railRef}
        role="list"
        aria-label="Real-life moments"
        className={cn(
          "mt-12 flex gap-4 overflow-x-auto overflow-y-hidden px-[max(20px,calc((100vw-var(--container-max))/2+24px))] pb-6 pt-2 sm:gap-5 md:mt-16",
          "snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {MOMENTS.map((moment, i) => (
          <MomentCard
            key={moment.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            moment={moment}
            isOpen={openIdx === i}
            onOpen={() => setOpenIdx(i)}
            onClose={() => setOpenIdx(-1)}
          />
        ))}
      </div>

      {/* Controls — prev/next + progress bar */}
      <div className="container mx-auto mt-6">
        <div className="flex items-center gap-4">
          {/* Progress track */}
          <div
            className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-border"
            aria-hidden="true"
          >
            <div
              className="absolute top-0 h-full rounded-full bg-foreground/60 transition-[left,width] duration-slow ease-smooth"
              style={{
                width: `${progress.width}%`,
                left: `${progress.left}%`,
              }}
            />
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              aria-label="Previous moments"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-xs transition-[background-color,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:bg-surface-raised hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 3l-5 5 5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              aria-label="Next moments"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-xs transition-[background-color,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:bg-surface-raised hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface CardProps {
  moment: Moment;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const MomentCard = ({
  ref,
  moment,
  isOpen,
  onOpen,
  onClose,
}: CardProps & { ref: React.Ref<HTMLElement> }) => {
  const sev = SEV_STYLES[moment.flag.severity];

  const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
    if (isOpen) {
      // Only the plus/close button closes the open card
      const target = e.target as HTMLElement;
      if (target.closest("[data-close]")) {
        onClose();
      }
      return;
    }
    onOpen();
  };

  return (
    <article
      ref={ref}
      role="listitem"
      onClick={handleClick}
      data-open={isOpen}
      className={cn(
        "group relative shrink-0 cursor-pointer snap-start overflow-hidden rounded-3xl bg-ink shadow-lg",
        // Compact widths: 78vw mobile → 300/320 tablet+
        "h-[380px] w-[78vw] sm:h-[440px] sm:w-[320px]",
        "transition-[width,transform,box-shadow] duration-[700ms] ease-[cubic-bezier(0.32,0.72,0.24,1)]",
        // Open widths: 90vw mobile, 92vw < 980, 880px desktop
        isOpen
          ? "w-[90vw] cursor-default shadow-2xl sm:w-[92vw] md:w-[min(880px,88vw)]"
          : "hover:-translate-y-1 hover:shadow-xl"
      )}
    >
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={moment.image}
          alt={moment.imageAlt}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 980px) 92vw, 880px"
          priority={moment.id === "chronic"}
          className={cn(
            "object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]",
            isOpen ? "scale-[1.12]" : "scale-100 group-hover:scale-105"
          )}
        />
        {/* Dark gradient overlay (bottom-heavy, like Oura) */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 32%, transparent 50%, rgba(8,12,14,0.55) 82%, rgba(8,12,14,0.85) 100%)",
          }}
        />
      </div>

      {/* Frosted-glass category pill */}
      <span className="pointer-events-none absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-pill border border-white/25 bg-white/15 px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white shadow-sm backdrop-blur-md">
        <span className="block h-1 w-1 rounded-full bg-white/70" />
        {moment.category}
      </span>

      {/* Plus / close button */}
      <button
        type="button"
        data-close
        aria-label={isOpen ? "Close moment" : "Open moment"}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) onClose();
          else onOpen();
        }}
        className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-md transition-transform duration-[500ms] ease-[cubic-bezier(0.32,0.72,0.24,1)] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className={cn(
            "transition-transform duration-[500ms] ease-[cubic-bezier(0.32,0.72,0.24,1)]",
            isOpen && "rotate-45"
          )}
        >
          <path
            d="M8 3v10M3 8h10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Title block — bottom-left compact, slides up + grows on open */}
      <div
        className={cn(
          "absolute z-10 transition-all duration-[700ms] ease-[cubic-bezier(0.32,0.72,0.24,1)]",
          isOpen
            ? "bottom-11 left-11 right-auto max-w-[26ch]"
            : "bottom-6 left-6 right-6 max-w-[16ch]"
        )}
      >
        <h3
          className={cn(
            "text-balance font-serif font-normal leading-[1.18] tracking-[-0.014em] text-white transition-all duration-[700ms] ease-[cubic-bezier(0.32,0.72,0.24,1)]",
            isOpen ? "text-display-sm" : "text-h3"
          )}
        >
          {moment.title}
        </h3>

        {/* Sub-copy + Learn CTA — only visible when open */}
        <div
          className={cn(
            "mt-4 max-w-[44ch] transition-all delay-200 duration-[540ms] ease-[cubic-bezier(0.32,0.72,0.24,1)]",
            isOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0"
          )}
        >
          <p className="text-body-sm leading-relaxed text-white/85">
            {moment.description}
          </p>
          <a
            href="#"
            className="mt-5 inline-flex items-center gap-2 rounded-pill bg-white/95 px-5 py-2.5 text-body-sm font-medium text-ink shadow-md transition-[background-color,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {moment.learnMore}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Insights aside — quote card + flag card, revealed when open.
          Hidden below md (cards are too narrow to fit alongside the title). */}
      <aside
        aria-hidden={!isOpen}
        className={cn(
          "absolute right-7 top-1/2 z-10 hidden w-[300px] -translate-y-1/2 flex-col gap-3 transition-all duration-[540ms] ease-[cubic-bezier(0.32,0.72,0.24,1)] md:flex lg:w-[320px]",
          isOpen
            ? "translate-x-0 opacity-100 delay-300"
            : "pointer-events-none translate-x-6 opacity-0"
        )}
      >
        {/* Member quote */}
        <div className="rounded-2xl border border-white/15 bg-ink/55 p-4 text-white shadow-md backdrop-blur-md sm:p-5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="block h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/20"
              style={{
                backgroundImage: `url(${moment.member.avatar})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium leading-tight text-white">
                {moment.member.name}
                <span className="ml-2 font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-white/55">
                  {moment.member.role}
                </span>
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-white/80">
                “{moment.quote}”
              </p>
            </div>
          </div>
        </div>

        {/* PharmaGuide flag card */}
        <div className="rounded-2xl border border-white/15 bg-ink/55 p-4 text-white shadow-md backdrop-blur-md sm:p-5">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn("block h-1.5 w-1.5 rounded-full", sev.dot)}
            />
            <span
              className={cn(
                "font-mono text-[9.5px] font-medium uppercase tracking-[0.12em]",
                sev.text
              )}
            >
              PharmaGuide flag · {moment.flag.severityLabel}
            </span>
          </div>
          <h4 className="mt-2 font-serif text-[18px] italic leading-tight text-white">
            {moment.flag.name}
          </h4>
          <p className="mt-2 text-[12px] leading-relaxed text-white/75">
            {moment.flag.description}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
            <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-white/55">
              {moment.flag.metaLeft}
            </span>
            <span className="font-mono text-[11px] font-semibold tabular-nums text-white">
              {moment.flag.metaRight}
            </span>
          </div>
        </div>
      </aside>
    </article>
  );
};
MomentCard.displayName = "MomentCard";

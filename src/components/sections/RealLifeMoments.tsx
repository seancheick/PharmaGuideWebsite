"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { fadeUpContainer, fadeUpItem } from "@/lib/tokens";
import { MOMENTS, type Moment, type SeverityTier } from "@/lib/moments";
import { cn } from "@/lib/utils";

/**
 * Real-Life Moments — Oura-style horizontal carousel.
 *
 * Each card is a portrait scene with a full-bleed image, frosted glass
 * category pill, and a short serif title (with italic emphasis on the
 * punchline phrase) at the bottom-left in white. A "+" button at the
 * top-right opens the card; on open the card extends into a wider
 * landscape format and the title TRANSLATES UP — no font-size change
 * mid-animation, so it stays readable. Description, Learn-More, and
 * the right-side insights aside (member quote + PharmaGuide flag) fade
 * in with a small delay after the title settles.
 *
 * The plus rotates 45° to ×; only that button closes the open card.
 *
 * Mobile: open card extends to ~90vw, insights aside hidden (no room).
 * Desktop: open card → 880px wide, insights aside visible at right.
 */

const SEV_STYLES: Record<
  SeverityTier,
  { dot: string; text: string }
> = {
  monitor: { dot: "bg-severity-monitor", text: "text-severity-monitor" },
  caution: { dot: "bg-severity-caution", text: "text-severity-caution" },
  avoid: { dot: "bg-severity-avoid", text: "text-severity-avoid" },
  safe: { dot: "bg-severity-safe", text: "text-severity-safe" },
  contraindicated: {
    dot: "bg-severity-contraindicated",
    text: "text-severity-contraindicated",
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

  // Scroll opened card into view
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

  // Progress bar tracking
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
            <span className="font-serif italic text-accent">they need this.</span>
          </motion.h2>

          <motion.p
            variants={fadeUpItem}
            className="mt-6 max-w-prose text-body-lg leading-relaxed text-muted"
          >
            Most people never check the combination.
          </motion.p>
        </motion.div>
      </div>

      {/* Carousel rail — margin-left positions the first card at the
          container's content edge. margin (unlike padding) is NOT part
          of the scrollable overflow area, so it can't be scrolled past.
          Right side: small padding for last-card peek. */}
      <div
        ref={railRef}
        role="list"
        aria-label="Real-life moments"
        style={{ marginLeft: "var(--carousel-inset)" }}
        className={cn(
          "mt-12 flex gap-3 overflow-x-auto overflow-y-hidden pr-5 pb-6 pt-2 sm:gap-4 sm:pr-8 md:mt-16 md:pr-10",
          "[--carousel-inset:1.25rem] sm:[--carousel-inset:1.5rem] lg:[--carousel-inset:calc((100vw_-_1200px)/2_+_2rem)]",
          "snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        <LayoutGroup>
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
        </LayoutGroup>
      </div>

      {/* Controls */}
      <div className="container mx-auto mt-6">
        <div className="flex items-center gap-4">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              aria-label="Previous moments"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-xs transition-[background-color,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:bg-surface-raised hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
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
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-ink text-white shadow-xs transition-[background-color,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
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

  // Click anywhere on the compact card opens it.
  // On the open card, only the +/× button closes it (so users can read
  // the description and click the Learn-more link without collapsing).
  const handleCardClick: React.MouseEventHandler<HTMLElement> = () => {
    if (!isOpen) onOpen();
  };

  return (
    <motion.article
      ref={ref}
      layout
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0.24, 1] }}
      role="listitem"
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isOpen) {
          e.preventDefault();
          onOpen();
        }
      }}
      tabIndex={0}
      data-open={isOpen}
      className={cn(
        "group relative shrink-0 cursor-pointer snap-start overflow-hidden rounded-3xl bg-ink shadow-md",
        // Closed widths/heights. Mobile pulled in from 80vw → 76vw so the
        // next card peeks more clearly (carousel affordance).
        "h-[480px] w-[76vw] sm:h-[520px] sm:w-[360px] md:h-[540px] md:w-[360px] lg:h-[560px] lg:w-[380px] xl:h-[580px] xl:w-[400px]",
        "transition-[transform,box-shadow] duration-[700ms] ease-[cubic-bezier(0.32,0.72,0.24,1)]",
        // Open widths/heights — bumped on mobile and sm so the expand is
        // actually felt. Mobile: 76vw→94vw + 480px→620px. sm: 360px→
        // 600px + 520px→640px. Desktop sizes unchanged (already worked).
        // Framer Motion layout prop handles the size transition via FLIP.
        isOpen
          ? "h-[620px] w-[94vw] cursor-default shadow-2xl sm:h-[640px] sm:w-[600px] md:h-[540px] md:w-[700px] lg:h-[560px] lg:w-[860px] xl:h-[580px] xl:w-[920px]"
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
            isOpen ? "scale-[1.08]" : "scale-100 group-hover:scale-105"
          )}
        />
        {/* Gradient: dark from 50% downward — guarantees title legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0) 50%, rgba(8,12,14,0.62) 78%, rgba(8,12,14,0.92) 100%)",
          }}
        />
      </div>

      {/* Frosted-glass category pill — top-left */}
      <span className="pointer-events-none absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-pill border border-white/25 bg-white/15 px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white shadow-sm backdrop-blur-md">
        <span className="block h-1 w-1 rounded-full bg-white/70" />
        {moment.category}
      </span>

      {/* Plus / close button — top-right */}
      <button
        type="button"
        aria-label={isOpen ? "Close moment" : "Open moment"}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) onClose();
          else onOpen();
        }}
        className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-ink shadow-md transition-transform duration-[500ms] ease-[cubic-bezier(0.32,0.72,0.24,1)] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
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

      {/* Bottom-left content stack — anchored at bottom, grows UPWARD when open.
          The container is positioned at bottom-7 with flex-column. Description +
          Learn-more (when present) appear FIRST in DOM, so they sit ABOVE the
          title in the flex column. Title (last in DOM) is the bottom-most
          element and stays exactly where the closed-state title was — no
          translation, no size change. */}
      <div className="absolute bottom-7 left-7 right-7 z-10 flex flex-col gap-5 sm:bottom-8 sm:left-9 sm:right-9">
        {/* Description + Learn-more — appears above title when open.
            Wide enough to show 2-3 lines but capped so it doesn't bleed past
            the insights aside on desktop. */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{
                duration: 0.42,
                ease: [0.32, 0.72, 0.24, 1],
                delay: 0.18,
              }}
              className="flex max-w-[36ch] flex-col gap-5"
            >
              <p className="text-body-sm leading-relaxed text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                {moment.description}
              </p>
              <a
                href="#waitlist"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex w-fit items-center gap-2 rounded-pill bg-white/95 px-5 py-2.5 text-body-sm font-medium text-ink shadow-md transition-[background-color,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:bg-white"
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title — anchored bottom-left. On mobile open, the card's
            extra room lets the title widen to 18ch instead of 15ch.
            On sm+ open, widens further to 20ch as before. Font size
            stays the same so layout doesn't jiggle mid-animation.   */}
        <h3
          className={cn(
            "font-serif font-normal leading-[1.12] tracking-[-0.014em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]",
            "text-[clamp(1.5rem,2.2vw,2rem)]",
            isOpen ? "max-w-[18ch] sm:max-w-[20ch]" : "max-w-[15ch]"
          )}
        >
          {moment.title.lead}{" "}
          <span className="italic">{moment.title.em}</span>
        </h3>
      </div>

      {/* Insights aside — slides in from right when open. md+ only.
          Two glass cards: member quote + PharmaGuide flag. */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="insights"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{
              duration: 0.5,
              ease: [0.32, 0.72, 0.24, 1],
              delay: 0.4,
            }}
            className="absolute right-7 top-7 z-10 hidden w-[260px] flex-col gap-3 md:flex lg:w-[280px]"
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

            {/* PharmaGuide flag */}
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
          </motion.aside>
        )}
      </AnimatePresence>
    </motion.article>
  );
};
MomentCard.displayName = "MomentCard";

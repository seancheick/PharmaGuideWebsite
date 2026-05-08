"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * BackToTop — floating button anchored bottom-right.
 *
 * Appears after the user has scrolled past 400px, smooth-scrolls back
 * to top on click. Respects prefers-reduced-motion (instant scroll).
 *
 * Mounted inside Footer so it lives at the bottom of the DOM. Uses
 * fixed positioning so it's always visible while scrolled.
 *
 * Throttle pattern: requestAnimationFrame guard so the scroll handler
 * never fires more than once per frame regardless of scroll velocity.
 *
 * Accessibility:
 *   • aria-label + title for screen readers and tooltip
 *   • Hidden from a11y tree when not visible (aria-hidden="true")
 *   • Keyboard accessible — focus ring matches the rest of the site
 */

const SCROLL_THRESHOLD = 400;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      ticking = false;
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    handleScroll(); // initial
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-accent-strong/95 text-background shadow-lg backdrop-blur-md transition-[opacity,transform,background-color] duration-300 ease-smooth hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}

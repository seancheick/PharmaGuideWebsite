"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { nav, site } from "@/lib/site";
import { transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * Floating glass pill header.
 *
 * Behavior:
 *  • At y=0 — transparent over content, no shadow
 *  • After scrolling > 24px — glass background + shadow appears
 *  • Scrolling DOWN past 200px — slides up out of view
 *  • Scrolling UP at any time — slides back in
 *  • prefers-reduced-motion — no slide, just appears/disappears instantly
 *  • Mobile (< md) — hamburger replaces nav + CTA, opens full-screen overlay
 *
 * All values come from design tokens. No hardcoded numbers in motion configs.
 */
export function Header() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuWasOpen = useRef(false);
  const reducedMotion = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 24);
    if (latest > prev && latest > 200) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  // Body scroll lock + Esc handler when mobile menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Return focus to hamburger when menu closes (a11y)
  // Guarded so it doesn't steal focus on initial mount.
  useEffect(() => {
    if (menuOpen) {
      menuWasOpen.current = true;
    } else if (menuWasOpen.current) {
      hamburgerRef.current?.focus();
    }
  }, [menuOpen]);

  const slideY = reducedMotion ? 0 : hidden ? -120 : 0;

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: slideY }}
        transition={reducedMotion ? { duration: 0 } : transitions.hover}
        className="fixed inset-x-0 top-3 z-[300] flex justify-center px-4 sm:top-4"
      >
        <div
          className={cn(
            // Bumped from max-w-3xl (768) → max-w-4xl (896) and py-2 → py-2.5
            // because 5 nav items at gap-7 was cramped. Pill still feels
            // tight and floating; just less squeezed.
            "flex w-full max-w-4xl items-center justify-between gap-6 rounded-pill border px-3 py-2.5 transition-[background-color,box-shadow,backdrop-filter,border-color] duration-slow ease-smooth sm:px-4",
            scrolled
              ? "glass border-border/70 shadow-md"
              : "border-transparent bg-background/30 backdrop-blur-xs"
          )}
        >
          {/* Wordmark */}
          <Link
            href="/"
            aria-label={`${site.name} home`}
            className="flex items-center gap-2 font-sans text-body font-medium tracking-[-0.012em] text-ink transition-colors duration-fast ease-smooth hover:text-accent"
          >
            <Logo size="sm" priority />
            {site.name}
          </Link>

          {/* Desktop nav — gap-8 between items reads cleaner with 5 items
              than the previous gap-7. Pairs with the wider max-w-4xl pill. */}
          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-body-sm text-muted transition-colors duration-fast ease-smooth hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile hamburger */}
          <div className="flex items-center gap-2">
            <Link
              href="/#waitlist"
              className={cn(
                "hidden items-center gap-1.5 rounded-pill bg-accent px-4 py-2 text-body-sm font-medium text-white shadow-xs",
                "transition-[background-color,box-shadow,transform] duration-fast ease-smooth",
                "hover:bg-accent-strong hover:shadow-glow",
                "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
                "md:inline-flex"
              )}
            >
              Join the beta
              <span aria-hidden="true" className="translate-y-[-0.5px]">→</span>
            </Link>

            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="rounded-pill p-2.5 text-ink transition-colors duration-fast ease-smooth hover:bg-surface-subtle md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 6h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.reveal}
            className="fixed inset-0 z-[400] bg-background/95 backdrop-blur-xl md:hidden"
            onClick={(e) => {
              // Close when clicking the backdrop (not the inner content)
              if (e.target === e.currentTarget) setMenuOpen(false);
            }}
          >
            <div className="flex h-16 items-center justify-end px-5">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-pill p-2 text-ink transition-colors duration-fast ease-smooth hover:bg-surface-subtle"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobile main" className="flex flex-col gap-5 px-7 pt-8">
              {nav.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    ...transitions.reveal,
                    delay: 0.06 + i * 0.07,
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block font-serif text-display-sm italic text-ink"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  ...transitions.reveal,
                  delay: 0.06 + nav.length * 0.07,
                }}
                className="pt-8"
              >
                <Link
                  href="/#waitlist"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-pill bg-accent px-6 py-3 text-body font-medium text-white shadow-sm"
                >
                  Join the beta
                  <span aria-hidden="true">→</span>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

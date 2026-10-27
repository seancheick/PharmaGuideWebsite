"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BriefForm } from "./BriefForm";
import { track } from "@/lib/analytics";
import {
  autoOfferAllowed,
  markBriefDismissed,
  markBriefOfferSeen,
  markBriefSubscribed,
} from "@/lib/brief-offer";

/**
 * Automatic Safety Brief offer on blog posts.
 *
 * Opens once, for engaged readers only: the page has been visible for
 * VISIBLE_SECONDS (background-tab time doesn't count) AND the reader has
 * scrolled the article body's midpoint into view. These are starting
 * product settings, not SEO thresholds.
 *
 *   • Desktop: a modal <dialog>. Focus goes to the heading and returns to
 *     where it was on close, without scrolling the page.
 *   • Mobile: a small non-modal banner first, so the article stays usable.
 *     Tapping it opens the same form as a bottom sheet.
 *
 * Before opening it re-checks that the reader isn't chatting, in another
 * dialog or typing. Closing it is a dismissal (30 quiet days); leaving the
 * page is not. Mounted per post (keyed by slug) by app/blog/[slug]/page.tsx.
 * The end-of-article BriefInline is always there regardless.
 */

const VISIBLE_SECONDS = 45;
const MOBILE_QUERY = "(max-width: 767px)";

type Mode = "idle" | "banner" | "dialog" | "sheet";

const BENEFITS = [
  "Read supplement labels and spot hidden doses.",
  "Understand how doses add up and which medication combinations deserve a closer look.",
  "Get an eight-check shopping checklist and a printable supplement-and-medication worksheet.",
] as const;

function readerIsBusy(): boolean {
  const html = document.documentElement;
  if ("chatOpen" in html.dataset) return true;
  if (document.querySelector("dialog[open], [aria-modal='true']")) return true;
  const active = document.activeElement;
  return (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLSelectElement ||
    (active instanceof HTMLElement && active.isContentEditable)
  );
}

export function BriefOffer({ articleId }: { articleId: string }) {
  const [mode, setMode] = useState<Mode>("idle");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const userClosingRef = useRef(false);
  const requestedRef = useRef(false);

  // ─── Trigger: visible time AND article midpoint ────────────────
  useEffect(() => {
    if (!autoOfferAllowed()) return;
    const article = document.getElementById(articleId);
    if (!article) return;

    let seconds = 0;
    let reachedMidpoint = false;

    const checkMidpoint = () => {
      const rect = article.getBoundingClientRect();
      if (rect.top + rect.height / 2 <= window.innerHeight) reachedMidpoint = true;
    };

    // Scroll events catch a fast scroll-through; the per-second check
    // catches a restored scroll position, which fires no scroll event.
    const tick = window.setInterval(() => {
      if (document.visibilityState === "visible") seconds += 1;
      if (!reachedMidpoint) checkMidpoint();
      if (seconds < VISIBLE_SECONDS || !reachedMidpoint) return;
      if (readerIsBusy()) return; // try again next second
      window.clearInterval(tick);
      window.removeEventListener("scroll", checkMidpoint);
      if (!autoOfferAllowed()) return; // a form elsewhere may have succeeded meanwhile
      markBriefOfferSeen();
      if (window.matchMedia(MOBILE_QUERY).matches) {
        setMode("banner");
        track("brief_offer", { action: "banner_shown", placement: "blog_banner" });
      } else {
        setMode("dialog");
        track("brief_offer", { action: "shown", placement: "blog_dialog" });
      }
    }, 1000);

    checkMidpoint();
    window.addEventListener("scroll", checkMidpoint, { passive: true });
    return () => {
      window.clearInterval(tick);
      window.removeEventListener("scroll", checkMidpoint);
    };
  }, [articleId]);

  // ─── Launcher steps aside while anything is up ─────────────────
  useEffect(() => {
    if (mode === "idle") return;
    document.documentElement.dataset.briefOffer = mode;
    return () => {
      delete document.documentElement.dataset.briefOffer;
    };
  }, [mode]);

  // ─── Open the modal and manage focus ───────────────────────────
  useEffect(() => {
    if (mode !== "dialog" && mode !== "sheet") return;
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    const active = document.activeElement;
    returnFocusRef.current =
      active instanceof HTMLElement && active !== document.body ? active : null;
    dialog.showModal();
    // Heading, not the input: no keyboard jumping up on phones.
    headingRef.current?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [mode]);

  const dismiss = (placement: "blog_dialog" | "blog_banner") => {
    if (!requestedRef.current) {
      markBriefDismissed();
      track("brief_offer", { action: "dismissed", placement });
    }
    setMode("idle");
  };

  const handleClose = () => {
    // Fires for the close button, Esc and our own cleanup. Only the first
    // two are the reader saying no.
    const placement = mode === "sheet" ? "blog_banner" : "blog_dialog";
    returnFocusRef.current?.focus({ preventScroll: true });
    returnFocusRef.current = null;
    if (userClosingRef.current) {
      userClosingRef.current = false;
      dismiss(placement);
    } else {
      setMode("idle");
    }
  };

  const closeByUser = () => {
    userClosingRef.current = true;
    dialogRef.current?.close();
  };

  const openSheet = () => {
    track("brief_offer", { action: "form_opened", placement: "blog_banner" });
    track("brief_offer", { action: "shown", placement: "blog_banner" });
    setMode("sheet");
  };

  if (mode === "idle") return null;

  if (mode === "banner") {
    return (
      <aside
        aria-label="Free Supplement Safety Brief"
        className="fixed inset-x-4 bottom-4 z-[240] flex items-center gap-3 rounded-2xl border border-border bg-surface/95 p-3 pl-4 shadow-xl backdrop-blur-md"
      >
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-medium text-ink">
            Know what you&apos;re actually taking.
          </p>
          <p className="text-[13px] leading-snug text-muted">
            Get the free 19-page Supplement Safety Brief.
          </p>
        </div>
        <button
          type="button"
          onClick={openSheet}
          className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-body-sm font-medium text-white"
        >
          Get the brief
        </button>
        <button
          type="button"
          onClick={() => dismiss("blog_banner")}
          aria-label="Dismiss the brief offer"
          className="shrink-0 rounded-full p-2 text-muted hover:text-ink"
        >
          <IconClose />
        </button>
      </aside>
    );
  }

  const placement = mode === "sheet" ? "blog_banner" : "blog_dialog";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="brief-offer-heading"
      onCancel={() => {
        userClosingRef.current = true; // Esc
      }}
      onClose={handleClose}
      className="m-auto max-h-[92dvh] w-[min(100%-2rem,52rem)] overflow-y-auto rounded-3xl border border-border bg-background p-0 text-ink shadow-xl backdrop:bg-ink/45 backdrop:backdrop-blur-[2px] max-md:mb-0 max-md:w-full max-md:max-w-none max-md:rounded-b-none"
    >
      <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-[13rem_1fr] md:p-10">
        <button
          type="button"
          onClick={closeByUser}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-2 text-muted hover:text-ink md:right-4 md:top-4"
        >
          <IconClose />
        </button>

        <Image
          src="/images/brief-cover.webp"
          alt="Cover of the PharmaGuide Supplement Safety Brief"
          width={640}
          height={829}
          sizes="13rem"
          className="hidden h-auto w-full rounded-lg shadow-lg md:block"
        />

        <div>
          <p className="pr-8 font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-accent">
            Free 19-page guide · Clinician-reviewed
          </p>
          <h2
            id="brief-offer-heading"
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 font-serif text-3xl italic leading-tight outline-none sm:text-4xl"
          >
            Know what you&apos;re actually taking.
          </h2>
          <p className="mt-3 text-muted">
            Get the PharmaGuide Supplement Safety Brief, a practical guide to labels, doses, and
            common interactions.
          </p>
          <ul className="mt-5 space-y-2.5 text-body-sm">
            {BENEFITS.map((b) => (
              <li key={b} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-0.5 text-accent">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <BriefForm
              idPrefix="brief-offer"
              placement={placement}
              onSuccess={() => {
                requestedRef.current = true;
              }}
            />
            <button
              type="button"
              onClick={() => {
                markBriefSubscribed();
                requestedRef.current = true; // not a dismissal
                track("brief_offer", { action: "already_subscribed", placement });
                dialogRef.current?.close();
              }}
              className="mt-3 text-body-sm text-muted underline underline-offset-[3px] hover:text-ink"
            >
              Already subscribed? Don&apos;t show this again
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

function IconClose() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M4 4l10 10M14 4L4 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * BlogShare — compact horizontal share rail under the post byline.
 *
 * Five actions: X (Twitter), LinkedIn, Facebook, Email, Copy link.
 * Each opens the appropriate share intent in a new tab, except Copy
 * Link which copies the canonical URL and the chain icon swaps to a
 * checkmark for ~2s.
 *
 * Visual contract — sits in the hero just under the meta strip
 * (author / reviewer / date / read time). Compact 36px circles, label
 * + icons on a single line at md+, wraps cleanly on mobile.
 *
 * Pass the FULL canonical URL (including origin) so social platforms
 * preview correctly. Title + description are used for X's `text` and
 * Email's `subject` / `body`.
 */

interface BlogShareProps {
  url: string;
  title: string;
  description: string;
}

export function BlogShare({ url, title, description }: BlogShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const emailBody = encodeURIComponent(
    `${description}\n\nRead the full article:\n${url}`
  );

  // X still serves the twitter.com/intent endpoints for share intents.
  const xHref = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const mailHref = `mailto:?subject=${encodedTitle}&body=${emailBody}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Older browsers / blocked clipboard — fallback isn't worth the
      // complexity here; the four external share intents still work.
    }
  };

  return (
    <div
      aria-labelledby="blog-share-heading"
      className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2"
    >
      <p
        id="blog-share-heading"
        className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-subtle"
      >
        Share
      </p>

      <ul className="flex items-center gap-1.5">
        <li>
          <ShareButton
            href={xHref}
            label="Share on X"
            icon={<IconX />}
          />
        </li>
        <li>
          <ShareButton
            href={liHref}
            label="Share on LinkedIn"
            icon={<IconLinkedIn />}
          />
        </li>
        <li>
          <ShareButton
            href={fbHref}
            label="Share on Facebook"
            icon={<IconFacebook />}
          />
        </li>
        <li>
          <ShareButton
            href={mailHref}
            label="Share via email"
            icon={<IconMail />}
            // Email opens in the same tab so the OS mail handler picks
            // it up cleanly — some clients ignore target="_blank".
            sameTab
          />
        </li>
        <li>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Link copied" : "Copy link to clipboard"}
            aria-live="polite"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition-[background-color,color,transform,border-color] duration-fast ease-smooth focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
              copied
                ? "border-severity-safe bg-severity-safe/15 text-severity-safe"
                : "border-border bg-surface text-muted hover:-translate-y-0.5 hover:border-border-strong hover:text-ink"
            )}
          >
            {copied ? <IconCheck /> : <IconLink />}
          </button>
        </li>
      </ul>
    </div>
  );
}

// ─── ShareButton ──────────────────────────────────────────────────────
// Common chrome for the 4 external share links. Same dimensions and
// hover treatment as the Copy button (visual symmetry).

function ShareButton({
  href,
  label,
  icon,
  sameTab = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  sameTab?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      {...(sameTab
        ? {}
        : { target: "_blank", rel: "noopener noreferrer" })}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-[background-color,color,transform,border-color] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
    >
      {icon}
    </a>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────
// Inline 14px SVGs sized to match the 36px circle. X + LinkedIn +
// Facebook use brand glyphs; mail uses the same envelope as the
// footer; link uses the chain glyph (becomes check on copy success).

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const IconFacebook = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

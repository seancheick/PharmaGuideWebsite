"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { track } from "@/lib/analytics";

const WAITLIST_ID = "waitlist";
const WAITLIST_HASH = `#${WAITLIST_ID}`;

type WaitlistLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  children: ReactNode;
  href?: string;
  onNavigate?: () => void;
  stopPropagation?: boolean;
};

export function WaitlistLink({
  children,
  href = `/${WAITLIST_HASH}`,
  onNavigate,
  stopPropagation = false,
  ...props
}: WaitlistLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }

    // Where the click came from, read from the page rather than passed in,
    // so every waitlist button on the site reports without call-site props.
    const from = event.currentTarget.closest("header")
      ? "header"
      : (event.currentTarget.closest("section[id], [role='dialog'][id]")?.id ??
        window.location.pathname);
    track("waitlist_cta", { from });

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    const targetUrl = new URL(href, window.location.href);
    const isSamePageWaitlist =
      targetUrl.origin === window.location.origin &&
      targetUrl.pathname === window.location.pathname &&
      targetUrl.hash === WAITLIST_HASH &&
      document.getElementById(WAITLIST_ID);

    if (!isSamePageWaitlist) {
      onNavigate?.();
      return;
    }

    event.preventDefault();
    onNavigate?.();

    const nextUrl = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
    if (
      typeof window.history?.pushState === "function" &&
      nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`
    ) {
      window.history.pushState(null, "", nextUrl);
    }

    window.setTimeout(() => {
      const target = document.getElementById(WAITLIST_ID);
      if (!target) return;

      const reduceMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
      target.focus({ preventScroll: true });
    }, 0);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

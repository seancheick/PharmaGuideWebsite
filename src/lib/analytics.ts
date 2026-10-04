import clarity from "@microsoft/clarity";
import { site } from "./site";

/**
 * Product analytics events — the one place the site names an event.
 *
 * Each event answers a question about the homepage that page views can't:
 *   hero_story          — did the visitor watch the phone loop through to
 *                         story 2 (the accumulation finding)? `story` is the
 *                         id from components/hero/stories.ts.
 *   waitlist_cta        — which button sent them to the signup form?
 *                         `from` is the section the click came from.
 *   waitlist_submit     — did the signup go through? `ok` true/false.
 *
 * Events go to Microsoft Clarity (named events filter its session
 * recordings, so you can watch exactly the visits that reached story 2 or
 * pressed a CTA) and to GA4 when gtag has loaded. Never pass personal data:
 * no emails, no free text — only the fixed values documented above.
 *
 * analyticsEnabled() is the one gate for Clarity, GA4 and these events.
 * Visits are counted only when they are real visits:
 *   • on the production host — not localhost, not *.vercel.app previews;
 *   • not under browser automation (navigator.webdriver) — a headless
 *     browser loaded the homepage at ~01:20–02:20 UTC every night in
 *     Sept 2026, inflating Clarity's LCP and session counts;
 *   • not from a team device. Open https://pharmaguide.io/?internal=1
 *     once on each device to stop counting it; ?internal=0 undoes it.
 */

const INTERNAL_KEY = "pg_internal";
let enabled: boolean | undefined;

export function analyticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (enabled !== undefined) return enabled;
  enabled =
    window.location.hostname === new URL(site.url).hostname &&
    !navigator.webdriver &&
    !isInternalDevice();
  return enabled;
}

function isInternalDevice(): boolean {
  try {
    const flag = new URLSearchParams(window.location.search).get("internal");
    if (flag === "1") window.localStorage.setItem(INTERNAL_KEY, "1");
    if (flag === "0") window.localStorage.removeItem(INTERNAL_KEY);
    return window.localStorage.getItem(INTERNAL_KEY) === "1";
  } catch {
    return false; // storage blocked: count the visit
  }
}

type Events = {
  hero_story: { story: string };
  waitlist_cta: { from: string };
  waitlist_submit: { ok: boolean };
};

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params: Record<string, unknown>) => void;
  }
}

export function track<E extends keyof Events>(name: E, params: Events[E]): void {
  if (!analyticsEnabled()) return;
  try {
    // Clarity takes a bare event name; the value rides along as a tag.
    const [key, value] = Object.entries(params)[0] ?? [];
    clarity.event(value === undefined ? name : `${name}:${String(value)}`);
    if (key !== undefined) clarity.setTag(name, String(value));
    window.gtag?.("event", name, params);
  } catch {
    // Analytics must never break the page (blocked scripts, no init).
  }
}

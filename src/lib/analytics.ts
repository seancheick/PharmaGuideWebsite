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
 *   brief_offer         — the Safety Brief offer. `action` is banner_shown
 *                         (mobile invitation visible), shown (form visible),
 *                         form_opened (mobile tap), dismissed (reader closed
 *                         it; leaving the page is not a dismissal),
 *                         already_subscribed (reader said so) or submit
 *                         (server answered, with `ok`). `placement` names the
 *                         surface.
 *
 * Events go to Microsoft Clarity (named events filter its session
 * recordings, so you can watch exactly the visits that reached story 2 or
 * pressed a CTA) and to GA4 when gtag has loaded. Never pass personal data:
 * no emails, no free text — only the fixed values documented above.
 *
 * analyticsEnabled() is the one gate for Clarity, GA4, Vercel Web
 * Analytics + Speed Insights (components/analytics/VercelInsights.tsx)
 * and these events.
 * Visits are counted only when they are real visits:
 *   • on the production host — not localhost, not *.vercel.app previews;
 *   • not under browser automation (navigator.webdriver) — a headless
 *     browser loaded the homepage at ~01:20–02:20 UTC every night in
 *     Sept 2026, inflating Clarity's LCP and session counts;
 *   • not from a team device. Open https://pharmaguide.io/?internal=1
 *     once on each device to stop counting it; ?internal=0 undoes it.
 */

const INTERNAL_KEY = "pg_internal";
let marketingDocument = false;

/** Consent/account URLs may contain authorization codes or private metadata. */
export function isPrivateRoute(pathname: string): boolean {
  return /^\/(oauth|account)(\/|$)/.test(pathname);
}

/** Loaded trackers cannot be safely unloaded on a client-side navigation. */
export function privatePageNeedsReload(): boolean {
  // The private boundary can render before client navigation commits the URL.
  return typeof window !== "undefined" && marketingDocument;
}

export function analyticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (isPrivateRoute(window.location.pathname)) return false;
  const query = new URLSearchParams(window.location.search);
  if (["code", "authorization_id", "access_token", "refresh_token"].some((key) => query.has(key))) {
    return false;
  }
  const allowed = (
    window.location.hostname === new URL(site.url).hostname &&
    !navigator.webdriver &&
    navigator.doNotTrack !== "1" &&
    !isInternalDevice()
  );
  if (allowed) marketingDocument = true;
  return allowed;
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
  brief_offer: { action: BriefOfferAction; placement: BriefPlacement; ok?: boolean };
};

/** Where a Safety Brief request form lives. */
export type BriefPlacement = "checklist" | "blog_dialog" | "blog_banner" | "blog_inline";
type BriefOfferAction =
  | "banner_shown"
  | "shown"
  | "form_opened"
  | "dismissed"
  | "already_subscribed"
  | "submit";

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params: Record<string, unknown>) => void;
    /** Clarity's queue function, defined by ClarityProvider's init. */
    clarity?: (command: "event" | "set", ...args: string[]) => void;
  }
}

export function track<E extends keyof Events>(name: E, params: Events[E]): void {
  if (!analyticsEnabled()) return;
  try {
    // Clarity takes a bare event name; the value rides along as a tag.
    const [key, value] = Object.entries(params)[0] ?? [];
    window.clarity?.("event", value === undefined ? name : `${name}:${String(value)}`);
    if (key !== undefined) window.clarity?.("set", name, String(value));
    window.gtag?.("event", name, params);
  } catch {
    // Analytics must never break the page (blocked scripts, no init).
  }
}

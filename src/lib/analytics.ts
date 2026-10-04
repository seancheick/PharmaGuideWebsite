import clarity from "@microsoft/clarity";

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
 */

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
  if (typeof window === "undefined") return;
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

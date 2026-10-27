/**
 * Safety Brief offer suppression — the one owner of "should we ask again?".
 *
 * Stored per browser in localStorage as { status, at } (never the email):
 *   • "requested" — the server confirmed a brief request from any form
 *     (/checklist, the blog dialog or the inline offer). No automatic offer
 *     while the record lasts. Browser-local: clearing storage or switching
 *     devices brings the offer back, and that's fine.
 *   • "subscribed" — the reader arrived from one of our emails (any link
 *     tagged utm_medium=email) or said "I'm already subscribed". Same
 *     effect as "requested". The tag says only "came from an email": no
 *     contact id, nothing identifying.
 *   • "dismissed" — the reader closed the automatic offer. Quiet for 30 days.
 * sessionStorage marks the offer as already shown this session.
 *
 * Storage that throws (private mode, blocked site data) means no automatic
 * offer at all; the inline offer and /checklist still work.
 */

const KEY = "pg_brief_offer";
const SESSION_KEY = "pg_brief_offer_seen";
const DISMISS_MS = 30 * 24 * 60 * 60 * 1000;

type Status = "requested" | "subscribed" | "dismissed";

function write(status: Status): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ status, at: Date.now() }));
  } catch {
    // Storage blocked: nothing to remember, nothing to break
  }
}

export function markBriefRequested(): void {
  write("requested");
}

export function markBriefSubscribed(): void {
  write("subscribed");
}

export function markBriefDismissed(): void {
  write("dismissed");
}

export function markBriefOfferSeen(): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Storage blocked: autoOfferAllowed already returns false
  }
}

function readStatus(): { status?: Status; at?: number } | null {
  if (new URLSearchParams(window.location.search).get("utm_medium") === "email") {
    write("subscribed");
    return { status: "subscribed" };
  }
  const raw = window.localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as { status?: Status; at?: number }) : null;
}

/** The reader already has the brief or our emails, as far as this browser knows. */
export function isKnownSubscriber(): boolean {
  try {
    const status = readStatus()?.status;
    return status === "requested" || status === "subscribed";
  } catch {
    return false;
  }
}

/** True only when storage works and nothing says to stay quiet. */
export function autoOfferAllowed(): boolean {
  try {
    if (isKnownSubscriber()) return false;
    if (window.sessionStorage.getItem(SESSION_KEY)) return false;
    const { status, at } = readStatus() ?? {};
    if (status === "dismissed" && typeof at === "number") return Date.now() - at > DISMISS_MS;
    return true;
  } catch {
    return false;
  }
}

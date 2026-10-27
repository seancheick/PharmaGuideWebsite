import { readEmailPreference } from "@/lib/email-preferences";
import { saveUnsubscribeFeedback, unsubscribeContact, unsubscribeReasons } from "@/lib/resend";
import { preferencePage as page } from "@/lib/email-preference-page";
import { log } from "@/lib/logger";

export const runtime = "nodejs";

const invalid = () =>
  page(
    "Link unavailable",
    "<p>This link is invalid. Contact info@pharmaguide.io for help.</p>",
    400
  );
const unchanged = "<p>This does not change your app account or your other email subscriptions.</p>";
const feedbackForm = `<form method="post"><input type="hidden" name="action" value="feedback"><label for="reason">Why are you leaving? (optional)</label><select id="reason" name="reason" required><option value="">Choose a reason</option><option value="too_many">Too many emails</option><option value="not_relevant">Not relevant to me</option><option value="not_using">I'm not using PharmaGuide</option><option value="did_not_signup">I didn't sign up</option><option value="other">Other</option></select><p><small>If you submit, we store only your latest selected reason and email list with your contact in Resend to improve our emails. No written explanation or health information is collected.</small></p><button type="submit">Send optional feedback</button></form><p>You can close this page without giving feedback.</p>`;

function preference(request: Request) {
  const params = new URL(request.url).searchParams;
  return params.getAll("token").length === 1 ? readEmailPreference(params.get("token")) : null;
}

export async function GET(request: Request) {
  const selected = preference(request);
  if (!selected) return invalid();
  if (new URL(request.url).searchParams.get("view") === "keep")
    return page(
      "Preferences kept",
      "<p>Your email preferences are unchanged. You can close this page.</p>"
    );
  const list = selected.list === "beta" ? "beta invitations and updates" : "monthly notes";
  const token = new URL(request.url).searchParams.get("token")!;
  return page(
    "Your email preferences",
    `<p>Stop receiving PharmaGuide ${list}?</p><form method="post"><button type="submit" name="action" value="unsubscribe">Unsubscribe</button></form><p><a href="?token=${encodeURIComponent(token)}&amp;view=keep">Keep current preferences</a></p>${unchanged}`
  );
}

export async function POST(request: Request) {
  const selected = preference(request);
  if (!selected) return invalid();
  let fields: URLSearchParams;
  try {
    const body = await request.text();
    if (body.length > 2048 || /%(?![0-9a-f]{2})/i.test(body)) return invalid();
    fields = new URLSearchParams(body);
  } catch {
    return invalid();
  }
  const entries = [...fields];
  const oneClick = entries.length === 1 && fields.get("List-Unsubscribe") === "One-Click";
  const unsubscribe = entries.length === 1 && fields.get("action") === "unsubscribe";
  const feedback =
    entries.length === 2 &&
    fields.getAll("action").length === 1 &&
    fields.getAll("reason").length === 1 &&
    fields.get("action") === "feedback";
  if (feedback) {
    const reason = fields.get("reason")!;
    if (!unsubscribeReasons.includes(reason)) return invalid();
    try {
      const result = await saveUnsubscribeFeedback(selected, reason);
      if (result === "not_opted_out")
        return page(
          "Feedback unavailable",
          "<p>Please unsubscribe from this list before sharing feedback. Your preferences are unchanged.</p>",
          400
        );
      if (result === "save_failed")
        return page(
          "You're still unsubscribed",
          `<p>We couldn't save your feedback. Your opt-out from this list remains in place.</p>${feedbackForm}`,
          503
        );
      return page(
        "Feedback saved",
        `<p>Thank you. You're still unsubscribed from this list.</p>${unchanged}`
      );
    } catch {
      return page(
        "Feedback unavailable",
        "<p>We couldn't verify your preference, so we haven't saved feedback or changed your subscriptions. Please try again later.</p>",
        503
      );
    }
  }
  if (!oneClick && !unsubscribe) return invalid();
  try {
    await unsubscribeContact(selected);
    if (oneClick)
      return new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } });
    return page(
      "You've unsubscribed",
      `<p>You've unsubscribed from this list. Your other email preferences are unchanged.</p>${feedbackForm}`
    );
  } catch {
    log.error("email.unsubscribe_failed", { list: selected.list });
    return page(
      "Preference not saved",
      "<p>We couldn't save your preference. Please try again or contact info@pharmaguide.io.</p>",
      503
    );
  }
}

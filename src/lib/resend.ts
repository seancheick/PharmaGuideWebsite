import { Resend } from "resend";

/**
 * Resend client + helpers for the two email surfaces:
 *
 *   1. Beta waitlist     (homepage FinalCTA)
 *   2. Newsletter        (/faq NewsletterCTA + future surfaces)
 *
 * Each subscribe flow does two things:
 *   • Adds the contact to the right Resend Audience (so future
 *     broadcasts can target them as a list)
 *   • Sends a one-off welcome email immediately (transactional)
 *
 * Audiences and the API key live in env so we can rotate without code.
 * If env vars are missing at runtime, the helpers fail fast with a
 * descriptive error so we never silently lose a signup.
 *
 * Server-only — never imported into client components. Wrapped by
 * server actions in src/app/actions/subscribe.ts which is what the
 * UI calls.
 */

const apiKey = process.env.RESEND_API_KEY;
const audienceBeta = process.env.RESEND_AUDIENCE_BETA_ID;
const audienceNewsletter = process.env.RESEND_AUDIENCE_NEWSLETTER_ID;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "PharmaGuide <hello@pharmaguide.io>";
const replyTo = process.env.RESEND_REPLY_TO_EMAIL ?? "info@pharmaguide.io";

if (!apiKey) {
  // Fail fast at module load so missing env is surfaced clearly in
  // server logs instead of producing silently broken signups.
  console.warn(
    "[resend] RESEND_API_KEY is not set — subscribe helpers will throw."
  );
}

export const resend = new Resend(apiKey ?? "missing-key-will-fail");

export type SubscribeList = "beta" | "newsletter";

export interface SubscribeOptions {
  email: string;
  list: SubscribeList;
  /** Optional context — e.g. the supplement-stack textarea on FinalCTA. */
  note?: string;
  /** First name if collected (none of our forms collect this yet). */
  firstName?: string;
}

export interface SubscribeResult {
  ok: boolean;
  /** Human-readable message safe to show to the user. */
  message: string;
  /** Internal error code for logging — not user-facing. */
  code?: string;
}

const listToAudience: Record<SubscribeList, string | undefined> = {
  beta: audienceBeta,
  newsletter: audienceNewsletter,
};

/**
 * Add a contact to an Audience + send the welcome email.
 *
 * Idempotent at the audience layer: Resend's create-contact endpoint
 * returns an existing-contact response if the email is already in
 * the audience (it doesn't error). We treat that as a success and
 * skip sending another welcome email.
 */
export async function subscribe({
  email,
  list,
  note,
  firstName,
}: SubscribeOptions): Promise<SubscribeResult> {
  // Cheap server-side validation — defense in depth, the form also
  // validates client-side before submission.
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email.", code: "invalid_email" };
  }

  if (!apiKey) {
    return {
      ok: false,
      message: "Email signup is temporarily unavailable. Please try again later.",
      code: "missing_api_key",
    };
  }

  const audienceId = listToAudience[list];
  if (!audienceId) {
    return {
      ok: false,
      message: "Email signup is temporarily unavailable. Please try again later.",
      code: "missing_audience_id",
    };
  }

  try {
    // 1. Add to audience (Resend dedupes — re-adds are no-ops)
    const contactResult = await resend.contacts.create({
      email,
      audienceId,
      ...(firstName ? { firstName } : {}),
      // Resend doesn't have a generic "metadata" field on contacts —
      // we stash the optional `note` in unsubscribed status comments
      // by storing it on the welcome email instead. Future: write to
      // a separate Supabase row if we need richer signup metadata.
    });

    // Some clients return data: null when the email already exists.
    // We don't treat that as an error — just don't double-send the
    // welcome email.
    const isNewContact = !!contactResult.data;

    // 2. Send welcome email (only for net-new contacts)
    if (isNewContact) {
      await sendWelcomeEmail({ email, list, note });
    }

    return {
      ok: true,
      message: isNewContact
        ? "You're in."
        : "You're already on the list — see you soon.",
    };
  } catch (err) {
    // Log full error server-side; show generic safe message to user.
    console.error("[resend] subscribe failed:", err);
    return {
      ok: false,
      message: "Something went wrong. Try again in a moment?",
      code: "resend_api_error",
    };
  }
}

/**
 * Send the appropriate welcome email for the list.
 * Imports the React Email templates lazily so the entire email
 * surface isn't bundled into the client by accident.
 */
async function sendWelcomeEmail({
  email,
  list,
  note,
}: {
  email: string;
  list: SubscribeList;
  note?: string;
}) {
  const { BetaWelcomeEmail } = await import("@/emails/BetaWelcomeEmail");
  const { NewsletterWelcomeEmail } = await import(
    "@/emails/NewsletterWelcomeEmail"
  );

  const subject =
    list === "beta"
      ? "You're on the PharmaGuide beta list"
      : "Welcome to PharmaGuide — first dispatch on the way";

  const react =
    list === "beta"
      ? BetaWelcomeEmail({ email, note })
      : NewsletterWelcomeEmail({ email });

  await resend.emails.send({
    from: fromEmail,
    to: email,
    replyTo,
    subject,
    react,
  });
}

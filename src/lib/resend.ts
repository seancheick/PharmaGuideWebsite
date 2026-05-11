import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { env } from "./env";
import { isValidEmail } from "./validation";
import { log, hashPii } from "./logger";

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
 * Env vars are validated at module load via `./env` — missing keys
 * throw with a clear error rather than silently breaking signups.
 *
 * Server-only — `import "server-only"` enforces this. The wrapping
 * server actions in src/app/actions/subscribe.ts are what the UI calls.
 */

const resend = new Resend(env.RESEND_API_KEY);

export type SubscribeList = "beta" | "newsletter";

export interface SubscribeOptions {
  email: string;
  list: SubscribeList;
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

const listToAudience: Record<SubscribeList, string> = {
  beta: env.RESEND_AUDIENCE_BETA_ID,
  newsletter: env.RESEND_AUDIENCE_NEWSLETTER_ID,
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
  firstName,
}: SubscribeOptions): Promise<SubscribeResult> {
  if (!isValidEmail(email)) {
    return {
      ok: false,
      message: "Please enter a valid email.",
      code: "invalid_email",
    };
  }

  const audienceId = listToAudience[list];

  try {
    // 1. Add to audience (Resend dedupes — re-adds are no-ops)
    const contactResult = await resend.contacts.create({
      email,
      audienceId,
      ...(firstName ? { firstName } : {}),
    });

    // Some clients return data: null when the email already exists.
    // We don't treat that as an error — just don't double-send the
    // welcome email.
    const isNewContact = !!contactResult.data;

    // 2. Send welcome email (only for net-new contacts)
    if (isNewContact) {
      await sendWelcomeEmail({ email, list });
    }

    log.info("subscribe.success", {
      list,
      email_hash: hashPii(email),
      new_contact: isNewContact,
    });

    return {
      ok: true,
      message: isNewContact
        ? "You're in."
        : "You're already on the list — see you soon.",
    };
  } catch (err) {
    log.error("subscribe.failed", {
      list,
      email_hash: hashPii(email),
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      ok: false,
      message: "Something went wrong. Try again in a moment?",
      code: "resend_api_error",
    };
  }
}

/**
 * Send the appropriate welcome email for the list.
 *
 * Imports the React Email templates lazily so the entire email
 * surface isn't bundled into routes that don't send mail.
 *
 * Generates an explicit plain-text fallback alongside the HTML.
 * Resend auto-generates one when omitted, but explicit text gives
 * us control over what Apple Mail / accessibility tools read.
 */
async function sendWelcomeEmail({
  email,
  list,
}: {
  email: string;
  list: SubscribeList;
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
      ? BetaWelcomeEmail({ email })
      : NewsletterWelcomeEmail({ email });

  const text = await render(react, { plainText: true });

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: email,
    replyTo: env.RESEND_REPLY_TO_EMAIL,
    subject,
    react,
    text,
  });
}

// ─── Healthcare Pros inquiry ─────────────────────────────────────────
// Lightweight lead capture from the HIPAA page form. Sends a plain
// notification to the providers inbox with the inquirer set as
// replyTo — recipient can hit reply and start a thread directly.

export interface ProviderInquiry {
  email: string;
  role: "Pharmacist" | "Physician" | "Nurse Practitioner" | "Other";
  organization?: string;
  notes?: string;
}

export async function notifyProviderInterest(
  inq: ProviderInquiry
): Promise<SubscribeResult> {
  if (!isValidEmail(inq.email)) {
    return {
      ok: false,
      message: "Please enter a valid email.",
      code: "invalid_email",
    };
  }

  const subject = `Healthcare Pros — early-access inquiry from a ${inq.role}`;
  const lines = [
    `Role: ${inq.role}`,
    `Email: ${inq.email}`,
    inq.organization ? `Organization: ${inq.organization}` : null,
    "",
    inq.notes ? "Notes from the requester:" : null,
    inq.notes ?? null,
    "",
    "— Sent from /hipaa § PharmaGuide for Healthcare Pros",
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  try {
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: env.RESEND_PROVIDERS_NOTIFY_EMAIL,
      replyTo: inq.email,
      subject,
      text: lines,
    });

    log.info("providers.inquiry_sent", {
      email_hash: hashPii(inq.email),
      role: inq.role,
    });

    return {
      ok: true,
      message:
        "Thanks — we'll be in touch as the Healthcare Pros tier opens.",
    };
  } catch (err) {
    log.error("providers.inquiry_failed", {
      email_hash: hashPii(inq.email),
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      ok: false,
      message: "Something went wrong. Try again in a moment?",
      code: "resend_api_error",
    };
  }
}

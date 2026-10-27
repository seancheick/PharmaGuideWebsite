import "server-only";
import { Resend, type ErrorResponse, type GetContactResponseSuccess } from "resend";
import { render } from "@react-email/render";
import { env } from "./env";
import { isValidEmail } from "./validation";
import { log, hashPii } from "./logger";
import { syncBetaContact } from "./email-tracking";
import { pollChoices } from "./email-poll.cjs";
import {
  deliverWelcomeOnce,
  reserveWelcome,
  welcomeKey,
  type WelcomeMessage,
} from "./email-delivery";
import { unsubscribeUrl, unsubscribeHeaders, type EmailPreference } from "./email-preferences";

/**
 * Resend client + helpers for the email surfaces:
 *
 *   1. Beta waitlist     (homepage FinalCTA)
 *   2. Newsletter        (/faq NewsletterCTA + future surfaces)
 *   3. Safety Brief      (/checklist lead-magnet funnel)
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

/**
 * The Resend SDK reports failures as `{ data: null, error }` instead of
 * throwing, so an unchecked call fails silently: the visitor is told
 * "you're in" and nothing was stored or sent. Every call goes through one
 * of these two helpers so a failure lands in the catch blocks below.
 */
class ResendError extends Error {
  constructor(what: string, error: ErrorResponse) {
    super(`${what}: ${error.name} (${error.statusCode ?? "no status"}) ${error.message}`);
  }
}

/** Throws on any send failure: an email that did not go out is never a success. */
async function sendEmail(
  options: Parameters<typeof resend.emails.send>[0],
  idempotencyKey?: string
): Promise<void> {
  const { data, error } = await resend.emails.send(options, { idempotencyKey });
  if (error) throw new ResendError("emails.send", error);
  if (!data?.id) throw new Error("emails.send: missing delivery acknowledgement");
}

function topicForAudience(audienceId: string): string {
  return audienceId === env.RESEND_AUDIENCE_BETA_ID
    ? env.RESEND_BETA_TOPIC_ID
    : env.RESEND_NEWSLETTER_TOPIC_ID;
}

async function topicContact(contact: GetContactResponseSuccess, audienceId: string) {
  const topicId = topicForAudience(audienceId);
  if (!topicId || contact.unsubscribed) return contact;
  const topics = await resend.contacts.topics.list({ id: contact.id, limit: 100 });
  if (topics.error || !topics.data) throw new Error("Email preference lookup failed");
  const subscribed = topics.data.data.some(
    (topic) => topic.id === topicId && topic.subscription === "opt_in"
  );
  return { ...contact, unsubscribed: !subscribed };
}

async function addContact(
  email: string,
  audienceId: string,
  firstName?: string,
  beforeCreate?: () => Promise<void>
) {
  const global = await resend.contacts.get({ email });
  if (global.error && global.error.statusCode !== 404)
    throw new ResendError("contacts.get", global.error);
  if (!global.error && !global.data?.id)
    throw new Error("contacts.get: missing contact acknowledgement");
  const ensureMembership = async (contact: GetContactResponseSuccess) => {
    const scoped = await topicContact(contact, audienceId);
    if (scoped.unsubscribed) return scoped;
    const memberships = await resend.contacts.segments.list({ contactId: scoped.id, limit: 100 });
    if (memberships.error || !memberships.data) throw new Error("Email list lookup failed");
    if (memberships.data.data.some((segment) => segment.id === audienceId)) return scoped;
    await beforeCreate?.();
    if (audienceId === env.RESEND_AUDIENCE_BETA_ID && !scoped.properties?.pg_beta_joined_at?.value) {
      const recorded = await resend.contacts.update({ id: scoped.id, properties: {
        pg_beta_joined_at: new Date().toISOString(),
      } });
      if (recorded.error || recorded.data?.id !== scoped.id) throw new Error("Beta signup date was not recorded");
    }
    const membership = await resend.contacts.segments.add({
      contactId: scoped.id,
      segmentId: audienceId,
    });
    if (membership.error || !membership.data?.id) throw new Error("Email list enrollment failed");
    return scoped;
  };
  if (global.data?.id) return ensureMembership(global.data);
  await beforeCreate?.();
  const topicId = topicForAudience(audienceId);
  const { data, error } = await resend.contacts.create({
    email,
    segments: [{ id: audienceId }],
    ...(topicId ? { topics: [{ id: topicId, subscription: "opt_in" as const }] } : {}),
    ...(env.RESEND_BETA_WAITING_SEGMENT_ID && audienceId === env.RESEND_AUDIENCE_BETA_ID
      ? { properties: { pg_beta_status: "waiting", pg_source: "website", pg_beta_joined_at: new Date().toISOString() } }
      : {}),
    ...(firstName ? { firstName } : {}),
  });
  if (!error) {
    if (!data?.id) throw new Error("contacts.create: missing contact acknowledgement");
    const confirmed = await resend.contacts.get({ id: data.id });
    if (confirmed.error) throw new ResendError("contacts.get", confirmed.error);
    if (!confirmed.data?.id) throw new Error("contacts.get: missing contact acknowledgement");
    return ensureMembership(confirmed.data);
  }
  const existing = await resend.contacts.get({ email });
  if (!existing.error && existing.data?.id) {
    log.info("resend.contact_exists", {
      email_hash: hashPii(email),
      create_error: `${error.name} (${error.statusCode})`,
    });
    return ensureMembership(existing.data);
  }
  throw new ResendError("contacts.create", error);
}

const listToAudience: Record<SubscribeList, string> = {
  beta: env.RESEND_AUDIENCE_BETA_ID,
  newsletter: env.RESEND_AUDIENCE_NEWSLETTER_ID,
};

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
    const deliveryKey = welcomeKey(email, list);
    const contact = await addContact(email, audienceId, firstName, () =>
      reserveWelcome(deliveryKey)
    );
    if (contact.unsubscribed) {
      return {
        ok: true,
        message:
          "Your email preferences are unchanged. Contact info@pharmaguide.io if you want to rejoin.",
      };
    }
    const delivery = await deliverWelcomeOnce(
      deliveryKey,
      () => prepareWelcomeEmail({ email, list, contactId: contact.id }),
      (message) => sendEmail(message, `welcome/${deliveryKey}`)
    );
    if (list === "beta") {
      try {
        await syncBetaContact(contact.id);
      } catch {
        log.error("email.beta_tracking_needs_review", { contact_id: contact.id });
      }
    }

    log.info("subscribe.success", {
      list,
      email_hash: hashPii(email),
    });

    return {
      ok: true,
      message:
        delivery === "existing"
          ? "You're already on the list. Your email preferences are unchanged."
          : delivery === "processing"
            ? "You're on the list. Your welcome email is being processed. If it doesn't arrive, try again in a minute."
            : "You're on the list. Check your inbox for your welcome email.",
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
async function prepareWelcomeEmail({
  email,
  list,
  contactId,
}: {
  email: string;
  list: SubscribeList;
  contactId: string;
}): Promise<WelcomeMessage> {
  const { BetaWelcomeEmail } = await import("@/emails/BetaWelcomeEmail");
  const { NewsletterWelcomeEmail } = await import("@/emails/NewsletterWelcomeEmail");

  const subject =
    list === "beta"
      ? "You're on the PharmaGuide beta list"
      : "Welcome to PharmaGuide's monthly notes";

  const url = unsubscribeUrl({ contactId, list });
  const react =
    list === "beta"
      ? BetaWelcomeEmail({ email, unsubscribeUrl: url })
      : NewsletterWelcomeEmail({ email, unsubscribeUrl: url });

  const text = await render(react, { plainText: true });
  const html = await render(react);

  return {
    from: env.RESEND_FROM_EMAIL,
    to: email,
    replyTo: env.RESEND_REPLY_TO_EMAIL,
    subject,
    html,
    text,
    headers: unsubscribeHeaders(url),
  };
}

export const unsubscribeReasons: readonly string[] = [
  "too_many", "not_relevant", "not_using", "did_not_signup", "other",
];

export async function saveBetaInterest(contactId: string, choice: string): Promise<void> {
  if (!pollChoices.some(({ value }) => value === choice)) throw new Error("Invalid poll choice");
  const contact = await resend.contacts.get({ id: contactId });
  const segments = await resend.contacts.segments.list({ contactId, limit: 100 });
  if (contact.error || contact.data?.id !== contactId || segments.error ||
      !segments.data?.data.some(({ id }) => id === listToAudience.beta))
    throw new Error("Beta contact lookup failed");
  const current = contact.data.properties?.pg_beta_interest;
  if (current?.value === choice) return;
  const saved = await resend.contacts.update({ id: contactId, properties: {
    pg_beta_interest: choice,
    pg_beta_interest_at: new Date().toISOString(),
  } });
  if (saved.error || saved.data?.id !== contactId) throw new Error("Poll answer save failed");
}

export async function saveUnsubscribeFeedback(
  preference: EmailPreference,
  reason: string
): Promise<"saved" | "not_opted_out" | "save_failed"> {
  if (!unsubscribeReasons.includes(reason)) throw new Error("Invalid feedback reason");
  const topicId = topicForAudience(listToAudience[preference.list]);
  if (!topicId) throw new Error("Email topic preferences are not configured");
  const contact = await resend.contacts.get({ id: preference.contactId });
  if (contact.error || contact.data?.id !== preference.contactId)
    throw new Error("Email contact lookup failed");
  const topics = await resend.contacts.topics.list({ id: preference.contactId, limit: 100 });
  if (topics.error || !topics.data) throw new Error("Email preference lookup failed");
  if (!topics.data.data.some((topic) => topic.id === topicId && topic.subscription === "opt_out"))
    return "not_opted_out";
  try {
    const saved = await resend.contacts.update({
      id: preference.contactId,
      properties: { pg_unsubscribe_feedback: `${preference.list}:${reason}` },
    });
    return saved.error || saved.data?.id !== preference.contactId ? "save_failed" : "saved";
  } catch {
    return "save_failed";
  }
}

export async function unsubscribeContact(preference: EmailPreference): Promise<void> {
  const topicId = topicForAudience(listToAudience[preference.list]);
  if (!topicId) throw new Error("Email topic preferences are not configured");
  const { data, error } = await resend.contacts.topics.update({
    id: preference.contactId,
    topics: [{ id: topicId, subscription: "opt_out" }],
  });
  if (error) throw new ResendError("contacts.update", error);
  if (!data?.id) throw new Error("contacts.update: missing unsubscribe acknowledgement");
  if (preference.list === "beta") {
    const updated = await resend.contacts.update({
      id: preference.contactId,
      properties: {
        pg_beta_status: "unsubscribed",
        pg_status_updated_at: new Date().toISOString(),
      },
    });
    if (updated.error || !updated.data?.id) throw new Error("Beta preference update failed");
    await syncBetaContact(preference.contactId);
  }
}

// ─── Safety Brief delivery (brief request forms) ─────────────────────
// Lead magnet: visitor requests the Supplement Safety Intelligence Brief.
// Adds them to the newsletter and beta audiences (the form says so;
// Resend dedupes re-adds, and an earlier opt-out from either list is
// kept) and always sends the brief email — they explicitly asked for it,
// so unlike the welcome flow this is not limited to net-new contacts.
// No separate welcome email: the brief email covers both lists.

export async function sendSafetyBrief(email: string): Promise<SubscribeResult> {
  if (!isValidEmail(email)) {
    return {
      ok: false,
      message: "Please enter a valid email.",
      code: "invalid_email",
    };
  }

  try {
    // Re-requests still get the brief, and so does a visitor whose
    // contact add failed: they asked for the PDF.
    const join = async (list: SubscribeList) => {
      try {
        return await addContact(email, listToAudience[list]);
      } catch (err) {
        log.error("brief.contact_failed", {
          list,
          email_hash: hashPii(email),
          error: err instanceof Error ? err.message : String(err),
        });
        return undefined;
      }
    };
    const newsletter = await join("newsletter");
    const contact = await join("beta");

    const { BriefDeliveryEmail } = await import("@/emails/BriefDeliveryEmail");
    const newsletterEnrolled = !!newsletter && !newsletter.unsubscribed;
    const betaEnrolled = !!contact && !contact.unsubscribed;
    const betaUrl = contact ? unsubscribeUrl({ contactId: contact.id, list: "beta" }) : undefined;
    const newsletterUrl =
      newsletter && newsletterEnrolled
        ? unsubscribeUrl({ contactId: newsletter.id, list: "newsletter" })
        : undefined;
    if (betaEnrolled && contact) {
      try {
        await syncBetaContact(contact.id);
      } catch {
        log.error("email.beta_tracking_needs_review", { contact_id: contact.id });
      }
    }
    const react = BriefDeliveryEmail({
      email,
      betaUnsubscribeUrl: betaUrl,
      newsletterUnsubscribeUrl: newsletterUrl,
      betaEnrolled,
      newsletterEnrolled,
    });
    const text = await render(react, { plainText: true });
    // One-click unsubscribe in the inbox stops the monthly notes, the list
    // that keeps sending; the footer links cover each list.
    const headerUrl = newsletterUrl ?? betaUrl;

    await sendEmail({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      replyTo: env.RESEND_REPLY_TO_EMAIL,
      subject: "Your Supplement Safety Brief is here",
      react,
      text,
      ...(headerUrl ? { headers: unsubscribeHeaders(headerUrl) } : {}),
    });

    log.info("brief.sent", { email_hash: hashPii(email) });

    return {
      ok: true,
      message: betaEnrolled
        ? newsletterEnrolled
          ? "Check your inbox. The brief is on its way, and you're on the newsletter and beta list."
          : "Check your inbox. The brief is on its way."
        : "Check your inbox for the brief. We could not confirm your beta signup. Contact info@pharmaguide.io to check your status or change your email preferences.",
    };
  } catch (err) {
    log.error("brief.failed", {
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

export async function notifyProviderInterest(inq: ProviderInquiry): Promise<SubscribeResult> {
  if (!isValidEmail(inq.email)) {
    return {
      ok: false,
      message: "Please enter a valid email.",
      code: "invalid_email",
    };
  }

  const subject = `Healthcare Pros: early-access inquiry from a ${inq.role}`;
  const lines = [
    `Role: ${inq.role}`,
    `Email: ${inq.email}`,
    inq.organization ? `Organization: ${inq.organization}` : null,
    "",
    inq.notes ? "Notes from the requester:" : null,
    inq.notes ?? null,
    "",
    "Sent from PharmaGuide for Healthcare Pros",
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  try {
    await sendEmail({
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
      message: "Thanks — we'll be in touch as the Healthcare Pros tier opens.",
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

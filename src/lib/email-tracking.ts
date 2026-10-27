import "server-only";
import { Resend, type WebhookEventPayload, type GetContactResponseSuccess } from "resend";
import { Redis } from "@upstash/redis";
import { env } from "./env";
import { log } from "./logger";
import { unsubscribeUrl } from "./email-preferences";
import { pollUrl } from "./email-poll.cjs";

const resend = new Resend(env.RESEND_API_KEY);
const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
    : null;
const retainedFor = 90 * 24 * 60 * 60;
const saveDeliveryReceipt = `
local stored = redis.call('GET', KEYS[1])
local incoming = cjson.decode(ARGV[1])
if stored then
  local current = cjson.decode(stored)
  if current.at > incoming.at then return 0 end
end
redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])
return 1
`;

function property(contact: GetContactResponseSuccess, key: string) {
  return contact.properties?.[key]?.value;
}

async function updateContact(
  id: string,
  changes: {
    id?: string;
    unsubscribed?: boolean;
    properties?: Record<string, string | number | null>;
  }
) {
  const result = await resend.contacts.update({ ...changes, id });
  if (result.error || !result.data?.id)
    throw new Error("Email contact update was not acknowledged");
}

async function removeFromWaiting(contactId: string) {
  if (!env.RESEND_BETA_WAITING_SEGMENT_ID) return;
  const result = await resend.contacts.segments.remove({
    contactId,
    segmentId: env.RESEND_BETA_WAITING_SEGMENT_ID,
  });
  if (result.error && result.error.statusCode !== 404)
    throw new Error("Waiting-list removal failed");
}

export async function syncBetaContact(contactId: string): Promise<void> {
  if (!env.RESEND_BETA_WAITING_SEGMENT_ID) return;
  const result = await resend.contacts.get({ id: contactId });
  if (result.error || !result.data?.id) throw new Error("Beta contact lookup failed");
  const contact = result.data;
  const status = property(contact, "pg_beta_status");
  if (contact.unsubscribed || (status && status !== "waiting")) {
    await removeFromWaiting(contactId);
    return;
  }
  if (env.RESEND_BETA_TOPIC_ID) {
    const topics = await resend.contacts.topics.list({ id: contactId, limit: 100 });
    if (topics.error || !topics.data) throw new Error("Beta preference lookup failed");
    if (
      !topics.data.data.some(
        (topic) => topic.id === env.RESEND_BETA_TOPIC_ID && topic.subscription === "opt_in"
      )
    ) {
      await updateContact(contactId, { properties: { pg_beta_status: "unsubscribed" } });
      await removeFromWaiting(contactId);
      return;
    }
  }
  await updateContact(contactId, {
    properties: {
      ...(!status
        ? {
            pg_beta_status: "waiting",
            pg_source: "website",
            pg_status_updated_at: new Date().toISOString(),
          }
        : {}),
      pg_beta_unsubscribe_url: unsubscribeUrl({ contactId, list: "beta" }),
      pg_beta_poll_url: pollUrl(contactId, env.EMAIL_UNSUBSCRIBE_SECRET || env.RESEND_API_KEY),
    },
  });
  const added = await resend.contacts.segments.add({
    contactId,
    segmentId: env.RESEND_BETA_WAITING_SEGMENT_ID,
  });
  if (added.error) throw new Error("Waiting-list enrollment failed");
  if (!env.RESEND_WAITING_SEQUENCE_ENABLED) return;
  const joinedAt = property(contact, "pg_beta_joined_at");
  const startedAt = Date.parse(env.RESEND_WAITING_SEQUENCE_STARTED_AT);
  if (typeof joinedAt !== "string" || !Number.isFinite(startedAt) ||
      !Number.isFinite(Date.parse(joinedAt)) || Date.parse(joinedAt) < startedAt) return;
  if (!redis) throw new Error("Sequence enrollment storage is unavailable");
  if (property(contact, "pg_sequence_status") === "enrolled") return;
  const key = `email:sequence:${contactId}:v1`;
  const reserved = await redis.set(key, "pending", { nx: true });
  if (!reserved) return;
  try {
    const sent = await resend.events.send({ event: "pg.beta.waitlist_joined.v1", contactId });
    if (sent.error || !sent.data) throw new Error("Sequence event was not acknowledged");
    await updateContact(contactId, {
      id: contactId,
      properties: { pg_sequence_status: "enrolled" },
    });
    await redis.set(key, "enrolled");
  } catch {
    await updateContact(contactId, {
      id: contactId,
      properties: { pg_sequence_status: "needs_review" },
    });
    log.error("email.sequence_enrollment_needs_review", { contact_id: contactId });
    throw new Error("Sequence enrollment needs review before retrying");
  }
}

export function suppressionReason(event: WebhookEventPayload): string | null {
  if (event.type === "email.complained") return "complained";
  if (event.type === "email.bounced" && event.data.bounce.type.toLowerCase() === "permanent")
    return "hard_bounced";
  return null;
}

export async function recordEmailEvent(event: WebhookEventPayload, eventId: string): Promise<void> {
  if (event.type === "contact.updated") {
    if (!redis) throw new Error("Delivery tracking storage is unavailable");
    const found = await resend.contacts.get({ id: event.data.id });
    if (found.error || !found.data?.id) throw new Error("Contact status lookup failed");
    const memberships = await resend.contacts.segments.list({
      contactId: found.data.id,
      limit: 100,
    });
    if (memberships.error || !memberships.data) throw new Error("Contact list lookup failed");
    if (!memberships.data.data.some((segment) => segment.id === env.RESEND_AUDIENCE_BETA_ID))
      return;
    const status = property(found.data, "pg_beta_status");
    let betaOptOut = false;
    if (env.RESEND_BETA_TOPIC_ID) {
      const topics = await resend.contacts.topics.list({ id: found.data.id, limit: 100 });
      if (topics.error || !topics.data) throw new Error("Contact preference lookup failed");
      betaOptOut = !topics.data.data.some(
        (topic) => topic.id === env.RESEND_BETA_TOPIC_ID && topic.subscription === "opt_in"
      );
    }
    if (betaOptOut && status === "waiting")
      await updateContact(found.data.id, { properties: { pg_beta_status: "unsubscribed" } });
    if (found.data.unsubscribed || betaOptOut || (status && status !== "waiting"))
      await removeFromWaiting(found.data.id);
    await redis.set(
      `email:event:${eventId}`,
      { type: event.type, at: event.created_at },
      { ex: retainedFor }
    );
    return;
  }
  if (!event.type.startsWith("email.") || !("from" in event.data) || !("to" in event.data)) return;
  const sender = event.data.from.match(/<?([^<>\s]+@[^<>\s]+)>?$/)?.[1]?.toLowerCase();
  if (!sender?.endsWith("@pharmaguide.io")) return;
  const supported = [
    "email.sent",
    "email.delivered",
    "email.delivery_delayed",
    "email.failed",
    "email.bounced",
    "email.complained",
    "email.suppressed",
  ];
  if (!supported.includes(event.type)) return;
  if (!redis) throw new Error("Delivery tracking storage is unavailable");
  const receiptKey = `email:event:${eventId}`;
  if (await redis.get(receiptKey)) return;
  const reason = suppressionReason(event);
  for (const email of event.data.to) {
    const found = await resend.contacts.get({ email });
    if (found.error?.statusCode === 404) continue;
    if (found.error || !found.data?.id) throw new Error("Delivery contact lookup failed");
    const contact = found.data;
    const memberships = await resend.contacts.segments.list({ contactId: contact.id, limit: 100 });
    if (memberships.error || !memberships.data) throw new Error("Delivery list lookup failed");
    if (
      !memberships.data.data.some((segment) =>
        [env.RESEND_AUDIENCE_BETA_ID, env.RESEND_AUDIENCE_NEWSLETTER_ID].includes(segment.id)
      )
    )
      continue;
    const previous = property(contact, "pg_delivery_status");
    const previousTime = property(contact, "pg_delivery_updated_at");
    const newer =
      typeof previousTime !== "string" ||
      new Date(event.created_at).getTime() >= new Date(previousTime).getTime();
    if (reason) {
      await updateContact(contact.id, {
        id: contact.id,
        unsubscribed: true,
        properties: {
          pg_beta_status: "suppressed",
          pg_delivery_status: reason,
          pg_delivery_updated_at: event.created_at,
        },
      });
      await removeFromWaiting(contact.id);
    } else if (newer && !["hard_bounced", "complained"].includes(String(previous))) {
      await updateContact(contact.id, {
        id: contact.id,
        properties: {
          pg_delivery_status: event.type.slice(6),
          pg_delivery_updated_at: event.created_at,
        },
      });
    }
    await redis.eval(
      saveDeliveryReceipt,
      [`email:delivery:${event.data.email_id}:${contact.id}`],
      [
        JSON.stringify({ type: event.type, at: new Date(event.created_at).toISOString() }),
        retainedFor,
      ]
    );
  }
  await redis.set(receiptKey, { type: event.type, at: event.created_at }, { ex: retainedFor });
}

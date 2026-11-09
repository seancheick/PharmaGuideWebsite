import "server-only";
import type { Resend, GetTemplateResponseSuccess } from "resend";
import { Redis } from "@upstash/redis";
import { env } from "./env";

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
    : null;
const localSnapshots = new Map<string, GetTemplateResponseSuccess>();
function isPublished(
  data: GetTemplateResponseSuccess | null | undefined,
  alias: string
): data is GetTemplateResponseSuccess {
  return (
    !!data &&
    data.alias === alias &&
    data.status === "published" &&
    !!data.published_at &&
    data.has_unpublished_versions === false
  );
}

export const hostedTemplateAliases = {
  beta: "pg-beta-welcome-v2",
  newsletter: "pg-newsletter-welcome-v2",
  brief: "pg-brief-delivery-v2",
} as const;

export interface HostedVariable {
  html: string;
  text: string;
}
export const plainVariable = (value: string): HostedVariable => ({
  html: value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;"),
  text: value,
});

/** GET returns the current version, which may contain draft edits. Require a
 * clean published template, then freeze its rendered bytes in the welcome receipt.
 * Sending a mutable template alias directly would change uncertain retries.
 */
export async function prepareHostedTemplate(
  client: Resend,
  alias: string,
  variables: Record<string, HostedVariable>
): Promise<{ subject: string; html: string; text: string }> {
  const response = await client.templates.get(alias);
  if (response.error || !response.data) throw new Error(`Hosted email lookup failed: ${alias}`);
  const key = `email:hosted-published:v1:${alias}`;
  let data = response.data;
  const fresh = isPublished(data, alias);
  if (!fresh) {
    // Dashboard edits must not become a send or interrupt already provisioned
    // templates. A cold installation cannot infer published bytes from a draft.
    const previous = redis
      ? await redis.get<GetTemplateResponseSuccess>(key)
      : localSnapshots.get(key);
    if (data.alias !== alias || data.status !== "published" || !isPublished(previous, alias))
      throw new Error(`Hosted email template ${alias} needs a verified published snapshot`);
    data = previous;
  }
  if (!data.subject || !data.html || !data.text)
    throw new Error(`Hosted email template ${alias} needs subject, HTML and text`);
  for (const key of Object.keys(variables)) {
    const placeholder = new RegExp(`\\{\\{\\{?\\s*${key}\\s*\\}?\\}\\}`);
    if (!placeholder.test(data.html) || !placeholder.test(data.text))
      throw new Error(`Hosted email template ${alias} is missing required variable: ${key}`);
  }
  const substitute = (input: string, format: "html" | "text") => {
    const output = input.replace(/\{\{\{?\s*([A-Za-z0-9_]+)\s*\}?\}\}/g, (_match, key: string) => {
      if (!Object.hasOwn(variables, key)) throw new Error(`Unknown hosted email variable: ${key}`);
      return variables[key]![format];
    });
    if (/\{\{|\}\}/.test(output)) throw new Error("Unresolved hosted email variable");
    return output;
  };
  const rendered = {
    subject: substitute(data.subject, "text"),
    html: substitute(data.html, "html"),
    text: substitute(data.text, "text"),
  };
  if (fresh) {
    if (!redis && process.env.NODE_ENV === "production")
      throw new Error("Hosted template snapshot storage is unavailable");
    if (redis) await redis.set(key, JSON.parse(JSON.stringify(data)));
    else localSnapshots.set(key, JSON.parse(JSON.stringify(data)));
  }
  return rendered;
}

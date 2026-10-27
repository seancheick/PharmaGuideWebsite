import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";

export type EmailList = "beta" | "newsletter";

export interface EmailPreference {
  contactId: string;
  list: EmailList;
}

function signature(value: string): string {
  return createHmac("sha256", env.EMAIL_UNSUBSCRIBE_SECRET || env.RESEND_API_KEY)
    .update(`email-unsubscribe-v1:${value}`)
    .digest("base64url");
}

export function unsubscribeUrl(preference: EmailPreference): string {
  const payload = Buffer.from(JSON.stringify(preference)).toString("base64url");
  const url = new URL("/email/unsubscribe", "https://pharmaguide.io");
  url.searchParams.set("token", `${payload}.${signature(payload)}`);
  return url.toString();
}

export function readEmailPreference(token: string | null): EmailPreference | null {
  if (!token || token.length > 1024) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, supplied] = parts;
  if (!payload || !supplied) return null;
  const expected = Buffer.from(signature(payload));
  const actual = Buffer.from(supplied);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      typeof value.contactId !== "string" ||
      !/^[a-zA-Z0-9_-]{1,128}$/.test(value.contactId) ||
      !["beta", "newsletter"].includes(value.list)
    )
      return null;
    return { contactId: value.contactId, list: value.list };
  } catch {
    return null;
  }
}

export function unsubscribeHeaders(url: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${url}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

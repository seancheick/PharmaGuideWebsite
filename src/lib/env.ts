import "server-only";

/**
 * Server-only env access with fail-fast validation.
 *
 * Importing this module from anywhere on the server (resend.ts,
 * rate-limit.ts, server actions) triggers validation. Missing
 * required vars throw with a clear message naming the variable
 * and where to set it — no more silent failures on first signup.
 *
 * The `import "server-only"` guard above causes a build error if
 * this file is ever imported into a client component, preventing
 * accidental leakage of secrets into the browser bundle.
 *
 * Required-in-production vars (Upstash) are warnings in dev so
 * local development works without provisioning Redis. They throw
 * on production builds where rate limiting must be enforced.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[env] Missing required environment variable: ${name}.\n` +
        `Set it in your local .env or in Vercel project settings ` +
        `(Production + Preview). See .env.example for the full list.`
    );
  }
  return value;
}

function requiredInProduction(name: string): string | undefined {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(
      `[env] Missing required production env: ${name}. ` +
        `Set it in Vercel project settings before deploy.`
    );
  }
  return value;
}

export const env = {
  // Resend — required everywhere
  RESEND_API_KEY: required("RESEND_API_KEY"),
  RESEND_AUDIENCE_BETA_ID: required("RESEND_AUDIENCE_BETA_ID"),
  RESEND_AUDIENCE_NEWSLETTER_ID: required("RESEND_AUDIENCE_NEWSLETTER_ID"),

  // Sender identity — falls back to a hardcoded domain match if unset
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ?? "PharmaGuide <hello@pharmaguide.io>",
  RESEND_REPLY_TO_EMAIL: process.env.RESEND_REPLY_TO_EMAIL ?? "info@pharmaguide.io",
  // Inbox that receives Healthcare-Pros early-access inquiries from the
  // HIPAA page form. Lands as a structured email a human triages — no
  // ATS / CRM wiring needed for the beta.
  RESEND_PROVIDERS_NOTIFY_EMAIL:
    process.env.RESEND_PROVIDERS_NOTIFY_EMAIL ?? "providers@pharmaguide.io",

  // Upstash — required in production for rate limiting; optional in dev
  // (rate limiter falls back to allow-with-warning when missing).
  UPSTASH_REDIS_REST_URL: requiredInProduction("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: requiredInProduction("UPSTASH_REDIS_REST_TOKEN"),

  // Supabase — backs product share links (/api/share, /s/[code]).
  //
  // Optional everywhere on purpose, including production. Sharing is an
  // additive feature: if these are unset the API returns 503 and the app
  // falls back to the text-only share it does today. Throwing at boot would
  // take the whole marketing site down over a feature nobody has scanned yet,
  // which is the wrong failure for the more important pages.
  //
  // SERVICE_ROLE is server-only, never prefixed NEXT_PUBLIC_. It resolves the
  // immutable catalog release, writes snapshots, and reads a single code for
  // the server-rendered page. Browser roles receive no table access.
  SUPABASE_URL: process.env.SUPABASE_URL ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
} as const;

/**
 * True when both halves of the share pipeline are configured. Routes check
 * this and degrade to 503 / 404 rather than throwing, so a missing key is a
 * disabled feature and not a broken deployment.
 */
export const shareStorageConfigured =
  env.SUPABASE_URL !== "" && env.SUPABASE_SERVICE_ROLE_KEY !== "";

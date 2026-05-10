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
  RESEND_FROM_EMAIL:
    process.env.RESEND_FROM_EMAIL ?? "PharmaGuide <hello@pharmaguide.io>",
  RESEND_REPLY_TO_EMAIL:
    process.env.RESEND_REPLY_TO_EMAIL ?? "info@pharmaguide.io",

  // Upstash — required in production for rate limiting; optional in dev
  // (rate limiter falls back to allow-with-warning when missing).
  UPSTASH_REDIS_REST_URL: requiredInProduction("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: requiredInProduction("UPSTASH_REDIS_REST_TOKEN"),
} as const;

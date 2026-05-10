/**
 * Shared validation helpers used by both the client forms and the
 * server actions. Single source of truth — no more drift between
 * the two regex copies that used to live in FinalCTA, NewsletterCTA,
 * and resend.ts.
 *
 * The regex is intentionally permissive ("anything@anything.anything"
 * with no whitespace). Strict RFC 5322 validation in JS regex is a
 * tarpit and rejects valid emails; the actual ground truth is
 * "Resend accepted the contact" — this is just a sanity gate.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(
  value: string | undefined | null
): value is string {
  if (!value) return false;
  return EMAIL_REGEX.test(value);
}

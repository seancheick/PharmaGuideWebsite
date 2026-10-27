# Email Preferences Implementation Plan

**Goal:** Implement the already approved branded unsubscribe and optional feedback experience.

**Architecture:** Standalone HTML helper owns styling and security headers. Route validates exact form shapes; a scoped Resend helper verifies topic opt-out before updating only the latest feedback property.

**Tech Stack:** TypeScript route handlers, native HTML forms, Resend, existing node contract tests.

- [x] Add unsubscribe/feedback/style contract tests in tests/resend-contract.test.cjs and confirm failures.
- [x] Add src/lib/email-preference-page.ts and update src/app/email/unsubscribe/route.ts for branded confirmation, read-only keep link, success-only optional feedback and strict validation.
- [x] Add only the verified feedback helper to src/lib/resend.ts and pg_unsubscribe_feedback to scripts/lib/email-campaigns.mjs.
- [x] Add relevant UX and privacy disclosures in docs/12-email-campaigns.md and src/lib/privacy.ts.
- [x] Run npm run test:email and npm run typecheck; inspect scoped changes and report. No commits, network or deployment.

# PharmaGuide Website — Master Plan

> Status: **Phase 0 (Foundation) — pending design system approval.**

This is the navigational index for the website build. Every doc lives in `docs/`
and tracks one concern. Don't lose track — this file is the entry point.

## AI connector audit — October 13, 2026

Containment is merged and deployed: website PR5/main82c761d, app PR114/main14152b88 and pipeline PR136/main934e8027e. Exact candidate CI passed. Consent requires the exact trusted client identity; failed approval rolls back its connection; partial disconnects retain a visible retry path. Private pages exclude trackers/chat and enforce no-referrer/no-store and a restricted CSP. Both containment migrations and all three Edge functions are deployed. Production personal/snapshot writes return503; dynamic registration is disabled. No real health-data connection or app distribution is approved.

Branded public transport is merged and deployed: PR6/main56bfefe, exact source31d2b30 and CI38467026860 green. `next.config.ts` routes only `mcp.pharmaguide.io/` and `/public` to the existing public catalog Edge function. Two routing regressions,20 authorization/8 privacy cases, typecheck/build and lint pass (four existing warnings). Vercel domain attachment is verified; production deployment dpl_GkabhfJmpxAyTeSNmFxk8Q6Vn5gb is READY. Live POST requests return the three tools, known barcode693749006442/product298074 and missing/not-evaluated results. `/personal` is404 and the main website renders. Codex discovers the installed `pharmaguide_public` connector. No catalog, warnings or clinical logic changes.

Personal authorization remains disabled pending integrated acceptance. Sean authorized WorkOS Standalone Connect with Supabase identity retained. October 23 hosted lifecycle qualification is recorded below and in the app threat model; it supersedes the earlier failed provider probes. Full two-account OAuth/Codex/phone/snapshot acceptance, real-device confirmation and privacy review remain release gates. No real identity/health data or production personal runtime is enabled. The archived self-hosted experiment is not shipped.

Owner: `next.config.ts` owns host routing; `src/lib/ai-connector.ts` and `src/app/api/ai-connections/route.ts` own grant consent; `src/lib/analytics.ts` owns tracking eligibility. Evidence: existing config, route/helper callers and regression tests. Will NOT create: duplicate catalog/clinical service, personal-data directory listing or public conditional-warning expansion. Cross-repo execution evidence remains in the pipeline LEDGER and app `supabase/functions/mcp-personal/README.md`.

## Personal phone approval — October 23–24, 2026

The WorkOS connector is implemented and privately qualified with the existing hosted Supabase project, WorkOS staging issuer, protected website preview and physical iPhone. Public personal access remains disabled. The initial integration is on main through PR8; [PR9](https://github.com/seancheick/PharmaGuideWebsite/pull/9) tracks the phone completion, private-page layout and disconnect usability follow-up.

Owner: existing `src/app/api/ai-connections/route.ts`, `src/lib/ai-connector.ts`, consent/connections UI and `PrivatePageBoundary`; coordinated app connection, snapshot and navigation owners. Evidence: route/helper callers, SQL contracts, focused regressions and the app `docs/security/ai-connector-threat-model.md` execution register. Will NOT create another auth issuer, clinical engine, medication sync, connection authority or snapshot format.

Standalone login sends only the Auth-verified Supabase user ID/email to WorkOS and validates the returned issuer origin and hosted completion path. OAuth precedes personal setup; a different live session of the same account must explicitly approve in the app. Phone approval completes the durable connection atomically. Browser polling observes exact session-bound completion, including after the challenge expires, stops on success/unmount, and never needs a second OAuth callback. Phone links use `pharmaguide:///ai-connections?code=…`; return links omit the code. Access settings and Save describe a separate selected copy with its own access end time.

Disconnect blocks local access first, deletes the exact WorkOS application resolved by external user ID/client ID, then clears the generation-bound barrier. Failures remain visibly retryable, including pending-only setup. Completed revocations hide Disconnect; provider cleanup shows Retry disconnect. The button has a 48px minimum target, pending feedback and a synchronous duplicate-tap guard. Cancelling a repeat setup preserves existing authority. The website groups history by exact client ID; the app shows individual connection records.

Private acceptance: desktop and phone Google sign-in, hosted WorkOS review, Safari approval deep link, explicit app approval and Codex supplement reads passed. Save/persistence, automatic selected-copy updates enabled/disabled and stale-copy behavior were exercised. Physical disconnect ended access: both personal tools returned401 with an unexpired original token, original refresh returned400, server snapshots were purged and the revocation barrier cleared. The physical Return to PharmaGuide test passed after the coordinated Flutter owner added native-browser dismissal and provider refresh on the exact return deep link. This is private qualification, not public activation.

Verification: fail-first regressions; `pnpm test:ai-connector` (56 passed), `pnpm test:ai-privacy` (9 passed), `pnpm test:mcp-routing` (2 passed), typecheck, focused ESLint and diff check passed. Protected preview build `dpl_CpEKRKzomA53EcmqJtH8AK9UaGDD` passed. PR9 records the full CI build/checks for its integration candidate; passing checks are required before merge. The ordinary local Turbopack build cannot use the inherited external node_modules symlink; hosted builds and CI use normal dependency installs.

### Configuration and activation boundary

Server-only settings: `WORKOS_ISSUER` (exact HTTPS origin), `WORKOS_API_KEY`, `AI_CONNECTOR_TRUSTED_CLIENTS`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Browser settings: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `AI_CONNECTOR_PAIRING_ENABLED` defaults off. Coordinated phone/WorkOS migrations must precede activation. Public personal endpoints remain contained; production issuer/client/redirect qualification, deliberate configuration and release authorization remain separate gates.

The [protected preview](https://pharmaguide-website-git-codex-pers-7c8be7-sean-cheicks-projects.vercel.app) uses branch-scoped staging configuration with Vercel SSO preserved. The first CLI upload omitted repository metadata and therefore missed branch settings: HTTP200 hid unavailable sign-in. Redeploying exact files with explicit repository/ref metadata fixed configuration selection. Actual page JavaScript was checked for the correct baked browser settings and absence of server secrets; hydrated sign-in was then verified. HTTP200 alone is not acceptance.

WorkOS staging External Sign-in URI points to this exact alias's `/oauth/authorize`. Supabase allowlist additions are only `/oauth/authorize[?]external_auth_id=*`, `/oauth/authorize[?]authorization_id=*` and `/account/connections` on this alias; readback preserved the app callback, production Site URL and all other auth settings. Sanitized receipt: `~/pg_quality/ai_connector_audit_20261013/preview-redirect-allowlist-receipt.json`. Existing Vercel account access on the phone qualifies this protected alias without weakening SSO. No production connector settings were enabled by this work.

References: [WorkOS standalone completion](https://workos.com/docs/reference/workos-connect/standalone) and [external user / authorized applications](https://workos.com/docs/reference/authkit/user), verified October23. Documented `/oauth/authorize/complete`, hosted-observed `/application-authorization` and verified external callback paths are pinned to the configured issuer origin in the existing server owner.

## S9 provider and privacy review — October 24, 2026 (unpublished candidate)

Owner: `src/lib/privacy.ts` is the existing privacy disclosure; `PrivatePageBoundary` exposes it before connection sign-in. This review extends those owners and existing privacy tests. It creates no new auth/consent authority and grants no public activation. Primary sources below were opened on October24; provider policy pages can change. The app threat model owns the combined release decision.

| Primary source | Finding and consequence |
|---|---|
| [OpenAI App Developer Terms](https://openai.com/policies/developer-apps-terms/), updated Sept28,2026, introduction and §§1.3,2.3–2.4 | Development/operation of custom connectors and MCP integrations is in scope, not merely directory listing. HIPAA-defined PHI is prohibited. Other sensitive personal data requires user expectations, lawful consent and advance disclosure. OpenAI and the developer are independent parties, not automatically each other's processors. Private installation is not an exemption. |
| [OpenAI plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines), current retrieved version | PHI is restricted; other sensitive/special-category data must be necessary, consented and prominently disclosed. The older blanket interpretation that all consumer health data is prohibited in directory apps is not supported by this text. Keep the existing catalog-only directory scope; personal listing would require a separate review. |
| [Codex data controls](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan), current retrieved version, Terms/Data controls/FAQ | ChatGPT account terms and training controls apply. Plus/Pro content may improve models unless training is disabled; business defaults differ. Local MCP execution alone does not mean the model receives no data. Disclose the independent provider settings before sharing and let each user review their account controls. No mandatory training opt-out or operator verification of every user’s settings was found in these sources. |
| [HHS health-app scenarios](https://www.hhs.gov/sites/default/files/ocr-health-app-developer-scenarios-2-2016.pdf), February2016 | Direct consumer use without acting on behalf of a covered entity/BA differs from a provider-contracted service. This supports a conditional consumer-data analysis, not automatic certification of PharmaGuide or every payload. Sean confirmed direct-to-consumer adults-only operation with no healthcare organization supplying records and no BA contracts on October24. Provider/BA integrations remain outside this reviewed scope; consumer health information is not automatically HIPAA-defined PHI. |
| [WorkOS DPA](https://workos.com/legal/data-processing-addendum), June27,2023; [privacy policy](https://workos.com/legal/privacy), Oct20,2025 | DPA forms part of the service agreement and covers instructed processing/subprocessors. Our code sends verified UUID/email and authorization metadata, not health payloads, to WorkOS. Record applicable account agreement, subprocessors and identity deletion/retention handling. Do not treat a public DPA as evidence that all account obligations are complete. |
| [Supabase DPA](https://supabase.com/legal/customer-resources/data-processing-addendum), Aug1,2026; [HIPAA responsibilities](https://supabase.com/docs/guides/security/hipaa-compliance), current retrieved version | Supabase acts as processor; notices and explicit sensitive-data consent remain the customer's responsibilities. PHI requires a separate BAA and proper project configuration. Encryption is not a substitute. Verify account terms and processing locations; do not claim BAA coverage from using Supabase. |
| [Anthropic consumer health policy](https://www.anthropic.com/legal/consumer-health-data-privacy-policy), effective Jan12,2026; [commercial BAA scope](https://support.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers), current retrieved version | Consumer policy expressly describes user-connected third-party health applications and independent-controller processing. Commercial HIPAA coverage requires eligible services, accepted BAA and configuration; it is not automatic for consumer accounts. Claude remains a future client requiring its own lifecycle, account/data-control and consent review; no approval inferred from Codex testing. |
| [FTC HBNR guidance](https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0), current guidance incorporating July2024 amendments | A consumer-controlled identifiable health record with capacity for multiple sources can be covered; consumer inputs plus product/reference data make coverage a concrete issue here. Unauthorized disclosure can trigger notice without hacking. Individual notice is without unreasonable delay, within60 days; FTC timing differs below/above500 affected people, and500 affected residents in one jurisdiction can require media notice. Plan email plus another required notice channel and applicable substitute notice. Treat coverage as the operating assumption pending a documented determination, not as an exemption because HIPAA may not apply. |

Concrete corrections in this candidate: disclose durable connection lifetime and separate snapshot expiry; name Supabase/WorkOS/Vercel and the precise authorization data flow; distinguish chosen assistant providers from infrastructure processors; clarify external training settings; expose Privacy on private pages before sign-in; remove the unsupported universal72-hour user-notice promise in favor of incident-specific legal deadlines. This draft change to incident copy requires review as part of policy publication, not a claim of legal certification. Existing analytics exclusion remains enforced.

Scope and remaining activation evidence:

1. **Operating basis confirmed:** Sean confirmed direct-to-consumer adults-only service, without healthcare organizations supplying records or BA contracts. The reviewed Codex route is conditional on this consumer scope, necessary data, informed explicit sharing and the provider terms. It does not authorize HIPAA-defined PHI or certify legal compliance. No blanket ban on all consumer health data or mandatory provider exception was found. Claude remains outside this launch scope.
2. **Existing product owners:** the app owner is addressing WorkOS identity/authorization cleanup on account deletion. The website now says 18+ as directed, replacing the previous 13–17 parental-permission text. This is a policy change, not evidence of app age enforcement; the app owner must align its existing eligibility flow. Save already explains categories, server readability, expiry, assistant chat retention and withdrawal. Add a Privacy link and concise independent-provider training/settings notice to that same consent owner; automatic updates already explains selected categories, duration and new entries while using the app. Do not add a second consent authority or an operator check of every user's account settings.
3. **Standard provider terms:** WorkOS/Supabase use their applicable service and data-processing terms. This review does not assert bespoke agreements, BAA coverage, certifications, regular audits or universal SCC reliance. The app threat model owns the bounded HBNR incident procedure and remaining production/runtime receipts; public legal pages alone do not prove deployed behavior.
4. **Publication:** publish reviewed disclosure and corresponding app notice before public personal collection. Public personal access stays disabled until the existing security, two-account and production configuration gates pass. No additional blanket human/provider approval gate is inferred from the reviewed consumer-data policies.

Truthfulness corrections also remove unsupported universal GDPR/CCPA/COPPA compliance and security-audit claims; unavailable self-service JSON/export and analytics-toggle instructions; unconditional retention/deletion time promises; and the universal SCC statement. Retained existing rights contacts, actual clinician-PDF availability, account-deletion entry point, separate provider/back-up retention and the distinction between uninstalling and deleting an account. These changes make no new certification or deletion guarantee.

Verification: fail-first tests reproduced missing WorkOS/durable disclosure, unsupported policy claims and the previous age scope. Updated privacy suite11/11 passed; connector suite58/58, typecheck, focused ESLint and diff check passed for the disclosure batch. No deployment, secret change, public personal activation or main push in this S9 review. Source/security tests and private acceptance remain separate receipts from production readiness.

Account deletion race correction: the existing website standalone-login route checks the existing global revocation barrier before provisioning and rechecks it plus authoritative Supabase account existence afterward. If deleted/deleting, it refuses redirect and compensates by deleting only the WorkOS identity found by the verified external UUID. Identity mismatch, unavailable auth, provider failure and ambiguous completion fail closed. The new admin account-existence request rejects redirects and has a ten-second timeout; neither failure returns the hosted redirect. The SQL transaction lock cannot serialize a third-party HTTP request: a timed-out completion may finish after cleanup, leaving identity/authorization metadata requiring operator reconciliation by external UUID after the outstanding request settles. Never claim distributed erasure from this guard. Local deletion barriers/revoked grants still prevent health-data access. Tests cover preexisting/concurrent barriers, missing account, wrong provider identity, missing provider, failed cleanup, unavailable auth and timeout; no new queue or persistent request registry.

Linked-policy follow-up (October23 America/New_York; sources checked October24 UTC): the existing `src/lib/hipaa.ts` still contradicted the reviewed privacy owner. Removed unverified HIPAA-aligned/Security Rule parity, universal non-PHI classification, 72-hour notice, audit/training/access-log guarantees, universal 30-day deletion/DPA claims and future BAA/launch promises. Replaced them with Sean-confirmed adult direct-to-consumer/no-BA-contract scope, actual encryption/explicit-sharing controls and links to the existing privacy retention/rights/incident owner. Existing section IDs remain stable. HHS scenarios and FTC guidance above were reopened for this correction. Visible Privacy/Terms/HIPAA revision dates use October23 local date. Fail-first linked-policy regression reproduced the claims; privacy suite12/12, typecheck, focused ESLint and diff check pass. This corrects disclosures, not a certification or public personal activation.

## Documents

| Doc | Purpose |
|---|---|
| [00 — Master Plan](./00-master-plan.md) | This file. Index + overall status. |
| [01 — Design System](./01-design-system.md) | All tokens (color, type, spacing, motion). Reference. |
| [02 — Build Sequence](./02-build-sequence.md) | Sprint task list with `[ ]` / `[x]`. **Source of truth for progress.** |
| [03 — Content Spec](./03-content-spec.md) | All copy by section. Hero → Footer. |
| [04 — SEO Checklist](./04-seo-checklist.md) | Metadata, sitemap, structured data, GEO. |
| [05 — Performance Checklist](./05-performance-checklist.md) | Core Web Vitals, image, font, bundle. |
| [06 — Accessibility Checklist](./06-accessibility-checklist.md) | WCAG 2.1 AA targets. |
| [07 — Motion Spec](./07-motion-spec.md) | Animation philosophy + token usage. |
| [08 — Progress Log](./08-progress.md) | Live diary of what shipped + decisions. |
| [13 — Blog Topic Backlog](./13-blog-topic-backlog.md) | Ranked next posts, two a week, each paired with a carousel. |

## Phases

### Phase 0 — Foundation `(in progress)`
- [x] Project scaffolded (Next.js 16 + TypeScript + Tailwind + Framer Motion)
- [x] Design tokens defined in `globals.css`
- [x] TypeScript token mirror (`src/lib/tokens.ts`)
- [x] Site constants (`src/lib/site.ts`)
- [x] SEO infrastructure (sitemap, robots, manifest, metadata)
- [x] Token preview page (`/`)
- [x] **User approved design system** (with refinements: accent → #183B3F, surface-subtle → #F4F2EE, severity-safe → #3F6250)

### Phase 1 — Header
- [x] Floating glass pill header with smart show/hide on scroll
- [x] Mobile hamburger overlay (Esc + backdrop close, scroll-lock, focus return)
- [x] Skip-to-content link (already in layout)
- [x] CTA: "Request Access"
- [x] **User approved Phase 1**

### Phase 2 — Hero
- [x] Two-column layout (copy left, animated phone right)
- [x] Animated app UI loop (Framer Motion, ~7s cycle, no video)
- [x] CTA buttons + trust row + secondary "Why interactions matter ↓"
- [x] Phone mockup with subtle tilt + 6s float
- [x] Cursor-blink keyframe added to Tailwind config
- [x] PharmaGuide wordmark + accent dot inside the phone
- [x] "Good fit with timing adjustment" personalization moment
- [x] Pharmacist-mature interaction copy + accent halo depth
- [x] **User approved Phase 2**

### Phase 3 — Infrastructure Strip `(in progress)`
- [x] Subtle divider band with three platform claims
- [x] Mono uppercase eyebrow type, dot separators on tablet+
- [x] `whileInView` opacity fade
- [x] **User approved Phase 3** (with copy revision)

### Phase 4 — Problem
- [x] Headline + 3 supporting statements + italic-serif closing thesis
- [x] Three independent scroll-triggered groups
- [x] Two-tone statement hierarchy + ambient capsule depth
- [x] `id="problem"` wired to Hero secondary CTA
- [x] **User approved Phase 4** (with refinement pass)

### Phase 5 — Interaction Ladder
- [x] 5-tier interactive ladder (hover/tap to switch active tier)
- [x] Connected detail panel with cross-fade content swap
- [x] Per-tier shapes (triangle/circle/diamond/ring/square)
- [x] Per-tier mechanism + evidence grade + study count
- [x] **User approved Phase 5** (with interactive rebuild)

### Phase 6 — Real-Life Moments `(in progress)`
- [x] 4 expand-on-tap scenario cards (2x2 grid, 1 col mobile)
- [x] Per-card subtle gradients + ambient capsule decorations
- [x] Inline height accordion + Read more / Close affordances
- [x] Severity-color "Example flag" chips reinforce the tier system
- [ ] **User approves Phase 6** ← gating

### Phase 7 — Your Fit `(in progress)`
- [x] Renamed from "FitScore" (personal read is now qualitative)
- [x] Dual-assessment card (Quality numerical + Your Fit qualitative)
- [x] Italic-serif callback to Problem section's thesis
- [x] Count-up animation (0→89) + bar fill + reveal choreography
- [ ] **User approves Phase 7** ← gating

### Phase 8 — Trust Block `(in progress)`
- [x] 3 trust cards (italic-serif titles, body-sm descriptions)
- [x] 4 restraint cards ("What we don't do") with custom ✕ SVG
- [x] Pulsing severity-safe freshness signal at bottom
- [x] No ambient decoration — restraint is the message
- [ ] **User approves Phase 8** ← gating

### Phase 9 — Final CTA
- [ ] Email + optional supplements input form
- [ ] Disclaimer + business model trust note
- [ ] Social proof slot (designed, hidden until populated)

### Phase 10 — Footer
- [ ] 4-column grid (Brand · Product · Company · Legal)
- [ ] Badges row + city + email

### Phase 11 — Polish
- [ ] Mobile pass on every section
- [ ] Motion polish pass
- [ ] Accessibility audit
- [ ] Performance audit (Lighthouse 95+ targets)
- [ ] OG image generation
- [ ] Vercel deployment

## Current decisions (locked)

- **Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v3, Framer Motion 11
- **Fonts:** Geist Sans (UI/headlines), Newsreader (editorial display), Geist Mono (data)
- **Accent color:** Deep teal (`#183B3F`)
- **Severity colors:** Polished defaults — match Flutter app exactly later
- **Logo:** Typographic placeholder for V1
- **Images:** Placeholder URLs in `lib/site.ts` — swap when ready
- **Hosting:** Vercel (planned)

## Open decisions

- [ ] Brand domain confirmed? `pharmaguide.io` placeholder
- [ ] Final logo file (SVG)
- [ ] Real lifestyle photography sources (Stocksy budget? AI gen?)
- [ ] Email provider for waitlist (MailerLite proposed)
- [ ] Analytics setup (GA + Clarity IDs)

### October 23 real-account acceptance correction

App PR135 and website PR8 merged; both connector migrations applied with explicit approval. Public personal access remains disabled. Real Google sign-in succeeded; WorkOS complete returned200 with `/oauth2/external/callback`, which the website rejected. Added that exact observed path to the existing issuer-pinned allowlist; fail-first regression503vs200 now passes, including hostile-origin/userinfo/fragment negatives. Existing route remains the authorization owner; no new identity or clinical logic. All41 connector tests and private production build pass. Local browser now reaches actual WorkOS consent and installed Codex reports OAuth success. Heading clearance, review action, loading feedback and recovery copy improved locally; browser render checked. This correction is not yet merged/deployed.

Private test runtime initially used HTTP setup URL and hit the existing HTTPS guard; corrected harness configuration without changing that guard. Actual Codex now creates pending approval in hosted Supabase. Real-phone approval, read access, scoped snapshot/expiry and disconnect/reconnect acceptance remain pending; no completion claim.

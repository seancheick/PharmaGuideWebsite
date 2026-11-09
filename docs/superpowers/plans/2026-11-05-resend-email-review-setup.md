# Resend Email Review Setup Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Review specification compliance and correctness before completion.

**Goal:** Prepare the revised branded email program in Resend and connect website template sending behind a disabled switch, without sending or activating anything.

**Architecture:** Resend owns editable draft copy and native waiting automation. Website retains consent, signed preference links and duplicate-delivery safeguards. Its hosted-template connection stays off pending approval. One shared shell renders all templates. Existing contacts and topic preferences remain authoritative; catch-up is a draft only.

**Tech Stack:** Next.js, TypeScript, React Email, Resend API, Node test runner.

## Tasks

- [x] Add failing tests for hosted-template website preparation, including disabled legacy behavior, missing configuration, unsubscribe headers and stable retry payloads. Implement in src/lib/resend.ts, email-delivery.ts and env.ts with a separate helper if appropriate. No deployment or enabled configuration.
- [x] Render canonical revised copy from docs/16-email-research-and-revised-copy.md through the current email-layout.cjs. Preserve visual identity, add approved signature, inspect animated PNG asset for actual frames. No new marketing claims.
- [x] Build a guarded, repeatable setup command. Snapshot provider state privately, update/create nine draft templates, amend disabled waiting graph only if safe without publishing, and prepare catch-up/newsletter broadcast drafts. Never publish templates, send events/messages, schedule, activate, or alter subscriptions. If graph references require published templates, leave it disabled with the existing graph and document that dependency.
- [x] Refresh private contact and delivery evidence and preserve existing subscriptions. Prevent old contacts entering the waiting flow.
- [ ] Finalize a filtered send cohort in Resend after review; current three-segment plan is full, so both review broadcasts are held on an empty topic. No plan upgrade or audience restructuring authorized.
- [x] Read back provider content, status, variables and broadcast targeting. Save dashboard links and local preview index. Run email tests, typecheck, focused lint and diff review.
- [x] Independent review for spec compliance, accidental activation/sends and regressions. Fix findings, report exact remaining approval/deployment boundary.

## Execution result

Nine native template drafts and two broadcast drafts verified. Resend's three-segment limit prevents an additional frozen cohort: both broadcasts use a private opt-out-default empty review-hold topic; candidate lists remain private. The existing automation stays disabled; Resend rejected draft template references, so attaching the proposed graph awaits approved template publication. No templates published, events, sends, activation, subscription changes, plan upgrades or production deployment. Hosted website connection remains off. See docs/17-resend-review-handoff.md for the review links and remaining pre-send decisions.

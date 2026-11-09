const test = require("node:test");
const assert = require("node:assert/strict");
test("review setup cannot send, enroll, schedule, publish or enable", async () => {
  const { assertDraftRequest } = await import("../scripts/setup-email-review-v2.mjs");
  for (const [m, p, b] of [
    ["POST", "/emails", {}],
    ["POST", "/events/send", {}],
    ["POST", "/templates/a/publish", {}],
    ["PATCH", "/automations/a", { status: "enabled" }],
    ["POST", "/broadcasts/a/send", {}],
    ["POST", "/broadcasts", { scheduled_at: "tomorrow" }],
    ["PATCH", "/contacts/a", { unsubscribed: false }],
  ])
    assert.throws(() => assertDraftRequest(m, p, b));
  for (const [m, p, b] of [
    ["GET", "/templates"],
    ["POST", "/templates", {}],
    ["PATCH", "/templates/a", {}],
    ["PATCH", "/automations/a", { status: "disabled", steps: [] }],
    ["POST", "/segments", { name: "review" }],
    ["POST", "/contacts/a/segments/b", {}],
    ["POST", "/broadcasts", { send: false }],
  ])
    assert.doesNotThrow(() => assertDraftRequest(m, p, b));
});
test("catch-up eligibility respects consent, stage, suppression, recent sends and test exclusion", async () => {
  const { catchupEligible } = await import("../scripts/setup-email-review-v2.mjs");
  const c = {
    subscribed: true,
    waiting: true,
    betaStatus: "waiting",
    email: "person@domain.org",
    delivery: "unknown",
  };
  assert.equal(catchupEligible(c, [], Date.parse("2026-11-05T12:00:00Z")), true);
  for (const patch of [
    { subscribed: false },
    { waiting: false },
    { betaStatus: "invited" },
    { delivery: "hard_bounced" },
    { delivery: "complained" },
    { email: "person@example.com" },
  ])
    assert.equal(catchupEligible({ ...c, ...patch }, [], Date.now()), false);
  assert.equal(
    catchupEligible(
      c,
      [{ from: "Sean <hello@pharmaguide.io>", to: [c.email], created_at: "2026-11-04T12:00:00Z" }],
      Date.parse("2026-11-05T12:00:00Z")
    ),
    false
  );
});

test("newsletter review excludes catchup, active beta journey and recent duplicate resource sends", async () => {
  const { newsletterEligible, assertBroadcastTarget } =
    await import("../scripts/setup-email-review-v2.mjs");
  const c = {
    id: "a",
    email: "person@domain.org",
    subscribed: true,
    betaStatus: "not_beta",
    delivery: "unknown",
  };
  const now = Date.parse("2026-11-05T12:00:00Z");
  assert.equal(newsletterEligible(c, [], new Set(), now), true);
  assert.equal(newsletterEligible(c, [], new Set(["a"]), now), false);
  assert.equal(
    newsletterEligible(
      { ...c, sequenceStatus: "enrolled", betaStatus: "waiting" },
      [],
      new Set(),
      now
    ),
    false
  );
  const oldResource = [
    {
      from: "Sean <hello@pharmaguide.io>",
      to: [c.email],
      created_at: "2026-10-26T12:00:00Z",
      subject: "What if a supplement you take gets recalled?",
    },
  ];
  assert.equal(newsletterEligible(c, oldResource, new Set(), now), false);
  assert.throws(() =>
    assertBroadcastTarget(
      { segment_id: "wrong", topic_id: "t" },
      { segment_id: "s", topic_id: "t" }
    )
  );
  assert.doesNotThrow(() =>
    assertBroadcastTarget({ segment_id: "s", topic_id: "t" }, { segment_id: "s", topic_id: "t" })
  );
});

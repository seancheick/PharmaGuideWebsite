const test = require("node:test");
const assert = require("node:assert/strict");
test("existing signups get one cohort each, even when subscribed to both lists", async () => {
  const { classifySignups } = await import("../scripts/reconcile-email-audiences.mjs");
  const now = Date.parse("2026-11-05T12:00:00Z");
  const rows = [
    { id: "dual", email: "dual@domain.org", beta: true, newsletter: true, status: "waiting" },
    { id: "recent", email: "recent@domain.org", beta: true, status: "waiting" },
    { id: "news", email: "news@domain.org", newsletter: true },
    { id: "optout", email: "out@domain.org", beta: false, newsletter: false },
    { id: "test", email: "test@example.com", beta: true, status: "waiting" },
  ];
  const result = classifySignups(
    rows,
    [
      {
        from: "Sean <hello@pharmaguide.io>",
        to: ["recent@domain.org"],
        created_at: "2026-11-04T12:00:00Z",
      },
    ],
    now
  );
  assert.equal(result.rows.find((r) => r.id === "dual").cohort, "beta_catchup_ready");
  assert.equal(result.rows.find((r) => r.id === "recent").cohort, "beta_recent_wait");
  assert.equal(result.rows.find((r) => r.id === "news").cohort, "newsletter_only");
  assert.equal(result.rows.filter((r) => r.cohort === "excluded").length, 2);
  assert.equal(new Set(result.rows.map((r) => r.id)).size, 5);
  assert.deepEqual(result.queueIds, ["dual"]);
});
test("audience reorganization cannot change consent, send or activate", async () => {
  const { assertAudienceRequest } = await import("../scripts/reconcile-email-audiences.mjs");
  for (const [m, p, b] of [
    ["POST", "/emails", {}],
    ["POST", "/events/send", {}],
    ["PATCH", "/contacts/a", { unsubscribed: false }],
    ["PATCH", "/contacts/a/topics", {}],
    ["POST", "/templates/a/publish", {}],
    ["PATCH", "/automations/a", { status: "enabled" }],
  ])
    assert.throws(() => assertAudienceRequest(m, p, b));
  assert.doesNotThrow(() =>
    assertAudienceRequest("PATCH", "/contacts/a", {
      properties: { pg_review_cohort: "beta_catchup_ready" },
    })
  );
  assert.doesNotThrow(() => assertAudienceRequest("DELETE", "/contacts/a/segments/b"));
});
test("suppressed and opted-out stages are excluded and unknown stages need review", async () => {
  const { classifySignups } = await import("../scripts/reconcile-email-audiences.mjs");
  const rows = [
    {
      id: "s",
      email: "suppressed@domain.org",
      beta: true,
      status: "waiting",
      delivery: "suppressed",
    },
    { id: "u", email: "optout@domain.org", beta: true, status: "unsubscribed" },
    { id: "x", email: "unknown@domain.org", beta: true, status: "mystery" },
    { id: "a", email: "access@domain.org", beta: true, status: "access_confirmed" },
  ];
  const r = classifySignups(rows, []);
  assert.deepEqual(
    r.rows.map((x) => x.cohort),
    ["excluded", "excluded", "needs_review", "beta_access"]
  );
  assert.deepEqual(r.queueIds, []);
});
test("beta opt-out never removes an independent newsletter subscription", async () => {
  const { classifySignups } = await import("../scripts/reconcile-email-audiences.mjs");
  const result = classifySignups(
    [
      {
        id: "n",
        email: "newsletter@domain.org",
        beta: false,
        newsletter: true,
        status: "unsubscribed",
      },
      {
        id: "b",
        email: "beta-optout@domain.org",
        beta: true,
        newsletter: false,
        status: "unsubscribed",
      },
    ],
    []
  );
  assert.deepEqual(
    result.rows.map((r) => r.cohort),
    ["newsletter_only", "excluded"]
  );
  assert.deepEqual(result.queueIds, []);
});

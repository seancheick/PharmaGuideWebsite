const test = require("node:test");
const assert = require("node:assert/strict");

const {
  resolveShareSnapshotFromIndex,
  shareDispositionCopy,
  validateShareRequest,
} = require("../.tmp/share-test-build/src/lib/share-snapshot.js");

const request = {
  dsldId: "1038",
  catalogVersion: "2026.08.13.204005",
};

test("share request accepts only immutable catalog identity", () => {
  assert.deepEqual(validateShareRequest(request), { ok: true, value: request });

  const authored = validateShareRequest({
    ...request,
    productName: "Fabricated product",
    qualityScore: 100,
  });
  assert.equal(authored.ok, false);
});

test("share request rejects malformed catalog identities", () => {
  assert.equal(
    validateShareRequest({ dsldId: "abc", catalogVersion: request.catalogVersion }).ok,
    false
  );
  assert.equal(validateShareRequest({ dsldId: "1038", catalogVersion: "latest" }).ok, false);
});

test("canonical release preserves blocked disposition without a score", () => {
  const result = resolveShareSnapshotFromIndex(
    {
      schemaVersion: 1,
      catalogVersion: request.catalogVersion,
      products: {
        1038: {
          productName: "Blocked Product",
          brandName: "Example",
          catalogDisposition: "blocked",
          qualityScore: null,
          qualityTier: null,
          confidence: null,
          highlights: [],
        },
      },
    },
    request
  );

  assert.equal(result.ok, true);
  assert.equal(result.value.catalogDisposition, "blocked");
  assert.equal(result.value.qualityScore, null);
});

test("canonical release fails closed on version or disposition drift", () => {
  const wrongVersion = resolveShareSnapshotFromIndex(
    { schemaVersion: 1, catalogVersion: "2026.08.12.000000", products: {} },
    request
  );
  assert.equal(wrongVersion.ok, false);

  const invalidBlocked = resolveShareSnapshotFromIndex(
    {
      schemaVersion: 1,
      catalogVersion: request.catalogVersion,
      products: {
        1038: {
          productName: "Blocked Product",
          brandName: null,
          catalogDisposition: "blocked",
          qualityScore: 99,
          qualityTier: "excellent",
          confidence: null,
          highlights: [],
        },
      },
    },
    request
  );
  assert.equal(invalidBlocked.ok, false);
});

test("blocked public copy names a safety block, never incomplete label data", () => {
  const copy = shareDispositionCopy("blocked");
  assert.match(copy.title, /blocked/i);
  assert.match(copy.body, /safety/i);
  assert.doesNotMatch(`${copy.title} ${copy.body}`, /incomplete label/i);
});

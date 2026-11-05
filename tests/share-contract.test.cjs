const test = require("node:test");
const assert = require("node:assert/strict");

const {
  SHARE_INDEX_SCHEMA_VERSION,
  SHARE_INDEX_SHARD_PREFIX_LENGTH,
  resolveShareSnapshotFromIndex,
  shareIndexShardForDsldId,
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

test("share index uses the two-character release shard contract", () => {
  assert.equal(SHARE_INDEX_SCHEMA_VERSION, 3);
  assert.equal(SHARE_INDEX_SHARD_PREFIX_LENGTH, 2);
  assert.equal(shareIndexShardForDsldId("1038"), "0c");
});

test("canonical release preserves blocked disposition without a score", () => {
  const result = resolveShareSnapshotFromIndex(
    {
      schemaVersion: SHARE_INDEX_SCHEMA_VERSION,
      shardPrefixLength: SHARE_INDEX_SHARD_PREFIX_LENGTH,
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
    {
      schemaVersion: SHARE_INDEX_SCHEMA_VERSION,
      shardPrefixLength: SHARE_INDEX_SHARD_PREFIX_LENGTH,
      catalogVersion: "2026.08.12.000000",
      products: {},
    },
    request
  );
  assert.equal(wrongVersion.ok, false);

  const invalidBlocked = resolveShareSnapshotFromIndex(
    {
      schemaVersion: SHARE_INDEX_SCHEMA_VERSION,
      shardPrefixLength: SHARE_INDEX_SHARD_PREFIX_LENGTH,
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

test("canonical release rejects the obsolete one-character shard contract", () => {
  const result = resolveShareSnapshotFromIndex(
    {
      schemaVersion: 1,
      shardPrefixLength: 1,
      catalogVersion: request.catalogVersion,
      products: {},
    },
    request
  );

  assert.equal(result.ok, false);
});

test("blocked public copy names a safety block, never incomplete label data", () => {
  const copy = shareDispositionCopy("blocked");
  assert.match(copy.title, /blocked/i);
  assert.match(copy.body, /safety/i);
  assert.doesNotMatch(`${copy.title} ${copy.body}`, /incomplete label/i);
});

function indexEntry(schemaVersion, overrides = {}) {
  return {
    schemaVersion,
    shardPrefixLength: 2,
    catalogVersion: request.catalogVersion,
    products: {
      1038: {
        productName: "Unfinished assessment",
        brandName: "Example",
        catalogDisposition: "assessment_incomplete",
        qualityScore: null,
        qualityTier: null,
        confidence: null,
        highlights: ["Vegan"],
        ...overrides,
      },
    },
  };
}

test("v3 incomplete assessment shares label facts without a rating", () => {
  const result = resolveShareSnapshotFromIndex(indexEntry(3), request);
  assert.equal(result.ok, true);
  assert.equal(result.value.qualityScore, null);
  assert.equal(result.value.qualityTier, null);
  assert.equal(result.value.confidence, null);
  assert.deepEqual(result.value.highlights, ["Vegan"]);
  const copy = shareDispositionCopy(result.value.catalogDisposition);
  assert.equal(copy.title, "Rating not available");
  assert.match(copy.body, /assessment.*not.*complete/i);
  assert.doesNotMatch(JSON.stringify(copy), /label data|manufacturer|safe|safety issue/i);
});

test("incomplete assessment rejects scores, tiers and confidence", () => {
  for (const override of [
    { qualityScore: 80 },
    { qualityTier: "excellent" },
    { confidence: "Limited" },
  ]) {
    assert.equal(resolveShareSnapshotFromIndex(indexEntry(3, override), request).ok, false);
  }
});

test("legacy v2 scored and blocked releases remain readable; unknown versions fail closed", () => {
  for (const schemaVersion of [2, 3]) {
    for (const entry of [
      { catalogDisposition: "scored", qualityScore: 80, qualityTier: "excellent" },
      { catalogDisposition: "blocked", highlights: [] },
    ]) {
      assert.equal(
        resolveShareSnapshotFromIndex(indexEntry(schemaVersion, entry), request).ok,
        true
      );
    }
  }
  assert.equal(resolveShareSnapshotFromIndex(indexEntry(4), request).ok, false);
});

// Both existing renderers derive score visibility from the validated nullable
// fields, so incomplete assessments use their existing no-rating branches.
test("page and OG preserve the no-rating branch for incomplete snapshots", () => {
  const fs = require("node:fs");
  const page = fs.readFileSync("src/app/s/[code]/page.tsx", "utf8");
  const og = fs.readFileSync("src/app/s/[code]/opengraph-image.tsx", "utf8");
  assert.match(page, /const hasScore = snapshot\.qualityScore !== null && band !== undefined/);
  assert.match(page, /shareDispositionCopy\(snapshot\.catalogDisposition\)/);
  assert.match(page, /hasScore \? \(/);
  assert.match(og, /const hasScore = score !== null && band !== undefined/);
  assert.match(og, /hasScore \? \(/);
  assert.match(og, /No published quality score yet/);
});

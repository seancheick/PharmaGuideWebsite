const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");

function examples() {
  const exports = {};
  const source = fs.readFileSync("src/components/features/remaining-demo.ts", "utf8");
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    { exports }
  );
  return exports;
}

test("label example preserves disclosed amounts without inferring blend member doses", () => {
  const { LABEL_EXAMPLE } = examples();
  assert.equal(LABEL_EXAMPLE.active[0].amount, "200 mg");
  assert.equal(LABEL_EXAMPLE.active[1].amount, "100 mg");
  assert.equal(LABEL_EXAMPLE.blendAmount, "850 mg");
  assert.equal(LABEL_EXAMPLE.blend.length, 3);
  assert.ok(LABEL_EXAMPLE.blend.every((member) => typeof member === "string"));
});

test("profile and alert examples preserve the existing findings", () => {
  const { PROFILE_EXAMPLE, ALERT_EXAMPLES } = examples();
  assert.equal(PROFILE_EXAMPLE.tags.length, 4);
  assert.equal(PROFILE_EXAMPLE.findings.length, 4);
  assert.equal(PROFILE_EXAMPLE.findings[1].verdict, "Contraindicated · SSRI");
  assert.equal(ALERT_EXAMPLES.length, 2);
  assert.equal(ALERT_EXAMPLES[1].detail, "No score shown · reason and FDA source listed");
});

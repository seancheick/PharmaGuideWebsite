const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");

function load(relativePath) {
  const filename = require("node:path").resolve(relativePath);
  const exports = {};
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports,
    require: (specifier) => {
      const resolved = specifier.startsWith("@/")
        ? `src/${specifier.slice(2)}.ts`
        : require("node:path").resolve(require("node:path").dirname(filename), `${specifier}.ts`);
      return load(resolved);
    },
  });
  return exports;
}

test("phase timing gives the result most of the reading time", () => {
  const { demoPhaseAt, DEMO_DURATION, DEMO_PHASE_STARTS } = load(
    "src/components/features/stack-demo.ts"
  );
  assert.equal(demoPhaseAt(0), 0);
  assert.equal(demoPhaseAt(DEMO_PHASE_STARTS[1] - 1), 0);
  assert.equal(demoPhaseAt(DEMO_PHASE_STARTS[1]), 1);
  assert.equal(demoPhaseAt(DEMO_PHASE_STARTS[2]), 2);
  assert.equal(demoPhaseAt(DEMO_DURATION), 2);
  assert.ok(DEMO_DURATION - DEMO_PHASE_STARTS[2] >= 7000);
});

test("both scenarios reuse the homepage story and reference actual row ids", () => {
  const { STACK_SCENARIOS, scenarioItems } = load("src/components/features/stack-demo.ts");
  const { HERO_STORIES } = load("src/components/hero/stories.ts");
  assert.equal(STACK_SCENARIOS.length, 2);
  for (let index = 0; index < STACK_SCENARIOS.length; index += 1) {
    const story = STACK_SCENARIOS[index];
    assert.equal(story.id, HERO_STORIES[index].id);
    const items = scenarioItems(story);
    assert.equal(items.length, story.stack.length + 1);
    assert.equal(new Set(items.map((item) => item.id)).size, items.length);
    for (const itemId of story.linked) assert.ok(items.some((item) => item.id === itemId));
    assert.equal(story.finding.title, HERO_STORIES[index].finding.title);
  }
});

test("nutrient illustration totals come from the existing example, not a second calculation", () => {
  const { STACK_SCENARIOS } = load("src/components/features/stack-demo.ts");
  const finding = STACK_SCENARIOS[1].finding;
  assert.equal(finding.kind, "total");
  assert.equal(
    finding.sources.reduce((total, source) => total + source.amount, 0),
    finding.total
  );
  assert.ok(finding.limit < finding.total);
});

test("intake colors react only after the displayed total exceeds its upper limit", () => {
  const { nutrientFrame, NUTRIENT_METERS } = load("src/components/features/nutrient-demo.ts");
  const vitaminD = NUTRIENT_METERS[0];
  assert.equal(nutrientFrame(vitaminD, 0).amount, 0);
  assert.equal(nutrientFrame(vitaminD, 0).aboveLimit, false);
  assert.equal(nutrientFrame(vitaminD, 4000 / 6000).aboveLimit, false);
  assert.equal(nutrientFrame(vitaminD, 4001 / 6000).aboveLimit, true);
  assert.equal(nutrientFrame(vitaminD, 1).amount, 6000);
});

test("the fixed upper-limit marker and final example values remain consistent", () => {
  const { nutrientFrame, NUTRIENT_METERS } = load("src/components/features/nutrient-demo.ts");
  for (const meter of NUTRIENT_METERS) {
    const final = nutrientFrame(meter, 1);
    assert.equal(final.amount, meter.val);
    assert.equal(final.aboveLimit, meter.val > meter.ul);
    if (meter.val >= meter.ul) assert.equal(nutrientFrame(meter, meter.ul / meter.val).fill, 0.5);
    else assert.ok(final.fill < 0.5);
    assert.ok(final.fill <= 1);
  }
  assert.equal(nutrientFrame(NUTRIENT_METERS[3], 1).aboveLimit, false);
});

test("meter playback clamps progress without changing the reference limit", () => {
  const { nutrientFrame, NUTRIENT_METERS } = load("src/components/features/nutrient-demo.ts");
  const meter = NUTRIENT_METERS[1];
  assert.equal(nutrientFrame(meter, -1).amount, 0);
  assert.equal(nutrientFrame(meter, 2).amount, meter.val);
  assert.equal(meter.ul, 40);
});

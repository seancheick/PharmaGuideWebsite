const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(repoRoot, "src");
const sourceDefinition = path.join(srcRoot, "lib", "site.ts");

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(filePath);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [filePath] : [];
  });
}

// The public number is the size of NIH's Dietary Supplement Label Database,
// the catalog's source — not a count of PharmaGuide products (2026-10-01).
test("the label-source claim is NIH's 200,000+ and is single-sourced", () => {
  const definition = fs.readFileSync(sourceDefinition, "utf8");
  assert.match(definition, /SOURCE_LABEL_COUNT\s*=\s*["']200,000\+["']/);

  const others = sourceFiles(srcRoot).filter((filePath) => filePath !== sourceDefinition);
  const duplicates = others
    .filter((filePath) => fs.readFileSync(filePath, "utf8").includes("200,000+"))
    .map((filePath) => path.relative(repoRoot, filePath));
  assert.deepEqual(duplicates, []);
});

test("no page claims a 180,000+ product catalog", () => {
  const offenders = sourceFiles(srcRoot)
    .filter((filePath) => filePath !== sourceDefinition)
    .filter((filePath) => fs.readFileSync(filePath, "utf8").includes("180,000"))
    .map((filePath) => path.relative(repoRoot, filePath));
  assert.deepEqual(offenders, []);
});

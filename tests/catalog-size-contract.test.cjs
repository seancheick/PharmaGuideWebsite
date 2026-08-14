const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(repoRoot, "src");
const catalogSource = path.join(srcRoot, "lib", "site.ts");

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(filePath);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [filePath] : [];
  });
}

test("the launch catalog claim remains 180,000+ and is single-sourced", () => {
  const catalogDefinition = fs.readFileSync(catalogSource, "utf8");
  assert.match(catalogDefinition, /CATALOG_SIZE\s*=\s*["']180,000\+["']/);

  const duplicateClaims = sourceFiles(srcRoot)
    .filter((filePath) => filePath !== catalogSource)
    .filter((filePath) => fs.readFileSync(filePath, "utf8").includes("180,000+"))
    .map((filePath) => path.relative(repoRoot, filePath));

  assert.deepEqual(duplicateClaims, []);
});

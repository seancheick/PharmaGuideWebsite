const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const { unstable_getResponseFromNextConfig, getRewrittenUrl } = require("next/experimental/testing/server");

const context = { exports: {}, require, process, URL, __dirname: process.cwd() };
vm.runInNewContext(ts.transpileModule(fs.readFileSync("next.config.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText, context);
const nextConfig = context.exports.default;
const response = (url) => unstable_getResponseFromNextConfig({ url, nextConfig });

test("public MCP hostname proxies both documented entry points to the catalog owner", async () => {
  for (const path of ["/", "/public"]) {
    const result = await response(`https://mcp.pharmaguide.io${path}`);
    assert.equal(getRewrittenUrl(result), "https://omayamxacvacrnvdvzhr.supabase.co/functions/v1/mcp-public");
  }
  assert.ok((await nextConfig.rewrites()).beforeFiles.length > 0, "root must override the marketing homepage");
});

test("private paths and unrelated hosts cannot reach the public proxy", async () => {
  for (const url of [
    "https://mcp.pharmaguide.io/personal",
    "https://mcp.pharmaguide.io/public/personal",
    "https://pharmaguide.io/",
    "https://pharmaguide.io/public",
    "https://mcpXpharmaguideYio/public",
  ]) assert.equal(getRewrittenUrl(await response(url)), null, url);
});

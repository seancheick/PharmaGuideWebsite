import assert from "node:assert/strict";
import fs from "node:fs/promises";

const routes = ["/email/unsubscribe", "/email/beta-interest", "/api/email-events"];

if (process.argv.includes("--build")) {
  const manifest = JSON.parse(await fs.readFile(".next/server/app-paths-manifest.json", "utf8"));
  for (const route of routes) assert.ok(manifest[`${route}/route`], `Email route missing from build: ${route}`);
  console.log("All three email routes are present in the build. No email sent.");
} else {
  const base = process.argv[2];
  if (!base) throw new Error("Use --build or provide a preview URL. This check uses GET only.");
  const origin = new URL(base);
  assert.ok(["http:", "https:"].includes(origin.protocol));
  for (const route of routes) {
    const response = await fetch(new URL(route, origin), { redirect: "manual", signal: AbortSignal.timeout(15000) });
    const expected = route === "/api/email-events" ? 405 : 400;
    assert.equal(response.status, expected, `${route}: expected controlled ${expected}, received ${response.status}`);
    if (expected === 400) {
      assert.match(response.headers.get("cache-control") ?? "", /no-store/);
      assert.equal(response.headers.get("referrer-policy"), "no-referrer");
      assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
    }
    console.log(`${route}: ${response.status}`);
  }
  console.log("Email routes respond correctly. No messages, preferences or answers were changed.");
}

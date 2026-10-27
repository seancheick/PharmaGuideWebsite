#!/usr/bin/env node
/**
 * Record a PharmD sign-off and move a reviewed draft live.
 *
 *   pnpm blog:approve <slug> --reviewer laurie-pham --date 2026-10-27
 *
 * Takes content/blog/.drafts/<slug>.mdx (a new post, or the reviewed
 * version of an existing one), writes `reviewer` and `reviewed_at` into its
 * frontmatter and runs `blog:publish-check` on it as content/blog/<slug>.mdx.
 * Only if that passes is the draft removed; otherwise everything is rolled
 * back and nothing is published. The date is required and never defaulted: it is the
 * day the reviewer signed off on this exact version, and the page shows it.
 * Recall digests (format: recall-digest) are team-checked, not clinically
 * reviewed: `pnpm blog:approve <slug>` with no reviewer or date publishes
 * them unchanged after the same publish-check.
 * Nothing is committed or pushed; a push to main deploys production.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG = path.join(ROOT, "content", "blog");

const [slug, ...rest] = process.argv.slice(2);
const opt = (name) => {
  const i = rest.indexOf(name);
  return i >= 0 ? rest[i + 1] : undefined;
};
const reviewer = opt("--reviewer");
const date = opt("--date");
const usage = "Usage: pnpm blog:approve <slug> --reviewer <PersonId> --date <YYYY-MM-DD of the sign-off>\n       pnpm blog:approve <recall-digest slug>   (team-checked, no reviewer)";
if (!slug) {
  console.error(usage);
  process.exit(2);
}

const draft = path.join(BLOG, ".drafts", `${slug}.mdx`);
const live = path.join(BLOG, `${slug}.mdx`);
if (!fs.existsSync(draft)) {
  console.error(`No draft at ${path.relative(ROOT, draft)}. Approve the reviewed draft, not the live file.`);
  process.exit(2);
}

const src = fs.readFileSync(draft, "utf8");
const m = /^---\n([\s\S]*?)\n---\n/.exec(src);
if (!m) {
  console.error("Draft has no YAML frontmatter.");
  process.exit(2);
}
const recallDigest = /^format:\s*["']?recall-digest["']?\s*$/m.test(m[1]);
if (recallDigest ? reviewer || date : !reviewer || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) {
  console.error(recallDigest ? "Recall digests are team-checked: approve them without --reviewer or --date." : usage);
  process.exit(2);
}
const head = recallDigest
  ? m[1]
  : m[1]
      .split("\n")
      .filter((line) => !/^(reviewer|reviewed_at):/.test(line))
      .concat([`reviewer: "${reviewer}"`, `reviewed_at: "${date}"`])
      .join("\n");
const replacing = fs.existsSync(live);
const previous = replacing ? fs.readFileSync(live, "utf8") : null;
fs.writeFileSync(live, `---\n${head}\n---\n${src.slice(m[0].length)}`);

const check = spawnSync(process.execPath, [path.join(ROOT, "scripts", "validate-blog.mjs"), slug, "--publish-check"], {
  stdio: "inherit",
});
if (check.status !== 0) {
  // Roll back: the live post stays as it was and the draft stays a draft.
  if (previous !== null) fs.writeFileSync(live, previous);
  else fs.rmSync(live);
  console.error(`\npublish-check failed; nothing was published. The draft is still at content/blog/.drafts/${slug}.mdx.`);
  process.exit(1);
}
fs.rmSync(draft);
console.log(`\n${replacing ? "Replaced" : "Published to"} content/blog/${slug}.mdx (${recallDigest ? "team-checked recall digest" : `reviewer ${reviewer}, reviewed_at ${date}`}). Ready to commit; a push to main deploys production.`);

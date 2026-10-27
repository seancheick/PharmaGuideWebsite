#!/usr/bin/env node
/**
 * Review gate for the publication path: every post in content/blog/ (the
 * folder the site loads) must carry a completed clinical review record —
 * review_required: true, reviewer and reviewed_at. Recall digests are the
 * exception: team-checked restatements of FDA notices with review_required:
 * false and no reviewer (Sean, 2026-10-27). Offline and fast, so it
 * can run in CI and before `next build`. Drafts in content/blog/.drafts/ are
 * not checked: the site doesn't load them.
 *
 *   pnpm blog:check-reviews
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

// Live posts whose review record is being completed (Sean, 2026-10-27:
// Laurie's sign-off dates to follow). Pinned to the file's exact content:
// any edit to the post ends the exception, so a changed post can't ship on
// it. Printed on every run; never shown on the site. Delete an entry once
// reviewer + reviewed_at are recorded.
const PENDING = {
  "statins-and-coq10.mdx": {
    sha256: "d5a182d30a95d2171c2a6edbf3dfa72e4a2d73a7c6e7b73a80cf39abc5ff6bd9",
    note: "reviewer recorded; reviewed_at date to come from Laurie",
  },
  "glp1-supplements-nutrient-gaps.mdx": {
    sha256: "bfd8d9a93b379311bbe0c7c653b5a72e85509ae501b6adef3d0bc1a3cc6e0905",
    note: "reviewer and reviewed_at to come from Laurie (live text includes the 2026-10-27 protein corrections)",
  },
};

const BLOG = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), "content", "blog");

const problems = [];
const pending = [];
for (const file of fs.readdirSync(BLOG).filter((f) => f.endsWith(".mdx"))) {
  const raw = fs.readFileSync(path.join(BLOG, file), "utf8");
  const { data } = matter(raw);
  if (data.format === "recall-digest") {
    if (data.review_required !== false || data.reviewer || data.reviewed_at) {
      problems.push(`${file}: recall digests need review_required: false and no reviewer/reviewed_at`);
    }
    continue;
  }
  const missing = [
    data.review_required !== true && "review_required: true",
    !data.reviewer && "reviewer",
    !data.reviewed_at && "reviewed_at",
  ].filter(Boolean);
  if (!missing.length) continue;
  const exception = PENDING[file];
  const sha = crypto.createHash("sha256").update(raw).digest("hex");
  if (exception && exception.sha256 === sha) pending.push(`${file}: ${exception.note}`);
  else problems.push(`${file}: missing ${missing.join(", ")}${exception ? " (pending exception no longer applies: the post changed)" : ""}`);
}

if (pending.length) {
  console.warn(`PENDING review records (allowed while unchanged; complete them):\n  ${pending.join("\n  ")}\n`);
}

if (problems.length) {
  console.error(`Posts without a completed review record (they would be published):\n  ${problems.join("\n  ")}`);
  console.error(`\nNew or updated posts belong in content/blog/.drafts/ until reviewed; then run pnpm blog:approve <slug> --reviewer <id> --date <sign-off date>.`);
  process.exit(1);
}
console.log(pending.length ? `Gate passed with ${pending.length} pending exception(s) listed above.` : "Every published post has a completed review record.");

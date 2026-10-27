#!/usr/bin/env node
/**
 * Blog catalog — what the site already covers, generated from the posts
 * themselves (nothing to maintain by hand). /pg-blog-mdx reads it before
 * deciding to create, update, combine or decline a topic, and to find
 * link opportunities in both directions.
 *
 *   pnpm blog:catalog          — readable summary
 *   pnpm blog:catalog --json   — machine-readable
 *
 * Per post: title, category, dates, review record, tags, the questions
 * its headings answer, teaching figures used, and internal links out and in.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { figureComponents } from "./lib/figure-registry.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = path.join(ROOT, "content", "blog");
const FIGURES = figureComponents(ROOT);

const posts = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith(".mdx"))
  .map((file) => {
    const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
    const slug = data.slug ?? file.replace(/\.mdx$/, "");
    return {
      slug,
      title: data.title,
      category: data.category,
      date: data.date,
      updated: data.updated_at ?? null,
      reviewer: data.reviewer ?? null,
      reviewedAt: data.reviewed_at ?? null,
      tags: data.tags ?? [],
      questions: [...content.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1].trim()),
      figures: FIGURES.filter((name) => new RegExp(`<${name}\\b`).test(content)),
      linksOut: [...new Set([...content.matchAll(/\]\((\/blog\/[^)#\s]+)/g)].map((m) => m[1].replace(/\/$/, "").slice(6)))],
    };
  });

for (const p of posts) p.linksIn = posts.filter((q) => q.linksOut.includes(p.slug)).map((q) => q.slug);
posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(posts, null, 2));
} else {
  for (const p of posts) {
    console.log(`\n## ${p.slug} — ${p.title}`);
    console.log(`category ${p.category} · published ${p.date}${p.updated ? ` · updated ${p.updated}` : ""}`);
    console.log(`review: ${p.reviewer ? `${p.reviewer} on ${p.reviewedAt ?? "NO DATE"}` : "NO REVIEWER RECORDED"}`);
    console.log(`tags: ${p.tags.join(", ")}`);
    if (p.figures.length) console.log(`figures: ${p.figures.join(", ")}`);
    console.log(`links out: ${p.linksOut.join(", ") || "none"} · links in: ${p.linksIn.join(", ") || "none"}`);
    console.log(`answers:\n${p.questions.map((q) => `  - ${q}`).join("\n")}`);
  }
}

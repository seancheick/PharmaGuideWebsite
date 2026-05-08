#!/usr/bin/env node
/**
 * Blog CLI — manage which post is the Editor's Pick on /blog.
 *
 * The "featured: true" frontmatter flag determines which post becomes the
 * big Editor's Pick card at the top of the /blog hub. Only ONE post should
 * have featured: true at a time. This script enforces that automatically.
 *
 * Usage:
 *   pnpm blog:list                       — show every post + which is featured
 *   pnpm blog:feature <slug>             — set a new featured post (auto-unsets others)
 *   pnpm blog:feature                    — show usage
 *
 * Examples:
 *   pnpm blog:list
 *   pnpm blog:feature statins-and-coq10
 *   pnpm blog:feature medication-depletion-guide
 *
 * Why a script (vs editing the .mdx file by hand):
 *   • Manual edits are error-prone — you can forget to unset the previous
 *     featured post and end up with two, which means the wrong one wins.
 *   • The script reads every post, makes the change atomically, and tells
 *     you exactly what changed.
 *   • One command to remember (`pnpm blog:feature <slug>`) instead of
 *     opening files, finding lines, fixing both.
 *
 * After running, commit + push:
 *   git add content/blog/*.mdx
 *   git commit -m "feature: set <slug> as Editor's Pick"
 *   git push
 *
 * Vercel ISR rolls the change to production within the 5-day revalidation
 * window. To make it live immediately, redeploy from the Vercel dashboard.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

// ANSI color helpers — keeps the CLI output readable
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  accent: "\x1b[38;5;30m", // approximate teal
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BLOG_DIR = path.join(__dirname, "..", "content", "blog");

// ─── Read all posts ──────────────────────────────────────────────────

function readPosts() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`${c.red}Blog dir not found:${c.reset} ${BLOG_DIR}`);
    process.exit(1);
  }
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .sort();
  return files.map((filename) => {
    const filePath = path.join(BLOG_DIR, filename);
    const source = fs.readFileSync(filePath, "utf8");
    const { data } = matter(source);
    const slug =
      data.slug ?? filename.replace(/\.mdx?$/, "").replace(/^\d+-/, "");
    return {
      filename,
      filePath,
      source,
      slug,
      title: data.title ?? "Untitled",
      date: data.date ?? "—",
      category: data.category ?? "—",
      featured: Boolean(data.featured),
    };
  });
}

// ─── Commands ────────────────────────────────────────────────────────

function cmdList() {
  const posts = readPosts();
  if (posts.length === 0) {
    console.log(`${c.dim}No posts yet.${c.reset} Add an .mdx file to ${BLOG_DIR}`);
    return;
  }
  // Sort by date desc for display
  posts.sort((a, b) => b.date.localeCompare(a.date));

  console.log(`\n${c.bold}PharmaGuide blog — ${posts.length} post${posts.length === 1 ? "" : "s"}${c.reset}\n`);
  console.log(
    `  ${c.dim}status   date         category               slug${c.reset}`
  );
  console.log(
    `  ${c.dim}──────   ──────────   ─────────────────────  ────────────────${c.reset}`
  );

  for (const p of posts) {
    const star = p.featured ? `${c.accent}● FEATURED${c.reset}` : `${c.dim}  draft  ${c.reset}`;
    const date = p.date.padEnd(10);
    const cat = p.category.padEnd(22);
    const slug = `${c.cyan}${p.slug}${c.reset}`;
    console.log(`  ${star}   ${date}   ${cat} ${slug}`);
    console.log(`             ${c.dim}${p.title}${c.reset}\n`);
  }

  const featuredCount = posts.filter((p) => p.featured).length;
  if (featuredCount === 0) {
    console.log(
      `${c.yellow}⚠ No post has featured: true.${c.reset} The hub will fall back to the most recent post.\n` +
        `  Run: ${c.bold}pnpm blog:feature <slug>${c.reset} to set one.\n`
    );
  } else if (featuredCount > 1) {
    console.log(
      `${c.red}⚠ Multiple posts have featured: true.${c.reset} The hub will pick one arbitrarily.\n` +
        `  Run: ${c.bold}pnpm blog:feature <slug>${c.reset} to fix.\n`
    );
  } else {
    console.log(
      `${c.green}✓${c.reset} ${c.dim}Editor's Pick is set correctly.${c.reset}\n`
    );
  }
}

function cmdFeature(slug) {
  if (!slug) {
    console.error(
      `${c.red}Missing slug.${c.reset}\n\nUsage: ${c.bold}pnpm blog:feature <slug>${c.reset}\n\nRun ${c.bold}pnpm blog:list${c.reset} to see all posts.`
    );
    process.exit(1);
  }

  const posts = readPosts();
  const target = posts.find((p) => p.slug === slug);
  if (!target) {
    console.error(`${c.red}Post not found:${c.reset} ${slug}`);
    console.error(`\nAvailable slugs:`);
    for (const p of posts) console.error(`  · ${p.slug}`);
    process.exit(1);
  }

  if (target.featured && posts.filter((p) => p.featured).length === 1) {
    console.log(
      `${c.green}✓${c.reset} ${c.bold}${slug}${c.reset} is already the featured post. Nothing to do.`
    );
    return;
  }

  // Apply the change: target → featured: true, all others → false
  let changed = 0;
  for (const p of posts) {
    const shouldBeFeatured = p.slug === slug;
    if (p.featured === shouldBeFeatured) continue;

    const { data, content } = matter(p.source);
    const newData = { ...data, featured: shouldBeFeatured };
    const newSource = matter.stringify(content, newData, {
      // Preserve a stable frontmatter ordering — gray-matter doesn't
      // guarantee key order, but YAML round-trips cleanly enough for
      // our needs. Diffs will be small.
    });
    fs.writeFileSync(p.filePath, newSource, "utf8");
    changed++;

    if (shouldBeFeatured) {
      console.log(
        `${c.green}+ featured${c.reset}  ${c.bold}${p.slug}${c.reset}\n  ${c.dim}${p.title}${c.reset}`
      );
    } else {
      console.log(
        `${c.dim}- unfeatured ${p.slug}${c.reset}`
      );
    }
  }

  if (changed === 0) {
    console.log(
      `${c.yellow}No changes needed.${c.reset} The frontmatter already matches the desired state.`
    );
    return;
  }

  console.log(
    `\n${c.green}✓ Done.${c.reset} ${changed} file${changed === 1 ? "" : "s"} updated.\n` +
      `\nNext:\n` +
      `  ${c.dim}1.${c.reset} Verify with ${c.bold}pnpm blog:list${c.reset}\n` +
      `  ${c.dim}2.${c.reset} Commit + push:\n` +
      `       git add content/blog\n` +
      `       git commit -m "feature: set ${slug} as Editor's Pick"\n` +
      `       git push\n` +
      `  ${c.dim}3.${c.reset} Vercel ISR rolls the change to production within 5 days,\n` +
      `     or trigger an immediate redeploy from the Vercel dashboard.\n`
  );
}

function cmdHelp() {
  console.log(`
${c.bold}PharmaGuide blog CLI${c.reset}

${c.dim}Manage which post is the Editor's Pick on /blog.${c.reset}

${c.bold}Commands:${c.reset}
  ${c.cyan}pnpm blog:list${c.reset}                   List all posts + show which is featured
  ${c.cyan}pnpm blog:feature <slug>${c.reset}         Set a post as the Editor's Pick

${c.bold}Examples:${c.reset}
  pnpm blog:list
  pnpm blog:feature statins-and-coq10
  pnpm blog:feature medication-depletion-guide

${c.dim}After changing the featured post, commit + push to deploy:${c.reset}
  ${c.dim}git add content/blog && git commit -m "feature: ..." && git push${c.reset}
`);
}

// ─── Entry ───────────────────────────────────────────────────────────

const cmd = process.argv[2];
const arg = process.argv[3];

switch (cmd) {
  case "list":
    cmdList();
    break;
  case "feature":
    cmdFeature(arg);
    break;
  case undefined:
  case "help":
  case "--help":
  case "-h":
    cmdHelp();
    break;
  default:
    console.error(`${c.red}Unknown command:${c.reset} ${cmd}\n`);
    cmdHelp();
    process.exit(1);
}

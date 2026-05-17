#!/usr/bin/env node
/**
 * Blog validator — structural, clinical-governance, and URL checks for
 * PharmaGuide blog posts. Two modes:
 *
 *   pnpm blog:validate <slug>             — daily validity check (exits 0
 *                                           on pass, prints warnings)
 *   pnpm blog:publish-check <slug>        — stricter ship gate (also fails
 *                                           on missing reviewer, high-risk
 *                                           score, unaccepted URL warnings)
 *
 * Flags:
 *   --publish-check                       — enable publish-check mode
 *   --accept-warnings                     — under publish-check, treat URL
 *                                           non-authoritative warnings as ok
 *   --skip-url                            — skip URL fetch checks (offline)
 *
 * Exit codes:
 *   0  — all checks passed (warnings may print)
 *   1  — one or more failures
 *   2  — usage error
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "content", "blog");
const PUBLIC_BLOG_DIR = path.join(ROOT, "public", "blog");

// ─── Configuration ───────────────────────────────────────────────────

const CATEGORY_IDS = [
  "health-education",
  "ingredient-spotlights",
  "interactions-stacks",
  "news-research",
  "safety-alerts",
];

// Minimum word counts per category — chosen to match the category guide
// length ranges and the actual style of published posts on the new site.
// Health-education at 1,400 (was 1,600) so a tight depletion-style post can
// pass without padding; ingredient-deep-dive posts still demand depth.
const CATEGORY_MIN_WORDS = {
  "health-education": 1400,
  "ingredient-spotlights": 1900,
  "interactions-stacks": 1400,
  "safety-alerts": 700,
  "news-research": 1100,
};

const HIGH_RISK_CATEGORIES = new Set([
  "interactions-stacks",
  "safety-alerts",
]);

const ALLOWED_MDX_COMPONENTS = new Set([
  "Callout",
  "EvidencePill",
  "Source",
  "PostImage",
  "Illustration",
]);

// Banned marketing words (from docs/03-content-spec.md + master prompt v3.2)
const BANNED_MARKETING_WORDS = [
  "AI-powered",
  "AI-driven",
  "revolutionary",
  "game-changing",
  "game-changer",
  "cutting-edge",
  "seamless",
  "frictionless",
  "empower",
  "empowering",
  "best-in-class",
  "world-class",
  "synergy",
  "synergistic",
  "delve",
  "nuanced",
  "multifaceted",
  "paradigm",
  "robust",
  "tapestry",
  "pivotal",
  "leverage",
  "utilize",
  "facilitate",
  "streamline",
  "groundbreaking",
  "miracle",
  "superfood",
  "magic bullet",
  "cure-all",
  "unlock the power of",
  "take your health to the next level",
  // Note: academic connectives ("furthermore", "moreover", "additionally",
  // "in conclusion") are surfaced as readability warnings instead of hard
  // failures — see checkReadability().
];

// Banned medical-advice phrases (Governance §2) — strict literal matches.
// Phrases that need ingestion-context disambiguation are checked in
// checkMedicalAdviceContextual() below ("you should take", etc.).
const BANNED_MEDICAL_ADVICE = [
  "safe for everyone",
  "completely safe",
  "no side effects",
  "guaranteed to",
  "guaranteed results",
  "prevents disease",
  "replaces medication",
  "instead of your prescription",
  "natural alternative to",
  "doctors recommend",
  "studies prove",
];

// "you should take" and variants are only banned in *ingestion context*.
// "You should take 200 mg of magnesium" → flag.
// "What you should take away from this study" → don't flag.
// Match the verb phrase, then look ahead ~50 chars for an ingestion marker.
const ADVICE_VERB_PATTERNS = [
  /\byou\s+should\s+take\b/gi,
  /\byou\s+need\s+to\s+take\b/gi,
  /\byou\s+must\s+take\b/gi,
  /\byou\s+should\s+be\s+taking\b/gi,
];

const INGESTION_MARKERS =
  /(?:\b(?:supplement|vitamin|mineral|coq10|coenzyme|magnesium|b12|b6|folate|iron|calcium|zinc|selenium|omega|fish oil|creatine|statin|pill|tablet|capsule|gummy|drug|medication|prescription|dose|dosage|daily)\b|\d+\s*(?:mg|mcg|µg|iu|grams?|ml))/i;

// "cures" needs disambiguation too — "cures" the verb (medical claim) vs
// "cures" as plural noun ("there are no proven cures yet" is fine framing).
// Look for verb-form context: it follows a subject pronoun or noun.
const CURES_PATTERN = /\b(?:it|this|that|x|y|product|supplement|herb|compound|extract)\s+cures\b/gi;

// Brand-recommendation guards
const BANNED_BRAND_PHRASES = [
  "buy this brand",
  "we recommend",
  "our top pick",
  "the best supplement",
  "the best brand",
  "go with brand",
  "choose brand",
];

// Unsupported superlatives — only flagged if NOT preceded by a citation
const SUPERLATIVE_PHRASES = [
  "the best",
  "the safest",
  "the most effective",
];

// Authoritative clinical-content domains (rule 16)
const AUTHORITATIVE_DOMAINS = [
  // Government health agencies
  "nih.gov",
  "ncbi.nlm.nih.gov",
  "pubmed.ncbi.nlm.nih.gov",
  "pmc.ncbi.nlm.nih.gov",
  "ods.od.nih.gov",
  "fda.gov",
  "dailymed.nlm.nih.gov",
  "cdc.gov",
  "who.int",
  "nice.org.uk",
  // Peer-reviewed journals
  "nejm.org",
  "thelancet.com",
  "jamanetwork.com",
  "bmj.com",
  "cochranelibrary.com",
  "amjmed.com",
  "nature.com",
  "sciencedirect.com",
  "wiley.com",
  "springer.com",
  "academic.oup.com",
  // Clinical professional societies
  "nutritioncare.org",     // ASPEN
  "heart.org",             // AHA
  "diabetes.org",          // ADA
  "endocrine.org",         // Endocrine Society
  "eatright.org",          // Academy of Nutrition and Dietetics
  "aafp.org",              // American Academy of Family Physicians
  "acponline.org",         // American College of Physicians
  "mayoclinic.org",
  "clevelandclinic.org",
  "uptodate.com",
];

const FAKE_CLINICAL_ASSET_PATTERNS = [
  /doctor/i,
  /pharmacist/i,
  /stethoscope/i,
  /lab[-_]?coat/i,
  /pill[s]?(?![-_]?on[-_]?counter)/i,
  /supplement[-_]?bottle/i,
  /medication[-_]?label/i,
];

// ─── Helpers ─────────────────────────────────────────────────────────

function color(c, s) {
  const codes = { red: 31, yellow: 33, green: 32, gray: 90, bold: 1 };
  return `\x1b[${codes[c]}m${s}\x1b[0m`;
}

function fail(msg) {
  return { kind: "fail", msg };
}
function warn(msg) {
  return { kind: "warn", msg };
}

function findAll(str, pattern) {
  const results = [];
  const re = pattern.global ? pattern : new RegExp(pattern.source, pattern.flags + "g");
  let m;
  while ((m = re.exec(str)) !== null) {
    results.push({ match: m[0], index: m.index, groups: m });
  }
  return results;
}

function wordCount(content) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

function firstNWords(content, n) {
  return content.trim().split(/\s+/).slice(0, n).join(" ");
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function isAuthoritative(domain) {
  if (!domain) return false;
  return AUTHORITATIVE_DOMAINS.some(
    (d) => domain === d || domain.endsWith("." + d)
  );
}

async function fetchHead(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "PharmaGuide-Blog-Validator/1.0" },
    });
    // Some servers reject HEAD; retry GET if 405.
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "PharmaGuide-Blog-Validator/1.0" },
      });
    }
    clearTimeout(timer);
    return { ok: res.ok, status: res.status };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, status: 0, error: err.message || String(err) };
  }
}

// ─── Check primitives ────────────────────────────────────────────────

function checkFrontmatter(data) {
  const issues = [];
  const required = ["title", "description", "category", "date", "author"];
  for (const field of required) {
    if (!data[field] || typeof data[field] !== "string") {
      issues.push(fail(`frontmatter missing required field: ${field}`));
    }
  }
  if (data.category && !CATEGORY_IDS.includes(data.category)) {
    issues.push(
      fail(
        `category "${data.category}" is not one of: ${CATEGORY_IDS.join(", ")}`
      )
    );
  }
  return issues;
}

function checkMdxComponents(content) {
  const issues = [];
  const tagPattern = /<([A-Z][A-Za-z0-9]*)\b/g;
  let m;
  while ((m = tagPattern.exec(content)) !== null) {
    if (!ALLOWED_MDX_COMPONENTS.has(m[1])) {
      issues.push(
        fail(
          `disallowed MDX component <${m[1]}> — only ${[...ALLOWED_MDX_COMPONENTS].join(", ")} are permitted`
        )
      );
    }
  }
  return issues;
}

function checkPostImageFiles(content, slug) {
  const issues = [];
  const re = /<PostImage[\s\S]*?src=["']([^"']+)["']/g;
  const slugDir = path.join(PUBLIC_BLOG_DIR, slug);
  let m;
  while ((m = re.exec(content)) !== null) {
    const src = m[1];
    if (!src.startsWith("/blog/")) continue;
    const expectedRel = src.replace(/^\/blog\//, "");
    const fsPath = path.join(PUBLIC_BLOG_DIR, expectedRel);
    if (!fs.existsSync(fsPath)) {
      issues.push(
        fail(`<PostImage src="${src}"> does not resolve to ${path.relative(ROOT, fsPath)}`)
      );
    }
    // Slug-folder consistency check
    if (!fsPath.startsWith(slugDir + path.sep) && fsPath !== slugDir) {
      issues.push(
        warn(`<PostImage src="${src}"> is outside expected folder public/blog/${slug}/`)
      );
    }
    // Fake-clinical-asset filename check
    const filename = path.basename(src);
    for (const pat of FAKE_CLINICAL_ASSET_PATTERNS) {
      if (pat.test(filename)) {
        issues.push(
          warn(
            `<PostImage> filename "${filename}" matches fake-clinical-asset pattern /${pat.source}/ — review for clinical-scene depiction`
          )
        );
      }
    }
  }
  return issues;
}

function checkInternalLinks(content) {
  const issues = [];
  const internalRoutes = ["/methodology/", "/how-it-works/", "/blog/", "/features/", "/about/"];
  const linkRe = /\[[^\]]+\]\(([^)]+)\)/g;
  let count = 0;
  let m;
  while ((m = linkRe.exec(content)) !== null) {
    const href = m[1];
    if (internalRoutes.some((r) => href === r.replace(/\/$/, "") || href.startsWith(r))) {
      count++;
    }
  }
  if (count < 2) {
    issues.push(
      fail(`fewer than 2 internal links (found ${count}); link to /methodology/, /how-it-works/, /blog/, /features/, or /about/`)
    );
  }
  return issues;
}

function checkSourcesSection(content) {
  if (!/^##\s+Sources?\b/im.test(content)) {
    return [fail(`missing "## Sources" section at bottom of post`)];
  }
  return [];
}

function checkWordCount(content, category) {
  const wc = wordCount(content);
  const min = CATEGORY_MIN_WORDS[category];
  if (min && wc < min) {
    return [
      fail(
        `word count ${wc} is below category minimum ${min} for "${category}"`
      ),
    ];
  }
  return [];
}

function checkBannedPhrases(content, phrases, label) {
  const issues = [];
  const lower = content.toLowerCase();
  for (const phrase of phrases) {
    const idx = lower.indexOf(phrase.toLowerCase());
    if (idx !== -1) {
      issues.push(
        fail(`${label}: "${phrase}" found at character ${idx}`)
      );
    }
  }
  return issues;
}

function checkMedicalAdviceContextual(content) {
  // For "you should take" / "you need to take" / "you must take" / "you should
  // be taking" — flag ONLY if an ingestion marker (supplement / dose / pill)
  // appears within ~50 chars after the verb phrase. Editorial uses like
  // "what you should take away from this study" don't trigger.
  const issues = [];
  for (const verbPattern of ADVICE_VERB_PATTERNS) {
    const re = new RegExp(verbPattern.source, verbPattern.flags);
    let m;
    while ((m = re.exec(content)) !== null) {
      const window = content.slice(m.index + m[0].length, m.index + m[0].length + 60);
      if (INGESTION_MARKERS.test(window)) {
        issues.push(
          fail(
            `medical-advice phrase "${m[0]}" with ingestion context near character ${m.index} — rephrase to a non-prescriptive form`
          )
        );
      }
    }
  }

  // "cures" — flag only in clear verb-position context (subject + cures).
  // Plural noun "cures" in framing like "no proven cures yet" is fine.
  for (const m of content.matchAll(CURES_PATTERN)) {
    issues.push(
      fail(
        `medical-advice claim "${m[0]}" at character ${m.index} — rephrase ("is studied for…", "may help with…")`
      )
    );
  }

  return issues;
}

function checkSuperlatives(content) {
  // Superlatives are only banned if not within ~50 chars of a <Source> chip
  // or a citation link. This catches "the best" in editorial framing but
  // allows quoted findings.
  const issues = [];
  const lower = content.toLowerCase();
  for (const phrase of SUPERLATIVE_PHRASES) {
    let idx = -1;
    while ((idx = lower.indexOf(phrase, idx + 1)) !== -1) {
      const surrounding = content.slice(Math.max(0, idx - 80), Math.min(content.length, idx + phrase.length + 80));
      const hasCitation =
        /<Source\b/i.test(surrounding) ||
        /\]\(https?:\/\//.test(surrounding) ||
        /\*\*Source:\*\*/i.test(surrounding);
      if (!hasCitation) {
        issues.push(
          fail(`unsupported superlative "${phrase}" at character ${idx} (no citation within 80 chars)`)
        );
      }
    }
  }
  return issues;
}

function checkYmylDisclaimer(content) {
  // Require only the OPENING <Callout tone="info"> tag to appear within
  // the first 300 words. A Callout body can be long and push the closing
  // tag past word 300 legitimately — that shouldn't fail validation.
  const head = firstNWords(content, 300);
  if (!/<Callout\s+tone=["']info["']/i.test(head)) {
    return [
      fail(
        `YMYL disclaimer missing — <Callout tone="info"> opening tag must appear within the first 300 words`
      ),
    ];
  }
  return [];
}

function checkPerSectionCitations(content, category) {
  if (!HIGH_RISK_CATEGORIES.has(category)) return [];
  const issues = [];
  // Split by H2 (## ...). Skip the final "Sources" section.
  const sections = content.split(/\n##\s+/).slice(1); // first chunk is pre-H2
  for (const sec of sections) {
    const head = sec.split(/\n/, 1)[0]?.trim() || "";
    if (/^sources?\b/i.test(head)) continue;
    const body = sec;
    const hasCitation =
      /<Source\b/i.test(body) ||
      /\*\*Source:\*\*/i.test(body) ||
      /\]\(https?:\/\//.test(body);
    if (!hasCitation) {
      issues.push(
        fail(`H2 section "${head}" has no citation (required for ${category})`)
      );
    }
  }
  return issues;
}

function checkReadability(content) {
  // Soft warnings only — readability is heuristic, not pass/fail.
  // Strips frontmatter + MDX components + fenced code + Sources section before measuring.
  const issues = [];

  // Cut anything from "## Sources" onward (reference list, not body prose)
  const sourcesIdx = content.search(/\n##\s+Sources?\b/i);
  let body = sourcesIdx > 0 ? content.slice(0, sourcesIdx) : content;

  // Drop fenced code blocks and inline component blocks (keep their text where possible)
  body = body.replace(/```[\s\S]*?```/g, "");
  body = body.replace(/<(Illustration|PostImage)[\s\S]*?<\/\1>/gi, "");
  body = body.replace(/<(PostImage|EvidencePill)\b[^/>]*\/>/gi, "");
  // Keep <Callout> and <Source> text content; just remove the tags
  body = body.replace(/<\/?(Callout|Source)\b[^>]*>/gi, "");

  // Paragraphs = chunks separated by blank lines, excluding heading lines and list/code lines
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !/^#+\s/.test(p) && !/^[-*]\s/.test(p) && !/^>\s/.test(p) && !/^\|/.test(p));

  // Sentence count per paragraph (approx: split on . ! ? followed by space/newline/end)
  const longParas = paragraphs
    .map((p) => ({ p, sentences: (p.match(/[.!?](?=\s|$)/g) || []).length }))
    .filter((x) => x.sentences > 5);

  if (longParas.length) {
    issues.push(
      warn(
        `${longParas.length} paragraph(s) exceed 5 sentences — voice-guide.md caps paragraphs at 5 (target 2–4)`
      )
    );
  }

  // Average sentence length across body
  const allSentences = body
    .replace(/\n/g, " ")
    .split(/[.!?](?=\s|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^#+\s/.test(s));
  const longSentences = allSentences.filter(
    (s) => s.split(/\s+/).filter(Boolean).length > 40
  );
  if (longSentences.length > 2) {
    issues.push(
      warn(
        `${longSentences.length} sentences exceed 40 words — voice-guide.md targets 15–20 word average`
      )
    );
  }

  // Academic transitions (banned by voice guide but separate from the marketing-word list above)
  const academicConnectives = [
    "Furthermore",
    "Moreover",
    "Additionally",
    "Notwithstanding",
  ];
  const foundConnectives = academicConnectives.filter((w) =>
    new RegExp(`\\b${w}\\b`).test(body)
  );
  if (foundConnectives.length) {
    issues.push(
      warn(
        `academic connectives found: ${foundConnectives.join(", ")} — voice-guide.md prefers "The catch:" / "Here's why:" / "What this means:"`
      )
    );
  }

  return issues;
}

function checkReviewerInvariants(data) {
  const issues = [];
  if (data.reviewRequired === true && data.featured === true) {
    issues.push(
      fail(`reviewRequired: true is mutually exclusive with featured: true`)
    );
  }
  if (data.reviewRequired === true && (!data.reviewer || !String(data.reviewer).trim())) {
    issues.push(
      warn(`reviewRequired: true but no reviewer field set — will block publish-check`)
    );
  }
  return issues;
}

async function checkUrls(content, { skip = false } = {}) {
  if (skip) return [];
  const issues = [];
  const urlSet = new Set();
  const sources = []; // {url, isClinical}

  // Markdown links
  const linkRe = /\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/g;
  let m;
  while ((m = linkRe.exec(content)) !== null) {
    urlSet.add(m[1]);
    // Heuristic for clinical context: link is inside a <Source> chip,
    // inside the Sources section, or on a **Source:** line.
    const left = content.slice(Math.max(0, m.index - 200), m.index);
    const isClinical =
      /<Source\b[^>]*>(?:(?!<\/Source>)[\s\S]){0,400}$/i.test(left) ||
      /\*\*Source:\*\*[^\n]{0,200}$/i.test(left) ||
      /\n##\s+Sources?\b[\s\S]*$/i.test(left);
    sources.push({ url: m[1], isClinical });
  }

  if (urlSet.size === 0) return issues;

  const results = await Promise.all(
    [...urlSet].map(async (url) => ({ url, result: await fetchHead(url) }))
  );

  for (const { url, result } of results) {
    if (!result.ok) {
      issues.push(
        fail(`URL ${url} failed (status ${result.status || "no-response"}${result.error ? ", " + result.error : ""})`)
      );
    }
  }
  for (const { url, isClinical } of sources) {
    if (!isClinical) continue;
    const d = getDomain(url);
    if (d && !isAuthoritative(d)) {
      issues.push(
        warn(`clinical citation uses non-authoritative domain ${d} (${url})`)
      );
    }
  }
  return issues;
}

// ─── Main ────────────────────────────────────────────────────────────

async function validate(slug, { publishCheck = false, acceptWarnings = false, skipUrl = false } = {}) {
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(mdxPath)) {
    console.error(color("red", `error:`), `post not found: ${path.relative(ROOT, mdxPath)}`);
    process.exit(2);
  }
  const source = fs.readFileSync(mdxPath, "utf8");
  const { data, content } = matter(source);

  // Normalize governance keys (snake → camel) for invariants
  const normalized = {
    ...data,
    reviewRequired: data.review_required ?? data.reviewRequired,
    riskScore: data.risk_score ?? data.riskScore,
    evidenceLevel: data.evidence_level ?? data.evidenceLevel,
  };

  const allIssues = [];
  const push = (label, issues) => {
    for (const i of issues) allIssues.push({ ...i, label });
  };

  push("frontmatter", checkFrontmatter(data));
  push("mdx-components", checkMdxComponents(content));
  push("post-images", checkPostImageFiles(content, slug));
  push("internal-links", checkInternalLinks(content));
  push("sources-section", checkSourcesSection(content));
  if (data.category) push("word-count", checkWordCount(content, data.category));
  push("banned-marketing", checkBannedPhrases(content, BANNED_MARKETING_WORDS, "banned marketing word"));
  push("banned-medical-advice", checkBannedPhrases(content, BANNED_MEDICAL_ADVICE, "banned medical-advice phrase"));
  push("banned-medical-advice", checkMedicalAdviceContextual(content));
  push("banned-brand", checkBannedPhrases(content, BANNED_BRAND_PHRASES, "brand-recommendation phrase"));
  push("superlatives", checkSuperlatives(content));
  push("ymyl-disclaimer", checkYmylDisclaimer(content));
  if (data.category) push("per-section-citations", checkPerSectionCitations(content, data.category));
  push("reviewer-invariants", checkReviewerInvariants(normalized));
  push("readability", checkReadability(content));
  push("urls", await checkUrls(content, { skip: skipUrl }));

  // ─── Publish-check escalations ─────────────────────────────────────
  if (publishCheck) {
    if (normalized.reviewRequired === true && (!normalized.reviewer || !String(normalized.reviewer).trim())) {
      allIssues.push({ kind: "fail", label: "publish-check", msg: "reviewer field required when reviewRequired: true" });
    }
    if (typeof normalized.riskScore === "number" && normalized.riskScore >= 71) {
      allIssues.push({ kind: "fail", label: "publish-check", msg: `riskScore ${normalized.riskScore} >= 71 — should not ship as an MDX post` });
    }
    if (!acceptWarnings) {
      const urlWarn = allIssues.find((i) => i.kind === "warn" && i.label === "urls");
      if (urlWarn) {
        allIssues.push({ kind: "fail", label: "publish-check", msg: "URL warnings present; pass --accept-warnings to override" });
      }
    }
  }

  // ─── Report ─────────────────────────────────────────────────────────
  const fails = allIssues.filter((i) => i.kind === "fail");
  const warns = allIssues.filter((i) => i.kind === "warn");

  console.log(color("bold", `\nValidating ${slug}.mdx`) + color("gray", `   [${publishCheck ? "publish-check" : "validate"}]`));
  console.log(color("gray", `  ${path.relative(ROOT, mdxPath)}\n`));

  if (warns.length) {
    console.log(color("yellow", `Warnings (${warns.length}):`));
    for (const w of warns) console.log(`  ${color("yellow", "⚠")} [${w.label}] ${w.msg}`);
    console.log();
  }
  if (fails.length) {
    console.log(color("red", `Failures (${fails.length}):`));
    for (const f of fails) console.log(`  ${color("red", "✕")} [${f.label}] ${f.msg}`);
    console.log();
    console.log(color("red", `\n✕ ${slug}.mdx failed validation\n`));
    process.exit(1);
  }
  console.log(color("green", `✓ ${slug}.mdx passed ${publishCheck ? "publish-check" : "validation"}\n`));
  process.exit(0);
}

// ─── CLI ─────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const positional = args.filter((a) => !a.startsWith("--"));
  const slug = positional[0];

  if (!slug) {
    console.error(`Usage: node scripts/validate-blog.mjs <slug> [--publish-check] [--accept-warnings] [--skip-url]`);
    process.exit(2);
  }

  validate(slug, {
    publishCheck: flags.has("--publish-check"),
    acceptWarnings: flags.has("--accept-warnings"),
    skipUrl: flags.has("--skip-url"),
  });
}

main();

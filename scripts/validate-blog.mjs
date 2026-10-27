#!/usr/bin/env node
/**
 * Blog validator — structural, clinical-governance, and URL checks for
 * PharmaGuide blog posts. Two modes:
 *
 *   pnpm blog:validate <slug>             — daily validity check (exits 0
 *                                           on pass, prints warnings)
 *   pnpm blog:publish-check <slug>        — stricter ship gate (also fails
 *                                           on missing reviewer and on
 *                                           unaccepted URL warnings)
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
import { figureComponents } from "./lib/figure-registry.mjs";

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

// Length follows the reader's question, not the category (pg-blog-mdx
// formats: a focused answer can be 400 words). The only floor is a stub
// check, so an empty or half-written draft can't pass.
const MIN_WORDS = 300;

// One vocabulary for evidence, used by <EvidencePill level> (one claim)
// and frontmatter evidence_level (the post overall). Interaction severity
// and review status are separate and never go in a pill.
const EVIDENCE_LEVELS = ["Established", "Moderate", "Limited", "Mixed", "Conditional"];

const HIGH_RISK_CATEGORIES = new Set([
  "interactions-stacks",
  "safety-alerts",
]);

// Teaching figures: exactly the components the registry
// src/components/blog/figures/index.ts exposes to MdxComponents.tsx, so
// validation and rendering agree (scripts/lib/figure-registry.mjs).
const FIGURE_COMPONENTS = figureComponents(ROOT);

const ALLOWED_MDX_COMPONENTS = new Set([
  "Callout",
  "EvidencePill",
  "Source",
  "PostImage",
  "Illustration",
  "Sources",
  "SvgStyle",
  ...FIGURE_COMPONENTS,
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
  "ecfr.gov",              // official U.S. Code of Federal Regulations
  // Peer-reviewed journals
  "nejm.org",
  "thelancet.com",
  "jamanetwork.com",
  "bmj.com",
  "cochranelibrary.com",
  "amjmed.com",
  "jacc.org",              // J Am Coll Cardiol
  "ahajournals.org",       // AHA journals
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
  if (!/^##\s+Sources?\b/im.test(content) && !/<Sources>/.test(content)) {
    return [fail(`missing "## Sources" section at bottom of post`)];
  }
  return [];
}

function checkWordCount(content, data) {
  // A quiet-week recall digest is legitimately a few lines.
  if (data.format === "recall-digest") return [];
  const wc = wordCount(content);
  return wc < MIN_WORDS ? [fail(`word count ${wc} is below ${MIN_WORDS} — this reads as a stub`)] : [];
}

function checkEvidenceLevels(content, data) {
  const issues = [];
  for (const [, level] of content.matchAll(/<EvidencePill\s+level="([^"]*)"/g)) {
    if (!EVIDENCE_LEVELS.includes(level)) {
      issues.push(
        fail(
          `<EvidencePill level="${level}"> — pills grade evidence only: ${EVIDENCE_LEVELS.join(", ")}. Say interaction severity or recall status in the text.`
        )
      );
    }
  }
  const post = data.evidence_level ?? data.evidenceLevel;
  if (post !== undefined && !EVIDENCE_LEVELS.includes(post)) {
    issues.push(fail(`evidence_level "${post}" must be one of ${EVIDENCE_LEVELS.join(", ")}`));
  }
  return issues;
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

// Phrases that mark text as machine-written. Warnings, not failures: the
// writer rewrites them in plain words (pg-blog-mdx humanizer pass).
const AI_TELL_PHRASES = [
  "it's important to note", "it is important to note", "it's worth noting", "it is worth noting",
  "in today's", "navigate the", "navigating the", "a testament to", "plays a crucial role",
  "plays a vital role", "dive into", "deep dive", "ever-evolving", "whether you're",
  "in the realm of", "when it comes to", "at the end of the day", "a myriad of",
  "embark on", "look no further", "rest assured", "holistic approach",
];

function checkAiTells(content) {
  const sourcesIdx = content.search(/<Sources>|\n##\s+Sources?\b/i);
  const body = (sourcesIdx > 0 ? content.slice(0, sourcesIdx) : content).toLowerCase();
  return AI_TELL_PHRASES.filter((p) => body.includes(p)).map((p) =>
    warn(`machine-sounding phrase "${p}" — rewrite in plain words`)
  );
}

function checkReadability(content) {
  // Soft warnings only — readability is heuristic, not pass/fail.
  // Strips frontmatter + MDX components + fenced code + Sources section before measuring.
  const issues = [];

  // Cut the reference list: either a "## Sources" heading or the <Sources>
  // component the MDX contract actually mandates. Measuring the reference
  // list as prose produced a phantom "paragraph exceeds 5 sentences" warning
  // on every post that used the component.
  const sourcesIdx = content.search(/\n##\s+Sources?\b/i);
  let body = sourcesIdx > 0 ? content.slice(0, sourcesIdx) : content;
  body = body.replace(/<Sources>[\s\S]*?<\/Sources>/gi, "");

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
    .map((p) => ({ p, sentences: (p.match(/[.!?]["'\u2019\u201d)\]]*(?=\s|$)/g) || []).length }))
    .filter((x) => x.sentences > 5);

  if (longParas.length) {
    issues.push(
      warn(
        `${longParas.length} paragraph(s) exceed 5 sentences — voice-guide.md caps paragraphs at 5 (target 2–4)`
      )
    );
  }

  // Average sentence length across body.
  // Terminal punctuation may be followed by a closing quote or bracket
  // (`."` / `.)` ), and markdown table rows carry no sentence punctuation at
  // all — both previously merged real sentences into one giant pseudo-sentence.
  const allSentences = body
    .split(/\n/)
    .filter((l) => !/^\s*\|/.test(l))
    .join(" ")
    .split(/[.!?]["'\u2019\u201d)\]]*(?=\s|$)/)
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
  // Laurie Pham, PharmD reviews all PharmaGuide content (Sean, 2026-10-11),
  // so every post carries the flag; reviewer + reviewed_at record the real
  // sign-off on the published version.
  if (data.reviewRequired !== true) {
    issues.push(fail(`review_required: true is required on every post (all content is clinically reviewed)`));
  }
  if (data.reviewer && !data.reviewed_at && !data.reviewedAt) {
    issues.push(warn(`reviewer set without reviewed_at — record the actual sign-off date (blocks publish-check)`));
  }
  if (data.risk_score !== undefined || data.riskScore !== undefined) {
    issues.push(warn(`risk_score is retired (review routing replaced the formula) — delete it`));
  }
  if (data.featured === true && !(data.reviewer && (data.reviewed_at || data.reviewedAt))) {
    issues.push(fail(`featured: true needs a completed review (reviewer + reviewed_at)`));
  }
  if (data.reviewRequired === true && (!data.reviewer || !String(data.reviewer).trim())) {
    issues.push(
      warn(`reviewRequired: true but no reviewer field set — will block publish-check`)
    );
  }
  return issues;
}

function doiFromUrl(url) {
  const m = /(?:doi\.org\/|\/doi\/(?:full\/|abs\/|pdf\/)?)(10\.\d{4,9}\/[^\s?#]+)/i.exec(url);
  return m ? decodeURIComponent(m[1]) : null;
}

async function crossrefResolves(doi) {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { "User-Agent": "PharmaGuide-Blog-Validator/1.0 (mailto:hello@pharmaguide.io)" },
    });
    if (!res.ok) return false;
    const body = await res.json();
    return Boolean(body?.message?.title?.length);
  } catch {
    return false;
  }
}

// URLs that block automated checks (401/403/429) but were opened in a
// browser and matched to their citation. Each entry: who checked, when,
// and what the page showed. Re-check when a post is substantively revised.
const MANUALLY_VERIFIED_URLS = {
  "https://professional.heart.org/en/science-news/2026-guideline-on-the-management-of-dyslipidemia":
    "2026-10-27, Claude in browser: page titled '2026 Guideline on the Management of Dyslipidemia' (AHA Professional Heart Daily); returns 403 to scripts",
};

// Numbers a person found in a study's FULL TEXT when the abstract (all the
// citation-support check reads) doesn't state them. Each entry: the exact
// passage, where it is, who checked and when. The check still warns on any
// other number beside the citation.
const FULL_TEXT_VERIFIED = {
  40352260: {
    numbers: ["69", "43", "1.2", "10", "1.6"],
    passage: "only 43% consumed at least 1.2 g/kg of protein, 10% consumed at least 1.6 g/kg, and 5% consumed at least 2.0 g/kg, calculated based on adjusted body weight",
    where: "Discussion; n = 69 in Results 3.1 (PMC12062175)",
    checked: "2026-10-27, Claude via PubMed Central full text",
  },
};

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
    if (result.ok) continue;
    const doi = doiFromUrl(url);
    if (doi && (await crossrefResolves(doi))) continue; // publisher blocks bots; DOI is real
    if ([401, 403, 429].includes(result.status)) {
      // A specific bot-blocked URL a person has opened and matched to its
      // citation passes; anything else still warns for a human to confirm.
      if (MANUALLY_VERIFIED_URLS[url]) continue;
      // Bot protection is not a dead link: say so, and let a human confirm.
      issues.push(warn(`URL ${url} blocked the automated check (status ${result.status}); confirm it opens`));
      continue;
    }
    issues.push(
      fail(`URL ${url} failed (status ${result.status || "no-response"}${result.error ? ", " + result.error : ""})`)
    );
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

// ─── PubMed citation identity ────────────────────────────────────────
// A PubMed link must point at the study the post names. The 2026-10
// audit found live posts whose PMIDs resolved to unrelated papers (a
// uterine-imaging study labelled as a CoQ10 meta-analysis), which a
// reachability check cannot catch. This fetches each linked record from
// NCBI and compares its real title, first author, year and journal with
// the post's label. It proves identity only; whether the study supports
// the sentence is checked by reading its abstract (pg-blog-mdx claim
// validation).

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

function citationTokens(s) {
  return String(s)
    .normalize("NFKD")
    .replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w.length > 3 || /^\d{4}$/.test(w));
}

function labelMatchesRecord(label, rec, namedAuthors = []) {
  // An author named beside the link ("Young JM, et al.") must be the record's
  // first author: a wrong PMID from the same journal and year otherwise passes.
  const authorName = rec.firstAuthor.replace(/\s+[A-Z]{1,3}$/, "").toLowerCase();
  if (namedAuthors.length && !namedAuthors.some((n) => authorName.includes(n.toLowerCase()))) return false;
  const title = citationTokens(rec.title);
  const has = (w) => title.some((t) => t.slice(0, 6) === w.slice(0, 6));
  const words = citationTokens(label).filter((w) => !/^\d{4}$/.test(w));
  const hits = words.filter(has).length;
  if ((words.length >= 3 && hits / words.length >= 0.75) || (words.length === 2 && hits === 2)) return true;
  const surname = authorName.split(" ").pop() || "";
  const lower = label.toLowerCase();
  const year = rec.year;
  const journal = citationTokens(rec.source);
  const journalHit = citationTokens(label).some((w) => journal.includes(w));
  if (surname && lower.includes(surname) && (lower.includes(year) || hits >= 2)) return true;
  return lower.includes(year) && journalHit;
}

async function checkPubmedCitations(content, { skip = false } = {}) {
  const cites = []; // {id, kind, label}
  const re = /\[([^\]]+)\]\(https?:\/\/(pubmed|pmc)\.ncbi\.nlm\.nih\.gov\/(?:articles\/)?(PMC)?(\d+)\/?\)/g;
  let m;
  let prevEnd = 0;
  while ((m = re.exec(content)) !== null) {
    let label = m[1].replace(/\s+/g, " ");
    // Text between the previous link (or line start) and the end of this one.
    const ctxStart = Math.max(content.lastIndexOf("\n", m.index) + 1, prevEnd);
    const ctx = content.slice(ctxStart, m.index) + " " + label;
    prevEnd = m.index + m[0].length;
    const namedAuthors = [...ctx.matchAll(/([A-Z][A-Za-z'’-]+)(?:\s+[A-Z]{1,3})?,?\s+et al/g)].map((x) => x[1]);
    if (/ncbi\.nlm\.nih\.gov/.test(label)) {
      // Bare-URL link text: the label is the text before " — " on the same line.
      const lineStart = content.lastIndexOf("\n", m.index) + 1;
      const lead = content.slice(lineStart, m.index).replace(/^\s*\d+\.\s*/, "");
      const parts = lead.split(/\s+—\s*|\s+·\s+/).map((p) => p.trim()).filter(Boolean);
      label = parts.length ? parts[parts.length - 1] : "";
    }
    cites.push({ id: m[4], kind: m[3] ? "pmc" : "pubmed", label, namedAuthors });
  }
  if (cites.length === 0) return [];
  if (skip) return [warn(`${cites.length} PubMed/PMC citation(s) not verified (offline)`)];

  try {
    const pmcIds = [...new Set(cites.filter((c) => c.kind === "pmc").map((c) => c.id))];
    if (pmcIds.length) {
      const conv = await (await fetch(
        `https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?format=json&tool=pharmaguide-blog&ids=${pmcIds.map((i) => "PMC" + i).join(",")}`
      )).json();
      const map = Object.fromEntries((conv.records || []).map((r) => [r.pmcid.slice(3), String(r.pmid || "")]));
      for (const c of cites) if (c.kind === "pmc") c.pmid = map[c.id] || "";
    }
    for (const c of cites) if (c.kind === "pubmed") c.pmid = c.id;
    const ids = [...new Set(cites.map((c) => c.pmid).filter(Boolean))];
    const sum = ids.length
      ? (await (await fetch(`${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&tool=pharmaguide-blog&id=${ids.join(",")}`)).json()).result || {}
      : {};
    const issues = [];
    for (const c of cites) {
      const r = c.pmid && sum[c.pmid];
      const ref = c.kind === "pmc" ? `PMC${c.id}` : `PMID ${c.id}`;
      if (!r || r.error || !r.title) {
        issues.push(fail(`${ref} does not resolve to a PubMed record`));
        continue;
      }
      const rec = {
        title: r.title,
        firstAuthor: (r.authors && r.authors[0] && r.authors[0].name) || "",
        year: String(r.pubdate || "").slice(0, 4),
        source: r.source || "",
      };
      if (!c.label || !labelMatchesRecord(c.label, rec, c.namedAuthors)) {
        issues.push(
          fail(`${ref} is "${rec.title}" (${rec.firstAuthor}, ${rec.year}, ${rec.source}), but the post labels it "${c.label}"`)
        );
      }
    }
    return issues;
  } catch (err) {
    return [fail(`PubMed citation check could not reach NCBI (${err.message}); rerun online`)];
  }
}

// ─── PubMed citation SUPPORT ─────────────────────────────────────────
// Identity (above) proves the PMID is the paper the post names. It cannot
// see whether that paper supports the sentence it is attached to — the
// failure mode where a real, correctly-labelled study is cited for a claim
// it never made, or an animal study is cited for a human-sounding claim.
// This fetches each record's ABSTRACT, publication types and MeSH terms and
// checks the claim it is attached to against them.

const STOP_CTX = new Set(["that","this","with","from","have","been","were","which","their","there","about","would","could","should","these","those","other","than","then","when","what","your","more","most","some","only","also","into","over","under","after","before","because","while","they","them","same","such","does","doing","being","between","against","during","above","below","through","shows","show","found","study","studies","research","review","evidence","people","reader","label","post"]);

function parseEfetch(xml) {
  const out = {};
  for (const art of xml.split(/(?=<PubmedArticle>)/)) {
    const pm = /<PMID[^>]*>(\d+)<\/PMID>/.exec(art);
    if (!pm || !/<ArticleTitle>/.test(art)) continue;
    const strip = (t) => t.replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    const title = strip((/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/.exec(art) || [, ""])[1]);
    const abstract = [...art.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map((m) => strip(m[1])).join(" ");
    const pubtypes = [...art.matchAll(/<PublicationType[^>]*>([\s\S]*?)<\/PublicationType>/g)].map((m) => strip(m[1]).toLowerCase());
    const mesh = [...art.matchAll(/<DescriptorName[^>]*>([\s\S]*?)<\/DescriptorName>/g)].map((m) => strip(m[1]).toLowerCase());
    out[pm[1]] = { title, abstract, pubtypes, mesh };
  }
  return out;
}

// Pair each citation with the prose it is attached to.
// <Source>…</Source> and <EvidencePill> follow their claim, so the claim is
// the preceding paragraph. Entries inside <Sources> or on a "**Source:**"
// line are reference listings, not claims — identity-only, skipped here.
function claimContexts(content) {
  const pairs = [];
  const sourcesBlock = /<Sources>[\s\S]*?<\/Sources>/g;
  const masked = content.replace(sourcesBlock, (m) => " ".repeat(m.length));
  const re = /<Source>([\s\S]*?)<\/Source>/g;
  let m;
  while ((m = re.exec(masked)) !== null) {
    // The link text and the href both contain the PMID; dedupe or every
    // finding is reported twice.
    const ids = [...new Set([...m[1].matchAll(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/g)].map((x) => x[1]))];
    if (!ids.length) continue;
    const before = masked.slice(0, m.index).trimEnd();
    const clean = (t) => t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    // Three scopes, because each test needs a different one:
    //   ctx      — the paragraph the citation hangs off (subject + study type)
    //   section  — the enclosing H2 block (species framing is often set a
    //              paragraph earlier: "researchers gave it to rodents")
    //   sentence — the last sentence before the chip (numbers only belong to
    //              the claim they sit next to; a paragraph may cite two studies)
    const paras = before.split(/\n\s*\n/).filter((q) => q.trim() && !/^#+\s/.test(q.trim()));
    const ctx = clean(paras[paras.length - 1] || "");
    const h2 = before.lastIndexOf("\n## ");
    const section = clean(h2 >= 0 ? before.slice(h2) : before);
    const sentences = ctx.split(/(?<=[.!?])\s+/).filter(Boolean);
    const sentence = sentences[sentences.length - 1] || ctx;
    for (const id of ids) pairs.push({ pmid: id, ctx, section, sentence });
  }
  return pairs;
}

function numbersIn(text) {
  // Numeric tokens worth verifying: doses, percentages, fold-changes, counts.
  // Excludes years, 4-digit+ ids, and table rows (handled by caller).
  return [...text.matchAll(/(?<![\w.])(\d+(?:\.\d+)?)\s*(%|-fold|fold|mg|g\b|ppm|µg|mcg|weeks?|months?|days?)?/gi)]
    .map((m) => ({ n: m[1], unit: (m[2] || "").toLowerCase() }))
    .filter((x) => !/^(19|20)\d{2}$/.test(x.n) && Number(x.n) !== 1 && x.n.length <= 6);
}

async function checkCitationSupport(content, { skip = false } = {}) {
  const pairs = claimContexts(content);
  if (!pairs.length) return [];
  if (skip) return [warn(`${pairs.length} citation-support check(s) skipped (offline)`)];
  const ids = [...new Set(pairs.map((p) => p.pmid))];
  let recs;
  try {
    const res = await fetch(`${EUTILS}/efetch.fcgi?db=pubmed&retmode=xml&tool=pharmaguide-blog&id=${ids.join(",")}`, {
      headers: { "User-Agent": "PharmaGuide-Blog-Validator/1.0 (mailto:hello@pharmaguide.io)" },
    });
    recs = parseEfetch(await res.text());
  } catch (err) {
    return [fail(`citation-support check could not reach NCBI (${err.message}); rerun online`)];
  }

  const issues = [];
  for (const { pmid, ctx, section, sentence } of pairs) {
    const r = recs[pmid];
    if (!r) { issues.push(warn(`PMID ${pmid}: no record returned for the support check`)); continue; }
    if (!r.abstract) { issues.push(warn(`PMID ${pmid} has no abstract on PubMed — verify support by hand`)); continue; }
    const hay = (r.title + " " + r.abstract).toLowerCase();
    const meshAll = r.mesh.join(" ");
    const low = ctx.toLowerCase();

    // 1. Zero topic overlap — the citation is about something else entirely.
    const words = [...new Set(low.replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 4 && !STOP_CTX.has(w)))];
    const overlap = words.filter((w) => hay.includes(w.slice(0, Math.max(5, w.length - 2))));
    if (words.length >= 4 && overlap.length === 0) {
      issues.push(fail(`PMID ${pmid} shares no subject terms with the claim it is attached to — wrong source? claim: "${ctx.slice(0, 110)}…"`));
      continue;
    }

    // 2. Animal / in-vitro study cited for a claim that reads as human.
    // Species words are the easy case. Many toxicology abstracts never name
    // the animal ("in vivo", "LD50 > 2000 mg kg-1"), and a paper indexed in
    // the last few months has no MeSH terms at all — so the signature of an
    // animal/lab study has to be matched too, or human-sounding claims on
    // rodent data sail through. This is the check that matters most for YMYL.
    const speciesNamed = /\b(rats?|mice|mouse|murine|rodents?|zebrafish|drosophila|rabbits?|porcine|canine|bovine|wistar|sprague[- ]dawley|albino)\b/.test(hay);
    const labOnly = /\b(in vitro|cell lines?|cultured cells?)\b/.test(hay);
    const toxSignature = /\bld50\b|\bmg\s*kg-?1\b|\bmg\/kg\b|\bbody weight gain\b|\bhistopatholog/.test(hay)
      && /\bin vivo\b/.test(hay) && !/\b(patients?|participants?|volunteers?|humans?|adults?|men|women)\b/.test(hay);
    const meshAnimal = /\banimals\b/.test(meshAll) && !/\bhumans\b/.test(meshAll);
    const animalEvidence = speciesNamed || labOnly || toxSignature || meshAnimal;
    // Scoped to the whole H2 section: a post that says "gave shilajit to
    // rodents" one paragraph earlier has qualified the claim for the reader.
    const ctxFlagsAnimal = /\b(rats?|mice|mouse|murine|rodents?|animals?|in vitro|in vivo|preclinical|cell|lab|laborator)\w*\b/.test(section.toLowerCase());
    if (animalEvidence && !ctxFlagsAnimal) {
      issues.push(fail(`PMID ${pmid} is animal or in-vitro evidence but the claim does not say so — add the qualifier. claim: "${ctx.slice(0, 110)}…"`));
    }

    // 3. Numbers attributed to this study must appear in its abstract.
    // Warning, not a failure: one sentence may legitimately draw a figure from
    // a guideline or a second citation, so a human has to judge. Scoped to the
    // sentence beside the chip — attributing every digit in a paragraph to one
    // study produced false positives on real posts.
    const sentNoTable = sentence.replace(/\|[^|]*\|/g, " ");
    const fullText = FULL_TEXT_VERIFIED[pmid]?.numbers ?? [];
    const missing = numbersIn(sentNoTable).filter(({ n }) => !fullText.includes(n) && !new RegExp(`(?<![\\w.])${n.replace(".", "\\.")}`).test(r.abstract));
    if (missing.length) {
      issues.push(warn(`PMID ${pmid}: number(s) ${missing.map((x) => x.n + x.unit).join(", ")} are not in this study's abstract — confirm the figure belongs to this source`));
    }

    // 4. Study-type overclaim.
    const typeClaims = [
      [/\bmeta-?analys/i, "meta-analysis"],
      [/\bsystematic review\b/i, "systematic review"],
      [/\b(randomi[sz]ed|RCT|placebo-controlled)\b/i, "randomized controlled trial"],
    ];
    for (const [rx, pt] of typeClaims) {
      if (rx.test(ctx) && !r.pubtypes.some((t) => t.includes(pt.split(" ")[0]))) {
        issues.push(fail(`PMID ${pmid} is not indexed as a ${pt} (types: ${r.pubtypes.join(", ") || "none"}) but the claim calls it one`));
      }
    }

    // 5. Null-result study read as positive.
    const nullResult = /\b(no significant|did not differ|no difference|no effect|failed to|was not associated|non-significant)\b/.test(hay);
    const positiveClaim = /\b(reduces?|reduced|improves?|improved|increases?|increased|lowers?|lowered|helps?|prevents?|boosts?)\b/.test(low);
    const hedged = /\b(mixed|no benefit|did not|does not|unclear|inconsistent|no significant|null)\b/.test(low);
    if (nullResult && positiveClaim && !hedged) {
      issues.push(warn(`PMID ${pmid} reports a null or non-significant finding but the claim reads positive — confirm direction. claim: "${ctx.slice(0, 110)}…"`));
    }
  }
  // The same claim can legitimately cite one study twice; report each distinct
  // finding once.
  const seen = new Set();
  return issues.filter((i) => {
    const k = i.kind + "|" + i.msg;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
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
  push("word-count", checkWordCount(content, data));
  push("evidence-levels", checkEvidenceLevels(content, data));
  push("banned-marketing", checkBannedPhrases(content, BANNED_MARKETING_WORDS, "banned marketing word"));
  push("banned-medical-advice", checkBannedPhrases(content, BANNED_MEDICAL_ADVICE, "banned medical-advice phrase"));
  push("banned-medical-advice", checkMedicalAdviceContextual(content));
  push("banned-brand", checkBannedPhrases(content, BANNED_BRAND_PHRASES, "brand-recommendation phrase"));
  push("superlatives", checkSuperlatives(content));
  push("ymyl-disclaimer", checkYmylDisclaimer(content));
  if (data.category) push("per-section-citations", checkPerSectionCitations(content, data.category));
  push("reviewer-invariants", checkReviewerInvariants(normalized));
  push("readability", checkReadability(content));
  push("humanizer", checkAiTells(content));
  push("urls", await checkUrls(content, { skip: skipUrl }));
  push("pubmed-citations", await checkPubmedCitations(content, { skip: skipUrl && !publishCheck }));
  push("citation-support", await checkCitationSupport(content, { skip: skipUrl && !publishCheck }));

  // ─── Publish-check escalations ─────────────────────────────────────
  if (publishCheck) {
    if (normalized.reviewRequired === true && (!normalized.reviewer || !String(normalized.reviewer).trim())) {
      allIssues.push({ kind: "fail", label: "publish-check", msg: "reviewer field required when reviewRequired: true" });
    }
    if (normalized.reviewer && !normalized.reviewed_at && !normalized.reviewedAt) {
      allIssues.push({ kind: "fail", label: "publish-check", msg: "reviewed_at required: the page shows the sign-off date" });
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

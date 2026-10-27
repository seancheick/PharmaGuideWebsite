/**
 * Weekly supplement-recall digest: parsing, filtering, history merge and
 * MDX rendering. Pure functions plus one fetch helper; the CLI that wires
 * them to the network is scripts/recall-digest.mjs.
 *
 * Sources, in order of authority:
 *   1. FDA "Recalls, Market Withdrawals & Safety Alerts" (company
 *      announcements FDA posts as a public service): the listing JSON behind
 *      the public table, plus each announcement page for exact scope.
 *   2. FDA Enforcement Report (IRES), weekly CSV export. FDA lists every
 *      classified recall here, announced or not. A later listing or
 *      classification is not an expansion of the original warning.
 *   3. openFDA food/enforcement: cross-check only. openFDA's own docs say not
 *      to use it to issue alerts or to track a recall's lifecycle.
 *
 * Rules the code enforces:
 *   - Scope is product-level: brand, product, lots, sizes, identifiers,
 *     quoted from the notice. Nothing is generalised to an ingredient.
 *   - A history key never repeats: announcements key on the FDA page path,
 *     enforcement records on the FDA Event ID.
 *   - A source that fails after retries makes coverage incomplete, and an
 *     incomplete week never renders as "no recalls".
 */

import crypto from "node:crypto";

export const EXTRACTOR_VERSION = 1; // bump when extraction changes: re-baselines stored notices without update events

export const SOURCES = {
  listing: {
    id: "fda_recalls_listing",
    label: "FDA Recalls, Market Withdrawals & Safety Alerts",
    url: "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts",
    data: "https://www.fda.gov/datatables-json/recalls-market-withdrawals.json",
  },
  announcements: {
    id: "fda_announcement_pages",
    label: "FDA-posted company announcement pages",
    url: "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts",
  },
  enforcement: {
    id: "fda_enforcement_report",
    label: "FDA Enforcement Report",
    url: "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/enforcement-reports",
    weeklyCsv: (iso) => {
      const [y, m, d] = iso.split("-");
      return `https://www.accessdata.fda.gov/scripts/ires/index.cfm?action=export.getWeeklyExportCSVResult&monthVal=${m}&dayVal=${d}&yearVal=${y}`;
    },
    updatedDates: "https://www.accessdata.fda.gov/scripts/ires/index.cfm",
  },
  openfda: {
    id: "openfda_cross_check",
    label: "openFDA food enforcement (cross-check only)",
    url: "https://open.fda.gov/apis/food/enforcement/",
  },
};

// ─── Dates (all ISO YYYY-MM-DD, UTC arithmetic) ─────────────────────

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

export function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return isoDate(d);
}

/** "10/24/2026" → "2026-10-24"; anything else → null. */
export function parseUsDate(s) {
  const m = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/.exec(String(s ?? ""));
  if (!m) return null;
  return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

/** "October 24, 2026" or "October, 14 2026 00:00:00" → ISO; else null. */
export function parseLongDate(s) {
  const m = /([A-Za-z]+),?\s+(\d{1,2}),?\s+(\d{4})/.exec(String(s ?? ""));
  if (!m) return null;
  const mi = MONTHS.indexOf(m[1].toLowerCase());
  if (mi < 0) return null;
  return `${m[3]}-${String(mi + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

export function formatLongDate(iso) {
  if (!iso) return "date not stated";
  const [y, m, d] = iso.split("-").map(Number);
  const name = MONTHS[m - 1];
  return `${name[0].toUpperCase()}${name.slice(1)} ${d}, ${y}`;
}

/** Monday–Sunday window ending on `weekEnding` (a Sunday). */
export function weekWindow(weekEnding) {
  const day = new Date(`${weekEnding}T00:00:00Z`).getUTCDay();
  if (day !== 0) throw new Error(`week ending ${weekEnding} is not a Sunday`);
  return { start: addDays(weekEnding, -6), end: weekEnding };
}

/** The most recent Sunday strictly before `today`: the last complete week. */
export function defaultWeekEnding(today) {
  const day = new Date(`${today}T00:00:00Z`).getUTCDay();
  return addDays(today, -(day === 0 ? 7 : day));
}

/** Enforcement Reports post on Wednesdays. */
export function wednesdaysIn({ start, end }) {
  const out = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    if (new Date(`${d}T00:00:00Z`).getUTCDay() === 3) out.push(d);
  }
  return out;
}

export const inWindow = (iso, { start, end }) => Boolean(iso) && iso >= start && iso <= end;

// ─── Fetch with retry ───────────────────────────────────────────────

/**
 * Fetch `url` up to `attempts` times. `accept(text)` decides whether the body
 * is the document we asked for (FDA returns an HTML page with status 200 when
 * a weekly report does not exist). Never throws; returns a result record.
 */
export async function fetchWithRetry(url, {
  fetchImpl = fetch,
  attempts = 3,
  timeoutMs = 45000,
  accept = () => true,
  encoding = "utf-8",
  init = {},
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
  okStatuses = [],
} = {}) {
  let last = { ok: false, status: 0, error: "not attempted" };
  for (let i = 1; i <= attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, {
        ...init,
        signal: controller.signal,
        headers: { "User-Agent": "PharmaGuide-RecallDigest/1.0 (+https://pharmaguide.io)", ...(init.headers || {}) },
      });
      const buf = await res.arrayBuffer();
      const text = new TextDecoder(encoding).decode(buf);
      if (!res.ok && !okStatuses.includes(res.status)) {
        last = { ok: false, status: res.status, error: `HTTP ${res.status}`, attempts: i };
      } else if (!accept(text, res.status)) {
        last = { ok: false, status: res.status, error: "response was not the expected document", attempts: i };
      } else {
        return { ok: true, status: res.status, text, attempts: i };
      }
    } catch (err) {
      last = { ok: false, status: 0, error: err?.name === "AbortError" ? "timeout" : String(err?.message || err), attempts: i };
    } finally {
      clearTimeout(timer);
    }
    if (i < attempts) await sleep(1000 * 2 ** (i - 1));
  }
  return last;
}

// ─── Text helpers ───────────────────────────────────────────────────

const NAMED_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", reg: "®", trade: "™", copy: "©", deg: "°", micro: "µ", eacute: "é", hellip: "…" };

export function decodeEntities(s) {
  return String(s ?? "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED_ENTITIES[n.toLowerCase()] ?? m);
}

export function htmlToText(html) {
  return decodeEntities(String(html ?? "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?)])/g, "$1")
    .trim();
}

export function sha(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

/** Lowercase firm name without punctuation or corporate suffixes. */
export function normalizeFirm(name) {
  return String(name ?? "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9& ]+/g, " ")
    .replace(/\b(llc|l l c|inc|incorporated|corp|corporation|co|company|ltd|limited|lp|llp|pllc|the|dba)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sameFirm(a, b) {
  const x = normalizeFirm(a);
  const y = normalizeFirm(b);
  if (!x || !y) return false;
  return x === y || (Math.min(x.length, y.length) >= 6 && (x.startsWith(y) || y.startsWith(x)));
}

/** Same firm, and dates within a year of each other: the same recall, not an old one. */
export function relatedRecall(announcement, enforcement) {
  if (!sameFirm(announcement.company, enforcement.firm)) return false;
  const a = announcement.fdaPublishDate || announcement.listingDate;
  const b = enforcement.initiationDate || enforcement.firstReportDate;
  if (!a || !b) return false;
  return Math.abs(new Date(a) - new Date(b)) <= 365 * 864e5;
}

// ─── Source 1: recalls listing ──────────────────────────────────────

export function parseListing(json) {
  const rows = typeof json === "string" ? JSON.parse(json) : json;
  if (!Array.isArray(rows)) throw new Error("recalls listing is not an array");
  return rows.map((r) => ({
    path: r.path,
    url: `https://www.fda.gov${r.path}`,
    date: parseUsDate(r.field_change_date_2),
    brand: htmlToText(r.field_brand_name),
    company: htmlToText(r.field_company_name),
    productDescription: htmlToText(r.field_product_description),
    reasonCategory: htmlToText(r.field_recall_reason),
    reasonDescription: htmlToText(r.field_recall_reason_description),
    regulatedProducts: htmlToText(r.field_regulated_product_field),
    terms: htmlToText(r["all-terms-rewrite"]),
  }));
}

/** Why a listing row counts as a dietary supplement, or null if it doesn't. */
export function supplementListingMatch(row) {
  if (/\bdietary supplements?\b/i.test(row.regulatedProducts)) return "FDA product type: Dietary Supplements";
  if (/\b(dietary|nutritional) supplements?\b/i.test(row.terms)) return "FDA topic tag: dietary/nutritional supplement";
  if (/\bdietary supplements?\b/i.test(row.productDescription)) return "product description says dietary supplement";
  return null;
}

// ─── Source 1b: announcement page ───────────────────────────────────

export function parseAnnouncement(html) {
  const summary = {};
  for (const m of html.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/g)) {
    const label = htmlToText(m[1]).replace(/:$/, "");
    // Drop the visually hidden field labels FDA nests inside some <dd>s.
    const body = m[2].replace(/<div class="field--label">[\s\S]*?<\/div>/g, "");
    const items = [...body.matchAll(/<div class="field--item">([\s\S]*?)<\/div>/g)].map((x) => htmlToText(x[1]));
    summary[label] = items.length ? items : [htmlToText(body)];
  }
  const title = htmlToText((/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html) || [])[1] || "");
  const start = html.search(/<h2[^>]*>\s*Company Announcement\s*<\/h2>/i);
  const endRel = start >= 0 ? html.slice(start).search(/<h2[^>]*>\s*Company Contact Information|<h2[^>]*>\s*Product Photos|Content current as of/i) : -1;
  const segment = start >= 0 ? html.slice(start, endRel > 0 ? start + endRel : undefined) : "";
  const tables = [...segment.matchAll(/<table[\s\S]*?<\/table>/gi)].map((t) =>
    [...t[0].matchAll(/<tr[\s\S]*?<\/tr>/gi)]
      .map((tr) => [...tr[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => htmlToText(c[1])))
      .filter((row) => row.some(Boolean))
  );
  const textOnly = segment.replace(/<table[\s\S]*?<\/table>/gi, "").replace(/<h2[\s\S]*?<\/h2>/i, "");
  const paragraphs = [...textOnly.matchAll(/<(p|li)[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => htmlToText(m[2])).filter(Boolean);
  const current = /Content current as of:[\s\S]*?<time[^>]*>([\s\S]*?)<\/time>/i.exec(html);
  const one = (k) => (summary[k] || [])[0] || null;
  return {
    title,
    companyAnnouncementDate: parseLongDate(one("Company Announcement Date")),
    fdaPublishDate: parseLongDate(one("FDA Publish Date")),
    productType: one("Product Type"),
    reason: one("Reason for Announcement"),
    company: one("Company Name"),
    brands: summary["Brand Name"] || [],
    productDescriptions: summary["Product Description"] || [],
    paragraphs,
    tables,
    contentCurrentAsOf: current ? parseUsDate(htmlToText(current[1])) : null,
  };
}

const ABBREVIATION_END = /\b(?:Inc|Co|Corp|Ltd|No|St|Mr|Ms|Dr|oz|fl|approx|vs|Exp|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|U\.S|e\.g|i\.e)\.$/i;

export function splitSentences(paragraph) {
  const parts = paragraph.split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/);
  const out = [];
  for (const p of parts) {
    if (out.length && ABBREVIATION_END.test(out[out.length - 1])) out[out.length - 1] += ` ${p}`;
    else out.push(p);
  }
  return out.map((s) => s.trim()).filter(Boolean);
}

const BOILERPLATE = /MedWatch|Adverse reactions or quality problems|Complete and submit the report|Regular Mail or Fax|FDA does not endorse/i;
const IDENTIFIER = /\b(lots?|batch(es)?|UPC|NDC|GTIN|item\s*(#|no\.?|number)|SKU|model|expir\w*|exp\.?\s*dates?|best[- ]by|use[- ]by|sell[- ]by|net\s*wt|sizes?|ounces?|oz|mL|fl\.?\s*oz|grams?|count|ct|bottles?|packages?|pouch(es)?|box(es)?|jars?|packets?|sachets?|blister)\b/i;
const DISTRIBUTION = /\b(distributed|sold (at|in|through|online|via|nationwide)|available (at|in|through)|shipped|nationwide|retail (stores|locations))\b/i;
// An instruction is addressed to the reader: a consumer subject with a modal
// verb, or an imperative. Narration ("customers were notified to…") is not.
const INSTRUCTION = /(^(do not|don't|stop|return|discard|dispose|check|contact|call)\b)|\b(consumers?|customers?|patients?|parents?|caregivers?|retailers?|distributors?|anyone|those)\b[^.]{0,100}\b(should|are (urged|advised|asked|encouraged)|must|may (return|contact|call|obtain|discard|dispose)|can (return|contact|call|obtain|discard|dispose))\b/i;

/** Verbatim sentences from the notice, sorted into scope, distribution and instructions. */
export function extractScope(paragraphs) {
  const identifiers = [];
  const distribution = [];
  const instructions = [];
  for (const p of paragraphs) {
    for (const s of splitSentences(p)) {
      if (BOILERPLATE.test(s)) continue;
      // Headings inside a notice ("What Consumers Should Do") are not sentences.
      if (INSTRUCTION.test(s) && s.split(/\s+/).length >= 6) instructions.push(s);
      else if (IDENTIFIER.test(s)) identifiers.push(s);
      else if (DISTRIBUTION.test(s)) distribution.push(s);
    }
  }
  return { identifiers, distribution, instructions };
}

const EXPANSION = /\b(expand(s|ed|ing)?|expansion|updated?|additional lots?|adds? (lots?|products?))\b/i;

// ─── Source 2: Enforcement Report CSV ───────────────────────────────

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim()));
}

export function looksLikeEnforcementCsv(text) {
  return /^﻿?"?Product Type"?,/.test(text.trimStart());
}

export function parseEnforcementCsv(text) {
  const [header, ...rows] = parseCsv(text);
  if (!header || header[0].replace(/^﻿/, "") !== "Product Type") throw new Error("not an Enforcement Report CSV");
  const clean = (v) => {
    const t = String(v ?? "").replace(/\s+/g, " ").trim();
    return t === "N/A" ? "" : t;
  };
  return rows.map((cells) => {
    const get = (name) => clean(cells[header.indexOf(name)]);
    const codeInfo = header
      .map((h, i) => (h === "Code Info" || h === "More Code Info" ? clean(cells[i]) : ""))
      .filter(Boolean)
      .join(" ");
    return {
      productType: get("Product Type"),
      recentlyUpdated: get("Recently Updated Record") === "Yes",
      lastModifiedDate: parseUsDate(get("Last Modified Date")),
      eventId: get("Event ID"),
      status: get("Status"),
      firm: get("Recalling Firm"),
      city: get("City"),
      state: get("State/Province"),
      country: get("Country"),
      voluntary: get("Voluntary/Mandated"),
      distribution: get("Distribution Pattern"),
      recallNumber: get("Recall Number"),
      classification: get("Classification"),
      productDescription: get("Product Description"),
      quantity: get("Product Quantity"),
      reason: get("Reason for Recall"),
      initiationDate: parseUsDate(get("Recall Initiation Date")),
      classificationDate: parseUsDate(get("Center Classification Date")),
      terminationDate: parseUsDate(get("Termination Date")),
      reportDate: parseUsDate(get("Report Date")),
      codeInfo,
    };
  });
}

const STOP_WORDS = new Set(["supplement", "supplements", "dietary", "capsules", "tablets", "powder", "brand", "product", "products", "bottle", "count", "with", "and", "for", "the", "per", "net", "oz", "inc", "llc"]);
const words = (s) => new Set(String(s ?? "").toLowerCase().match(/[a-z0-9]{3,}/g)?.filter((w) => !STOP_WORDS.has(w)) || []);

/**
 * Human food or drug records that name a supplement, or that match a
 * supplement announcement on firm, date and product wording. A firm match
 * alone is not enough: a grocer with one supplement recall also recalls
 * blueberries.
 */
export function supplementEnforcementMatch(row, announcements = []) {
  if (!["Food", "Drugs"].includes(row.productType)) return null;
  if (/\bsupplements?\b/i.test(row.productDescription)) return "product description names a supplement";
  if (/\bdietary supplements?\b/i.test(row.reason)) return "recall reason names a dietary supplement";
  const desc = words(row.productDescription);
  const hit = announcements.find((a) =>
    relatedRecall(a, { firm: row.firm, initiationDate: row.initiationDate, firstReportDate: row.reportDate }) &&
    [...words(`${a.brand} ${a.productDescription}`)].some((w) => desc.has(w))
  );
  return hit ? `matches the dietary-supplement announcement ${hit.url}` : null;
}

/**
 * Human-food records that read like a supplement but don't say so. Never
 * published automatically; listed in the review sidecar for a person to decide.
 */
export function possibleSupplement(row) {
  if (row.productType !== "Food") return false;
  return /\b(vitamins?|multivitamin|capsules?|softgels?|tablets?|gummies|probiotics?|collagen|protein powder|pre-?workout|herbal|botanical|extract|tincture|melatonin|electrolyte)\b/i.test(row.productDescription);
}

/** "IRES facades.getUpdatedReportDates" JSON → ISO dates. */
export function parseUpdatedReportDates(text) {
  const body = JSON.parse(text);
  return (body.DATA || []).map((r) => parseLongDate(r[0])).filter(Boolean);
}

// ─── History ────────────────────────────────────────────────────────

export function emptyHistory() {
  return { schema: 1, entries: {}, weeks: {} };
}

function addEvent(entry, event) {
  const id = sha([event.kind, event.date, event.hash ?? null, event.changes ?? null]);
  if (entry.events.some((e) => e.id === id)) return null;
  const stored = { id, ...event };
  entry.events.push(stored);
  return stored;
}

function scopeOf(detail) {
  const scope = extractScope(detail.paragraphs);
  return {
    brands: detail.brands,
    productDescriptions: detail.productDescriptions,
    reason: detail.reason,
    identifiers: scope.identifiers,
    distribution: scope.distribution,
    instructions: scope.instructions,
    tables: detail.tables,
  };
}

function hashScope(scope) {
  // Distribution wording is excluded: a reworded sentence about where a
  // product was sold is not a change to which products are recalled.
  return sha([scope.brands, scope.productDescriptions, scope.reason, scope.identifiers, scope.instructions, scope.tables]);
}

function diffList(before = [], after = []) {
  const b = new Set(before.map((x) => JSON.stringify(x)));
  const a = new Set(after.map((x) => JSON.stringify(x)));
  return {
    added: after.filter((x) => !b.has(JSON.stringify(x))),
    removed: before.filter((x) => !a.has(JSON.stringify(x))),
  };
}

/**
 * Merge one supplement listing row (and its announcement page, when fetched)
 * into history. Returns the events added.
 */
export function mergeAnnouncement(history, row, detail, { runDate, matchReason }) {
  const key = `fda-announcement:${row.path}`;
  const added = [];
  let entry = history.entries[key];
  const scope = detail ? scopeOf(detail) : null;
  const scopeHash = scope ? hashScope(scope) : null;
  const announced = detail?.fdaPublishDate || row.date;

  if (!entry) {
    entry = history.entries[key] = {
      key,
      source: SOURCES.listing.id,
      url: row.url,
      title: detail?.title || null,
      company: detail?.company || row.company,
      brand: row.brand,
      productDescription: row.productDescription,
      reasonCategory: row.reasonCategory,
      reasonDescription: row.reasonDescription,
      matchReason,
      listingDate: row.date,
      companyAnnouncementDate: detail?.companyAnnouncementDate || null,
      fdaPublishDate: detail?.fdaPublishDate || null,
      contentCurrentAsOf: detail?.contentCurrentAsOf || null,
      notice: scope,
      noticeText: detail?.paragraphs || null,
      scopeHash,
      extractorVersion: EXTRACTOR_VERSION,
      firstSeen: runDate,
      related: [],
      events: [],
    };
    for (const e of Object.values(history.entries)) {
      if (e.source === SOURCES.enforcement.id && relatedRecall(entry, e) && !e.related.includes(key)) e.related.push(key);
    }
    const describesExpansion = EXPANSION.test(`${detail?.title || ""} ${(detail?.paragraphs || []).slice(0, 2).join(" ")}`);
    const prior = describesExpansion
      ? Object.values(history.entries).find((e) => e.key !== key && e.source === SOURCES.listing.id && sameFirm(e.company, entry.company) && (e.fdaPublishDate || e.listingDate) < announced)
      : null;
    if (prior) {
      entry.related.push(prior.key);
      added.push(addEvent(entry, { kind: "updated", date: announced, detectedAt: runDate, changes: ["new FDA-posted notice expands or updates an earlier recall"], prior: prior.key, hash: scopeHash }));
    } else {
      added.push(addEvent(entry, { kind: "new_announcement", date: announced, detectedAt: runDate, describesExpansion, hash: scopeHash }));
    }
    return added.filter(Boolean);
  }

  if (!detail) return [];
  // First time the page was read, or the extractor changed: take a baseline, no event.
  if (!entry.scopeHash || entry.extractorVersion !== EXTRACTOR_VERSION) {
    Object.assign(entry, {
      title: detail.title || entry.title,
      companyAnnouncementDate: detail.companyAnnouncementDate,
      fdaPublishDate: detail.fdaPublishDate,
      contentCurrentAsOf: detail.contentCurrentAsOf,
      notice: scope,
      noticeText: detail.paragraphs,
      scopeHash,
      extractorVersion: EXTRACTOR_VERSION,
    });
    return [];
  }
  if (entry.scopeHash === scopeHash) return [];

  const changes = [];
  for (const field of ["identifiers", "instructions", "tables", "brands", "productDescriptions"]) {
    const d = diffList(entry.notice?.[field], scope[field]);
    if (d.added.length || d.removed.length) changes.push({ field, ...d });
  }
  if ((entry.notice?.reason || "") !== (scope.reason || "")) changes.push({ field: "reason", before: entry.notice?.reason, after: scope.reason });
  const event = addEvent(entry, {
    kind: "updated",
    // FDA's "Content current as of" date when it moved; otherwise the day we noticed.
    date: detail.contentCurrentAsOf && detail.contentCurrentAsOf !== entry.contentCurrentAsOf ? detail.contentCurrentAsOf : runDate,
    detectedAt: runDate,
    changes,
    hash: scopeHash,
  });
  Object.assign(entry, { notice: scope, noticeText: detail.paragraphs, scopeHash, contentCurrentAsOf: detail.contentCurrentAsOf });
  return event ? [event] : [];
}

function productKey(p) {
  return p.recallNumber || `desc:${sha(p.productDescription.toLowerCase())}`;
}

function productRecord(r) {
  return {
    recallNumber: r.recallNumber,
    productDescription: r.productDescription,
    codeInfo: r.codeInfo,
    quantity: r.quantity,
    reason: r.reason,
    classification: r.classification,
    classificationDate: r.classificationDate,
    status: r.status,
    reportDate: r.reportDate,
    lastModifiedDate: r.lastModifiedDate,
  };
}

/**
 * Merge the supplement rows of one Enforcement Report event (one Event ID)
 * into history. Returns the events added.
 */
export function mergeEnforcementEvent(history, rows, { runDate, matchReason }) {
  const first = rows[0];
  const key = `fda-enforcement:${first.eventId}`;
  const reportDate = rows.map((r) => r.reportDate).filter(Boolean).sort()[0];
  const added = [];
  let entry = history.entries[key];

  if (!entry) {
    entry = history.entries[key] = {
      key,
      source: SOURCES.enforcement.id,
      eventId: first.eventId,
      firm: first.firm,
      location: [first.city, first.state, first.country].filter(Boolean).join(", "),
      voluntary: first.voluntary,
      distribution: first.distribution,
      initiationDate: first.initiationDate,
      firstReportDate: reportDate,
      matchReason,
      products: rows.map(productRecord),
      firstSeen: runDate,
      related: [],
      events: [],
    };
    const announcements = Object.values(history.entries).filter((e) => e.source === SOURCES.listing.id && relatedRecall(e, entry));
    entry.related.push(...announcements.map((e) => e.key));
    const prior = announcements.filter((e) => (e.fdaPublishDate || e.listingDate) <= reportDate).sort((a, b) => (a.fdaPublishDate || a.listingDate).localeCompare(b.fdaPublishDate || b.listingDate))[0];
    const priorAnnounced = prior ? prior.key : null;
    added.push(addEvent(entry, { kind: "enforcement_listed", date: reportDate, detectedAt: runDate, priorAnnouncement: priorAnnounced }));
    // A record FDA already flags as updated, seen for the first time: we have
    // no earlier version, so say only what FDA says.
    for (const r of rows.filter((x) => x.recentlyUpdated && x.lastModifiedDate && x.lastModifiedDate > reportDate)) {
      added.push(addEvent(entry, { kind: "updated", date: r.lastModifiedDate, detectedAt: runDate, changes: [`FDA marked record ${r.recallNumber || r.productDescription.slice(0, 60)} as updated; the earlier version is not in our history`] }));
    }
    return added.filter(Boolean);
  }

  const byKey = new Map(entry.products.map((p) => [productKey(p), p]));
  const byDesc = new Map(entry.products.map((p) => [p.productDescription.toLowerCase(), p]));
  const changes = [];
  const classified = [];
  for (const r of rows) {
    const next = productRecord(r);
    const prev = byKey.get(productKey(next)) || byDesc.get(next.productDescription.toLowerCase());
    if (!prev) {
      entry.products.push(next);
      changes.push({ field: "product added", recallNumber: next.recallNumber, after: next.productDescription });
      continue;
    }
    for (const f of ["productDescription", "codeInfo", "reason", "quantity"]) {
      if ((prev[f] || "") !== (next[f] || "")) changes.push({ field: f, recallNumber: next.recallNumber || prev.recallNumber, before: prev[f], after: next[f] });
    }
    if ((prev.classification || "") !== (next.classification || "") || (!prev.recallNumber && next.recallNumber)) {
      classified.push({ recallNumber: next.recallNumber, before: prev.classification, after: next.classification, date: next.classificationDate });
    }
    Object.assign(prev, next);
  }
  if (changes.length) {
    // FDA's modified date when the CSV gives one; otherwise the day we saw it.
    const date = rows.map((r) => r.lastModifiedDate).filter(Boolean).sort().pop() || runDate;
    added.push(addEvent(entry, { kind: "updated", date, detectedAt: runDate, changes }));
  }
  for (const c of classified) {
    // Classification is FDA's risk rating of a recall already under way. It
    // is not a new warning and not an expansion.
    added.push(addEvent(entry, { kind: "classified", date: c.date || rows[0].reportDate || runDate, detectedAt: runDate, changes: [c] }));
  }
  return added.filter(Boolean);
}

/** Events whose official date falls in the window, grouped for the digest. */
export function selectWeek(history, window) {
  const out = { newAnnouncements: [], updates: [], enforcementListings: [], classifications: [] };
  const bucket = { new_announcement: "newAnnouncements", updated: "updates", enforcement_listed: "enforcementListings", classified: "classifications" };
  for (const entry of Object.values(history.entries)) {
    for (const event of entry.events) {
      if (inWindow(event.date, window)) out[bucket[event.kind]].push({ entry, event });
    }
  }
  const order = (a, b) => (a.event.date + a.entry.key).localeCompare(b.event.date + b.entry.key);
  for (const list of Object.values(out)) list.sort(order);
  return out;
}

export function countProducts(selection) {
  let n = 0;
  for (const { entry } of [...selection.newAnnouncements, ...selection.updates, ...selection.enforcementListings]) {
    n += entry.source === SOURCES.enforcement.id ? entry.products.length : Math.max(1, (entry.notice?.tables?.[0]?.length || 1) - 1);
  }
  return n;
}

// ─── Coverage ───────────────────────────────────────────────────────

export function summarizeCoverage(sources) {
  const failures = sources.filter((s) => s.required && s.status !== "ok");
  return {
    complete: failures.length === 0,
    sources,
    gaps: failures.map((s) => `${s.label}${s.detail ? ` (${s.detail})` : ""}: ${s.error || s.status}`),
  };
}

// ─── Rendering ──────────────────────────────────────────────────────

/** Escape text quoted from FDA so MDX treats it as text, never JSX or markdown. */
export function mdxText(s) {
  return String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/([*_[\]`|#~])/g, "\\$1")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

const quote = (s) => `“${mdxText(s)}”`;

function weekLabel({ start, end }) {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const mon = (m) => MONTHS[m - 1].slice(0, 3).replace(/^./, (c) => c.toUpperCase());
  if (sy === ey && sm === em) return `${mon(sm)} ${sd}–${ed}, ${ey}`;
  if (sy === ey) return `${mon(sm)} ${sd}–${mon(em)} ${ed}, ${ey}`;
  return `${mon(sm)} ${sd}, ${sy}–${mon(em)} ${ed}, ${ey}`;
}

function announcementTitle(entry) {
  const product = entry.notice?.productDescriptions?.join("; ") || entry.productDescription;
  const brand = entry.notice?.brands?.join(", ") || entry.brand;
  const name = brand && !product.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${product}` : product || brand;
  return `${mdxText(name)} (${mdxText(entry.company)})`;
}

function list(label, items, fallback) {
  if (!items?.length) return fallback ? [`- **${label}:** ${fallback}`] : [];
  if (items.length === 1) return [`- **${label}:** ${quote(items[0])}`];
  return [`- **${label}:**`, ...items.map((s) => `  - ${quote(s)}`)];
}

function table(rows) {
  if (!rows?.length) return [];
  const width = Math.max(...rows.map((r) => r.length));
  const pad = (r) => [...r, ...Array(width - r.length).fill("")];
  const cell = (c) => mdxText(c).replace(/\n/g, " ");
  return ["", `| ${pad(rows[0]).map(cell).join(" | ")} |`, `|${" --- |".repeat(width)}`, ...rows.slice(1).map((r) => `| ${pad(r).map(cell).join(" | ")} |`), ""];
}

function renderAnnouncementCard(entry, event, history) {
  const n = entry.notice;
  const lines = [`### ${announcementTitle(entry)}`, ""];
  if (event.kind === "updated" && event.prior) {
    const prior = history.entries[event.prior];
    lines.push(`This notice updates an earlier recall by the same company${prior ? ` ([earlier FDA-posted notice](${prior.url}), ${formatLongDate(prior.fdaPublishDate || prior.listingDate)})` : ""}.`, "");
  } else if (event.kind === "updated") {
    lines.push(`FDA's posted notice changed on ${formatLongDate(event.date)}. What changed:`, "");
    for (const c of event.changes || []) {
      if (c.added?.length) lines.push(...c.added.map((x) => `- Added (${c.field}): ${quote(Array.isArray(x) ? x.join(" · ") : x)}`));
      if (c.removed?.length) lines.push(...c.removed.map((x) => `- Removed (${c.field}): ${quote(Array.isArray(x) ? x.join(" · ") : x)}`));
      if (c.field === "reason") lines.push(`- Reason changed to ${quote(c.after)}`);
    }
    lines.push("");
  }
  lines.push(`- **Company:** ${mdxText(entry.company)}`);
  lines.push(`- **Brand:** ${mdxText(n?.brands?.join(", ") || entry.brand || "not stated")}`);
  lines.push(`- **Product:** ${mdxText(n?.productDescriptions?.join("; ") || entry.productDescription)}`);
  lines.push(`- **Reason (FDA summary):** ${quote(n?.reason || entry.reasonDescription || entry.reasonCategory)}`);
  if (n) {
    lines.push(...list("Products, lots and identifiers in the notice", n.identifiers, "the notice gives no lot or size detail beyond the product name; read the official notice"));
    lines.push(...list("Where it was sold", n.distribution));
    lines.push(...list("What the notice tells consumers to do", n.instructions, "see the official notice"));
  } else {
    lines.push("- **Products, lots and instructions:** the announcement page could not be read on this run; see the official notice");
  }
  lines.push(`- **Announced:** company announcement ${formatLongDate(entry.companyAnnouncementDate)}; posted by FDA ${formatLongDate(entry.fdaPublishDate || entry.listingDate)}`);
  const enforcement = Object.values(history.entries).find((e) => e.source === SOURCES.enforcement.id && e.related.includes(entry.key));
  if (enforcement) lines.push(`- **Enforcement Report:** first listed ${formatLongDate(enforcement.firstReportDate)} (FDA Event ID ${mdxText(enforcement.eventId)})`);
  lines.push(`- **Official notice:** [${mdxText(entry.title || "FDA-posted company announcement")}](${entry.url})`);
  for (const t of n?.tables || []) lines.push(...table(t));
  lines.push("");
  return lines;
}

function renderEnforcementCard(entry, event, history, weekCsvUrl) {
  const lines = [`### ${mdxText(entry.firm)}: FDA Event ID ${mdxText(entry.eventId)}`, ""];
  const prior = event.priorAnnouncement ? history.entries[event.priorAnnouncement] : null;
  if (event.kind === "enforcement_listed") {
    const later = entry.related.map((k) => history.entries[k]).filter((e) => e && e.key !== prior?.key);
    lines.push(prior
      ? `Previously announced: FDA posted the company's notice on ${formatLongDate(prior.fdaPublishDate || prior.listingDate)} ([official notice](${prior.url})). Its listing in the Enforcement Report is not an expansion of that warning.`
      : later.length
        ? `No company announcement had been posted when FDA listed this recall. FDA posted the company's notice later, on ${formatLongDate(later[0].fdaPublishDate || later[0].listingDate)} ([official notice](${later[0].url})).`
        : `FDA's recalls page has no company announcement for this recall, so the Enforcement Report is the public record. Not every recall gets a press release.`);
  } else if (event.kind === "classified") {
    const c = event.changes[0];
    lines.push(`FDA classified this recall as ${mdxText(c.after || "not stated")}${c.recallNumber ? ` (recall number ${mdxText(c.recallNumber)})` : ""}. Classification rates the health risk of a recall already under way; it does not add products.`);
  } else {
    lines.push(`FDA changed this Enforcement Report record (${formatLongDate(event.date)}). What changed:`, "");
    for (const c of event.changes || []) {
      if (typeof c === "string") lines.push(`- ${mdxText(c)}`);
      else lines.push(`- ${mdxText(c.field)}${c.recallNumber ? ` (${mdxText(c.recallNumber)})` : ""}: ${c.before ? `was ${quote(c.before)}, now ` : ""}${quote(c.after)}`);
    }
  }
  lines.push("", `- **Recalling firm:** ${mdxText(entry.firm)}${entry.location ? `, ${mdxText(entry.location)}` : ""}`);
  lines.push(`- **Recall started:** ${formatLongDate(entry.initiationDate)}; ${mdxText(entry.voluntary || "voluntary/mandated not stated")}`);
  if (entry.distribution) lines.push(`- **Distribution:** ${quote(entry.distribution)}`);
  lines.push("");
  for (const p of entry.products) {
    lines.push(`- **Product:** ${quote(p.productDescription)}`);
    lines.push(`  - **Lots / codes:** ${p.codeInfo ? quote(p.codeInfo) : "not stated"}`);
    if (p.quantity) lines.push(`  - **Quantity:** ${quote(p.quantity)}`);
    lines.push(`  - **Reason:** ${quote(p.reason)}`);
    lines.push(`  - **Classification:** ${mdxText(p.classification || "not stated")}${p.recallNumber ? `; recall number ${mdxText(p.recallNumber)}` : ""}`);
  }
  lines.push("", `Source: [FDA Enforcement Report, week of ${formatLongDate(event.kind === "enforcement_listed" ? event.date : entry.firstReportDate)}](${weekCsvUrl(event.kind === "enforcement_listed" ? event.date : entry.firstReportDate)}) (CSV), searchable at [FDA Enforcement Reports](${SOURCES.enforcement.url}).`, "");
  return lines;
}

/** Build the digest MDX and its review sidecar for one week. */
export function renderDigest({ history, window, coverage, generatedOn, author = "sean-cheick-baradji" }) {
  const selection = selectWeek(history, window);
  const label = weekLabel(window);
  const slug = `supplement-recalls-week-of-${window.start}`;
  const items = [...selection.newAnnouncements, ...selection.updates, ...selection.enforcementListings, ...selection.classifications];
  const firms = [...new Set(items.map(({ entry }) => entry.company || entry.firm))];
  const products = countProducts(selection);
  // Unclassified records keep the week unsettled even when every source was
  // read: no "every recall", no "no recalls" until a person classifies them.
  const unresolved = (coverage.possibleSupplements?.length || 0) + (coverage.openFdaOnly?.length || 0);
  const settled = coverage.complete && unresolved === 0;
  const quiet = settled && items.length === 0;

  const description = !coverage.complete
    ? `FDA dietary-supplement recall notices for ${label}. Coverage for this week is incomplete; see the note in the post.`
    : !settled
      ? `FDA dietary-supplement recall notices for ${label} confirmed so far; ${unresolved} more record${unresolved === 1 ? " is" : "s are"} still being checked.`
      : quiet
      ? `FDA posted no new dietary-supplement recall notices, Enforcement Report listings or updates for ${label} in the sources we check.`
      : `FDA dietary-supplement recall notices for ${label}: ${products} product listing${products === 1 ? "" : "s"} from ${firms.length} compan${firms.length === 1 ? "y" : "ies"}, with exact lots and the official notice for each.`;

  const fm = [
    "---",
    `title: "PharmaGuide Weekly: Supplement Recalls and Safety Updates, ${label}"`,
    `seoTitle: "Supplement recalls, ${label}"`,
    `description: ${JSON.stringify(description)}`,
    `slug: "${slug}"`,
    `category: "safety-alerts"`,
    `format: "recall-digest"`,
    `date: "${generatedOn}"`,
    `author: "${author}"`,
    "featured: false",
    `image: "/images/moments/recall.jpg"`,
    `tags: ${JSON.stringify(["FDA recall", "dietary supplements", "weekly recall roundup", ...firms.slice(0, 6)])}`,
    "review_required: true",
    "---",
    "",
  ];

  const enforcementWeeks = wednesdaysIn(window);
  const sourcesLine = `We checked FDA's [Recalls, Market Withdrawals & Safety Alerts](${SOURCES.listing.url}) list and the [FDA Enforcement Report](${SOURCES.enforcement.url}) for ${enforcementWeeks.map(formatLongDate).join(" and ") || "this week"}.`;

  const body = [
    `${settled ? "Every dietary-supplement recall" : "The dietary-supplement recalls we could confirm that"} FDA posted between ${formatLongDate(window.start)} and ${formatLongDate(window.end)}, product by product. Each recall covers only the products, lots and sizes listed in its notice. It does not mean every product containing the same ingredient is affected.`,
    "",
    `<Callout tone="info">`,
    `This roundup restates official FDA notices; it is not medical advice. If you have one of these products, check the lot and size against the notice and follow its instructions. A pharmacist or your clinician can help if you have taken it and have questions.`,
    `</Callout>`,
    "",
  ];

  if (!coverage.complete) {
    body.push(
      `<Callout tone="warn">`,
      `**Coverage for this week is incomplete.** These sources could not be read after repeated attempts: ${coverage.gaps.map(mdxText).join("; ")}. This post lists what we could confirm. It is not a complete list, and an empty section below does not mean there were no recalls.`,
      `</Callout>`,
      ""
    );
  } else if (!settled) {
    body.push(
      `<Callout tone="warn">`,
      `**${unresolved} FDA record${unresolved === 1 ? "" : "s"} from this week may involve a dietary supplement and ${unresolved === 1 ? "is" : "are"} still being checked.** Until ${unresolved === 1 ? "it is" : "they are"}, this is not a complete list, and an empty section below does not mean there were no recalls.`,
      `</Callout>`,
      ""
    );
  }

  const section = (heading, intro, entries, render, emptyText) => {
    body.push(`## ${heading}`, "", intro, "");
    if (entries.length) for (const { entry, event } of entries) body.push(...render(entry, event));
    else body.push(settled ? emptyText : `Nothing confirmed yet (see the note above).`, "");
  };

  if (quiet) {
    body.push(
      `## Were there any supplement recalls this week?`,
      "",
      `No. ${sourcesLine} Neither listed a new dietary-supplement recall, a supplement recall newly added to the Enforcement Report, or an update to an earlier supplement recall for ${label}.`,
      ""
    );
  } else {
    section(
      "New recall announcements this week",
      `Company recall announcements that FDA posted on its [recalls page](${SOURCES.listing.url}) this week.`,
      selection.newAnnouncements,
      (e, ev) => renderAnnouncementCard(e, ev, history),
      "None this week."
    );
    section(
      "Updates to earlier recalls",
      `Changes to recalls announced before this week: more lots or products, corrected details or new instructions, from the [FDA-posted notices](${SOURCES.listing.url}) and the [Enforcement Report](${SOURCES.enforcement.url}).`,
      selection.updates,
      (e, ev) => (e.source === SOURCES.enforcement.id ? renderEnforcementCard(e, ev, history, SOURCES.enforcement.weeklyCsv) : renderAnnouncementCard(e, ev, history)),
      "None this week."
    );
    section(
      "Newly listed in FDA's Enforcement Report",
      `FDA's weekly [Enforcement Report](${SOURCES.enforcement.url}) lists recalls after FDA reviews them, often weeks after the company's announcement. A listing here is not a new warning or an expansion of an earlier one.`,
      [...selection.enforcementListings, ...selection.classifications],
      (e, ev) => renderEnforcementCard(e, ev, history, SOURCES.enforcement.weeklyCsv),
      "No dietary-supplement recalls this week."
    );
  }

  body.push(
    `## How we put this roundup together`,
    "",
    `${sourcesLine} We include a recall when FDA files it under dietary supplements or the product description names a supplement. Product details, reasons and instructions are quoted from the notice. openFDA was used only to cross-check, as [its documentation](${SOURCES.openfda.url}) advises. If a source cannot be read, we say so above rather than report a quiet week.`,
    "",
    `A recall is about specific products, not an ingredient. To see how PharmaGuide checks a product you already own, read [how it works](/how-it-works/) and [our methodology](/methodology/). More safety posts are on the [blog](/blog/).`,
    "",
    "<Sources>",
    `- [FDA: Recalls, Market Withdrawals & Safety Alerts](${SOURCES.listing.url})`,
    `- [FDA: Enforcement Reports](${SOURCES.enforcement.url})`,
    ...[...new Set(items.filter(({ entry }) => entry.url).map(({ entry }) => entry.url))].map((u) => {
      const e = items.find(({ entry }) => entry.url === u).entry;
      return `- [${mdxText(e.title || `${e.company}: FDA-posted company announcement`)}](${u})`;
    }),
    `- [openFDA: food enforcement API](${SOURCES.openfda.url})`,
    "</Sources>",
    ""
  );

  const review = renderReview({ slug, label, window, coverage, selection, history, generatedOn, quiet });
  return { slug, mdx: [...fm, ...body].join("\n"), review, selection, quiet };
}

const unresolvedCount = (coverage) => (coverage.possibleSupplements?.length || 0) + (coverage.openFdaOnly?.length || 0);

function renderReview({ slug, label, coverage, selection, generatedOn, quiet }) {
  const lines = [
    `# Review: ${slug}`,
    "",
    `Generated ${generatedOn} by \`pnpm recalls:digest\`. Week: ${label}.`,
    "",
    `## Coverage: ${coverage.complete ? "complete" : "INCOMPLETE"}${quiet ? " (quiet week)" : ""}${unresolvedCount(coverage) ? ` — ${unresolvedCount(coverage)} record(s) need classifying before the week is complete` : ""}`,
    "",
    "| Source | Required | Status | Attempts | Records | Supplement records | Detail |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...coverage.sources.map((s) => `| ${s.label} | ${s.required ? "yes" : "no"} | ${s.status}${s.error ? ` (${s.error})` : ""} | ${s.attempts ?? ""} | ${s.records ?? ""} | ${s.supplementRecords ?? ""} | ${s.detail ?? ""} |`),
    "",
  ];
  if (coverage.possibleSupplements?.length) {
    lines.push("## Possible supplements: confirm or ignore", "", "Enforcement Report records this week that read like supplements but don't say so. They are not in the post. If one is a dietary supplement, add a card by hand.", "");
    for (const p of coverage.possibleSupplements) lines.push(`- ${p.firm} (Event ${p.eventId}, ${p.recallNumber || "no recall number"}): ${p.productDescription.slice(0, 160)}`);
    lines.push("");
  }
  if (coverage.openFdaOnly?.length) {
    lines.push("## Only in openFDA: classify each", "", "openFDA lists these supplement enforcement records for the week but the Enforcement Report CSVs did not. Find each in the Enforcement Report; add a card if it is a dietary supplement this week.", "");
    for (const n of coverage.openFdaOnly) lines.push(`- ${n}`);
    lines.push("");
  }
  if (coverage.crossCheck) {
    lines.push("## openFDA cross-check", "", coverage.crossCheck, "");
  }
  lines.push("## Check every card against its notice", "");
  const all = [...selection.newAnnouncements, ...selection.updates, ...selection.enforcementListings, ...selection.classifications];
  if (!all.length) lines.push("No items selected.", "");
  for (const { entry, event } of all) {
    lines.push(`### ${entry.company || entry.firm} — ${event.kind} (${event.date})`, "", `- Key: \`${entry.key}\``, `- Why included: ${entry.matchReason}`);
    if (entry.url) lines.push(`- Notice: ${entry.url}`);
    lines.push("- [ ] Brand, product, lots, sizes and identifiers match the notice", "- [ ] Reason and instructions are quoted, not paraphrased", "- [ ] Not generalised to an ingredient", "");
    if (entry.noticeText) lines.push("Full notice text as fetched:", "", ...entry.noticeText.map((p) => `> ${p}`), "");
  }
  lines.push(
    "## Before publishing",
    "",
    "- [ ] Every card checked against its official notice (above)",
    "- [ ] Coverage note matches the table above; never publish \"no recalls\" on incomplete coverage",
    "- [ ] Every record listed under Possible supplements / Only in openFDA is classified; re-render (`pnpm recalls:digest --week-ending <Sunday>`) once none are left, so the post can drop its \"still being checked\" note",
    "- [ ] PharmD sign-off on this exact version (any sentence that interprets risk beyond quoting the notice especially)",
    `- [ ] After sign-off: \`pnpm blog:approve ${slug} --reviewer laurie-pham --date <sign-off date>\` (moves the draft live, runs publish-check, rolls back on failure)`,
    ""
  );
  return lines.join("\n");
}

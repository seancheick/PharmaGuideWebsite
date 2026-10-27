#!/usr/bin/env node
/**
 * Weekly dietary-supplement recall digest.
 *
 *   pnpm recalls:digest                         # last complete Mon–Sun week
 *   pnpm recalls:digest --week-ending 2026-10-25
 *   pnpm recalls:digest --collect-only          # update history, no draft
 *
 * Reads FDA's recalls listing and announcement pages plus the weekly
 * Enforcement Report CSVs, merges them into content/recalls/history.json,
 * and writes a draft to content/blog/.drafts/<slug>.mdx with a review
 * sidecar in content/blog/.review/. Drafts under .drafts/ are not loaded by
 * the site; publishing is a human step (see the sidecar checklist).
 *
 * Exit codes: 0 complete coverage, 3 coverage incomplete (draft still
 * written, flagged), 2 bad arguments.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SOURCES,
  addDays,
  defaultWeekEnding,
  emptyHistory,
  fetchWithRetry,
  inWindow,
  isoDate,
  looksLikeEnforcementCsv,
  mergeAnnouncement,
  mergeEnforcementEvent,
  parseAnnouncement,
  parseEnforcementCsv,
  parseListing,
  parseUpdatedReportDates,
  possibleSupplement,
  renderDigest,
  selectWeek,
  summarizeCoverage,
  supplementEnforcementMatch,
  supplementListingMatch,
  wednesdaysIn,
  weekWindow,
} from "./lib/recalls.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HISTORY = path.join(ROOT, "content", "recalls", "history.json");
const DRAFTS = path.join(ROOT, "content", "blog", ".drafts");
const REVIEWS = path.join(ROOT, "content", "blog", ".review");

// Announcement pages re-read for changes (expanded lots, new instructions).
const REFRESH_DAYS = 90;
// Enforcement weeks read on a first run so later listings can be linked to
// the announcement they follow.
const BACKFILL_WEEKS = 8;

async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }));
  return out;
}

/**
 * Collect every source for `window` and merge into `history` (mutated).
 * `fetchOpts` is passed to fetchWithRetry, so tests can inject fetch.
 */
export async function collect({ history, window, today, fetchOpts = {}, openFdaKey = process.env.OPENFDA_API_KEY }) {
  const sources = [];
  const runDate = today;

  // 1. Recalls listing (required).
  const listingRes = await fetchWithRetry(SOURCES.listing.data, {
    ...fetchOpts,
    accept: (t) => { try { return Array.isArray(JSON.parse(t)); } catch { return false; } },
  });
  let supplementRows = [];
  if (listingRes.ok) {
    const rows = parseListing(listingRes.text);
    supplementRows = rows.map((r) => ({ row: r, matchReason: supplementListingMatch(r) })).filter((x) => x.matchReason);
    const newest = rows.map((r) => r.date).filter(Boolean).sort().pop();
    sources.push({ id: SOURCES.listing.id, label: SOURCES.listing.label, required: true, status: "ok", attempts: listingRes.attempts, records: rows.length, supplementRecords: supplementRows.length, detail: `newest posting ${newest}` });
    if (newest && newest < window.end) {
      // The listing has nothing after mid-week: possible, but worth a human look.
      sources[sources.length - 1].detail += `; nothing posted after ${newest}`;
    }
  } else {
    sources.push({ id: SOURCES.listing.id, label: SOURCES.listing.label, required: true, status: "failed", attempts: listingRes.attempts, error: listingRes.error });
  }

  // 1b. Announcement pages: this week's (required) and recent ones (refresh).
  const refreshFrom = addDays(window.start, -REFRESH_DAYS);
  const wanted = supplementRows.filter(({ row }) => row.date && row.date >= refreshFrom && row.date <= today);
  const pages = await pool(wanted, 4, async ({ row, matchReason }) => {
    // Company announcements and FDA's own alerts share the page summary block.
    const res = await fetchWithRetry(row.url, { ...fetchOpts, accept: (t) => /Company Announcement|FDA Publish Date/i.test(t) });
    return { row, matchReason, res };
  });
  const pageFailures = pages.filter((p) => !p.res.ok);
  const weekFailures = pageFailures.filter((p) => inWindow(p.row.date, window));
  sources.push({
    id: SOURCES.announcements.id,
    label: SOURCES.announcements.label,
    required: true,
    status: pageFailures.length ? "failed" : "ok",
    attempts: Math.max(0, ...pages.map((p) => p.res.attempts || 0)),
    records: pages.length,
    supplementRecords: pages.length - pageFailures.length,
    detail: `pages posted since ${refreshFrom}`,
    error: pageFailures.length ? `${pageFailures.length} page(s) unreadable${weekFailures.length ? `, ${weekFailures.length} from this week` : ""}: ${pageFailures.map((p) => p.row.url).join(", ")}` : undefined,
  });

  // Merge oldest first so an expansion notice finds the notice it expands.
  const details = new Map(pages.filter((p) => p.res.ok).map((p) => [p.row.path, parseAnnouncement(p.res.text)]));
  for (const { row, matchReason } of [...supplementRows].sort((a, b) => (a.row.date || "").localeCompare(b.row.date || ""))) {
    mergeAnnouncement(history, row, details.get(row.path) || null, { runDate, matchReason });
  }
  const supplementAnnouncements = Object.values(history.entries).filter((e) => e.source === SOURCES.listing.id);

  // 2. Enforcement Reports: this week's Wednesday reports (required), FDA's
  // list of reports with recently updated records (required: updates), and
  // a backfill on a first run (optional: only improves linking).
  const reportDates = new Map(); // iso → reason
  for (const d of wednesdaysIn(window)) reportDates.set(d, "this week");
  const updatedRes = await fetchWithRetry(SOURCES.enforcement.updatedDates, {
    ...fetchOpts,
    init: { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "action=facades.getUpdatedReportDates" },
    accept: (t) => { try { return Array.isArray(JSON.parse(t).DATA); } catch { return false; } },
  });
  if (updatedRes.ok) {
    for (const d of parseUpdatedReportDates(updatedRes.text)) if (!reportDates.has(d) && d <= window.end) reportDates.set(d, "has updated records");
  }
  sources.push({ id: `${SOURCES.enforcement.id}_updates`, label: "FDA Enforcement Report: reports with updated records", required: true, status: updatedRes.ok ? "ok" : "failed", attempts: updatedRes.attempts, error: updatedRes.ok ? undefined : updatedRes.error });
  const isFirstRun = !Object.values(history.entries).some((e) => e.source === SOURCES.enforcement.id);
  if (isFirstRun) {
    for (let i = 1; i <= BACKFILL_WEEKS; i++) {
      const d = addDays(wednesdaysIn(window)[0] || window.start, -7 * i);
      if (!reportDates.has(d)) reportDates.set(d, "first-run backfill");
    }
  }

  const reports = await pool([...reportDates].sort(([a], [b]) => a.localeCompare(b)), 3, async ([date, why]) => {
    const res = await fetchWithRetry(SOURCES.enforcement.weeklyCsv(date), { ...fetchOpts, encoding: "windows-1252", accept: looksLikeEnforcementCsv });
    return { date, why, res };
  });
  const supplementRecords = [];
  const possible = [];
  for (const { date, why, res } of reports) {
    const required = why !== "first-run backfill";
    if (!res.ok) {
      sources.push({ id: `${SOURCES.enforcement.id}:${date}`, label: `${SOURCES.enforcement.label}, ${date}`, required, status: "failed", attempts: res.attempts, error: res.error, detail: why });
      continue;
    }
    const rows = parseEnforcementCsv(res.text);
    const matched = rows.map((r) => ({ r, matchReason: supplementEnforcementMatch(r, supplementAnnouncements) })).filter((x) => x.matchReason);
    supplementRecords.push(...matched.map((m) => ({ ...m, date })));
    if (inWindow(date, window)) possible.push(...rows.filter((r) => !supplementEnforcementMatch(r, supplementAnnouncements) && possibleSupplement(r)));
    sources.push({ id: `${SOURCES.enforcement.id}:${date}`, label: `${SOURCES.enforcement.label}, ${date}`, required, status: "ok", attempts: res.attempts, records: rows.length, supplementRecords: matched.length, detail: why });
  }
  const byEvent = new Map();
  for (const m of supplementRecords.sort((a, b) => a.date.localeCompare(b.date))) {
    if (!byEvent.has(m.date + m.r.eventId)) byEvent.set(m.date + m.r.eventId, []);
    byEvent.get(m.date + m.r.eventId).push(m);
  }
  for (const group of byEvent.values()) {
    mergeEnforcementEvent(history, group.map((g) => g.r), { runDate, matchReason: group[0].matchReason });
  }

  // 3. openFDA cross-check (optional; never a source of entries).
  const coverage = summarizeCoverage(sources);
  coverage.possibleSupplements = possible;
  const q = `report_date:[${window.start.replaceAll("-", "")}+TO+${window.end.replaceAll("-", "")}]+AND+product_description:"supplement"`;
  const ofRes = await fetchWithRetry(`https://api.fda.gov/food/enforcement.json?search=${q}&limit=1000${openFdaKey ? `&api_key=${openFdaKey}` : ""}`, {
    ...fetchOpts,
    okStatuses: [404],
    accept: (t) => { try { const j = JSON.parse(t); return Array.isArray(j.results) || j.error?.code === "NOT_FOUND"; } catch { return false; } },
  });
  if (ofRes.ok) {
    const results = JSON.parse(ofRes.text).results || [];
    const ours = new Set(supplementRecords.filter((m) => inWindow(m.r.reportDate, window)).map((m) => m.r.recallNumber).filter(Boolean));
    const theirs = new Set(results.map((r) => r.recall_number));
    const onlyOpen = [...theirs].filter((n) => !ours.has(n));
    const onlyOurs = [...ours].filter((n) => !theirs.has(n));
    coverage.crossCheck = `openFDA lists ${theirs.size} food enforcement record(s) mentioning "supplement" with a report date in this week; the Enforcement Report CSVs gave ${ours.size} classified supplement record(s). Only in openFDA: ${onlyOpen.join(", ") || "none"}. Only in the Enforcement Report: ${onlyOurs.join(", ") || "none"}. openFDA lags and is cross-check only; investigate any record only in openFDA.`;
  }
  coverage.sources.push({ id: SOURCES.openfda.id, label: SOURCES.openfda.label, required: false, status: ofRes.ok ? "ok" : "failed", attempts: ofRes.attempts, error: ofRes.ok ? undefined : ofRes.error });
  return coverage;
}

function parseArgs(argv) {
  const args = { collectOnly: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--week-ending") args.weekEnding = argv[++i];
    else if (argv[i] === "--collect-only") args.collectOnly = true;
    else if (argv[i] === "--history") args.history = argv[++i];
    else throw new Error(`unknown argument ${argv[i]}`);
  }
  return args;
}

async function main() {
  let args;
  try { args = parseArgs(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(2); }
  const today = isoDate(new Date());
  const weekEnding = args.weekEnding || defaultWeekEnding(today);
  let window;
  try { window = weekWindow(weekEnding); } catch (e) { console.error(e.message); process.exit(2); }
  if (window.end >= today) {
    console.error(`week ending ${weekEnding} is not over yet (today ${today}); pick an earlier Sunday`);
    process.exit(2);
  }
  const historyPath = args.history ? path.resolve(args.history) : HISTORY;
  const history = fs.existsSync(historyPath) ? JSON.parse(fs.readFileSync(historyPath, "utf8")) : emptyHistory();

  const coverage = await collect({ history, window, today });
  const selection = selectWeek(history, window);
  const counts = Object.fromEntries(Object.entries(selection).map(([k, v]) => [k, v.length]));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  history.weeks[weekEnding] = {
    window,
    lastRun: today,
    coverageComplete: coverage.complete,
    gaps: coverage.gaps,
    counts,
    quietWeek: coverage.complete && total === 0,
    events: Object.values(selection).flat().map(({ entry, event }) => `${entry.key}#${event.id}`),
  };
  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2) + "\n");

  console.log(`Week ${window.start} → ${window.end}: coverage ${coverage.complete ? "complete" : "INCOMPLETE"}`);
  for (const s of coverage.sources) console.log(`  ${s.status === "ok" ? "✓" : s.required ? "✕" : "·"} ${s.label}${s.records !== undefined ? `: ${s.records} records, ${s.supplementRecords} supplement` : ""}${s.error ? ` — ${s.error}` : ""}`);
  console.log(`  new ${counts.newAnnouncements}, updates ${counts.updates}, enforcement listings ${counts.enforcementListings}, classifications ${counts.classifications}`);
  console.log(`History: ${path.relative(ROOT, historyPath)}`);

  if (!args.collectOnly) {
    const { slug, mdx, review } = renderDigest({ history, window, coverage, generatedOn: today });
    fs.mkdirSync(DRAFTS, { recursive: true });
    fs.mkdirSync(REVIEWS, { recursive: true });
    fs.writeFileSync(path.join(DRAFTS, `${slug}.mdx`), mdx);
    fs.writeFileSync(path.join(REVIEWS, `${slug}.review.md`), review);
    console.log(`Draft:  content/blog/.drafts/${slug}.mdx`);
    console.log(`Review: content/blog/.review/${slug}.review.md`);
    console.log(`Check:  node scripts/validate-blog.mjs .drafts/${slug}`);
  }
  process.exit(coverage.complete ? 0 : 3);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

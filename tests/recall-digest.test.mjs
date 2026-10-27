// Weekly supplement-recall digest: dedupe, new-vs-update classification and
// the failed-source path. Run: pnpm test:recalls
import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyHistory,
  extractScope,
  fetchWithRetry,
  mdxText,
  mergeAnnouncement,
  mergeEnforcementEvent,
  mergeHistories,
  parseAnnouncement,
  parseEnforcementCsv,
  renderDigest,
  selectWeek,
  supplementEnforcementMatch,
  weekWindow,
  defaultWeekEnding,
} from "../scripts/lib/recalls.mjs";
import { collect } from "../scripts/recall-digest.mjs";

const WEEK = weekWindow("2026-10-25");
const RUN = "2026-10-27";

function listingRow(over = {}) {
  return {
    path: "/safety/recalls-market-withdrawals-safety-alerts/acme-recalls-sleepwell",
    url: "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/acme-recalls-sleepwell",
    date: "2026-10-21",
    brand: "SleepWell",
    company: "Acme Nutrition, LLC",
    productDescription: "Melatonin gummies",
    reasonCategory: "Ingredient Level",
    reasonDescription: "Melatonin above label claim",
    regulatedProducts: "Dietary Supplements",
    terms: "Dietary Supplements",
    ...over,
  };
}

function page({ title = "Acme Nutrition Recalls SleepWell Melatonin Gummies", lots = "Lot 24A1, exp 03/2027", current = "10/21/2026", date = "October 21, 2026", extra = "" } = {}) {
  return `<html><h1>${title}</h1>
  <dl><dt>Company Announcement Date:</dt><dd><time>${date}</time></dd>
  <dt>FDA Publish Date:</dt><dd><time>${date}</time></dd>
  <dt>Product Type:</dt><dd>Dietary Supplements</dd>
  <dt>Reason for Announcement:</dt><dd><div class="field--label">Recall Reason Description</div><div class="field--item">Melatonin above label claim</div></dd>
  <dt>Company Name:</dt><dd>Acme Nutrition, LLC</dd>
  <dt>Brand Name:</dt><dd><div class="field--label">Brand Name(s)</div><div class="field--items"><div class="field--item">SleepWell</div></div></dd>
  <dt>Product Description:</dt><dd><div class="field--label">Product Description</div><div class="field--items"><div class="field--item">Melatonin gummies</div></div></dd></dl>
  <h2 id="recall-announcement">Company Announcement</h2>
  <p>Acme Nutrition, LLC is recalling SleepWell Melatonin Gummies, 60 count bottles, ${lots}.</p>
  <p>The product was distributed nationwide through retail stores.</p>${extra}
  <p>Sales were stopped and customers were notified to return remaining product.</p>
  <p>Consumers should stop using the product and return it for a refund.</p>
  <p>Adverse reactions or quality problems may be reported to the FDA's MedWatch program.</p>
  <h2>Company Contact Information</h2>
  <h2>Content current as of:</h2><p><time>${current}</time></p></html>`;
}

const CSV_HEADER = "Product Type,Recently Updated Record,Last Modified Date,Event ID,Status,Recalling Firm,Address1,Address2,City,State/Province,Postal Code,Country,Voluntary/Mandated,Initial Firm Notification of Consignee or Public,Distribution Pattern,Recall Number,Classification,Product Description,Product Quantity,Reason for Recall,Recall Initiation Date,Center Classification Date,Termination Date,Report Date,Code Info,More Code Info";
const csvRow = (o = {}) => {
  const r = { type: "Food", updated: "No", modified: "", event: "99001", firm: "Acme Nutrition LLC", recall: "N/A", cls: "Not Yet Classified", desc: "SleepWell Melatonin Gummies dietary supplement, 60 count", reason: "Melatonin above label claim", start: "10/14/2026", clsDate: "", report: "10/21/2026", code: "Lot 24A1", ...o };
  return [r.type, r.updated, r.modified, r.event, "Ongoing", r.firm, "1 Main St", "N/A", "Austin", "TX", "78701", "United States", "Voluntary: Firm initiated", "Letter", "Nationwide", r.recall, r.cls, r.desc, "1,000 bottles", r.reason, r.start, r.clsDate, "N/A", r.report, r.code, ""].map((v) => `"${v}"`).join(",");
};
const csv = (...rows) => [CSV_HEADER, ...rows].join("\r\n") + "\r\n";

// ─── Dedupe ─────────────────────────────────────────────────────────

test("re-running the same announcement never duplicates the entry or its event", () => {
  const h = emptyHistory();
  const detail = parseAnnouncement(page());
  mergeAnnouncement(h, listingRow(), detail, { runDate: RUN, matchReason: "t" });
  mergeAnnouncement(h, listingRow(), detail, { runDate: RUN, matchReason: "t" });
  mergeAnnouncement(h, listingRow(), detail, { runDate: "2026-10-28", matchReason: "t" });
  assert.equal(Object.keys(h.entries).length, 1);
  const [entry] = Object.values(h.entries);
  assert.deepEqual(entry.events.map((e) => e.kind), ["new_announcement"]);
});

test("re-reading the same Enforcement Report event never duplicates it", () => {
  const h = emptyHistory();
  const rows = parseEnforcementCsv(csv(csvRow()));
  mergeEnforcementEvent(h, rows, { runDate: RUN, matchReason: "t" });
  mergeEnforcementEvent(h, parseEnforcementCsv(csv(csvRow())), { runDate: "2026-10-28", matchReason: "t" });
  assert.equal(Object.keys(h.entries).length, 1);
  const [entry] = Object.values(h.entries);
  assert.equal(entry.products.length, 1);
  assert.deepEqual(entry.events.map((e) => e.kind), ["enforcement_listed"]);
});

// ─── New vs update ──────────────────────────────────────────────────

test("a changed notice (more lots) is an update dated by FDA's page, not a new recall", () => {
  const h = emptyHistory();
  mergeAnnouncement(h, listingRow({ date: "2026-10-01" }), parseAnnouncement(page({ date: "October 1, 2026", current: "10/01/2026" })), { runDate: "2026-10-02", matchReason: "t" });
  const added = mergeAnnouncement(h, listingRow({ date: "2026-10-01" }), parseAnnouncement(page({ date: "October 1, 2026", lots: "Lots 24A1 and 24A2, exp 03/2027", current: "10/22/2026" })), { runDate: RUN, matchReason: "t" });
  assert.equal(added.length, 1);
  assert.equal(added[0].kind, "updated");
  assert.equal(added[0].date, "2026-10-22");
  assert.ok(added[0].changes.some((c) => c.field === "identifiers" && c.added[0].includes("24A2")));
  const week = selectWeek(h, WEEK);
  assert.equal(week.newAnnouncements.length, 0);
  assert.equal(week.updates.length, 1);
});

test("a first read of a page sets a baseline without inventing an update", () => {
  const h = emptyHistory();
  mergeAnnouncement(h, listingRow({ date: "2026-09-01" }), null, { runDate: "2026-09-02", matchReason: "t" });
  const added = mergeAnnouncement(h, listingRow({ date: "2026-09-01" }), parseAnnouncement(page()), { runDate: RUN, matchReason: "t" });
  assert.deepEqual(added, []);
});

test("an expansion notice from the same firm is an update linked to the earlier notice", () => {
  const h = emptyHistory();
  mergeAnnouncement(h, listingRow({ date: "2026-09-10" }), parseAnnouncement(page({ date: "September 10, 2026" })), { runDate: "2026-09-11", matchReason: "t" });
  const row = listingRow({ path: "/safety/recalls-market-withdrawals-safety-alerts/acme-expands-recall", url: "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/acme-expands-recall" });
  const [event] = mergeAnnouncement(h, row, parseAnnouncement(page({ title: "Acme Nutrition Expands Recall of SleepWell Melatonin Gummies" })), { runDate: RUN, matchReason: "t" });
  assert.equal(event.kind, "updated");
  assert.ok(event.prior.endsWith("acme-recalls-sleepwell"));
  const week = selectWeek(h, WEEK);
  assert.equal(week.newAnnouncements.length, 0);
  assert.equal(week.updates.length, 1);
});

test("an Enforcement Report listing of an announced recall is 'previously announced', not new", () => {
  const h = emptyHistory();
  mergeAnnouncement(h, listingRow({ date: "2026-10-06" }), parseAnnouncement(page({ date: "October 6, 2026" })), { runDate: "2026-10-07", matchReason: "t" });
  const [event] = mergeEnforcementEvent(h, parseEnforcementCsv(csv(csvRow())), { runDate: RUN, matchReason: "t" });
  assert.equal(event.kind, "enforcement_listed");
  assert.ok(event.priorAnnouncement.endsWith("acme-recalls-sleepwell"));
  const week = selectWeek(h, WEEK);
  assert.equal(week.newAnnouncements.length, 0);
  assert.equal(week.enforcementListings.length, 1);
  const { mdx } = renderDigest({ history: h, window: WEEK, coverage: { complete: true, sources: [], gaps: [] }, generatedOn: RUN });
  assert.match(mdx, /Previously announced: FDA posted the company's notice on October 6, 2026/);
  assert.match(mdx, /not an expansion of that warning/);
});

test("a recall renders as a card: action first, packages in a table, empty categories scoped in one note", () => {
  const h = emptyHistory();
  const extra = "<p>Products subject to the recall include the SleepWell 60-count Bottle (Item #810208, UPC 868592000002) and the SleepWell Travel Pack (Item #810222, UPC 868592000040).</p>";
  mergeAnnouncement(h, listingRow(), parseAnnouncement(page({ extra })), { runDate: RUN, matchReason: "t" });
  const { mdx } = renderDigest({ history: h, window: WEEK, coverage: { complete: true, sources: [], gaps: [] }, generatedOn: RUN });
  assert.match(mdx, /<RecallCard [^>]*action="Stop using the product and return it for a refund\."/);
  assert.match(mdx, /\| SleepWell 60-count Bottle \| 810208 \| 868592000002 \|/);
  assert.match(mdx, /\| SleepWell Travel Pack \| 810222 \| 868592000040 \|/);
  assert.ok(mdx.indexOf("action=") < mdx.indexOf("Check your package"), "the action comes before the package details");
  assert.match(mdx, /Lot 24A1, exp 03\/2027/, "a lot named only in the recalling sentence is never dropped");
  assert.match(mdx, /\*\*Also checked:\*\* no updates to earlier supplement recalls; no supplement recalls newly listed in FDA's Enforcement Report for/);
  assert.doesNotMatch(mdx, /No dietary-supplement recalls this week/);
});

test("classification later is 'classified', never an update or a new recall", () => {
  const h = emptyHistory();
  mergeEnforcementEvent(h, parseEnforcementCsv(csv(csvRow({ report: "10/14/2026" }))), { runDate: "2026-10-15", matchReason: "t" });
  const added = mergeEnforcementEvent(h, parseEnforcementCsv(csv(csvRow({ recall: "H-0101-2027", cls: "Class II", clsDate: "10/20/2026" }))), { runDate: RUN, matchReason: "t" });
  assert.deepEqual(added.map((e) => e.kind), ["classified"]);
  const week = selectWeek(h, WEEK);
  assert.equal(week.updates.length, 0);
  assert.equal(week.classifications.length, 1);
});

test("a product added to an Enforcement Report event is an update", () => {
  const h = emptyHistory();
  mergeEnforcementEvent(h, parseEnforcementCsv(csv(csvRow({ report: "10/14/2026", recall: "H-1", cls: "Class II" }))), { runDate: "2026-10-15", matchReason: "t" });
  const added = mergeEnforcementEvent(h, parseEnforcementCsv(csv(csvRow({ recall: "H-2", cls: "Class II", desc: "SleepWell Melatonin Gummies dietary supplement, 120 count", modified: "10/20/2026" }))), { runDate: RUN, matchReason: "t" });
  assert.equal(added[0].kind, "updated");
  assert.equal(added[0].date, "2026-10-20");
  assert.equal(added[0].changes[0].field, "product added");
});

// ─── Scope and filters ──────────────────────────────────────────────

test("instructions are the notice's words to consumers, not narration or boilerplate", () => {
  const { instructions, identifiers } = extractScope(parseAnnouncement(page()).paragraphs);
  assert.deepEqual(instructions, ["Consumers should stop using the product and return it for a refund."]);
  assert.ok(identifiers[0].includes("Lot 24A1"));
  assert.ok(!instructions.concat(identifiers).some((s) => /MedWatch|customers were notified/.test(s)));
});

test("what a refund requires stays with the instructions", () => {
  const { instructions } = extractScope([
    "Consumers may return unopened or partially used product to a GNC store for a full refund. A receipt or the phone number or email address associated with the loyalty account used for the purchase should be provided so the purchase can be verified.",
    "The receipt printer model was not affected.",
  ]);
  assert.equal(instructions.length, 2);
  assert.match(instructions[1], /^A receipt .* so the purchase can be verified\.$/);
});

test("a grocer with one supplement recall does not pull in its blueberries", () => {
  const ann = { company: "Publix Super Markets, Inc.", brand: "GreenWise", productDescription: "Vitamin D3 softgels", fdaPublishDate: "2026-08-01", url: "u" };
  const [berries] = parseEnforcementCsv(csv(csvRow({ firm: "Publix Super Markets, Inc.", desc: "Organic Whole Blueberries, Net Wt 10 oz" })));
  assert.equal(supplementEnforcementMatch(berries, [ann]), null);
  const [d3] = parseEnforcementCsv(csv(csvRow({ firm: "Publix Super Markets, Inc.", desc: "GreenWise Vitamin D3 2000 IU softgels, 90 ct" })));
  assert.match(supplementEnforcementMatch(d3, [ann]), /announcement/);
});

test("quoted FDA text cannot become JSX or markdown", () => {
  assert.equal(mdxText("<b>{x}</b> *Lot #1*"), "&lt;b&gt;&#123;x&#125;&lt;/b&gt; \\*Lot \\#1\\*");
});

test("the default week is the last complete Monday–Sunday", () => {
  assert.equal(defaultWeekEnding("2026-10-27"), "2026-10-25");
  assert.equal(defaultWeekEnding("2026-10-25"), "2026-10-18");
});

// ─── Failed source ──────────────────────────────────────────────────

function fakeFetch(routes) {
  const calls = [];
  const impl = async (url) => {
    calls.push(url);
    for (const [pattern, respond] of routes) {
      if (url.includes(pattern)) {
        const r = respond(url);
        if (r instanceof Error) throw r;
        return new Response(r.body, { status: r.status ?? 200 });
      }
    }
    return new Response("not found", { status: 404 });
  };
  return { impl, calls };
}

const LISTING = JSON.stringify([{ path: "/safety/recalls-market-withdrawals-safety-alerts/acme-recalls-sleepwell", field_change_date_2: "10/21/2026", field_brand_name: "SleepWell", field_product_description: "Melatonin gummies", field_recall_reason_description: "Melatonin above label claim", field_recall_reason: "Ingredient Level", field_company_name: "Acme Nutrition, LLC", field_regulated_product_field: "Dietary Supplements", "all-terms-rewrite": "Dietary Supplements" }]);
const UPDATED = JSON.stringify({ COLUMNS: ["ENFORCEMENT_REPORT_DT"], DATA: [] });
const fetchOpts = (impl) => ({ fetchImpl: impl, sleep: async () => {}, timeoutMs: 1000 });
const history1 = () => {
  // Not a first run: skip the backfill so only this week's report is fetched.
  const h = emptyHistory();
  h.entries["fda-enforcement:1"] = { key: "fda-enforcement:1", source: "fda_enforcement_report", firm: "x", products: [], related: [], events: [] };
  return h;
};

test("fetchWithRetry retries, then reports the failure instead of throwing", async () => {
  const { impl, calls } = fakeFetch([["example", () => new Error("ECONNRESET")]]);
  const res = await fetchWithRetry("https://example.test/x", fetchOpts(impl));
  assert.equal(res.ok, false);
  assert.equal(calls.length, 3);
  assert.match(res.error, /ECONNRESET/);
});

test("a failed Enforcement Report makes coverage incomplete and the post never says 'no recalls'", async () => {
  const { impl } = fakeFetch([
    ["datatables-json", () => ({ body: "[]" })],
    ["getWeeklyExportCSVResult", () => ({ body: "<!DOCTYPE html><html>error</html>" })],
    ["ires/index.cfm", () => ({ body: UPDATED })],
    ["api.fda.gov", () => ({ status: 404, body: JSON.stringify({ error: { code: "NOT_FOUND" } }) })],
  ]);
  const h = history1();
  const coverage = await collect({ history: h, window: WEEK, today: RUN, fetchOpts: fetchOpts(impl), openFdaKey: "" });
  assert.equal(coverage.complete, false);
  assert.ok(coverage.gaps.some((g) => g.includes("Enforcement Report, 2026-10-21")));
  const { mdx, quiet, review } = renderDigest({ history: h, window: WEEK, coverage, generatedOn: RUN });
  assert.equal(quiet, false);
  assert.match(mdx, /Coverage for this week is incomplete/);
  assert.doesNotMatch(mdx, /No dietary-supplement recalls this week|Were there any supplement recalls this week/);
  assert.match(review, /Source collection: INCOMPLETE/);
});

test("a failed recalls listing makes coverage incomplete even when everything else is fine", async () => {
  const { impl } = fakeFetch([
    ["datatables-json", () => ({ status: 503, body: "busy" })],
    ["getWeeklyExportCSVResult", () => ({ body: csv() })],
    ["ires/index.cfm", () => ({ body: UPDATED })],
    ["api.fda.gov", () => ({ status: 404, body: JSON.stringify({ error: { code: "NOT_FOUND" } }) })],
  ]);
  const coverage = await collect({ history: history1(), window: WEEK, today: RUN, fetchOpts: fetchOpts(impl), openFdaKey: "" });
  assert.equal(coverage.complete, false);
  assert.ok(coverage.gaps.some((g) => g.startsWith("FDA Recalls, Market Withdrawals")));
});

test("a quiet week with every source read is reported as quiet", async () => {
  const { impl } = fakeFetch([
    ["datatables-json", () => ({ body: "[]" })],
    ["getWeeklyExportCSVResult", () => ({ body: csv(csvRow({ desc: "Organic blueberries", firm: "Berry Farm" })) })],
    ["ires/index.cfm", () => ({ body: UPDATED })],
    ["api.fda.gov", () => ({ status: 404, body: JSON.stringify({ error: { code: "NOT_FOUND" } }) })],
  ]);
  const h = history1();
  const coverage = await collect({ history: h, window: WEEK, today: RUN, fetchOpts: fetchOpts(impl), openFdaKey: "" });
  assert.equal(coverage.complete, true);
  const { mdx, quiet } = renderDigest({ history: h, window: WEEK, coverage, generatedOn: RUN });
  assert.equal(quiet, true);
  assert.match(mdx, /Were there any supplement recalls this week\?\n\nNo\./);
});

test("an unresolved possible supplement blocks 'no recalls' and 'every recall' until someone classifies it", async () => {
  const { impl } = fakeFetch([
    ["datatables-json", () => ({ body: "[]" })],
    ["getWeeklyExportCSVResult", () => ({ body: csv(csvRow({ desc: "Elderberry gummies, 60 count", firm: "Berry Farm" })) })],
    ["ires/index.cfm", () => ({ body: UPDATED })],
    ["api.fda.gov", () => ({ status: 404, body: JSON.stringify({ error: { code: "NOT_FOUND" } }) })],
  ]);
  const h = history1();
  const coverage = await collect({ history: h, window: WEEK, today: RUN, fetchOpts: fetchOpts(impl), openFdaKey: "" });
  assert.equal(coverage.complete, true, "every source was read");
  assert.equal(coverage.classified, false, "but one record still needs classifying");
  const { mdx, quiet, review } = renderDigest({ history: h, window: WEEK, coverage, generatedOn: RUN });
  assert.equal(quiet, false);
  assert.doesNotMatch(mdx, /Were there any supplement recalls this week|No dietary-supplement recalls this week|^Every dietary-supplement recall/m);
  assert.match(mdx, /still being checked/);
  assert.match(review, /need classifying/);
});

test("a person's classification settles the week: not-supplement drops the record, supplement makes it a card", async () => {
  const route = () => fakeFetch([
    ["datatables-json", () => ({ body: "[]" })],
    ["getWeeklyExportCSVResult", () => ({ body: csv(csvRow({ desc: "Elderberry gummies, 60 count", firm: "Berry Farm", event: "77001" })) })],
    ["ires/index.cfm", () => ({ body: UPDATED })],
    ["api.fda.gov", () => ({ status: 404, body: JSON.stringify({ error: { code: "NOT_FOUND" } }) })],
  ]).impl;
  const no = history1();
  no.classified = { 77001: { supplement: false, by: "sean", date: RUN, note: "fruit snack" } };
  const c1 = await collect({ history: no, window: WEEK, today: RUN, fetchOpts: fetchOpts(route()), openFdaKey: "" });
  assert.equal(c1.classified, true);
  assert.equal(renderDigest({ history: no, window: WEEK, coverage: c1, generatedOn: RUN }).quiet, true);

  const yes = history1();
  yes.classified = { 77001: { supplement: true, by: "sean", date: RUN, note: "" } };
  const c2 = await collect({ history: yes, window: WEEK, today: RUN, fetchOpts: fetchOpts(route()), openFdaKey: "" });
  assert.equal(c2.classified, true);
  const { mdx, quiet } = renderDigest({ history: yes, window: WEEK, coverage: c2, generatedOn: RUN });
  assert.equal(quiet, false);
  assert.match(mdx, /Berry Farm/);
});

test("merging main's history with the automation copy keeps people's classifications and newer collection", () => {
  const main = history1();
  main.classified = { 77001: { supplement: false, by: "sean", date: "2026-10-28", note: "jam" } };
  const auto = structuredClone(history1());
  auto.classified = { 77001: { supplement: true, by: "bot", date: "2026-10-20", note: "" }, 88002: { supplement: false, by: "sean", date: "2026-10-21", note: "" } };
  auto.weeks["2026-10-25"] = { lastRun: "2026-10-29", events: ["x"] };
  const k = Object.keys(auto.entries)[0];
  auto.entries[k].events.push({ id: "later-event", kind: "updated", date: "2026-10-29", detectedAt: "2026-10-29" });
  const merged = mergeHistories(main, auto);
  assert.equal(merged.classified[77001].by, "sean", "the later human decision survives");
  assert.ok(merged.classified[88002], "decisions only the other copy has are kept");
  assert.equal(merged.weeks["2026-10-25"].lastRun, "2026-10-29");
  assert.ok(merged.entries[k].events.some((e) => e.id === "later-event"), "newer events are kept");
  assert.equal(merged.entries[k].events.length, new Set(merged.entries[k].events.map((e) => e.id)).size, "no duplicate events");
});

test("a full run: supplement announcement and enforcement row become one new card plus a 'previously announced' listing", async () => {
  const { impl } = fakeFetch([
    ["datatables-json", () => ({ body: LISTING })],
    ["acme-recalls-sleepwell", () => ({ body: page() })],
    ["getWeeklyExportCSVResult", () => ({ body: csv(csvRow({ report: "10/21/2026" }), csvRow({ desc: "Organic blueberries", firm: "Berry Farm", event: "5" })) })],
    ["ires/index.cfm", () => ({ body: UPDATED })],
    ["api.fda.gov", () => ({ status: 404, body: JSON.stringify({ error: { code: "NOT_FOUND" } }) })],
  ]);
  const h = history1();
  const coverage = await collect({ history: h, window: WEEK, today: RUN, fetchOpts: fetchOpts(impl), openFdaKey: "" });
  assert.equal(coverage.complete, true);
  const week = selectWeek(h, WEEK);
  assert.equal(week.newAnnouncements.length, 1);
  assert.equal(week.enforcementListings.length, 1);
  assert.equal(h.entries["fda-enforcement:5"], undefined);
  // Running again adds nothing.
  await collect({ history: h, window: WEEK, today: RUN, fetchOpts: fetchOpts(impl), openFdaKey: "" });
  assert.equal(Object.values(selectWeek(h, WEEK)).flat().length, 2);
});

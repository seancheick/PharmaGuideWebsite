const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (file) => fs.readFileSync(path.resolve(__dirname, "..", file), "utf8");
const about = read("src/components/about/AboutClient.tsx");
const press = read("src/components/press/PressClient.tsx");

test("FDA recall alerts are clearly a development feature on both pages", () => {
  for (const source of [about, press]) {
    assert.match(source, /FDA recall alerts/);
    assert.match(source, /[Ii]n development/);
    assert.match(source, /not available in the current beta/);
    assert.doesNotMatch(source, /Live FDA recall monitoring|alerts on the products you actually scanned/);
  }
});

test("clinician participation is not described as universal release approval", () => {
  for (const source of [about, press]) {
    assert.match(source, /including clinicians/);
    assert.doesNotMatch(source, /Every interaction is reviewed|reviews the guidance before it reaches|reviewed continuously|before it ships|Clinical guidance is reviewed by licensed healthcare professionals before release/);
  }
  assert.doesNotMatch(read("src/lib/people.ts"), /Reviews interaction guidance before release|Reads every post and warning/);
});

test("regulatory copy separates FDA approval from testing and notification", () => {
  for (const source of [about, press]) {
    assert.doesNotMatch(source, /only health products in America|reach the shelf first and get tested later|FDA mandates direct notification|FDA recalls reach industry, not consumers|presumed safe/);
  }
  assert.match(press, /https:\/\/www\.fda\.gov\/food\/dietary-supplements/);
});

test("press pitches do not offer laboratory accuracy or unmeasured catalog statistics", () => {
  assert.doesNotMatch(press, /dose accuracy across categories|system flags most often|show how often key ingredients/);
  assert.match(press, /label information, not measurements/);
  assert.match(press, /https:\/\/jamanetwork\.com\/journals\/jama\/fullarticle\/2804077/);
});

test("related links do not reintroduce current recall or universal review promises", () => {
  for (const file of ["src/app/about/page.tsx", "src/app/press/page.tsx"]) {
    assert.doesNotMatch(read(file), /How we verify every interaction|recall monitoring|accumulation, recalls/);
  }
});

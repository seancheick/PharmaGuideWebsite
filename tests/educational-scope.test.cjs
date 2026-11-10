const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const read = (p) => fs.readFileSync(p, "utf8");
test("public scope avoids categorical regulatory exemption and pharmacist impersonation", () => {
  const copy = read("src/lib/methodology.ts") + read("src/lib/faq.ts");
  assert.doesNotMatch(copy, /A medical device or diagnostic tool|AI pharmacist conversation layer/);
});
test("chat does not convert provider confidence into clinical source claims", () => {
  const ui = read("src/components/chat/ChatLauncher.tsx");
  assert.doesNotMatch(ui, /label: "Clinical guidelines"|label: "Available evidence"/);
});
test("personal fit copy describes contextual findings without promising personalized regimens", () => {
  const copy = read("src/lib/features.ts");
  assert.doesNotMatch(copy, /Goal-driven stack recommendations|reshape every recommendation/);
});
test("privacy describes reference chat without claiming current model-provider transmission", () => {
  const copy = read("src/lib/privacy.ts");
  assert.doesNotMatch(
    copy,
    /to answer a chat question we send your message to Google|on to an AI service provider so it can write a reply/
  );
  assert.match(copy, /reference replies/);
});
test('privacy avoids promising an unimplemented restore or proven anonymization', () => {
  const copy = read('src/lib/privacy.ts') + read('src/lib/hipaa.ts') + read('src/lib/faq.ts');
  assert.doesNotMatch(copy, /so you can restore|anonymous, topic-level/);
  assert.match(copy, /does not currently restore/);
});

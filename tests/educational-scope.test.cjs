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
test("privacy names the AI providers that process website chat messages", () => {
  const copy = read("src/lib/privacy.ts");
  assert.match(copy, /Google \(Gemini\)/);
  assert.match(copy, /Groq/);
  assert.doesNotMatch(copy, /does not send your conversation to generative AI model providers|Generative AI model providers are not used/);
});
test("chat labels what grounded an answer, never a clinical endorsement", () => {
  const ui = read("src/components/chat/ChatLauncher.tsx");
  assert.match(ui, /pharmaguide_record:/);
  assert.match(ui, /general_background:/);
  assert.doesNotMatch(ui, /Approved reference information|data\.confidence/);
  assert.match(ui, /not medical advice/);
});
test('privacy avoids promising an unimplemented restore or proven anonymization', () => {
  const copy = read('src/lib/privacy.ts') + read('src/lib/hipaa.ts') + read('src/lib/faq.ts');
  assert.doesNotMatch(copy, /so you can restore|anonymous, topic-level/);
  assert.match(copy, /does not currently restore/);
});

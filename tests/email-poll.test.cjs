const test = require('node:test');
const assert = require('node:assert/strict');

test('poll tokens are purpose-bound, signed, and contain no email address', () => {
  const { pollUrl, readPollToken, pollChoices } = require('../src/lib/email-poll.cjs');
  const url = new URL(pollUrl('contact-id', 'secret'));
  assert.equal(readPollToken(url.searchParams.get('token'), 'secret'), 'contact-id');
  assert.equal(readPollToken(url.searchParams.get('token'), 'wrong'), null);
  assert.equal(readPollToken(url.searchParams.get('token') + 'x', 'secret'), null);
  assert.equal(readPollToken('bad', 'secret'), null);
  assert.equal(pollChoices.length, 6);
  assert.deepEqual(pollChoices.map(({ value }) => value), [
    'interactions', 'whole_stack', 'evidence', 'condition_fit', 'overlap', 'other',
  ]);
  assert.ok(!pollChoices.some(({ label }) => label.includes('safe together')));
  assert.ok(!url.href.includes('@'));
});

test('only Day 14 contains six poll choices in HTML and text', async () => {
  const { campaigns, renderCampaign } = await import('../scripts/lib/email-campaigns.mjs');
  for (const [name, campaign] of Object.entries(campaigns)) {
    const content = await renderCampaign(campaign);
    assert.equal((content.html.match(/BETA_POLL_URL/g) || []).length, name === 'day14' ? 6 : 0);
    assert.equal((content.text.match(/BETA_POLL_URL/g) || []).length, name === 'day14' ? 6 : 0);
    if (name === 'day14') {
      assert.equal((content.html.match(/background-color:#183B3F/g) || []).length >= 6, true);
      assert.match(content.html, /mso-padding-alt:0px/);
    }
  }
});

test('report counts confirmed latest answers, separates old values and excludes opted-out contacts', async () => {
  const { buildPollReport, reportCsv, reportHtml } = await import('../scripts/lib/email-poll-report.mjs');
  const report = buildPollReport([
    { email: 'one@example.org', subscribed: true, choice: 'interactions', answeredAt: '2026-10-23' },
    { email: 'two@example.org', subscribed: true, choice: '' },
    { email: 'old@example.org', subscribed: true, choice: 'product_quality' },
    { email: 'out@example.org', subscribed: false, choice: 'interactions' },
    { email: '=formula@example.org', subscribed: true, choice: 'other' },
  ]);
  assert.equal(report.summary.eligible, 4);
  assert.equal(report.summary.answered, 2);
  assert.equal(report.summary.unanswered, 1);
  assert.equal(report.summary.previousChoices, 1);
  assert.equal(report.summary.excluded, 1);
  assert.equal(report.choices.find(({ value }) => value === 'interactions').count, 1);
  assert.ok(reportCsv(report).includes("'=formula@example.org"));
  const html = reportHtml(buildPollReport([{ email: '<script>alert(1)</script>', subscribed: true }]));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});

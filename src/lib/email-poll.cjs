const { createHmac, timingSafeEqual } = require('node:crypto');

const pollChoices = [
  { value: 'interactions', label: 'Possible interactions between my supplements and medication' },
  { value: 'whole_stack', label: 'My whole stack, all at once' },
  { value: 'evidence', label: 'Whether a supplement actually has good evidence behind it' },
  { value: 'condition_fit', label: 'If a supplement is a good fit for my condition' },
  { value: 'overlap', label: 'Where I might be doubling up on ingredients or doses' },
  { value: 'other', label: 'Something else' },
];
function signature(payload, secret) {
  if (!secret) throw new Error('Poll signing key is missing');
  return createHmac('sha256', secret).update(`beta-interest-v1:${payload}`).digest('base64url');
}
function pollUrl(contactId, secret) {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(contactId)) throw new Error('Invalid contact');
  const payload = Buffer.from(contactId).toString('base64url');
  return `https://pharmaguide.io/email/beta-interest?token=${payload}.${signature(payload, secret)}`;
}
function readPollToken(token, secret) {
  if (typeof token !== 'string' || token.length > 512) return null;
  const [payload, supplied, extra] = token.split('.');
  if (!payload || !supplied || extra !== undefined) return null;
  const actual = Buffer.from(supplied);
  const expected = Buffer.from(signature(payload, secret));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  const contactId = Buffer.from(payload, 'base64url').toString('utf8');
  return /^[a-zA-Z0-9_-]{1,128}$/.test(contactId) ? contactId : null;
}
module.exports = { pollChoices, pollUrl, readPollToken };

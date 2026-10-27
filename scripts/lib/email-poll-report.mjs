import { pollChoices } from '../../src/lib/email-poll.cjs';

export function buildPollReport(contacts) {
  const eligible = contacts.filter(contact => contact.subscribed);
  const known = new Set(pollChoices.map(choice => choice.value));
  const rows = eligible.map(contact => ({
    email: contact.email,
    betaStatus: contact.betaStatus || 'unknown',
    choice: contact.choice || '',
    label: pollChoices.find(choice => choice.value === contact.choice)?.label || (contact.choice ? 'Previous poll choice' : 'No confirmed answer'),
    answeredAt: contact.answeredAt || '',
  })).sort((first, second) => first.email.localeCompare(second.email));
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      eligible: rows.length,
      answered: rows.filter(row => known.has(row.choice)).length,
      unanswered: rows.filter(row => !row.choice).length,
      previousChoices: rows.filter(row => row.choice && !known.has(row.choice)).length,
      excluded: contacts.length - eligible.length,
    },
    choices: pollChoices.map(choice => ({ ...choice, count: rows.filter(row => row.choice === choice.value).length })),
    contacts: rows,
  };
}

function escape(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function reportCsv(report) {
  const cell = value => `"${String(value ?? '').replace(/^[=+@\-\t\r\n]/, "'$&").replaceAll('"', '""')}"`;
  return [['Email', 'Beta status', 'Choice', 'Answer', 'Confirmed at'], ...report.contacts.map(row => [row.email, row.betaStatus, row.choice, row.label, row.answeredAt])]
    .map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}

export function reportHtml(report) {
  const table = rows => `<div class="scroll"><table><thead><tr><th>Email</th><th>Beta status</th><th>Latest answer</th><th>Confirmed at</th></tr></thead><tbody>${rows.map(row => `<tr><td>${escape(row.email)}</td><td>${escape(row.betaStatus)}</td><td>${escape(row.label)}</td><td>${escape(row.answeredAt || 'Not confirmed')}</td></tr>`).join('')}</tbody></table></div>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>Beta poll report | PharmaGuide</title><style>body{margin:0;background:#FAF9F6;color:#183B3F;font:16px/1.6 system-ui,sans-serif}main{max-width:1000px;margin:48px auto;padding:24px}h1{font:400 40px Georgia,serif}h2{margin-top:40px}small{color:#63666A}.summary{background:#183B3F;color:#FAF9F6;padding:20px 24px;border-radius:12px}.choices{padding:0;list-style:none}.choices li{display:flex;justify-content:space-between;gap:24px;padding:14px 0;border-bottom:1px solid #D2DFDA}.scroll{overflow:auto}table{width:100%;border-collapse:collapse;background:white;font-size:14px}th,td{text-align:left;padding:12px;border-bottom:1px solid #D2DFDA;overflow-wrap:anywhere}th{color:#63666A}a{color:#183B3F}</style></head><body><main><strong>PharmaGuide · Private report</strong><h1>What your beta readers want</h1><small>Snapshot: ${escape(report.generatedAt)}. Refresh to see later answers.</small><p class="summary">${report.summary.answered} answered · ${report.summary.unanswered} haven't answered · ${report.summary.previousChoices} previous-choice answers · ${report.summary.eligible} subscribed beta contacts</p><p>Counts use each contact's latest confirmed answer, not opens or clicks. ${report.summary.excluded} unsubscribed or excluded beta contacts are outside this report. Earlier poll choices are not reassigned to the new options.</p><ul class="choices">${report.choices.map(choice => `<li><span>${escape(choice.label)}</span><strong>${choice.count}</strong></li>`).join('')}</ul><h2>Confirmed answers</h2>${table(report.contacts.filter(row => row.choice))}<h2>No confirmed answer yet</h2>${table(report.contacts.filter(row => !row.choice))}<p><a href="poll-report.csv" download>Download contact report as CSV</a></p><small>Keep this report private. It contains email addresses. No medical details are included.</small></main></body></html>`;
}

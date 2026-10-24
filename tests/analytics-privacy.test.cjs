const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function gate(path = '/', search = '') {
  const location = { hostname: 'pharmaguide.io', pathname: path, search };
  const navigator = { webdriver: false, doNotTrack: null };
  const context = { exports: {}, require: () => ({ site: { url: 'https://pharmaguide.io' } }), URL, URLSearchParams,
    window: { location, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } }, navigator };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/analytics.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return { enabled: context.exports.analyticsEnabled, reload: context.exports.privatePageNeedsReload, location, navigator };
}
test('OAuth and account pages never enable marketing analytics', () => {
  for (const path of ['/oauth/authorize', '/account/connections']) assert.equal(gate(path).enabled(), false, path);
  assert.equal(gate('/').enabled(), true);
});
test('navigation into consent is not masked by a cached marketing decision', () => {
  const g = gate('/'); assert.equal(g.enabled(), true);
  g.location.pathname = '/oauth/authorize'; assert.equal(g.enabled(), false);
});
test('OAuth code and authorization parameters suppress analytics on every route', () => {
  for (const query of ['?code=secret', '?authorization_id=secret', '?access_token=secret']) assert.equal(gate('/', query).enabled(), false, query);
});
test('do not track is honored', () => { const g=gate('/'); g.navigator.doNotTrack='1'; assert.equal(g.enabled(), false); });
test('entering a private page after marketing requires a new document', () => {
  const g = gate('/'); g.enabled(); g.location.pathname='/account/connections';
  assert.equal(g.reload(), true);
  assert.equal(gate('/account/connections').reload(), false);
});

function boundaryHarness(analytics) {
  const effects = [];
  const state = [];
  let cursor = 0;
  let reloads = 0;
  const context = {
    exports: {},
    window: { location: { reload() { reloads++; } } },
    require(name) {
      if (name === 'next/link') return {__esModule:true, default:'a'};
      if (name === '@/lib/analytics') return { privatePageNeedsReload: analytics.reload };
      if (name === 'react') return {
        useState(initial) {
          const index = cursor++;
          if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
          return [state[index], (value) => { state[index] = value; }];
        },
        useEffect(callback) { effects.push(callback); },
      };
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
      throw new Error(`Unexpected dependency ${name}`);
    },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/ai-connector/PrivatePageBoundary.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, context);
  return {
    render(children) { cursor = 0; return context.exports.PrivatePageBoundary({ children }); },
    commit() { effects.splice(0).forEach((effect) => effect()); },
    get reloads() { return reloads; },
  };
}

test('private boundary allows a clean private document without a reload loop', () => {
  const analytics = gate('/account/connections');
  const boundary = boundaryHarness(analytics);
  const privateContent = { sensitive: 'fixture only' };
  assert.equal(boundary.render(privateContent).props.children[1], privateContent);
  boundary.commit();
  assert.equal(boundary.reloads, 0);
});

test('private boundary never mounts private content in an already tracked document', () => {
  const analytics = gate('/');
  analytics.enabled();
  analytics.location.pathname = '/account/connections';
  const boundary = boundaryHarness(analytics);
  const privateContent = { sensitive: 'fixture only' };
  assert.notEqual(boundary.render(privateContent).props.children[1], privateContent);
  boundary.commit();
  assert.equal(boundary.reloads, 1);
});

test('private boundary protects content even when the next route renders before URL commit', () => {
  const analytics = gate('/');
  analytics.enabled();
  // Next may render the next tree while the document URL still names its
  // previous page. The boundary itself already knows its children are private.
  const boundary = boundaryHarness(analytics);
  const privateContent = { sensitive: 'fixture only' };
  const first = boundary.render(privateContent);
  analytics.location.pathname = '/oauth/authorize';
  boundary.commit();
  assert.notEqual(first.props.children[1], privateContent, 'no private children before the new URL commits');
  assert.equal(boundary.reloads, 1);
  assert.notEqual(boundary.render(privateContent).props.children[1], privateContent, 'private children stay suppressed until reload');
});


test('private connection routes use the shared private shell without marketing navigation', () => {
  for (const page of ['src/app/oauth/authorize/page.tsx', 'src/app/account/connections/page.tsx']) {
    const source = fs.readFileSync(page, 'utf8');
    assert.doesNotMatch(source, /components\/layout\/(Header|Footer)/);
    assert.match(source, /<PrivatePageBoundary>/);
  }
  const boundary = fs.readFileSync('src/components/ai-connector/PrivatePageBoundary.tsx', 'utf8');
  assert.match(boundary, /id="main"/);
  assert.doesNotMatch(boundary, /fixed|sticky|pt-40|pt-44/);
});

test('connector privacy disclosure names processors and durable access without promising assistant deletion', () => {
  const context = {exports: {}};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/privacy.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, context);
  const policy=JSON.stringify(context.exports.PRIVACY_DOC);
  assert.match(policy,/WorkOS/);assert.match(policy,/Supabase/);
  assert.match(policy,/until you disconnect/);assert.doesNotMatch(policy,/currently 24 hours/);
  assert.match(policy,/independent provider/);assert.doesNotMatch(policy,/All vendors are bound/);
  assert.match(policy,/training settings/);assert.match(policy,/without unreasonable delay/);
  assert.doesNotMatch(policy,/notify you within 72 hours/);
  const shell=fs.readFileSync('src/components/ai-connector/PrivatePageBoundary.tsx','utf8');
  assert.match(shell,/href="\/privacy"/);
});

test('privacy does not advertise unavailable export or unverified compliance and retention guarantees', () => {
  const context={exports:{}};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/privacy.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
  const policy=JSON.stringify(context.exports.PRIVACY_DOC);
  for(const claim of ['We comply with COPPA, CCPA/CPRA, and GDPR','regular security audits','we rely on Standard Contractual Clauses','Settings → Privacy → Export my data','permanently remove your account record and email within 30 days','wiped immediately when you uninstall','longer than 30 days','Disable usage analytics']) assert.ok(!policy.includes(claim),claim);
  assert.match(policy,/full in-app export is not yet available/);
  assert.match(policy,/privacy@pharmaguide.io/);
  assert.match(policy,/Uninstalling the app does not delete your account/);
  assert.match(policy,/adults aged 18 and over/);
  assert.doesNotMatch(policy,/For users 13–17/);
  const terms=fs.readFileSync('src/lib/terms.ts','utf8');
  assert.match(terms,/People under 18.*you may not create an account/);
  assert.doesNotMatch(terms,/Minors \(13–17\)|Minors 13–17/);
});

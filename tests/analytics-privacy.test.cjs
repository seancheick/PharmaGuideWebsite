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
      if (name === '@/lib/analytics') return { privatePageNeedsReload: analytics.reload };
      if (name === 'react') return {
        useState(initial) {
          const index = cursor++;
          if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
          return [state[index], (value) => { state[index] = value; }];
        },
        useEffect(callback) { effects.push(callback); },
      };
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }) };
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
  assert.equal(boundary.render(privateContent), privateContent);
  boundary.commit();
  assert.equal(boundary.reloads, 0);
});

test('private boundary never mounts private content in an already tracked document', () => {
  const analytics = gate('/');
  analytics.enabled();
  analytics.location.pathname = '/account/connections';
  const boundary = boundaryHarness(analytics);
  const privateContent = { sensitive: 'fixture only' };
  assert.notEqual(boundary.render(privateContent), privateContent);
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
  assert.notEqual(first, privateContent, 'no private children before the new URL commits');
  assert.equal(boundary.reloads, 1);
  assert.notEqual(boundary.render(privateContent), privateContent, 'private children stay suppressed until reload');
});

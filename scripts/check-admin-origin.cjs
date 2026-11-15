const fs = require('node:fs');
const assert = require('node:assert/strict');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, file);
const { isAllowedAdminOrigin } = require('../src/lib/admin-origin.ts');
const request = (origin, host = '127.0.0.1:3001', extra = {}) => new Request('http://localhost:3001/api/admin/login', {
  headers: { ...(origin ? { origin } : {}), host, 'sec-fetch-site': 'same-origin', ...extra },
});

test('local browser origin matches the actual host instead of Next internal localhost', () => {
  for (const host of ['127.0.0.1:3001', 'localhost:3001', '[::1]:3001']) {
    assert.equal(isAllowedAdminOrigin(request(`http://${host}`, host), undefined, true), true);
  }
  assert.equal(isAllowedAdminOrigin(request('http://localhost:3001'), undefined, true), false);
});
test('local exception rejects other ports, remote origins, cross-site and missing origins', () => {
  for (const r of [request('http://127.0.0.1:3002'), request('https://example.com'), request(undefined),
    request('http://127.0.0.1:3001', '127.0.0.1:3001', { 'sec-fetch-site': 'cross-site' }),
    request('http://127.0.0.1:3002', '127.0.0.1:3002'), request('https://example.com', 'example.com'),
    request('http://127.0.0.1:3001/path'), request('http://127.0.0.1:3001', 'example.com', { 'x-forwarded-host': '127.0.0.1:3001' })]) {
    assert.equal(isAllowedAdminOrigin(r, undefined, true), false);
  }
});
test('configured origin stays exact and production ignores the development exception', () => {
  assert.equal(isAllowedAdminOrigin(request('http://127.0.0.1:3001'), 'https://longnga.example', true), false);
  assert.equal(isAllowedAdminOrigin(request('https://longnga.example'), 'https://longnga.example', false), true);
  assert.equal(isAllowedAdminOrigin(request('http://127.0.0.1:3001'), undefined, false), false);
  assert.equal(isAllowedAdminOrigin(request('http://localhost:3001', 'localhost:3001'), undefined, false), true);
});

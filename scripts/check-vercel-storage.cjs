const fs = require('node:fs');
const Module = require('node:module');
const assert = require('node:assert/strict');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, file);

function storage() {
  const originalLoad = Module._load;
  Module._load = function(name, ...args) { return name === 'server-only' ? {} : originalLoad.call(this, name, ...args); };
  try {
    const file = require.resolve('../src/lib/storage.ts');
    delete require.cache[file];
    return require(file);
  } finally { Module._load = originalLoad; }
}
async function environment(values, run) {
  const original = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
  for (const [key,value] of Object.entries(values)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  try { await run(); }
  finally { for (const [key,value] of Object.entries(original)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } }
}

test('fresh Vercel deployments serve published content without accessing local files', async () => {
  for (const mode of [undefined, 'local']) await environment({ VERCEL: '1', CONTENT_STORAGE: mode }, async () => {
    const api = storage();
    const originalRead = fs.promises.readFile;
    fs.promises.readFile = async () => { throw new Error('Unexpected filesystem access'); };
    try {
      assert.equal(api.usesPublishedContent(), true);
      assert.deepEqual(await api.readDocument('content.json', () => ({ title: 'Published website' })), { value: { title: 'Published website' }, revision: null });
      await assert.rejects(api.readDocument('security.json', () => ({})), api.StorageUnavailable);
      await assert.rejects(api.writeDocument('content.json', {}, null), api.StorageUnavailable);
      await assert.rejects(api.writeDocument('security.json', {}, null), api.StorageUnavailable);
      await assert.rejects(api.saveMedia('00000000-0000-0000-0000-000000000000.webp', Buffer.from('test')), api.StorageUnavailable);
    } finally { fs.promises.readFile = originalRead; }
  });
});

test('local deployments still read persisted content and validate storage modes', async () => {
  await environment({ VERCEL: undefined, CONTENT_STORAGE: 'local' }, async () => {
    const api = storage(), originalRead = fs.promises.readFile;
    fs.promises.readFile = async () => Buffer.from('{"title":"Saved locally"}');
    try {
      assert.equal(api.usesPublishedContent(), false);
      const result = await api.readDocument('content.json', () => ({ title: 'Fallback' }));
      assert.equal(result.value.title, 'Saved locally');
      assert.match(result.revision, /^[a-f0-9]{64}$/);
    } finally { fs.promises.readFile = originalRead; }
  });
  await environment({ VERCEL: '1', CONTENT_STORAGE: 'invalid' }, async () => {
    const api = storage();
    await assert.rejects(api.readDocument('content.json', () => ({})), /CONTENT_STORAGE không hợp lệ/);
  });
});

test('configured GitHub storage remains authoritative on Vercel', async () => {
  await environment({ VERCEL: '1', CONTENT_STORAGE: 'github', CONTENT_GITHUB_OWNER: 'example', CONTENT_GITHUB_REPO: 'content', CONTENT_GITHUB_TOKEN: 'test-only-token' }, async () => {
    const api = storage(), originalFetch = global.fetch, requests = [];
    global.fetch = async (url) => {
      requests.push(url);
      return Response.json(requests.length === 1 ? { private: true } : { type: 'file', encoding: 'base64', content: Buffer.from('{"title":"Saved on GitHub"}').toString('base64'), size: 27, sha: 'revision' });
    };
    try {
      assert.equal(api.usesPublishedContent(), false);
      assert.deepEqual(await api.readDocument('content.json', () => ({})), { value: { title: 'Saved on GitHub' }, revision: 'revision' });
      assert.equal(requests.length, 2);
    } finally { global.fetch = originalFetch; }
  });
});

test('missing GitHub credentials are reported instead of returning an outdated snapshot', async () => {
  await environment({ VERCEL: '1', CONTENT_STORAGE: 'github', CONTENT_GITHUB_OWNER: undefined, CONTENT_GITHUB_REPO: undefined, CONTENT_GITHUB_TOKEN: undefined }, async () => {
    const api = storage();
    await assert.rejects(api.readDocument('content.json', () => ({})), /Chưa cấu hình kho nội dung GitHub/);
  });
});

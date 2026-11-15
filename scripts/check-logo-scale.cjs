const fs = require('node:fs');
const assert = require('node:assert/strict');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, file);
const { contentSchema } = require('../src/lib/content-schema.ts');
const { defaultContent } = require('../src/lib/default-content.ts');
const { logoVariables, footerLogoSettings, footerLogoVariables } = require('../src/lib/logo-layout.ts');

test('existing site documents keep the original logo size', () => {
  const content = contentSchema.parse(defaultContent);
  assert.equal(content.site.logoScale, undefined);
  assert.equal(logoVariables(content.site.logoScale)['--logo-scale'], 1);
});
test('logo size persists in content and rejects invalid dimensions', () => {
  for (const logoScale of [50, 100, 175, 250]) {
    const document = { ...defaultContent, site: { ...defaultContent.site, logoScale } };
    const restored = contentSchema.parse(JSON.parse(JSON.stringify(document)));
    assert.equal(restored.site.logoScale, logoScale);
  }
  for (const logoScale of [0, 49, 251, 150.5, '150', null]) {
    assert.equal(contentSchema.safeParse({ ...defaultContent, site: { ...defaultContent.site, logoScale } }).success, false);
  }
});

test('footer logo and size save independently from the header', () => {
  const document = { ...defaultContent, site: { ...defaultContent.site,
    logo: '/images/header-logo.webp', logoScale: 175,
    footerLogo: '/images/footer-logo.webp', footerLogoScale: 125,
  } };
  const { site } = contentSchema.parse(JSON.parse(JSON.stringify(document)));
  assert.equal(site.logo, '/images/header-logo.webp');
  assert.equal(site.logoScale, 175);
  assert.deepEqual(footerLogoSettings(site), { logo: '/images/footer-logo.webp', logoScale: 125, vertical: true });
  assert.deepEqual(footerLogoSettings({ ...site, footerLogo: '' }), { logo: site.logo, logoScale: 175, vertical: false });
});

test('older documents fall back to the shared logo; invalid footer settings are rejected', () => {
  assert.deepEqual(footerLogoSettings({ logo: '', logoScale: 100 }), { logo: '', logoScale: 100, vertical: false });
  for (const patch of [{ footerLogo: 'https://example.com/logo.png' }, { footerLogo: '/logo.svg' }, { footerLogoScale: 251 }, { footerLogoScale: '100' }]) {
    assert.equal(contentSchema.safeParse({ ...defaultContent, site: { ...defaultContent.site, ...patch } }).success, false);
  }
});

test('footer alignment and top spacing persist without changing header size', () => {
  assert.equal(footerLogoVariables({})['--footer-logo-margin-top'], '0px');
  for (const [footerLogoAlign, left, right] of [['left', '0px', 'auto'], ['center', 'auto', 'auto'], ['right', 'auto', '0px']]) {
    const document = { ...defaultContent, site: { ...defaultContent.site, logoScale: 175, footerLogoAlign, footerLogoMarginTop: 32 } };
    const { site } = contentSchema.parse(JSON.parse(JSON.stringify(document)));
    assert.equal(site.logoScale, 175);
    assert.equal(site.footerLogoAlign, footerLogoAlign);
    assert.equal(site.footerLogoMarginTop, 32);
    assert.deepEqual(footerLogoVariables(site), { '--footer-logo-margin-top': '32px', '--footer-logo-margin-left': left, '--footer-logo-margin-right': right });
  }
  for (const patch of [{ footerLogoAlign: 'bottom' }, { footerLogoMarginTop: -1 }, { footerLogoMarginTop: 161 }, { footerLogoMarginTop: 1.5 }, { footerLogoMarginTop: '20' }]) {
    assert.equal(contentSchema.safeParse({ ...defaultContent, site: { ...defaultContent.site, ...patch } }).success, false);
  }
});

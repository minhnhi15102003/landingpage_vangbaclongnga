const fs = require('node:fs');
const assert = require('node:assert/strict');
const test = require('node:test');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, file);
const { contentSchema } = require('../src/lib/content-schema.ts');
const { defaultContent } = require('../src/lib/default-content.ts');
const { typographySchema } = require('../src/lib/typography-schema.ts');
const { typographyCSS } = require('../src/lib/typography.ts');
const { fontOptions, fontFaceCSS } = require('../src/lib/font-library.ts');
const { textTargets } = require('../src/lib/typography-targets.ts');

test('existing content keeps its design without a typography migration', () => {
  const value = contentSchema.parse(defaultContent);
  assert.equal(value.typography, undefined);
  assert.equal(typographyCSS(value.typography), '');
  for (const key of Object.keys(value.copy)) assert.ok(textTargets[key], key);
});
test('font, desktop/mobile sizes and weight survive saved content round trips', () => {
  const typography = { headingFont: 'oswald', bodyFont: 'be-vietnam-pro', styles: { priceGroup: { font: fontOptions.at(-1).id, size: 42, mobileSize: 28, weight: 900 } } };
  const value = contentSchema.parse(JSON.parse(JSON.stringify({ ...defaultContent, typography })));
  assert.deepEqual(value.typography, typography);
  const css = typographyCSS(value.typography);
  assert.match(css, /@media\(min-width:601px\).*font-size:42px!important/);
  assert.match(css, /@media\(max-width:600px\).*font-size:28px!important/);
  assert.match(css, /font-weight:900!important/);
  assert.doesNotMatch(css, /@media\(max-width:414px\)/);
  assert.doesNotMatch(typographyCSS({ styles: { priceGroup: { font: 'oswald' } } }), /font-size/);
});
test('small-phone size is saved separately and overrides only the narrower breakpoint', () => {
  const typography = { styles: { priceGroup: { size: 42, mobileSize: 35, smallMobileSize: 28 } } };
  const saved = contentSchema.parse(JSON.parse(JSON.stringify({ ...defaultContent, typography })));
  assert.deepEqual(saved.typography, typography);
  const css = typographyCSS(saved.typography);
  assert.match(css, /@media\(min-width:601px\).*font-size:42px!important/);
  assert.match(css, /@media\(max-width:600px\).*font-size:35px!important/);
  assert.match(css, /@media\(max-width:414px\).*font-size:28px!important/);
  assert.ok(css.indexOf('@media(max-width:414px)') > css.indexOf('@media(max-width:600px)'));
});

test('a small-phone-only override leaves desktop and larger phones on their design defaults', () => {
  const css = typographyCSS({ styles: { priceGroup: { smallMobileSize: 26 } } });
  assert.match(css, /@media\(max-width:414px\).*font-size:26px!important/);
  assert.doesNotMatch(css, /@media\(max-width:600px\)|@media\(min-width:601px\)/);
});

test('rejects unknown targets/fonts and out-of-range or injected CSS values', () => {
  for (const value of [
    { headingFont: 'not-a-font' }, { styles: { untrusted: {} } },
    { styles: { priceGroup: { size: 7 } } }, { styles: { priceGroup: { size: 801 } } },
    { styles: { priceGroup: { mobileSize: -1 } } }, { styles: { priceGroup: { weight: 950 } } },
    { styles: { priceGroup: { smallMobileSize: 7 } } }, { styles: { priceGroup: { smallMobileSize: 801 } } },
    { styles: { priceGroup: { smallMobileSize: 12.5 } } }, { styles: { priceGroup: { smallMobileSize: '26px;color:red' } } },
    { styles: { priceGroup: { font: '</style><script>alert(1)</script>' } } },
    { styles: { priceGroup: { size: '35px;color:red' } } },
  ]) {
    assert.equal(typographySchema.safeParse(value).success, false);
    assert.equal(typographyCSS(value), '');
  }
});
test('only selected font faces are emitted and portable font assets exist', () => {
  const chosen = fontOptions.find((font) => font.faces.some((face) => face.src));
  assert.ok(chosen, 'Imported font catalog must contain portable fonts');
  const css = fontFaceCSS([chosen.id, chosen.id]);
  assert.equal((css.match(/@font-face/g) || []).length, chosen.faces.length);
  const other = fontOptions.find((font) => font.id !== chosen.id && font.faces.some((face) => face.src));
  assert.ok(!css.includes(other.faces.find((face) => face.src).src));
  assert.equal(fontFaceCSS(['oswald']), '');
  for (const font of fontOptions) for (const face of font.faces) {
    if (face.src) {
      assert.match(face.src, /^\/fonts\/vietnamese\/[a-f0-9]{20}\.woff$/);
      assert.ok(fs.existsSync(`public${face.src}`), font.label);
    } else assert.ok(face.local?.length, font.label);
  }
});

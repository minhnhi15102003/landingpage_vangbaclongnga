const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, file);
const { contentSchema } = require('../src/lib/content-schema.ts');
const root = path.resolve(__dirname, '..');
const content = contentSchema.parse(JSON.parse(fs.readFileSync(path.join(root, '.data/content.json'), 'utf8')));
const images = new Set();
function publish(value) {
  if (typeof value === 'string') {
    const media = value.match(/^\/api\/media\/([a-f0-9-]{36}\.webp)$/);
    if (!media) return value;
    images.add(media[1]);
    return `/images/uploads/${media[1]}`;
  }
  if (Array.isArray(value)) return value.map(publish);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, publish(item)]));
  return value;
}
const published = contentSchema.parse(publish(content));
for (const file of images) fs.accessSync(path.join(root, '.data/media', file));
if (images.size) fs.mkdirSync(path.join(root, 'public/images/uploads'), { recursive: true });
for (const file of images) fs.copyFileSync(path.join(root, '.data/media', file), path.join(root, 'public/images/uploads', file));
fs.writeFileSync(path.join(root, 'src/lib/published-content.json'), JSON.stringify(published, null, 2) + '\n');
console.log(`Exported public website content and ${images.size} images. Authentication data was not exported.`);

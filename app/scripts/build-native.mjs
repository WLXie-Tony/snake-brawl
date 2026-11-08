// Bundles native/entry.js (Capacitor plugins) into www/native.js. Run after changing plugins: npm run native
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
await build({
  entryPoints: [path.join(root, 'native', 'entry.js')],
  outfile: path.join(root, 'www', 'native.js'),
  bundle: true, minify: true, format: 'iife', target: ['safari15', 'chrome90'], legalComments: 'none', logLevel: 'info',
});

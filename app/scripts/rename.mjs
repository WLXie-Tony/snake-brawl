// Sets the English app name everywhere it appears: npm run rename -- "New Name"
// (Chinese phones keep showing 蛇蛇乱斗; change that in android/app/src/main/res/values-zh/strings.xml and
// ios/App/App/zh-Hans.lproj/InfoPlist.strings.) The App Store and Google Play listing names are set in their consoles.
import { readFileSync, writeFileSync } from 'node:fs';
const name = process.argv.slice(2).join(' ').trim();
if (!name || name.length > 30) { console.error('usage: npm run rename -- "New Name" (at most 30 characters)'); process.exit(1); }
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '\\"');
const edit = (file, fn) => { writeFileSync(file, fn(readFileSync(file, 'utf8'))); console.log('updated', file); };
edit('capacitor.config.json', s => { const j = JSON.parse(s); j.appName = name; return JSON.stringify(j, null, 2) + '\n'; });
edit('ios/App/App/Info.plist', s => s.replace(/(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/, `$1${esc(name)}$2`));
// every language but Chinese shows the English name (only the name lines change; the tracking text stays)
for (const lang of ['en', 'es', 'pt-BR', 'ja', 'ko']) {
  const f = `ios/App/App/${lang}.lproj/InfoPlist.strings`;
  try { readFileSync(f); } catch (e) { continue; }
  edit(f, s => s.replace(/"CFBundleDisplayName" = "[^"]*";/, `"CFBundleDisplayName" = "${esc(name)}";`).replace(/"CFBundleName" = "[^"]*";/, `"CFBundleName" = "${esc(name)}";`));
}
edit('android/app/src/main/res/values/strings.xml', s => s.replace(/(name="app_name">)[^<]*/, `$1${esc(name)}`).replace(/(name="title_activity_main">)[^<]*/, `$1${esc(name)}`));

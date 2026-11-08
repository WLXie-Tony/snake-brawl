// Applies app.config.json to the projects: www/app-config.js (server address, ad units, purchase keys for the game),
// the AdMob app id and Apple's ad-network list in Info.plist, the tracking question's text, and the AdMob app id in
// AndroidManifest.xml. Safe to run any number of times (the build workflows run it before every build).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const at = (...p) => path.join(root, ...p);
const cfg = JSON.parse(readFileSync(at('app.config.json'), 'utf8'));
const ad = cfg.admob || {}, rc = cfg.revenuecat || {};
// Google's sample app ids: they make the SDK start in test mode until real ids are set
const SAMPLE = { ios: 'ca-app-pub-3940256099942544~1458002511', android: 'ca-app-pub-3940256099942544~3347511713' };
const APP_ID_RE = /^ca-app-pub-\d{16}~\d{10}$/, UNIT_RE = /^ca-app-pub-\d{16}\/\d{10}$/;
const warn = [];
const appId = (p) => { const v = (ad[p] && ad[p].appId) || ''; if (v && !APP_ID_RE.test(v)) warn.push(`admob.${p}.appId looks wrong: ${v}`); return APP_ID_RE.test(v) ? v : SAMPLE[p]; };
const units = (p) => { const o = ad[p] || {}, out = {}; for (const k of ['rewarded', 'interstitial']) { if (o[k] && !UNIT_RE.test(o[k])) warn.push(`admob.${p}.${k} looks wrong: ${o[k]}`); if (UNIT_RE.test(o[k] || '')) out[k] = o[k]; } return out; };
const test = ad.test !== false || !APP_ID_RE.test((ad.ios && ad.ios.appId) || '') && !APP_ID_RE.test((ad.android && ad.android.appId) || '');
const api = typeof cfg.api === 'string' && /^https:\/\/\S+$/.test(cfg.api.trim()) ? cfg.api.trim().replace(/\/+$/, '') : '';
if (cfg.api && !api) warn.push('api must be an https:// address');
const appCfg = { api, admob: { test, ios: units('ios'), android: units('android') }, revenuecat: { ios: rc.ios || '', android: rc.android || '' } };
writeFileSync(at('www', 'app-config.js'), '/* written by scripts/configure.mjs from app.config.json */\nwindow.APP_CFG=' + JSON.stringify(appCfg) + ';\n');

// the game page loads the settings and the native plugins before its own script
const page = at('www', 'index.html');
if (existsSync(page)) {
  let html = readFileSync(page, 'utf8').replace(/<script src="(app-config|native)\.js"><\/script>\n?/g, '');
  html = html.replace(/<meta charset="utf-8">/i, (m) => m + '\n<script src="app-config.js"></script>\n<script src="native.js"></script>');
  if (!html.includes('<script src="native.js">')) throw new Error('www/index.html has no <meta charset="utf-8"> to put the app scripts after');
  writeFileSync(page, html);
}

// iOS: AdMob app id, Apple's ad network ids (Google's list), the tracking question
const SKAN = 'cstr6suwn9 4fzdc2evr5 2fnua5tdw4 ydx93a7ass p78axxw29g v72qych5uu ludvb6z3bs cp8zw746q7 3sh42y64q3 c6k4g5qg8m s39g8k73mm wg4vff78zm 3qy4746246 f38h382jlk hs6bdukanm mlmmfzh3r3 v4nxqhlyqp wzmmz9fp6w su67r6k2v3 yclnxrl5pm t38b2kh725 7ug5zh24hu gta9lk7p23 vutu7akeur y5ghdn5j9k v9wttpbfk9 n38lu8286q 47vhws6wlr kbd757ywx3 9t245vhmpl a2p9lx4jpn 22mmun2rn5 44jx6755aq k674qkevps 4468km3ulz 2u9pt9hc89 8s468mfl3y klf5c3l5u5 ppxm28t8ap kbmxgpxpgc uw77j35x4d 578prtvx9j 4dzt52r2t5 tl55sbb4fm c3frkrj4fj e5fvkxwrpn 8c4e2ghe7u 3rd42ekr43 97r2b46745 3qcr597p9d'.split(' ');
const tt = cfg.trackingText || {};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plist = at('ios', 'App', 'App', 'Info.plist');
if (existsSync(plist)) {
  let p = readFileSync(plist, 'utf8');
  p = p.replace(/\n?\t?<key>GADApplicationIdentifier<\/key>\s*<string>[^<]*<\/string>/g, '')
    .replace(/\n?\t?<key>SKAdNetworkItems<\/key>\s*<array>[\s\S]*?<\/array>/g, '')
    .replace(/\n?\t?<key>NSUserTrackingUsageDescription<\/key>\s*<string>[^<]*<\/string>/g, '');
  const add = `\t<key>GADApplicationIdentifier</key>\n\t<string>${appId('ios')}</string>\n` +
    `\t<key>NSUserTrackingUsageDescription</key>\n\t<string>${esc(tt.en || 'This lets the game show ads that fit you better.')}</string>\n` +
    `\t<key>SKAdNetworkItems</key>\n\t<array>\n` + SKAN.map((id) => `\t\t<dict>\n\t\t\t<key>SKAdNetworkIdentifier</key>\n\t\t\t<string>${id}.skadnetwork</string>\n\t\t</dict>\n`).join('') + '\t</array>\n';
  p = p.replace(/<\/dict>\s*<\/plist>\s*$/, add + '</dict>\n</plist>\n');
  writeFileSync(plist, p);
}
// the tracking question in each language the app has
for (const [lang, file] of [['en', 'en.lproj'], ['zh-Hans', 'zh-Hans.lproj'], ['es', 'es.lproj'], ['pt-BR', 'pt-BR.lproj'], ['ja', 'ja.lproj'], ['ko', 'ko.lproj']]) {
  const f = at('ios', 'App', 'App', file, 'InfoPlist.strings');
  if (!existsSync(f) || !tt[lang]) continue;
  let s = readFileSync(f, 'utf8').replace(/\n?"NSUserTrackingUsageDescription" = "[^"]*";/g, '');
  s = s.replace(/\s*$/, '') + `\n"NSUserTrackingUsageDescription" = "${String(tt[lang]).replace(/"/g, '\\"')}";\n`;
  writeFileSync(f, s);
}

// Android: AdMob app id; no exact alarms (the reminders are inexact, and the permission brings a settings screen)
const man = at('android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (existsSync(man)) {
  let m = readFileSync(man, 'utf8');
  if (!/xmlns:tools=/.test(m)) m = m.replace('<manifest xmlns:android="http://schemas.android.com/apk/res/android"', '<manifest xmlns:android="http://schemas.android.com/apk/res/android" xmlns:tools="http://schemas.android.com/tools"');
  // \s+ also matches the multi-line form that `npm run icons` (capacitor-assets) writes back
  m = m.replace(/\n\s*<meta-data\s+android:name="com\.google\.android\.gms\.ads\.APPLICATION_ID"[^>]*\/>/g, '')
    .replace(/\n\s*<uses-permission\s+android:name="android\.permission\.SCHEDULE_EXACT_ALARM"[^>]*\/>/g, '');
  m = m.replace(/(<application[^>]*>)/, `$1\n        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${appId('android')}"/>`);
  m = m.replace('<uses-permission android:name="android.permission.INTERNET" />', '<uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" tools:node="remove" />');
  writeFileSync(man, m);
}
console.log('configured:', JSON.stringify({ api: api || '(none)', adsTest: test, ios: appId('ios'), android: appId('android'), revenuecat: { ios: !!rc.ios, android: !!rc.android } }));
for (const w of warn) console.warn('warning:', w);

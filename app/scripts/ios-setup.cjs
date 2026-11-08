// One-time edits to the Xcode project made by `cap add ios`: iPhone only (no iPad screenshots needed for review),
// the Chinese home screen name (蛇蛇乱斗 on Chinese phones), and the export compliance answer in Info.plist.
// Safe to run again: every edit checks whether it is already there.
const fs = require('fs');
const P = 'ios/App/App.xcodeproj/project.pbxproj';
let s = fs.readFileSync(P, 'utf8');
const BF = 'A5E1B0010000000000000001', VG = 'A5E1B0010000000000000002', EN = 'A5E1B0010000000000000003', ZH = 'A5E1B0010000000000000004';
const add = (after, text) => { const i = s.indexOf(after); if (i < 0) throw new Error('not found: ' + after); s = s.slice(0, i + after.length) + text + s.slice(i + after.length); };
if (!s.includes(VG)) {
  add('/* Begin PBXBuildFile section */\n', `\t\t${BF} /* InfoPlist.strings in Resources */ = {isa = PBXBuildFile; fileRef = ${VG} /* InfoPlist.strings */; };\n`);
  add('/* Begin PBXFileReference section */\n',
    `\t\t${EN} /* en */ = {isa = PBXFileReference; lastKnownFileType = text.plist.strings; name = en; path = en.lproj/InfoPlist.strings; sourceTree = "<group>"; };\n` +
    `\t\t${ZH} /* zh-Hans */ = {isa = PBXFileReference; lastKnownFileType = text.plist.strings; name = "zh-Hans"; path = "zh-Hans.lproj/InfoPlist.strings"; sourceTree = "<group>"; };\n`);
  add('504EC3131FED79650016851F /* Info.plist */,\n', `\t\t\t\t${VG} /* InfoPlist.strings */,\n`);
  add('504EC30D1FED79650016851F /* Main.storyboard in Resources */,\n', `\t\t\t\t${BF} /* InfoPlist.strings in Resources */,\n`);
  add('/* Begin PBXVariantGroup section */\n',
    `\t\t${VG} /* InfoPlist.strings */ = {\n\t\t\tisa = PBXVariantGroup;\n\t\t\tchildren = (\n\t\t\t\t${EN} /* en */,\n\t\t\t\t${ZH} /* zh-Hans */,\n\t\t\t);\n\t\t\tname = InfoPlist.strings;\n\t\t\tsourceTree = "<group>";\n\t\t};\n`);
  add('knownRegions = (\n\t\t\t\ten,\n\t\t\t\tBase,\n', '\t\t\t\t"zh-Hans",\n');
}
// v22: Spanish, Portuguese (Brazil), Japanese and Korean, so the App Store lists those languages too
const MORE = [['A5E1B0010000000000000005', 'es'], ['A5E1B0010000000000000006', 'pt-BR'], ['A5E1B0010000000000000007', 'ja'], ['A5E1B0010000000000000008', 'ko']];
for (const [id, lang] of MORE) {
  if (s.includes(id)) continue;
  const q = lang.includes('-') ? `"${lang}"` : lang;
  add('/* Begin PBXFileReference section */\n', `\t\t${id} /* ${lang} */ = {isa = PBXFileReference; lastKnownFileType = text.plist.strings; name = ${q}; path = ${lang.includes('-') ? `"${lang}.lproj/InfoPlist.strings"` : `${lang}.lproj/InfoPlist.strings`}; sourceTree = "<group>"; };\n`);
  add(`\t\t\t\t${ZH} /* zh-Hans */,\n`, `\t\t\t\t${id} /* ${lang} */,\n`);
  add('knownRegions = (\n', `\t\t\t\t${q},\n`);
}
s = s.replace(/TARGETED_DEVICE_FAMILY = "1,2";/g, 'TARGETED_DEVICE_FAMILY = 1;');
fs.writeFileSync(P, s);
// the English name is used for every language but Chinese; `npm run rename` changes them all
const enName = (() => { try { const m = fs.readFileSync('ios/App/App/en.lproj/InfoPlist.strings', 'utf8').match(/"CFBundleDisplayName" = "([^"]*)"/); return m ? m[1] : 'Snake Brawl'; } catch (e) { return 'Snake Brawl'; } })();
for (const [lang, name] of [['en', 'Snake Brawl'], ['zh-Hans', '蛇蛇乱斗'], ['es', enName], ['pt-BR', enName], ['ja', enName], ['ko', enName]]) {
  fs.mkdirSync(`ios/App/App/${lang}.lproj`, { recursive: true });
  const f = `ios/App/App/${lang}.lproj/InfoPlist.strings`;
  if (!fs.existsSync(f)) fs.writeFileSync(f, `"CFBundleDisplayName" = "${name}";\n"CFBundleName" = "${name}";\n`);
}
const plist = 'ios/App/App/Info.plist';
let p = fs.readFileSync(plist, 'utf8');
if (!p.includes('ITSAppUsesNonExemptEncryption')) p = p.replace('\t<key>LSRequiresIPhoneOS</key>', '\t<key>ITSAppUsesNonExemptEncryption</key>\n\t<false/>\n\t<key>LSRequiresIPhoneOS</key>');
fs.writeFileSync(plist, p);
console.log('iOS project updated');

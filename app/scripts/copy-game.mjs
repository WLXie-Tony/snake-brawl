// Copies the game (index.html and icon.png) from the folder above into www/, which Capacitor packs into the apps.
// Set GAME_DIR to copy from somewhere else. In a repo that only holds the app, www/ is committed and nothing is copied.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const src = process.env.GAME_DIR || '..';
mkdirSync('www', { recursive: true });
for (const f of ['index.html', 'icon.png']) {
  const from = join(src, f), to = join('www', f);
  if (existsSync(from)) { copyFileSync(from, to); console.log('copied', from); }
  else if (existsSync(to)) console.log('kept', to);
  else { console.error('missing', from); process.exit(1); }
}

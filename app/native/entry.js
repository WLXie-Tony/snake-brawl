// The store apps' native features for the game page: bundled by scripts/build-native.mjs into www/native.js and loaded
// before the game script. The game finds them on window.NativeKit; the web version has none of this.
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AdMob } from '@capacitor-community/admob';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';
import { Filesystem } from '@capacitor/filesystem';
import { InAppReview } from '@capacitor-community/in-app-review';

if (Capacitor.isNativePlatform()) {
  window.NativeKit = { AdMob, Purchases, LocalNotifications, Share, Filesystem, App, InAppReview };
}

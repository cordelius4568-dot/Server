// `cap add android` sonrası: izinler, ön plan servisi ve yerel eklenti (Devnet) eklenir. Tekrar çalıştırılabilir.
import fs from 'node:fs';
import path from 'node:path';

const PKG = 'com.devnet.distrodurum';
const javaDir = path.resolve('android/app/src/main/java', ...PKG.split('.'));
const manifestPath = path.resolve('android/app/src/main/AndroidManifest.xml');
if (!fs.existsSync(manifestPath)) throw new Error('android/ yok: önce `npx cap add android` çalışmalı.');

fs.mkdirSync(javaDir, { recursive: true });
for (const f of ['MainActivity.java', 'DevnetPlugin.java', 'KeepAliveService.java']) {
  fs.copyFileSync(path.resolve('android-native', f), path.join(javaDir, f));
}

let m = fs.readFileSync(manifestPath, 'utf8');
if (!m.includes('KeepAliveService')) {
  const perms = [
    'MANAGE_EXTERNAL_STORAGE', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'FOREGROUND_SERVICE',
    'FOREGROUND_SERVICE_SPECIAL_USE', 'POST_NOTIFICATIONS', 'WAKE_LOCK', 'REQUEST_IGNORE_BATTERY_OPTIMIZATIONS', 'INTERNET',
  ]
    .filter((p) => !m.includes(`android.permission.${p}"`))
    .map((p) => `    <uses-permission android:name="android.permission.${p}" />`)
    .join('\n');
  m = m.replace('<application', `${perms}\n\n    <application`);
  if (!m.includes('requestLegacyExternalStorage')) m = m.replace('<application', '<application android:requestLegacyExternalStorage="true"');
  if (!m.includes('usesCleartextTraffic')) m = m.replace('<application', '<application android:usesCleartextTraffic="true"');
  m = m.replace(
    '</application>',
    `    <service android:name=".KeepAliveService" android:exported="false" android:foregroundServiceType="specialUse">
            <property android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE" android:value="Yerel sunucu ve veritabani kaydi" />
        </service>
    </application>`
  );
  fs.writeFileSync(manifestPath, m);
}
console.log('[android] yama uygulandı');

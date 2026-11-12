// npm run apk  ->  distrodurum.apk (debug imzalı; doğrudan kurulabilir)
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const run = (cmd, opts = {}) => { console.log(`\n$ ${cmd}`); execSync(cmd, { stdio: 'inherit', ...opts }); };

run('npx vite build');
run('node scripts/prepare-node.mjs');
if (!fs.existsSync('android')) run('npx cap add android');
run('node scripts/patch-android.mjs');
run('npx cap sync android');
if (process.platform !== 'win32') fs.chmodSync('android/gradlew', 0o755);
run(process.platform === 'win32' ? 'gradlew.bat assembleDebug' : './gradlew assembleDebug', { cwd: 'android' });
fs.copyFileSync('android/app/build/outputs/apk/debug/app-debug.apk', 'distrodurum.apk');
console.log('\nHazır: distrodurum.apk');

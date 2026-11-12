# Dağıtım Durumu (Vite + AxioDB + Android APK)

## Geliştirme (Termux / PC)
```bash
npm install
npm run dev          # http://localhost:5173  (DEVNET_ALWAYS=1 npm run dev -> 05:00–23:00 sınırı kapalı)
```
Simülasyon sunucuda (`server/sim.mjs`) çalışır, değişiklikler AxioDB ile `data/devnet@0.0.0.0/` içine yazılır.
Sistem her gün 05:00'te başlar, 23:00'te durur, ertesi gün kendiliğinden devam eder (`schedule` ayarı `server/sim.mjs`).

## APK
`npm run apk` → `distrodurum.apk` (Node.js 20+, JDK 21, Android SDK gerekir). Termux'ta SDK çalışmaz;
bunun yerine repoyu GitHub'a yükle, **Actions → APK → Run workflow**, çıkan `distrodurum-apk` dosyasını indir.

Uygulama içinde: Node sunucusu (`127.0.0.1:5174`) + AxioDB, veritabanı `/sdcard/devnet@0.0.0.0`.
İlk açılışta "İzin ver" ile **tüm dosyalara erişim** izni verilmeli (yoksa geçici klasöre yazar). Ön plan servisi ve pil muafiyeti istenir.
Telefon yeniden başlarsa uygulamayı bir kez aç.

## Diğer
- Dağıtım/sürüm/kod adı: `src/distros.js`. Logolar: `postinstall` ile `simple-icons`'tan `src/logos/`.
- Arama özeti: toplam değişiklik = artış + azalış (ör. −3 +2 → 5).

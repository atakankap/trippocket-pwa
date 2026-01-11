# PWA Install Özelliğini Test Etme

## Localhost'ta Test (Chrome)

1. **Chrome DevTools Aç**
   - `F12` veya `Ctrl+Shift+I`

2. **Application Tab'ına Git**
   - Sol menüden "Application" sekmesini seç

3. **Manifest Kontrol**
   - Sol menüden "Manifest" seç
   - Manifest bilgilerini göreceksin:
     - Name: TripPocket - Offline Travel Guide
     - Short name: TripPocket
     - Icons: 8 adet
     - Theme color: #2563eb
   - **"Install"** butonuna tıkla (DevTools'ta)

4. **Service Worker Kontrol**
   - Sol menüden "Service Workers" seç
   - `service-worker.js` aktif olmalı
   - Status: "activated and is running"

## Gerçek Install Test (HTTPS Gerekli)

### Seçenek 1: Netlify Deploy
```bash
# Netlify CLI kur
npm install -g netlify-cli

# Deploy et
cd c:/Users/cagat/OneDrive/Pulpit/trippocket-pwa
netlify deploy --prod
```

### Seçenek 2: Surge Deploy
```bash
# Surge CLI kur
npm install -g surge

# Deploy et
cd c:/Users/cagat/OneDrive/Pulpit/trippocket-pwa
surge
```

### Deploy Sonrası
1. HTTPS URL'i aç
2. Header'daki **"📱 Install"** butonuna tıkla
3. Tarayıcı install dialog'u açacak
4. "Install" butonuna tıkla
5. Uygulama cihazına yüklenecek

## Mobil Test

### Android Chrome
1. HTTPS URL'i aç
2. Chrome menü (⋮) → "Add to Home screen"
3. Uygulama home screen'e eklenecek

### iOS Safari
1. HTTPS URL'i aç
2. Share butonu → "Add to Home Screen"
3. Uygulama home screen'e eklenecek

## Offline Test

1. Uygulamayı aç
2. DevTools → Network tab
3. "Offline" seç
4. Sayfayı yenile
5. Uygulama çalışmaya devam etmeli
6. "Offline" badge görünmeli
7. Essential lokasyonlar görünmeli

## Geolocation Test

1. "Find Nearby Places" butonuna tıkla
2. Tarayıcı konum izni isteyecek
3. "Allow" seç
4. Yakındaki yerler mesafeye göre sıralanacak

## Camera Test

1. "Saved" view'e git
2. "📷 Add Photo" butonuna tıkla
3. Tarayıcı kamera izni isteyecek
4. "Allow" seç
5. Kamera açılacak
6. "Capture" ile fotoğraf çek
7. Fotoğraf galeriye eklenecek

## Lighthouse Test

1. DevTools → Lighthouse tab
2. Categories: Performance, PWA, Accessibility seç
3. "Analyze page load" tıkla
4. Sonuçlar:
   - PWA: 90+ (installable, offline çalışıyor)
   - Performance: 85+ (optimize edilmiş)
   - Accessibility: 90+

## Beklenen Sonuçlar

✅ Manifest doğru yükleniyor
✅ Service Worker aktif
✅ Offline çalışıyor
✅ Install prompt (HTTPS'te) çalışıyor
✅ Native features (geolocation, camera) çalışıyor
✅ Responsive tasarım
✅ Leaflet harita çalışıyor

# API Kurulum Rehberi

TripPocket PWA gerçek API'lerle çalışmak için yapılandırılmıştır.

## 🌤️ OpenWeather API (Hava Durumu)

### Ücretsiz API Key Alma

1. **OpenWeather'a Kaydol**
   - https://openweathermap.org/api adresine git
   - "Sign Up" tıkla
   - Ücretsiz hesap oluştur

2. **API Key Al**
   - Dashboard'a git
   - "API keys" sekmesine tıkla
   - Default key'i kopyala veya yeni key oluştur

3. **API Key'i Ekle**
   - `js/data/online-api.js` dosyasını aç
   - `fetchWeather` fonksiyonunda:
   ```javascript
   const API_KEY = 'BURAYA_API_KEY_YAPISTIR';
   ```

### Kullanım Limitleri (Free Tier)
- ✅ 60 calls/minute
- ✅ 1,000,000 calls/month
- ✅ Güncel hava durumu
- ✅ 5 günlük tahmin

## 🗺️ Overpass API (OpenStreetMap - Gerçek Lokasyonlar)

### Kurulum Gerekmez!

Overpass API ücretsiz ve API key gerektirmez. Ancak:

- ⚠️ Rate limit: 2 request/second
- ⚠️ Timeout: 180 saniye
- ⚠️ Yoğun saatlerde yavaş olabilir

### Alternatif: Google Places API

Daha iyi performans için Google Places API kullanabilirsin:

1. **Google Cloud Console**
   - https://console.cloud.google.com
   - Yeni proje oluştur
   - "Places API" aktif et
   - API key oluştur

2. **Kod Değişikliği**
   - `js/data/online-api.js` dosyasında
   - `fetchNearbyPOIs` fonksiyonunu Google Places ile değiştir

## 🔧 Fallback Sistemi

API'ler çalışmazsa uygulama otomatik olarak:
- ✅ Statik lokasyon verilerini kullanır
- ✅ Gerçekçi mock hava durumu gösterir
- ✅ Offline modda tam çalışır

## 🧪 Test

### OpenWeather API Test
```javascript
// Browser console'da:
const weather = await fetchWeather(52.2297, 21.0122);
console.log(weather);
```

### Overpass API Test
```javascript
// Browser console'da:
const locations = await fetchOnlineLocations(52.2297, 21.0122);
console.log(locations);
```

## 📊 API Durumu Kontrol

Uygulama console'da API durumunu gösterir:
- `[Online API] Fetching locations from server...`
- `[Weather API] Failed, using fallback data`
- `[Overpass API] Found X real nearby locations`

## 💡 Öneriler

1. **OpenWeather API Key Ekle** - Gerçek hava durumu için
2. **Overpass API Kullan** - Ücretsiz, gerçek lokasyonlar
3. **Google Places** - Daha hızlı ve güvenilir (ücretli)

## 🚀 Production Deployment

Netlify'a deploy ederken:
1. Environment variables kullan
2. API key'leri kod içine yazma
3. `.env` dosyası oluştur (git'e ekleme)

```env
VITE_OPENWEATHER_API_KEY=your_key_here
```

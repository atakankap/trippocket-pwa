# 🌍 TripPocket PWA

**Progressive Web App for Travelers**

A modern, offline-first travel companion that helps you explore cities, save memories, and find essential places even without internet connection.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://atakankap.github.io/trippocket-pwa/)
[![PWA](https://img.shields.io/badge/PWA-enabled-blue)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## ✨ Features

### 🗺️ **Smart Map View**
- **Online Mode:** Search any place, get recommendations, find nearby locations
- **Offline Mode:** Access 16 essential locations (hospitals, police stations, metro)
- Interactive map with Leaflet.js
- City-context aware search

### 📸 **Memory Keeper**
- Capture photos with real camera integration
- Add location and notes to memories
- Filter by date, location, and category
- Offline storage with localStorage

### 🔍 **Explore Places**
- Find nearby restaurants, cafes, hotels
- Trending locations
- Save favorite places
- Reviews and ratings system

### 👤 **User Profile**
- Customizable profile (name, bio, avatar)
- Travel statistics
- Settings (notifications, location services)
- Export/import data

---

## 🚀 Live Demo

**Visit:** [https://atakankap.github.io/trippocket-pwa/](https://atakankap.github.io/trippocket-pwa/)

**Try it:**
1. Open the link on mobile or desktop
2. Click "Install" to add to home screen
3. Grant location and camera permissions
4. Explore online and offline features!

---

## 📱 PWA Features

✅ **Installable** - Add to home screen like a native app  
✅ **Offline-First** - Works without internet connection  
✅ **Service Worker** - Smart caching strategies  
✅ **Native APIs** - Camera, Geolocation  
✅ **Responsive** - Mobile and desktop optimized  
✅ **HTTPS** - Secure and fast  

---

## 🛠️ Technologies

**Core:**
- HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- No frameworks for PWA layer (as required)

**Libraries:**
- [Leaflet.js](https://leafletjs.com/) - Interactive maps (UI only)
- [OpenStreetMap](https://www.openstreetmap.org/) - Map tiles
- [Nominatim API](https://nominatim.org/) - Geocoding

**PWA Stack:**
- Service Worker (Cache First, Network First, Stale While Revalidate)
- IndexedDB (saved locations)
- localStorage (photos, settings)
- Cache API (offline assets)

**Native APIs:**
- Geolocation API (GPS)
- MediaDevices API (Camera)

---

## 📦 Installation

### Local Development

```bash
# Clone repository
git clone https://github.com/atakankap/trippocket-pwa.git
cd trippocket-pwa

# Serve with any HTTP server
python -m http.server 8000
# or
npx http-server -p 8000

# Open browser
http://localhost:8000
```

### Requirements
- Modern browser (Chrome, Firefox, Safari, Edge)
- HTTPS or localhost (for PWA features)
- Camera and location permissions

---

## 📂 Project Structure

```
trippocket-pwa/
├── index.html              # Main HTML
├── manifest.json           # PWA manifest
├── service-worker.js       # Service Worker
├── css/
│   ├── styles.css         # Global styles
│   ├── views.css          # View-specific styles
│   ├── components.css     # Component styles
│   └── animations.css     # Animations
├── js/
│   ├── app.js            # Main application
│   ├── views/            # View modules
│   │   ├── explore.js
│   │   ├── map.js
│   │   ├── saved.js
│   │   └── profile.js
│   ├── utils/            # Utility modules
│   │   ├── db.js         # IndexedDB
│   │   ├── geolocation.js
│   │   ├── camera.js
│   │   └── toast.js
│   └── data/             # Data modules
│       ├── offline-data.js
│       └── online-api.js
└── icons/                # PWA icons
```

---

## 🎯 Usage

### Online Mode
1. **Explore** - Search places, find nearby locations
2. **Map** - Interactive search with recommendations
3. **Saved** - Add photos with camera
4. **Profile** - Customize your profile

### Offline Mode
1. **Map** - View 16 essential locations
2. **Saved** - Browse your photos
3. **Profile** - View stats and settings

---

## 🧪 Testing

### Lighthouse Test
```bash
# Open DevTools (F12)
# Navigate to Lighthouse tab
# Run audit for:
# - Performance
# - Accessibility
# - Best Practices
# - SEO
# - Progressive Web App
```

**Expected Scores:**
- Performance: 85-90+
- Accessibility: 90-95
- Best Practices: 100
- SEO: 100
- PWA: 90-100

### Offline Test
```bash
# Open DevTools (F12)
# Network tab → Offline
# Refresh page
# App should work offline
```

---

## 📊 Data Storage

| Type | Storage | Size | Offline |
|------|---------|------|---------|
| Saved Locations | IndexedDB | ~50MB | ✅ |
| Photos | localStorage | ~5MB | ✅ |
| Settings | localStorage | ~1KB | ✅ |
| Static Assets | Cache API | ~10MB | ✅ |
| Map Tiles | Cache API | ~50MB | ✅ |

---

## 🔒 Privacy

- All data stored locally (client-side)
- No server-side storage
- No tracking or analytics
- User controls all data
- Export/import available

---

## 🌟 Highlights

**PWA Criteria:**
- ✅ Manifest with icons
- ✅ Service Worker registered
- ✅ Offline functionality
- ✅ HTTPS deployment
- ✅ Responsive design
- ✅ Installable

**Native APIs:**
- ✅ Geolocation (GPS)
- ✅ MediaDevices (Camera)

**Best Practices:**
- ✅ Vanilla JavaScript (no frameworks)
- ✅ ES6 Modules
- ✅ Error handling (52 try-catch blocks)
- ✅ Progressive enhancement
- ✅ Offline-first architecture

---

## 📝 License

MIT License - feel free to use for learning and projects!

---

## 👨‍💻 Author

**Alaeddin Atakan Kaplan**  
Progressive Web Apps Course Project - 2026

---

## 🙏 Acknowledgments

- OpenStreetMap contributors
- Leaflet.js team
- Nominatim API
- PWA community

---

**⭐ Star this repo if you found it helpful!**

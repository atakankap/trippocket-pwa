# TripPocket

A travel companion app that works offline. Find places, save memories, and explore cities even without internet.

**Live Demo:** [trippocket.netlify.app](https://trippocket.netlify.app/)

## What it does

- **Map View** - Search places online or view essential locations (hospitals, police, metro) offline
- **Photos** - Take pictures with your camera and save them with location notes
- **Explore** - Find nearby restaurants, cafes, and hotels
- **Profile** - Track your travel stats and manage settings

## How to run it

```bash
git clone https://github.com/atakankap/trippocket-pwa.git
cd trippocket-pwa
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## Tech stack

- Vanilla JavaScript (ES6 modules)
- Leaflet.js for maps
- OpenStreetMap & Nominatim API
- Service Worker for offline support
- IndexedDB and localStorage for data
- Camera and Geolocation APIs

## Project structure

```
trippocket-pwa/
├── index.html
├── manifest.json
├── service-worker.js
├── css/
├── js/
│   ├── app.js
│   ├── views/
│   ├── utils/
│   └── data/
└── icons/
```

## Testing

Run Lighthouse in Chrome DevTools to check PWA compliance and performance scores.

For offline testing, open DevTools → Network → set to Offline, then refresh.

## Privacy

All data is stored locally on your device. No server storage, no tracking.

---

**Alaeddin Atakan Kaplan**

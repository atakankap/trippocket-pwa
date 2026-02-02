# TripPocket PWA  
Progressive Web App for Travelers

TripPocket is a Progressive Web Application developed as a course project.  
The application allows users to explore places, view maps, save memories, and access essential locations both online and offline.

Live demo of the application:
https://trippocket.netlify.app

## Project Overview

The purpose of this project is to demonstrate core Progressive Web App concepts such as installability, offline functionality, usage of native browser APIs, and Service Worker–based caching.

The project is implemented using **Vanilla JavaScript** without frameworks for the PWA layer, as required by the course.

## Features

### Online Mode
- Search and explore places
- Interactive map view
- Save favorite locations
- Capture photos using the device camera

### Offline Mode
- Access predefined essential locations (e.g. hospitals, police stations, metro)
- View previously saved photos and data
- Basic navigation without an internet connection

## PWA Capabilities

- Installable on mobile and desktop devices
- Offline-first behavior
- Service Worker for caching
- HTTPS deployment
- Responsive design

## Native Browser APIs

- **Geolocation API** – used to obtain the user’s current location
- **MediaDevices API (Camera)** – used to capture photos

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (ES6 Modules)

### Libraries (UI only)
- Leaflet.js
- OpenStreetMap
- Nominatim API

### PWA Stack
- Service Worker
- Cache API
- IndexedDB (saved locations)
- localStorage (settings and photos)

## Project Structure

trippocket-pwa/
├── index.html
├── manifest.json
├── service-worker.js
├── css/
├── js/
│ ├── views/
│ ├── utils/
│ └── data/
└── icons/
---

## Installation (Local Development)

Clone the repository and serve it using any local HTTP server:

git clone https://github.com/atakankap/trippocket-pwa.git
cd trippocket-pwa
python -m http.server 8000

arduino
Kodu kopyala

Then open:
http://localhost:8000

yaml
Kodu kopyala

---

## Testing

### Offline Test
- Open browser DevTools
- Network tab → set to Offline
- Refresh the page
- The application should still load and provide limited functionality

### PWA Installation Test
- Open the application in a supported browser
- Click “Install” or “Add to Home Screen”
- Launch the app as a standalone application

---

## Data & Privacy

- All data is stored locally on the user’s device
- No server-side storage
- No tracking or analytics
- Users have full control over their data

---

## Author

Alaeddin Atakan Kaplan  - 39487


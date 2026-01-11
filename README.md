# 🎒 TripPocket - Offline-First Travel Guide PWA

A Progressive Web Application (PWA) designed to help travelers navigate cities with essential location information, even when offline.

## 📱 Features

### Core Functionality
- **Offline-First Architecture**: Access essential locations (metro stations, hospitals, police stations) without internet
- **Online Enhancement**: Get detailed information, reviews, and additional locations when connected
- **Installable**: Add to home screen for native app-like experience
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices

### Native Device Features
1. **Geolocation API** 📍
   - Find nearby places based on your current location
   - Calculate distances to locations
   - Center map on user position

2. **Camera API** 📷
   - Capture travel photos
   - Store photos locally
   - Build your trip gallery

### Views
1. **Explore View** 🗺️
   - Browse all available locations
   - Filter by category (transport, medical, emergency, tourist)
   - Find nearby places using geolocation
   - Save favorite locations

2. **Map View** 📍
   - Interactive map showing all locations
   - Filter locations by category
   - Click markers for detailed information
   - Center map on your location

3. **Saved View** 💼
   - View your saved locations
   - Manage your trip gallery
   - Capture and store photos
   - Remove saved items

## 🚀 Getting Started

### Prerequisites
- Modern web browser with PWA support (Chrome, Edge, Safari, Firefox)
- HTTPS connection (required for PWA features)
- Location and camera permissions (optional, for full functionality)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd trippocket-pwa
   ```

2. **Serve the application**
   
   You can use any static file server. Examples:
   
   **Using Python:**
   ```bash
   python -m http.server 8000
   ```
   
   **Using Node.js (http-server):**
   ```bash
   npx http-server -p 8000
   ```
   
   **Using PHP:**
   ```bash
   php -S localhost:8000
   ```

3. **Access the application**
   - Open your browser and navigate to `http://localhost:8000`
   - For full PWA features, deploy to HTTPS hosting (see Deployment section)

### Installing as PWA
1. Open the application in your browser
2. Look for the install prompt or use browser menu
3. Click "Install" or "Add to Home Screen"
4. Launch from your device's home screen

## 🏗️ Project Structure

```
trippocket-pwa/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline functionality
├── css/
│   ├── styles.css         # Main styles
│   └── views.css          # View-specific styles
├── js/
│   ├── app.js             # Main application logic
│   ├── views/
│   │   ├── explore.js     # Explore view
│   │   ├── map.js         # Map view
│   │   └── saved.js       # Saved locations view
│   ├── utils/
│   │   ├── db.js          # IndexedDB operations
│   │   ├── geolocation.js # Geolocation utilities
│   │   └── camera.js      # Camera utilities
│   └── data/
│       └── offline-data.js # Offline location data
├── icons/                  # PWA icons (various sizes)
└── README.md              # This file
```

## 🔧 Technical Implementation

### Service Worker & Caching Strategy

The application uses three caching strategies:

1. **Cache First** (Static Assets)
   - HTML, CSS, JavaScript files
   - Icons and images
   - Fastest loading for static content

2. **Network First** (API Calls)
   - Online location data
   - Falls back to cache when offline
   - Ensures fresh data when available

3. **Stale While Revalidate** (Dynamic Content)
   - Serves cached content immediately
   - Updates cache in background
   - Best user experience

### Offline Data

Essential locations stored locally include:
- 🚇 **Metro/Tram Stations**: Major public transport hubs
- 🏥 **Hospitals & Pharmacies**: Emergency medical facilities
- 🚔 **Police Stations**: Emergency services
- 🏛️ **Tourist Attractions**: Major landmarks

### IndexedDB Storage

The application uses IndexedDB for:
- Saved locations persistence
- Offline data management
- User preferences

### Native APIs

**Geolocation API:**
```javascript
// Request user location with high accuracy
getCurrentPosition({ enableHighAccuracy: true })
```

**Camera API:**
```javascript
// Access device camera with environment-facing mode
getUserMedia({ video: { facingMode: 'environment' } })
```

## 🌐 Deployment

### Recommended Hosting Platforms

1. **Netlify** (Recommended)
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy
   netlify deploy --prod
   ```

2. **Surge.sh**
   ```bash
   # Install Surge
   npm install -g surge
   
   # Deploy
   surge .
   ```

3. **GitHub Pages**
   - Push to GitHub repository
   - Enable GitHub Pages in repository settings
   - Select main branch as source

### HTTPS Requirement
All PWA features require HTTPS. The hosting platforms above provide free HTTPS certificates.

## 📊 Performance

The application is optimized for:
- **Fast Loading**: Static assets cached on first visit
- **Offline Performance**: Full functionality without internet
- **Lighthouse Score**: Targets 90+ in all categories
  - Performance
  - Accessibility
  - Best Practices
  - SEO
  - PWA

### Testing Performance

Use Chrome DevTools Lighthouse:
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select categories to test
4. Click "Generate report"

## 🔒 Permissions

The application requests the following permissions:

- **Location**: To find nearby places and show your position on map
- **Camera**: To capture travel photos
- **Storage**: To save locations and photos locally

All permissions are optional. The app works with limited functionality if denied.

## 🧪 Testing

### Testing Offline Mode
1. Open application in browser
2. Open DevTools (F12)
3. Go to Network tab
4. Select "Offline" from throttling dropdown
5. Refresh page - app should still work

### Testing Installation
1. Open in Chrome/Edge
2. Look for install icon in address bar
3. Click to install
4. Verify app appears in app drawer

### Testing Geolocation
1. Grant location permission when prompted
2. Click "Find Nearby Places"
3. Verify locations are sorted by distance

### Testing Camera
1. Grant camera permission when prompted
2. Click "Add Photo" in Saved view
3. Capture photo
4. Verify photo appears in gallery

## 🛠️ Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## 📝 Code Quality

The codebase follows best practices:
- **Modular Structure**: Separated concerns (views, utils, data)
- **ES6 Modules**: Clean import/export system
- **Async/Await**: Modern asynchronous code
- **Error Handling**: Try-catch blocks for all async operations
- **Console Logging**: Detailed logs for debugging
- **Comments**: Clear documentation throughout code

## 🐛 Known Issues

- Map view uses simplified visualization (can be enhanced with Leaflet.js)
- Camera modal styling may vary across browsers
- IndexedDB not supported in private browsing mode

## 🚀 Future Enhancements

- [ ] Integration with real map API (Leaflet/Mapbox)
- [ ] Push notifications for nearby points of interest
- [ ] Multi-language support
- [ ] Trip planning and itinerary features
- [ ] Social sharing capabilities
- [ ] Offline map tiles

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Author

Created as a Progressive Web Application project demonstrating:
- PWA best practices
- Offline-first architecture
- Native device API integration
- Modern JavaScript development

---

**Note**: This application requires HTTPS for full PWA functionality. Use the recommended hosting platforms for deployment.

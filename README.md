TripPocket PWA is a Progressive Web Application developed as a course project. The application allows users to explore places, view maps, save memories, and access essential locations both online and offline. Live demo of the application is available at https://trippocket.netlify.app
. The purpose of this project is to demonstrate core Progressive Web App concepts such as installability, offline functionality, usage of native browser APIs, and Service Worker–based caching. The project is implemented using Vanilla JavaScript without frameworks for the PWA layer, as required by the course.

The application supports both online and offline modes. In online mode, users can search and explore places, use an interactive map view, save favorite locations, and capture photos using the device camera. In offline mode, users can access predefined essential locations such as hospitals, police stations, and metro stations, view previously saved photos and data, and use basic navigation without an internet connection.

TripPocket is installable on mobile and desktop devices, follows an offline-first approach, uses a Service Worker for caching, is deployed over HTTPS, and is fully responsive. Native browser APIs used in the project include the Geolocation API to obtain the user’s current location and the MediaDevices API to capture photos using the device camera.

The technologies used in this project include HTML5, CSS3, and Vanilla JavaScript with ES6 modules. For the user interface only, Leaflet.js is used for interactive maps together with OpenStreetMap tiles and the Nominatim API for geocoding. The PWA stack consists of a Service Worker, Cache API, IndexedDB for saved locations, and localStorage for settings and photos.

The project structure includes index.html as the main entry point, manifest.json for PWA configuration, service-worker.js for offline functionality, separate folders for CSS and JavaScript files, and an icons folder containing the required PWA icons.

For local development, the repository can be cloned from GitHub and served using any local HTTP server, for example by running a simple Python HTTP server and opening the application in a browser at http://localhost:8000
.

Testing includes switching the browser to offline mode via DevTools to verify offline functionality and installing the application via “Add to Home Screen” or “Install” to verify PWA installation behavior.

All application data is stored locally on the user’s device. There is no server-side storage, no tracking, and no analytics. Users have full control over their data.

Author: Alaeddin Atakan Kaplan – 39487.

## Author

Alaeddin Atakan Kaplan  - 39487


import { getOfflineLocations } from '../data/offline-data.js';
import { getCurrentPosition } from '../utils/geolocation.js';
import { fetchOnlineLocations } from '../data/online-api.js';

let map = null;
let userMarker = null;
let locationMarkers = [];
let markersLayer = null;

export async function renderMapView(container, isOnline) {
  container.innerHTML = `
    <div class="map-view">
      <div class="view-header">
        <h2>Map View</h2>
        ${!isOnline ? '<span class="badge badge-offline">Offline Map</span>' : '<span class="badge badge-online">Online Map</span>'}
      </div>
      
      ${isOnline ? `
        <!-- Online Mode: Search & Recommendations -->
        <div class="map-online-controls">
          <div class="map-search-bar">
            <input type="text" id="mapSearchInput" class="form-input" placeholder="🔍 Search for places nearby..." />
            <button id="mapSearchBtn" class="btn-primary">Search</button>
          </div>
          
          <div id="mapRecommendations" class="map-recommendations">
            <h3>📍 Recommended Near You</h3>
            <div id="recommendationsList" class="recommendations-list">
              <div class="loading">Loading recommendations...</div>
            </div>
          </div>
        </div>
      ` : `
        <!-- Offline Mode: Filters & Controls -->
        <div class="map-controls">
          <button id="centerMapBtn" class="btn-primary">
            🎯 Center on My Location
          </button>
          <div class="filter-controls">
            <label>
              <input type="checkbox" id="filterTransport" checked> 🚇 Transport
            </label>
            <label>
              <input type="checkbox" id="filterHospital" checked> 🏥 Medical
            </label>
            <label>
              <input type="checkbox" id="filterPolice" checked> 🚔 Emergency
            </label>
          </div>
        </div>
      `}
      
      <div id="mapContainer" class="leaflet-map-container"></div>
      
      <div id="locationDetails" class="location-details hidden">
        <div class="details-content"></div>
      </div>
    </div>
  `;
  
  setupMapListeners(isOnline);
  await initializeMap(isOnline);
  
  // Automatically get user location when map loads (online mode only)
  if (isOnline) {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      console.log('[Map] Auto-centering on user location:', latitude, longitude);
      centerMapOnLocation(latitude, longitude);
    } catch (error) {
      console.log('[Map] Could not get user location automatically:', error.message);
      // Map will stay centered on Warsaw
    }
  }
}

function setupMapListeners(isOnline) {
  if (isOnline) {
    // Online mode: Search and recommendations
    const searchInput = document.getElementById('mapSearchInput');
    const searchBtn = document.getElementById('mapSearchBtn');
    
    const performSearch = async () => {
      const query = searchInput.value.trim();
      if (!query) {
        if (window.toastManager) {
          window.toastManager.warning('Please enter a search term');
        }
        return;
      }
      
      searchBtn.disabled = true;
      searchBtn.textContent = 'Searching...';
      
      try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Search using Overpass API
        const results = await searchNearbyPlaces(query, latitude, longitude);
        displaySearchResults(results);
        
        if (window.toastManager) {
          window.toastManager.success(`Found ${results.length} places`);
        }
      } catch (error) {
        console.error('[Map] Search error:', error);
        if (window.toastManager) {
          window.toastManager.error('Search failed. Please try again.');
        }
      } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
      }
    };
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
    
    // Load recommendations automatically
    loadRecommendations();
  } else {
    // Offline mode: Center button and filters
    const centerBtn = document.getElementById('centerMapBtn');
    const filterTransport = document.getElementById('filterTransport');
    const filterHospital = document.getElementById('filterHospital');
    const filterPolice = document.getElementById('filterPolice');
    
    centerBtn.addEventListener('click', async () => {
      centerBtn.disabled = true;
      centerBtn.textContent = '🎯 Locating...';
      
      try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        console.log('[Map] Centering on user location:', latitude, longitude);
        centerMapOnLocation(latitude, longitude);
        
        centerBtn.textContent = '🎯 Center on My Location';
      } catch (error) {
        console.error('[Map] Location error:', error);
        alert('Unable to get your location');
        centerBtn.textContent = '🎯 Center on My Location';
      } finally {
        centerBtn.disabled = false;
      }
    });
    
    const updateFilters = () => {
      const filters = {
        transport: filterTransport.checked,
        hospital: filterHospital.checked,
        police: filterPolice.checked
      };
      filterMapLocations(filters);
    };
    
    filterTransport.addEventListener('change', updateFilters);
    filterHospital.addEventListener('change', updateFilters);
    filterPolice.addEventListener('change', updateFilters);
  }
}

async function initializeMap(isOnline) {
  const mapContainer = document.getElementById('mapContainer');
  
  // Only load offline locations in offline mode
  const locations = isOnline ? [] : getOfflineLocations();
  
  if (map) {
    map.remove();
  }
  
  const warsawCenter = [52.2297, 21.0122];
  
  map = L.map('mapContainer', {
    center: warsawCenter,
    zoom: 13,
    zoomControl: true
  });
  
  console.log('[Map] Leaflet map initialized');
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    minZoom: 11
  }).addTo(map);
  
  markersLayer = L.layerGroup().addTo(map);
  
  // Only show markers in offline mode
  if (!isOnline) {
    locations.forEach(location => {
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-content" data-category="${location.category}">
          <div class="marker-icon-leaflet">${getCategoryIcon(location.category)}</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
    
    const marker = L.marker([location.lat, location.lon], { icon })
      .addTo(markersLayer);
    
    marker.bindPopup(`
      <div class="leaflet-popup-content-custom">
        <h3>${location.name}</h3>
        <p class="popup-type">${getCategoryIcon(location.category)} ${location.type}</p>
        ${location.description ? `<p class="popup-desc">${location.description}</p>` : ''}
        ${location.address ? `<p class="popup-address">📍 ${location.address}</p>` : ''}
        ${location.essential ? '<span class="badge badge-essential">Essential</span>' : ''}
      </div>
    `);
    
      marker.locationData = location;
      locationMarkers.push(marker);
      
      console.log(`[Map] Added marker: ${location.name} at [${location.lat}, ${location.lon}]`);
    });
    
    const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lon]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}

function centerMapOnLocation(lat, lon) {
  if (!map) return;
  
  if (userMarker) {
    map.removeLayer(userMarker);
  }
  
  const userIcon = L.divIcon({
    className: 'user-marker-leaflet',
    html: `
      <div class="user-marker-content">
        <div class="user-marker-icon">📍</div>
        <div class="user-marker-label">You</div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50]
  });
  
  userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
  
  userMarker.bindPopup(`
    <div class="leaflet-popup-content-custom">
      <h3>Your Location</h3>
      <p class="popup-desc">You are here</p>
    </div>
  `);
  
  map.setView([lat, lon], 15, { animate: true });
  
  console.log('[Map] User marker placed at:', lat, lon);
}

function filterMapLocations(filters) {
  if (!markersLayer) return;
  
  locationMarkers.forEach(marker => {
    const category = marker.locationData.category;
    const shouldShow = filters[category] !== false;
    
    if (shouldShow) {
      if (!markersLayer.hasLayer(marker)) {
        markersLayer.addLayer(marker);
      }
    } else {
      if (markersLayer.hasLayer(marker)) {
        markersLayer.removeLayer(marker);
      }
    }
  });
  
  console.log('[Map] Filters applied:', filters);
}


function getCategoryIcon(category) {
  const icons = {
    transport: '🚇',
    hospital: '🏥',
    police: '🚔',
    tourist: '🏛️',
    shopping: '🛍️',
    restaurant: '🍽️'
  };
  return icons[category] || '📍';
}

// Calculate distance between two points in km (Haversine formula)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Online mode: Search nearby places using Nominatim (more reliable)
async function searchNearbyPlaces(query, lat, lon) {
  try {
    // First, get the user's city using reverse geocoding
    let userCity = '';
    let userCountry = '';
    
    try {
      const reverseUrl = `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
      
      const reverseResponse = await fetch(reverseUrl, {
        headers: { 'User-Agent': 'TripPocket PWA/1.0' }
      });
      
      if (reverseResponse.ok) {
        const reverseData = await reverseResponse.json();
        const addr = reverseData.address || {};
        userCity = addr.city || addr.town || addr.village || '';
        userCountry = addr.country || '';
        console.log('[Map] User location:', userCity, userCountry);
      }
    } catch (error) {
      console.warn('[Map] Reverse geocoding failed:', error);
    }
    
    // Build search query with city context
    let searchQuery = query;
    if (userCity) {
      searchQuery = `${query}, ${userCity}`;
      if (userCountry) {
        searchQuery += `, ${userCountry}`;
      }
    }
    
    // Search with city context and bounded area
    const url = `https://nominatim.openstreetmap.org/search?` + 
      `format=json` +
      `&q=${encodeURIComponent(searchQuery)}` +
      `&viewbox=${lon-0.1},${lat-0.1},${lon+0.1},${lat+0.1}` +
      `&bounded=1` +
      `&limit=20` +
      `&addressdetails=1` +
      `&dedupe=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TripPocket PWA/1.0'
      }
    });
    
    if (!response.ok) throw new Error('Search failed');
    
    const data = await response.json();
    
    if (data.length === 0) {
      console.log('[Map] No results found for:', searchQuery);
      return [];
    }
    
    // Calculate distance from user location and sort
    const results = data.map(place => {
      // Get a clean name
      let name = place.name || place.display_name.split(',')[0];
      
      // Get type with better labels
      let type = place.type || place.class || 'place';
      if (place.type === 'road' || place.type === 'residential' || place.type === 'pedestrian') {
        type = 'Street';
      } else if (place.type === 'suburb' || place.type === 'neighbourhood') {
        type = 'Neighborhood';
      } else if (place.class === 'amenity') {
        type = place.type || 'Amenity';
      } else if (place.class === 'shop') {
        type = 'Shop';
      } else if (place.class === 'tourism') {
        type = 'Tourist Attraction';
      } else if (place.class === 'building') {
        type = 'Building';
      }
      
      // Get address
      const addr = place.address || {};
      let address = '';
      if (addr.road) {
        address = addr.road;
        if (addr.house_number) address = `${addr.house_number} ${address}`;
      }
      if (addr.suburb) address += (address ? ', ' : '') + addr.suburb;
      if (addr.city || addr.town) address += (address ? ', ' : '') + (addr.city || addr.town);
      
      // Calculate distance from user
      const placeLat = parseFloat(place.lat);
      const placeLon = parseFloat(place.lon);
      const distance = calculateDistanceKm(lat, lon, placeLat, placeLon);
      
      return {
        id: place.place_id,
        name: name,
        lat: placeLat,
        lon: placeLon,
        type: type,
        address: address || place.display_name,
        importance: place.importance || 0,
        distance: distance
      };
    })
    .sort((a, b) => {
      // Sort by distance (closer is better)
      return a.distance - b.distance;
    })
    .slice(0, 12);
    
    console.log('[Map] Found', results.length, 'results in', userCity || 'nearby area');
    return results;
    
  } catch (error) {
    console.error('[Map] Search error:', error);
    if (window.toastManager) {
      window.toastManager.error('Search failed. Please try again.');
    }
    return [];
  }
}


// Display search results on map
function displaySearchResults(results) {
  // Clear existing markers
  if (markersLayer) {
    markersLayer.clearLayers();
  }
  locationMarkers = [];
  
  if (results.length === 0) {
    if (window.toastManager) {
      window.toastManager.warning('No results found. Try a different search term.');
    }
    return;
  }
  
  results.forEach((place, index) => {
    if (!place.lat || !place.lon) return;
    
    // Different marker for first result (most relevant)
    const isFirst = index === 0;
    
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-content ${isFirst ? 'marker-primary' : ''}">
          <div class="marker-icon-leaflet">${isFirst ? '⭐' : '📍'}</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
    
    const marker = L.marker([place.lat, place.lon], { icon })
      .addTo(markersLayer);
    
    marker.bindPopup(`
      <div class="leaflet-popup-content-custom">
        <h3>${place.name}</h3>
        <p class="popup-type">📍 ${place.type}</p>
        ${place.address ? `<p class="popup-address">${place.address}</p>` : ''}
        ${isFirst ? '<span class="badge badge-primary">Top Result</span>' : ''}
      </div>
    `);
    
    locationMarkers.push(marker);
    
    // Auto-open popup for first result
    if (isFirst) {
      marker.openPopup();
    }
  });
  
  // Fit map to show all results
  const bounds = L.latLngBounds(results.map(r => [r.lat, r.lon]));
  map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
}

// Load recommendations
async function loadRecommendations() {
  const recommendationsList = document.getElementById('recommendationsList');
  
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    
    // Fetch popular places nearby
    const places = await fetchOnlineLocations(latitude, longitude, 1000);
    
    if (places.length === 0) {
      recommendationsList.innerHTML = '<p class="empty-state">No recommendations available</p>';
      return;
    }
    
    // Show top 5 recommendations
    const topPlaces = places.slice(0, 5);
    
    recommendationsList.innerHTML = topPlaces.map(place => `
      <div class="recommendation-card" data-lat="${place.lat}" data-lon="${place.lon}">
        <div class="recommendation-icon">${getCategoryIcon(place.category)}</div>
        <div class="recommendation-info">
          <h4>${place.name}</h4>
          <p>${place.type}</p>
        </div>
        <button class="btn-text recommendation-view-btn" onclick="window.mapView.viewOnMap(${place.lat}, ${place.lon}, '${place.name.replace(/'/g, "\\'")}')">View</button>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('[Map] Recommendations error:', error);
    recommendationsList.innerHTML = '<p class="empty-state">Unable to load recommendations</p>';
  }
}

// View place on map
window.mapView = {
  viewOnMap(lat, lon, name) {
    if (!map) return;
    
    // Clear existing markers
    if (markersLayer) {
      markersLayer.clearLayers();
    }
    
    // Add marker for this place
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-content">
          <div class="marker-icon-leaflet">📍</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
    
    const marker = L.marker([lat, lon], { icon }).addTo(markersLayer);
    marker.bindPopup(`
      <div class="leaflet-popup-content-custom">
        <h3>${name}</h3>
      </div>
    `).openPopup();
    
    map.setView([lat, lon], 16, { animate: true });
    
    if (window.toastManager) {
      window.toastManager.success(`Viewing ${name}`);
    }
  }
};

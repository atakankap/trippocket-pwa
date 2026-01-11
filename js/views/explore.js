import { getOfflineLocations } from '../data/offline-data.js';
import { fetchOnlineLocations, fetchTrendingLocations } from '../data/online-api.js';
import { getCurrentPosition } from '../utils/geolocation.js';
import { saveLocation, getSavedLocations } from '../utils/db.js';
import { showReviewModal, renderReviewsList, getAverageRating } from '../utils/reviews.js';

export async function renderExploreView(container, isOnline) {
  const savedLocations = await getSavedLocations();
  
  container.innerHTML = `
    <div class="explore-view">
      <div class="view-header">
        <h2>Explore Places</h2>
        ${renderConnectionBanner(isOnline)}
      </div>
      
      ${isOnline ? `
        <div class="search-bar">
          <input type="text" id="searchInput" placeholder="🔍 Search restaurants, cafes, hotels..." />
          <button id="searchBtn" class="btn-secondary">Search</button>
        </div>
      ` : ''}
      
      <div class="location-controls">
        <button id="getNearbyBtn" class="btn-primary">
          📍 Find Nearby Places
        </button>
        ${isOnline ? '<button id="trendingBtn" class="btn-secondary">🔥 Trending Now</button>' : ''}
      </div>
      
      ${isOnline ? '<div class="info-banner"><div class="info-banner-icon">✨</div><div class="info-banner-content"><div class="info-banner-title">Online Mode Active</div><div class="info-banner-message">Showing all locations with live data, opening hours, and more details</div></div></div>' : ''}
      
      <div id="locationsList" class="locations-list">
        <div class="loading">Loading locations...</div>
      </div>
    </div>
  `;
  
  setupExploreListeners(isOnline, savedLocations);
  loadLocations(isOnline);
}

function renderConnectionBanner(isOnline) {
  if (isOnline) {
    return `
      <div class="connection-banner online">
        <span class="status-indicator"></span>
        <span>Online Mode - ${getLocationCount(true)} locations available</span>
      </div>
    `;
  } else {
    return `
      <div class="connection-banner offline">
        <span class="status-indicator offline"></span>
        <span>Offline Mode - ${getLocationCount(false)} essential locations only</span>
      </div>
    `;
  }
}

function getLocationCount(isOnline) {
  return isOnline ? '30+' : '16';
}

function setupExploreListeners(isOnline, savedLocations) {
  const getNearbyBtn = document.getElementById('getNearbyBtn');
  
  getNearbyBtn.addEventListener('click', async () => {
    getNearbyBtn.disabled = true;
    getNearbyBtn.textContent = '📍 Getting location...';
    
    if (window.loadingManager) {
      window.loadingManager.show('Getting your location...', 'Please wait');
    }
    
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      console.log('[Explore] User location:', latitude, longitude);
      
      let locations;
      if (isOnline) {
        const [offline, online] = await Promise.all([
          Promise.resolve(getOfflineLocations()),
          fetchOnlineLocations(latitude, longitude)
        ]);
        locations = [...offline, ...online];
      } else {
        locations = getOfflineLocations();
      }
      
      const nearby = findNearbyLocations(locations, latitude, longitude, 5);
      displayLocations(nearby, true, isOnline);
      
      if (window.toastManager) {
        window.toastManager.success(`Found ${nearby.length} places nearby!`);
      }
      
      getNearbyBtn.textContent = '📍 Find Nearby Places';
    } catch (error) {
      console.error('[Explore] Location error:', error);
      if (window.toastManager) {
        window.toastManager.error('Unable to get your location');
      }
      getNearbyBtn.textContent = '📍 Find Nearby Places';
    } finally {
      getNearbyBtn.disabled = false;
      if (window.loadingManager) {
        window.loadingManager.hide();
      }
    }
  });
  
  // Trending button (online only)
  const trendingBtn = document.getElementById('trendingBtn');
  if (trendingBtn && isOnline) {
    trendingBtn.addEventListener('click', async () => {
      if (window.loadingManager) {
        window.loadingManager.show('Loading trending places...', 'Popular locations right now');
      }
      
      try {
        const trendingIds = await fetchTrendingLocations();
        const [offline, online] = await Promise.all([
          Promise.resolve(getOfflineLocations()),
          fetchOnlineLocations()
        ]);
        const allLocations = [...offline, ...online];
        
        const trending = allLocations.filter(loc => trendingIds.includes(loc.id));
        displayLocations(trending, false, isOnline);
        
        if (window.toastManager) {
          window.toastManager.info('Showing trending places 🔥');
        }
      } catch (error) {
        console.error('[Explore] Trending error:', error);
        if (window.toastManager) {
          window.toastManager.error('Failed to load trending places');
        }
      } finally {
        if (window.loadingManager) {
          window.loadingManager.hide();
        }
      }
    });
  }
  
  // Search (online only)
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  
  if (searchBtn && searchInput && isOnline) {
    const performSearch = async () => {
      const query = searchInput.value.trim();
      if (!query) {
        if (window.toastManager) {
          window.toastManager.warning('Please enter a search term');
        }
        return;
      }
      
      if (window.loadingManager) {
        window.loadingManager.show('Searching...', `Looking for "${query}"`);
      }
      
      try {
        const [offline, online] = await Promise.all([
          Promise.resolve(getOfflineLocations()),
          fetchOnlineLocations()
        ]);
        const allLocations = [...offline, ...online];
        
        const results = allLocations.filter(loc =>
          loc.name.toLowerCase().includes(query.toLowerCase()) ||
          loc.type.toLowerCase().includes(query.toLowerCase()) ||
          loc.description.toLowerCase().includes(query.toLowerCase())
        );
        
        displayLocations(results, false, isOnline);
        
        if (window.toastManager) {
          window.toastManager.success(`Found ${results.length} results`);
        }
      } catch (error) {
        console.error('[Explore] Search error:', error);
        if (window.toastManager) {
          window.toastManager.error('Search failed');
        }
      } finally {
        if (window.loadingManager) {
          window.loadingManager.hide();
        }
      }
    };
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
}

async function loadLocations(isOnline) {
  const locationsList = document.getElementById('locationsList');
  
  try {
    let locations;
    
    if (isOnline) {
      // Load both offline and online locations
      const [offline, online] = await Promise.all([
        Promise.resolve(getOfflineLocations()),
        fetchOnlineLocations()
      ]);
      locations = [...offline, ...online];
      console.log(`[Explore] Loaded ${offline.length} offline + ${online.length} online = ${locations.length} total locations`);
    } else {
      locations = getOfflineLocations();
      console.log(`[Explore] Loaded ${locations.length} offline locations`);
    }
    
    displayLocations(locations, false, isOnline);
  } catch (error) {
    console.error('[Explore] Error loading locations:', error);
    locationsList.innerHTML = '<div class="error-state"><div class="error-state-title">⚠️ Failed to load locations</div><div class="error-state-message">Please try again later</div></div>';
  }
}

async function fetchOnlineLocationsOld(lat, lon) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const onlineLocations = [
    {
      id: 'online-1',
      name: 'Złote Tarasy',
      category: 'shopping',
      type: 'Shopping Mall',
      description: 'Modern shopping center near Central Station',
      lat: 52.2296,
      lon: 21.0019,
      rating: 4.5,
      reviews: 8234,
      openNow: true,
      image: 'https://via.placeholder.com/400x200?text=Zlote+Tarasy'
    },
    {
      id: 'online-2',
      name: 'Wilanów Palace',
      category: 'tourist',
      type: 'Historical Site',
      description: 'Baroque royal palace with beautiful gardens',
      lat: 52.1654,
      lon: 21.0909,
      rating: 4.7,
      reviews: 12456,
      openNow: true,
      image: 'https://via.placeholder.com/400x200?text=Wilanow+Palace'
    },
    {
      id: 'online-3',
      name: 'Nowy Świat Street',
      category: 'tourist',
      type: 'Street',
      description: 'Famous street with cafes, restaurants and shops',
      lat: 52.2324,
      lon: 21.0211,
      rating: 4.6,
      reviews: 9890,
      openNow: true,
      image: 'https://via.placeholder.com/400x200?text=Nowy+Swiat'
    }
  ];
  
  return [...getOfflineLocations(), ...onlineLocations];
}

function findNearbyLocations(locations, userLat, userLon, radiusKm) {
  return locations.map(location => {
    const distance = calculateDistance(userLat, userLon, location.lat, location.lon);
    return { ...location, distance };
  })
  .filter(location => location.distance <= radiusKm)
  .sort((a, b) => a.distance - b.distance);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

function displayLocations(locations, showDistance, isOnline = false) {
  const locationsList = document.getElementById('locationsList');
  
  if (locations.length === 0) {
    locationsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No locations found</div>
        <div class="empty-state-message">Try adjusting your search or location</div>
      </div>
    `;
    return;
  }
  
  locationsList.innerHTML = locations.map(location => {
    const avgRating = getAverageRating(location.id);
    const userRating = location.rating || avgRating;
    
    return `
    <div class="card location-card hover-lift" data-id="${location.id}">
      <div class="location-header">
        <div class="location-info">
          <h3>${location.name}</h3>
          <p class="location-type">${getCategoryIcon(location.category)} ${location.type}</p>
          ${userRating > 0 ? `<div class="location-rating">⭐ ${userRating} ${location.reviewCount ? `(${location.reviewCount} reviews)` : 'rating'}</div>` : ''}
        </div>
        <button class="save-btn" data-id="${location.id}" title="Save location">
          ${location.saved ? '❤️' : '🤍'}
        </button>
      </div>
      
      ${location.description ? `<p class="location-description">${location.description}</p>` : ''}
      
      ${isOnline && location.hours ? `<div class="location-hours">🕐 ${location.hours}</div>` : ''}
      ${isOnline && location.phone ? `<div class="location-phone">📞 ${location.phone}</div>` : ''}
      
      <div class="location-meta">
        ${location.essential ? '<span class="badge badge-essential">Essential</span>' : ''}
        ${location.popular ? '<span class="badge badge-popular">🔥 Popular</span>' : ''}
        ${location.openNow ? '<span class="badge badge-open">Open Now</span>' : ''}
        ${location.priceRange ? `<span class="badge badge-price">${location.priceRange}</span>` : ''}
        ${showDistance && location.distance ? `<span class="distance">📍 ${location.distance.toFixed(2)} km</span>` : ''}
      </div>
      
      ${isOnline && location.amenities ? `
        <div class="location-amenities">
          ${location.amenities.slice(0, 3).map(a => `<span class="chip">${a}</span>`).join('')}
        </div>
      ` : ''}
      
      <div class="location-actions">
        <button class="btn-secondary btn-sm review-btn" data-location='${JSON.stringify(location).replace(/'/g, "&apos;")}'>
          ⭐ Write Review
        </button>
        <button class="btn-text btn-sm view-reviews-btn" data-id="${location.id}">
          💬 View Reviews
        </button>
      </div>
    </div>
  `}).join('');
  
  setupLocationCardListeners();
}

function setupLocationCardListeners() {
  const saveButtons = document.querySelectorAll('.save-btn');
  
  saveButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const locationId = btn.dataset.id;
      
      try {
        await saveLocation(locationId);
        btn.textContent = '❤️';
        if (window.toastManager) {
          window.toastManager.success('Location saved!');
        }
        console.log('[Explore] Location saved:', locationId);
      } catch (error) {
        console.error('[Explore] Error saving location:', error);
        if (window.toastManager) {
          window.toastManager.error('Failed to save location');
        }
      }
    });
  });
  
  // Review buttons
  const reviewButtons = document.querySelectorAll('.review-btn');
  reviewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const location = JSON.parse(btn.dataset.location.replace(/&apos;/g, "'"));
      showReviewModal(location);
    });
  });
  
  // View reviews buttons
  const viewReviewsButtons = document.querySelectorAll('.view-reviews-btn');
  viewReviewsButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const locationId = btn.dataset.id;
      showReviewsModal(locationId);
    });
  });
}

function showReviewsModal(locationId) {
  const existingModal = document.getElementById('reviewsListModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const locations = getOfflineLocations();
  const location = locations.find(loc => loc.id === locationId);
  
  if (!location) return;
  
  const modal = document.createElement('div');
  modal.id = 'reviewsListModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content scale-in" style="max-width: 600px;">
      <div class="modal-header">
        <div>
          <h3>${location.name}</h3>
          <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">${location.type}</p>
        </div>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      </div>
      
      <div class="modal-body">
        ${renderReviewsList(locationId)}
      </div>
      
      <div class="modal-footer">
        <button class="btn-primary" onclick="this.closest('.modal-overlay').remove(); window.exploreView.writeReview('${locationId}')">
          ⭐ Write a Review
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Global explore view functions
window.exploreView = {
  writeReview(locationId) {
    const locations = getOfflineLocations();
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      showReviewModal(location);
    }
  }
};

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

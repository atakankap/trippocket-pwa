import { getSavedLocations, removeLocation } from '../utils/db.js';
import { capturePhoto } from '../utils/camera.js';

export async function renderSavedView(container) {
  container.innerHTML = `
    <div class="saved-view">
      <div class="view-header">
        <h2>My Travel Memories</h2>
        <button id="addPhotoBtn" class="btn-primary">
          ➕ Add Memory
        </button>
      </div>
      
      <div class="filters-container">
        <div class="filter-group">
          <label>📅 Time Period</label>
          <select id="timeFilter" class="filter-select">
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>🌍 Location</label>
          <select id="locationFilter" class="filter-select">
            <option value="all">All Locations</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>🏷️ Category</label>
          <select id="categoryFilter" class="filter-select">
            <option value="all">All Categories</option>
            <option value="beach">🏖️ Beach</option>
            <option value="mountain">⛰️ Mountain</option>
            <option value="city">🏙️ City</option>
            <option value="food">🍽️ Food</option>
            <option value="culture">🏛️ Culture</option>
            <option value="nature">🌳 Nature</option>
            <option value="adventure">🎢 Adventure</option>
          </select>
        </div>
        
        <button id="clearFiltersBtn" class="btn-text">Clear Filters</button>
      </div>
      
      <div id="photoGallery" class="photo-gallery">
        <h3>My Trip Photos <span id="photoCount"></span></h3>
        <div id="photoGrid" class="photo-grid"></div>
      </div>
    </div>
  `;
  
  setupSavedListeners();
  loadPhotos();
  setupFilters();
}

function displaySavedLocations(locations) {
  const listContainer = document.getElementById('savedLocationsList');
  
  listContainer.innerHTML = locations.map(location => `
    <div class="card saved-location-card" data-id="${location.id}">
      <div class="location-header">
        <div class="location-info">
          <h3>${location.name}</h3>
          <p class="location-type">${getCategoryIcon(location.category)} ${location.type}</p>
        </div>
        <button class="remove-btn" data-id="${location.id}" title="Remove">
          🗑️
        </button>
      </div>
      
      ${location.description ? `<p class="location-description">${location.description}</p>` : ''}
      
      <div class="location-meta">
        <span class="saved-date">Saved: ${new Date(location.savedAt).toLocaleDateString()}</span>
      </div>
    </div>
  `).join('');
  
  const removeButtons = document.querySelectorAll('.remove-btn');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const locationId = btn.dataset.id;
      
      if (confirm('Remove this location from saved places?')) {
        await removeLocation(locationId);
        const savedLocations = await getSavedLocations();
        
        if (savedLocations.length === 0) {
          document.getElementById('savedLocationsList').innerHTML = 
            '<div class="empty-state">No saved locations yet. Start exploring!</div>';
        } else {
          displaySavedLocations(savedLocations);
        }
      }
    });
  });
}

function setupSavedListeners() {
  const addPhotoBtn = document.getElementById('addPhotoBtn');
  
  addPhotoBtn.addEventListener('click', async () => {
    showAddPhotoModal();
  });
}

function showAddPhotoModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content scale-in" style="max-width: 500px;">
      <div class="modal-header">
        <h3>📷 Add New Memory</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">📍 Location Name</label>
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" id="photoLocationName" class="form-input" placeholder="Where is this?" maxlength="100" style="flex: 1;">
            <button id="useCurrentLocationBtn" class="btn-secondary" style="white-space: nowrap;">
              📍 Use Current Location
            </button>
          </div>
          <div id="locationStatus" style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;"></div>
        </div>
        
        <div class="form-group">
          <label class="form-label">🏷️ Category</label>
          <select id="photoCategory" class="form-input">
            <option value="">Select category (optional)</option>
            <option value="beach">🏖️ Beach</option>
            <option value="mountain">⛰️ Mountain</option>
            <option value="city">🏙️ City</option>
            <option value="food">🍽️ Food</option>
            <option value="culture">🏛️ Culture</option>
            <option value="nature">🌳 Nature</option>
            <option value="adventure">🎢 Adventure</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">📝 Notes</label>
          <textarea id="photoNotes" class="form-textarea" placeholder="Add your thoughts, memories, or details..." maxlength="500" rows="4"></textarea>
          <div class="character-count"><span id="notesCount">0</span>/500</div>
        </div>
        
        <div class="form-group">
          <label class="form-label">📷 Photo</label>
          <div class="photo-upload-buttons">
            <button type="button" id="takePhotoBtn" class="btn-secondary" style="flex: 1;">
              📸 Take Photo
            </button>
            <button type="button" id="choosePhotoBtn" class="btn-secondary" style="flex: 1;">
              🖼️ Choose from Gallery
            </button>
          </div>
          <input type="file" id="cameraInput" accept="image/*" capture="camera" style="display: none;">
          <input type="file" id="galleryInput" accept="image/*" style="display: none;">
          <div id="photoPreviewContainer" style="display: none; margin-top: 1rem;">
            <img id="photoPreview" style="width: 100%; border-radius: 8px; max-height: 300px; object-fit: cover;">
            <button type="button" id="removePhotoBtn" class="btn-text" style="margin-top: 0.5rem; width: 100%;">
              🗑️ Remove Photo
            </button>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-text" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn-primary" id="saveMemoryBtn">💾 Save Memory</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Character counter
  const notesTextarea = document.getElementById('photoNotes');
  const notesCount = document.getElementById('notesCount');
  notesTextarea.addEventListener('input', () => {
    notesCount.textContent = notesTextarea.value.length;
  });
  
  // Use Current Location button
  const useLocationBtn = document.getElementById('useCurrentLocationBtn');
  const locationInput = document.getElementById('photoLocationName');
  const locationStatus = document.getElementById('locationStatus');
  
  useLocationBtn.addEventListener('click', async () => {
    useLocationBtn.disabled = true;
    useLocationBtn.textContent = '📍 Getting location...';
    locationStatus.textContent = 'Getting your location...';
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding using Nominatim (OpenStreetMap)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          // Extract location name
          const address = data.address;
          let locationName = '';
          
          if (address.road) {
            locationName = address.road;
            if (address.house_number) {
              locationName = `${address.road} ${address.house_number}`;
            }
          } else if (address.suburb || address.neighbourhood) {
            locationName = address.suburb || address.neighbourhood;
          } else if (address.city || address.town || address.village) {
            locationName = address.city || address.town || address.village;
          } else {
            locationName = data.display_name.split(',')[0];
          }
          
          // Add city/country for context
          const city = address.city || address.town || address.village || '';
          const country = address.country || '';
          
          if (city && locationName !== city) {
            locationName += `, ${city}`;
          }
          
          locationInput.value = locationName;
          locationStatus.textContent = `✅ Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          locationStatus.style.color = 'var(--success-color)';
          
          if (window.toastManager) {
            window.toastManager.success('📍 Location added!');
          }
        } else {
          throw new Error('Geocoding failed');
        }
      } catch (geocodeError) {
        // Fallback: Just use coordinates
        locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        locationStatus.textContent = `✅ Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        locationStatus.style.color = 'var(--success-color)';
        
        if (window.toastManager) {
          window.toastManager.success('📍 Coordinates added!');
        }
      }
      
      console.log('[Saved] Location:', latitude, longitude);
    } catch (error) {
      console.error('[Saved] Location error:', error);
      locationStatus.textContent = '❌ Unable to get location. Please enable location services.';
      locationStatus.style.color = 'var(--error-color)';
      
      if (window.toastManager) {
        window.toastManager.error('Unable to get location');
      }
    } finally {
      useLocationBtn.disabled = false;
      useLocationBtn.textContent = '📍 Use Current Location';
    }
  });
  
  // Photo upload
  const takePhotoBtn = document.getElementById('takePhotoBtn');
  const choosePhotoBtn = document.getElementById('choosePhotoBtn');
  const cameraInput = document.getElementById('cameraInput');
  const galleryInput = document.getElementById('galleryInput');
  const photoPreview = document.getElementById('photoPreview');
  const photoPreviewContainer = document.getElementById('photoPreviewContainer');
  const removePhotoBtn = document.getElementById('removePhotoBtn');
  let photoData = null;
  
  // Take Photo button - Open real camera
  takePhotoBtn.addEventListener('click', async () => {
    await openCamera();
  });
  
  // Choose from Gallery button
  choosePhotoBtn.addEventListener('click', () => {
    galleryInput.click();
  });
  
  // Handle camera input
  cameraInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        photoData = event.target.result;
        photoPreview.src = photoData;
        photoPreviewContainer.style.display = 'block';
        
        if (window.toastManager) {
          window.toastManager.success('📸 Photo captured!');
        }
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Handle gallery input
  galleryInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        photoData = event.target.result;
        photoPreview.src = photoData;
        photoPreviewContainer.style.display = 'block';
        
        if (window.toastManager) {
          window.toastManager.success('🖼️ Photo selected!');
        }
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Remove photo button
  removePhotoBtn.addEventListener('click', () => {
    photoData = null;
    photoPreview.src = '';
    photoPreviewContainer.style.display = 'none';
    cameraInput.value = '';
    galleryInput.value = '';
    
    if (window.toastManager) {
      window.toastManager.info('Photo removed');
    }
  });
  
  // Open camera function
  async function openCamera() {
    const cameraModal = document.createElement('div');
    cameraModal.className = 'modal-overlay';
    cameraModal.innerHTML = `
      <div class="camera-modal-content">
        <div class="camera-header">
          <h3>📸 Take Photo</h3>
          <button class="modal-close" id="closeCameraBtn">×</button>
        </div>
        <div class="camera-preview-container">
          <video id="cameraVideo" autoplay playsinline></video>
          <canvas id="cameraCanvas" style="display: none;"></canvas>
        </div>
        <div class="camera-controls">
          <button class="btn-text" id="cancelCameraBtn">Cancel</button>
          <button class="btn-primary camera-capture-btn" id="captureBtn">
            📸 Capture
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(cameraModal);
    
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const captureBtn = document.getElementById('captureBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    const cancelCameraBtn = document.getElementById('cancelCameraBtn');
    let stream = null;
    
    try {
      // Request camera access
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      video.srcObject = stream;
      
      // Capture photo
      captureBtn.addEventListener('click', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        photoData = canvas.toDataURL('image/jpeg', 0.9);
        photoPreview.src = photoData;
        photoPreviewContainer.style.display = 'block';
        
        // Stop camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        cameraModal.remove();
        
        if (window.toastManager) {
          window.toastManager.success('📸 Photo captured!');
        }
      });
      
      // Close camera
      const closeCamera = () => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        cameraModal.remove();
      };
      
      closeCameraBtn.addEventListener('click', closeCamera);
      cancelCameraBtn.addEventListener('click', closeCamera);
      
    } catch (error) {
      console.error('[Camera] Error:', error);
      cameraModal.remove();
      
      if (window.toastManager) {
        window.toastManager.error('Unable to access camera. Please check permissions.');
      }
      
      // Fallback to file input
      cameraInput.click();
    }
  }
  
  // Save button
  document.getElementById('saveMemoryBtn').addEventListener('click', async () => {
    const locationName = document.getElementById('photoLocationName').value.trim();
    const notes = document.getElementById('photoNotes').value.trim();
    
    if (!photoData) {
      if (window.toastManager) {
        window.toastManager.warning('Please add a photo');
      }
      return;
    }
    
    if (!locationName) {
      if (window.toastManager) {
        window.toastManager.warning('Please enter a location name');
      }
      return;
    }
    
    const category = document.getElementById('photoCategory').value;
    const city = extractCityFromLocation(locationName);
    
    const memory = {
      id: Date.now().toString(),
      locationName,
      city: city,
      category: category || 'other',
      notes,
      photo: photoData,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };
    
    await savePhoto(memory);
    loadPhotos();
    
    if (window.toastManager) {
      window.toastManager.success('✅ Memory saved!');
    }
    
    modal.remove();
    console.log('[Saved] Memory saved:', locationName);
  });
}

async function setupSavedListenersOld() {
  const addPhotoBtn = document.getElementById('addPhotoBtn');
  
  addPhotoBtn.addEventListener('click', async () => {
    try {
      addPhotoBtn.disabled = true;
      addPhotoBtn.textContent = '📷 Opening camera...';
      
      const photoData = await capturePhoto();
      
      if (photoData) {
        await savePhoto(photoData);
        loadPhotos();
        console.log('[Saved] Photo captured and saved');
      }
      
      addPhotoBtn.textContent = '📷 Add Photo';
    } catch (error) {
      console.error('[Saved] Camera error:', error);
      alert('Unable to access camera. Please check permissions.');
      addPhotoBtn.textContent = '📷 Add Photo';
    } finally {
      addPhotoBtn.disabled = false;
    }
  });
}

async function savePhoto(memory) {
  const photos = JSON.parse(localStorage.getItem('tripPhotos') || '[]');
  photos.push(memory);
  localStorage.setItem('tripPhotos', JSON.stringify(photos));
}

function loadPhotos() {
  const photoGrid = document.getElementById('photoGrid');
  const photoCount = document.getElementById('photoCount');
  const photos = JSON.parse(localStorage.getItem('tripPhotos') || '[]');
  
  photoCount.textContent = `(${photos.length})`;
  
  if (photos.length === 0) {
    photoGrid.innerHTML = '<p class="empty-state">No photos yet. Capture your travel moments!</p>';
    return;
  }
  
  photoGrid.innerHTML = photos.reverse().map(memory => `
    <div class="photo-item">
      <img src="${memory.photo}" alt="${memory.locationName}">
      ${memory.category && memory.category !== 'other' ? `<div class="photo-category">${getCategoryIcon(memory.category)}</div>` : ''}
      <div class="photo-info">
        <div class="photo-location">📍 ${memory.locationName}</div>
        ${memory.notes ? `<div class="photo-notes">${memory.notes}</div>` : ''}
        <div class="photo-date">${new Date(memory.date).toLocaleDateString()}</div>
      </div>
      <button class="delete-photo-btn" data-id="${memory.id}">🗑️</button>
    </div>
  `).join('');
  
  const deleteButtons = document.querySelectorAll('.delete-photo-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const photoId = btn.dataset.id;
      deletePhoto(photoId);
    });
  });
}

function deletePhoto(photoId) {
  if (!confirm('Delete this photo?')) return;
  
  const photos = JSON.parse(localStorage.getItem('tripPhotos') || '[]');
  const filtered = photos.filter(photo => photo.id !== photoId);
  localStorage.setItem('tripPhotos', JSON.stringify(filtered));
  loadPhotos();
}

function getCategoryIcon(category) {
  const icons = {
    transport: '🚇',
    hospital: '🏥',
    police: '🚔',
    tourist: '🏛️',
    shopping: '🛍️',
    restaurant: '🍽️',
    beach: '🏖️',
    mountain: '⛰️',
    city: '🏙️',
    food: '🍽️',
    culture: '🏛️',
    nature: '🌳',
    adventure: '🎢'
  };
  return icons[category] || '📍';
}

function extractCityFromLocation(locationName) {
  if (!locationName) return '';
  const parts = locationName.split(',');
  return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
}

function setupFilters() {
  const timeFilter = document.getElementById('timeFilter');
  const locationFilter = document.getElementById('locationFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  
  // Populate location filter with unique cities
  const photos = JSON.parse(localStorage.getItem('tripPhotos') || '[]');
  const cities = [...new Set(photos.map(p => p.city || p.locationName).filter(Boolean))];
  
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    locationFilter.appendChild(option);
  });
  
  // Filter event listeners
  const applyFilters = () => {
    const timeValue = timeFilter.value;
    const locationValue = locationFilter.value;
    const categoryValue = categoryFilter.value;
    
    let filtered = [...photos];
    
    // Time filter
    if (timeValue !== 'all') {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      let cutoff;
      
      if (timeValue === 'week') cutoff = now - (7 * day);
      else if (timeValue === 'month') cutoff = now - (30 * day);
      else if (timeValue === 'year') cutoff = now - (365 * day);
      
      filtered = filtered.filter(p => p.timestamp >= cutoff);
    }
    
    // Location filter
    if (locationValue !== 'all') {
      filtered = filtered.filter(p => 
        (p.city || p.locationName) === locationValue
      );
    }
    
    // Category filter
    if (categoryValue !== 'all') {
      filtered = filtered.filter(p => p.category === categoryValue);
    }
    
    displayFilteredPhotos(filtered);
  };
  
  timeFilter.addEventListener('change', applyFilters);
  locationFilter.addEventListener('change', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
  
  clearFiltersBtn.addEventListener('click', () => {
    timeFilter.value = 'all';
    locationFilter.value = 'all';
    categoryFilter.value = 'all';
    loadPhotos();
  });
}

function displayFilteredPhotos(photos) {
  const photoGrid = document.getElementById('photoGrid');
  const photoCount = document.getElementById('photoCount');
  
  photoCount.textContent = `(${photos.length})`;
  
  if (photos.length === 0) {
    photoGrid.innerHTML = '<p class="empty-state">No photos match your filters.</p>';
    return;
  }
  
  photoGrid.innerHTML = photos.reverse().map(memory => `
    <div class="photo-item">
      <img src="${memory.photo}" alt="${memory.locationName}">
      ${memory.category && memory.category !== 'other' ? `<div class="photo-category">${getCategoryIcon(memory.category)}</div>` : ''}
      <div class="photo-info">
        <div class="photo-location">📍 ${memory.locationName}</div>
        ${memory.notes ? `<div class="photo-notes">${memory.notes}</div>` : ''}
        <div class="photo-date">${new Date(memory.date).toLocaleDateString()}</div>
      </div>
      <button class="delete-photo-btn" data-id="${memory.id}">🗑️</button>
    </div>
  `).join('');
  
  const deleteButtons = document.querySelectorAll('.delete-photo-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const photoId = btn.dataset.id;
      deletePhoto(photoId);
    });
  });
}

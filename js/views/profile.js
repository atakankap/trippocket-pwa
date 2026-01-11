/**
 * Profile View - User profile, stats, and settings
 * Shows user information, travel statistics, and app preferences
 */

import { getSavedLocations } from '../utils/db.js';

export async function renderProfileView(container) {
  const savedLocations = await getSavedLocations();
  const userStats = getUserStats(savedLocations);
  
  // Load saved settings
  const userName = localStorage.getItem('userName') || 'Travel Explorer';
  const userBio = localStorage.getItem('userBio') || 'Exploring the world, one city at a time 🌍';
  const userAvatar = localStorage.getItem('userAvatar');
  const notificationsEnabled = localStorage.getItem('notifications') !== 'false';
  const locationEnabled = localStorage.getItem('locationServices') !== 'false';
  
  container.innerHTML = `
    <div class="profile-view fade-in">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar-section">
          <div class="avatar avatar-large">
            <span>${userAvatar ? `<img src="${userAvatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />` : '👤'}</span>
          </div>
          <button class="btn-edit-avatar" onclick="window.profileView.editAvatar()">
            📷 Change Photo
          </button>
        </div>
        <div class="profile-info">
          <h2 class="profile-name" id="profileName">${userName}</h2>
          <p class="profile-bio" id="profileBio">${userBio}</p>
          <button class="btn-primary btn-sm" onclick="window.profileView.editProfile()" style="margin-top: 0.75rem;">
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stats-card">
          <div class="stats-card-icon primary">
            <span>📍</span>
          </div>
          <div class="stats-card-value">${userStats.visitedPlaces}</div>
          <div class="stats-card-label">Places Visited</div>
        </div>
        
        <div class="stats-card">
          <div class="stats-card-icon success">
            <span>⭐</span>
          </div>
          <div class="stats-card-value">${userStats.totalReviews}</div>
          <div class="stats-card-label">Reviews Written</div>
        </div>
        
        <div class="stats-card">
          <div class="stats-card-icon warning">
            <span>📸</span>
          </div>
          <div class="stats-card-value">${userStats.photosTaken}</div>
          <div class="stats-card-label">Photos Taken</div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="profile-section">
        <h3 class="section-title">Recent Activity</h3>
        <div class="activity-list" id="activityList">
          ${renderActivityList(userStats.recentActivity)}
        </div>
      </div>

      <!-- Achievements -->
      <div class="profile-section">
        <h3 class="section-title">Achievements 🏆</h3>
        <div class="achievements-grid">
          ${renderAchievements(userStats)}
        </div>
      </div>

      <!-- Settings -->
      <div class="profile-section">
        <h3 class="section-title">Settings</h3>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">🔔 Notifications</div>
              <div class="setting-description">Get notified about nearby places</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="notificationsToggle" ${notificationsEnabled ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">📍 Location Services</div>
              <div class="setting-description">Allow location access for better experience</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="locationToggle" ${locationEnabled ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="profile-actions">
        <button class="btn-secondary btn-full" onclick="window.profileView.exportData()">
          💾 Export My Data
        </button>
        <button class="btn-text btn-full" onclick="window.profileView.clearData()">
          🗑️ Clear All Data
        </button>
      </div>
    </div>
  `;

  // Setup handlers after DOM is ready
  setTimeout(() => setupProfileHandlers(), 0);
}

function getUserStats(savedLocations) {
  const visitedPlaces = savedLocations.length;
  const photosTaken = savedLocations.filter(loc => loc.photo).length;
  
  // Get from localStorage
  const reviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
  const checkIns = JSON.parse(localStorage.getItem('userCheckIns') || '[]');
  
  return {
    visitedPlaces,
    totalReviews: reviews.length,
    photosTaken,
    recentActivity: getRecentActivity(savedLocations, reviews, checkIns)
  };
}

function getRecentActivity(saved, reviews, checkIns) {
  const activities = [];
  
  // Add recent saves
  saved.slice(-5).reverse().forEach(loc => {
    activities.push({
      type: 'save',
      icon: '💾',
      text: `Saved ${loc.name}`,
      time: loc.savedAt || Date.now()
    });
  });
  
  // Add recent reviews
  reviews.slice(-3).reverse().forEach(review => {
    activities.push({
      type: 'review',
      icon: '⭐',
      text: `Reviewed ${review.locationName}`,
      time: review.createdAt
    });
  });
  
  // Sort by time
  return activities.sort((a, b) => b.time - a.time).slice(0, 8);
}

function renderActivityList(activities) {
  if (activities.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-title">No Activity Yet</div>
        <div class="empty-state-message">Start exploring and your activity will appear here!</div>
      </div>
    `;
  }
  
  return activities.map(activity => `
    <div class="activity-item slide-in-left">
      <div class="activity-icon">${activity.icon}</div>
      <div class="activity-content">
        <div class="activity-text">${activity.text}</div>
        <div class="activity-time">${formatTimeAgo(activity.time)}</div>
      </div>
    </div>
  `).join('');
}

function renderAchievements(stats) {
  const achievements = [
    {
      id: 'first-visit',
      icon: '🎯',
      title: 'First Visit',
      description: 'Visited your first place',
      unlocked: stats.visitedPlaces >= 1
    },
    {
      id: 'explorer',
      icon: '🗺️',
      title: 'Explorer',
      description: 'Visited 5 places',
      unlocked: stats.visitedPlaces >= 5
    },
    {
      id: 'photographer',
      icon: '📸',
      title: 'Photographer',
      description: 'Took 10 photos',
      unlocked: stats.photosTaken >= 10
    },
    {
      id: 'reviewer',
      icon: '⭐',
      title: 'Reviewer',
      description: 'Wrote 5 reviews',
      unlocked: stats.totalReviews >= 5
    },
    {
      id: 'world-traveler',
      icon: '🌍',
      title: 'World Traveler',
      description: 'Visited 20 places',
      unlocked: stats.visitedPlaces >= 20
    },
    {
      id: 'local-guide',
      icon: '🎖️',
      title: 'Local Guide',
      description: 'Wrote 20 reviews',
      unlocked: stats.totalReviews >= 20
    }
  ];
  
  return achievements.map(achievement => `
    <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-title">${achievement.title}</div>
      <div class="achievement-description">${achievement.description}</div>
      ${achievement.unlocked ? '<div class="achievement-badge">✓ Unlocked</div>' : '<div class="achievement-badge">🔒 Locked</div>'}
    </div>
  `).join('');
}

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function setupProfileHandlers() {
  console.log('[Profile] Setting up handlers...');
  
  // Toggle switches
  const notificationsToggle = document.getElementById('notificationsToggle');
  const locationToggle = document.getElementById('locationToggle');
  
  if (notificationsToggle) {
    notificationsToggle.addEventListener('change', (e) => {
      localStorage.setItem('notifications', e.target.checked);
      console.log('[Profile] Notifications:', e.target.checked);
      if (window.toastManager) {
        window.toastManager.success(`🔔 Notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
      }
    });
    console.log('[Profile] Notifications toggle attached');
  }
  
  if (locationToggle) {
    locationToggle.addEventListener('change', (e) => {
      localStorage.setItem('locationServices', e.target.checked);
      console.log('[Profile] Location services:', e.target.checked);
      if (window.toastManager) {
        window.toastManager.success(`📍 Location services ${e.target.checked ? 'enabled' : 'disabled'}`);
      }
    });
    console.log('[Profile] Location toggle attached');
  }
}

// Global profile view functions
window.profileView = {
  editProfile() {
    console.log('[Profile] Edit profile clicked');
    showEditModal();
  },
  
  editBio() {
    console.log('[Profile] Edit bio clicked');
    showEditModal();
  },
  
  editAvatar() {
    console.log('[Profile] Edit avatar clicked');
    
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target.result;
          localStorage.setItem('userAvatar', imageData);
          
          // Update avatar display
          const avatarElement = document.querySelector('.avatar-large span');
          if (avatarElement) {
            avatarElement.innerHTML = `<img src="${imageData}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
          }
          
          if (window.toastManager) {
            window.toastManager.success('📷 Avatar updated!');
          }
          console.log('[Profile] Avatar updated');
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  },
  
  exportData() {
    const data = {
      savedLocations: JSON.parse(localStorage.getItem('savedLocations') || '[]'),
      reviews: JSON.parse(localStorage.getItem('userReviews') || '[]'),
      checkIns: JSON.parse(localStorage.getItem('userCheckIns') || '[]'),
      settings: {
        notifications: localStorage.getItem('notifications'),
        darkMode: localStorage.getItem('darkMode')
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trippocket-data.json';
    a.click();
    
    if (window.toastManager) {
      window.toastManager.success('Data exported successfully!');
    }
  },
  
  clearData() {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      localStorage.clear();
      if (window.toastManager) {
        window.toastManager.warning('All data cleared!');
      }
      setTimeout(() => location.reload(), 1500);
    }
  }
};

// Show edit profile modal
function showEditModal() {
  const currentName = localStorage.getItem('userName') || 'Travel Explorer';
  const currentBio = localStorage.getItem('userBio') || 'Exploring the world, one city at a time 🌍';
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content edit-profile-modal scale-in">
      <div class="modal-header">
        <h3>✏️ Edit Profile</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label for="editName" class="form-label">👤 Name</label>
          <input type="text" id="editName" class="form-input" value="${currentName}" placeholder="Enter your name" maxlength="50">
        </div>
        
        <div class="form-group">
          <label for="editBio" class="form-label">📝 Bio</label>
          <textarea id="editBio" class="form-textarea" placeholder="Tell us about yourself..." maxlength="200" rows="4">${currentBio}</textarea>
          <div class="character-count"><span id="bioCount">${currentBio.length}</span>/200</div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-text" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn-primary" id="saveProfileBtn">💾 Save Changes</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Character counter
  const bioTextarea = document.getElementById('editBio');
  const bioCount = document.getElementById('bioCount');
  bioTextarea.addEventListener('input', () => {
    bioCount.textContent = bioTextarea.value.length;
  });
  
  // Save button
  document.getElementById('saveProfileBtn').addEventListener('click', () => {
    const newName = document.getElementById('editName').value.trim();
    const newBio = document.getElementById('editBio').value.trim();
    
    if (newName) {
      localStorage.setItem('userName', newName);
      const nameElement = document.getElementById('profileName');
      if (nameElement) {
        nameElement.textContent = newName;
      }
    }
    
    if (newBio) {
      localStorage.setItem('userBio', newBio);
      const bioElement = document.getElementById('profileBio');
      if (bioElement) {
        bioElement.textContent = newBio;
      }
    }
    
    if (window.toastManager) {
      window.toastManager.success('✅ Profile updated successfully!');
    }
    
    modal.remove();
    console.log('[Profile] Profile updated - Name:', newName, 'Bio:', newBio);
  });
  
  // Focus on name input
  setTimeout(() => document.getElementById('editName').focus(), 100);
}

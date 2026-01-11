/**
 * TripPocket - Main Application Entry Point
 * 
 * This is the core application file that initializes all components:
 * - Service Worker registration for offline functionality
 * - IndexedDB initialization for local storage
 * - Navigation system between views
 * - Connection status monitoring
 * - PWA installation prompt handling
 * 
 * @author TripPocket Team
 * @version 1.0.0
 */

import { renderExploreView } from './views/explore.js';
import { renderMapView } from './views/map.js';
import { renderSavedView } from './views/saved.js';
import { renderProfileView } from './views/profile.js';
import { initDB } from './utils/db.js';

// Global variables
let deferredPrompt; // Stores PWA install prompt event
let isOnline = navigator.onLine; // Tracks online/offline status

/**
 * Initialize the application
 * Called when DOM is ready
 */
async function init() {
  console.log('[App] Initializing TripPocket...');
  
  // Show loading overlay
  if (window.loadingManager) {
    window.loadingManager.show('Initializing...', 'Setting up your travel guide');
  }
  
  try {
    // Register service worker for offline functionality
    await registerServiceWorker();
    
    // Initialize IndexedDB for local storage
    await initDB();
    console.log('[App] Database initialized');
    
    // Setup UI components
    setupNavigation();
    setupConnectionStatus();
    setupInstallPrompt();
    
    // Render initial view
    renderView('explore');
    
    console.log('[App] TripPocket initialized successfully');
    
    // Show success toast
    if (window.toastManager) {
      window.toastManager.success('Welcome to TripPocket!', 2000);
    }
  } catch (error) {
    console.error('[App] Initialization error:', error);
    if (window.toastManager) {
      window.toastManager.error('Failed to initialize app. Please refresh.');
    }
  } finally {
    // Hide loading overlay
    if (window.loadingManager) {
      setTimeout(() => window.loadingManager.hide(), 500);
    }
  }
}

/**
 * Register Service Worker for offline functionality
 * Service Worker enables:
 * - Offline access to cached resources
 * - Background sync capabilities
 * - Push notifications (future feature)
 */
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('[App] Service Worker registered:', registration.scope);
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[App] New version available! Reload to update.');
          }
        });
      });
    } catch (error) {
      console.error('[App] Service Worker registration failed:', error);
    }
  }
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      renderView(view);
    });
  });
}

function renderView(viewName) {
  const mainContent = document.getElementById('mainContent');
  
  switch(viewName) {
    case 'explore':
      renderExploreView(mainContent, isOnline);
      break;
    case 'map':
      renderMapView(mainContent, isOnline);
      break;
    case 'saved':
      renderSavedView(mainContent);
      break;
    case 'profile':
      renderProfileView(mainContent);
      break;
    default:
      renderExploreView(mainContent, isOnline);
  }
}

function setupConnectionStatus() {
  const statusElement = document.getElementById('connectionStatus');
  const statusIndicator = statusElement.querySelector('.status-indicator');
  const statusText = statusElement.querySelector('.status-text');
  
  function updateStatus(online) {
    isOnline = online;
    
    if (online) {
      statusIndicator.classList.remove('offline');
      statusText.textContent = 'Online';
    } else {
      statusIndicator.classList.add('offline');
      statusText.textContent = 'Offline';
    }
    
    const activeView = document.querySelector('.nav-item.active');
    if (activeView) {
      renderView(activeView.dataset.view);
    }
  }
  
  window.addEventListener('online', () => {
    console.log('[App] Connection restored');
    updateStatus(true);
  });
  
  window.addEventListener('offline', () => {
    console.log('[App] Connection lost - switching to offline mode');
    updateStatus(false);
  });
  
  updateStatus(navigator.onLine);
}

function setupInstallPrompt() {
  const installPrompt = document.getElementById('installPrompt');
  const installButton = document.getElementById('installButton');
  const dismissButton = document.getElementById('dismissInstall');
  const headerInstallBtn = document.getElementById('headerInstallBtn');
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    headerInstallBtn.classList.remove('hidden');
    
    if (!localStorage.getItem('installDismissed')) {
      installPrompt.classList.remove('hidden');
    }
  });
  
  async function handleInstall() {
    if (!deferredPrompt) {
      alert('App is already installed or install prompt is not available. Try accessing via HTTPS for full PWA features.');
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log('[App] Install prompt outcome:', outcome);
    
    if (outcome === 'accepted') {
      headerInstallBtn.classList.add('hidden');
    }
    
    deferredPrompt = null;
    installPrompt.classList.add('hidden');
  }
  
  installButton.addEventListener('click', handleInstall);
  headerInstallBtn.addEventListener('click', handleInstall);
  
  dismissButton.addEventListener('click', () => {
    installPrompt.classList.add('hidden');
    localStorage.setItem('installDismissed', 'true');
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('[App] TripPocket installed successfully');
    deferredPrompt = null;
    installPrompt.classList.add('hidden');
    headerInstallBtn.classList.add('hidden');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

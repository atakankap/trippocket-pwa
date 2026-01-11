/**
 * Loading Overlay Manager
 * Shows/hides loading overlay with customizable messages
 */

class LoadingManager {
  constructor() {
    this.overlay = document.getElementById('loadingOverlay');
    this.textElement = this.overlay?.querySelector('.loading-text');
    this.subtextElement = this.overlay?.querySelector('.loading-subtext');
    this.isVisible = false;
  }

  /**
   * Show loading overlay
   * @param {string} text - Main loading text
   * @param {string} subtext - Optional subtext
   */
  show(text = 'Loading...', subtext = 'Please wait') {
    if (!this.overlay) return;

    if (this.textElement) {
      this.textElement.textContent = text;
    }
    
    if (this.subtextElement && subtext) {
      this.subtextElement.textContent = subtext;
      this.subtextElement.style.display = 'block';
    } else if (this.subtextElement) {
      this.subtextElement.style.display = 'none';
    }

    this.overlay.classList.remove('hidden');
    this.isVisible = true;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Hide loading overlay
   */
  hide() {
    if (!this.overlay) return;

    this.overlay.classList.add('hidden');
    this.isVisible = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
  }

  /**
   * Update loading text
   * @param {string} text - New loading text
   * @param {string} subtext - New subtext
   */
  update(text, subtext) {
    if (this.textElement && text) {
      this.textElement.textContent = text;
    }
    if (this.subtextElement && subtext) {
      this.subtextElement.textContent = subtext;
    }
  }

  /**
   * Check if loading is visible
   * @returns {boolean}
   */
  get visible() {
    return this.isVisible;
  }
}

// Initialize global loading manager
window.loadingManager = new LoadingManager();

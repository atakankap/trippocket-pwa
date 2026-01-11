/**
 * Toast Notification System
 * Displays temporary notification messages to users
 */

class ToastManager {
  constructor() {
    this.container = document.getElementById('toastContainer');
    this.toasts = [];
  }

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds (default: 3000)
   */
  show(message, type = 'info', duration = 3000) {
    const toast = this.createToast(message, type);
    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="window.toastManager.remove(this.closest('.toast'))">×</button>
    `;

    return toast;
  }

  remove(toast) {
    if (!toast) return;
    
    toast.style.animation = 'slideOutRight 0.3s ease-out';
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }, 300);
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  clear() {
    this.toasts.forEach(toast => this.remove(toast));
  }
}

// Initialize global toast manager
window.toastManager = new ToastManager();

// Add slideOutRight animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(style);

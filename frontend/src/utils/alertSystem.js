// Modern Alert System - Pure JavaScript + Tailwind CSS
class AlertSystem {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Create container if it doesn't exist
    if (!document.getElementById('alert-container')) {
      this.container = document.createElement('div');
      this.container.id = 'alert-container';
      this.container.className = 'fixed top-4 right-4 z-50 space-y-3 pointer-events-none';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('alert-container');
    }
  }

  getIcon(type) {
    const icons = {
      success: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>`,
      error: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>`,
      warning: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>`,
      info: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
      </svg>`
    };
    return icons[type] || icons.info;
  }

  getStyles(type) {
    const styles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    return styles[type] || styles.info;
  }

  show(message, type = 'info') {
    const alertId = 'alert-' + Date.now() + Math.random().toString(36).substr(2, 9);
    
    const alertElement = document.createElement('div');
    alertElement.id = alertId;
    alertElement.className = `
      ${this.getStyles(type)}
      border rounded-lg p-4 shadow-lg backdrop-blur-sm
      transform translate-x-full opacity-0 pointer-events-auto
      transition-all duration-300 ease-out
      max-w-sm w-full sm:max-w-md
    `;
    
    alertElement.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 mt-0.5">
          ${this.getIcon(type)}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium break-words">${message}</p>
        </div>
        <button 
          onclick="window.alertSystem.hide('${alertId}')" 
          class="flex-shrink-0 ml-2 text-current opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;

    this.container.appendChild(alertElement);

    // Trigger slide-in animation
    requestAnimationFrame(() => {
      alertElement.classList.remove('translate-x-full', 'opacity-0');
      alertElement.classList.add('translate-x-0', 'opacity-100');
    });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.hide(alertId);
    }, 3000);

    return alertId;
  }

  hide(alertId) {
    const alertElement = document.getElementById(alertId);
    if (alertElement) {
      alertElement.classList.add('translate-x-full', 'opacity-0');
      alertElement.classList.remove('translate-x-0', 'opacity-100');
      
      setTimeout(() => {
        if (alertElement.parentNode) {
          alertElement.parentNode.removeChild(alertElement);
        }
      }, 300);
    }
  }
}

// Initialize the alert system
window.alertSystem = new AlertSystem();

// Global function for easy use
window.showAlert = function(message, type = 'info') {
  return window.alertSystem.show(message, type);
};

export { AlertSystem };
export default window.showAlert;
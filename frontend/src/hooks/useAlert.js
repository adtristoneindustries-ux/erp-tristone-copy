import { useCallback } from 'react';
import '../utils/alertSystem.js';

// React hook for using the alert system
export const useAlert = () => {
  const showAlert = useCallback((message, type = 'info') => {
    if (window.showAlert) {
      return window.showAlert(message, type);
    }
    // Fallback to console if alert system not loaded
    console.log(`[${type.toUpperCase()}] ${message}`);
  }, []);

  const showSuccess = useCallback((message) => showAlert(message, 'success'), [showAlert]);
  const showError = useCallback((message) => showAlert(message, 'error'), [showAlert]);
  const showWarning = useCallback((message) => showAlert(message, 'warning'), [showAlert]);
  const showInfo = useCallback((message) => showAlert(message, 'info'), [showAlert]);

  return {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useAlert;
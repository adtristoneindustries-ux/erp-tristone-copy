import { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    schoolName: 'School ERP',
    logoUrl: '',
    sidebarColor: '#2563EB',
    primaryColor: '#3B82F6',
    theme: 'light'
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('schoolSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('schoolSettings', JSON.stringify(updatedSettings));
  };

  // Refresh settings from localStorage or API
  const refreshSettings = async () => {
    try {
      // Try to get from API first (if available)
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        const updatedSettings = { ...settings, ...data };
        setSettings(updatedSettings);
        localStorage.setItem('schoolSettings', JSON.stringify(updatedSettings));
      }
    } catch (error) {
      // Fallback to localStorage
      const savedSettings = localStorage.getItem('schoolSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
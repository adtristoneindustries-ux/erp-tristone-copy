import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    schoolName: 'School ERP System',
    tagline: 'Manage your school efficiently',
    logoUrl: '',
    faviconUrl: '',
    address: '',
    email: '',
    phone: '',
    primaryColor: '#3B82F6',
    sidebarColor: '#2563EB',
    buttonColor: '#3B82F6',
    loginBackgroundUrl: '',
    welcomeMessage: 'Welcome Back!',
    enableStudentLogin: true,
    enableStaffLogin: true,
    enableNotifications: true,
    academicYear: '2024-2025'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
      applySettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySettings = (data) => {
    if (data.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = data.faviconUrl;
    }

    document.documentElement.style.setProperty('--primary-color', data.primaryColor);
    document.documentElement.style.setProperty('--sidebar-color', data.sidebarColor);
    document.documentElement.style.setProperty('--button-color', data.buttonColor);
    document.title = data.schoolName || 'School ERP System';
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

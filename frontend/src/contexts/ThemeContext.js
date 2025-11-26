import React, { createContext, useState, useContext, useEffect } from 'react';
import { usersAPI } from '../services/api';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  // Get system theme preference
  const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  // Apply theme to document
  const applyTheme = (themeMode) => {
    const root = document.documentElement;
    const actualTheme = themeMode === 'system' ? getSystemTheme() : themeMode;
    
    root.setAttribute('data-theme', actualTheme);
    root.classList.toggle('dark', actualTheme === 'dark');
    root.classList.toggle('light', actualTheme === 'light');
  };

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  };

  // Initialize theme
  useEffect(() => {
    const user = getCurrentUser();
    const savedTheme = user?.themePreference || localStorage.getItem('theme') || 'light';
    
    setTheme(savedTheme);
    applyTheme(savedTheme);
    setLoading(false);
  }, []);

  // Watch for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      applyTheme(newTheme);
      localStorage.setItem('theme', newTheme);

      // Save to backend if user is logged in and has token
      const token = localStorage.getItem('token');
      const user = getCurrentUser();
      
      if (token && user) {
        // Update local user data
        const updatedUser = { ...user, themePreference: newTheme };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Save to backend
        await usersAPI.updateTheme({ theme: newTheme });
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const value = {
    theme,
    toggleTheme,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
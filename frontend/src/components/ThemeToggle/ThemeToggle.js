// frontend/src/components/ThemeToggle/ThemeToggle.js

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle">
      <button
        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={() => toggleTheme('light')}
        title="Light mode"
      >
        ☀️
      </button>
      <button
        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => toggleTheme('dark')}
        title="Dark mode"
      >
        🌙
      </button>
      <button
        className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
        onClick={() => toggleTheme('system')}
        title="System preference"
      >
        💻
      </button>
    </div>
  );
};

export default ThemeToggle;
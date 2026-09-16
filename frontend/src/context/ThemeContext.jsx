import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('krishisetu_theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#020617';
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('krishisetu_theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Persist to user profile if logged in
    try {
      if (localStorage.getItem('krishisetu_token')) {
        await api.put('/auth/preferences', { theme: newTheme });
      }
    } catch (e) {
      // ignore silently if not logged in
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

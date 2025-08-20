import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextProps {
  dark: boolean;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const getInitialTheme = (): boolean => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return true;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dark, setDark] = useState<boolean>(getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (dark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      window.localStorage.setItem('theme', 'dark');
      
      // Variables CSS pour le mode sombre
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--bg-tertiary', '#334155');
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--border-primary', '#475569');
      root.style.setProperty('--border-secondary', '#64748b');
      root.style.setProperty('--accent-primary', '#3b82f6');
      root.style.setProperty('--accent-secondary', '#1d4ed8');
      root.style.setProperty('--shadow-primary', '0 10px 15px -3px rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--shadow-secondary', '0 4px 6px -1px rgba(0, 0, 0, 0.2)');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      window.localStorage.setItem('theme', 'light');
      
      // Variables CSS pour le mode clair
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#f1f5f9');
      root.style.setProperty('--text-primary', '#1e293b');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border-primary', '#e2e8f0');
      root.style.setProperty('--border-secondary', '#cbd5e1');
      root.style.setProperty('--accent-primary', '#3b82f6');
      root.style.setProperty('--accent-secondary', '#1d4ed8');
      root.style.setProperty('--shadow-primary', '0 10px 15px -3px rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--shadow-secondary', '0 4px 6px -1px rgba(0, 0, 0, 0.05)');
    }

    // Ajouter la classe de transition pour les animations fluides
    body.classList.add('theme-transition');
    body.classList.add('text-[19px]');
  }, [dark]);

  const toggleTheme = () => setDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme, theme: dark ? 'dark' : 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}; 
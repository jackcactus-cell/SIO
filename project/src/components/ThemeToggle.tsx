import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { dark, toggleTheme, theme } = useTheme();

  return (
    <button
      className="theme-button-secondary p-2 rounded-full hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
      onClick={toggleTheme}
      aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={`Mode ${dark ? 'sombre' : 'clair'} actif - Cliquer pour basculer`}
    >
      {dark ? (
        <Sun className="h-6 w-6 text-yellow-400 hover:text-yellow-300 transition-colors" />
      ) : (
        <Moon className="h-6 w-6 text-blue-600 hover:text-blue-500 transition-colors" />
      )}
    </button>
  );
};

export default ThemeToggle; 
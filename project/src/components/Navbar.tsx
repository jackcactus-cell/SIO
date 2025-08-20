import React from 'react';
import { Bot, Bell, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSettings = () => {
    navigate('/dashboard/settings');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full h-20 theme-bg-secondary theme-shadow-secondary flex items-center justify-between px-10 border-b theme-border-primary z-40 theme-transition backdrop-blur-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-700 dark:bg-blue-700/80 shadow-lg">
          <Bot className="h-7 w-7 text-white" />
        </div>
        <span className="text-3xl font-extrabold theme-text-primary tracking-wide drop-shadow-lg">SAO</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        
        {isAuthenticated && user && (
          <>
            <button
              onClick={handleSettings}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 theme-transition"
              aria-label="Paramètres"
            >
              <SettingsIcon className="h-6 w-6 theme-text-secondary" />
            </button>
            
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 theme-transition"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6 theme-text-secondary" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium theme-text-primary">
                  {user.name}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 theme-transition"
                aria-label="Déconnexion"
              >
                <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
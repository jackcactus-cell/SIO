import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Database,
  FileText,
  Settings,
  Bot,
  Activity,
  Table,
  PieChart,
  Brain,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Menu complet pour l'admin
  const adminMenuItems = [
    { icon: <LinkIcon className="h-7 w-7" />, label: 'Connexion Oracle', path: '/dashboard/oracle-login' },
    { icon: <BarChart3 className="h-7 w-7" />, label: "Vue d'ensemble", path: '/dashboard' },
    { icon: <Activity className="h-7 w-7" />, label: 'Performance', path: '/dashboard/performance' },
    { icon: <Database className="h-7 w-7" />, label: 'Éditeur SQL', path: '/dashboard/sql-editor' },
    { icon: <Table className="h-7 w-7" />, label: 'Explorateur', path: '/dashboard/schema' },
    { icon: <PieChart className="h-7 w-7" />, label: 'Visualisations', path: '/dashboard/visualizations' },
    { icon: <FileText className="h-7 w-7" />, label: 'Rapports', path: '/dashboard/reports' },
    { icon: <Bot className="h-7 w-7" />, label: 'Assistant IA', path: '/dashboard/chatbot' },
    { icon: <Brain className="h-7 w-7" />, label: 'Oracle Audit', path: '/dashboard/oracle-audit' },
    { icon: <Settings className="h-7 w-7" />, label: 'Paramètres', path: '/dashboard/settings' }
  ];

  // Menu limité pour les utilisateurs
  const userMenuItems = [
    { icon: <LinkIcon className="h-7 w-7" />, label: 'Connexion Oracle', path: '/dashboard/oracle-login' },
    { icon: <BarChart3 className="h-7 w-7" />, label: "Vue d'ensemble", path: '/dashboard' },
    { icon: <Table className="h-7 w-7" />, label: 'Explorateur', path: '/dashboard/schema' },
    { icon: <Bot className="h-7 w-7" />, label: 'Assistant IA', path: '/dashboard/chatbot' },
    { icon: <Brain className="h-7 w-7" />, label: 'Oracle Audit', path: '/dashboard/oracle-audit' },
    { icon: <Settings className="h-7 w-7" />, label: 'Paramètres', path: '/dashboard/settings' }
  ];

  // Déterminer quel menu afficher
  const isAdmin = user?.email === 'hisaac@smart2dservices.com' || user?.role === 'admin';
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <aside className="w-80 theme-bg-secondary theme-border-primary border-r flex flex-col theme-shadow-secondary theme-transition backdrop-blur-lg">
      <div className="flex-shrink-0 p-6 border-b theme-border-primary">
        <h2 className="text-2xl font-bold theme-text-primary flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600 dark:text-blue-400 transition-colors" />
          SAO
        </h2>
        <p className="text-sm theme-text-muted mt-1">Smart2d Ai Oracle</p>
        {user && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {isAdmin ? '👑 Administrateur' : '👤 Utilisateur'}
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-300 truncate">
              {user.email}
            </p>
          </div>
        )}
      </div>
      
      <nav className="flex-1 py-8 px-4 space-y-3 overflow-y-auto scrollbar-hide">
        <div className="text-base theme-text-muted uppercase mb-6 pl-3 tracking-widest font-bold">
          {isAdmin ? 'NAVIGATION COMPLÈTE' : 'NAVIGATION UTILISATEUR'}
        </div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`group flex items-center space-x-4 px-5 py-4 rounded-xl transition-all font-medium text-lg
                ${isActive
                  ? 'bg-blue-50 dark:bg-gray-800 theme-text-primary border-l-4 border-blue-700 dark:border-blue-400 theme-shadow-secondary'
                  : 'theme-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-900 dark:hover:text-blue-200 hover:shadow-md'}
              `}
            >
              <span className={`transition-colors ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 group-hover:text-blue-700 dark:group-hover:text-blue-400'}`}>
                {item.icon}
              </span>
              <span className={isActive ? 'font-bold theme-text-primary' : 'theme-text-secondary group-hover:text-gray-900 dark:group-hover:text-white'}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="flex-shrink-0 p-6 border-t theme-border-primary text-sm theme-text-muted text-center theme-bg-secondary/80">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 dark:text-green-400 font-medium">Système actif</span>
        </div>
        <div className="text-xs">&copy; {new Date().getFullYear()} SAO - Système d'Information Oracle</div>
        {!isAdmin && (
          <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
            Mode utilisateur - Accès limité
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
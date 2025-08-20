import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit3, 
  MessageSquare, 
  Zap, 
  Database, 
  BarChart3, 
  Shield, 
  FileText, 
  Mail,
  RefreshCw,
  Download
} from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Éditeur SQL',
      description: 'Créer et exécuter des requêtes',
      icon: <Edit3 className="h-6 w-6" />,
      link: '/dashboard/sql-editor',
      color: 'blue'
    },
    {
      title: 'NLP vers SQL',
      description: 'Langage naturel en SQL',
      icon: <MessageSquare className="h-6 w-6" />,
      link: '/dashboard/chatbot',
      color: 'green'
    },
    {
      title: 'Optimiseur SQL',
      description: 'Optimisation automatique',
      icon: <Zap className="h-6 w-6" />,
      link: '/dashboard/performance',
      color: 'yellow'
    },
    {
      title: 'Explorateur Schémas',
      description: 'Navigation structure DB',
      icon: <Database className="h-6 w-6" />,
      link: '/dashboard/schema',
      color: 'purple'
    },
    {
      title: 'Analytics',
      description: 'Analyse des tendances',
      icon: <BarChart3 className="h-6 w-6" />,
      link: '/dashboard/charts',
      color: 'indigo'
    },
    {
      title: 'Audit & Sécurité',
      description: 'Surveillance activités',
      icon: <Shield className="h-6 w-6" />,
      link: '/dashboard/reports',
      color: 'red'
    },
    {
      title: 'Gestion Scripts',
      description: 'Création et exécution',
      icon: <FileText className="h-6 w-6" />,
      link: '/dashboard/sql-editor',
      color: 'gray'
    },
    {
      title: 'Messagerie',
      description: 'Notifications email',
      icon: <Mail className="h-6 w-6" />,
      link: '/dashboard/settings',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 text-blue-600 hover:bg-blue-100';
      case 'green': return 'bg-green-50 text-green-600 hover:bg-green-100';
      case 'yellow': return 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100';
      case 'purple': return 'bg-purple-50 text-purple-600 hover:bg-purple-100';
      case 'indigo': return 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100';
      case 'red': return 'bg-red-50 text-red-600 hover:bg-red-100';
      case 'orange': return 'bg-orange-50 text-orange-600 hover:bg-orange-100';
      default: return 'bg-gray-50 text-gray-600 hover:bg-gray-100';
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExport = () => {
    // Logique d'export des données du dashboard
    console.log('Exporting dashboard data...');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Actions Rapides</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${getColorClasses(action.color)} transition-colors`}>
                {action.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                  {action.title}
                </h4>
              </div>
            </div>
            <p className="text-sm text-gray-600">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
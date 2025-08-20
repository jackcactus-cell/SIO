import React from 'react';
import { Clock, User, CheckCircle, AlertTriangle, XCircle, Database } from 'lucide-react';

interface Activity {
  id: string | number;
  status: 'success' | 'warning' | 'error' | 'info' | string;
  type: 'query' | 'connection' | 'backup' | 'alert' | 'error' | 'maintenance' | string;
  action: string;
  timestamp: string;
  details: string;
  user: string;
  duration?: string; // e.g., '10s'; omitted when not applicable
  rowsAffected?: number;
}

const RecentActivity: React.FC = () => {
  const activities: Activity[] = [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info': return <Database className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-l-green-500';
      case 'warning': return 'bg-yellow-50 border-l-yellow-500';
      case 'error': return 'bg-red-50 border-l-red-500';
      case 'info': return 'bg-blue-50 border-l-blue-500';
      default: return 'bg-gray-50 border-l-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'query': return '🔍';
      case 'connection': return '🔗';
      case 'backup': return '💾';
      case 'alert': return '⚠️';
      case 'error': return '❌';
      case 'maintenance': return '🔧';
      default: return '📝';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ${diffInMinutes % 60}min`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <Clock className="h-5 w-5 text-orange-600" />
        <span>Activité Récente</span>
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className={`p-4 rounded-lg border-l-4 ${getStatusColor(activity.status)} hover:shadow-sm transition-shadow`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getTypeIcon(activity.type)}</span>
                  {getStatusIcon(activity.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">{activity.action}</h4>
                    <span className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 truncate">{activity.details}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{activity.user}</span>
                    </div>
                    
                    {activity.duration !== '-' && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{activity.duration}</span>
                      </div>
                    )}
                    
                    {activity.rowsAffected && (
                      <div className="flex items-center space-x-1">
                        <Database className="h-3 w-3" />
                        <span>{activity.rowsAffected} lignes</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Dernières 24 heures</span>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Voir tout l'historique →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
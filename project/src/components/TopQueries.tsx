import React from 'react';
import { Activity, Clock, TrendingUp, Eye } from 'lucide-react';

const TopQueries: React.FC = () => {
  const topQueries = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateQuery = (query: string, maxLength: number = 80) => {
    return query.length > maxLength ? query.substring(0, maxLength) + '...' : query;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 1) {
      return `${(seconds * 1000).toFixed(0)}ms`;
    }
    return `${seconds.toFixed(1)}s`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <TrendingUp className="h-5 w-5 text-purple-600" />
        <span>Requêtes les Plus Fréquentes</span>
      </h3>
      
      <div className="space-y-4">
        {topQueries.map((query, index) => (
          <div key={query.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 mr-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(query.status)}`}>
                    {query.status}
                  </span>
                  <span className="text-sm text-gray-500">par {query.user}</span>
                </div>
                <code className="text-sm text-gray-800 bg-gray-50 p-2 rounded block font-mono">
                  {truncateQuery(query.query)}
                </code>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Eye className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-gray-600">Exécutions</p>
                  <p className="font-semibold text-gray-900">{query.executions.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-gray-600">Temps Moyen</p>
                  <p className="font-semibold text-gray-900">{formatTime(query.avgTime)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-gray-600">Temps Total</p>
                  <p className="font-semibold text-gray-900">{formatTime(query.totalTime)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-600">Dernière Exéc.</p>
                <p className="font-semibold text-gray-900 text-xs">{query.lastExecution}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900">Optimisation Recommandée</h4>
            <p className="text-sm text-blue-700">3 requêtes pourraient bénéficier d'optimisations d'index</p>
          </div>
          <button className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm">
            Analyser
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopQueries;
import React, { useState } from 'react';
import { Activity, TrendingUp, Clock, Database, Zap, AlertCircle, RefreshCw } from 'lucide-react';

const Performance: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
                <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                Performance Oracle
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">Surveillance et analyse des performances en temps réel</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-base shadow-sm"
              >
                <option value="15m">📅 15 minutes</option>
                <option value="1h">🕐 1 heure</option>
                <option value="6h">⏰ 6 heures</option>
                <option value="24h">📆 24 heures</option>
                <option value="7d">📊 7 jours</option>
              </select>
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all disabled:opacity-50 font-bold shadow-lg hover:shadow-xl text-base"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Métriques de performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">+2.3%</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">CPU Usage</h3>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-1">67.2%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Utilisation moyenne</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Top Queries */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="h-6 w-6" />
                Requêtes les plus coûteuses
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">Aucune requête coûteuse détectée</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Les données apparaîtront ici lors de l'analyse</p>
              </div>
            </div>
          </div>

          {/* Wait Events */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Événements d'attente
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">Aucun événement d'attente critique</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Surveillance en temps réel active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques de performance */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Tendances de Performance
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center border-2 border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <Database className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">CPU & Mémoire</p>
                  <p className="text-base text-gray-600 dark:text-gray-400">Évolution sur {selectedTimeRange}</p>
                </div>
              </div>
              <div className="h-80 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center border-2 border-green-200 dark:border-green-800">
                <div className="text-center">
                  <Activity className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">I/O & Réseau</p>
                  <p className="text-base text-gray-600 dark:text-gray-400">Débit et latence</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommandations */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Recommandations d'Optimisation
            </h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Aucune recommandation critique</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Système optimisé selon les meilleures pratiques</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
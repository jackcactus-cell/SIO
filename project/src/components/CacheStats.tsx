import React, { useState, useEffect } from 'react';
import { Database, Clock, CheckCircle2, XCircle, RefreshCcw, Trash2 } from 'lucide-react';

interface CacheStats {
  category: string;
  total_queries: number;
  successful_queries: number;
  failed_queries: number;
  avg_execution_time: number;
  last_updated: string;
}

interface QueryHistory {
  question: string;
  category: string;
  success: boolean;
  execution_time: number;
  error_message: string | null;
  timestamp: string;
  hit_count: number;
}

const CacheStats: React.FC = () => {
  const [stats, setStats] = useState<CacheStats[]>([]);
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsResponse, historyResponse] = await Promise.all([
        fetch('http://localhost:4000/api/cache/stats'),
        fetch('http://localhost:4000/api/cache/history')
      ]);

      const statsData = await statsResponse.json();
      const historyData = await historyResponse.json();

      if (statsData.success && historyData.success) {
        setStats(statsData.data);
        setHistory(historyData.data);
        setError(null);
      } else {
        throw new Error('Erreur lors de la récupération des données');
      }
    } catch (err) {
      setError('Erreur lors de la récupération des statistiques du cache');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cleanupCache = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/cache/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchStats();
      } else {
        throw new Error('Erreur lors du nettoyage du cache');
      }
    } catch (err) {
      setError('Erreur lors du nettoyage du cache');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  };

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Database className="w-6 h-6 mr-2 text-blue-400" />
          Statistiques du Cache
        </h2>
        <div className="space-x-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
          <button
            onClick={cleanupCache}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Nettoyer
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.category} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{stat.category}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total requêtes</span>
                <span className="text-blue-300 font-mono">{stat.total_queries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Succès</span>
                <span className="text-green-300 font-mono">{stat.successful_queries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Échecs</span>
                <span className="text-red-300 font-mono">{stat.failed_queries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Temps moyen</span>
                <span className="text-purple-300 font-mono">{formatDuration(stat.avg_execution_time)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Dernière mise à jour : {formatDate(stat.last_updated)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Historique des requêtes */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
        <h3 className="text-lg font-semibold text-white p-4 bg-gray-800/30 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-400" />
          Historique des Requêtes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Question</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Temps</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Utilisations</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {history.map((query, index) => (
                <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-300">{query.question}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{query.category}</td>
                  <td className="px-4 py-3 text-sm">
                    {query.success ? (
                      <span className="flex items-center text-green-400">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Succès
                      </span>
                    ) : (
                      <span className="flex items-center text-red-400">
                        <XCircle className="w-4 h-4 mr-1" />
                        Échec
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-purple-300">
                    {formatDuration(query.execution_time)}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-blue-300">
                    {query.hit_count}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {formatDate(query.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CacheStats; 
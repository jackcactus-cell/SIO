import React, { useState, useEffect } from 'react';
import { ArrowRight, Database, Server, Monitor, Clock } from 'lucide-react';

interface RequestLog {
  id: string;
  timestamp: Date;
  query: string;
  cacheHit: boolean;
  responseTime: number;
  result: any;
}

const RequestFlow: React.FC = () => {
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestLog | null>(null);

  // Simuler la récupération des logs de requêtes
  useEffect(() => {
    const fetchRequestLogs = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/cache/stats');
        const data = await response.json();
        if (data.topQueries) {
          const logs = data.topQueries.map((q: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(q.last_used),
            query: q.query,
            cacheHit: true,
            responseTime: Math.random() * 100,
            result: q
          }));
          setRequests(logs);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
      }
    };

    fetchRequestLogs();
    const interval = setInterval(fetchRequestLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    return `${ms.toFixed(2)}ms`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Workflow des Requêtes
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Actualisation auto. 5s</span>
        </div>
      </div>

      {/* Visualisation du workflow */}
      <div className="flex items-center justify-between py-4 px-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center">
            <Monitor className="h-8 w-8 text-blue-500" />
            <span className="text-xs mt-1">Frontend</span>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
          <div className="flex flex-col items-center">
            <Server className="h-8 w-8 text-green-500" />
            <span className="text-xs mt-1">Backend</span>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
          <div className="flex flex-col items-center">
            <Database className="h-8 w-8 text-yellow-500" />
            <span className="text-xs mt-1">Cache SQLite</span>
          </div>
        </div>
      </div>

      {/* Liste des requêtes récentes */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {requests.map((request) => (
          <div
            key={request.id}
            className={`p-4 rounded-lg border transition-colors cursor-pointer
              ${selectedRequest?.id === request.id
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            onClick={() => setSelectedRequest(request)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {request.query}
                  </span>
                  {request.cacheHit && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Cache Hit
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(request.timestamp).toLocaleString('fr-FR')} • 
                  Temps de réponse: {formatTime(request.responseTime)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Détails de la requête sélectionnée */}
      {selectedRequest && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Détails de la requête
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <span className="font-medium">Query: </span>
              {selectedRequest.query}
            </div>
            <div>
              <span className="font-medium">Timestamp: </span>
              {new Date(selectedRequest.timestamp).toLocaleString('fr-FR')}
            </div>
            <div>
              <span className="font-medium">Cache: </span>
              {selectedRequest.cacheHit ? 'Hit' : 'Miss'}
            </div>
            <div>
              <span className="font-medium">Temps de réponse: </span>
              {formatTime(selectedRequest.responseTime)}
            </div>
            <div>
              <span className="font-medium">Résultat: </span>
              <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto">
                {JSON.stringify(selectedRequest.result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestFlow; 
import React, { useState } from 'react';
import { Play, Save, Download, History, AlertCircle, CheckCircle } from 'lucide-react';

interface QueryResult {
  [key: string]: any;
}

const SQLQueryEditor: React.FC = () => {
  const [query, setQuery] = useState(`SELECT 
  DBUSERNAME,
  ACTION_NAME,
  OBJECT_NAME,
  EVENT_TIMESTAMP
FROM audit_data
WHERE EVENT_TIMESTAMP >= SYSDATE - 1
ORDER BY EVENT_TIMESTAMP DESC;`);

  const [results, setResults] = useState<QueryResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Veuillez entrer une requête SQL');
      return;
    }

    setIsExecuting(true);
    setError(null);
    setResults([]);
    setColumns([]);
    setExecutionTime(null);

    try {
      const startTime = Date.now();
      
      const response = await fetch((import.meta as any).env?.VITE_BACKEND_PY_URL ? `${(import.meta as any).env.VITE_BACKEND_PY_URL}/api/oracle/execute-sql` : 'http://localhost:8000/api/oracle/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query.trim()
        })
      });

      const data = await response.json();
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'exécution de la requête');
      }

      if (data.status === 'success') {
        setResults(data.data || []);
        if (data.columns && Array.isArray(data.columns)) {
          setColumns(data.columns);
        } else if (data.data && data.data.length > 0) {
          setColumns(Object.keys(data.data[0]));
        }
      } else {
        throw new Error(data.message || 'Erreur lors de l\'exécution de la requête');
      }

    } catch (err) {
      console.error('Erreur lors de l\'exécution de la requête:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setResults([]);
    } finally {
      setIsExecuting(false);
    }
  };

  const saveQuery = () => {
    // Sauvegarder la requête dans le localStorage
    const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
    const newQuery = {
      id: Date.now(),
      query: query,
      timestamp: new Date().toISOString(),
      name: `Requête ${savedQueries.length + 1}`
    };
    savedQueries.push(newQuery);
    localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
    alert('Requête sauvegardée !');
  };

  const exportResults = () => {
    if (results.length === 0) {
      alert('Aucun résultat à exporter');
      return;
    }

    const csvContent = [
      columns.join(','),
      ...results.map(row => columns.map(col => `"${row[col] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleQueries = () => {
    const samples = [
      {
        name: 'Utilisateurs actifs',
        query: `SELECT 
  DBUSERNAME,
  COUNT(*) as nombre_actions
FROM audit_data
WHERE EVENT_TIMESTAMP >= SYSDATE - 7
GROUP BY DBUSERNAME
ORDER BY nombre_actions DESC;`
      },
      {
        name: 'Actions par type',
        query: `SELECT 
  ACTION_NAME,
  COUNT(*) as nombre_actions
FROM audit_data
WHERE EVENT_TIMESTAMP >= SYSDATE - 1
GROUP BY ACTION_NAME
ORDER BY nombre_actions DESC;`
      },
      {
        name: 'Objets les plus consultés',
        query: `SELECT 
  OBJECT_NAME,
  COUNT(*) as nombre_consultations
FROM audit_data
WHERE OBJECT_NAME IS NOT NULL
  AND EVENT_TIMESTAMP >= SYSDATE - 7
GROUP BY OBJECT_NAME
ORDER BY nombre_consultations DESC
LIMIT 10;`
      }
    ];

    return samples;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Éditeur SQL Oracle</h3>
          <div className="flex space-x-2">
            <select 
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              onChange={(e) => {
                const samples = loadSampleQueries();
                const selected = samples.find(s => s.name === e.target.value);
                if (selected) setQuery(selected.query);
              }}
            >
              <option value="">Exemples de requêtes</option>
              {loadSampleQueries().map((sample, index) => (
                <option key={index} value={sample.name}>{sample.name}</option>
              ))}
            </select>
            <button 
              onClick={saveQuery}
              className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Sauvegarder</span>
            </button>
            <button 
              onClick={executeQuery}
              disabled={isExecuting}
              className="flex items-center space-x-1 px-4 py-2 text-sm bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              <span>{isExecuting ? 'Exécution...' : 'Exécuter'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requête SQL
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-40 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              placeholder="Entrez votre requête SQL ici..."
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {executionTime && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700">
                Requête exécutée en {executionTime}ms
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Résultats ({results.length} lignes)
              </h4>
              {results.length > 0 && (
                <button 
                  onClick={exportResults}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Exporter CSV</span>
                </button>
              )}
            </div>
            
            {results.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((column, index) => (
                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {columns.map((column, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row[column] !== null && row[column] !== undefined ? String(row[column]) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isExecuting ? 'Exécution de la requête...' : 'Aucun résultat à afficher'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SQLQueryEditor;
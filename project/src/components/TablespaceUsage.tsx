import React, { useState, useEffect } from 'react';
import { HardDrive, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

interface Tablespace {
  name: string;
  totalSpace: number;
  usedSpace: number;
  freeSpace: number;
  percentUsed: number;
  status: 'normal' | 'warning' | 'critical';
}

const TablespaceUsage: React.FC = () => {
  const [tablespaces, setTablespaces] = useState<Tablespace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTablespaceData();
  }, []);

  const fetchTablespaceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:4000/api/tablespaces');
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      const data = await response.json();
      setTablespaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMB} MB`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex items-center justify-center min-h-[250px]">
        <div className="flex flex-col items-center space-y-2">
          <Loader className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
          <span className="text-lg text-gray-600 dark:text-gray-400">Chargement des données...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-6 w-6" />
          <span className="text-lg">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8 flex items-center space-x-3">
        <HardDrive className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        <span>Utilisation des Tablespaces</span>
      </h3>

      <div className="space-y-6">
        {tablespaces.map((tablespace, index) => (
          <div key={index} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tablespace.name}</h4>
                <span className="scale-125">{getStatusIcon(tablespace.status)}</span>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${getStatusColor(tablespace.status)}`}>
                  {tablespace.percentUsed}%
                </div>
                <div className="text-base text-gray-500 dark:text-gray-400">
                  {formatSize(tablespace.usedSpace)} / {formatSize(tablespace.totalSpace)}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${
                    tablespace.percentUsed >= 90 ? 'bg-red-500' :
                    tablespace.percentUsed >= 75 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${tablespace.percentUsed}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-base text-gray-600 dark:text-gray-400 mt-4">
              <span>Utilisé: {formatSize(tablespace.usedSpace)}</span>
              <span>Libre: {formatSize(tablespace.freeSpace)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TablespaceUsage;
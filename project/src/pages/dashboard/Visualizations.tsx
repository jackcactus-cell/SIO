import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Settings, RefreshCw, Activity, Users, Database, Shield } from 'lucide-react';

const Visualizations: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState('performance');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartTypes = [
    { id: 'performance', name: 'Performance', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'usage', name: 'Utilisation', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'distribution', name: 'Distribution', icon: <PieChart className="h-4 w-4" /> },
    { id: 'security', name: 'Sécurité', icon: <Shield className="h-4 w-4" /> }
  ];

  // Données de test simples
  const performanceData = {
    cpu: 65,
    memory: 72,
    disk: 48,
    network: 42
  };

  const usageStats = [
    { category: 'Tables', value: 45, percentage: 45, color: '#3B82F6' },
    { category: 'Indexes', value: 25, percentage: 25, color: '#10B981' },
    { category: 'Vues', value: 15, percentage: 15, color: '#F59E0B' },
    { category: 'Procédures', value: 10, percentage: 10, color: '#EF4444' },
    { category: 'Triggers', value: 5, percentage: 5, color: '#8B5CF6' }
  ];

  const distributionData = {
    labels: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALTER', 'CREATE'],
    data: [65, 15, 12, 5, 2, 1],
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
  };

  const fetchVisualizationData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Chargement des données de visualisation...');
      
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Données chargées avec succès');
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      setError('Erreur lors du chargement des données');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Page Visualisations montée');
    fetchVisualizationData();
  }, []);

  const handleRefresh = async () => {
    console.log('🔄 Actualisation des données...');
    setIsRefreshing(true);
    await fetchVisualizationData();
    setIsRefreshing(false);
  };

  const handleExport = () => {
    console.log('📤 Export des données...');
    const data = {
      performance: performanceData,
      usage: usageStats,
      distribution: distributionData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visualisations_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPerformanceColor = (value: number) => {
    if (value < 50) return 'text-green-600';
    if (value < 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBgColor = (value: number) => {
    if (value < 50) return 'bg-green-100';
    if (value < 75) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  console.log('🎨 Rendu de la page Visualisations');

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Visualisations</h1>
          <p className="text-gray-600 dark:text-gray-300">Graphiques et analyses visuelles de vos données Oracle</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
          <button 
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-900 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* Sélecteur de type de graphique */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-4 mb-6">
          {chartTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedChart(type.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedChart === type.id
                  ? 'bg-blue-900 dark:bg-blue-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {type.icon}
              <span>{type.name}</span>
            </button>
          ))}
        </div>

        {/* Graphique de Performance */}
        {selectedChart === 'performance' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Système</h3>
            {isLoading ? (
              <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Chargement des données...</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU</h4>
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-baseline">
                    <span className={`text-2xl font-bold ${getPerformanceColor(performanceData.cpu)}`}>
                      {performanceData.cpu}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className={`h-2 rounded-full ${getPerformanceBgColor(performanceData.cpu)}`}>
                      <div 
                        className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${performanceData.cpu}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Mémoire</h4>
                    <Database className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-baseline">
                    <span className={`text-2xl font-bold ${getPerformanceColor(performanceData.memory)}`}>
                      {performanceData.memory}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className={`h-2 rounded-full ${getPerformanceBgColor(performanceData.memory)}`}>
                      <div 
                        className="h-2 bg-green-600 rounded-full transition-all duration-300"
                        style={{ width: `${performanceData.memory}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Disque</h4>
                    <BarChart3 className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex items-baseline">
                    <span className={`text-2xl font-bold ${getPerformanceColor(performanceData.disk)}`}>
                      {performanceData.disk}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className={`h-2 rounded-full ${getPerformanceBgColor(performanceData.disk)}`}>
                      <div 
                        className="h-2 bg-yellow-600 rounded-full transition-all duration-300"
                        style={{ width: `${performanceData.disk}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Réseau</h4>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex items-baseline">
                    <span className={`text-2xl font-bold ${getPerformanceColor(performanceData.network)}`}>
                      {performanceData.network}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className={`h-2 rounded-full ${getPerformanceBgColor(performanceData.network)}`}>
                      <div 
                        className="h-2 bg-purple-600 rounded-full transition-all duration-300"
                        style={{ width: `${performanceData.network}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Graphique d'Utilisation */}
        {selectedChart === 'usage' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Utilisation des Ressources</h3>
            {isLoading ? (
              <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Chargement des données...</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {usageStats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.category}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${stat.percentage}%`,
                            backgroundColor: stat.color
                          }}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {stat.percentage}% du total
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Graphique d'utilisation</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Répartition par type d'objet</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Graphique de Distribution */}
        {selectedChart === 'distribution' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Distribution des Actions</h3>
            {isLoading ? (
              <div className="h-80 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Chargement des données...</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {distributionData.labels.map((label, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: distributionData.colors[index] }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {distributionData.data[index]}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-80 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Graphique circulaire</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Distribution des types d'actions</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Graphique de Sécurité */}
        {selectedChart === 'security' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Analyses de Sécurité</h3>
            {isLoading ? (
              <div className="h-80 bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-red-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Chargement des données...</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Tentatives d'accès</h4>
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">12</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cette semaine</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Accès non autorisés</h4>
                    <Shield className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">3</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cette semaine</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs actifs</h4>
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">45</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Actuellement</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Informations de Debug :</h4>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <div>État de chargement : {isLoading ? 'Chargement...' : 'Terminé'}</div>
          <div>Graphique sélectionné : {selectedChart}</div>
          <div>Erreur : {error || 'Aucune'}</div>
          <div>Données CPU : {performanceData.cpu}%</div>
          <div>Données Mémoire : {performanceData.memory}%</div>
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
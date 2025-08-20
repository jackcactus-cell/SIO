import React from 'react';
import { Server, Database, Wifi, HardDrive, Shield, AlertTriangle, CheckCircle, XCircle, Zap } from 'lucide-react';

const SystemStatus: React.FC = () => {
  const systemInfo = {};

  const systemHealth = [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Informations de connexion */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-600" />
          <span>Informations Système</span>
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Instance</p>
              <p className="font-semibold text-gray-900">{systemInfo.instance}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="font-semibold text-gray-900">{systemInfo.uptime}</p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Serveur</p>
            <p className="font-semibold text-gray-900">{systemInfo.server}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Version</p>
            <p className="font-semibold text-gray-900">{systemInfo.version}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{systemInfo.totalTables}</p>
              <p className="text-sm text-gray-600">Tables</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{systemInfo.totalViews}</p>
              <p className="text-sm text-gray-600">Vues</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{systemInfo.totalIndexes}</p>
              <p className="text-sm text-gray-600">Index</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{systemInfo.totalUsers}</p>
              <p className="text-sm text-gray-600">Utilisateurs</p>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">{systemInfo.dbSize}</p>
              <p className="text-sm text-gray-600">Taille DB</p>
            </div>
          </div>
        </div>
      </div>

      {/* État du système */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span>État du Système</span>
        </h3>
        <div className="space-y-4">
          {systemHealth.map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-600">{item.icon}</div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  <span className="text-sm font-medium capitalize text-gray-700">
                    {item.status === 'healthy' ? 'Sain' : item.status === 'warning' ? 'Attention' : 'Erreur'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
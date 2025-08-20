import React, { useState } from 'react';
import { Database, Link as LinkIcon, ShieldCheck, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import logger, { logUserAction } from '../utils/logger';
import { useOracleConnection } from '../context/OracleConnectionContext';

const OracleLogin: React.FC = () => {
  const [connectionName, setConnectionName] = useState('Oracle Production');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState<number | ''>(1521);
  const [serviceName, setServiceName] = useState('ORCL');
  const [username, setUsername] = useState('hr');
  const [password, setPassword] = useState('');
  const [driverMode, setDriverMode] = useState<'thin' | 'thick'>('thin');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'testing' | 'success' | 'error'>('none');
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const { testAndSave, setConfig } = useOracleConnection();

  const canTest = host && port && serviceName && username && password;

  const testConnection = async () => {
    if (!canTest || loading) return;
    
    setLoading(true);
    setConnectionStatus('testing');
    setResult(null);
    
    // Logger l'action utilisateur
    logUserAction('test_connection', 'OracleLogin', {
      host,
      port,
      serviceName,
      username,
      connectionName
    });

    try {
      const response = await fetch((import.meta as any).env?.VITE_BACKEND_PY_URL ? `${(import.meta as any).env.VITE_BACKEND_PY_URL}/api/oracle/test-connection` : 'http://localhost:8000/api/oracle/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          host, 
          port: Number(port), 
          service_name: serviceName, 
          username, 
          password, 
          driver_mode: driverMode 
        })
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setConnectionStatus('success');
        logger.info('Connexion Oracle réussie', 'OracleLogin', { host, port, serviceName });
      } else {
        setConnectionStatus('error');
        logger.error('Échec de connexion Oracle', new Error(data.error || data.message), 'OracleLogin', { host, port, serviceName });
      }
    } catch (e: any) {
      setResult({ success: false, error: e?.message || 'Erreur inconnue' });
      setConnectionStatus('error');
      logger.error('Erreur lors du test de connexion', e, 'OracleLogin', { host, port, serviceName });
    } finally {
      setLoading(false);
    }
  };

  const saveConnection = () => {
    logUserAction('save_connection', 'OracleLogin', {
      connectionName,
      host,
      port,
      serviceName,
      username
    });
    
    const cfg = { host, port: Number(port), serviceName, username, password, driverMode } as const;
    setConfig(cfg as any);
    testAndSave(cfg as any);
    logger.info('Connexion sauvegardée', 'OracleLogin', { connectionName, host, port, serviceName });
  };

  return (
    <div className="min-h-screen w-full bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section Nouvelle Connexion */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
              <Database className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Nouvelle Connexion</h2>
          </div>

            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la connexion
                </label>
                <input 
                  value={connectionName} 
                  onChange={e => setConnectionName(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Oracle Production"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hôte
                </label>
                <input 
                  value={host} 
                  onChange={e => setHost(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="localhost"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port
                </label>
                <input 
                  value={port} 
                  onChange={e => setPort(e.target.value ? Number(e.target.value) : '')} 
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1521"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service
                </label>
                <input 
                  value={serviceName} 
                  onChange={e => setServiceName(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ORCL"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <input 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="hr"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    type="password"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <ShieldCheck className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={testConnection} 
                  disabled={!canTest || loading} 
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
              <span>Tester la connexion</span>
            </button>
                
                <button 
                  onClick={saveConnection}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>

          {/* Section État de la Connexion */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Database className="h-4 w-4 text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">État de la Connexion</h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              {connectionStatus === 'none' && (
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Aucune connexion active</p>
                  <p className="text-gray-500 text-sm">
                    Configurez une connexion pour commencer à explorer vos bases Oracle.
                  </p>
                </div>
              )}

              {connectionStatus === 'testing' && (
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Test de connexion en cours...</p>
                  <p className="text-gray-500 text-sm">
                    Vérification des paramètres de connexion.
                  </p>
                </div>
              )}

              {connectionStatus === 'success' && (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Connexion réussie</p>
                  <p className="text-gray-500 text-sm mb-4">
                    La connexion à la base de données Oracle a été établie avec succès.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">
                      <strong>Détails :</strong> {result?.message || 'Connexion Oracle OK'}
                    </p>
                  </div>
                </div>
              )}

              {connectionStatus === 'error' && (
                <div className="text-center">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Échec de connexion</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Impossible de se connecter à la base de données Oracle.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">
                      <strong>Erreur :</strong> {result?.error || result?.message || 'Erreur inconnue'}
                    </p>
                  </div>
              </div>
            )}
          </div>

            {/* Informations supplémentaires */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Informations</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Assurez-vous que le service Oracle est démarré</li>
                <li>• Vérifiez que le port 1521 est accessible</li>
                <li>• Confirmez les identifiants de connexion</li>
                <li>• Installez le driver Oracle si nécessaire</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracleLogin;




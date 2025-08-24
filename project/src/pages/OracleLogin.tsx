import React, { useState, useEffect } from 'react';
import { Database, Link as LinkIcon, ShieldCheck, Loader2, AlertCircle, CheckCircle, XCircle, Save, Trash2 } from 'lucide-react';
import logger, { logUserAction } from '../utils/logger';
import { useOracleConnection } from '../context/OracleConnectionContext';

interface SavedConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  serviceName: string;
  username: string;
  driverMode: 'thin' | 'thick';
  lastUsed?: string;
}

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
  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const { testAndSave, setConfig } = useOracleConnection();

  const canTest = host && port && serviceName && username && password;

  // Charger les connexions sauvegardées au démarrage
  useEffect(() => {
    loadSavedConnections();
  }, []);

  const loadSavedConnections = () => {
    try {
      const saved = localStorage.getItem('oracle_saved_connections');
      if (saved) {
        const connections = JSON.parse(saved) as SavedConnection[];
        setSavedConnections(connections);
      }
    } catch (error) {
      logger.error('Erreur lors du chargement des connexions sauvegardées', error, 'OracleLogin');
    }
  };

  const saveConnectionToStorage = (connection: Omit<SavedConnection, 'id' | 'lastUsed'>) => {
    try {
      const newConnection: SavedConnection = {
        ...connection,
        id: Date.now().toString(),
        lastUsed: new Date().toISOString()
      };
      
      const updatedConnections = [...savedConnections.filter(c => c.name !== connection.name), newConnection];
      localStorage.setItem('oracle_saved_connections', JSON.stringify(updatedConnections));
      setSavedConnections(updatedConnections);
      
      logger.info('Connexion sauvegardée dans le stockage local', 'OracleLogin', { connectionName: connection.name });
      return true;
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde de la connexion', error, 'OracleLogin');
      return false;
    }
  };

  const loadConnectionFromStorage = (connection: SavedConnection) => {
    setConnectionName(connection.name);
    setHost(connection.host);
    setPort(connection.port);
    setServiceName(connection.serviceName);
    setUsername(connection.username);
    setPassword(''); // Ne pas charger le mot de passe pour des raisons de sécurité
    setDriverMode(connection.driverMode);
    setSelectedConnection(connection.id);
    setConnectionStatus('none');
    setResult(null);
  };

  const deleteSavedConnection = (connectionId: string) => {
    try {
      const updatedConnections = savedConnections.filter(c => c.id !== connectionId);
      localStorage.setItem('oracle_saved_connections', JSON.stringify(updatedConnections));
      setSavedConnections(updatedConnections);
      
      if (selectedConnection === connectionId) {
        setSelectedConnection(null);
      }
      
      logger.info('Connexion supprimée du stockage local', 'OracleLogin', { connectionId });
    } catch (error) {
      logger.error('Erreur lors de la suppression de la connexion', error, 'OracleLogin');
    }
  };

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
      const backendUrl = (import.meta as any).env?.VITE_BACKEND_PY_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/oracle/test-connection`, {
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
      const errorMessage = e?.message || 'Erreur de connexion au serveur backend';
      setResult({ success: false, error: errorMessage });
      setConnectionStatus('error');
      logger.error('Erreur lors du test de connexion', e, 'OracleLogin', { host, port, serviceName });
    } finally {
      setLoading(false);
    }
  };

  const saveConnection = async () => {
    if (!canTest) {
      alert('Veuillez remplir tous les champs requis avant de sauvegarder');
      return;
    }

    logUserAction('save_connection', 'OracleLogin', {
      connectionName,
      host,
      port,
      serviceName,
      username
    });
    
    // Sauvegarder dans le stockage local
    const saved = saveConnectionToStorage({
      name: connectionName,
      host,
      port: Number(port),
      serviceName,
      username,
      driverMode
    });

    if (saved) {
      // Sauvegarder dans le contexte
      const cfg = { host, port: Number(port), serviceName, username, password, driverMode } as const;
      setConfig(cfg as any);
      
      // Tester et sauvegarder la connexion
      const success = await testAndSave(cfg as any);
      
      if (success) {
        logger.info('Connexion sauvegardée avec succès', 'OracleLogin', { connectionName, host, port, serviceName });
        alert('Connexion sauvegardée avec succès !');
      } else {
        logger.warning('Connexion sauvegardée localement mais échec de la connexion', 'OracleLogin', { connectionName });
        alert('Connexion sauvegardée localement mais la connexion à la base de données a échoué.');
      }
    } else {
      alert('Erreur lors de la sauvegarde de la connexion');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Section Connexions Sauvegardées */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Connexions Sauvegardées</h2>
              </div>

              {savedConnections.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Aucune connexion sauvegardée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedConnections.map((connection) => (
                    <div 
                      key={connection.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedConnection === connection.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => loadConnectionFromStorage(connection)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{connection.name}</h3>
                          <p className="text-sm text-gray-600">{connection.host}:{connection.port}/{connection.serviceName}</p>
                          <p className="text-xs text-gray-500">Utilisateur: {connection.username}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSavedConnection(connection.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section Nouvelle Connexion */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Nouvelle Connexion</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la connexion *
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
                    Mode Driver
                  </label>
                  <select
                    value={driverMode}
                    onChange={e => setDriverMode(e.target.value as 'thin' | 'thick')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="thin">Thin (recommandé)</option>
                    <option value="thick">Thick (Instant Client)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hôte *
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
                    Port *
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
                    Service *
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
                    Nom d'utilisateur *
                  </label>
                  <input 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="hr"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
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
              </div>

              <div className="flex gap-3 pt-6">
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
                  disabled={!canTest}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </button>
              </div>
            </div>

            {/* Section État de la Connexion */}
            <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
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
                  <li>• Utilisez le mode "Thick" si Oracle Instant Client est installé</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracleLogin;




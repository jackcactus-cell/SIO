import React, { useState, useEffect } from 'react';
import { 
  User, Activity, Clock, Database, Shield, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, XCircle, Info, Search, Filter, Download,
  Eye, EyeOff, BarChart3, PieChart, Calendar, Users, Target
} from 'lucide-react';

interface UserAction {
  timestamp: string;
  actionType: string;
  objectName: string;
  objectSchema: string;
  clientProgram: string;
  sessionId: string;
  userHost: string;
  terminal: string;
  authenticationType: string;
  osUsername: string;
  dbUsername: string;
}

interface UserAnalysis {
  user: string;
  found: boolean;
  totalActions: number;
  summary: any;
  actionsByType: any[];
  actionsByObject: any[];
  actionsByTime: any;
  sessions: any[];
  securityAnalysis: any;
  performanceMetrics: any;
  detailedActions: UserAction[];
}

interface UserActionsDetailProps {
  username?: string;
  onBack?: () => void;
}

const UserActionsDetail: React.FC<UserActionsDetailProps> = ({ username, onBack }) => {
  const [userAnalysis, setUserAnalysis] = useState<UserAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (username) {
      fetchUserAnalysis(username);
    }
  }, [username]);

  const fetchUserAnalysis = async (user: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3000/api/users/${user}/actions`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setUserAnalysis(data.data);
      } else {
        setError(data.message || 'Erreur lors de la récupération des données');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActions = userAnalysis?.detailedActions?.filter(action => {
    const matchesSearch = action.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.objectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.clientProgram.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || action.actionType === filterType;
    
    return matchesSearch && matchesFilter;
  }) || [];

  const exportToCSV = () => {
    if (!userAnalysis?.detailedActions) return;
    
    const headers = ['Timestamp', 'Action Type', 'Object Name', 'Object Schema', 'Client Program', 'Session ID', 'User Host', 'Terminal', 'Authentication Type', 'OS Username', 'DB Username'];
    const csvContent = [
      headers.join(','),
      ...userAnalysis.detailedActions.map(action => [
        action.timestamp,
        action.actionType,
        action.objectName,
        action.objectSchema,
        action.clientProgram,
        action.sessionId,
        action.userHost,
        action.terminal,
        action.authenticationType,
        action.osUsername,
        action.dbUsername
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}_actions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'FAIBLE': return 'text-green-600 bg-green-100';
      case 'MOYEN': return 'text-yellow-600 bg-yellow-100';
      case 'ÉLEVÉ': return 'text-orange-600 bg-orange-100';
      case 'CRITIQUE': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'SELECT': return 'text-blue-600 bg-blue-100';
      case 'INSERT': return 'text-green-600 bg-green-100';
      case 'UPDATE': return 'text-yellow-600 bg-yellow-100';
      case 'DELETE': return 'text-red-600 bg-red-100';
      case 'TRUNCATE': return 'text-purple-600 bg-purple-100';
      case 'DROP': return 'text-red-800 bg-red-200';
      case 'ALTER': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Analyse en cours...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <XCircle className="h-6 w-6 text-red-600 mr-3" />
          <h3 className="text-lg font-semibold text-red-800">Erreur</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={() => username && fetchUserAnalysis(username)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!userAnalysis || !userAnalysis.found) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <Info className="h-6 w-6 text-yellow-600 mr-3" />
          <h3 className="text-lg font-semibold text-yellow-800">Utilisateur non trouvé</h3>
        </div>
        <p className="mt-2 text-yellow-700">
          Aucune action trouvée pour l'utilisateur "{username}"
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Retour
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{userAnalysis.user}</h1>
              <p className="text-gray-600">
                {userAnalysis.totalActions} actions analysées
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Retour
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'summary', label: 'Résumé', icon: BarChart3 },
              { id: 'actions', label: 'Actions', icon: Activity },
              { id: 'objects', label: 'Objets', icon: Database },
              { id: 'sessions', label: 'Sessions', icon: Clock },
              { id: 'security', label: 'Sécurité', icon: Shield },
              { id: 'performance', label: 'Performance', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Actions</p>
                      <p className="text-2xl font-bold text-blue-900">{userAnalysis.totalActions}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Database className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Objets Uniques</p>
                      <p className="text-2xl font-bold text-green-900">{userAnalysis.summary.uniqueObjects}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Sessions</p>
                      <p className="text-2xl font-bold text-purple-900">{userAnalysis.sessions.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-600">Niveau de Risque</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(userAnalysis.securityAnalysis.riskLevel)}`}>
                        {userAnalysis.securityAnalysis.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions by Type Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Actions par Type</h3>
                <div className="space-y-2">
                  {userAnalysis.actionsByType.slice(0, 5).map((action, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionTypeColor(action.actionType)}`}>
                          {action.actionType}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">{action.count} actions</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{action.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher dans les actions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les types</option>
                    {userAnalysis.actionsByType.map(action => (
                      <option key={action.actionType} value={action.actionType}>
                        {action.actionType}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showDetails ? 'Masquer détails' : 'Afficher détails'}
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Objet
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Programme
                        </th>
                        {showDetails && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Session
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Host
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredActions.map((action, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(action.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionTypeColor(action.actionType)}`}>
                              {action.actionType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{action.objectName}</div>
                              <div className="text-gray-500">{action.objectSchema}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {action.clientProgram}
                          </td>
                          {showDetails && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {action.sessionId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {action.userHost}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Objects Tab */}
          {activeTab === 'objects' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Objets Accédés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userAnalysis.actionsByObject.map((obj, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{obj.objectName}</h4>
                      <span className="text-sm text-gray-500">{obj.count} accès</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Schema: {obj.schema}</p>
                    <div className="flex flex-wrap gap-1">
                      {obj.actionTypes.map((actionType, idx) => (
                        <span key={idx} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionTypeColor(actionType)}`}>
                          {actionType}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Dernier accès: {new Date(obj.lastAccess).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sessions d'Utilisateur</h3>
              <div className="space-y-4">
                {userAnalysis.sessions.map((session, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Session {session.sessionId}</h4>
                      <span className="text-sm text-gray-500">{session.actionCount} actions</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Début: {new Date(session.startTime).toLocaleString()}</p>
                        <p className="text-gray-600">Fin: {new Date(session.endTime).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Durée: {session.duration}</p>
                        <p className="text-gray-600">Programmes: {session.programs.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Types d'actions: {session.actionTypes.length}</p>
                        <p className="text-gray-600">Objets: {session.objects.length}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">Actions Privilégiées</h3>
                  <div className="space-y-2">
                    {userAnalysis.securityAnalysis.privilegedActions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-700">{action.ACTION_NAME}</span>
                        <span className="text-xs text-red-600">{action.OBJECT_NAME}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">Accès Système</h3>
                  <div className="space-y-2">
                    {userAnalysis.securityAnalysis.systemAccess.map((action, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-700">{action.ACTION_NAME}</span>
                        <span className="text-xs text-yellow-600">{action.OBJECT_NAME}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {userAnalysis.securityAnalysis.suspiciousPatterns.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3">Patterns Suspects</h3>
                  <div className="space-y-2">
                    {userAnalysis.securityAnalysis.suspiciousPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                        <span className="text-sm text-orange-700">{pattern.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-600">Actions de Lecture</h4>
                  <p className="text-2xl font-bold text-blue-900">{userAnalysis.performanceMetrics.readActions}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-600">Actions d'Écriture</h4>
                  <p className="text-2xl font-bold text-green-900">{userAnalysis.performanceMetrics.writeActions}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-600">Actions Admin</h4>
                  <p className="text-2xl font-bold text-purple-900">{userAnalysis.performanceMetrics.adminActions}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-600">Ratio Lecture/Écriture</h4>
                  <p className="text-2xl font-bold text-orange-900">{userAnalysis.performanceMetrics.readWriteRatio}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Répartition par Période</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(userAnalysis.actionsByTime).map(([period, data]) => (
                    <div key={period} className="text-center">
                      <p className="text-sm font-medium text-gray-600 capitalize">{period}</p>
                      <p className="text-2xl font-bold text-gray-900">{data.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActionsDetail;

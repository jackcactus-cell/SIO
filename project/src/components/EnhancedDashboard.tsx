import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, BarChart3, Bot, Database, Users, Shield, Clock, AlertTriangle,
  TrendingUp, Eye, RefreshCw, Download, Settings, Search, Filter,
  PieChart, LineChart, BarChart, Zap, Globe, Server, Lock
} from 'lucide-react';
import {
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter
} from 'recharts';

// Interfaces
interface DashboardMetrics {
  totalUsers: number;
  totalActions: number;
  totalSessions: number;
  securityAlerts: number;
  systemLoad: number;
  responseTime: number;
  successRate: number;
  activeConnections: number;
}

interface ActivityData {
  time: string;
  actions: number;
  users: number;
  errors: number;
}

interface UserActivityData {
  username: string;
  actions: number;
  lastActivity: string;
  riskScore: number;
}

interface SecurityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  user?: string;
  action?: string;
}

const EnhancedDashboard: React.FC = () => {
  // État du dashboard
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalActions: 0,
    totalSessions: 0,
    securityAlerts: 0,
    systemLoad: 0,
    responseTime: 0,
    successRate: 0,
    activeConnections: 0
  });

  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityData[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [activeTab, setActiveTab] = useState('overview');

  // Couleurs pour les graphiques
  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#8B5CF6',
    gradient: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
  };

  // Charger les données
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Charger les métriques générales
      const metricsResponse = await fetch('/api/dashboard/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data);
      }

      // Charger les données d'activité
      const activityResponse = await fetch(`/api/dashboard/activity?range=${selectedTimeRange}`);
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivityData(activityData.data);
      }

      // Charger l'activité des utilisateurs
      const userActivityResponse = await fetch('/api/dashboard/user-activity');
      if (userActivityResponse.ok) {
        const userData = await userActivityResponse.json();
        setUserActivity(userData.data);
      }

      // Charger les alertes de sécurité
      const alertsResponse = await fetch('/api/dashboard/security-alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setSecurityAlerts(alertsData.data);
      }

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange]);

  // Effet de chargement initial et auto-refresh
  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(loadDashboardData, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadDashboardData]);

  // Composant de carte métrique
  const MetricCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    change?: number;
    color?: string;
    trend?: 'up' | 'down' | 'stable';
    loading?: boolean;
  }> = ({ icon, title, value, change, color = colors.primary, trend, loading }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? (
                <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
              ) : (
                value
              )}
            </p>
          </div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-4 w-4 ${change < 0 ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium">
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Composant de graphique d'activité
  const ActivityChart: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activité en Temps Réel
        </h3>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="1h">1 heure</option>
            <option value="24h">24 heures</option>
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
          </select>
          <button
            onClick={loadDashboardData}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activityData}>
            <defs>
              <linearGradient id="actionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors.secondary} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="actions"
              stroke={colors.primary}
              fillOpacity={1}
              fill="url(#actionsGradient)"
              name="Actions"
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke={colors.secondary}
              fillOpacity={1}
              fill="url(#usersGradient)"
              name="Utilisateurs"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Composant des utilisateurs les plus actifs
  const TopUsersWidget: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Utilisateurs les Plus Actifs
      </h3>
      <div className="space-y-3">
        {userActivity.slice(0, 5).map((user, index) => (
          <div key={user.username} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dernière activité: {new Date(user.lastActivity).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">{user.actions}</p>
              <div className={`flex items-center space-x-1 ${
                user.riskScore > 7 ? 'text-red-600' :
                user.riskScore > 4 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  user.riskScore > 7 ? 'bg-red-600' :
                  user.riskScore > 4 ? 'bg-yellow-600' : 'bg-green-600'
                }`}></div>
                <span className="text-xs">Risque: {user.riskScore}/10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Composant des alertes de sécurité
  const SecurityAlertsWidget: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alertes de Sécurité
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Temps réel</span>
        </div>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {securityAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucune alerte de sécurité</p>
          </div>
        ) : (
          securityAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start space-x-2">
                <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                  alert.type === 'critical' ? 'text-red-600' :
                  alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.message}
                  </p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    {alert.user && <span>Utilisateur: {alert.user}</span>}
                    {alert.action && <span>Action: {alert.action}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Composant de navigation par onglets
  const TabNavigation: React.FC = () => (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="-mb-px flex space-x-8">
        {[
          { id: 'overview', name: 'Vue d\'ensemble', icon: Activity },
          { id: 'security', name: 'Sécurité', icon: Shield },
          { id: 'performance', name: 'Performance', icon: Zap },
          { id: 'users', name: 'Utilisateurs', icon: Users },
        ].map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{name}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Oracle Audit
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Surveillance et analyse en temps réel
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </button>
            
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <TabNavigation />

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<Users className="h-6 w-6" />}
          title="Utilisateurs Actifs"
          value={metrics.totalUsers}
          change={5.2}
          color={colors.primary}
          loading={isLoading}
        />
        <MetricCard
          icon={<Activity className="h-6 w-6" />}
          title="Actions Totales"
          value={metrics.totalActions.toLocaleString()}
          change={12.1}
          color={colors.secondary}
          loading={isLoading}
        />
        <MetricCard
          icon={<Database className="h-6 w-6" />}
          title="Sessions Actives"
          value={metrics.totalSessions}
          change={-2.4}
          color={colors.info}
          loading={isLoading}
        />
        <MetricCard
          icon={<Shield className="h-6 w-6" />}
          title="Alertes Sécurité"
          value={metrics.securityAlerts}
          change={0}
          color={colors.danger}
          loading={isLoading}
        />
      </div>

      {/* Contenu principal selon l'onglet actif */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        
        {/* Colonne latérale */}
        <div className="space-y-6">
          <TopUsersWidget />
          <SecurityAlertsWidget />
        </div>
      </div>

      {/* Métriques de performance système */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <MetricCard
          icon={<Server className="h-6 w-6" />}
          title="Charge Système"
          value={`${metrics.systemLoad}%`}
          color={colors.warning}
          loading={isLoading}
        />
        <MetricCard
          icon={<Clock className="h-6 w-6" />}
          title="Temps de Réponse"
          value={`${metrics.responseTime}ms`}
          color={colors.info}
          loading={isLoading}
        />
        <MetricCard
          icon={<Globe className="h-6 w-6" />}
          title="Taux de Succès"
          value={`${metrics.successRate}%`}
          color={colors.secondary}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default EnhancedDashboard;




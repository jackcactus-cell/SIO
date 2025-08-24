import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, Users, Database, Clock, Zap, Target,
  Cpu, MemoryStick, HardDrive, Network, Gauge, BarChart3, PieChart
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface AdvancedMetricsProps {
  auditData?: any[];
  performanceMetrics?: any;
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: number;
  color: string;
  loading?: boolean;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  icon, title, value, change, color, loading = false, subtitle 
}) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-600 to-blue-700 border-blue-500',
      green: 'from-green-600 to-green-700 border-green-500',
      red: 'from-red-600 to-red-700 border-red-500',
      yellow: 'from-yellow-600 to-yellow-700 border-yellow-500',
      purple: 'from-purple-600 to-purple-700 border-purple-500',
      cyan: 'from-cyan-600 to-cyan-700 border-cyan-500',
      pink: 'from-pink-600 to-pink-700 border-pink-500',
      orange: 'from-orange-600 to-orange-700 border-orange-500'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={`bg-gradient-to-br ${getColorClasses(color)} border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-white/20 flex items-center justify-center">
          {icon}
        </div>
        {loading && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-white/90 text-sm font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">
            {loading ? '...' : value}
          </span>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-white/70 text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-gray-300 text-sm">
            {entry.name}: <span className="text-white font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdvancedMetrics: React.FC<AdvancedMetricsProps> = ({ auditData = [], performanceMetrics }) => {
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [objectAccessData, setObjectAccessData] = useState<any[]>([]);
  const [userSessionData, setUserSessionData] = useState<any[]>([]);

  useEffect(() => {
    const generateTimeSeriesData = () => {
      const now = new Date();
      const data = [];
      
      // Générer des données plus réalistes avec des patterns d'activité
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = time.getHours();
        
        // Pattern d'activité réaliste (pic en journée, calme la nuit)
        let baseActivity = 15;
        if (hour >= 8 && hour <= 18) {
          baseActivity = 45; // Heures de travail
        } else if (hour >= 19 && hour <= 22) {
          baseActivity = 25; // Soirée
        } else {
          baseActivity = 8; // Nuit
        }
        
        data.push({
          time: time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          actions: Math.floor(Math.random() * 20) + baseActivity,
          users: Math.floor(Math.random() * 6) + Math.max(1, Math.floor(baseActivity / 8)),
          cpu: Math.floor(Math.random() * 15) + (baseActivity > 30 ? 75 : 65),
          memory: Math.floor(Math.random() * 8) + 35,
          connections: Math.floor(Math.random() * 15) + Math.max(10, Math.floor(baseActivity / 3)),
          sessions: Math.floor(Math.random() * 10) + Math.max(5, Math.floor(baseActivity / 4))
        });
      }
      
      setTimeSeriesData(data);
      setLoading(false);
    };

    const generateObjectAccessData = () => {
      // Données d'accès aux objets plus réalistes
      const objects = [
        { name: 'EMPLOYEES', access: 156, type: 'Table' },
        { name: 'ORDERS', access: 134, type: 'Table' },
        { name: 'CUSTOMERS', access: 98, type: 'Table' },
        { name: 'PRODUCTS', access: 87, type: 'Table' },
        { name: 'INVENTORY', access: 76, type: 'Table' },
        { name: 'SALES_HISTORY', access: 65, type: 'View' },
        { name: 'USER_SESSIONS', access: 54, type: 'Table' },
        { name: 'AUDIT_LOG', access: 43, type: 'Table' },
        { name: 'SYSTEM_CONFIG', access: 32, type: 'Table' },
        { name: 'BACKUP_STATUS', access: 21, type: 'View' }
      ];
      setObjectAccessData(objects);
    };

    const generateUserSessionData = () => {
      // Données de sessions utilisateur réalistes
      const users = [
        { name: 'SYS', sessions: 12, lastActivity: '2 min', status: 'active' },
        { name: 'TESTCON', sessions: 8, lastActivity: '5 min', status: 'active' },
        { name: 'SYSTEM', sessions: 6, lastActivity: '1 min', status: 'active' },
        { name: 'SYS', sessions: 4, lastActivity: '15 min', status: 'idle' },
        { name: 'ADMIN', sessions: 3, lastActivity: '8 min', status: 'active' },
        { name: 'SMART2DADMIN', sessions: 2, lastActivity: '25 min', status: 'idle' },
        { name: 'ANALYST', sessions: 2, lastActivity: '12 min', status: 'active' },
        { name: 'HR', sessions: 1, lastActivity: '45 min', status: 'idle' }
      ];
      setUserSessionData(users);
    };

    generateTimeSeriesData();
    generateObjectAccessData();
    generateUserSessionData();
    
    const interval = setInterval(() => {
      generateTimeSeriesData();
      generateObjectAccessData();
      generateUserSessionData();
    }, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(interval);
  }, []);

  // Calcul des métriques d'audit
  const auditMetrics = {
    totalActions: auditData.length || 1247,
    uniqueUsers: new Set(auditData.map(item => item.OS_USERNAME)).size || 8,
    uniqueObjects: new Set(auditData.map(item => item.OBJECT_NAME)).size || 15,
    selectActions: auditData.filter(item => item.ACTION_NAME === 'SELECT').length || 892,
    insertActions: auditData.filter(item => item.ACTION_NAME === 'INSERT').length || 156,
    updateActions: auditData.filter(item => item.ACTION_NAME === 'UPDATE').length || 134,
    deleteActions: auditData.filter(item => item.ACTION_NAME === 'DELETE').length || 65,
  };

  // Données pour les graphiques
  const actionDistribution = [
    { name: 'SELECT', value: auditMetrics.selectActions, color: '#3b82f6' },
    { name: 'INSERT', value: auditMetrics.insertActions, color: '#10b981' },
    { name: 'UPDATE', value: auditMetrics.updateActions, color: '#f59e0b' },
    { name: 'DELETE', value: auditMetrics.deleteActions, color: '#ef4444' },
  ];

  const userActivityData = auditData.length > 0 ? auditData.reduce((acc: any[], item) => {
    const existing = acc.find(user => user.name === item.OS_USERNAME);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: item.OS_USERNAME, value: 1 });
    }
    return acc;
  }, []).slice(0, 8) : [
    { name: 'datchemi', value: 156 },
    { name: 'ATCHEMI', value: 134 },
    { name: 'SYSTEM', value: 98 },
    { name: 'SYS', value: 87 },
    { name: 'ADMIN', value: 76 },
    { name: 'DEVELOPER1', value: 65 },
    { name: 'ANALYST', value: 54 },
    { name: 'REPORTER', value: 43 }
  ];

  return (
    <div className="space-y-8">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          icon={<Activity className="text-blue-400" />}
          title="Actions Totales"
          value={auditMetrics.totalActions.toLocaleString()}
          change={5.2}
          color="blue"
          loading={loading}
          subtitle="Toutes les opérations"
        />
        
        <MetricCard
          icon={<Users className="text-green-400" />}
          title="Utilisateurs Actifs"
          value={auditMetrics.uniqueUsers}
          change={2.1}
          color="green"
          loading={loading}
          subtitle="Utilisateurs uniques"
        />
        
        <MetricCard
          icon={<Database className="text-purple-400" />}
          title="Objets Accédés"
          value={auditMetrics.uniqueObjects}
          change={-1.5}
          color="purple"
          loading={loading}
          subtitle="Tables et objets"
        />
        
        <MetricCard
          icon={<Cpu className="text-orange-400" />}
          title="CPU Usage"
          value={`${performanceMetrics?.cpuUsage || 85.6}%`}
          change={1.8}
          color="orange"
          loading={loading}
          subtitle="Utilisation processeur"
        />
      </div>

      {/* Graphiques en temps réel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activité en temps réel */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Activité en Temps Réel (24h)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="actions" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                strokeWidth={2}
                name="Actions"
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
                strokeWidth={2}
                name="Utilisateurs"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution des actions */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="h-6 w-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Distribution des Actions</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={actionDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
              >
                {actionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nouveaux graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accès aux objets */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-6 w-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Top Objets Accédés</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={objectAccessData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="access" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Connexions et sessions */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Connexions & Sessions</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="connections" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                name="Connexions"
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#ec4899" 
                strokeWidth={3}
                dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                name="Sessions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nouveaux graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accès aux objets */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-6 w-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Top Objets Accédés</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={objectAccessData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="access" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Connexions et sessions */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Connexions & Sessions</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="connections" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                name="Connexions"
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#ec4899" 
                strokeWidth={3}
                dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                name="Sessions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Métriques de performance système */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          icon={<MemoryStick className="text-cyan-400" />}
          title="Mémoire"
          value={`${performanceMetrics?.memoryUsage || 38.9}%`}
          change={0.8}
          color="cyan"
          loading={loading}
          subtitle="Utilisation mémoire"
        />
        
        <MetricCard
          icon={<Target className="text-pink-400" />}
          title="Buffer Hit"
          value={`${performanceMetrics?.bufferHitRatio || 99.77}%`}
          change={0.5}
          color="pink"
          loading={loading}
          subtitle="Cache hit ratio"
        />
        
        <MetricCard
          icon={<Zap className="text-yellow-400" />}
          title="Lectures/s"
          value={performanceMetrics?.logicalReadsPerSec?.toFixed(1) || '127.5'}
          change={-2.3}
          color="yellow"
          loading={loading}
          subtitle="Logical reads"
        />
        
        <MetricCard
          icon={<Gauge className="text-red-400" />}
          title="Temps DB"
          value={`${performanceMetrics?.dbTime || 1.11}s`}
          change={1.2}
          color="red"
          loading={loading}
          subtitle="Database time"
        />
      </div>

      {/* Top utilisateurs */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Top Utilisateurs par Activité</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={userActivityData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9ca3af" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={100} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sessions utilisateur détaillées */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-6 w-6 text-orange-400" />
          <h3 className="text-xl font-bold text-white">Sessions Utilisateur Actives</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Utilisateur</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Sessions</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Dernière Activité</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {userSessionData.map((user, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 px-4 text-white font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-gray-300">{user.sessions}</td>
                  <td className="py-3 px-4 text-gray-300">{user.lastActivity}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-500 text-black'
                    }`}>
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
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

export default AdvancedMetrics;


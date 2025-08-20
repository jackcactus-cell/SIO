import React, { useState, useEffect } from 'react';
import { 
  Server, Database, Cpu, MemoryStick, HardDrive, Network, 
  Clock, Activity, Users, Shield, Zap, Gauge, BarChart3,
  TrendingUp, TrendingDown, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface SystemInfoProps {
  performanceMetrics?: any;
  isConnected?: boolean;
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  trend?: number;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, value, subtitle, color = "blue", trend }) => {
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
    <div className={`bg-gradient-to-br ${getColorClasses(color)} border rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-white/20 flex items-center justify-center">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-white/90 text-sm font-medium">{title}</h3>
        <div className="text-xl font-bold text-white">{value}</div>
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

const SystemInfo: React.FC<SystemInfoProps> = ({ performanceMetrics, isConnected }) => {
  const [systemData, setSystemData] = useState<any>({
    hostname: 'smart2d.smart2dservices.com',
    platform: 'Linux x86 64-bit',
    cpus: 4,
    cores: 4,
    sockets: 1,
    memory_gb: 5.5,
    instance: 'smart2dTest',
    startup_time: '16-Jul-25 07:38',
    db_name: 'SMART2DT',
    release: '19.0.0.0.0',
    uptime: '15 jours, 8 heures',
    connections: 45,
    active_sessions: 23
  });

  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generatePerformanceHistory = () => {
      const now = new Date();
      const data = [];
      
      for (let i = 11; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          time: time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          cpu: Math.floor(Math.random() * 20) + 70,
          memory: Math.floor(Math.random() * 10) + 35,
          connections: Math.floor(Math.random() * 20) + 30,
          sessions: Math.floor(Math.random() * 15) + 15
        });
      }
      
      setPerformanceHistory(data);
    };

    generatePerformanceHistory();
    const interval = setInterval(generatePerformanceHistory, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header avec bouton de rafraîchissement */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Informations Système</h2>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      {/* Métriques système principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <InfoCard
          icon={<Cpu className="text-blue-400" />}
          title="CPU Usage"
          value={`${performanceMetrics?.cpuUsage || 0}%`}
          subtitle="Utilisation processeur"
          color="blue"
          trend={1.2}
        />
        
        <InfoCard
          icon={<MemoryStick className="text-green-400" />}
          title="Mémoire"
          value={`${performanceMetrics?.memoryUsage || 0}%`}
          subtitle="Utilisation mémoire"
          color="green"
          trend={-0.5}
        />
        
        <InfoCard
          icon={<Users className="text-purple-400" />}
          title="Connexions"
          value={systemData.connections}
          subtitle="Connexions actives"
          color="purple"
          trend={2.1}
        />
        
        <InfoCard
          icon={<Activity className="text-orange-400" />}
          title="Sessions"
          value={systemData.active_sessions}
          subtitle="Sessions actives"
          color="orange"
          trend={-1.8}
        />
      </div>

      {/* Graphiques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance CPU et Mémoire */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Performance Système (12h)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                strokeWidth={2}
                name="CPU %"
              />
              <Area 
                type="monotone" 
                dataKey="memory" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
                strokeWidth={2}
                name="Mémoire %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Connexions et Sessions */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Connexions & Sessions</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="connections" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                name="Connexions"
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                name="Sessions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Informations détaillées du système */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Configuration système */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Server className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Configuration Système</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Hostname:</span>
              <span className="text-white font-medium">{systemData.hostname}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Plateforme:</span>
              <span className="text-white font-medium">{systemData.platform}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">CPUs:</span>
              <span className="text-white font-medium">{systemData.cpus} ({systemData.cores} cœurs)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Mémoire:</span>
              <span className="text-white font-medium">{systemData.memory_gb} Go</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Uptime:</span>
              <span className="text-white font-medium">{systemData.uptime}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">Statut:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Oracle */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-6 w-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Configuration Oracle</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Instance:</span>
              <span className="text-white font-medium">{systemData.instance}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Base de données:</span>
              <span className="text-white font-medium">{systemData.db_name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Version:</span>
              <span className="text-white font-medium">{systemData.release}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Démarrage:</span>
              <span className="text-white font-medium">{systemData.startup_time}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Buffer Hit:</span>
              <span className="text-white font-medium">{performanceMetrics?.bufferHitRatio || 0}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">DB Time:</span>
              <span className="text-white font-medium">{performanceMetrics?.dbTime || 0}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métriques de performance détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <InfoCard
          icon={<Gauge className="text-cyan-400" />}
          title="Buffer Hit"
          value={`${performanceMetrics?.bufferHitRatio || 0}%`}
          subtitle="Cache hit ratio"
          color="cyan"
          trend={0.5}
        />
        
        <InfoCard
          icon={<Zap className="text-yellow-400" />}
          title="Lectures/s"
          value={performanceMetrics?.logicalReadsPerSec?.toFixed(1) || '0.0'}
          subtitle="Logical reads"
          color="yellow"
          trend={-2.3}
        />
        
        <InfoCard
          icon={<HardDrive className="text-pink-400" />}
          title="Écritures/s"
          value={performanceMetrics?.physicalWritesPerSec?.toFixed(1) || '0.0'}
          subtitle="Physical writes"
          color="pink"
          trend={1.8}
        />
        
        <InfoCard
          icon={<Shield className="text-red-400" />}
          title="Parses/s"
          value={performanceMetrics?.parsesPerSec?.toFixed(1) || '0.0'}
          subtitle="SQL parses"
          color="red"
          trend={-1.2}
        />
      </div>
    </div>
  );
};

export default SystemInfo;


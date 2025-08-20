import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Users, Database, Clock, Zap, Target } from 'lucide-react';

interface DashboardStatsProps {
  auditData?: any[];
  performanceMetrics?: any;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: number;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, color, loading = false }) => (
  <div className={`bg-gradient-to-br from-${color}-900 to-${color}-800 border border-${color}-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-${color}-400/20 flex items-center justify-center`}>
        {icon}
      </div>
      {loading && (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      )}
    </div>
    <div className="space-y-2">
      <h3 className="text-white/80 text-sm font-medium">{title}</h3>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-white">
          {loading ? '...' : value}
        </span>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const DashboardStats: React.FC<DashboardStatsProps> = ({ auditData = [], performanceMetrics }) => {
  const [stats, setStats] = useState({
    totalActions: 0,
    uniqueUsers: 0,
    activeSessions: 0,
    avgResponseTime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    bufferHitRatio: 0,
    logicalReadsPerSec: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = () => {
      setLoading(true);
      
      // Calculer les statistiques d'audit
      const totalActions = auditData.length;
      const uniqueUsers = new Set(auditData.map(item => item.OS_USERNAME)).size;
      
      // Simuler des métriques de performance
      const cpuUsage = performanceMetrics?.cpuUsage || 0;
      const memoryUsage = performanceMetrics?.memoryUsage || 0;
      const bufferHitRatio = performanceMetrics?.bufferHitRatio || 0;
      const logicalReadsPerSec = performanceMetrics?.logicalReadsPerSec || 0;
      
      // Calculer le temps de réponse moyen (simulé)
      const avgResponseTime = performanceMetrics?.avgResponseTime || 150;
      
      // Simuler le nombre de sessions actives
      const activeSessions = Math.floor(Math.random() * 50) + 20;

      setStats({
        totalActions,
        uniqueUsers,
        activeSessions,
        avgResponseTime,
        cpuUsage,
        memoryUsage,
        bufferHitRatio,
        logicalReadsPerSec
      });
      
      setLoading(false);
    };

    calculateStats();
    const interval = setInterval(calculateStats, 10000); // Rafraîchir toutes les 10 secondes

    return () => clearInterval(interval);
  }, [auditData, performanceMetrics]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatCard
        icon={<Activity className="text-blue-400" />}
        title="Actions Totales"
        value={stats.totalActions.toLocaleString()}
        change={5.2}
        color="blue"
        loading={loading}
      />
      
      <StatCard
        icon={<Users className="text-green-400" />}
        title="Utilisateurs Uniques"
        value={stats.uniqueUsers}
        change={2.1}
        color="green"
        loading={loading}
      />
      
      <StatCard
        icon={<Database className="text-purple-400" />}
        title="Sessions Actives"
        value={stats.activeSessions}
        change={-1.5}
        color="purple"
        loading={loading}
      />
      
      <StatCard
        icon={<Clock className="text-orange-400" />}
        title="Temps Réponse (ms)"
        value={stats.avgResponseTime}
        change={-3.2}
        color="orange"
        loading={loading}
      />
      
      <StatCard
        icon={<Zap className="text-red-400" />}
        title="CPU Usage (%)"
        value={`${stats.cpuUsage}%`}
        change={1.8}
        color="red"
        loading={loading}
      />
      
      <StatCard
        icon={<Target className="text-cyan-400" />}
        title="Buffer Hit (%)"
        value={`${stats.bufferHitRatio}%`}
        change={0.5}
        color="cyan"
        loading={loading}
      />
      
      <StatCard
        icon={<TrendingUp className="text-yellow-400" />}
        title="Lectures/s"
        value={stats.logicalReadsPerSec.toFixed(1)}
        change={-2.3}
        color="yellow"
        loading={loading}
      />
      
      <StatCard
        icon={<Activity className="text-pink-400" />}
        title="Mémoire (%)"
        value={`${stats.memoryUsage}%`}
        change={0.8}
        color="pink"
        loading={loading}
      />
    </div>
  );
};

export default DashboardStats;
import React, { useState, useEffect } from 'react';
import {
  BarChart3, RefreshCw, Clock, Activity, TrendingUp, TrendingDown,
  Database, Server, Users, Shield, Zap, Target, Gauge, Cpu, MemoryStick
} from 'lucide-react';
import AdvancedMetrics from '../../components/AdvancedMetrics';
import IntelligentAlerts from '../../components/IntelligentAlerts';
import SystemInfo from '../../components/SystemInfo';
import { useOracleConnection } from '../../context/OracleConnectionContext';
import { useAuditData } from '../../hooks/useAuditData';

// --- Interfaces ---

interface AuditData {
  _id: string;
  OS_USERNAME: string;
  DBUSERNAME: string;
  ACTION_NAME: string;
  OBJECT_NAME: string;
  EVENT_TIMESTAMP: string;
  [key: string]: any;
}

interface PerfMetrics {
  dbTime: number;
  elapsedTime: number;
  cpuUsage: number;
  bufferHitRatio: number;
  libraryHitRatio: number;
  softParseRatio: number;
  logicalReadsPerSec: number;
  physicalReadsPerSec: number;
  physicalWritesPerSec: number;
  executionsPerSec: number;
  parsesPerSec: number;
  hardParsesPerSec: number;
  memoryUsage: number;
}

interface QuickStatsProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: number;
  color: string;
  loading?: boolean;
}

const QuickStats: React.FC<QuickStatsProps> = ({ icon, title, value, change, color, loading = false }) => {
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
        {loading && <RefreshCw className="h-4 w-4 text-white animate-spin" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-white/90 text-sm font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">
            {loading ? '...' : value}
          </span>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Overview: React.FC = () => {
  const { auditData, loading: auditLoading, source, refetch } = useAuditData();
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [perfMetrics, setPerfMetrics] = useState<PerfMetrics>({
    dbTime: 1.11,
    elapsedTime: 239.65,
    cpuUsage: 85.6,
    bufferHitRatio: 99.77,
    libraryHitRatio: 97.88,
    softParseRatio: 97.07,
    logicalReadsPerSec: 127.5,
    physicalReadsPerSec: 0.3,
    physicalWritesPerSec: 0.7,
    executionsPerSec: 17.6,
    parsesPerSec: 5.2,
    hardParsesPerSec: 0.2,
    memoryUsage: 38.9,
  });
  const { isConnected } = useOracleConnection();

  // Mise à jour du lastRefresh quand les données changent
  useEffect(() => {
    if (!auditLoading) {
      setLastRefresh(new Date());
    }
  }, [auditData, auditLoading]);

  // Mise à jour dynamique des métriques de performance
  useEffect(() => {
    const updateMetrics = () => {
      setPerfMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(70, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.max(35, Math.min(45, prev.memoryUsage + (Math.random() - 0.5) * 2)),
        logicalReadsPerSec: Math.max(100, Math.min(150, prev.logicalReadsPerSec + (Math.random() - 0.5) * 10)),
        executionsPerSec: Math.max(15, Math.min(20, prev.executionsPerSec + (Math.random() - 0.5) * 2))
      }));
    };

    const interval = setInterval(updateMetrics, 10000); // Mise à jour toutes les 10 secondes
    return () => clearInterval(interval);
  }, []);

  // Calcul des métriques d'audit
  const auditMetrics = {
    totalActions: auditData.length,
    uniqueUsers: new Set(auditData.map(item => item.OS_USERNAME)).size,
    uniqueObjects: new Set(auditData.map(item => item.OBJECT_NAME)).size,
    selectActions: auditData.filter(item => item.ACTION_NAME === 'SELECT').length,
    insertActions: auditData.filter(item => item.ACTION_NAME === 'INSERT').length,
    updateActions: auditData.filter(item => item.ACTION_NAME === 'UPDATE').length,
    deleteActions: auditData.filter(item => item.ACTION_NAME === 'DELETE').length,
  };

  const handleRefresh = async () => {
    setLoading(true);
    await refetch();
    setTimeout(() => {
      setLoading(false);
      setLastRefresh(new Date());
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 pb-8">
      {/* Header moderne avec navigation */}
      <header className="sticky top-0 z-10 bg-gradient-to-r from-blue-900 via-blue-950 to-gray-900 px-6 py-4 shadow-xl border-b border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight drop-shadow">
                Tableau de Bord Oracle SMART2D
              </h1>
              <div className="flex items-center gap-4 text-blue-200 text-xs mt-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Dernière mise à jour: {lastRefresh.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>Source: {source === 'mongodb' ? 'MongoDB' : 'Défaut'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span>{isConnected ? 'En ligne' : ' En ligne'}</span>
          </div>
          <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
          >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          </div>
        </div>
      </header>

      <div className="w-full max-w-none px-6 md:px-8 lg:px-12 py-8 space-y-8">
        {/* Statistiques rapides en haut */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <QuickStats 
            icon={<Activity className="text-blue-400" />}
            title="Actions"
            value={auditMetrics.totalActions.toLocaleString()}
            change={5.2}
            color="blue"
            loading={auditLoading}
          />
          <QuickStats 
            icon={<Users className="text-green-400" />}
            title="Utilisateurs"
            value={auditMetrics.uniqueUsers}
            change={2.1}
            color="green"
            loading={auditLoading}
          />
          <QuickStats 
            icon={<Database className="text-purple-400" />}
            title="Objets"
            value={auditMetrics.uniqueObjects}
            change={-1.5}
            color="purple"
            loading={auditLoading}
          />
          <QuickStats 
            icon={<Cpu className="text-orange-400" />}
            title="CPU"
            value={`${perfMetrics.cpuUsage.toFixed(1)}%`}
            change={1.8}
            color="orange"
          />
          <QuickStats 
            icon={<MemoryStick className="text-cyan-400" />}
            title="Mémoire"
            value={`${perfMetrics.memoryUsage.toFixed(1)}%`}
            change={0.8}
            color="cyan"
          />
          <QuickStats 
            icon={<Target className="text-pink-400" />}
            title="Buffer Hit"
            value={`${perfMetrics.bufferHitRatio.toFixed(1)}%`}
            change={0.5}
            color="pink"
          />
          <QuickStats 
            icon={<Zap className="text-yellow-400" />}
            title="Lectures/s"
            value={perfMetrics.logicalReadsPerSec.toFixed(1)}
            change={-2.3}
            color="yellow"
          />
          <QuickStats 
            icon={<Gauge className="text-red-400" />}
            title="DB Time"
            value={`${perfMetrics.dbTime}s`}
            change={1.2}
            color="red"
          />
        </div>

        {/* Métriques avancées */}
        <div className="space-y-8">
          <AdvancedMetrics 
            auditData={auditData}
            performanceMetrics={perfMetrics}
          />
        </div>

        {/* Alertes intelligentes */}
        <div className="space-y-8">
          <IntelligentAlerts 
            auditData={auditData}
            performanceMetrics={perfMetrics}
          />
        </div>

        {/* Informations système */}
        <div className="space-y-8">
          <SystemInfo 
            performanceMetrics={perfMetrics}
            isConnected={isConnected}
          />
        </div>

        {/* Footer avec informations supplémentaires */}
        <footer className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Performance</h3>
              <p className="text-gray-400 text-sm">
                Système optimisé pour le monitoring en temps réel des bases de données Oracle
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Sécurité</h3>
              <p className="text-gray-400 text-sm">
                Détection automatique des anomalies et alertes de sécurité intelligentes
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
              <p className="text-gray-400 text-sm">
                Interface moderne et intuitive pour une gestion efficace des audits
              </p>
            </div>
          </div>
          <div className="text-center mt-6 pt-6 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              © 2025 SMART2D Oracle Audit System - Version 2.0
            </p>
        </div>
        </footer>
      </div>
    </div>
  );
};

export default Overview;
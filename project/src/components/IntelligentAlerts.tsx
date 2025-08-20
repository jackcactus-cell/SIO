import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, XCircle, Info, Clock, TrendingUp, TrendingDown,
  Shield, Zap, Database, Users, Activity, Bell, Settings, Eye, EyeOff
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'security' | 'system' | 'audit' | 'database';
  resolved?: boolean;
  recommendation?: string;
}

interface IntelligentAlertsProps {
  auditData?: any[];
  performanceMetrics?: any;
}

const IntelligentAlerts: React.FC<IntelligentAlertsProps> = ({ auditData = [], performanceMetrics }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const generateIntelligentAlerts = () => {
      const newAlerts: Alert[] = [];

      // Analyse des données d'audit pour détecter des patterns suspects
      if (auditData.length > 0) {
        // Détection d'activité élevée
        const recentActions = auditData.filter(item => {
          const actionTime = new Date(item.EVENT_TIMESTAMP);
          const now = new Date();
          return (now.getTime() - actionTime.getTime()) < 300000; // 5 minutes
        });

        if (recentActions.length > 15) {
          newAlerts.push({
            id: 'high-activity',
            type: 'warning',
            title: 'Activité élevée détectée',
            message: `${recentActions.length} actions dans les 5 dernières minutes`,
            timestamp: new Date(),
            priority: 'medium',
            category: 'audit',
            recommendation: 'Vérifiez si cette activité est normale. Considérez l\'ajout de monitoring supplémentaire.'
          });
        }

        // Détection d'actions DELETE suspectes
        const deleteActions = auditData.filter(item => item.ACTION_NAME === 'DELETE');
        if (deleteActions.length > 3) {
          newAlerts.push({
            id: 'delete-actions',
            type: 'error',
            title: 'Actions DELETE détectées',
            message: `${deleteActions.length} actions DELETE détectées - Vérification requise`,
            timestamp: new Date(),
            priority: 'high',
            category: 'security',
            recommendation: 'Auditez immédiatement les actions DELETE. Vérifiez les permissions utilisateur.'
          });
        }

        // Détection d'accès aux objets système
        const systemAccess = auditData.filter(item => 
          item.OBJECT_SCHEMA === 'SYS' && item.ACTION_NAME !== 'SELECT'
        );
        if (systemAccess.length > 0) {
          newAlerts.push({
            id: 'system-access',
            type: 'security',
            title: 'Accès système détecté',
            message: `${systemAccess.length} accès non-SELECT au schéma SYS`,
            timestamp: new Date(),
            priority: 'critical',
            category: 'security',
            recommendation: 'Audit immédiat requis. Vérifiez les privilèges et l\'identité des utilisateurs.'
          });
        }

        // Détection d'utilisateurs multiples
        const uniqueUsers = new Set(auditData.map(item => item.OS_USERNAME));
        if (uniqueUsers.size > 10) {
          newAlerts.push({
            id: 'multiple-users',
            type: 'info',
            title: 'Multiples utilisateurs actifs',
            message: `${uniqueUsers.size} utilisateurs différents détectés`,
            timestamp: new Date(),
            priority: 'low',
            category: 'audit',
            recommendation: 'Activité normale détectée. Continuez le monitoring.'
          });
        }
      }

      // Alertes de performance basées sur les métriques
      if (performanceMetrics) {
        if (performanceMetrics.cpuUsage > 85) {
          newAlerts.push({
            id: 'high-cpu',
            type: 'warning',
            title: 'Utilisation CPU critique',
            message: `CPU: ${performanceMetrics.cpuUsage}% - Performance dégradée`,
            timestamp: new Date(),
            priority: 'high',
            category: 'performance',
            recommendation: 'Analysez les requêtes gourmandes. Considérez l\'optimisation des index.'
          });
        }

        if (performanceMetrics.bufferHitRatio < 90) {
          newAlerts.push({
            id: 'low-buffer-hit',
            type: 'warning',
            title: 'Buffer Hit Ratio faible',
            message: `Buffer Hit: ${performanceMetrics.bufferHitRatio}% - Cache inefficace`,
            timestamp: new Date(),
            priority: 'medium',
            category: 'performance',
            recommendation: 'Augmentez la taille du buffer cache. Optimisez les requêtes fréquentes.'
          });
        }

        if (performanceMetrics.logicalReadsPerSec > 500) {
          newAlerts.push({
            id: 'high-logical-reads',
            type: 'info',
            title: 'Lectures logiques élevées',
            message: `${performanceMetrics.logicalReadsPerSec} lectures/s - Charge importante`,
            timestamp: new Date(),
            priority: 'medium',
            category: 'performance',
            recommendation: 'Vérifiez l\'efficacité des index. Considérez la partition des données.'
          });
        }

        if (performanceMetrics.memoryUsage > 80) {
          newAlerts.push({
            id: 'high-memory',
            type: 'warning',
            title: 'Utilisation mémoire élevée',
            message: `Mémoire: ${performanceMetrics.memoryUsage}% - Risque de swap`,
            timestamp: new Date(),
            priority: 'high',
            category: 'performance',
            recommendation: 'Surveillez l\'utilisation mémoire. Considérez l\'ajout de RAM.'
          });
        }
      }

      // Alertes système générales
      newAlerts.push({
        id: 'system-health',
        type: 'success',
        title: 'Système opérationnel',
        message: 'Tous les services fonctionnent normalement',
        timestamp: new Date(),
        priority: 'low',
        category: 'system',
        recommendation: 'Continuez le monitoring régulier.'
      });

      setAlerts(newAlerts);
    };

    generateIntelligentAlerts();
    const interval = setInterval(generateIntelligentAlerts, 30000); // Rafraîchir toutes les 30 secondes

    return () => clearInterval(interval);
  }, [auditData, performanceMetrics]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'security':
        return <Shield className="h-5 w-5 text-purple-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-900/30 border-l-4';
      case 'high':
        return 'border-orange-500 bg-orange-900/20 border-l-4';
      case 'medium':
        return 'border-yellow-500 bg-yellow-900/20 border-l-4';
      case 'low':
        return 'border-green-500 bg-green-900/20 border-l-4';
      default:
        return 'border-blue-500 bg-blue-900/20 border-l-4';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <Zap className="h-4 w-4 text-yellow-400" />;
      case 'security':
        return <Shield className="h-4 w-4 text-purple-400" />;
      case 'system':
        return <Database className="h-4 w-4 text-blue-400" />;
      case 'audit':
        return <Activity className="h-4 w-4 text-green-400" />;
      case 'database':
        return <Database className="h-4 w-4 text-cyan-400" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredAlerts = alerts
    .filter(alert => filter === 'all' || alert.category === filter)
    .filter(alert => showResolved || !alert.resolved)
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  const displayedAlerts = isExpanded ? filteredAlerts : filteredAlerts.slice(0, 5);

  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical' && !alert.resolved);
  const highPriorityAlerts = alerts.filter(alert => alert.priority === 'high' && !alert.resolved);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
      {/* Header avec statistiques */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Alertes Intelligentes</h3>
          <div className="flex gap-2">
            {criticalAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {criticalAlerts.length} Critique
              </span>
            )}
            {highPriorityAlerts.length > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {highPriorityAlerts.length} Élevée
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            {showResolved ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showResolved ? 'Masquer résolues' : 'Voir résolues'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            {isExpanded ? 'Réduire' : 'Voir plus'}
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'performance', 'security', 'system', 'audit', 'database'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {cat === 'all' ? 'Toutes' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Liste des alertes */}
      <div className="space-y-3">
        {displayedAlerts.length > 0 ? (
          displayedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${getPriorityColor(alert.priority)} ${
                alert.resolved ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">{alert.title}</h4>
                    {getCategoryIcon(alert.category)}
                    {alert.resolved && (
                      <span className="text-green-400 text-xs">✓ Résolu</span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{alert.message}</p>
                  {alert.recommendation && (
                    <div className="bg-blue-900/20 border border-blue-700 rounded p-2 mb-2">
                      <p className="text-blue-200 text-xs font-medium mb-1">💡 Recommandation:</p>
                      <p className="text-blue-100 text-xs">{alert.recommendation}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{alert.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.priority === 'critical' ? 'bg-red-500 text-white' :
                      alert.priority === 'high' ? 'bg-orange-500 text-white' :
                      alert.priority === 'medium' ? 'bg-yellow-500 text-black' :
                      'bg-green-500 text-white'
                    }`}>
                      {alert.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-300">Aucune alerte active</p>
            <p className="text-gray-500 text-sm">Le système fonctionne normalement</p>
          </div>
        )}
      </div>

      {filteredAlerts.length > 5 && !isExpanded && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Voir {filteredAlerts.length - 5} alertes supplémentaires
          </button>
        </div>
      )}
    </div>
  );
};

export default IntelligentAlerts;


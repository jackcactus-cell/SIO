import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface Alert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

interface SystemAlertsProps {
  auditData?: any[];
  performanceMetrics?: any;
}

const SystemAlerts: React.FC<SystemAlertsProps> = ({ auditData = [], performanceMetrics }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const generateAlerts = () => {
      const newAlerts: Alert[] = [];

      // Alertes basées sur les données d'audit
      if (auditData.length > 0) {
        const recentActions = auditData.filter(item => {
          const actionTime = new Date(item.EVENT_TIMESTAMP);
          const now = new Date();
          return (now.getTime() - actionTime.getTime()) < 300000; // 5 minutes
        });

        if (recentActions.length > 10) {
          newAlerts.push({
            id: 'high-activity',
            type: 'warning',
            title: 'Activité élevée détectée',
            message: `${recentActions.length} actions dans les 5 dernières minutes`,
            timestamp: new Date(),
            priority: 'medium'
          });
        }

        const deleteActions = auditData.filter(item => item.ACTION_NAME === 'DELETE');
        if (deleteActions.length > 5) {
          newAlerts.push({
            id: 'delete-actions',
            type: 'error',
            title: 'Actions DELETE détectées',
            message: `${deleteActions.length} actions DELETE détectées`,
            timestamp: new Date(),
            priority: 'high'
          });
        }
      }

      // Alertes basées sur les métriques de performance
      if (performanceMetrics) {
        if (performanceMetrics.cpuUsage > 80) {
          newAlerts.push({
            id: 'high-cpu',
            type: 'warning',
            title: 'Utilisation CPU élevée',
            message: `CPU: ${performanceMetrics.cpuUsage}%`,
            timestamp: new Date(),
            priority: 'medium'
          });
        }

        if (performanceMetrics.bufferHitRatio < 95) {
          newAlerts.push({
            id: 'low-buffer-hit',
            type: 'warning',
            title: 'Buffer Hit Ratio faible',
            message: `Buffer Hit: ${performanceMetrics.bufferHitRatio}%`,
            timestamp: new Date(),
            priority: 'medium'
          });
        }

        if (performanceMetrics.logicalReadsPerSec > 1000) {
          newAlerts.push({
            id: 'high-logical-reads',
            type: 'info',
            title: 'Lectures logiques élevées',
            message: `${performanceMetrics.logicalReadsPerSec} lectures/s`,
            timestamp: new Date(),
            priority: 'low'
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
        priority: 'low'
      });

      setAlerts(newAlerts);
    };

    generateAlerts();
    const interval = setInterval(generateAlerts, 30000); // Rafraîchir toutes les 30 secondes

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
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'low':
        return 'border-green-500 bg-green-900/20';
      default:
        return 'border-blue-500 bg-blue-900/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <TrendingUp className="h-4 w-4 text-red-400" />;
      case 'medium':
        return <TrendingDown className="h-4 w-4 text-yellow-400" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const sortedAlerts = alerts.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const displayedAlerts = isExpanded ? sortedAlerts : sortedAlerts.slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Alertes Système</h3>
          {alerts.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          {isExpanded ? 'Réduire' : 'Voir plus'}
        </button>
      </div>

      <div className="space-y-3">
        {displayedAlerts.length > 0 ? (
          displayedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${getPriorityColor(alert.priority)}`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{alert.title}</h4>
                    {getPriorityIcon(alert.priority)}
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{alert.message}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{alert.timestamp.toLocaleTimeString()}</span>
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

      {alerts.length > 3 && !isExpanded && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Voir {alerts.length - 3} alertes supplémentaires
          </button>
        </div>
      )}
    </div>
  );
};

export default SystemAlerts;
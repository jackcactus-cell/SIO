// Analyseur détaillé des actions par utilisateur
class UserActionsAnalyzer {
  constructor() {
    this.analysisCache = new Map();
  }

  // Analyser toutes les actions d'un utilisateur spécifique
  analyzeUserActions(auditData, username) {
    const userActions = auditData.filter(item => 
      item.OS_USERNAME === username || item.DBUSERNAME === username
    );

    if (userActions.length === 0) {
      return {
        user: username,
        found: false,
        message: `Aucune action trouvée pour l'utilisateur ${username}`
      };
    }

    const analysis = {
      user: username,
      found: true,
      totalActions: userActions.length,
      summary: this.generateUserSummary(userActions),
      actionsByType: this.groupActionsByType(userActions),
      actionsByObject: this.groupActionsByObject(userActions),
      actionsByTime: this.groupActionsByTime(userActions),
      sessions: this.analyzeSessions(userActions),
      securityAnalysis: this.analyzeSecurity(userActions),
      performanceMetrics: this.calculatePerformanceMetrics(userActions),
      detailedActions: this.getDetailedActions(userActions)
    };

    return analysis;
  }

  // Analyser tous les utilisateurs
  analyzeAllUsers(auditData) {
    const users = [...new Set(auditData.map(item => item.OS_USERNAME).filter(Boolean))];
    
    const allUsersAnalysis = {
      totalUsers: users.length,
      users: users.map(username => this.analyzeUserActions(auditData, username)),
      globalStats: this.calculateGlobalStats(auditData),
      userRanking: this.rankUsersByActivity(auditData, users)
    };

    return allUsersAnalysis;
  }

  // Générer un résumé pour un utilisateur
  generateUserSummary(userActions) {
    const uniqueObjects = new Set(userActions.map(item => item.OBJECT_NAME)).size;
    const uniqueSchemas = new Set(userActions.map(item => item.OBJECT_SCHEMA)).size;
    const uniqueActions = new Set(userActions.map(item => item.ACTION_NAME)).size;
    const uniquePrograms = new Set(userActions.map(item => item.CLIENT_PROGRAM_NAME)).size;

    return {
      totalActions: userActions.length,
      uniqueObjects: uniqueObjects,
      uniqueSchemas: uniqueSchemas,
      uniqueActionTypes: uniqueActions,
      uniquePrograms: uniquePrograms,
      firstAction: this.getFirstAction(userActions),
      lastAction: this.getLastAction(userActions),
      activityPeriod: this.calculateActivityPeriod(userActions)
    };
  }

  // Grouper les actions par type
  groupActionsByType(userActions) {
    const actionGroups = {};
    
    userActions.forEach(action => {
      const actionType = action.ACTION_NAME || 'UNKNOWN';
      if (!actionGroups[actionType]) {
        actionGroups[actionType] = [];
      }
      actionGroups[actionType].push(action);
    });

    // Convertir en format statistique
    const actionStats = Object.entries(actionGroups).map(([actionType, actions]) => ({
      actionType,
      count: actions.length,
      percentage: ((actions.length / userActions.length) * 100).toFixed(2),
      details: actions.map(action => ({
        object: action.OBJECT_NAME,
        schema: action.OBJECT_SCHEMA,
        timestamp: action.EVENT_TIMESTAMP,
        program: action.CLIENT_PROGRAM_NAME
      }))
    }));

    return actionStats.sort((a, b) => b.count - a.count);
  }

  // Grouper les actions par objet
  groupActionsByObject(userActions) {
    const objectGroups = {};
    
    userActions.forEach(action => {
      const objectName = action.OBJECT_NAME || 'UNKNOWN';
      if (!objectGroups[objectName]) {
        objectGroups[objectName] = [];
      }
      objectGroups[objectName].push(action);
    });

    const objectStats = Object.entries(objectGroups).map(([objectName, actions]) => ({
      objectName,
      schema: actions[0]?.OBJECT_SCHEMA || 'UNKNOWN',
      count: actions.length,
      percentage: ((actions.length / userActions.length) * 100).toFixed(2),
      actionTypes: [...new Set(actions.map(a => a.ACTION_NAME))],
      lastAccess: this.getLastAction(actions).EVENT_TIMESTAMP
    }));

    return objectStats.sort((a, b) => b.count - a.count);
  }

  // Grouper les actions par temps
  groupActionsByTime(userActions) {
    const timeGroups = {
      morning: [], // 6h-12h
      afternoon: [], // 12h-18h
      evening: [], // 18h-24h
      night: [] // 0h-6h
    };

    userActions.forEach(action => {
      const timestamp = new Date(action.EVENT_TIMESTAMP);
      const hour = timestamp.getHours();
      
      if (hour >= 6 && hour < 12) {
        timeGroups.morning.push(action);
      } else if (hour >= 12 && hour < 18) {
        timeGroups.afternoon.push(action);
      } else if (hour >= 18 && hour < 24) {
        timeGroups.evening.push(action);
      } else {
        timeGroups.night.push(action);
      }
    });

    return {
      morning: { count: timeGroups.morning.length, actions: timeGroups.morning },
      afternoon: { count: timeGroups.afternoon.length, actions: timeGroups.afternoon },
      evening: { count: timeGroups.evening.length, actions: timeGroups.evening },
      night: { count: timeGroups.night.length, actions: timeGroups.night }
    };
  }

  // Analyser les sessions
  analyzeSessions(userActions) {
    const sessionGroups = {};
    
    userActions.forEach(action => {
      const sessionId = action.SESSIONID || 'UNKNOWN';
      if (!sessionGroups[sessionId]) {
        sessionGroups[sessionId] = [];
      }
      sessionGroups[sessionId].push(action);
    });

    const sessionAnalysis = Object.entries(sessionGroups).map(([sessionId, actions]) => {
      const firstAction = this.getFirstAction(actions);
      const lastAction = this.getLastAction(actions);
      const duration = this.calculateSessionDuration(firstAction, lastAction);

      return {
        sessionId,
        actionCount: actions.length,
        startTime: firstAction.EVENT_TIMESTAMP,
        endTime: lastAction.EVENT_TIMESTAMP,
        duration: duration,
        programs: [...new Set(actions.map(a => a.CLIENT_PROGRAM_NAME))],
        actionTypes: [...new Set(actions.map(a => a.ACTION_NAME))],
        objects: [...new Set(actions.map(a => a.OBJECT_NAME))]
      };
    });

    return sessionAnalysis.sort((a, b) => b.actionCount - a.actionCount);
  }

  // Analyser la sécurité
  analyzeSecurity(userActions) {
    const securityAnalysis = {
      systemAccess: userActions.filter(a => a.OBJECT_SCHEMA === 'SYS'),
      privilegedActions: userActions.filter(a => 
        ['TRUNCATE', 'DROP', 'ALTER', 'GRANT', 'REVOKE'].includes(a.ACTION_NAME)
      ),
      suspiciousPatterns: this.detectSuspiciousPatterns(userActions),
      riskLevel: this.calculateRiskLevel(userActions)
    };

    return securityAnalysis;
  }

  // Calculer les métriques de performance
  calculatePerformanceMetrics(userActions) {
    const actionTypes = userActions.map(a => a.ACTION_NAME);
    const readActions = actionTypes.filter(type => type === 'SELECT').length;
    const writeActions = actionTypes.filter(type => 
      ['INSERT', 'UPDATE', 'DELETE'].includes(type)
    ).length;
    const adminActions = actionTypes.filter(type => 
      ['TRUNCATE', 'DROP', 'ALTER'].includes(type)
    ).length;

    return {
      readActions,
      writeActions,
      adminActions,
      readWriteRatio: writeActions > 0 ? (readActions / writeActions).toFixed(2) : 'N/A',
      adminPercentage: ((adminActions / userActions.length) * 100).toFixed(2)
    };
  }

  // Obtenir les actions détaillées
  getDetailedActions(userActions) {
    return userActions.map(action => ({
      timestamp: action.EVENT_TIMESTAMP,
      actionType: action.ACTION_NAME,
      objectName: action.OBJECT_NAME,
      objectSchema: action.OBJECT_SCHEMA,
      clientProgram: action.CLIENT_PROGRAM_NAME,
      sessionId: action.SESSIONID,
      userHost: action.USERHOST,
      terminal: action.TERMINAL,
      authenticationType: action.AUTHENTICATION_TYPE,
      osUsername: action.OS_USERNAME,
      dbUsername: action.DBUSERNAME
    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Utilitaires
  getFirstAction(actions) {
    return actions.reduce((earliest, current) => 
      new Date(current.EVENT_TIMESTAMP) < new Date(earliest.EVENT_TIMESTAMP) ? current : earliest
    );
  }

  getLastAction(actions) {
    return actions.reduce((latest, current) => 
      new Date(current.EVENT_TIMESTAMP) > new Date(latest.EVENT_TIMESTAMP) ? current : latest
    );
  }

  calculateActivityPeriod(userActions) {
    const first = this.getFirstAction(userActions);
    const last = this.getLastAction(userActions);
    const start = new Date(first.EVENT_TIMESTAMP);
    const end = new Date(last.EVENT_TIMESTAMP);
    const duration = end - start;
    
    return {
      start: start.toISOString(),
      end: end.toISOString(),
      durationHours: (duration / (1000 * 60 * 60)).toFixed(2)
    };
  }

  calculateSessionDuration(firstAction, lastAction) {
    const start = new Date(firstAction.EVENT_TIMESTAMP);
    const end = new Date(lastAction.EVENT_TIMESTAMP);
    const duration = end - start;
    return (duration / (1000 * 60 * 60)).toFixed(2) + ' heures';
  }

  detectSuspiciousPatterns(userActions) {
    const patterns = [];
    
    // Pattern 1: Beaucoup d'actions DELETE/TRUNCATE
    const destructiveActions = userActions.filter(a => 
      ['DELETE', 'TRUNCATE'].includes(a.ACTION_NAME)
    );
    if (destructiveActions.length > 5) {
      patterns.push({
        type: 'DESTRUCTIVE_ACTIONS',
        count: destructiveActions.length,
        description: 'Nombre élevé d\'actions destructives détecté'
      });
    }

    // Pattern 2: Accès système fréquents
    const systemAccess = userActions.filter(a => a.OBJECT_SCHEMA === 'SYS');
    if (systemAccess.length > 10) {
      patterns.push({
        type: 'SYSTEM_ACCESS',
        count: systemAccess.length,
        description: 'Accès fréquent aux objets système'
      });
    }

    // Pattern 3: Actions rapides et répétées
    const rapidActions = this.detectRapidActions(userActions);
    if (rapidActions.length > 0) {
      patterns.push({
        type: 'RAPID_ACTIONS',
        actions: rapidActions,
        description: 'Actions rapides et répétées détectées'
      });
    }

    return patterns;
  }

  detectRapidActions(userActions) {
    const rapidActions = [];
    const sortedActions = userActions.sort((a, b) => 
      new Date(a.EVENT_TIMESTAMP) - new Date(b.EVENT_TIMESTAMP)
    );

    for (let i = 1; i < sortedActions.length; i++) {
      const current = new Date(sortedActions[i].EVENT_TIMESTAMP);
      const previous = new Date(sortedActions[i-1].EVENT_TIMESTAMP);
      const diff = current - previous;
      
      if (diff < 1000) { // Moins d'1 seconde
        rapidActions.push({
          action1: sortedActions[i-1],
          action2: sortedActions[i],
          timeDiff: diff + 'ms'
        });
      }
    }

    return rapidActions;
  }

  calculateRiskLevel(userActions) {
    let riskScore = 0;
    
    // Facteurs de risque
    const destructiveActions = userActions.filter(a => 
      ['DELETE', 'TRUNCATE', 'DROP'].includes(a.ACTION_NAME)
    ).length;
    
    const systemAccess = userActions.filter(a => 
      a.OBJECT_SCHEMA === 'SYS'
    ).length;
    
    const adminActions = userActions.filter(a => 
      ['GRANT', 'REVOKE', 'ALTER'].includes(a.ACTION_NAME)
    ).length;

    riskScore += destructiveActions * 10;
    riskScore += systemAccess * 5;
    riskScore += adminActions * 15;

    if (riskScore < 20) return 'FAIBLE';
    if (riskScore < 50) return 'MOYEN';
    if (riskScore < 100) return 'ÉLEVÉ';
    return 'CRITIQUE';
  }

  calculateGlobalStats(auditData) {
    const totalActions = auditData.length;
    const uniqueUsers = new Set(auditData.map(item => item.OS_USERNAME)).size;
    const uniqueObjects = new Set(auditData.map(item => item.OBJECT_NAME)).size;
    const uniqueActions = new Set(auditData.map(item => item.ACTION_NAME)).size;

    return {
      totalActions,
      uniqueUsers,
      uniqueObjects,
      uniqueActions,
      averageActionsPerUser: (totalActions / uniqueUsers).toFixed(2)
    };
  }

  rankUsersByActivity(auditData, users) {
    const userStats = users.map(username => {
      const userActions = auditData.filter(item => 
        item.OS_USERNAME === username || item.DBUSERNAME === username
      );
      
      return {
        username,
        actionCount: userActions.length,
        uniqueObjects: new Set(userActions.map(item => item.OBJECT_NAME)).size,
        uniqueActions: new Set(userActions.map(item => item.ACTION_NAME)).size
      };
    });

    return userStats.sort((a, b) => b.actionCount - a.actionCount);
  }
}

module.exports = UserActionsAnalyzer;

// 🎯 ANALYSEUR AVANCÉ DES ACTIONS UTILISATEURS
// Module spécialisé pour l'analyse approfondie des comportements utilisateurs
// Optimisation IA pour détection d'anomalies et patterns comportementaux

class AdvancedUserActionsAnalyzer {
  constructor() {
    this.behavioralPatterns = this.initializeBehavioralPatterns();
    this.securityThresholds = this.initializeSecurityThresholds();
    this.analysisCache = new Map();
    this.userProfiles = new Map();
  }

  // 🧠 Patterns comportementaux avancés
  initializeBehavioralPatterns() {
    return {
      // Patterns d'activité normale
      normalPatterns: {
        businessHours: { start: 8, end: 18 },
        maxActionsPerHour: 100,
        maxSessionsPerDay: 5,
        typicalActionSequence: ['SELECT', 'SELECT', 'UPDATE', 'SELECT'],
        normalObjectAccess: ['HR', 'FINANCE', 'SALES']
      },

      // Patterns suspects
      suspiciousPatterns: {
        rapidSuccession: { threshold: 10, timeWindow: 60000 }, // 10 actions en 1 minute
        destructiveSequence: ['SELECT', 'DELETE', 'SELECT', 'DELETE'],
        systemAccess: ['SYS', 'SYSTEM', 'DBA'],
        unusualHours: { start: 22, end: 6 },
        excessivePrivileges: ['GRANT', 'REVOKE', 'CREATE USER', 'DROP USER']
      },

      // Patterns d'attaque
      attackPatterns: {
        sqlInjection: [
          /'.*OR.*1=1/i,
          /'.*UNION.*SELECT/i,
          /'.*DROP.*TABLE/i,
          /'.*EXEC.*xp_cmdshell/i
        ],
        privilegeEscalation: [
          /GRANT.*SYSDBA/i,
          /GRANT.*DBA/i,
          /ALTER.*USER.*IDENTIFIED/i
        ],
        dataExfiltration: [
          /SELECT.*\*.*FROM.*DUAL/i,
          /SELECT.*FROM.*ALL_TABLES/i,
          /SELECT.*FROM.*USER_TABLES/i
        ]
      }
    };
  }

  // 🛡️ Seuils de sécurité
  initializeSecurityThresholds() {
    return {
      riskLevels: {
        LOW: { score: 0, color: 'green', action: 'monitor' },
        MEDIUM: { score: 30, color: 'yellow', action: 'alert' },
        HIGH: { score: 70, color: 'orange', action: 'investigate' },
        CRITICAL: { score: 90, color: 'red', action: 'block' }
      },
      
      thresholds: {
        maxFailedLogins: 3,
        maxSystemAccess: 5,
        maxDestructiveActions: 2,
        maxUnusualHours: 2,
        maxRapidActions: 15
      }
    };
  }

  // 🎯 ANALYSE PRINCIPALE DES ACTIONS UTILISATEUR
  async analyzeUserActions(auditData, targetUser = null) {
    try {
      const startTime = Date.now();
      
      // Filtrer les données par utilisateur si spécifié
      const userData = targetUser 
        ? auditData.filter(entry => 
            entry.DBUSERNAME === targetUser || 
            entry.dbusername === targetUser ||
            entry.os_username === targetUser
          )
        : auditData;

      if (userData.length === 0) {
        return {
          status: 'no_data',
          message: `Aucune donnée trouvée pour l'utilisateur: ${targetUser || 'tous'}`,
          analysis: {}
        };
      }

      // Analyses spécialisées
      const analysis = {
        userProfile: this.buildUserProfile(userData, targetUser),
        behavioralAnalysis: this.analyzeBehavioralPatterns(userData),
        securityAnalysis: this.analyzeSecurityRisks(userData),
        objectManipulation: this.analyzeObjectManipulation(userData),
        temporalAnalysis: this.analyzeTemporalPatterns(userData),
        sessionAnalysis: this.analyzeSessionPatterns(userData),
        riskAssessment: this.calculateRiskScore(userData),
        recommendations: this.generateRecommendations(userData)
      };

      const processingTime = Date.now() - startTime;

      return {
        status: 'success',
        processingTime: `${processingTime}ms`,
        dataSource: 'advanced_analysis',
        analysis: analysis,
        summary: this.generateSummary(analysis),
        alerts: this.generateAlerts(analysis)
      };

    } catch (error) {
      console.error('Erreur dans l\'analyse avancée des actions utilisateur:', error);
      return {
        status: 'error',
        message: 'Erreur lors de l\'analyse avancée',
        error: error.message
      };
    }
  }

  // 👤 CONSTRUCTION DU PROFIL UTILISATEUR
  buildUserProfile(userData, username) {
    const profile = {
      username: username || 'Multiple Users',
      totalActions: userData.length,
      uniqueUsers: [...new Set(userData.map(d => d.DBUSERNAME || d.dbusername))].length,
      firstActivity: new Date(Math.min(...userData.map(d => new Date(d.EVENT_TIMESTAMP || d.event_timestamp)))),
      lastActivity: new Date(Math.max(...userData.map(d => new Date(d.EVENT_TIMESTAMP || d.event_timestamp)))),
      activityDuration: this.calculateActivityDuration(userData),
      
      // Statistiques d'actions
      actionTypes: this.countActionTypes(userData),
      topActions: this.getTopActions(userData, 10),
      
      // Accès aux objets
      objectsAccessed: this.getObjectsAccessed(userData),
      schemasAccessed: this.getSchemasAccessed(userData),
      
      // Programmes utilisés
      clientPrograms: this.getClientPrograms(userData),
      
      // Hôtes de connexion
      connectionHosts: this.getConnectionHosts(userData),
      
      // Sessions
      sessionCount: this.getSessionCount(userData),
      averageSessionDuration: this.calculateAverageSessionDuration(userData)
    };

    // Calculer les métriques avancées
    profile.actionDiversity = this.calculateActionDiversity(userData);
    profile.objectDiversity = this.calculateObjectDiversity(userData);
    profile.timeDistribution = this.calculateTimeDistribution(userData);
    profile.privilegeLevel = this.assessPrivilegeLevel(userData);

    return profile;
  }

  // 🧠 ANALYSE DES PATTERNS COMPORTEMENTAUX
  analyzeBehavioralPatterns(userData) {
    const patterns = {
      normalBehavior: this.identifyNormalBehavior(userData),
      suspiciousBehavior: this.identifySuspiciousBehavior(userData),
      attackPatterns: this.detectAttackPatterns(userData),
      behavioralAnomalies: this.detectBehavioralAnomalies(userData),
      userTypology: this.classifyUserTypology(userData)
    };

    return patterns;
  }

  // 🛡️ ANALYSE DE SÉCURITÉ
  analyzeSecurityRisks(userData) {
    const security = {
      riskScore: this.calculateSecurityRiskScore(userData),
      threatIndicators: this.identifyThreatIndicators(userData),
      privilegeAbuse: this.detectPrivilegeAbuse(userData),
      dataAccessPatterns: this.analyzeDataAccessPatterns(userData),
      authenticationIssues: this.detectAuthenticationIssues(userData),
      securityRecommendations: this.generateSecurityRecommendations(userData)
    };

    return security;
  }

  // 📊 ANALYSE DES MANIPULATIONS D'OBJETS
  analyzeObjectManipulation(userData) {
    return {
      objectsCreated: this.getObjectsCreated(userData),
      objectsModified: this.getObjectsModified(userData),
      objectsDeleted: this.getObjectsDeleted(userData),
      sensitiveObjects: this.identifySensitiveObjects(userData),
      objectAccessFrequency: this.calculateObjectAccessFrequency(userData),
      crossSchemaAccess: this.analyzeCrossSchemaAccess(userData),
      objectDependencies: this.analyzeObjectDependencies(userData)
    };
  }

  // ⏰ ANALYSE TEMPORELLE
  analyzeTemporalPatterns(userData) {
    return {
      hourlyDistribution: this.calculateHourlyDistribution(userData),
      dailyPatterns: this.calculateDailyPatterns(userData),
      weeklyPatterns: this.calculateWeeklyPatterns(userData),
      peakActivityTimes: this.identifyPeakActivityTimes(userData),
      unusualTimeAccess: this.detectUnusualTimeAccess(userData),
      sessionTiming: this.analyzeSessionTiming(userData)
    };
  }

  // 🔄 ANALYSE DES SESSIONS
  analyzeSessionPatterns(userData) {
    return {
      sessionCount: this.getSessionCount(userData),
      sessionDuration: this.calculateSessionDurations(userData),
      concurrentSessions: this.detectConcurrentSessions(userData),
      sessionReuse: this.analyzeSessionReuse(userData),
      sessionTermination: this.analyzeSessionTermination(userData)
    };
  }

  // 🎯 CALCUL DU SCORE DE RISQUE
  calculateRiskScore(userData) {
    let riskScore = 0;
    const factors = [];

    // Facteur 1: Actions destructives
    const destructiveActions = userData.filter(d => 
      ['DELETE', 'DROP', 'TRUNCATE'].includes(d.ACTION_NAME || d.action_name)
    ).length;
    if (destructiveActions > 0) {
      riskScore += destructiveActions * 15;
      factors.push(`Actions destructives: ${destructiveActions} (+${destructiveActions * 15} points)`);
    }

    // Facteur 2: Accès système
    const systemAccess = userData.filter(d => 
      ['SYS', 'SYSTEM'].includes(d.OBJECT_SCHEMA || d.object_schema)
    ).length;
    if (systemAccess > 0) {
      riskScore += systemAccess * 10;
      factors.push(`Accès système: ${systemAccess} (+${systemAccess * 10} points)`);
    }

    // Facteur 3: Heures inhabituelles
    const unusualHours = this.detectUnusualTimeAccess(userData).length;
    if (unusualHours > 0) {
      riskScore += unusualHours * 8;
      factors.push(`Accès hors heures: ${unusualHours} (+${unusualHours * 8} points)`);
    }

    // Facteur 4: Actions rapides
    const rapidActions = this.detectRapidActions(userData).length;
    if (rapidActions > 0) {
      riskScore += rapidActions * 5;
      factors.push(`Actions rapides: ${rapidActions} (+${rapidActions * 5} points)`);
    }

    // Facteur 5: Privilèges élevés
    const privilegeActions = userData.filter(d => 
      ['GRANT', 'REVOKE', 'CREATE USER', 'DROP USER'].includes(d.ACTION_NAME || d.action_name)
    ).length;
    if (privilegeActions > 0) {
      riskScore += privilegeActions * 20;
      factors.push(`Actions privilégiées: ${privilegeActions} (+${privilegeActions * 20} points)`);
    }

    // Normaliser le score (0-100)
    riskScore = Math.min(100, riskScore);

    return {
      score: riskScore,
      level: this.getRiskLevel(riskScore),
      factors: factors,
      details: {
        destructiveActions,
        systemAccess,
        unusualHours,
        rapidActions,
        privilegeActions
      }
    };
  }

  // 💡 GÉNÉRATION DE RECOMMANDATIONS
  generateRecommendations(userData) {
    const recommendations = [];
    const riskScore = this.calculateRiskScore(userData);

    if (riskScore.score > 70) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Investigation immédiate requise',
        description: 'Score de risque élevé détecté. Analyse approfondie nécessaire.'
      });
    }

    if (riskScore.details.destructiveActions > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Surveillance des actions destructives',
        description: `Détection de ${riskScore.details.destructiveActions} actions destructives.`
      });
    }

    if (riskScore.details.systemAccess > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Audit des accès système',
        description: `Accès système détecté: ${riskScore.details.systemAccess} fois.`
      });
    }

    return recommendations;
  }

  // 🔍 MÉTHODES UTILITAIRES
  calculateActivityDuration(userData) {
    const timestamps = userData.map(d => new Date(d.EVENT_TIMESTAMP || d.event_timestamp));
    const minTime = new Date(Math.min(...timestamps));
    const maxTime = new Date(Math.max(...timestamps));
    return (maxTime - minTime) / (1000 * 60 * 60 * 24); // en jours
  }

  countActionTypes(userData) {
    const actions = {};
    userData.forEach(d => {
      const action = d.ACTION_NAME || d.action_name;
      if (action) {
        actions[action] = (actions[action] || 0) + 1;
      }
    });
    return actions;
  }

  getTopActions(userData, limit = 10) {
    const actions = this.countActionTypes(userData);
    return Object.entries(actions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([action, count]) => ({ action, count }));
  }

  getObjectsAccessed(userData) {
    return [...new Set(userData.map(d => d.OBJECT_NAME || d.object_name).filter(Boolean))];
  }

  getSchemasAccessed(userData) {
    return [...new Set(userData.map(d => d.OBJECT_SCHEMA || d.object_schema).filter(Boolean))];
  }

  getClientPrograms(userData) {
    const programs = {};
    userData.forEach(d => {
      const program = d.CLIENT_PROGRAM_NAME || d.client_program_name;
      if (program) {
        programs[program] = (programs[program] || 0) + 1;
      }
    });
    return programs;
  }

  getConnectionHosts(userData) {
    return [...new Set(userData.map(d => d.USERHOST || d.userhost).filter(Boolean))];
  }

  getSessionCount(userData) {
    return [...new Set(userData.map(d => d.SESSIONID || d.sessionid).filter(Boolean))].length;
  }

  detectRapidActions(userData) {
    const rapidActions = [];
    const sortedData = userData.sort((a, b) => 
      new Date(a.EVENT_TIMESTAMP || a.event_timestamp) - new Date(b.EVENT_TIMESTAMP || b.event_timestamp)
    );

    for (let i = 0; i < sortedData.length - 1; i++) {
      const current = new Date(sortedData[i].EVENT_TIMESTAMP || sortedData[i].event_timestamp);
      const next = new Date(sortedData[i + 1].EVENT_TIMESTAMP || sortedData[i + 1].event_timestamp);
      const timeDiff = next - current;

      if (timeDiff < 5000) { // moins de 5 secondes
        rapidActions.push({
          action1: sortedData[i],
          action2: sortedData[i + 1],
          timeDiff: timeDiff
        });
      }
    }

    return rapidActions;
  }

  detectUnusualTimeAccess(userData) {
    return userData.filter(d => {
      const timestamp = new Date(d.EVENT_TIMESTAMP || d.event_timestamp);
      const hour = timestamp.getHours();
      return hour < 6 || hour > 22;
    });
  }

  getRiskLevel(score) {
    if (score >= 90) return 'CRITICAL';
    if (score >= 70) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }

  generateSummary(analysis) {
    const profile = analysis.userProfile;
    const risk = analysis.riskAssessment;

    return {
      userCount: profile.uniqueUsers,
      totalActions: profile.totalActions,
      riskLevel: risk.level,
      riskScore: risk.score,
      topAction: analysis.userProfile.topActions[0]?.action || 'N/A',
      mostAccessedSchema: Object.keys(analysis.userProfile.schemasAccessed).sort((a, b) => 
        analysis.userProfile.schemasAccessed[b] - analysis.userProfile.schemasAccessed[a]
      )[0] || 'N/A'
    };
  }

  generateAlerts(analysis) {
    const alerts = [];
    const risk = analysis.riskAssessment;

    if (risk.score > 70) {
      alerts.push({
        level: 'CRITICAL',
        message: `Score de risque élevé: ${risk.score}/100`,
        timestamp: new Date().toISOString()
      });
    }

    if (analysis.behavioralAnalysis.suspiciousBehavior.length > 0) {
      alerts.push({
        level: 'WARNING',
        message: `${analysis.behavioralAnalysis.suspiciousBehavior.length} comportements suspects détectés`,
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }

  // Méthodes à implémenter pour les analyses spécialisées
  identifyNormalBehavior(userData) { return []; }
  identifySuspiciousBehavior(userData) { return []; }
  detectAttackPatterns(userData) { return []; }
  detectBehavioralAnomalies(userData) { return []; }
  classifyUserTypology(userData) { return 'STANDARD'; }
  identifyThreatIndicators(userData) { return []; }
  detectPrivilegeAbuse(userData) { return []; }
  analyzeDataAccessPatterns(userData) { return {}; }
  detectAuthenticationIssues(userData) { return []; }
  generateSecurityRecommendations(userData) { return []; }
  getObjectsCreated(userData) { return []; }
  getObjectsModified(userData) { return []; }
  getObjectsDeleted(userData) { return []; }
  identifySensitiveObjects(userData) { return []; }
  calculateObjectAccessFrequency(userData) { return {}; }
  analyzeCrossSchemaAccess(userData) { return {}; }
  analyzeObjectDependencies(userData) { return {}; }
  calculateHourlyDistribution(userData) { return {}; }
  calculateDailyPatterns(userData) { return {}; }
  calculateWeeklyPatterns(userData) { return {}; }
  identifyPeakActivityTimes(userData) { return []; }
  calculateSessionDurations(userData) { return []; }
  detectConcurrentSessions(userData) { return []; }
  analyzeSessionReuse(userData) { return {}; }
  analyzeSessionTermination(userData) { return {}; }
  calculateActionDiversity(userData) { return 0; }
  calculateObjectDiversity(userData) { return 0; }
  calculateTimeDistribution(userData) { return {}; }
  assessPrivilegeLevel(userData) { return 'STANDARD'; }
  calculateAverageSessionDuration(userData) { return 0; }
  calculateObjectAccessFrequency(userData) { return {}; }
  analyzeSessionTiming(userData) { return {}; }
}

module.exports = AdvancedUserActionsAnalyzer;

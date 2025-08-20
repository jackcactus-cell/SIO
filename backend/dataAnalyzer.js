// Module d'analyse des données d'audit Oracle
const { backendLogger } = require('./utils/logger');

class DataAnalyzer {
  constructor() {
    this.logs = [];
    this.analysisCache = new Map();
  }

  // Charger et valider les données
  loadData(auditData) {
    try {
      this.logs = Array.isArray(auditData) ? auditData : [];
      backendLogger.info(`Données chargées: ${this.logs.length} entrées`, 'ANALYZER');
      
      // Valider la structure des données
      const validLogs = this.logs.filter(log => this.isValidLog(log));
      backendLogger.info(`Logs valides: ${validLogs.length}/${this.logs.length}`, 'ANALYZER');
      
      this.logs = validLogs;
      return true;
    } catch (error) {
      backendLogger.error('Erreur lors du chargement des données', error, 'ANALYZER');
      return false;
    }
  }

  // Valider la structure d'un log
  isValidLog(log) {
    return log && 
           typeof log === 'object' && 
           (log.OS_USERNAME || log.os_username || log.DBUSERNAME || log.dbusername || log.ACTION_NAME || log.action_name || log.OBJECT_NAME || log.object_name);
  }

  // Analyser les utilisateurs
  analyzeUsers() {
    const users = {
      os_users: [...new Set(this.logs.map(l => l.OS_USERNAME || l.os_username).filter(Boolean))],
      db_users: [...new Set(this.logs.map(l => l.DBUSERNAME || l.dbusername).filter(Boolean))],
      user_activity: {}
    };

    // Activité par utilisateur
    this.logs.forEach(log => {
      const dbUser = log.DBUSERNAME || log.dbusername;
      const actionName = log.ACTION_NAME || log.action_name;
      const objectName = log.OBJECT_NAME || log.object_name;
      const sessionId = log.SESSIONID || log.sessionid;
      const clientProgram = log.CLIENT_PROGRAM_NAME || log.client_program_name;
      
      if (dbUser) {
        if (!users.user_activity[dbUser]) {
          users.user_activity[dbUser] = {
            actions: {},
            objects: new Set(),
            sessions: new Set(),
            programs: new Set()
          };
        }
        
        // Compter les actions
        if (actionName) {
          users.user_activity[dbUser].actions[actionName] = 
            (users.user_activity[dbUser].actions[actionName] || 0) + 1;
        }
        
        // Ajouter les objets
        if (objectName) {
          users.user_activity[dbUser].objects.add(objectName);
        }
        
        // Ajouter les sessions
        if (sessionId) {
          users.user_activity[dbUser].sessions.add(sessionId);
        }
        
        // Ajouter les programmes
        if (clientProgram) {
          users.user_activity[dbUser].programs.add(clientProgram);
        }
      }
    });

    // Convertir les Sets en Arrays
    Object.keys(users.user_activity).forEach(user => {
      users.user_activity[user].objects = [...users.user_activity[user].objects];
      users.user_activity[user].sessions = [...users.user_activity[user].sessions];
      users.user_activity[user].programs = [...users.user_activity[user].programs];
    });

    return users;
  }

  // Analyser les actions
  analyzeActions() {
    const actions = {
      types: [...new Set(this.logs.map(l => l.ACTION_NAME || l.action_name).filter(Boolean))],
      frequency: {},
      by_user: {},
      by_object: {},
      by_program: {}
    };

    this.logs.forEach(log => {
      const actionName = log.ACTION_NAME || log.action_name;
      const dbUser = log.DBUSERNAME || log.dbusername;
      const objectName = log.OBJECT_NAME || log.object_name;
      const clientProgram = log.CLIENT_PROGRAM_NAME || log.client_program_name;
      
      if (actionName) {
        // Fréquence globale
        actions.frequency[actionName] = (actions.frequency[actionName] || 0) + 1;
        
        // Par utilisateur
        if (dbUser) {
          if (!actions.by_user[dbUser]) actions.by_user[dbUser] = {};
          actions.by_user[dbUser][actionName] = 
            (actions.by_user[dbUser][actionName] || 0) + 1;
        }
        
        // Par objet
        if (objectName) {
          if (!actions.by_object[objectName]) actions.by_object[objectName] = {};
          actions.by_object[objectName][actionName] = 
            (actions.by_object[objectName][actionName] || 0) + 1;
        }
        
        // Par programme
        if (clientProgram) {
          if (!actions.by_program[clientProgram]) actions.by_program[clientProgram] = {};
          actions.by_program[clientProgram][actionName] = 
            (actions.by_program[clientProgram][actionName] || 0) + 1;
        }
      }
    });

    return actions;
  }

  // Analyser les objets
  analyzeObjects() {
    const objects = {
      names: [...new Set(this.logs.map(l => l.OBJECT_NAME || l.object_name).filter(Boolean))],
      schemas: [...new Set(this.logs.map(l => l.OBJECT_SCHEMA || l.object_schema).filter(Boolean))],
      frequency: {},
      by_schema: {},
      by_action: {},
      by_user: {}
    };

    this.logs.forEach(log => {
      const objectName = log.OBJECT_NAME || log.object_name;
      const objectSchema = log.OBJECT_SCHEMA || log.object_schema;
      const actionName = log.ACTION_NAME || log.action_name;
      const dbUser = log.DBUSERNAME || log.dbusername;
      
      if (objectName) {
        // Fréquence globale
        objects.frequency[objectName] = (objects.frequency[objectName] || 0) + 1;
        
        // Par schéma
        if (objectSchema) {
          if (!objects.by_schema[objectSchema]) objects.by_schema[objectSchema] = {};
          objects.by_schema[objectSchema][objectName] = 
            (objects.by_schema[objectSchema][objectName] || 0) + 1;
        }
        
        // Par action
        if (actionName) {
          if (!objects.by_action[actionName]) objects.by_action[actionName] = {};
          objects.by_action[actionName][objectName] = 
            (objects.by_action[actionName][objectName] || 0) + 1;
        }
        
        // Par utilisateur
        if (dbUser) {
          if (!objects.by_user[dbUser]) objects.by_user[dbUser] = {};
          objects.by_user[dbUser][objectName] = 
            (objects.by_user[dbUser][objectName] || 0) + 1;
        }
      }
    });

    return objects;
  }

  // Analyser les programmes clients
  analyzePrograms() {
    const programs = {
      names: [...new Set(this.logs.map(l => l.CLIENT_PROGRAM_NAME).filter(Boolean))],
      frequency: {},
      by_user: {},
      by_action: {},
      by_object: {}
    };

    this.logs.forEach(log => {
      if (log.CLIENT_PROGRAM_NAME) {
        // Fréquence globale
        programs.frequency[log.CLIENT_PROGRAM_NAME] = 
          (programs.frequency[log.CLIENT_PROGRAM_NAME] || 0) + 1;
        
        // Par utilisateur
        if (log.DBUSERNAME) {
          if (!programs.by_user[log.DBUSERNAME]) programs.by_user[log.DBUSERNAME] = {};
          programs.by_user[log.DBUSERNAME][log.CLIENT_PROGRAM_NAME] = 
            (programs.by_user[log.DBUSERNAME][log.CLIENT_PROGRAM_NAME] || 0) + 1;
        }
        
        // Par action
        if (log.ACTION_NAME) {
          if (!programs.by_action[log.ACTION_NAME]) programs.by_action[log.ACTION_NAME] = {};
          programs.by_action[log.ACTION_NAME][log.CLIENT_PROGRAM_NAME] = 
            (programs.by_action[log.ACTION_NAME][log.CLIENT_PROGRAM_NAME] || 0) + 1;
        }
        
        // Par objet
        if (log.OBJECT_NAME) {
          if (!programs.by_object[log.OBJECT_NAME]) programs.by_object[log.OBJECT_NAME] = {};
          programs.by_object[log.OBJECT_NAME][log.CLIENT_PROGRAM_NAME] = 
            (programs.by_object[log.OBJECT_NAME][log.CLIENT_PROGRAM_NAME] || 0) + 1;
        }
      }
    });

    return programs;
  }

  // Analyser les sessions
  analyzeSessions() {
    const sessions = {
      ids: [...new Set(this.logs.map(l => l.SESSIONID).filter(Boolean))],
      by_user: {},
      duration: {},
      activity: {}
    };

    this.logs.forEach(log => {
      if (log.SESSIONID) {
        // Par utilisateur
        if (log.DBUSERNAME) {
          if (!sessions.by_user[log.DBUSERNAME]) sessions.by_user[log.DBUSERNAME] = new Set();
          sessions.by_user[log.DBUSERNAME].add(log.SESSIONID);
        }
        
        // Activité par session
        if (!sessions.activity[log.SESSIONID]) {
          sessions.activity[log.SESSIONID] = {
            actions: {},
            objects: new Set(),
            user: log.DBUSERNAME,
            program: log.CLIENT_PROGRAM_NAME,
            timestamps: []
          };
        }
        
        sessions.activity[log.SESSIONID].actions[log.ACTION_NAME] = 
          (sessions.activity[log.SESSIONID].actions[log.ACTION_NAME] || 0) + 1;
        
        if (log.OBJECT_NAME) {
          sessions.activity[log.SESSIONID].objects.add(log.OBJECT_NAME);
        }
        
        if (log.EVENT_TIMESTAMP) {
          sessions.activity[log.SESSIONID].timestamps.push(log.EVENT_TIMESTAMP);
        }
      }
    });

    // Convertir les Sets en Arrays
    Object.keys(sessions.by_user).forEach(user => {
      sessions.by_user[user] = [...sessions.by_user[user]];
    });

    Object.keys(sessions.activity).forEach(sessionId => {
      sessions.activity[sessionId].objects = [...sessions.activity[sessionId].objects];
    });

    return sessions;
  }

  // Analyser les schémas
  analyzeSchemas() {
    const schemas = {
      names: [...new Set(this.logs.map(l => l.OBJECT_SCHEMA).filter(Boolean))],
      frequency: {},
      by_user: {},
      by_action: {},
      objects: {}
    };

    this.logs.forEach(log => {
      if (log.OBJECT_SCHEMA) {
        // Fréquence globale
        schemas.frequency[log.OBJECT_SCHEMA] = (schemas.frequency[log.OBJECT_SCHEMA] || 0) + 1;
        
        // Par utilisateur
        if (log.DBUSERNAME) {
          if (!schemas.by_user[log.DBUSERNAME]) schemas.by_user[log.DBUSERNAME] = {};
          schemas.by_user[log.DBUSERNAME][log.OBJECT_SCHEMA] = 
            (schemas.by_user[log.DBUSERNAME][log.OBJECT_SCHEMA] || 0) + 1;
        }
        
        // Par action
        if (log.ACTION_NAME) {
          if (!schemas.by_action[log.ACTION_NAME]) schemas.by_action[log.ACTION_NAME] = {};
          schemas.by_action[log.ACTION_NAME][log.OBJECT_SCHEMA] = 
            (schemas.by_action[log.ACTION_NAME][log.OBJECT_SCHEMA] || 0) + 1;
        }
        
        // Objets par schéma
        if (log.OBJECT_NAME) {
          if (!schemas.objects[log.OBJECT_SCHEMA]) schemas.objects[log.OBJECT_SCHEMA] = {};
          schemas.objects[log.OBJECT_SCHEMA][log.OBJECT_NAME] = 
            (schemas.objects[log.OBJECT_SCHEMA][log.OBJECT_NAME] || 0) + 1;
        }
      }
    });

    return schemas;
  }

  // Analyser les hôtes et terminaux
  analyzeInfrastructure() {
    const infrastructure = {
      hosts: [...new Set(this.logs.map(l => l.USERHOST).filter(Boolean))],
      terminals: [...new Set(this.logs.map(l => l.TERMINAL).filter(Boolean))],
      authentication: [...new Set(this.logs.map(l => l.AUTHENTICATION_TYPE).filter(Boolean))],
      by_host: {},
      by_terminal: {},
      by_auth: {}
    };

    this.logs.forEach(log => {
      // Par hôte
      if (log.USERHOST) {
        if (!infrastructure.by_host[log.USERHOST]) {
          infrastructure.by_host[log.USERHOST] = {
            users: new Set(),
            actions: {},
            objects: new Set()
          };
        }
        
        if (log.DBUSERNAME) infrastructure.by_host[log.USERHOST].users.add(log.DBUSERNAME);
        if (log.ACTION_NAME) {
          infrastructure.by_host[log.USERHOST].actions[log.ACTION_NAME] = 
            (infrastructure.by_host[log.USERHOST].actions[log.ACTION_NAME] || 0) + 1;
        }
        if (log.OBJECT_NAME) infrastructure.by_host[log.USERHOST].objects.add(log.OBJECT_NAME);
      }
      
      // Par terminal
      if (log.TERMINAL) {
        if (!infrastructure.by_terminal[log.TERMINAL]) {
          infrastructure.by_terminal[log.TERMINAL] = {
            users: new Set(),
            actions: {},
            objects: new Set()
          };
        }
        
        if (log.DBUSERNAME) infrastructure.by_terminal[log.TERMINAL].users.add(log.DBUSERNAME);
        if (log.ACTION_NAME) {
          infrastructure.by_terminal[log.TERMINAL].actions[log.ACTION_NAME] = 
            (infrastructure.by_terminal[log.TERMINAL].actions[log.ACTION_NAME] || 0) + 1;
        }
        if (log.OBJECT_NAME) infrastructure.by_terminal[log.TERMINAL].objects.add(log.OBJECT_NAME);
      }
      
      // Par authentification
      if (log.AUTHENTICATION_TYPE) {
        if (!infrastructure.by_auth[log.AUTHENTICATION_TYPE]) {
          infrastructure.by_auth[log.AUTHENTICATION_TYPE] = {
            users: new Set(),
            actions: {},
            objects: new Set()
          };
        }
        
        if (log.DBUSERNAME) infrastructure.by_auth[log.AUTHENTICATION_TYPE].users.add(log.DBUSERNAME);
        if (log.ACTION_NAME) {
          infrastructure.by_auth[log.AUTHENTICATION_TYPE].actions[log.ACTION_NAME] = 
            (infrastructure.by_auth[log.AUTHENTICATION_TYPE].actions[log.ACTION_NAME] || 0) + 1;
        }
        if (log.OBJECT_NAME) infrastructure.by_auth[log.AUTHENTICATION_TYPE].objects.add(log.OBJECT_NAME);
      }
    });

    // Convertir les Sets en Arrays
    Object.keys(infrastructure.by_host).forEach(host => {
      infrastructure.by_host[host].users = [...infrastructure.by_host[host].users];
      infrastructure.by_host[host].objects = [...infrastructure.by_host[host].objects];
    });

    Object.keys(infrastructure.by_terminal).forEach(terminal => {
      infrastructure.by_terminal[terminal].users = [...infrastructure.by_terminal[terminal].users];
      infrastructure.by_terminal[terminal].objects = [...infrastructure.by_terminal[terminal].objects];
    });

    Object.keys(infrastructure.by_auth).forEach(auth => {
      infrastructure.by_auth[auth].users = [...infrastructure.by_auth[auth].users];
      infrastructure.by_auth[auth].objects = [...infrastructure.by_auth[auth].objects];
    });

    return infrastructure;
  }

  // Analyser les timestamps
  analyzeTimeline() {
    const timeline = {
      timestamps: this.logs.map(l => l.EVENT_TIMESTAMP).filter(Boolean),
      by_hour: {},
      by_day: {},
      patterns: {}
    };

    this.logs.forEach(log => {
      if (log.EVENT_TIMESTAMP) {
        try {
          const date = new Date(log.EVENT_TIMESTAMP);
          const hour = date.getHours();
          const day = date.toDateString();
          
          // Par heure
          if (!timeline.by_hour[hour]) timeline.by_hour[hour] = {};
          if (log.ACTION_NAME) {
            timeline.by_hour[hour][log.ACTION_NAME] = 
              (timeline.by_hour[hour][log.ACTION_NAME] || 0) + 1;
          }
          
          // Par jour
          if (!timeline.by_day[day]) timeline.by_day[day] = {};
          if (log.ACTION_NAME) {
            timeline.by_day[day][log.ACTION_NAME] = 
              (timeline.by_day[day][log.ACTION_NAME] || 0) + 1;
          }
        } catch (error) {
          backendLogger.warn(`Timestamp invalide: ${log.EVENT_TIMESTAMP}`, 'ANALYZER');
        }
      }
    });

    return timeline;
  }

  // Analyse complète
  analyzeAll() {
    const cacheKey = `analysis_${this.logs.length}`;
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    const analysis = {
      summary: {
        total_logs: this.logs.length,
        unique_users: [...new Set(this.logs.map(l => l.DBUSERNAME).filter(Boolean))].length,
        unique_actions: [...new Set(this.logs.map(l => l.ACTION_NAME).filter(Boolean))].length,
        unique_objects: [...new Set(this.logs.map(l => l.OBJECT_NAME).filter(Boolean))].length,
        unique_programs: [...new Set(this.logs.map(l => l.CLIENT_PROGRAM_NAME).filter(Boolean))].length,
        unique_sessions: [...new Set(this.logs.map(l => l.SESSIONID).filter(Boolean))].length
      },
      users: this.analyzeUsers(),
      actions: this.analyzeActions(),
      objects: this.analyzeObjects(),
      programs: this.analyzePrograms(),
      sessions: this.analyzeSessions(),
      schemas: this.analyzeSchemas(),
      infrastructure: this.analyzeInfrastructure(),
      timeline: this.analyzeTimeline()
    };

    this.analysisCache.set(cacheKey, analysis);
    return analysis;
  }

  // Rechercher des patterns suspects
  findSuspiciousPatterns() {
    const patterns = {
      excessive_sys_access: [],
      unusual_hours: [],
      multiple_sessions: [],
      sensitive_operations: []
    };

    // Accès excessifs au schéma SYS
    const sysAccess = this.logs.filter(l => l.OBJECT_SCHEMA === 'SYS');
    const sysAccessByUser = {};
    sysAccess.forEach(log => {
      if (log.DBUSERNAME) {
        sysAccessByUser[log.DBUSERNAME] = (sysAccessByUser[log.DBUSERNAME] || 0) + 1;
      }
    });

    Object.entries(sysAccessByUser).forEach(([user, count]) => {
      if (count > 10) {
        patterns.excessive_sys_access.push({
          user,
          count,
          objects: [...new Set(sysAccess.filter(l => l.DBUSERNAME === user).map(l => l.OBJECT_NAME))]
        });
      }
    });

    // Opérations en heures inhabituelles
    this.logs.forEach(log => {
      if (log.EVENT_TIMESTAMP) {
        try {
          const hour = new Date(log.EVENT_TIMESTAMP).getHours();
          if (hour < 6 || hour > 22) {
            patterns.unusual_hours.push({
              timestamp: log.EVENT_TIMESTAMP,
              user: log.DBUSERNAME,
              action: log.ACTION_NAME,
              object: log.OBJECT_NAME
            });
          }
        } catch (error) {
          // Ignorer les timestamps invalides
        }
      }
    });

    // Sessions multiples par utilisateur
    const sessionsByUser = {};
    this.logs.forEach(log => {
      if (log.DBUSERNAME && log.SESSIONID) {
        if (!sessionsByUser[log.DBUSERNAME]) sessionsByUser[log.DBUSERNAME] = new Set();
        sessionsByUser[log.DBUSERNAME].add(log.SESSIONID);
      }
    });

    Object.entries(sessionsByUser).forEach(([user, sessions]) => {
      if (sessions.size > 3) {
        patterns.multiple_sessions.push({
          user,
          session_count: sessions.size,
          sessions: [...sessions]
        });
      }
    });

    // Opérations sensibles
    const sensitiveActions = ['DELETE', 'DROP', 'TRUNCATE', 'ALTER SYSTEM'];
    this.logs.forEach(log => {
      if (sensitiveActions.includes(log.ACTION_NAME)) {
        patterns.sensitive_operations.push({
          user: log.DBUSERNAME,
          action: log.ACTION_NAME,
          object: log.OBJECT_NAME,
          timestamp: log.EVENT_TIMESTAMP,
          program: log.CLIENT_PROGRAM_NAME
        });
      }
    });

    return patterns;
  }

  // Générer des statistiques détaillées
  generateDetailedStats() {
    const analysis = this.analyzeAll();
    const patterns = this.findSuspiciousPatterns();

    return {
      overview: analysis.summary,
      top_users: Object.entries(analysis.users.user_activity)
        .map(([user, data]) => ({
          user,
          total_actions: Object.values(data.actions).reduce((a, b) => a + b, 0),
          unique_objects: data.objects.length,
          sessions: data.sessions.length,
          programs: data.programs.length
        }))
        .sort((a, b) => b.total_actions - a.total_actions)
        .slice(0, 10),
      top_actions: Object.entries(analysis.actions.frequency)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count),
      top_objects: Object.entries(analysis.objects.frequency)
        .map(([object, count]) => ({ object, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      top_programs: Object.entries(analysis.programs.frequency)
        .map(([program, count]) => ({ program, count }))
        .sort((a, b) => b.count - a.count),
      suspicious_patterns: patterns
    };
  }
}

module.exports = DataAnalyzer; 
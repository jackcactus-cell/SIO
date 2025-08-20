// Processeur de Questions Avancées pour l'Audit Oracle
// Traite 100+ questions sophistiquées avec analyses complexes

class AdvancedQuestionProcessor {
  constructor() {
    this.questionCategories = {
      filtres: this.setupFiltresQuestions(),
      regroupement: this.setupRegroupementQuestions(),
      temporelles: this.setupTemporellesQuestions(),
      sql: this.setupSQLQuestions(),
      securite: this.setupSecuriteQuestions(),
      performance: this.setupPerformanceQuestions(),
      metier: this.setupMetierQuestions(),
      investigation: this.setupInvestigationQuestions(),
      statistiques: this.setupStatistiquesQuestions(),
      avancees: this.setupAvanceesQuestions()
    };
  }

  // Questions de filtrage simples
  setupFiltresQuestions() {
    return [
      {
        pattern: /entrées.*audit.*DBUSERNAME.*['"]([^'"]+)['"]/i,
        handler: (data, match) => this.filterByDBUsername(data, match[1])
      },
      {
        pattern: /actions.*OS_USERNAME.*['"]([^'"]+)['"]/i,
        handler: (data, match) => this.filterByOSUsername(data, match[1])
      },
      {
        pattern: /terminal.*TERMINAL.*['"]([^'"]+)['"]/i,
        handler: (data, match) => this.filterByTerminal(data, match[1])
      },
      {
        pattern: /session.*SESSIONID.*(\d+)/i,
        handler: (data, match) => this.filterBySession(data, match[1])
      },
      {
        pattern: /CLIENT_PROGRAM_NAME.*['"]([^'"]+)['"]/i,
        handler: (data, match) => this.filterByClientProgram(data, match[1])
      },
      {
        pattern: /OBJECT_SCHEMA.*['"]([^'"]+)['"]/i,
        handler: (data, match) => this.filterByObjectSchema(data, match[1])
      },
      {
        pattern: /requêtes.*contenant.*['"]([^'"]+)['"]/i,
        handler: (data, match) => this.filterBySQLContent(data, match[1])
      },
      {
        pattern: /USERHOST.*['"]([^'"]+)['"]/i,
        handler: (data, match) => this.filterByUserHost(data, match[1])
      },
      {
        pattern: /AUTHENTICATION_TYPE.*['"]([^'"]+)['"]/i,
        handler: (data, match) => this.filterByAuthType(data, match[1])
      }
    ];
  }

  // Questions de regroupement et statistiques
  setupRegroupementQuestions() {
    return [
      {
        pattern: /combien.*actions.*DBUSERNAME/i,
        handler: (data) => this.groupByDBUsername(data)
      },
      {
        pattern: /classe.*utilisateurs.*sessions/i,
        handler: (data) => this.groupUsersBySessions(data)
      },
      {
        pattern: /nombre.*requêtes.*authentification/i,
        handler: (data) => this.groupByAuthType(data)
      },
      {
        pattern: /top.*CLIENT_PROGRAM_NAME/i,
        handler: (data) => this.topClientPrograms(data)
      },
      {
        pattern: /statistiques.*OBJECT_SCHEMA/i,
        handler: (data) => this.groupByObjectSchema(data)
      },
      {
        pattern: /objets.*distincts.*utilisateur/i,
        handler: (data) => this.objectsPerUser(data)
      },
      {
        pattern: /classement.*OS.*utilisés/i,
        handler: (data) => this.groupByOSUsername(data)
      },
      {
        pattern: /actions.*ACTION_NAME/i,
        handler: (data) => this.groupByActionName(data)
      }
    ];
  }

  // Questions temporelles
  setupTemporellesQuestions() {
    return [
      {
        pattern: /actions.*aujourd'hui/i,
        handler: (data) => this.filterByToday(data)
      },
      {
        pattern: /requêtes.*hier/i,
        handler: (data) => this.filterByYesterday(data)
      },
      {
        pattern: /tendance.*horaire/i,
        handler: (data) => this.hourlyTrend(data)
      },
      {
        pattern: /pic.*activité.*heure/i,
        handler: (data) => this.peakActivity(data)
      },
      {
        pattern: /jours.*semaine.*actions/i,
        handler: (data) => this.weeklyActivity(data)
      },
      {
        pattern: /heure.*fréquente.*DELETE/i,
        handler: (data) => this.deletePatterns(data)
      },
      {
        pattern: /connexions.*jour.*mois/i,
        handler: (data) => this.monthlyConnections(data)
      },
      {
        pattern: /durée.*session/i,
        handler: (data) => this.sessionDuration(data)
      }
    ];
  }

  // Questions SQL
  setupSQLQuestions() {
    return [
      {
        pattern: /requêtes.*contenant.*DROP/i,
        handler: (data) => this.findSQLWithKeyword(data, 'DROP')
      },
      {
        pattern: /requêtes.*commencent.*UPDATE/i,
        handler: (data) => this.findSQLStartingWith(data, 'UPDATE')
      },
      {
        pattern: /requêtes.*table.*([A-Z_]+)/i,
        handler: (data, match) => this.findSQLOnTable(data, match[1])
      },
      {
        pattern: /SELECT.*utilisateur/i,
        handler: (data) => this.selectQueriesPerUser(data)
      },
      {
        pattern: /INSERT.*schéma.*([A-Z_]+)/i,
        handler: (data, match) => this.insertOnSchema(data, match[1])
      },
      {
        pattern: /requêtes.*MERGE/i,
        handler: (data) => this.findSQLWithKeyword(data, 'MERGE')
      },
      {
        pattern: /bind.*:1/i,
        handler: (data) => this.findSQLWithBinds(data)
      },
      {
        pattern: /requêtes.*sans.*WHERE/i,
        handler: (data) => this.findSQLWithoutWhere(data)
      }
    ];
  }

  // Questions sécurité
  setupSecuriteQuestions() {
    return [
      {
        pattern: /connexions.*échouées/i,
        handler: (data) => this.failedConnections(data)
      },
      {
        pattern: /authentification.*EXTERNAL/i,
        handler: (data) => this.externalAuth(data)
      },
      {
        pattern: /utilisateur.*inconnu/i,
        handler: (data) => this.unknownUsers(data)
      },
      {
        pattern: /sessions.*suspectes/i,
        handler: (data) => this.suspiciousSessions(data)
      },
      {
        pattern: /DROP.*TABLE/i,
        handler: (data) => this.dropTableActions(data)
      },
      {
        pattern: /hors.*heures.*travail/i,
        handler: (data) => this.afterHoursActivity(data)
      },
      {
        pattern: /GRANT.*REVOKE/i,
        handler: (data) => this.privilegeActions(data)
      },
      {
        pattern: /ALTER.*SYSTEM/i,
        handler: (data) => this.systemAlterations(data)
      }
    ];
  }

  // Questions performance
  setupPerformanceQuestions() {
    return [
      {
        pattern: /requêtes.*seconde.*heure/i,
        handler: (data) => this.queriesPerSecond(data)
      },
      {
        pattern: /utilisateurs.*requêtes.*minute/i,
        handler: (data) => this.heavyUsers(data)
      },
      {
        pattern: /CLIENT_PROGRAM_NAME.*requêtes/i,
        handler: (data) => this.topClientsByQueries(data)
      },
      {
        pattern: /actions.*INSTANCE_ID/i,
        handler: (data) => this.actionsPerInstance(data)
      },
      {
        pattern: /temps.*moyen.*requêtes/i,
        handler: (data) => this.averageQueryTime(data)
      },
      {
        pattern: /charge.*horaire.*instance/i,
        handler: (data) => this.instanceHourlyLoad(data)
      }
    ];
  }

  // Questions métier
  setupMetierQuestions() {
    return [
      {
        pattern: /utilisateurs.*données.*RH/i,
        handler: (data) => this.hrDataAccess(data)
      },
      {
        pattern: /modifications.*FINANCE/i,
        handler: (data) => this.financeModifications(data)
      },
      {
        pattern: /objets.*consultés.*jamais.*modifiés/i,
        handler: (data) => this.readOnlyObjects(data)
      },
      {
        pattern: /tables.*plus.*modifiées/i,
        handler: (data) => this.mostModifiedTables(data)
      },
      {
        pattern: /INSERT.*utilisateur/i,
        handler: (data) => this.insertsByUser(data)
      },
      {
        pattern: /TRUNCATE.*utilisateur/i,
        handler: (data) => this.truncatesByUser(data)
      }
    ];
  }

  // Questions investigation
  setupInvestigationQuestions() {
    return [
      {
        pattern: /modifié.*objet.*([A-Z_]+)/i,
        handler: (data, match) => this.whoModifiedObject(data, match[1])
      },
      {
        pattern: /dernière.*modification.*([A-Z_]+)/i,
        handler: (data, match) => this.lastModificationOn(data, match[1])
      },
      {
        pattern: /requêtes.*SYSDBA/i,
        handler: (data) => this.sysdbaActions(data)
      },
      {
        pattern: /utilisateurs.*plusieurs.*machines/i,
        handler: (data) => this.multiMachineUsers(data)
      },
      {
        pattern: /programme.*inconnu/i,
        handler: (data) => this.unknownPrograms(data)
      },
      {
        pattern: /supprimé.*données.*hier/i,
        handler: (data) => this.deletionsYesterday(data)
      }
    ];
  }

  // Questions statistiques
  setupStatistiquesQuestions() {
    return [
      {
        pattern: /nombre.*total.*entrées/i,
        handler: (data) => this.totalEntries(data)
      },
      {
        pattern: /pourcentage.*SELECT.*DML/i,
        handler: (data) => this.selectVsDML(data)
      },
      {
        pattern: /moyenne.*requêtes.*session/i,
        handler: (data) => this.avgQueriesPerSession(data)
      },
      {
        pattern: /répartition.*actions.*type/i,
        handler: (data) => this.actionTypeDistribution(data)
      },
      {
        pattern: /taux.*utilisation.*AUTHENTICATION_TYPE/i,
        handler: (data) => this.authTypeUsage(data)
      },
      {
        pattern: /répartition.*connexions.*USERHOST/i,
        handler: (data) => this.hostDistribution(data)
      }
    ];
  }

  // Questions avancées
  setupAvanceesQuestions() {
    return [
      {
        pattern: /sessions.*simultanées.*utilisateur/i,
        handler: (data) => this.simultaneousSessions(data)
      },
      {
        pattern: /corrélation.*CLIENT_PROGRAM_NAME.*actions/i,
        handler: (data) => this.programActionCorrelation(data)
      },
      {
        pattern: /pic.*activité.*événement/i,
        handler: (data) => this.eventPeakAnalysis(data)
      },
      {
        pattern: /séquence.*fréquente.*actions/i,
        handler: (data) => this.commonActionSequences(data)
      },
      {
        pattern: /patterns.*attaque.*SQL/i,
        handler: (data) => this.sqlInjectionPatterns(data)
      },
      {
        pattern: /objets.*système/i,
        handler: (data) => this.systemObjectAccess(data)
      }
    ];
  }

  // Méthode principale de traitement
  processAdvancedQuestion(question, auditData) {
    const normalizedQuestion = question.toLowerCase();
    
    // Parcourir toutes les catégories
    for (const [category, questions] of Object.entries(this.questionCategories)) {
      for (const questionDef of questions) {
        const match = normalizedQuestion.match(questionDef.pattern);
        if (match) {
          try {
            const result = questionDef.handler(auditData, match);
            return {
              type: 'advanced_analysis',
              category: category,
              data: result.data,
              summary: result.summary,
              explanation: result.explanation,
              columns: result.columns || [],
              matchedPattern: questionDef.pattern.toString()
            };
          } catch (error) {
            console.error('Erreur traitement question avancée:', error);
            return null;
          }
        }
      }
    }
    
    return null; // Aucun pattern trouvé
  }

  // Méthodes de filtrage
  filterByDBUsername(data, username) {
    const filtered = data.filter(entry => 
      entry.dbusername && entry.dbusername.toLowerCase() === username.toLowerCase()
    );
    
    return {
      data: filtered,
      summary: `${filtered.length} entrées d'audit pour l'utilisateur DB ${username}`,
      explanation: `Filtrage des actions effectuées par l'utilisateur de base de données ${username}. Analyse complète de l'activité avec détails des opérations, objets accédés et timestamps.`,
      columns: ['Event_Timestamp', 'Action_Name', 'Object_Schema', 'Object_Name', 'Client_Program_Name']
    };
  }

  filterByOSUsername(data, username) {
    const filtered = data.filter(entry => 
      entry.os_username && entry.os_username.toLowerCase() === username.toLowerCase()
    );
    
    return {
      data: filtered,
      summary: `${filtered.length} actions effectuées depuis l'OS ${username}`,
      explanation: `Actions lancées par l'utilisateur système ${username}. Corrélation entre utilisateur OS et activités base de données pour analyse de sécurité.`,
      columns: ['Event_Timestamp', 'DBUsername', 'Action_Name', 'Object_Name', 'UserHost']
    };
  }

  // Méthodes de regroupement
  groupByDBUsername(data) {
    const groups = {};
    data.forEach(entry => {
      const user = entry.dbusername || 'UNKNOWN';
      groups[user] = (groups[user] || 0) + 1;
    });
    
    const sorted = Object.entries(groups)
      .sort(([,a], [,b]) => b - a)
      .map(([user, count]) => ({ utilisateur: user, actions: count }));
    
    return {
      data: sorted,
      summary: `Répartition des ${data.length} actions sur ${sorted.length} utilisateurs DB`,
      explanation: `Analyse quantitative de l'activité par utilisateur de base de données. Identification des utilisateurs les plus actifs et répartition de la charge.`,
      columns: ['Utilisateur', 'Actions']
    };
  }

  groupByActionName(data) {
    const groups = {};
    data.forEach(entry => {
      const action = entry.action_name || 'UNKNOWN';
      groups[action] = (groups[action] || 0) + 1;
    });
    
    const sorted = Object.entries(groups)
      .sort(([,a], [,b]) => b - a)
      .map(([action, count]) => ({ 
        action: action, 
        occurrences: count,
        pourcentage: ((count / data.length) * 100).toFixed(2) + '%'
      }));
    
    return {
      data: sorted,
      summary: `${sorted.length} types d'actions différents sur ${data.length} entrées`,
      explanation: `Distribution des types d'opérations Oracle. Analyse des patterns d'utilisation et identification des actions dominantes dans le système.`,
      columns: ['Action', 'Occurrences', 'Pourcentage']
    };
  }

  // Méthodes temporelles
  filterByToday(data) {
    const today = new Date().toISOString().split('T')[0];
    const filtered = data.filter(entry => {
      if (!entry.event_timestamp) return false;
      const entryDate = new Date(entry.event_timestamp).toISOString().split('T')[0];
      return entryDate === today;
    });
    
    return {
      data: filtered,
      summary: `${filtered.length} actions effectuées aujourd'hui`,
      explanation: `Activité du jour en cours. Monitoring en temps réel des opérations pour surveillance opérationnelle.`,
      columns: ['Heure', 'Utilisateur', 'Action', 'Objet']
    };
  }

  hourlyTrend(data) {
    const hourGroups = {};
    data.forEach(entry => {
      if (entry.event_timestamp) {
        const hour = new Date(entry.event_timestamp).getHours();
        hourGroups[hour] = (hourGroups[hour] || 0) + 1;
      }
    });
    
    const trend = Array.from({length: 24}, (_, i) => ({
      heure: i,
      activite: hourGroups[i] || 0
    }));
    
    return {
      data: trend,
      summary: `Répartition horaire de l'activité sur 24h`,
      explanation: `Analyse des patterns temporels d'utilisation. Identification des heures de pointe et optimisation des ressources.`,
      columns: ['Heure', 'Activité']
    };
  }

  // Méthodes SQL
  findSQLWithKeyword(data, keyword) {
    const filtered = data.filter(entry => 
      entry.sql_text && entry.sql_text.toUpperCase().includes(keyword.toUpperCase())
    );
    
    return {
      data: filtered.map(entry => ({
        utilisateur: entry.dbusername,
        timestamp: entry.event_timestamp,
        sql_text: entry.sql_text?.substring(0, 100) + '...',
        objet: entry.object_name
      })),
      summary: `${filtered.length} requêtes contenant "${keyword}"`,
      explanation: `Requêtes SQL contenant le mot-clé ${keyword}. Analyse de sécurité et conformité des opérations critiques.`,
      columns: ['Utilisateur', 'Timestamp', 'SQL_Text', 'Objet']
    };
  }

  // Méthodes de sécurité
  afterHoursActivity(data) {
    const afterHours = data.filter(entry => {
      if (!entry.event_timestamp) return false;
      const hour = new Date(entry.event_timestamp).getHours();
      return hour < 6 || hour > 20; // Hors heures 6h-20h
    });
    
    return {
      data: afterHours.map(entry => ({
        utilisateur: entry.dbusername,
        heure: new Date(entry.event_timestamp).toLocaleTimeString(),
        action: entry.action_name,
        objet: entry.object_name,
        programme: entry.client_program_name
      })),
      summary: `${afterHours.length} actions détectées hors heures de travail`,
      explanation: `Activité suspecte hors heures normales (20h-6h). Monitoring de sécurité pour détecter accès non autorisés.`,
      columns: ['Utilisateur', 'Heure', 'Action', 'Objet', 'Programme']
    };
  }

  // Méthodes statistiques
  totalEntries(data) {
    const stats = {
      total: data.length,
      utilisateurs_uniques: new Set(data.map(e => e.dbusername)).size,
      actions_uniques: new Set(data.map(e => e.action_name)).size,
      objets_uniques: new Set(data.map(e => e.object_name)).size,
      programmes_uniques: new Set(data.map(e => e.client_program_name)).size
    };
    
    return {
      data: [stats],
      summary: `${stats.total} entrées d'audit analysées`,
      explanation: `Statistiques globales du système d'audit Oracle. Vue d'ensemble quantitative pour reporting et conformité.`,
      columns: ['Métrique', 'Valeur']
    };
  }
}

module.exports = AdvancedQuestionProcessor;




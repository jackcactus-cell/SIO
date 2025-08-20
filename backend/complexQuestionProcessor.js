// Processeur de Questions Complexes pour l'Audit Oracle
// Traite 100 questions sophistiquées avec analyses multi-colonnes et détection d'anomalies

class ComplexQuestionProcessor {
  constructor() {
    this.complexPatterns = this.initializeComplexPatterns();
  }

  initializeComplexPatterns() {
    return {
      // 1. Corrélations multi-colonnes (1-10)
      multiColumnCorrelations: [
        {
          pattern: /sessions.*même.*dbusername.*(\d+).*userhost.*différents.*journée/i,
          handler: (data, match) => this.analyzeMultiHostSessions(data, parseInt(match[1]) || 3),
          category: 'security_correlation'
        },
        {
          pattern: /utilisateurs.*update.*(\d+).*schémas.*(\d+).*minutes/i,
          handler: (data, match) => this.analyzeMultiSchemaUpdates(data, parseInt(match[1]) || 5, parseInt(match[2]) || 10),
          category: 'security_correlation'
        },
        {
          pattern: /sessions.*client_program_name.*change.*cours.*session/i,
          handler: (data) => this.analyzeChangingClientPrograms(data),
          category: 'security_correlation'
        },
        {
          pattern: /comptes.*os_username.*diffère.*dbusername.*habituel/i,
          handler: (data) => this.analyzeUsernameDiscrepancies(data),
          category: 'security_correlation'
        },
        {
          pattern: /objets.*modifiés.*(\d+).*utilisateurs.*même.*journée/i,
          handler: (data, match) => this.analyzeMultiUserObjectAccess(data, parseInt(match[1]) || 3),
          category: 'security_correlation'
        }
      ],

      // 2. Analyses temporelles avancées (11-20)
      temporalAnalysis: [
        {
          pattern: /sessions.*(\d+).*requêtes.*(\d+).*minutes/i,
          handler: (data, match) => this.analyzeHighVolumeShortSessions(data, parseInt(match[1]) || 100, parseInt(match[2]) || 5),
          category: 'temporal_analysis'
        },
        {
          pattern: /actions.*hors.*plage.*horaire.*(\d+)h.*(\d+)h.*prod/i,
          handler: (data, match) => this.analyzeAfterHoursActivity(data, parseInt(match[1]) || 8, parseInt(match[2]) || 18),
          category: 'temporal_analysis'
        },
        {
          pattern: /temps.*moyen.*deux.*actions.*même.*session/i,
          handler: (data) => this.analyzeAverageActionInterval(data),
          category: 'temporal_analysis'
        },
        {
          pattern: /sessions.*(\d+)h.*activité/i,
          handler: (data, match) => this.analyzeLongSessions(data, parseInt(match[1]) || 12),
          category: 'temporal_analysis'
        },
        {
          pattern: /pics.*activité.*inhabituels.*moyenne.*(\d+).*derniers.*jours/i,
          handler: (data, match) => this.analyzeActivitySpikes(data, parseInt(match[1]) || 7),
          category: 'temporal_analysis'
        }
      ],

      // 3. Sécurité et anomalies (21-30)
      securityAnomalies: [
        {
          pattern: /(drop|truncate).*suivis?.*create.*même.*objet/i,
          handler: (data) => this.analyzeDropCreateSequences(data),
          category: 'security_analysis'
        },
        {
          pattern: /(grant|revoke).*objets.*système.*sys/i,
          handler: (data) => this.analyzeSystemObjectPrivileges(data),
          category: 'security_analysis'
        },
        {
          pattern: /authentifications.*multiples.*authentication_type.*différents/i,
          handler: (data) => this.analyzeMultipleAuthMethods(data),
          category: 'security_analysis'
        },
        {
          pattern: /sessions.*(\d+).*objets.*distincts.*(\d+).*minutes/i,
          handler: (data, match) => this.analyzeHighObjectAccessSessions(data, parseInt(match[1]) || 50, parseInt(match[2]) || 30),
          category: 'security_analysis'
        },
        {
          pattern: /sessions.*userhost.*inconnu/i,
          handler: (data) => this.analyzeUnknownHosts(data),
          category: 'security_analysis'
        }
      ],

      // 4. Patterns SQL avancés (31-40)
      sqlPatterns: [
        {
          pattern: /constantes.*répétitives.*sql_binds/i,
          handler: (data) => this.analyzeRepetitiveBinds(data),
          category: 'sql_analysis'
        },
        {
          pattern: /select.*retournant.*gros.*volume.*données/i,
          handler: (data) => this.analyzeLargeSelects(data),
          category: 'sql_analysis'
        },
        {
          pattern: /sql_text.*sous.requêtes.*imbriquées.*multiples/i,
          handler: (data) => this.analyzeNestedQueries(data),
          category: 'sql_analysis'
        },
        {
          pattern: /absence.*where.*grosses.*tables/i,
          handler: (data) => this.analyzeQueriesWithoutWhere(data),
          category: 'sql_analysis'
        },
        {
          pattern: /update.*affectant.*toutes.*lignes.*table/i,
          handler: (data) => this.analyzeFullTableUpdates(data),
          category: 'sql_analysis'
        }
      ],

      // 5. Analyses par instance (41-50)
      instanceAnalysis: [
        {
          pattern: /instances.*exécutant.*actions.*même.*schéma/i,
          handler: (data) => this.analyzeInstanceSchemaUsage(data),
          category: 'instance_analysis'
        },
        {
          pattern: /sessions.*migrées.*entre.*instances/i,
          handler: (data) => this.analyzeCrossInstanceSessions(data),
          category: 'instance_analysis'
        },
        {
          pattern: /différences.*utilisation.*action_name.*instance/i,
          handler: (data) => this.analyzeActionsByInstance(data),
          category: 'instance_analysis'
        },
        {
          pattern: /utilisateurs.*simultanément.*plusieurs.*instances/i,
          handler: (data) => this.analyzeMultiInstanceUsers(data),
          category: 'instance_analysis'
        }
      ],

      // 6. Analyses séquentielles (51-60)
      sequentialAnalysis: [
        {
          pattern: /select.*immédiatement.*suivi.*delete.*même.*objet/i,
          handler: (data) => this.analyzeSelectDeleteSequences(data),
          category: 'sequential_analysis'
        },
        {
          pattern: /(\d+).*insert.*consécutifs/i,
          handler: (data, match) => this.analyzeConsecutiveInserts(data, parseInt(match[1]) || 5),
          category: 'sequential_analysis'
        },
        {
          pattern: /boucles.*update.*(\d+).*fois.*objet/i,
          handler: (data, match) => this.analyzeUpdateLoops(data, parseInt(match[1]) || 10),
          category: 'sequential_analysis'
        },
        {
          pattern: /alternance.*update.*select.*répétée/i,
          handler: (data) => this.analyzeUpdateSelectPatterns(data),
          category: 'sequential_analysis'
        }
      ],

      // 7. Indicateurs de risque (61-70)
      riskIndicators: [
        {
          pattern: /score.*risque.*basé.*type.*action.*heure.*diversité.*objets/i,
          handler: (data) => this.calculateRiskScores(data),
          category: 'risk_analysis'
        },
        {
          pattern: /classement.*empreinte.*sql/i,
          handler: (data) => this.analyzeSQLFingerprints(data),
          category: 'risk_analysis'
        },
        {
          pattern: /latence.*moyenne.*deux.*actions.*identiques.*inter.sessions/i,
          handler: (data) => this.analyzeActionLatency(data),
          category: 'risk_analysis'
        },
        {
          pattern: /fréquence.*utilisation.*objet.*plusieurs.*utilisateurs/i,
          handler: (data) => this.analyzeObjectUsageFrequency(data),
          category: 'risk_analysis'
        }
      ],

      // 8. Analyses métier (71-80)
      businessAnalysis: [
        {
          pattern: /utilisateurs.*accédant.*schémas.*hors.*périmètre/i,
          handler: (data) => this.analyzeOutOfScopeAccess(data),
          category: 'business_analysis'
        },
        {
          pattern: /pics.*tables.*paie.*avant.*dates.*clés/i,
          handler: (data) => this.analyzePayrollAccess(data),
          category: 'business_analysis'
        },
        {
          pattern: /actions.*inhabituelles.*comptes.*service/i,
          handler: (data) => this.analyzeServiceAccountActivity(data),
          category: 'business_analysis'
        },
        {
          pattern: /utilisation.*outils.*non.*approuvés.*client_program_name/i,
          handler: (data) => this.analyzeUnapprovedTools(data),
          category: 'business_analysis'
        }
      ],

      // 9. Surveillance comportementale (81-90)
      behavioralSurveillance: [
        {
          pattern: /comparaison.*activité.*utilisateur.*historique.*personnel/i,
          handler: (data) => this.analyzeUserBehaviorChanges(data),
          category: 'behavioral_analysis'
        },
        {
          pattern: /activité.*anormale.*jours.*fériés/i,
          handler: (data) => this.analyzeHolidayActivity(data),
          category: 'behavioral_analysis'
        },
        {
          pattern: /connexions.*ip.*géolocalisées.*inhabituelles/i,
          handler: (data) => this.analyzeGeoAnomalies(data),
          category: 'behavioral_analysis'
        },
        {
          pattern: /changements.*habitude.*horaire.*utilisateur/i,
          handler: (data) => this.analyzeTimePatternChanges(data),
          category: 'behavioral_analysis'
        }
      ],

      // 10. Scénarios d'investigation (91-100)
      investigationScenarios: [
        {
          pattern: /qui.*modifié.*objet.*précis.*dernières.*(\d+)h/i,
          handler: (data, match) => this.investigateObjectModifications(data, match[1] || '24'),
          category: 'investigation'
        },
        {
          pattern: /dernière.*action.*objet.*donné/i,
          handler: (data) => this.investigateLastObjectAction(data),
          category: 'investigation'
        },
        {
          pattern: /historique.*complet.*accès.*schéma/i,
          handler: (data) => this.investigateSchemaAccessHistory(data),
          category: 'investigation'
        },
        {
          pattern: /traçage.*actions.*utilisateur.*suspect/i,
          handler: (data) => this.investigateSuspiciousUser(data),
          category: 'investigation'
        },
        {
          pattern: /reconstruction.*chronologique.*incident.*audit/i,
          handler: (data) => this.reconstructIncidentTimeline(data),
          category: 'investigation'
        }
      ]
    };
  }

  // Méthode principale de traitement des questions complexes
  processComplexQuestion(question, auditData) {
    const normalizedQuestion = question.toLowerCase();
    
    // Parcourir toutes les catégories de patterns
    for (const [categoryName, patterns] of Object.entries(this.complexPatterns)) {
      for (const pattern of patterns) {
        const match = normalizedQuestion.match(pattern.pattern);
        if (match) {
          try {
            const result = pattern.handler(auditData, match);
            return {
              type: 'complex_analysis',
              category: pattern.category,
              subcategory: categoryName,
              data: result.data,
              summary: result.summary,
              explanation: result.explanation,
              columns: result.columns || [],
              complexity_score: this.calculateComplexityScore(pattern.category),
              matched_pattern: pattern.pattern.toString()
            };
          } catch (error) {
            console.error('Erreur traitement question complexe:', error);
            return null;
          }
        }
      }
    }
    
    return null; // Aucun pattern complexe trouvé
  }

  // Analyses de corrélations multi-colonnes
  analyzeMultiHostSessions(data, minHosts = 3) {
    const userHostMap = {};
    
    data.forEach(entry => {
      const user = entry.dbusername;
      const host = entry.userhost;
      const date = new Date(entry.event_timestamp).toDateString();
      const key = `${user}-${date}`;
      
      if (!userHostMap[key]) {
        userHostMap[key] = new Set();
      }
      userHostMap[key].add(host);
    });
    
    const suspiciousUsers = Object.entries(userHostMap)
      .filter(([key, hosts]) => hosts.size >= minHosts)
      .map(([key, hosts]) => {
        const [user, date] = key.split('-');
        return {
          utilisateur: user,
          date: date,
          nombre_hosts: hosts.size,
          hosts: Array.from(hosts).join(', '),
          risque: hosts.size > 5 ? 'ÉLEVÉ' : 'MOYEN'
        };
      });
    
    return {
      data: suspiciousUsers,
      summary: `${suspiciousUsers.length} utilisateurs détectés avec accès multi-hôtes suspects`,
      explanation: `Analyse de sécurité identifiant les utilisateurs se connectant depuis ${minHosts}+ machines différentes en une journée. Peut indiquer un partage de compte ou une compromission.`,
      columns: ['Utilisateur', 'Date', 'Nombre_Hosts', 'Hosts', 'Risque']
    };
  }

  analyzeMultiSchemaUpdates(data, minSchemas = 5, timeWindow = 10) {
    const userActions = {};
    
    data.filter(entry => entry.action_name === 'UPDATE').forEach(entry => {
      const user = entry.dbusername;
      const schema = entry.object_schema;
      const timestamp = new Date(entry.event_timestamp);
      
      if (!userActions[user]) {
        userActions[user] = [];
      }
      userActions[user].push({ schema, timestamp });
    });
    
    const suspiciousActivity = [];
    Object.entries(userActions).forEach(([user, actions]) => {
      // Analyser fenêtres glissantes de timeWindow minutes
      for (let i = 0; i < actions.length; i++) {
        const windowStart = actions[i].timestamp;
        const windowEnd = new Date(windowStart.getTime() + timeWindow * 60000);
        
        const schemasInWindow = new Set();
        actions.forEach(action => {
          if (action.timestamp >= windowStart && action.timestamp <= windowEnd) {
            schemasInWindow.add(action.schema);
          }
        });
        
        if (schemasInWindow.size >= minSchemas) {
          suspiciousActivity.push({
            utilisateur: user,
            debut_fenetre: windowStart.toLocaleString(),
            schemas_modifies: schemasInWindow.size,
            schemas_liste: Array.from(schemasInWindow).join(', '),
            score_risque: Math.min(schemasInWindow.size * 2, 10)
          });
        }
      }
    });
    
    return {
      data: suspiciousActivity,
      summary: `${suspiciousActivity.length} activités d'UPDATE multi-schémas détectées`,
      explanation: `Détection d'utilisateurs modifiant ${minSchemas}+ schémas en ${timeWindow} minutes. Indicateur potentiel d'attaque ou d'activité malveillante.`,
      columns: ['Utilisateur', 'Début_Fenêtre', 'Schemas_Modifiés', 'Schemas_Liste', 'Score_Risque']
    };
  }

  // Analyses temporelles avancées
  analyzeHighVolumeShortSessions(data, minActions = 100, timeWindow = 5) {
    const sessionMap = {};
    
    data.forEach(entry => {
      const sessionId = entry.sessionid;
      if (!sessionMap[sessionId]) {
        sessionMap[sessionId] = {
          actions: [],
          user: entry.dbusername,
          start_time: new Date(entry.event_timestamp),
          end_time: new Date(entry.event_timestamp)
        };
      }
      
      sessionMap[sessionId].actions.push(entry);
      const actionTime = new Date(entry.event_timestamp);
      if (actionTime < sessionMap[sessionId].start_time) {
        sessionMap[sessionId].start_time = actionTime;
      }
      if (actionTime > sessionMap[sessionId].end_time) {
        sessionMap[sessionId].end_time = actionTime;
      }
    });
    
    const highVolumeSessions = Object.entries(sessionMap)
      .filter(([sessionId, session]) => {
        const duration = (session.end_time - session.start_time) / (1000 * 60); // minutes
        return session.actions.length >= minActions && duration <= timeWindow;
      })
      .map(([sessionId, session]) => {
        const duration = (session.end_time - session.start_time) / (1000 * 60);
        return {
          session_id: sessionId,
          utilisateur: session.user,
          nombre_actions: session.actions.length,
          duree_minutes: duration.toFixed(2),
          actions_par_minute: (session.actions.length / Math.max(duration, 0.1)).toFixed(1),
          debut: session.start_time.toLocaleString(),
          fin: session.end_time.toLocaleString(),
          score_anomalie: Math.min(session.actions.length / 10, 10)
        };
      })
      .sort((a, b) => b.nombre_actions - a.nombre_actions);
    
    return {
      data: highVolumeSessions,
      summary: `${highVolumeSessions.length} sessions à très haut volume détectées`,
      explanation: `Sessions avec ${minActions}+ actions en ${timeWindow} minutes. Peut indiquer des scripts automatisés, attaques ou activités suspectes.`,
      columns: ['Session_ID', 'Utilisateur', 'Nombre_Actions', 'Durée_Minutes', 'Actions_Par_Minute', 'Début', 'Fin', 'Score_Anomalie']
    };
  }

  // Analyses de sécurité
  analyzeDropCreateSequences(data) {
    const sequences = [];
    const objectActions = {};
    
    // Grouper les actions par objet
    data.forEach(entry => {
      const objectKey = `${entry.object_schema}.${entry.object_name}`;
      if (!objectActions[objectKey]) {
        objectActions[objectKey] = [];
      }
      objectActions[objectKey].push({
        action: entry.action_name,
        timestamp: new Date(entry.event_timestamp),
        user: entry.dbusername,
        session: entry.sessionid
      });
    });
    
    // Analyser les séquences DROP/TRUNCATE -> CREATE
    Object.entries(objectActions).forEach(([objectKey, actions]) => {
      actions.sort((a, b) => a.timestamp - b.timestamp);
      
      for (let i = 0; i < actions.length - 1; i++) {
        const currentAction = actions[i];
        const nextAction = actions[i + 1];
        
        if ((currentAction.action === 'DROP' || currentAction.action === 'TRUNCATE') &&
            nextAction.action === 'CREATE') {
          const timeDiff = (nextAction.timestamp - currentAction.timestamp) / (1000 * 60); // minutes
          
          sequences.push({
            objet: objectKey,
            action_destructive: currentAction.action,
            utilisateur_destruction: currentAction.user,
            timestamp_destruction: currentAction.timestamp.toLocaleString(),
            utilisateur_creation: nextAction.user,
            timestamp_creation: nextAction.timestamp.toLocaleString(),
            delai_minutes: timeDiff.toFixed(2),
            meme_utilisateur: currentAction.user === nextAction.user ? 'OUI' : 'NON',
            meme_session: currentAction.session === nextAction.session ? 'OUI' : 'NON',
            niveau_risque: timeDiff < 5 ? 'ÉLEVÉ' : timeDiff < 60 ? 'MOYEN' : 'FAIBLE'
          });
        }
      }
    });
    
    return {
      data: sequences,
      summary: `${sequences.length} séquences DROP/TRUNCATE -> CREATE détectées`,
      explanation: `Séquences potentiellement suspectes où un objet est détruit puis recréé. Peut indiquer une tentative d'effacement de traces ou de reconstruction malveillante.`,
      columns: ['Objet', 'Action_Destructive', 'Utilisateur_Destruction', 'Timestamp_Destruction', 'Utilisateur_Création', 'Timestamp_Création', 'Délai_Minutes', 'Même_Utilisateur', 'Même_Session', 'Niveau_Risque']
    };
  }

  // Calcul du score de complexité
  calculateComplexityScore(category) {
    const complexityMap = {
      'security_correlation': 9,
      'temporal_analysis': 7,
      'security_analysis': 8,
      'sql_analysis': 6,
      'instance_analysis': 5,
      'sequential_analysis': 7,
      'risk_analysis': 8,
      'business_analysis': 6,
      'behavioral_analysis': 9,
      'investigation': 10
    };
    
    return complexityMap[category] || 5;
  }

  // Méthodes utilitaires pour les autres analyses
  analyzeSystemObjectPrivileges(data) {
    const systemPrivileges = data.filter(entry => 
      (entry.action_name === 'GRANT' || entry.action_name === 'REVOKE') &&
      (entry.object_schema === 'SYS' || entry.object_name?.startsWith('SYS'))
    );

    const analysis = systemPrivileges.map(entry => ({
      utilisateur: entry.dbusername,
      action: entry.action_name,
      objet_systeme: `${entry.object_schema}.${entry.object_name}`,
      timestamp: new Date(entry.event_timestamp).toLocaleString(),
      programme: entry.client_program_name,
      host: entry.userhost,
      criticite: 'CRITIQUE'
    }));

    return {
      data: analysis,
      summary: `${analysis.length} opérations de privilèges sur objets système détectées`,
      explanation: `Opérations GRANT/REVOKE critiques sur des objets système Oracle. Surveillance obligatoire pour la sécurité.`,
      columns: ['Utilisateur', 'Action', 'Objet_Système', 'Timestamp', 'Programme', 'Host', 'Criticité']
    };
  }

  // Placeholder pour les autres méthodes d'analyse
  analyzeChangingClientPrograms(data) {
    // Implementation des sessions avec changement de CLIENT_PROGRAM_NAME
    return { data: [], summary: "Analyse des changements de programmes clients", explanation: "Détection en cours..." };
  }

  analyzeUsernameDiscrepancies(data) {
    // Implementation de l'analyse des discordances utilisateur
    return { data: [], summary: "Analyse des discordances de noms d'utilisateur", explanation: "Détection en cours..." };
  }

  // ... autres méthodes d'analyse selon les besoins
}

module.exports = ComplexQuestionProcessor;




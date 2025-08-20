// Générateur de réponses intelligent avec formatage optimisé pour les analyses Oracle
// Produit des réponses structurées, détaillées et exploitables pour l'étude

class EnhancedResponseGenerator {
  constructor() {
    this.responseTemplates = this.initializeResponseTemplates();
    this.formatters = this.initializeFormatters();
    this.statisticsCalculators = this.initializeStatisticsCalculators();
  }

  // Initialiser les templates de réponses sophistiqués
  initializeResponseTemplates() {
    return {
      user_analysis: {
        summary_template: "ANALYSE DÉTAILLÉE UTILISATEURS - {user_count} utilisateurs identifiés : {user_list}. Utilisateur le plus actif: {top_user} ({top_user_actions} actions, {top_user_percentage}%)",
        explanation_template: "Étude complète des {user_count} utilisateurs Oracle avec statistiques d'activité détaillées. Répartition quantitative des actions par utilisateur, pourcentages d'utilisation et diversité des opérations. Données exploitables pour l'analyse comportementale et les patterns d'usage dans le cadre de votre étude académique.",
        data_structure: {
          columns: ['Utilisateur', 'Nombre_Actions', 'Pourcentage', 'Dernière_Activité', 'Types_Actions', 'Schémas_Accédés'],
          sort_by: 'Nombre_Actions',
          sort_order: 'desc'
        }
      },

      action_analysis: {
        summary_template: "ANALYSE DÉTAILLÉE ACTIONS - {action_count} types d'actions sur {total_entries} entrées. Action dominante: {top_action} ({top_action_count} fois, {top_action_percentage}%). Distribution: {action_distribution}",
        explanation_template: "Étude statistique approfondie des {action_count} types d'opérations Oracle. Analyse fréquentielle avec pourcentages, répartition par utilisateurs et identification des actions critiques. Essentiel pour comprendre les patterns d'utilisation et les comportements dominants dans votre recherche.",
        data_structure: {
          columns: ['Action', 'Fréquence', 'Pourcentage', 'Utilisateurs_Uniques', 'Criticité', 'Dernière_Occurrence'],
          sort_by: 'Fréquence',
          sort_order: 'desc'
        }
      },

      object_analysis: {
        summary_template: "ANALYSE DÉTAILLÉE OBJETS - {object_count} objets dans {schema_count} schémas. Objet le plus accédé: {top_object} ({top_object_accesses} accès). Schéma dominant: {top_schema}",
        explanation_template: "Cartographie complète des objets Oracle avec statistiques d'accès. Identification des ressources critiques, patterns d'utilisation par schéma et analyse de la charge de travail. Données cruciales pour l'optimisation et la surveillance de sécurité.",
        data_structure: {
          columns: ['Objet', 'Schéma', 'Accès_Total', 'Utilisateurs_Distincts', 'Types_Actions', 'Dernière_Modification'],
          sort_by: 'Accès_Total',
          sort_order: 'desc'
        }
      },

      security_analysis: {
        summary_template: "ANALYSE SÉCURITÉ - {alert_count} alertes détectées. Niveau de risque: {risk_level}. Points critiques: {critical_points}",
        explanation_template: "Évaluation complète de la sécurité avec identification des menaces potentielles, accès suspects et violations de politique. Classification par niveau de criticité avec recommandations de sécurisation.",
        data_structure: {
          columns: ['Type_Alerte', 'Criticité', 'Utilisateur', 'Ressource', 'Description', 'Recommandation'],
          sort_by: 'Criticité',
          sort_order: 'desc'
        }
      },

      session_analysis: {
        summary_template: "ANALYSE SESSIONS - {session_count} sessions actives. Durée moyenne: {avg_duration}. Type d'authentification dominant: {auth_type}",
        explanation_template: "Analyse comportementale des sessions utilisateurs avec patterns de connexion, durées d'activité et méthodes d'authentification. Identification des habitudes d'usage et détection d'anomalies.",
        data_structure: {
          columns: ['Session_ID', 'Utilisateur', 'Durée', 'Actions', 'Host_Source', 'Programme_Client'],
          sort_by: 'Durée',
          sort_order: 'desc'
        }
      },

      temporal_analysis: {
        summary_template: "ANALYSE TEMPORELLE - Période {time_period}. Pic d'activité: {peak_time} ({peak_activity} actions). Pattern: {time_pattern}",
        explanation_template: "Étude chronologique des activités Oracle avec identification des tendances temporelles, pics de charge et répartition horaire. Analyse essentielle pour la planification et la détection d'anomalies.",
        data_structure: {
          columns: ['Période', 'Nombre_Actions', 'Utilisateurs_Actifs', 'Types_Actions_Dominants', 'Charge_Relative'],
          sort_by: 'Nombre_Actions',
          sort_order: 'desc'
        }
      }
    };
  }

  // Initialiser les formateurs de données
  initializeFormatters() {
    return {
      percentage: (value, total) => {
        return total > 0 ? ((value / total) * 100).toFixed(2) : '0.00';
      },

      duration: (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m${seconds % 60}s`;
        return `${seconds}s`;
      },

      timestamp: (dateString) => {
        try {
          return new Date(dateString).toLocaleString('fr-FR');
        } catch {
          return dateString;
        }
      },

      criticality: (level) => {
        const levels = {
          'critical': '🔴 CRITIQUE',
          'high': '🟠 ÉLEVÉ',
          'medium': '🟡 MOYEN',
          'low': '🟢 FAIBLE'
        };
        return levels[level] || level;
      },

      list: (items, maxItems = 5) => {
        if (!Array.isArray(items)) return String(items);
        if (items.length <= maxItems) return items.join(', ');
        return items.slice(0, maxItems).join(', ') + `... (+${items.length - maxItems} autres)`;
      }
    };
  }

  // Initialiser les calculateurs de statistiques
  initializeStatisticsCalculators() {
    return {
      user_stats: (data) => {
        const userStats = {};
        
        data.forEach(entry => {
          const user = entry.dbusername || entry.os_username || 'UNKNOWN';
          if (!userStats[user]) {
            userStats[user] = {
              actions: 0,
              unique_objects: new Set(),
              unique_schemas: new Set(),
              action_types: new Set(),
              last_activity: null,
              sessions: new Set()
            };
          }
          
          userStats[user].actions++;
          if (entry.object_name) userStats[user].unique_objects.add(entry.object_name);
          if (entry.object_schema) userStats[user].unique_schemas.add(entry.object_schema);
          if (entry.action_name) userStats[user].action_types.add(entry.action_name);
          if (entry.sessionid) userStats[user].sessions.add(entry.sessionid);
          
          const activityTime = new Date(entry.event_timestamp);
          if (!userStats[user].last_activity || activityTime > userStats[user].last_activity) {
            userStats[user].last_activity = activityTime;
          }
        });
        
        return Object.entries(userStats).map(([user, stats]) => ({
          utilisateur: user,
          nombre_actions: stats.actions,
          pourcentage: this.formatters.percentage(stats.actions, data.length),
          derniere_activite: this.formatters.timestamp(stats.last_activity),
          types_actions: stats.action_types.size,
          schemas_accedes: stats.unique_schemas.size,
          sessions: stats.sessions.size,
          objets_uniques: stats.unique_objects.size
        })).sort((a, b) => b.nombre_actions - a.nombre_actions);
      },

      action_stats: (data) => {
        const actionStats = {};
        const usersByAction = {};
        
        data.forEach(entry => {
          const action = entry.action_name || 'UNKNOWN';
          if (!actionStats[action]) {
            actionStats[action] = {
              count: 0,
              users: new Set(),
              last_occurrence: null
            };
          }
          
          actionStats[action].count++;
          if (entry.dbusername) actionStats[action].users.add(entry.dbusername);
          
          const occurrenceTime = new Date(entry.event_timestamp);
          if (!actionStats[action].last_occurrence || occurrenceTime > actionStats[action].last_occurrence) {
            actionStats[action].last_occurrence = occurrenceTime;
          }
        });
        
        return Object.entries(actionStats).map(([action, stats]) => ({
          action: action,
          frequence: stats.count,
          pourcentage: this.formatters.percentage(stats.count, data.length),
          utilisateurs_uniques: stats.users.size,
          criticite: this.getCriticalityLevel(action),
          derniere_occurrence: this.formatters.timestamp(stats.last_occurrence)
        })).sort((a, b) => b.frequence - a.frequence);
      },

      object_stats: (data) => {
        const objectStats = {};
        
        data.forEach(entry => {
          const objectKey = `${entry.object_schema || 'UNKNOWN'}.${entry.object_name || 'UNKNOWN'}`;
          if (!objectStats[objectKey]) {
            objectStats[objectKey] = {
              schema: entry.object_schema || 'UNKNOWN',
              name: entry.object_name || 'UNKNOWN',
              accesses: 0,
              users: new Set(),
              actions: new Set(),
              last_modified: null
            };
          }
          
          objectStats[objectKey].accesses++;
          if (entry.dbusername) objectStats[objectKey].users.add(entry.dbusername);
          if (entry.action_name) objectStats[objectKey].actions.add(entry.action_name);
          
          const modTime = new Date(entry.event_timestamp);
          if (!objectStats[objectKey].last_modified || modTime > objectStats[objectKey].last_modified) {
            objectStats[objectKey].last_modified = modTime;
          }
        });
        
        return Object.values(objectStats).map(stats => ({
          objet: stats.name,
          schema: stats.schema,
          acces_total: stats.accesses,
          utilisateurs_distincts: stats.users.size,
          types_actions: Array.from(stats.actions).join(', '),
          derniere_modification: this.formatters.timestamp(stats.last_modified)
        })).sort((a, b) => b.acces_total - a.acces_total);
      }
    };
  }

  // Méthode principale de génération de réponse
  generateResponse(analysisResult, auditData) {
    try {
      const { analysis } = analysisResult;
      const primaryIntent = analysis.patterns.primary_intent;
      
      if (!primaryIntent) {
        return this.generateFallbackResponse(analysisResult, auditData);
      }
      
      // Déterminer le type d'analyse requis
      const analysisType = this.mapIntentToAnalysisType(primaryIntent.category);
      
      // Calculer les statistiques appropriées
      const statistics = this.calculateStatistics(analysisType, auditData);
      
      // Générer le summary formaté
      const summary = this.generateSummary(analysisType, statistics, auditData);
      
      // Générer l'explication détaillée
      const explanation = this.generateExplanation(analysisType, statistics, analysis.confidence);
      
      // Formater les données pour l'affichage
      const formattedData = this.formatDataForDisplay(analysisType, statistics);
      
      // Générer les métadonnées de performance
      const performance = this.generatePerformanceMetrics(statistics, auditData);
      
      return {
        type: 'detailed_analysis',
        data: formattedData,
        columns: this.getColumnsForAnalysisType(analysisType),
        summary: summary,
        explanation: explanation,
        template: analysisType,
        performance: performance,
        confidence: analysis.confidence,
        analysis_metadata: {
          primary_intent: primaryIntent.category,
          entities_detected: analysis.entities.detected.length,
          processing_time: analysisResult.performance?.analysis_time_ms || 0,
          data_quality: this.assessDataQuality(auditData)
        }
      };
      
    } catch (error) {
      console.error('Erreur génération réponse:', error);
      return this.generateErrorResponse(error.message);
    }
  }

  // Mapper les intentions aux types d'analyse
  mapIntentToAnalysisType(intentCategory) {
    const mapping = {
      'userAnalysis': 'user_analysis',
      'actionAnalysis': 'action_analysis',
      'objectAnalysis': 'object_analysis',
      'securityAnalysis': 'security_analysis',
      'sessionAnalysis': 'session_analysis',
      'temporalAnalysis': 'temporal_analysis',
      'performanceAnalysis': 'action_analysis' // Fallback
    };
    
    return mapping[intentCategory] || 'user_analysis';
  }

  // Calculer les statistiques selon le type d'analyse
  calculateStatistics(analysisType, data) {
    const calculator = this.statisticsCalculators[analysisType];
    if (!calculator) {
      return this.statisticsCalculators.user_stats(data);
    }
    
    return calculator(data);
  }

  // Générer le summary formaté
  generateSummary(analysisType, statistics, data) {
    const template = this.responseTemplates[analysisType];
    if (!template) return "Analyse des données Oracle";
    
    let summary = template.summary_template;
    
    // Remplacer les placeholders selon le type d'analyse
    switch (analysisType) {
      case 'user_analysis':
        summary = summary
          .replace('{user_count}', statistics.length)
          .replace('{user_list}', this.formatters.list(statistics.map(u => u.utilisateur)))
          .replace('{top_user}', statistics[0]?.utilisateur || 'AUCUN')
          .replace('{top_user_actions}', statistics[0]?.nombre_actions || 0)
          .replace('{top_user_percentage}', statistics[0]?.pourcentage || '0.00');
        break;
        
      case 'action_analysis':
        summary = summary
          .replace('{action_count}', statistics.length)
          .replace('{total_entries}', data.length)
          .replace('{top_action}', statistics[0]?.action || 'AUCUNE')
          .replace('{top_action_count}', statistics[0]?.frequence || 0)
          .replace('{top_action_percentage}', statistics[0]?.pourcentage || '0.00')
          .replace('{action_distribution}', this.formatters.list(
            statistics.slice(0, 3).map(a => `${a.action} (${a.pourcentage}%)`)
          ));
        break;
        
      case 'object_analysis':
        const schemas = [...new Set(statistics.map(s => s.schema))];
        summary = summary
          .replace('{object_count}', statistics.length)
          .replace('{schema_count}', schemas.length)
          .replace('{top_object}', statistics[0]?.objet || 'AUCUN')
          .replace('{top_object_accesses}', statistics[0]?.acces_total || 0)
          .replace('{top_schema}', schemas[0] || 'AUCUN');
        break;
    }
    
    return summary;
  }

  // Générer l'explication détaillée
  generateExplanation(analysisType, statistics, confidence) {
    const template = this.responseTemplates[analysisType];
    if (!template) return "Analyse des données d'audit Oracle.";
    
    let explanation = template.explanation_template;
    
    // Personnaliser selon le type et les statistiques
    switch (analysisType) {
      case 'user_analysis':
        explanation = explanation.replace('{user_count}', statistics.length);
        break;
      case 'action_analysis':
        explanation = explanation.replace('{action_count}', statistics.length);
        break;
    }
    
    // Ajouter des insights basés sur la confiance
    if (confidence > 0.8) {
      explanation += " Analyse de haute précision avec données complètes.";
    } else if (confidence > 0.6) {
      explanation += " Analyse fiable avec quelques approximations.";
    } else {
      explanation += " Analyse préliminaire nécessitant validation.";
    }
    
    return explanation;
  }

  // Formater les données pour l'affichage
  formatDataForDisplay(analysisType, statistics) {
    // Limiter à 20 résultats pour l'affichage
    const limitedStats = statistics.slice(0, 20);
    
    // Ajouter des métadonnées d'affichage
    return limitedStats.map((item, index) => ({
      ...item,
      _rank: index + 1,
      _total_items: statistics.length,
      _display_percentage: this.formatters.percentage(index + 1, statistics.length)
    }));
  }

  // Obtenir les colonnes pour le type d'analyse
  getColumnsForAnalysisType(analysisType) {
    const template = this.responseTemplates[analysisType];
    return template?.data_structure?.columns || ['Élément', 'Valeur', 'Pourcentage'];
  }

  // Générer les métriques de performance
  generatePerformanceMetrics(statistics, data) {
    return {
      total_records_analyzed: data.length,
      unique_results: statistics.length,
      analysis_coverage: this.formatters.percentage(statistics.length, data.length),
      data_quality_score: this.assessDataQuality(data),
      completeness: this.calculateCompleteness(data)
    };
  }

  // Évaluer la qualité des données
  assessDataQuality(data) {
    if (data.length === 0) return 0;
    
    let qualityScore = 0;
    const sampleSize = Math.min(data.length, 100);
    const sample = data.slice(0, sampleSize);
    
    const requiredFields = ['dbusername', 'action_name', 'event_timestamp'];
    
    sample.forEach(entry => {
      let entryScore = 0;
      requiredFields.forEach(field => {
        if (entry[field] && entry[field] !== 'UNKNOWN' && entry[field] !== '') {
          entryScore += 1;
        }
      });
      qualityScore += entryScore / requiredFields.length;
    });
    
    return Math.round((qualityScore / sampleSize) * 100);
  }

  // Calculer la complétude des données
  calculateCompleteness(data) {
    if (data.length === 0) return 0;
    
    const fields = ['dbusername', 'action_name', 'object_name', 'event_timestamp'];
    let totalFields = data.length * fields.length;
    let completedFields = 0;
    
    data.forEach(entry => {
      fields.forEach(field => {
        if (entry[field] && entry[field] !== 'UNKNOWN' && entry[field] !== '') {
          completedFields++;
        }
      });
    });
    
    return Math.round((completedFields / totalFields) * 100);
  }

  // Obtenir le niveau de criticité pour une action
  getCriticalityLevel(action) {
    const criticalActions = ['DROP', 'TRUNCATE', 'DELETE'];
    const highActions = ['CREATE', 'ALTER', 'GRANT', 'REVOKE'];
    const mediumActions = ['UPDATE', 'INSERT'];
    
    const upperAction = action.toUpperCase();
    
    if (criticalActions.includes(upperAction)) return this.formatters.criticality('critical');
    if (highActions.includes(upperAction)) return this.formatters.criticality('high');
    if (mediumActions.includes(upperAction)) return this.formatters.criticality('medium');
    return this.formatters.criticality('low');
  }

  // Générer une réponse de fallback
  generateFallbackResponse(analysisResult, auditData) {
    const userStats = this.statisticsCalculators.user_stats(auditData);
    
    return {
      type: 'detailed_analysis',
      data: userStats.slice(0, 10),
      columns: ['Utilisateur', 'Nombre_Actions', 'Pourcentage', 'Dernière_Activité'],
      summary: `ANALYSE GÉNÉRALE - ${userStats.length} utilisateurs identifiés dans ${auditData.length} entrées d'audit.`,
      explanation: "Analyse générale des données d'audit Oracle avec focus sur l'activité utilisateur.",
      template: 'user_analysis',
      performance: this.generatePerformanceMetrics(userStats, auditData)
    };
  }

  // Générer une réponse d'erreur
  generateErrorResponse(errorMessage) {
    return {
      type: 'error',
      data: [],
      columns: [],
      summary: "Erreur lors de l'analyse des données",
      explanation: `Une erreur s'est produite: ${errorMessage}`,
      template: 'error',
      performance: { error: true }
    };
  }
}

module.exports = EnhancedResponseGenerator;




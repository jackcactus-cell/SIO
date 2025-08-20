// Analyseur de questions avancé avec NLP optimisé et classification intelligente
// Remplace et améliore les fonctionnalités dispersées du système

class EnhancedQuestionAnalyzer {
  constructor() {
    this.questionPatterns = this.initializeQuestionPatterns();
    this.oracleEntities = this.initializeOracleEntities();
    this.responseTemplates = this.initializeResponseTemplates();
    this.confidenceThresholds = this.initializeConfidenceThresholds();
  }

  // Initialiser les patterns de questions sophistiqués
  initializeQuestionPatterns() {
    return {
      // Analyses utilisateurs (ANALYZE_USERS)
      userAnalysis: {
        patterns: [
          /(?:quels?|liste|affiche|montre).*(?:utilisateurs?|users?|dbusername)/i,
          /(?:analyse|statistiques?).*(?:utilisateurs?|users?)/i,
          /(?:utilisateurs?|users?).*(?:actifs?|plus.*actifs?|fréquents?)/i,
          /(?:combien|nombre|count).*(?:utilisateurs?|users?)/i,
          /(?:qui|quel.*utilisateur).*(?:fait|effectue|exécute)/i,
          /(?:top|classement|ranking).*(?:utilisateurs?|users?)/i,
          /(?:qui|quels?).*(?:utilise|utilisent|accède|accèdent)/i,
          /(?:utilisateurs?|users?).*(?:connectés?|actifs?|fréquents?)/i,
          /(?:qui|quels?).*(?:a|ont).*(?:privilèges?|droits?)/i,
          /(?:utilisateurs?|users?).*(?:uniques?|différents?)/i,
          /(?:qui|quels?).*(?:effectue|effectuent|fait|font)/i,
          /(?:utilisateurs?|users?).*(?:maintenance|administration)/i
        ],
        entities: ['dbusername', 'os_username', 'userhost'],
        confidence_boost: 0.3,
        response_type: 'detailed_analysis'
      },

      // Analyses d'actions (ANALYZE_ACTIONS)
      actionAnalysis: {
        patterns: [
          /(?:quelles?|liste|affiche|montre).*(?:actions?|activités?|opérations?)/i,
          /(?:analyse|statistiques?).*(?:actions?|activités?)/i,
          /(?:actions?|activités?).*(?:plus.*fréquentes?|populaires?|courantes?)/i,
          /(?:combien|nombre|count).*(?:actions?|opérations?)/i,
          /(?:select|insert|update|delete|grant|revoke|create|drop|truncate)/i,
          /(?:action_name|type.*action)/i
        ],
        entities: ['action_name', 'sql_text'],
        confidence_boost: 0.3,
        response_type: 'detailed_analysis'
      },

      // Analyses d'objets (ANALYZE_OBJECTS)
      objectAnalysis: {
        patterns: [
          /(?:quels?|liste|affiche|montre).*(?:objets?|tables?|schémas?|schemas?)/i,
          /(?:analyse|statistiques?).*(?:objets?|tables?|schémas?)/i,
          /(?:objets?|tables?).*(?:plus.*accédés?|utilisés?|populaires?)/i,
          /(?:schémas?|schemas?).*(?:plus.*actifs?|utilisés?)/i,
          /(?:object_name|object_schema|table)/i
        ],
        entities: ['object_name', 'object_schema'],
        confidence_boost: 0.3,
        response_type: 'detailed_analysis'
      },

      // Analyses de sessions (ANALYZE_SESSIONS)
      sessionAnalysis: {
        patterns: [
          /(?:sessions?|connexions?|logons?)/i,
          /(?:sessionid|session.*id)/i,
          /(?:durée|temps).*(?:sessions?|connexions?)/i,
          /(?:authentification|authentication)/i,
          /(?:terminal|programme|client)/i
        ],
        entities: ['sessionid', 'authentication_type', 'terminal', 'client_program_name'],
        confidence_boost: 0.25,
        response_type: 'detailed_analysis'
      },

      // Analyses de sécurité (ANALYZE_SECURITY)
      securityAnalysis: {
        patterns: [
          /(?:sécurité|security|sûreté)/i,
          /(?:suspect|suspicious|anormal|inhabituel|étrange)/i,
          /(?:privilèges?|permissions?|droits?)/i,
          /(?:système|sys|admin|administrateur)/i,
          /(?:échec|failed|error|erreur)/i,
          /(?:intrusion|attaque|malveillant)/i
        ],
        entities: ['authentication_type', 'userhost', 'object_schema'],
        confidence_boost: 0.35,
        response_type: 'security_analysis'
      },

      // Analyses temporelles (ANALYZE_TEMPORAL)
      temporalAnalysis: {
        patterns: [
          /(?:quand|à.*quelle.*heure|quel.*jour|quelle.*date)/i,
          /(?:aujourd'hui|hier|demain|cette.*semaine|ce.*mois|cette.*année)/i,
          /(?:entre.*et|depuis|pendant|durant|avant|après)/i,
          /(?:historique|chronologie|timeline|évolution)/i,
          /(?:récent|dernier|dernière|récemment|latest)/i,
          /(?:event_timestamp|timestamp|date|heure)/i
        ],
        entities: ['event_timestamp'],
        confidence_boost: 0.25,
        response_type: 'temporal_analysis'
      },

      // Analyses de performance (ANALYZE_PERFORMANCE)
      performanceAnalysis: {
        patterns: [
          /(?:performance|vitesse|rapidité|lenteur)/i,
          /(?:volume|quantité|masse|gros|important)/i,
          /(?:fréquence|souvent|repeatedly|récurrent)/i,
          /(?:pic|spike|charge|load|surcharge)/i,
          /(?:temps|durée|latence|latency)/i,
          /(?:optimisation|efficacité)/i
        ],
        entities: ['sql_text', 'action_name'],
        confidence_boost: 0.2,
        response_type: 'performance_analysis'
      }
    };
  }

  // Initialiser les entités Oracle spécifiques
  initializeOracleEntities() {
    return {
      // Colonnes du schéma Oracle Audit
      columns: {
        'id': { type: 'identifier', weight: 0.1 },
        'audit_type': { type: 'metadata', weight: 0.15 },
        'sessionid': { type: 'session', weight: 0.25 },
        'os_username': { type: 'user', weight: 0.3 },
        'userhost': { type: 'network', weight: 0.25 },
        'terminal': { type: 'network', weight: 0.2 },
        'authentication_type': { type: 'security', weight: 0.3 },
        'dbusername': { type: 'user', weight: 0.35 },
        'client_program_name': { type: 'application', weight: 0.25 },
        'object_schema': { type: 'object', weight: 0.3 },
        'object_name': { type: 'object', weight: 0.3 },
        'sql_text': { type: 'query', weight: 0.25 },
        'sql_binds': { type: 'query', weight: 0.15 },
        'event_timestamp': { type: 'temporal', weight: 0.25 },
        'action_name': { type: 'action', weight: 0.35 },
        'instance_id': { type: 'metadata', weight: 0.15 },
        'instance': { type: 'metadata', weight: 0.15 }
      },

      // Actions Oracle courantes
      actions: {
        'select': { criticality: 'low', frequency: 'high' },
        'insert': { criticality: 'medium', frequency: 'medium' },
        'update': { criticality: 'medium', frequency: 'medium' },
        'delete': { criticality: 'high', frequency: 'low' },
        'create': { criticality: 'high', frequency: 'low' },
        'drop': { criticality: 'critical', frequency: 'very_low' },
        'truncate': { criticality: 'critical', frequency: 'very_low' },
        'grant': { criticality: 'high', frequency: 'low' },
        'revoke': { criticality: 'high', frequency: 'low' },
        'alter': { criticality: 'medium', frequency: 'low' }
      },

      // Programmes clients
      programs: {
        'sqlplus': { type: 'interactive', trust: 'high' },
        'toad': { type: 'gui', trust: 'high' },
        'sql_developer': { type: 'gui', trust: 'high' },
        'jdbc': { type: 'programmatic', trust: 'medium' },
        'python': { type: 'script', trust: 'medium' },
        'unknown': { type: 'unknown', trust: 'low' }
      }
    };
  }

  // Initialiser les templates de réponses
  initializeResponseTemplates() {
    return {
      detailed_analysis: {
        structure: {
          summary: 'ANALYSE DÉTAILLÉE {entity_type} - {count} {entity_plural} identifiés : {list}. {main_finding}',
          explanation: 'Étude complète des {count} {entity_plural} {context} avec statistiques d\'activité. Répartition quantitative {details} et diversité des opérations. Données exploitables pour l\'analyse comportementale et les patterns d\'usage dans le cadre de votre étude.',
          data_format: 'tabular_with_stats'
        }
      },
      security_analysis: {
        structure: {
          summary: 'ANALYSE SÉCURITÉ - {count} éléments détectés. {severity_level}: {main_threat}',
          explanation: 'Évaluation des risques de sécurité avec identification des menaces potentielles. Classification par niveau de criticité et recommandations pour renforcer la sécurité du système.',
          data_format: 'alert_with_recommendations'
        }
      },
      temporal_analysis: {
        structure: {
          summary: 'ANALYSE TEMPORELLE - Période {time_range}. Pattern dominant: {main_pattern}',
          explanation: 'Étude chronologique des activités avec identification des tendances et patterns temporels. Analyse des pics d\'activité et répartition par période.',
          data_format: 'timeline_with_metrics'
        }
      },
      performance_analysis: {
        structure: {
          summary: 'ANALYSE PERFORMANCE - {metric_count} métriques analysées. {performance_status}: {main_insight}',
          explanation: 'Évaluation des performances système avec identification des goulots d\'étranglement et optimisations possibles.',
          data_format: 'metrics_with_trends'
        }
      }
    };
  }

  // Initialiser les seuils de confiance
  initializeConfidenceThresholds() {
    return {
      very_high: 0.9,   // Traitement direct garanti
      high: 0.7,        // Traitement probable avec validation
      medium: 0.5,      // Traitement avec suggestions alternatives
      low: 0.3,         // Suggestions et reformulation
      very_low: 0.1     // Réponse générique
    };
  }

  // Méthode principale d'analyse des questions
  analyzeQuestion(question) {
    try {
      const startTime = Date.now();
      
      // 1. Pré-traitement et normalisation
      const normalizedQuestion = this.normalizeQuestion(question);
      
      // 2. Classification par patterns
      const patternAnalysis = this.classifyByPatterns(normalizedQuestion);
      
      // 3. Extraction et pondération d'entités
      const entityAnalysis = this.extractAndWeightEntities(normalizedQuestion);
      
      // 4. Analyse contextuelle
      const contextAnalysis = this.analyzeContext(normalizedQuestion, patternAnalysis, entityAnalysis);
      
      // 5. Calcul de confiance global
      const confidence = this.calculateGlobalConfidence(patternAnalysis, entityAnalysis, contextAnalysis);
      
      // 6. Détermination du type de traitement
      const processingRecommendation = this.determineProcessing(confidence, patternAnalysis);
      
      // 7. Génération des métadonnées de réponse
      const responseMetadata = this.generateResponseMetadata(patternAnalysis, entityAnalysis, confidence);
      
      const analysisTime = Date.now() - startTime;
      
      return {
        success: true,
        originalQuestion: question,
        normalizedQuestion: normalizedQuestion,
        analysis: {
          patterns: patternAnalysis,
          entities: entityAnalysis,
          context: contextAnalysis,
          confidence: confidence,
          processing: processingRecommendation,
          response_metadata: responseMetadata
        },
        performance: {
          analysis_time_ms: analysisTime,
          confidence_level: this.getConfidenceLevel(confidence)
        },
        recommendation: {
          should_process: confidence >= this.confidenceThresholds.medium,
          processor_type: processingRecommendation.processor,
          fallback_suggestions: confidence < this.confidenceThresholds.medium ? 
            this.generateFallbackSuggestions(normalizedQuestion) : []
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        confidence: 0.0,
        recommendation: {
          should_process: false,
          processor_type: 'error_handler',
          fallback_suggestions: this.getDefaultSuggestions()
        }
      };
    }
  }

  // Normalisation avancée des questions
  normalizeQuestion(question) {
    return question
      .toLowerCase()
      .trim()
      // Corriger les fautes courantes
      .replace(/utilisateu[rs]/g, 'utilisateur')
      .replace(/analys[es]/g, 'analyse')
      .replace(/object[s]/g, 'objet')
      // Standardiser les termes Oracle
      .replace(/db_?username/gi, 'dbusername')
      .replace(/os_?username/gi, 'os_username')
      .replace(/object_?name/gi, 'object_name')
      .replace(/object_?schema/gi, 'object_schema')
      .replace(/client_?program/gi, 'client_program_name')
      // Normaliser les expressions temporelles
      .replace(/aujoud'hui/g, 'aujourd\'hui')
      .replace(/cette semaine/g, 'cette_semaine')
      // Normaliser la ponctuation
      .replace(/[?!.,;:]{2,}/g, '')
      .replace(/\s+/g, ' ');
  }

  // Classification par patterns améliorée
  classifyByPatterns(question) {
    const results = {
      matched_categories: [],
      primary_intent: null,
      confidence_scores: {},
      matched_patterns: []
    };

    // Analyser chaque catégorie de patterns
    Object.entries(this.questionPatterns).forEach(([category, config]) => {
      let categoryScore = 0;
      const matchedPatterns = [];

      config.patterns.forEach(pattern => {
        if (pattern.test(question)) {
          categoryScore += 1;
          matchedPatterns.push(pattern.toString());
        }
      });

      if (categoryScore > 0) {
        // Calculer le score pondéré
        const weightedScore = (categoryScore / config.patterns.length) + config.confidence_boost;
        
        results.matched_categories.push({
          category: category,
          score: weightedScore,
          matches: categoryScore,
          patterns: matchedPatterns,
          response_type: config.response_type
        });
        
        results.confidence_scores[category] = weightedScore;
      }
    });

    // Déterminer l'intention primaire
    if (results.matched_categories.length > 0) {
      results.matched_categories.sort((a, b) => b.score - a.score);
      results.primary_intent = results.matched_categories[0];
    }

    return results;
  }

  // Extraction et pondération d'entités Oracle
  extractAndWeightEntities(question) {
    const entities = {
      detected: [],
      by_type: {},
      total_weight: 0,
      column_matches: [],
      action_matches: [],
      value_matches: []
    };

    // Détecter les colonnes du schéma
    Object.entries(this.oracleEntities.columns).forEach(([column, config]) => {
      if (question.includes(column)) {
        entities.detected.push({
          entity: column,
          type: config.type,
          weight: config.weight,
          category: 'column'
        });
        entities.column_matches.push(column);
        entities.total_weight += config.weight;
        
        if (!entities.by_type[config.type]) {
          entities.by_type[config.type] = [];
        }
        entities.by_type[config.type].push(column);
      }
    });

    // Détecter les actions Oracle
    Object.entries(this.oracleEntities.actions).forEach(([action, config]) => {
      if (question.includes(action)) {
        entities.detected.push({
          entity: action,
          type: 'action',
          weight: 0.3,
          category: 'action',
          criticality: config.criticality
        });
        entities.action_matches.push(action);
        entities.total_weight += 0.3;
      }
    });

    // Extraire les valeurs entre quotes
    const quotedValues = question.match(/'([^']+)'/g);
    if (quotedValues) {
      quotedValues.forEach(value => {
        const cleanValue = value.replace(/'/g, '');
        entities.detected.push({
          entity: cleanValue,
          type: 'value',
          weight: 0.2,
          category: 'value'
        });
        entities.value_matches.push(cleanValue);
        entities.total_weight += 0.2;
      });
    }

    return entities;
  }

  // Analyse contextuelle avancée
  analyzeContext(question, patterns, entities) {
    return {
      question_type: this.determineQuestionType(question),
      complexity_level: this.calculateComplexity(patterns, entities),
      requires_aggregation: this.requiresAggregation(question),
      requires_filtering: this.requiresFiltering(question, entities),
      requires_temporal_analysis: entities.column_matches.includes('event_timestamp'),
      requires_security_check: patterns.confidence_scores['securityAnalysis'] > 0,
      suggested_columns: this.suggestRelevantColumns(patterns, entities),
      analysis_scope: this.determineAnalysisScope(question, entities)
    };
  }

  // Calcul de confiance global optimisé
  calculateGlobalConfidence(patterns, entities, context) {
    let confidence = 0.0;

    // Base sur les patterns (40%)
    if (patterns.primary_intent) {
      confidence += patterns.primary_intent.score * 0.4;
      
      // Bonus spécial pour les questions sur les utilisateurs
      if (patterns.primary_intent.category === 'userAnalysis') {
        confidence += 0.2; // Bonus de 20% pour les questions utilisateurs
      }
    }

    // Base sur les entités (30%)
    const entityScore = Math.min(entities.total_weight / 2, 1.0);
    confidence += entityScore * 0.3;

    // Base sur le contexte (20%)
    let contextScore = 0;
    if (context.requires_aggregation) contextScore += 0.2;
    if (context.requires_filtering) contextScore += 0.2;
    if (context.suggested_columns.length > 0) contextScore += 0.3;
    if (context.complexity_level > 1) contextScore += 0.3;
    confidence += Math.min(contextScore, 1.0) * 0.2;

    // Bonus pour questions bien structurées (10%)
    if (entities.column_matches.length > 0 && patterns.primary_intent) {
      confidence += 0.1;
    }

    // Bonus supplémentaire pour les questions sur les utilisateurs avec mots-clés spécifiques
    const questionKeywords = ['utilisateur', 'user', 'qui', 'actif', 'connecté', 'privilège'];
    const hasUserKeywords = questionKeywords.some(keyword => 
      context.question_type && context.question_type.toLowerCase().includes(keyword)
    );
    
    if (hasUserKeywords && patterns.primary_intent?.category === 'userAnalysis') {
      confidence += 0.15; // Bonus supplémentaire de 15%
    }

    return Math.min(confidence, 1.0);
  }

  // Détermination du type de traitement
  determineProcessing(confidence, patterns) {
    if (confidence >= this.confidenceThresholds.very_high) {
      return {
        processor: 'advanced_analytical',
        priority: 'high',
        reason: 'Très haute confiance - Traitement analytique avancé'
      };
    } else if (confidence >= this.confidenceThresholds.high) {
      return {
        processor: 'standard_analytical',
        priority: 'medium',
        reason: 'Haute confiance - Traitement analytique standard'
      };
    } else if (confidence >= this.confidenceThresholds.medium) {
      return {
        processor: 'basic_analytical',
        priority: 'low',
        reason: 'Confiance moyenne - Traitement de base avec suggestions'
      };
    } else {
      return {
        processor: 'conversational',
        priority: 'minimal',
        reason: 'Faible confiance - Mode conversationnel avec reformulation'
      };
    }
  }

  // Génération des métadonnées de réponse
  generateResponseMetadata(patterns, entities, confidence) {
    const responseType = patterns.primary_intent?.response_type || 'detailed_analysis';
    const template = this.responseTemplates[responseType];
    
    return {
      response_type: responseType,
      template: template,
      suggested_format: template?.structure?.data_format || 'tabular_with_stats',
      entity_focus: this.determinePrimaryEntity(entities),
      confidence_display: this.shouldDisplayConfidence(confidence),
      include_explanations: confidence >= this.confidenceThresholds.medium
    };
  }

  // Méthodes utilitaires
  determineQuestionType(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Questions analytiques
    if (/(?:analyse|statistiques?|combien|nombre|classement|top|plus|moins)/i.test(lowerQuestion)) {
      return 'analytical';
    } 
    // Questions de listing
    else if (/(?:liste|affiche|montre|quels?|quelles?)/i.test(lowerQuestion)) {
      return 'listing';
    } 
    // Questions interrogatives (particulièrement pour les utilisateurs)
    else if (/(?:qui|quand|où|comment|pourquoi)/i.test(lowerQuestion)) {
      // Bonus spécial pour les questions "qui" (utilisateurs)
      if (lowerQuestion.includes('qui')) {
        return 'user_interrogative';
      }
      return 'interrogative';
    }
    // Questions sur les utilisateurs spécifiquement
    else if (/(?:utilisateur|user|actif|connecté|privilège)/i.test(lowerQuestion)) {
      return 'user_related';
    }
    
    return 'simple';
  }

  calculateComplexity(patterns, entities) {
    let complexity = 1;
    
    if (patterns.matched_categories.length > 1) complexity += 2;
    if (entities.detected.length > 3) complexity += 1;
    if (entities.action_matches.length > 1) complexity += 1;
    if (entities.value_matches.length > 0) complexity += 1;
    
    return Math.min(complexity, 5);
  }

  requiresAggregation(question) {
    return /(?:combien|nombre|total|somme|moyenne|statistiques?|top|plus|moins|count|sum|avg)/i.test(question);
  }

  requiresFiltering(question, entities) {
    return entities.value_matches.length > 0 || 
           /(?:pour|avec|où|qui|dont|having|where)/i.test(question);
  }

  suggestRelevantColumns(patterns, entities) {
    const suggestions = new Set();
    
    if (patterns.primary_intent) {
      const category = patterns.primary_intent.category;
      const config = this.questionPatterns[category];
      if (config && config.entities) {
        config.entities.forEach(entity => suggestions.add(entity));
      }
    }
    
    entities.column_matches.forEach(col => suggestions.add(col));
    
    return Array.from(suggestions);
  }

  determineAnalysisScope(question, entities) {
    if (entities.total_weight > 1.0) return 'detailed';
    if (entities.detected.length > 2) return 'comprehensive';
    if (entities.detected.length > 0) return 'targeted';
    return 'general';
  }

  determinePrimaryEntity(entities) {
    if (entities.detected.length === 0) return null;
    
    return entities.detected.reduce((prev, current) => 
      (prev.weight > current.weight) ? prev : current
    );
  }

  getConfidenceLevel(confidence) {
    if (confidence >= this.confidenceThresholds.very_high) return 'très_élevée';
    if (confidence >= this.confidenceThresholds.high) return 'élevée';
    if (confidence >= this.confidenceThresholds.medium) return 'moyenne';
    if (confidence >= this.confidenceThresholds.low) return 'faible';
    return 'très_faible';
  }

  shouldDisplayConfidence(confidence) {
    return confidence >= this.confidenceThresholds.medium;
  }

  generateFallbackSuggestions(question) {
    // Analyser les mots-clés présents pour suggestions ciblées
    const suggestions = [];
    
    if (/utilisateur/i.test(question)) {
      suggestions.push("Quels sont les utilisateurs les plus actifs ?");
      suggestions.push("Combien d'utilisateurs distincts se connectent ?");
    }
    
    if (/action/i.test(question)) {
      suggestions.push("Quelles sont les actions les plus fréquentes ?");
      suggestions.push("Analyse des actions par utilisateur");
    }
    
    if (/objet|table|schéma/i.test(question)) {
      suggestions.push("Quels objets sont les plus accédés ?");
      suggestions.push("Analyse des schémas par activité");
    }
    
    if (suggestions.length === 0) {
      return this.getDefaultSuggestions();
    }
    
    return suggestions.slice(0, 3);
  }

  getDefaultSuggestions() {
    return [
      "Quels sont les utilisateurs les plus actifs ?",
      "Quelles sont les actions les plus fréquentes ?",
      "Quels objets sont les plus accédés ?",
      "Y a-t-il des activités suspectes ?"
    ];
  }

  // Méthode de debug pour analyser une question
  debugAnalysis(question) {
    const result = this.analyzeQuestion(question);
    
    console.log('\n=== ANALYSE QUESTION DEBUG ===');
    console.log('Question:', question);
    console.log('Normalisée:', result.normalizedQuestion);
    console.log('Patterns:', result.analysis.patterns);
    console.log('Entités:', result.analysis.entities);
    console.log('Contexte:', result.analysis.context);
    console.log('Confiance:', result.analysis.confidence);
    console.log('Recommandation:', result.recommendation);
    console.log('==============================\n');
    
    return result;
  }
}

module.exports = EnhancedQuestionAnalyzer;




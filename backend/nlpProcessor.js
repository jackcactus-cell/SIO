// Module NLP pour traitement intelligent des questions Oracle Audit
// Analyse sémantique, extraction d'entités et transcription automatique

class NLPProcessor {
  constructor() {
    this.questionPatterns = this.initializeQuestionPatterns();
    this.entityExtractor = this.initializeEntityExtractor();
    this.intentClassifier = this.initializeIntentClassifier();
  }

  // Initialiser les patterns de reconnaissance de questions
  initializeQuestionPatterns() {
    return {
      // Questions d'analyse utilisateur
      userAnalysis: [
        /(?:quels?|liste|affiche|montre).*(?:utilisateurs?|users?|dbusername)/i,
        /(?:analyse|statistiques?).*(?:utilisateurs?|users?)/i,
        /(?:utilisateurs?|users?).*(?:actifs?|plus.*actifs?)/i,
        /(?:combien|nombre).*(?:utilisateurs?|users?)/i,
        /(?:qui|quel.*utilisateur).*(?:fait|effectue|exécute)/i
      ],
      
      // Questions d'analyse d'actions
      actionAnalysis: [
        /(?:quelles?|liste|affiche|montre).*(?:actions?|action_name)/i,
        /(?:analyse|statistiques?).*(?:actions?|activités?)/i,
        /(?:actions?|activités?).*(?:plus.*fréquentes?|populaires?)/i,
        /(?:combien|nombre).*(?:actions?|activités?)/i,
        /(?:select|insert|update|delete|grant|revoke)/i
      ],
      
      // Questions d'analyse d'objets
      objectAnalysis: [
        /(?:quels?|liste|affiche|montre).*(?:objets?|tables?|object_name|object_schema)/i,
        /(?:analyse|statistiques?).*(?:objets?|schémas?)/i,
        /(?:objets?|tables?).*(?:plus.*accédés?|utilisés?)/i,
        /(?:schémas?|schemas?).*(?:plus.*actifs?)/i,
        /(?:combien|nombre).*(?:objets?|tables?|schémas?)/i
      ],
      
      // Questions temporelles
      temporalAnalysis: [
        /(?:quand|à.*quelle.*heure|quel.*jour)/i,
        /(?:aujourd'hui|hier|cette.*semaine|ce.*mois)/i,
        /(?:entre.*et|depuis|pendant|durant)/i,
        /(?:historique|chronologie|timeline)/i,
        /(?:récent|dernier|dernière|récemment)/i
      ],
      
      // Questions de sécurité
      securityAnalysis: [
        /(?:sécurité|security|authentification|authentication)/i,
        /(?:suspect|suspicious|anormal|inhabituel)/i,
        /(?:connexions?|logon|login)/i,
        /(?:privilèges?|permissions?|grant|revoke)/i,
        /(?:échec|failed|error|erreur)/i
      ],
      
      // Questions de performance
      performanceAnalysis: [
        /(?:performance|lent|slow|rapide|fast)/i,
        /(?:volume|gros|massif|important)/i,
        /(?:fréquence|souvent|repeatedly)/i,
        /(?:pic|spike|charge|load)/i,
        /(?:temps|durée|latence|latency)/i
      ]
    };
  }

  // Initialiser l'extracteur d'entités Oracle
  initializeEntityExtractor() {
    return {
      // Colonnes du schéma Oracle Audit
      schemaColumns: [
        'id', 'audit_type', 'sessionid', 'os_username', 'userhost', 'terminal',
        'authentication_type', 'dbusername', 'client_program_name', 
        'object_schema', 'object_name', 'sql_text', 'sql_binds', 
        'event_timestamp', 'action_name', 'instance_id', 'instance'
      ],
      
      // Actions Oracle courantes
      oracleActions: [
        'select', 'insert', 'update', 'delete', 'merge', 'create', 'drop',
        'alter', 'grant', 'revoke', 'truncate', 'commit', 'rollback',
        'logon', 'logoff', 'connect', 'disconnect'
      ],
      
      // Programmes clients courants
      clientPrograms: [
        'sqlplus', 'toad', 'sql_developer', 'plsql_developer', 'jdbc',
        'odbc', 'oci', 'oracle_forms', 'oracle_reports'
      ],
      
      // Types d'authentification
      authTypes: [
        'password', 'external', 'proxy', 'global', 'network'
      ]
    };
  }

  // Initialiser le classificateur d'intentions
  initializeIntentClassifier() {
    return {
      // Intentions primaires
      primaryIntents: {
        'ANALYZE_USERS': ['utilisateur', 'user', 'dbusername', 'qui', 'combien d\'utilisateurs'],
        'ANALYZE_ACTIONS': ['action', 'activité', 'select', 'insert', 'update', 'delete', 'que fait'],
        'ANALYZE_OBJECTS': ['objet', 'table', 'schéma', 'object_name', 'object_schema'],
        'ANALYZE_SESSIONS': ['session', 'connexion', 'logon', 'login'],
        'ANALYZE_SECURITY': ['sécurité', 'suspect', 'privilège', 'authentification'],
        'ANALYZE_PERFORMANCE': ['performance', 'lent', 'volume', 'fréquence'],
        'ANALYZE_TEMPORAL': ['quand', 'heure', 'jour', 'récent', 'historique']
      },
      
      // Modificateurs d'intention
      intentModifiers: {
        'FILTER': ['pour', 'avec', 'où', 'qui', 'dont'],
        'AGGREGATE': ['combien', 'nombre', 'total', 'somme', 'moyenne'],
        'SORT': ['plus', 'moins', 'meilleur', 'top', 'classement'],
        'TEMPORAL': ['depuis', 'entre', 'pendant', 'avant', 'après']
      }
    };
  }

  // Méthode principale d'analyse NLP
  processQuestion(question) {
    try {
      // 1. Normalisation et nettoyage
      const normalizedQuestion = this.normalizeQuestion(question);
      
      // 2. Classification d'intention
      const intent = this.classifyIntent(normalizedQuestion);
      
      // 3. Extraction d'entités
      const entities = this.extractEntities(normalizedQuestion);
      
      // 4. Analyse de contexte
      const context = this.analyzeContext(normalizedQuestion, intent, entities);
      
      // 5. Génération de requête structurée
      const structuredQuery = this.generateStructuredQuery(intent, entities, context);
      
      // 6. Calcul de confiance
      const confidence = this.calculateConfidence(intent, entities, context);
      
      return {
        success: true,
        originalQuestion: question,
        normalizedQuestion: normalizedQuestion,
        intent: intent,
        entities: entities,
        context: context,
        structuredQuery: structuredQuery,
        confidence: confidence,
        shouldProcess: confidence > 0.6,
        processingRecommendation: this.getProcessingRecommendation(intent, confidence)
      };
      
    } catch (error) {
      console.error('Erreur traitement NLP:', error);
      return {
        success: false,
        error: error.message,
        confidence: 0.0,
        shouldProcess: false
      };
    }
  }

  // Normalisation de la question
  normalizeQuestion(question) {
    return question
      .toLowerCase()
      .trim()
      // Supprimer la ponctuation excessive
      .replace(/[?!.,;:]{2,}/g, '')
      // Normaliser les espaces
      .replace(/\s+/g, ' ')
      // Corriger les fautes courantes
      .replace(/utilisateu[rs]/g, 'utilisateur')
      .replace(/analys[es]/g, 'analyse')
      .replace(/object[s]/g, 'objet')
      // Standardiser les termes Oracle
      .replace(/db_?username/gi, 'dbusername')
      .replace(/os_?username/gi, 'os_username')
      .replace(/object_?name/gi, 'object_name')
      .replace(/object_?schema/gi, 'object_schema');
  }

  // Classification d'intention
  classifyIntent(question) {
    const intentScores = {};
    
    // Calculer les scores pour chaque intention primaire
    Object.entries(this.intentClassifier.primaryIntents).forEach(([intent, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (question.includes(keyword)) {
          score += 1;
        }
      });
      intentScores[intent] = score;
    });
    
    // Trouver l'intention avec le score le plus élevé
    const maxScore = Math.max(...Object.values(intentScores));
    const primaryIntent = Object.keys(intentScores).find(intent => 
      intentScores[intent] === maxScore
    ) || 'UNKNOWN';
    
    // Détecter les modificateurs
    const modifiers = [];
    Object.entries(this.intentClassifier.intentModifiers).forEach(([modifier, keywords]) => {
      if (keywords.some(keyword => question.includes(keyword))) {
        modifiers.push(modifier);
      }
    });
    
    return {
      primary: primaryIntent,
      modifiers: modifiers,
      confidence: maxScore > 0 ? Math.min(maxScore / 3, 1.0) : 0.1
    };
  }

  // Extraction d'entités
  extractEntities(question) {
    const entities = {
      columns: [],
      actions: [],
      programs: [],
      authTypes: [],
      values: [],
      timeExpressions: []
    };
    
    // Extraire les colonnes du schéma
    this.entityExtractor.schemaColumns.forEach(column => {
      if (question.includes(column)) {
        entities.columns.push(column);
      }
    });
    
    // Extraire les actions Oracle
    this.entityExtractor.oracleActions.forEach(action => {
      if (question.includes(action)) {
        entities.actions.push(action);
      }
    });
    
    // Extraire les programmes clients
    this.entityExtractor.clientPrograms.forEach(program => {
      if (question.includes(program)) {
        entities.programs.push(program);
      }
    });
    
    // Extraire les valeurs entre quotes
    const quotedValues = question.match(/'([^']+)'/g);
    if (quotedValues) {
      entities.values = quotedValues.map(val => val.replace(/'/g, ''));
    }
    
    // Extraire les expressions temporelles
    const timePatterns = [
      /aujourd'hui/i, /hier/i, /demain/i,
      /cette\s+semaine/i, /ce\s+mois/i, /cette\s+année/i,
      /\d{1,2}h\d{0,2}/i, /\d{1,2}:\d{2}/i,
      /depuis\s+\d+/i, /entre\s+.*\s+et\s+/i
    ];
    
    timePatterns.forEach(pattern => {
      const matches = question.match(pattern);
      if (matches) {
        entities.timeExpressions.push(...matches);
      }
    });
    
    return entities;
  }

  // Analyse de contexte
  analyzeContext(question, intent, entities) {
    return {
      questionType: this.determineQuestionType(question),
      complexity: this.calculateComplexity(intent, entities),
      requiresAggregation: this.requiresAggregation(question),
      requiresFiltering: this.requiresFiltering(question, entities),
      requiresTemporalAnalysis: entities.timeExpressions.length > 0,
      suggestedColumns: this.suggestRelevantColumns(intent, entities)
    };
  }

  // Génération de requête structurée
  generateStructuredQuery(intent, entities, context) {
    const query = {
      type: intent.primary,
      filters: [],
      aggregations: [],
      sorting: [],
      groupBy: [],
      timeRange: null
    };
    
    // Ajouter les filtres basés sur les entités
    if (entities.values.length > 0) {
      entities.values.forEach(value => {
        query.filters.push({
          type: 'value_filter',
          value: value,
          suggestedColumns: entities.columns
        });
      });
    }
    
    // Ajouter les agrégations si nécessaire
    if (context.requiresAggregation) {
      query.aggregations.push({
        type: 'count',
        groupBy: context.suggestedColumns[0] || 'dbusername'
      });
    }
    
    return query;
  }

  // Calcul de confiance global
  calculateConfidence(intent, entities, context) {
    let confidence = 0.0;
    
    // Confiance basée sur l'intention
    confidence += intent.confidence * 0.4;
    
    // Confiance basée sur les entités
    const entityScore = (entities.columns.length * 0.2 + 
                        entities.actions.length * 0.15 + 
                        entities.values.length * 0.1) / 3;
    confidence += Math.min(entityScore, 0.3);
    
    // Confiance basée sur le type de question
    if (context.questionType === 'analytical') {
      confidence += 0.2;
    } else if (context.questionType === 'simple') {
      confidence += 0.1;
    }
    
    // Bonus pour les questions bien structurées
    if (entities.columns.length > 0 && intent.primary !== 'UNKNOWN') {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  // Déterminer le type de question
  determineQuestionType(question) {
    if (question.match(/(?:analyse|statistiques?|combien|nombre|classement|top)/i)) {
      return 'analytical';
    } else if (question.match(/(?:liste|affiche|montre|quels?)/i)) {
      return 'listing';
    } else if (question.match(/(?:qui|quand|où|comment|pourquoi)/i)) {
      return 'interrogative';
    }
    return 'simple';
  }

  // Calculer la complexité
  calculateComplexity(intent, entities) {
    let complexity = 1;
    
    if (intent.modifiers.length > 1) complexity += 2;
    if (entities.columns.length > 2) complexity += 1;
    if (entities.timeExpressions.length > 0) complexity += 1;
    if (entities.actions.length > 1) complexity += 1;
    
    return Math.min(complexity, 5);
  }

  // Vérifie si agrégation nécessaire
  requiresAggregation(question) {
    return /(?:combien|nombre|total|somme|moyenne|statistiques?|top|plus|moins)/i.test(question);
  }

  // Vérifie si filtrage nécessaire
  requiresFiltering(question, entities) {
    return entities.values.length > 0 || 
           /(?:pour|avec|où|qui|dont)/i.test(question);
  }

  // Suggérer les colonnes pertinentes
  suggestRelevantColumns(intent, entities) {
    const suggestions = [];
    
    switch (intent.primary) {
      case 'ANALYZE_USERS':
        suggestions.push('dbusername', 'os_username');
        break;
      case 'ANALYZE_ACTIONS':
        suggestions.push('action_name', 'dbusername');
        break;
      case 'ANALYZE_OBJECTS':
        suggestions.push('object_name', 'object_schema');
        break;
      case 'ANALYZE_SESSIONS':
        suggestions.push('sessionid', 'dbusername', 'userhost');
        break;
    }
    
    // Ajouter les colonnes déjà détectées
    suggestions.push(...entities.columns);
    
    return [...new Set(suggestions)]; // Supprimer les doublons
  }

  // Recommandation de traitement
  getProcessingRecommendation(intent, confidence) {
    if (confidence > 0.8) {
      return {
        processor: 'advanced',
        reason: 'Haute confiance - Traitement avancé recommandé'
      };
    } else if (confidence > 0.6) {
      return {
        processor: 'standard',
        reason: 'Confiance moyenne - Traitement standard recommandé'
      };
    } else if (confidence > 0.3) {
      return {
        processor: 'simple',
        reason: 'Faible confiance - Traitement simple recommandé'
      };
    } else {
      return {
        processor: 'fallback',
        reason: 'Très faible confiance - Traitement de fallback'
      };
    }
  }

  // Méthode utilitaire pour débuggage
  analyzeQuestionDebug(question) {
    const result = this.processQuestion(question);
    
    console.log('\n=== ANALYSE NLP DEBUG ===');
    console.log('Question originale:', question);
    console.log('Question normalisée:', result.normalizedQuestion);
    console.log('Intention:', result.intent);
    console.log('Entités:', result.entities);
    console.log('Contexte:', result.context);
    console.log('Confiance:', result.confidence);
    console.log('Recommandation:', result.processingRecommendation);
    console.log('========================\n');
    
    return result;
  }
}

module.exports = NLPProcessor;




// Système de conversation intelligent pour le chatbot SAO
class IntelligentChatbot {
  constructor() {
    this.conversationHistory = [];
    this.userContext = {};
    this.greetingPatterns = [
      /^(bonjour|salut|hello|hi|hey|bonsoir|bon matin|bonne journée)/i,
      /^(comment ça va|ça va|comment allez-vous|comment tu vas)/i,
      /^(merci|thanks|thank you)/i,
      /^(au revoir|bye|goodbye|à bientôt|à plus)/i
    ];
    
    this.questionKeywords = [
      'utilisateur', 'action', 'objet', 'sécurité', 'statistique', 'temps', 'accès', 
      'client', 'infrastructure', 'session', 'table', 'schéma', 'requête', 'sql',
      'programme', 'terminal', 'hôte', 'authentification', 'audit', 'base de données',
      'utilisateur', 'user', 'utilisateurs', 'users', 'personne', 'personnes',
      'action', 'actions', 'opération', 'opérations', 'activité', 'activités',
      'objet', 'objets', 'table', 'tables', 'vue', 'vues', 'procédure', 'procédures',
      'sécurité', 'security', 'sûr', 'sûreté', 'protection', 'accès', 'access',
      'statistique', 'statistiques', 'stats', 'métrique', 'métriques', 'performance',
      'temps', 'time', 'heure', 'heures', 'période', 'périodes', 'date', 'dates',
      'client', 'clients', 'application', 'applications', 'programme', 'programmes',
      'infrastructure', 'serveur', 'serveurs', 'hôte', 'hôtes', 'host', 'hosts',
      'session', 'sessions', 'connexion', 'connexions', 'connection', 'connections',
      'requête', 'requêtes', 'query', 'queries', 'sql', 'select', 'insert', 'update', 'delete',
      'terminal', 'terminals', 'console', 'consoles', 'interface', 'interfaces',
      'authentification', 'auth', 'login', 'connexion', 'user', 'password',
      'audit', 'audits', 'traçabilité', 'traçage', 'log', 'logs', 'historique',
      'base de données', 'database', 'oracle', 'db', 'schema', 'schemas'
    ];
  }

  // Analyser le type de message
  analyzeMessage(message) {
    try {
      const normalizedMessage = message.toLowerCase().trim();
      
      // Vérifier si c'est une question temporelle
      const timeKeywords = ['jour', 'journée', 'date', 'temps', 'heure', 'période', 'activité', 'quand', 'moment'];
      const isTimeQuestion = timeKeywords.some(keyword => normalizedMessage.includes(keyword));
      
      if (isTimeQuestion) {
        return { type: 'time_question', confidence: 0.9 };
      }
      
      // Vérifier si c'est une salutation
      for (const pattern of this.greetingPatterns) {
        if (pattern.test(normalizedMessage)) {
          return { type: 'greeting', pattern: pattern.source };
        }
      }
      
      // Vérifier si c'est une question
      if (normalizedMessage.includes('?') || 
          normalizedMessage.includes('quoi') || 
          normalizedMessage.includes('comment') || 
          normalizedMessage.includes('quand') || 
          normalizedMessage.includes('où') || 
          normalizedMessage.includes('qui') || 
          normalizedMessage.includes('combien') ||
          normalizedMessage.includes('pourquoi')) {
        return { type: 'question', confidence: this.calculateQuestionConfidence(normalizedMessage) };
      }
      
      // Vérifier si c'est une demande d'aide
      if (normalizedMessage.includes('aide') || 
          normalizedMessage.includes('help') || 
          normalizedMessage.includes('comment utiliser') ||
          normalizedMessage.includes('que puis-je faire')) {
        return { type: 'help' };
      }
      
      return { type: 'statement' };
    } catch (error) {
      console.error('Erreur lors de l\'analyse du message:', error);
      return { type: 'statement' };
    }
  }

  // Extraire les mots-clés d'un message
  extractKeywords(message) {
    try {
      const normalizedMessage = message.toLowerCase();
      const extractedKeywords = [];
      const keywordCategories = {
        users: ['utilisateur', 'user', 'utilisateurs', 'users', 'personne', 'personnes'],
        actions: ['action', 'actions', 'opération', 'opérations', 'activité', 'activités'],
        objects: ['objet', 'objets', 'table', 'tables', 'vue', 'vues', 'procédure', 'procédures'],
        security: ['sécurité', 'security', 'sûr', 'sûreté', 'protection', 'accès', 'access'],
        statistics: ['statistique', 'statistiques', 'stats', 'métrique', 'métriques', 'performance'],
        time: ['temps', 'time', 'heure', 'heures', 'période', 'périodes', 'date', 'dates'],
        clients: ['client', 'clients', 'application', 'applications', 'programme', 'programmes'],
        infrastructure: ['infrastructure', 'serveur', 'serveurs', 'hôte', 'hôtes', 'host', 'hosts'],
        sessions: ['session', 'sessions', 'connexion', 'connexions', 'connection', 'connections'],
        queries: ['requête', 'requêtes', 'query', 'queries', 'sql', 'select', 'insert', 'update', 'delete'],
        terminals: ['terminal', 'terminals', 'console', 'consoles', 'interface', 'interfaces'],
        auth: ['authentification', 'auth', 'login', 'connexion', 'user', 'password'],
        audit: ['audit', 'audits', 'traçabilité', 'traçage', 'log', 'logs', 'historique'],
        database: ['base de données', 'database', 'oracle', 'db', 'schema', 'schemas']
      };

      // Trouver les mots-clés par catégorie
      Object.entries(keywordCategories).forEach(([category, keywords]) => {
        keywords.forEach(keyword => {
          if (normalizedMessage.includes(keyword)) {
            extractedKeywords.push({
              keyword: keyword,
              category: category,
              relevance: this.calculateKeywordRelevance(normalizedMessage, keyword)
            });
          }
        });
      });

      // Trier par pertinence
      extractedKeywords.sort((a, b) => b.relevance - a.relevance);
      
      return extractedKeywords;
    } catch (error) {
      console.error('Erreur lors de l\'extraction des mots-clés:', error);
      return [];
    }
  }

  // Calculer la pertinence d'un mot-clé
  calculateKeywordRelevance(message, keyword) {
    try {
      let relevance = 0;
      
      // Pertinence de base
      relevance += 0.5;
      
      // Bonus pour les mots-clés plus spécifiques
      if (keyword.length > 5) relevance += 0.2;
      
      // Bonus pour les mots-clés techniques
      if (['sql', 'oracle', 'database', 'schema', 'audit'].includes(keyword)) {
        relevance += 0.3;
      }
      
      // Bonus pour les mots-clés d'action
      if (['select', 'insert', 'update', 'delete', 'truncate', 'drop', 'alter'].includes(keyword)) {
        relevance += 0.4;
      }
      
      return Math.min(relevance, 1.0);
    } catch (error) {
      console.error('Erreur lors du calcul de pertinence:', error);
      return 0.5;
    }
  }

  // Calculer la confiance que c'est une question pertinente
  calculateQuestionConfidence(message) {
    try {
      const normalizedMessage = message.toLowerCase();
      let confidence = 0;
      
      // Compter les mots-clés pertinents
      this.questionKeywords.forEach(keyword => {
        if (normalizedMessage.includes(keyword)) {
          confidence += 0.3;
        }
      });
      
      // Bonus pour les questions spécifiques à Oracle
      if (normalizedMessage.includes('oracle') || 
          normalizedMessage.includes('base de données') ||
          normalizedMessage.includes('audit')) {
        confidence += 0.2;
      }
      
      return Math.min(confidence, 1.0);
    } catch (error) {
      console.error('Erreur lors du calcul de confiance:', error);
      return 0.5; // Confiance par défaut
    }
  }

  // Générer une réponse de salutation
  generateGreetingResponse(message) {
    try {
      const normalizedMessage = message.toLowerCase();
      const hour = new Date().getHours();
      
      if (normalizedMessage.includes('bonjour') || normalizedMessage.includes('salut') || normalizedMessage.includes('hello')) {
        if (hour < 12) {
          return {
            type: 'greeting',
            message: "Bonjour ! 😊 Je suis votre assistant SAO (Système d'Information Oracle). Je suis là pour vous aider à analyser vos données d'audit Oracle. Comment puis-je vous être utile aujourd'hui ?",
            suggestions: [
              "Quels sont les utilisateurs les plus actifs ?",
              "Montrez-moi les actions de sécurité",
              "Analysez les performances de la base"
            ]
          };
        } else if (hour < 18) {
          return {
            type: 'greeting',
            message: "Bonjour ! 🌟 Je suis votre assistant SAO. Prêt à analyser vos données d'audit Oracle avec vous ! Que souhaitez-vous explorer ?",
            suggestions: [
              "Quels objets sont les plus accédés ?",
              "Montrez-moi les connexions récentes",
              "Analysez les schémas actifs"
            ]
          };
        } else {
          return {
            type: 'greeting',
            message: "Bonsoir ! 🌙 Votre assistant SAO est là pour vous accompagner dans l'analyse de vos données d'audit Oracle. Que voulez-vous examiner ?",
            suggestions: [
              "Quels sont les programmes clients utilisés ?",
              "Montrez-moi les actions suspectes",
              "Analysez les sessions actives"
            ]
          };
        }
      }
      
      if (normalizedMessage.includes('comment ça va') || normalizedMessage.includes('ça va')) {
        return {
          type: 'greeting',
          message: "Très bien, merci ! 😊 Je suis prêt à analyser vos données d'audit Oracle. Avez-vous des questions spécifiques sur vos données ?",
          suggestions: [
            "Quels utilisateurs se connectent le plus ?",
            "Montrez-moi les actions de modification",
            "Analysez les accès système"
          ]
        };
      }
      
      if (normalizedMessage.includes('merci')) {
        return {
          type: 'greeting',
          message: "De rien ! 😊 C'est un plaisir de vous aider avec l'analyse de vos données Oracle. N'hésitez pas si vous avez d'autres questions !",
          suggestions: [
            "Pouvez-vous analyser les performances ?",
            "Montrez-moi les connexions suspectes",
            "Quels sont les objets les plus utilisés ?"
          ]
        };
      }
      
      if (normalizedMessage.includes('au revoir') || normalizedMessage.includes('bye')) {
        return {
          type: 'farewell',
          message: "Au revoir ! 👋 N'hésitez pas à revenir si vous avez besoin d'analyser vos données d'audit Oracle. Bonne journée !",
          suggestions: []
        };
      }
      
      return {
        type: 'greeting',
        message: "Bonjour ! 😊 Je suis votre assistant SAO. Je peux vous aider à analyser vos données d'audit Oracle. Que souhaitez-vous savoir ?",
        suggestions: [
          "Quels sont les utilisateurs actifs ?",
          "Montrez-moi les actions de sécurité",
          "Analysez les performances"
        ]
      };
    } catch (error) {
      console.error('Erreur lors de la génération de réponse de salutation:', error);
      return {
        type: 'greeting',
        message: "Bonjour ! 😊 Je suis votre assistant SAO. Comment puis-je vous aider ?",
        suggestions: [
          "Quels sont les utilisateurs actifs ?",
          "Montrez-moi les actions récentes",
          "Analysez les performances"
        ]
      };
    }
  }

  // Générer une analyse des mots-clés
  generateKeywordAnalysis(keywords) {
    try {
      if (!keywords || keywords.length === 0) {
        return {
          detected: false,
          message: "Aucun mot-clé spécifique détecté"
        };
      }

      const categories = {};
      keywords.forEach(kw => {
        if (!categories[kw.category]) {
          categories[kw.category] = [];
        }
        categories[kw.category].push(kw.keyword);
      });

      const topKeywords = keywords.slice(0, 3);
      const primaryCategory = Object.keys(categories)[0];

      return {
        detected: true,
        totalKeywords: keywords.length,
        topKeywords: topKeywords.map(kw => kw.keyword),
        categories: categories,
        primaryCategory: primaryCategory,
        relevance: keywords.reduce((sum, kw) => sum + kw.relevance, 0) / keywords.length
      };
    } catch (error) {
      console.error('Erreur lors de la génération de l\'analyse des mots-clés:', error);
      return { detected: false, message: "Erreur d'analyse" };
    }
  }

  // Générer des suggestions basées sur les mots-clés
  generateSuggestionsFromKeywords(keywords) {
    try {
      const suggestions = [];
      
      if (!keywords || keywords.length === 0) {
        return [
          "Quels sont les utilisateurs actifs ?",
          "Montrez-moi les actions récentes",
          "Analysez les performances"
        ];
      }

      const categories = {};
      keywords.forEach(kw => {
        if (!categories[kw.category]) {
          categories[kw.category] = [];
        }
        categories[kw.category].push(kw.keyword);
      });

      // Suggestions basées sur les catégories détectées
      if (categories.users) {
        suggestions.push("Quels sont les utilisateurs les plus actifs ?");
        suggestions.push("Combien d'utilisateurs distincts se connectent ?");
      }

      if (categories.actions) {
        suggestions.push("Quelles sont les actions les plus fréquentes ?");
        suggestions.push("Montrez-moi les actions de sécurité");
      }

      if (categories.objects) {
        suggestions.push("Quels objets sont les plus accédés ?");
        suggestions.push("Y a-t-il des accès aux objets système ?");
      }

      if (categories.security) {
        suggestions.push("Montrez-moi les actions privilégiées");
        suggestions.push("Analysez les accès suspects");
      }

      if (categories.time) {
        suggestions.push("À quelle heure y a-t-il le plus d'activité ?");
        suggestions.push("Quelle est la répartition temporelle des actions ?");
      }

      if (categories.sessions) {
        suggestions.push("Combien de sessions actives y a-t-il ?");
        suggestions.push("Quelles sont les sessions les plus longues ?");
      }

      // Suggestions par défaut si pas assez de suggestions spécifiques
      if (suggestions.length < 3) {
        suggestions.push("Quels sont les utilisateurs actifs ?");
        suggestions.push("Montrez-moi les actions récentes");
        suggestions.push("Analysez les performances");
      }

      return suggestions.slice(0, 3);
    } catch (error) {
      console.error('Erreur lors de la génération des suggestions:', error);
      return [
        "Quels sont les utilisateurs actifs ?",
        "Montrez-moi les actions récentes",
        "Analysez les performances"
      ];
    }
  }

  // Générer des suggestions de reformulation pour les questions non répertoriées
  generateReformulationSuggestions(message, keywords = []) {
    try {
      const normalizedMessage = message.toLowerCase();
      const suggestions = [];
      
      // Analyser les mots-clés présents
      const presentKeywords = this.questionKeywords.filter(keyword => 
        normalizedMessage.includes(keyword)
      );
      
      // Générer des suggestions basées sur les mots-clés présents
      if (presentKeywords.includes('utilisateur')) {
        suggestions.push(
          "Quels sont les utilisateurs OS les plus fréquents ?",
          "Combien d'utilisateurs distincts se connectent ?",
          "Quels utilisateurs ont effectué le plus d'actions ?"
        );
      }
      
      if (presentKeywords.includes('action')) {
        suggestions.push(
          "Quelles sont les actions les plus fréquentes ?",
          "Combien d'opérations SELECT sont enregistrées ?",
          "Quels utilisateurs ont effectué des TRUNCATE ?"
        );
      }
      
      if (presentKeywords.includes('objet')) {
        suggestions.push(
          "Quels objets sont les plus fréquemment accédés ?",
          "Quels schémas sont les plus actifs ?",
          "Y a-t-il des accès aux objets système ?"
        );
      }
      
      if (presentKeywords.includes('sécurité')) {
        suggestions.push(
          "Y a-t-il des accès suspects aux objets système ?",
          "Quels utilisateurs accèdent au schéma SYS ?",
          "Y a-t-il des connexions depuis des terminaux inconnus ?"
        );
      }
      
      // Si aucun mot-clé spécifique, proposer des questions générales
      if (suggestions.length === 0) {
        suggestions.push(
          "Quels sont les utilisateurs les plus actifs ?",
          "Quelles sont les actions les plus fréquentes ?",
          "Quels objets sont les plus accédés ?",
          "Y a-t-il des activités suspectes ?"
        );
      }
      
      return suggestions.slice(0, 3); // Limiter à 3 suggestions
    } catch (error) {
      console.error('Erreur lors de la génération des suggestions:', error);
      return [
        "Quels sont les utilisateurs les plus actifs ?",
        "Quelles sont les actions les plus fréquentes ?",
        "Quels objets sont les plus accédés ?"
      ];
    }
  }

  // Générer une réponse pour les questions non répertoriées
  generateUnrecognizedQuestionResponse(message) {
    try {
      const confidence = this.calculateQuestionConfidence(message);
      
      if (confidence > 0.5) {
        return {
          type: 'unrecognized_high_confidence',
          message: `Je comprends votre question sur "${message}", mais je n'ai pas de réponse prédéfinie pour cette formulation exacte. 🤔

Pouvez-vous reformuler votre question en utilisant l'une de ces formulations ?`,
          suggestions: this.generateReformulationSuggestions(message),
          confidence: confidence
        };
      } else {
        return {
          type: 'unrecognized_low_confidence',
          message: `Je ne suis pas sûr de comprendre votre question "${message}". 🤷‍♂️

Pour vous aider au mieux, pourriez-vous reformuler votre question en utilisant des termes plus spécifiques à l'audit Oracle ?`,
          suggestions: [
            "Quels sont les utilisateurs les plus actifs ?",
            "Quelles sont les actions les plus fréquentes ?",
            "Quels objets sont les plus accédés ?",
            "Y a-t-il des activités suspectes ?"
          ],
          confidence: confidence
        };
      }
    } catch (error) {
      console.error('Erreur lors de la génération de réponse non reconnue:', error);
      return {
        type: 'unrecognized_low_confidence',
        message: "Je ne comprends pas votre question. Pouvez-vous reformuler ?",
        suggestions: [
          "Quels sont les utilisateurs les plus actifs ?",
          "Quelles sont les actions les plus fréquentes ?",
          "Quels objets sont les plus accédés ?"
        ],
        confidence: 0
      };
    }
  }

  // Générer une réponse d'aide
  generateHelpResponse() {
    try {
      return {
        type: 'help',
        message: `Bien sûr ! Je suis votre assistant SAO spécialisé dans l'analyse des données d'audit Oracle. 🚀

**Voici ce que je peux analyser :**
•  Utilisateurs : OS_USERNAME, DBUSERNAME, connexions
•  Actions: SELECT, INSERT, UPDATE, DELETE, TRUNCATE
•  Objets : tables, schémas, objets système
•  Sécurité : accès suspects, connexions anormales
•  Statistiques : fréquences, tendances, patterns
•  Temps : périodes d'activité, sessions
•  Clients : programmes, terminaux, hôtes

**Exemples de questions :**
• "Quels sont les utilisateurs les plus actifs ?"
• "Quelles sont les actions les plus fréquentes ?"
• "Y a-t-il des accès suspects ?"
• "Quels objets sont les plus accédés ?"

N'hésitez pas à me poser vos questions ! 😊`,
        suggestions: [
          "Quels sont les utilisateurs les plus actifs ?",
          "Quelles sont les actions les plus fréquentes ?",
          "Y a-t-il des accès suspects ?",
          "Quels objets sont les plus accédés ?"
        ]
      };
    } catch (error) {
      console.error('Erreur lors de la génération de réponse d\'aide:', error);
      return {
        type: 'help',
        message: "Je suis votre assistant SAO. Je peux analyser les données d'audit Oracle. Que souhaitez-vous savoir ?",
        suggestions: [
          "Quels sont les utilisateurs actifs ?",
          "Quelles sont les actions récentes ?",
          "Quels objets sont accédés ?"
        ]
      };
    }
  }

  // Analyser les données temporelles
  analyzeTimeData(auditData, question) {
    try {
      if (!auditData || !Array.isArray(auditData) || auditData.length === 0) {
        return {
          type: 'time_analysis',
          message: "Aucune donnée temporelle disponible pour l'analyse.",
          data: null
        };
      }

      const normalizedQuestion = question.toLowerCase();
      
      // Analyser par jour
      if (normalizedQuestion.includes('jour') || normalizedQuestion.includes('journée')) {
        return this.analyzeDailyActivity(auditData);
      }
      
      // Analyser par heure
      if (normalizedQuestion.includes('heure') || normalizedQuestion.includes('pic')) {
        return this.analyzeHourlyActivity(auditData);
      }
      
      // Analyser la période
      if (normalizedQuestion.includes('période') || normalizedQuestion.includes('date')) {
        return this.analyzeTimePeriod(auditData);
      }
      
      // Analyse temporelle générale
      return this.analyzeGeneralTimeActivity(auditData);
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse temporelle:', error);
      return {
        type: 'time_analysis',
        message: "Erreur lors de l'analyse temporelle des données.",
        data: null
      };
    }
  }

  // Analyser l'activité par jour
  analyzeDailyActivity(auditData) {
    try {
      const dailyActivity = {};
      
      auditData.forEach(record => {
        if (record.EVENT_TIMESTAMP || record.event_timestamp) {
          const date = new Date(record.EVENT_TIMESTAMP || record.event_timestamp);
          const dayKey = date.toDateString();
          
          if (!dailyActivity[dayKey]) {
            dailyActivity[dayKey] = {
              date: dayKey,
              count: 0,
              users: new Set(),
              actions: new Set(),
              objects: new Set()
            };
          }
          
          dailyActivity[dayKey].count++;
          if (record.DBUSERNAME || record.dbusername) {
            dailyActivity[dayKey].users.add(record.DBUSERNAME || record.dbusername);
          }
          if (record.ACTION_NAME || record.action_name) {
            dailyActivity[dayKey].actions.add(record.ACTION_NAME || record.action_name);
          }
          if (record.OBJECT_NAME || record.object_name) {
            dailyActivity[dayKey].objects.add(record.OBJECT_NAME || record.object_name);
          }
        }
      });
      
      // Convertir les Sets en tableaux
      Object.values(dailyActivity).forEach(day => {
        day.users = Array.from(day.users);
        day.actions = Array.from(day.actions);
        day.objects = Array.from(day.objects);
      });
      
      // Trouver le jour le plus actif
      const sortedDays = Object.values(dailyActivity).sort((a, b) => b.count - a.count);
      const mostActiveDay = sortedDays[0];
      
      return {
        type: 'daily_analysis',
        message: `Analyse de l'activité par jour :`,
        data: {
          mostActiveDay: mostActiveDay,
          allDays: sortedDays,
          summary: `Le jour le plus actif est ${mostActiveDay.date} avec ${mostActiveDay.count} actions par ${mostActiveDay.users.length} utilisateurs.`
        }
      };
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse quotidienne:', error);
      return {
        type: 'daily_analysis',
        message: "Erreur lors de l'analyse de l'activité quotidienne.",
        data: null
      };
    }
  }

  // Analyser l'activité par heure
  analyzeHourlyActivity(auditData) {
    try {
      const hourlyActivity = {};
      
      // Initialiser les 24 heures
      for (let i = 0; i < 24; i++) {
        hourlyActivity[i] = {
          hour: i,
          count: 0,
          users: new Set(),
          actions: new Set()
        };
      }
      
      auditData.forEach(record => {
        if (record.EVENT_TIMESTAMP || record.event_timestamp) {
          const date = new Date(record.EVENT_TIMESTAMP || record.event_timestamp);
          const hour = date.getHours();
          
          hourlyActivity[hour].count++;
          if (record.DBUSERNAME || record.dbusername) {
            hourlyActivity[hour].users.add(record.DBUSERNAME || record.dbusername);
          }
          if (record.ACTION_NAME || record.action_name) {
            hourlyActivity[hour].actions.add(record.ACTION_NAME || record.action_name);
          }
        }
      });
      
      // Convertir les Sets en tableaux
      Object.values(hourlyActivity).forEach(hour => {
        hour.users = Array.from(hour.users);
        hour.actions = Array.from(hour.actions);
      });
      
      // Trouver l'heure de pointe
      const peakHour = Object.values(hourlyActivity).reduce((max, hour) => 
        hour.count > max.count ? hour : max
      );
      
      return {
        type: 'hourly_analysis',
        message: `Analyse de l'activité par heure :`,
        data: {
          peakHour: peakHour,
          allHours: Object.values(hourlyActivity),
          summary: `L'heure de pointe est ${peakHour.hour}h avec ${peakHour.count} actions par ${peakHour.users.length} utilisateurs.`
        }
      };
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse horaire:', error);
      return {
        type: 'hourly_analysis',
        message: "Erreur lors de l'analyse de l'activité horaire.",
        data: null
      };
    }
  }

  // Analyser la période temporelle
  analyzeTimePeriod(auditData) {
    try {
      const timestamps = auditData
        .filter(record => record.EVENT_TIMESTAMP || record.event_timestamp)
        .map(record => new Date(record.EVENT_TIMESTAMP || record.event_timestamp));
      
      if (timestamps.length === 0) {
        return {
          type: 'period_analysis',
          message: "Aucune donnée temporelle disponible.",
          data: null
        };
      }
      
      const minDate = new Date(Math.min(...timestamps));
      const maxDate = new Date(Math.max(...timestamps));
      const durationDays = Math.ceil((maxDate - maxDate) / (1000 * 60 * 60 * 24));
      
      return {
        type: 'period_analysis',
        message: `Période couverte par les données :`,
        data: {
          startDate: minDate.toDateString(),
          endDate: maxDate.toDateString(),
          durationDays: durationDays,
          totalRecords: timestamps.length,
          summary: `Les données couvrent ${durationDays} jours du ${minDate.toDateString()} au ${maxDate.toDateString()} avec ${timestamps.length} événements.`
        }
      };
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse de période:', error);
      return {
        type: 'period_analysis',
        message: "Erreur lors de l'analyse de la période temporelle.",
        data: null
      };
    }
  }

  // Analyse temporelle générale
  analyzeGeneralTimeActivity(auditData) {
    try {
      const dailyAnalysis = this.analyzeDailyActivity(auditData);
      const hourlyAnalysis = this.analyzeHourlyActivity(auditData);
      const periodAnalysis = this.analyzeTimePeriod(auditData);
      
      return {
        type: 'general_time_analysis',
        message: `Analyse temporelle complète :`,
        data: {
          daily: dailyAnalysis.data,
          hourly: hourlyAnalysis.data,
          period: periodAnalysis.data,
          summary: `${periodAnalysis.data?.totalRecords || 0} événements analysés sur ${periodAnalysis.data?.durationDays || 0} jours. Jour le plus actif : ${dailyAnalysis.data?.mostActiveDay?.date || 'N/A'}. Heure de pointe : ${hourlyAnalysis.data?.peakHour?.hour || 'N/A'}h.`
        }
      };
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse temporelle générale:', error);
      return {
        type: 'general_time_analysis',
        message: "Erreur lors de l'analyse temporelle générale.",
        data: null
      };
    }
  }

  // Traiter un message et générer une réponse
  processMessage(message, auditData = []) {
    try {
      console.log(`Message reçu: "${message}"`);
      
      // Analyser le type de message et extraire les mots-clés
      const analysis = this.analyzeMessage(message);
      const keywords = this.extractKeywords(message);
      
      // Ajouter à l'historique
      this.conversationHistory.push({
        timestamp: new Date().toISOString(),
        message: message,
        type: analysis.type,
        confidence: analysis.confidence || 0,
        keywords: keywords
      });
      
      let response;
      
      // Générer la réponse appropriée
      switch (analysis.type) {
        case 'greeting':
          response = this.generateGreetingResponse(message);
          break;
          
        case 'help':
          response = this.generateHelpResponse();
          break;
          
        case 'time_question':
          // Traiter les questions temporelles spécifiquement
          const timeAnalysis = this.analyzeTimeData(auditData, message);
          response = {
            type: 'time_analysis',
            message: timeAnalysis.message,
            data: timeAnalysis.data,
            shouldProcessWithExistingSystem: false,
            confidence: 0.9,
            keywords: keywords,
            keywordAnalysis: this.generateKeywordAnalysis(keywords)
          };
          break;
          
        case 'question':
          // Pour les questions, on laisse le système existant les traiter
          // mais on ajoute une couche de validation et d'analyse des mots-clés
          if (analysis.confidence < 0.3) {
            response = this.generateUnrecognizedQuestionResponse(message, keywords);
          } else {
            // Laisser le système de questions existant traiter
            response = {
              type: 'question',
              message: "Je vais analyser votre question... 🔍",
              shouldProcessWithExistingSystem: true,
              confidence: analysis.confidence,
              keywords: keywords,
              keywordAnalysis: this.generateKeywordAnalysis(keywords)
            };
          }
          break;
          
        default:
          response = {
            type: 'statement',
            message: "Je comprends votre message. Avez-vous une question spécifique sur vos données d'audit Oracle ? 🤔",
            suggestions: this.generateSuggestionsFromKeywords(keywords),
            keywords: keywords
          };
      }
      
      console.log(`Réponse générée: ${response.type} avec ${keywords.length} mots-clés détectés`);
      
      return {
        success: true,
        response: response,
        analysis: analysis,
        keywords: keywords,
        conversationContext: {
          historyLength: this.conversationHistory.length,
          userContext: this.userContext
        }
      };
      
    } catch (error) {
      console.error(`Erreur lors du traitement du message: ${message}`, error);
      return {
        success: false,
        error: error.message,
        response: {
          type: 'error',
          message: "Désolé, j'ai rencontré une erreur lors du traitement de votre message. Pouvez-vous reformuler ? 😅"
        }
      };
    }
  }

  // Obtenir des statistiques enrichies (version simplifiée)
  getEnrichedStatistics(auditData) {
    try {
      if (!auditData || !Array.isArray(auditData)) {
        return {
          statistics: {
            total_records: 0,
            critical_actions: 0,
            suspicious_patterns: 0,
            high_risk_records: 0,
            system_access: 0,
            unknown_terminals: 0,
            destructive_operations: 0
          },
          enriched_data: []
        };
      }
      
      // Enrichir d'abord les données
      const enrichedData = this.enrichAuditData(auditData);
      
      const stats = {
        total_records: enrichedData.length,
        critical_actions: enrichedData.filter(r => r.analysis_metadata && r.analysis_metadata.criticality === 'HIGH').length,
        suspicious_patterns: enrichedData.filter(r => r.analysis_metadata && r.analysis_metadata.suspicious_patterns && r.analysis_metadata.suspicious_patterns.length > 0).length,
        high_risk_records: enrichedData.filter(r => r.analysis_metadata && r.analysis_metadata.security_risk === 'HIGH').length,
        system_access: enrichedData.filter(r => r.object_schema === 'SYS').length,
        unknown_terminals: enrichedData.filter(r => r.terminal === 'unknown').length,
        destructive_operations: enrichedData.filter(r => r.action_name && ['TRUNCATE', 'DROP', 'DELETE'].includes(r.action_name)).length
      };
      
      return {
        statistics: stats,
        enriched_data: enrichedData
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques enrichies:', error);
      
      return {
        statistics: {
          total_records: auditData ? auditData.length : 0,
          critical_actions: 0,
          suspicious_patterns: 0,
          high_risk_records: 0,
          system_access: 0,
          unknown_terminals: 0,
          destructive_operations: 0
        },
        enriched_data: auditData || []
      };
    }
  }

  // Enrichir les données d'audit avec des métadonnées calculées
  enrichAuditData(auditData) {
    try {
      if (!auditData || !Array.isArray(auditData)) {
        return [];
      }

      return auditData.map(record => {
        if (!record || typeof record !== 'object') {
          return record;
        }

        // Calculer la criticité de l'action
        const criticalActions = ['TRUNCATE', 'DROP', 'ALTER', 'GRANT', 'REVOKE'];
        const criticality = criticalActions.includes(record.action_name) ? 'HIGH' : 
                           ['DELETE', 'UPDATE'].includes(record.action_name) ? 'MEDIUM' : 'LOW';

        // Détecter les patterns suspects
        const suspiciousPatterns = [];
        if (record.object_schema === 'SYS' && !['SYS', 'SYSTEM'].includes(record.dbusername)) {
          suspiciousPatterns.push('ACCES_SYSTEME_NON_AUTORISE');
        }
        if (record.terminal === 'unknown') {
          suspiciousPatterns.push('TERMINAL_INCONNU');
        }
        if (record.action_name && ['TRUNCATE', 'DROP'].includes(record.action_name)) {
          suspiciousPatterns.push('OPERATION_DESTRUCTIVE');
        }

        // Calculer le niveau de risque de sécurité
        const securityRisk = suspiciousPatterns.length > 0 ? 'HIGH' : 
                            criticality === 'HIGH' ? 'MEDIUM' : 'LOW';

        // Ajouter des tags pour faciliter l'analyse
        const tags = [];
        if (record.object_schema === 'SYS') tags.push('SYSTEM');
        if (criticalActions.includes(record.action_name)) tags.push('CRITICAL');
        if (suspiciousPatterns.length > 0) tags.push('SUSPICIOUS');
        if (record.action_name === 'SELECT') tags.push('READ');
        if (['INSERT', 'UPDATE', 'DELETE'].includes(record.action_name)) tags.push('WRITE');

        return {
          ...record,
          analysis_metadata: {
            criticality: criticality || 'LOW',
            suspicious_patterns: suspiciousPatterns || [],
            security_risk: securityRisk || 'LOW',
            tags: tags || [],
            risk_score: suspiciousPatterns.length * 10 + (criticality === 'HIGH' ? 50 : criticality === 'MEDIUM' ? 25 : 0)
          }
        };
      });
    } catch (error) {
      console.error('Erreur lors de l\'enrichissement des données:', error);
      return auditData; // Retourner les données originales en cas d'erreur
    }
  }
}

module.exports = IntelligentChatbot;

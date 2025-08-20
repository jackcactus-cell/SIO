// Système de métriques pour le chatbot Oracle Audit
// Track les questions, réponses et performances

class ChatbotMetrics {
  constructor() {
    this.metrics = {
      totalQuestions: 0,
      totalResponses: 0,
      successfulResponses: 0,
      failedResponses: 0,
      averageResponseTime: 0,
      responseTimes: [],
      questionTypes: {},
      popularQuestions: {},
      dailyStats: {},
      hourlyStats: {},
      confidenceScores: [],
      errorLog: [],
      responseCategories: {
        detailed_analysis: 0,
        statistical_analysis: 0,
        conversation: 0,
        error: 0
      }
    };
    
    // Initialiser userSessions comme Set séparé pour éviter les erreurs de sérialisation
    this.userSessions = new Set();
    this.startTime = new Date();
  }

  // Enregistrer une nouvelle question
  recordQuestion(question, userSession = 'anonymous') {
    this.metrics.totalQuestions++;
    this.userSessions.add(userSession);
    
    // Incrémenter les statistiques par question
    const normalizedQuestion = question.toLowerCase().substring(0, 50);
    this.metrics.popularQuestions[normalizedQuestion] = 
      (this.metrics.popularQuestions[normalizedQuestion] || 0) + 1;
    
    // Stats temporelles
    const now = new Date();
    const hour = now.getHours();
    const day = now.toISOString().split('T')[0];
    
    this.metrics.hourlyStats[hour] = (this.metrics.hourlyStats[hour] || 0) + 1;
    this.metrics.dailyStats[day] = (this.metrics.dailyStats[day] || 0) + 1;
    
    // Détecter le type de question
    this.categorizeQuestion(question);
  }

  // Enregistrer une réponse
  recordResponse(question, response, responseTime, confidence = 0) {
    this.metrics.totalResponses++;
    this.metrics.responseTimes.push(responseTime);
    this.metrics.confidenceScores.push(confidence);
    
    // Calculer temps de réponse moyen
    this.metrics.averageResponseTime = 
      this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length;
    
    // Catégoriser la réponse
    if (response.type) {
      this.metrics.responseCategories[response.type] = 
        (this.metrics.responseCategories[response.type] || 0) + 1;
    }
    
    // Marquer comme succès ou échec
    if (confidence > 0.5 || response.type === 'detailed_analysis') {
      this.metrics.successfulResponses++;
    } else {
      this.metrics.failedResponses++;
    }
  }

  // Enregistrer une erreur
  recordError(question, error, timestamp = new Date()) {
    this.metrics.errorLog.push({
      question,
      error: error.message || error,
      timestamp: timestamp.toISOString()
    });
    this.metrics.failedResponses++;
  }

  // Catégoriser le type de question
  categorizeQuestion(question) {
    const normalizedQuestion = question.toLowerCase();
    
    if (normalizedQuestion.includes('utilisateur') || normalizedQuestion.includes('user')) {
      this.metrics.questionTypes.users = (this.metrics.questionTypes.users || 0) + 1;
    } else if (normalizedQuestion.includes('action') || normalizedQuestion.includes('opération')) {
      this.metrics.questionTypes.actions = (this.metrics.questionTypes.actions || 0) + 1;
    } else if (normalizedQuestion.includes('objet') || normalizedQuestion.includes('table')) {
      this.metrics.questionTypes.objects = (this.metrics.questionTypes.objects || 0) + 1;
    } else if (normalizedQuestion.includes('schéma') || normalizedQuestion.includes('schema')) {
      this.metrics.questionTypes.schemas = (this.metrics.questionTypes.schemas || 0) + 1;
    } else if (normalizedQuestion.includes('statistique') || normalizedQuestion.includes('analyse')) {
      this.metrics.questionTypes.analytics = (this.metrics.questionTypes.analytics || 0) + 1;
    } else if (normalizedQuestion.includes('chatbot') || normalizedQuestion.includes('système')) {
      this.metrics.questionTypes.meta = (this.metrics.questionTypes.meta || 0) + 1;
    } else {
      this.metrics.questionTypes.other = (this.metrics.questionTypes.other || 0) + 1;
    }
  }

  // Obtenir les statistiques globales
  getGlobalStats() {
    const uptime = Date.now() - this.startTime.getTime();
    const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      totalQuestions: this.metrics.totalQuestions,
      totalResponses: this.metrics.totalResponses,
      successRate: this.metrics.totalResponses > 0 ? 
        (this.metrics.successfulResponses / this.metrics.totalResponses * 100).toFixed(2) + '%' : '0%',
      averageResponseTime: Math.round(this.metrics.averageResponseTime) + 'ms',
      uniqueUsers: this.userSessions.size,
      uptime: `${uptimeHours}h ${uptimeMinutes}m`,
      questionsPerHour: uptimeHours > 0 ? Math.round(this.metrics.totalQuestions / uptimeHours) : this.metrics.totalQuestions,
      averageConfidence: this.metrics.confidenceScores.length > 0 ? 
        (this.metrics.confidenceScores.reduce((a, b) => a + b, 0) / this.metrics.confidenceScores.length).toFixed(2) : '0'
    };
  }

  // Obtenir les questions populaires
  getPopularQuestions(limit = 10) {
    return Object.entries(this.metrics.popularQuestions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([question, count]) => ({
        question: question,
        count: count,
        percentage: (count / this.metrics.totalQuestions * 100).toFixed(1) + '%'
      }));
  }

  // Obtenir les statistiques par type
  getQuestionTypeStats() {
    return Object.entries(this.metrics.questionTypes)
      .map(([type, count]) => ({
        type: type,
        count: count,
        percentage: (count / this.metrics.totalQuestions * 100).toFixed(1) + '%'
      }))
      .sort((a, b) => b.count - a.count);
  }

  // Obtenir les statistiques horaires
  getHourlyStats() {
    return Array.from({length: 24}, (_, hour) => ({
      hour: hour,
      questions: this.metrics.hourlyStats[hour] || 0
    }));
  }

  // Obtenir les erreurs récentes
  getRecentErrors(limit = 10) {
    return this.metrics.errorLog
      .slice(-limit)
      .reverse();
  }

  // Analyser la performance
  getPerformanceAnalysis() {
    const responseTimes = this.metrics.responseTimes;
    if (responseTimes.length === 0) return null;
    
    const sorted = [...responseTimes].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const min = Math.min(...responseTimes);
    const max = Math.max(...responseTimes);
    
    return {
      average: Math.round(this.metrics.averageResponseTime),
      median: Math.round(median),
      p95: Math.round(p95),
      min: Math.round(min),
      max: Math.round(max),
      total_samples: responseTimes.length
    };
  }

  // Générer un rapport complet
  generateReport() {
    return {
      overview: this.getGlobalStats(),
      popular_questions: this.getPopularQuestions(),
      question_types: this.getQuestionTypeStats(),
      hourly_distribution: this.getHourlyStats(),
      performance: this.getPerformanceAnalysis(),
      recent_errors: this.getRecentErrors(),
      response_categories: this.metrics.responseCategories,
      daily_stats: this.metrics.dailyStats
    };
  }

  // Répondre aux questions méta sur le chatbot
  answerMetaQuestion(question) {
    const normalizedQuestion = question.toLowerCase();
    
    if (normalizedQuestion.includes('combien') && normalizedQuestion.includes('questions')) {
      return {
        type: 'meta_analysis',
        data: [{
          total_questions: this.metrics.totalQuestions,
          questions_today: this.metrics.dailyStats[new Date().toISOString().split('T')[0]] || 0,
          unique_users: this.userSessions.size
        }],
        summary: `${this.metrics.totalQuestions} questions ont été posées au total`,
        explanation: `Depuis le démarrage du système, ${this.metrics.totalQuestions} questions ont été posées par ${this.userSessions.size} utilisateurs uniques.`
      };
    }
    
    if (normalizedQuestion.includes('performance') || normalizedQuestion.includes('temps')) {
      const perf = this.getPerformanceAnalysis();
      return {
        type: 'meta_analysis',
        data: [perf],
        summary: `Temps de réponse moyen: ${Math.round(this.metrics.averageResponseTime)}ms`,
        explanation: `Le système traite les questions avec un temps de réponse moyen de ${Math.round(this.metrics.averageResponseTime)}ms sur ${this.metrics.responseTimes.length} échantillons.`
      };
    }
    
    if (normalizedQuestion.includes('populaire') || normalizedQuestion.includes('fréquent')) {
      const popular = this.getPopularQuestions(5);
      return {
        type: 'meta_analysis',
        data: popular,
        summary: `Top 5 des questions les plus posées`,
        explanation: `Analyse des questions les plus fréquemment posées pour optimiser les réponses du système.`
      };
    }
    
    if (normalizedQuestion.includes('taux') && normalizedQuestion.includes('réussite')) {
      const stats = this.getGlobalStats();
      return {
        type: 'meta_analysis',
        data: [stats],
        summary: `Taux de réussite: ${stats.successRate}`,
        explanation: `Sur ${this.metrics.totalResponses} réponses générées, ${this.metrics.successfulResponses} ont été considérées comme réussies.`
      };
    }
    
    // Question générale sur les stats
    return {
      type: 'meta_analysis',
      data: [this.getGlobalStats()],
      summary: `Statistiques globales du chatbot`,
      explanation: `Vue d'ensemble des métriques de performance et d'utilisation du système d'audit Oracle.`
    };
  }
}

module.exports = ChatbotMetrics;

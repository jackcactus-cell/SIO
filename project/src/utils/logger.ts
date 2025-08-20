// Système de logging avancé pour le frontend
interface LogLevel {
  INFO: 'INFO';
  WARN: 'WARN';
  ERROR: 'ERROR';
  DEBUG: 'DEBUG';
}

interface LogEntry {
  timestamp: string;
  level: string;
  context: string;
  message: string;
  data?: any;
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
}

class AdvancedFrontendLogger {
  private static instance: AdvancedFrontendLogger;
  private logsDir: string = '/logs'; // Dossier relatif pour les logs frontend
  private maxLogSize: number = 1000; // Nombre maximum de lignes par fichier
  private sessionId: string;
  private userId: string = 'anonymous';

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeLogs();
    this.setupPeriodicCleanup();
  }

  public static getInstance(): AdvancedFrontendLogger {
    if (!AdvancedFrontendLogger.instance) {
      AdvancedFrontendLogger.instance = new AdvancedFrontendLogger();
    }
    return AdvancedFrontendLogger.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeLogs(): void {
    // Créer les fichiers de logs spécifiques
    this.createLogFile('frontend-general.log');
    this.createLogFile('frontend-errors.log');
    this.createLogFile('frontend-ui.log');
    this.createLogFile('frontend-api.log');
    this.createLogFile('frontend-chatbot.log');
    this.createLogFile('frontend-oracle-audit.log');
    this.createLogFile('frontend-user-actions.log');
    this.createLogFile('frontend-performance.log');
    this.createLogFile('frontend-security.log');
    this.createLogFile('frontend-file-operations.log');
    this.createLogFile('frontend-navigation.log');
    this.createLogFile('frontend-database.log');
  }

  private createLogFile(filename: string): void {
    try {
      const logEntry = `${new Date().toISOString()} [SYSTEM] Initialisation du fichier de log: ${filename} - Session: ${this.sessionId}\n`;
      this.writeToFile(filename, logEntry);
    } catch (error) {
      console.error(`Erreur lors de la création du fichier de log ${filename}:`, error);
    }
  }

  private writeToFile(filename: string, message: string): void {
    try {
      // En production, on pourrait envoyer les logs au serveur
      // Pour le développement, on utilise localStorage comme fallback
      const logs = JSON.parse(localStorage.getItem(`logs_${filename}`) || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        message: message.trim(),
        sessionId: this.sessionId,
        userId: this.userId
      });

      // Limiter la taille des logs
      if (logs.length > this.maxLogSize) {
        logs.splice(0, logs.length - this.maxLogSize);
      }

      localStorage.setItem(`logs_${filename}`, JSON.stringify(logs));
    } catch (error) {
      console.error(`Erreur lors de l'écriture dans ${filename}:`, error);
    }
  }

  private formatLogEntry(level: string, context: string, message: string, data?: any, component?: string, action?: string): string {
    const timestamp = new Date().toISOString();
    let logEntry = `${timestamp} [${level}] [${context}] ${message}`;
    
    if (component) {
      logEntry += ` - Component: ${component}`;
    }
    
    if (action) {
      logEntry += ` - Action: ${action}`;
    }
    
    if (data) {
      logEntry += ` - Data: ${JSON.stringify(data)}`;
    }
    
    logEntry += ` - Session: ${this.sessionId} - User: ${this.userId}`;
    
    return logEntry + '\n';
  }

  // Logger général
  public info(message: string, context: string = 'GENERAL', data?: any, component?: string, action?: string): void {
    const logEntry = this.formatLogEntry('INFO', context, message, data, component, action);
    this.writeToFile('frontend-general.log', logEntry);
    console.log(`[INFO] [${context}] ${message}`, data || '');
  }

  public warn(message: string, context: string = 'GENERAL', data?: any, component?: string, action?: string): void {
    const logEntry = this.formatLogEntry('WARN', context, message, data, component, action);
    this.writeToFile('frontend-general.log', logEntry);
    console.warn(`[WARN] [${context}] ${message}`, data || '');
  }

  public error(message: string, error?: any, context: string = 'GENERAL', data?: any, component?: string, action?: string): void {
    let errorMessage = message;
    if (error) {
      errorMessage += ` - Error: ${error.message || error}`;
      if (error.stack) {
        errorMessage += ` - Stack: ${error.stack}`;
      }
    }

    const logEntry = this.formatLogEntry('ERROR', context, errorMessage, data, component, action);
    this.writeToFile('frontend-errors.log', logEntry);
    this.writeToFile('frontend-general.log', logEntry);
    console.error(`[ERROR] [${context}] ${errorMessage}`, data || '');
  }

  public debug(message: string, context: string = 'GENERAL', data?: any, component?: string, action?: string): void {
    const logEntry = this.formatLogEntry('DEBUG', context, message, data, component, action);
    this.writeToFile('frontend-general.log', logEntry);
    console.log(`[DEBUG] [${context}] ${message}`, data || '');
  }

  // Logger spécifique pour l'UI
  public ui(action: string, component: string, details?: any, userId?: string): void {
    const message = `UI Action: ${action}`;
    const context = `UI_${component}`;
    const logEntry = this.formatLogEntry('INFO', context, message, details, component, action);
    
    this.writeToFile('frontend-ui.log', logEntry);
    this.writeToFile('frontend-user-actions.log', logEntry);
    
    if (userId) {
      this.userId = userId;
    }
  }

  // Logger spécifique pour les appels API
  public api(method: string, url: string, status?: number, responseTime?: number, error?: any, component?: string): void {
    const message = `${method} ${url}`;
    const context = 'API';
    const data = { status, responseTime, error: error?.message };
    const action = `${method}_${status || 'ERROR'}`;
    
    const logEntry = this.formatLogEntry(error ? 'ERROR' : 'INFO', context, message, data, component, action);
    this.writeToFile('frontend-api.log', logEntry);
    
    if (error) {
      this.writeToFile('frontend-errors.log', logEntry);
    }
  }

  // Logger spécifique pour le chatbot
  public chatbot(action: string, question?: string, response?: any, error?: any, component?: string): void {
    const message = `Chatbot ${action}`;
    const context = 'CHATBOT';
    const data = { question, response, error: error?.message };
    
    const logEntry = this.formatLogEntry(error ? 'ERROR' : 'INFO', context, message, data, component, action);
    this.writeToFile('frontend-chatbot.log', logEntry);
    
    if (error) {
      this.writeToFile('frontend-errors.log', logEntry);
    }
  }

  // Logger spécifique pour Oracle Audit
  public oracleAudit(action: string, details?: any, component?: string): void {
    const message = `Oracle Audit: ${action}`;
    const context = 'ORACLE_AUDIT';
    const logEntry = this.formatLogEntry('INFO', context, message, details, component, action);
    
    this.writeToFile('frontend-oracle-audit.log', logEntry);
    this.writeToFile('frontend-user-actions.log', logEntry);
  }

  // Logger spécifique pour les actions utilisateur
  public userAction(action: string, component: string, details?: any, userId?: string): void {
    const message = `User Action: ${action}`;
    const context = `USER_${component}`;
    const logEntry = this.formatLogEntry('INFO', context, message, details, component, action);
    
    this.writeToFile('frontend-user-actions.log', logEntry);
    this.writeToFile('frontend-ui.log', logEntry);
    
    if (userId) {
      this.userId = userId;
    }
  }

  // Logger spécifique pour les performances
  public performance(name: string, duration: number, component?: string): void {
    const message = `Performance: ${name}`;
    const context = 'PERFORMANCE';
    const data = { duration, component };
    const action = `measure_${name}`;
    
    const logEntry = this.formatLogEntry('INFO', context, message, data, component, action);
    this.writeToFile('frontend-performance.log', logEntry);
  }

  // Logger spécifique pour la sécurité
  public security(action: string, details?: any, component?: string): void {
    const message = `Security: ${action}`;
    const context = 'SECURITY';
    const logEntry = this.formatLogEntry('INFO', context, message, details, component, action);
    
    this.writeToFile('frontend-security.log', logEntry);
  }

  // Logger spécifique pour les opérations de fichiers
  public fileOperation(action: string, fileName?: string, fileSize?: number, details?: any, component?: string): void {
    const message = `File Operation: ${action}`;
    const context = 'FILE_OPERATIONS';
    const data = { fileName, fileSize, ...details };
    const logEntry = this.formatLogEntry('INFO', context, message, data, component, action);
    
    this.writeToFile('frontend-file-operations.log', logEntry);
    this.writeToFile('frontend-user-actions.log', logEntry);
  }

  // Logger spécifique pour la navigation
  public navigation(from: string, to: string, details?: any): void {
    const message = `Navigation: ${from} → ${to}`;
    const context = 'NAVIGATION';
    const action = 'page_change';
    const logEntry = this.formatLogEntry('INFO', context, message, details, 'Router', action);
    
    this.writeToFile('frontend-navigation.log', logEntry);
    this.writeToFile('frontend-user-actions.log', logEntry);
  }

  // Logger spécifique pour les opérations de base de données
  public database(operation: string, collection?: string, details?: any, component?: string): void {
    const message = `Database: ${operation}`;
    const context = 'DATABASE';
    const data = { collection, ...details };
    const logEntry = this.formatLogEntry('INFO', context, message, data, component, operation);
    
    this.writeToFile('frontend-database.log', logEntry);
  }

  // Fonction pour récupérer les logs (pour debug)
  public getLogs(filename: string): any[] {
    try {
      return JSON.parse(localStorage.getItem(`logs_${filename}`) || '[]');
    } catch (error) {
      console.error(`Erreur lors de la récupération des logs ${filename}:`, error);
      return [];
    }
  }

  // Fonction pour nettoyer les logs
  public clearLogs(filename?: string): void {
    if (filename) {
      localStorage.removeItem(`logs_${filename}`);
    } else {
      // Nettoyer tous les logs
      const logFiles = [
        'frontend-general.log',
        'frontend-errors.log',
        'frontend-ui.log',
        'frontend-api.log',
        'frontend-chatbot.log',
        'frontend-oracle-audit.log',
        'frontend-user-actions.log',
        'frontend-performance.log',
        'frontend-security.log',
        'frontend-file-operations.log',
        'frontend-navigation.log',
        'frontend-database.log'
      ];
      logFiles.forEach(file => localStorage.removeItem(`logs_${file}`));
    }
  }

  // Fonction pour exporter les logs
  public exportLogs(filename: string): string {
    try {
      const logs = this.getLogs(filename);
      return logs.map(log => `${log.timestamp} ${log.message}`).join('\n');
    } catch (error) {
      console.error(`Erreur lors de l'export des logs ${filename}:`, error);
      return '';
    }
  }

  // Nettoyage périodique des logs
  private setupPeriodicCleanup(): void {
    // Nettoyer les logs toutes les heures
    setInterval(() => {
      this.cleanupOldLogs();
    }, 60 * 60 * 1000); // 1 heure
  }

  private cleanupOldLogs(): void {
    const logFiles = [
      'frontend-general.log',
      'frontend-errors.log',
      'frontend-ui.log',
      'frontend-api.log',
      'frontend-chatbot.log',
      'frontend-oracle-audit.log',
      'frontend-user-actions.log',
      'frontend-performance.log',
      'frontend-security.log',
      'frontend-file-operations.log',
      'frontend-navigation.log',
      'frontend-database.log'
    ];

    logFiles.forEach(filename => {
      try {
        const logs = this.getLogs(filename);
        if (logs.length > this.maxLogSize) {
          const trimmedLogs = logs.slice(-this.maxLogSize);
          localStorage.setItem(`logs_${filename}`, JSON.stringify(trimmedLogs));
          console.log(`Logs ${filename} nettoyés: ${logs.length} → ${trimmedLogs.length} lignes`);
        }
      } catch (error) {
        console.error(`Erreur lors du nettoyage de ${filename}:`, error);
      }
    });
  }

  // Définir l'utilisateur
  public setUser(userId: string): void {
    this.userId = userId;
    this.info(`Utilisateur défini: ${userId}`, 'USER_MANAGEMENT');
  }

  // Obtenir les statistiques des logs
  public getLogStats(): any {
    const logFiles = [
      'frontend-general.log',
      'frontend-errors.log',
      'frontend-ui.log',
      'frontend-api.log',
      'frontend-chatbot.log',
      'frontend-oracle-audit.log',
      'frontend-user-actions.log',
      'frontend-performance.log',
      'frontend-security.log',
      'frontend-file-operations.log',
      'frontend-navigation.log',
      'frontend-database.log'
    ];

    const stats: any = {};
    logFiles.forEach(filename => {
      const logs = this.getLogs(filename);
      stats[filename] = {
        count: logs.length,
        lastUpdate: logs.length > 0 ? logs[logs.length - 1].timestamp : null
      };
    });

    return stats;
  }
}

// Instance singleton
const logger = AdvancedFrontendLogger.getInstance();

// Fonction utilitaire pour logger les erreurs non capturées
export const setupErrorHandling = (): void => {
  // Logger les erreurs JavaScript non capturées
  window.addEventListener('error', (event) => {
    logger.error('Erreur JavaScript non capturée', event.error, 'UNCAUGHT_ERROR', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }, 'ErrorHandler');
  });

  // Logger les promesses rejetées non gérées
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Promesse rejetée non gérée', event.reason, 'UNHANDLED_REJECTION', {}, 'ErrorHandler');
  });

  // Logger les erreurs de chargement de ressources
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      logger.error('Erreur de chargement de ressource', event.error, 'RESOURCE_ERROR', {
        target: event.target,
        type: event.type
      }, 'ErrorHandler');
    }
  }, true);

  // Logger les changements de page
  window.addEventListener('popstate', (event) => {
    logger.navigation('previous', window.location.pathname, { state: event.state });
  });

  // Logger les performances de chargement
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    logger.performance('page_load', loadTime, 'PageLoader');
  });
};

// Fonction utilitaire pour logger les performances
export const logPerformance = (name: string, duration: number, component?: string): void => {
  logger.performance(name, duration, component);
};

// Fonction utilitaire pour logger les actions utilisateur
export const logUserAction = (action: string, component: string, details?: any, userId?: string): void => {
  logger.userAction(action, component, details, userId);
};

// Fonction utilitaire pour logger les appels API
export const logApiCall = (method: string, url: string, status?: number, responseTime?: number, error?: any, component?: string): void => {
  logger.api(method, url, status, responseTime, error, component);
};

// Fonction utilitaire pour logger les interactions chatbot
export const logChatbot = (action: string, question?: string, response?: any, error?: any, component?: string): void => {
  logger.chatbot(action, question, response, error, component);
};

// Fonction utilitaire pour logger les opérations Oracle Audit
export const logOracleAudit = (action: string, details?: any, component?: string): void => {
  logger.oracleAudit(action, details, component);
};

// Fonction utilitaire pour logger les opérations de fichiers
export const logFileOperation = (action: string, fileName?: string, fileSize?: number, details?: any, component?: string): void => {
  logger.fileOperation(action, fileName, fileSize, details, component);
};

// Fonction utilitaire pour logger la navigation
export const logNavigation = (from: string, to: string, details?: any): void => {
  logger.navigation(from, to, details);
};

// Fonction utilitaire pour logger les opérations de base de données
export const logDatabase = (operation: string, collection?: string, details?: any, component?: string): void => {
  logger.database(operation, collection, details, component);
};

// Fonction utilitaire pour logger la sécurité
export const logSecurity = (action: string, details?: any, component?: string): void => {
  logger.security(action, details, component);
};

export default logger; 
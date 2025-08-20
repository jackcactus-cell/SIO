const fs = require('fs');
const path = require('path');

// Configuration des chemins de logs
const LOGS_DIR = path.join(__dirname, '..', '..', 'logs');
const BACKEND_LOG_FILE = path.join(LOGS_DIR, 'backend.log');
const BACKEND_ERROR_LOG_FILE = path.join(LOGS_DIR, 'backend-errors.log');
const API_LOG_FILE = path.join(LOGS_DIR, 'api.log');
const CHATBOT_LOG_FILE = path.join(LOGS_DIR, 'chatbot.log');
const MONGODB_LOG_FILE = path.join(LOGS_DIR, 'mongodb.log');
const USER_ACTIONS_LOG_FILE = path.join(LOGS_DIR, 'user-actions.log');
const SECURITY_LOG_FILE = path.join(LOGS_DIR, 'security.log');
const PERFORMANCE_LOG_FILE = path.join(LOGS_DIR, 'performance.log');
const FILE_OPERATIONS_LOG_FILE = path.join(LOGS_DIR, 'file-operations.log');
const ORACLE_AUDIT_LOG_FILE = path.join(LOGS_DIR, 'oracle-audit.log');
const SYSTEM_EVENTS_LOG_FILE = path.join(LOGS_DIR, 'system-events.log');
const NAVIGATION_LOG_FILE = path.join(LOGS_DIR, 'navigation.log');
const DATABASE_LOG_FILE = path.join(LOGS_DIR, 'database.log');
const GENERAL_LOG_FILE = path.join(LOGS_DIR, 'general.log');

// Créer le dossier logs s'il n'existe pas
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Fonction utilitaire pour formater la date
const formatTimestamp = () => {
  return new Date().toISOString();
};

// Fonction utilitaire pour écrire dans un fichier
const writeToFile = (filePath, message) => {
  try {
    const logEntry = `${formatTimestamp()} ${message}\n`;
    fs.appendFileSync(filePath, logEntry, 'utf8');
  } catch (error) {
    console.error('Erreur lors de l\'écriture du log:', error);
  }
};

// Fonction utilitaire pour nettoyer les anciens logs (garder seulement les 7 derniers jours)
const cleanOldLogs = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const daysOld = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysOld > 7) {
        // Garder seulement les 1000 dernières lignes
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        if (lines.length > 1000) {
          const recentLines = lines.slice(-1000);
          fs.writeFileSync(filePath, recentLines.join('\n') + '\n', 'utf8');
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des logs:', error);
  }
};

// Logger principal pour le backend
const backendLogger = {
  info: (message, context = '') => {
    const logMessage = `[INFO] [${context}] ${message}`;
    console.log(logMessage);
    writeToFile(BACKEND_LOG_FILE, logMessage);
  },
  
  warn: (message, context = '') => {
    const logMessage = `[WARN] [${context}] ${message}`;
    console.warn(logMessage);
    writeToFile(BACKEND_LOG_FILE, logMessage);
  },
  
  error: (message, error = null, context = '') => {
    let logMessage = `[ERROR] [${context}] ${message}`;
    if (error) {
      logMessage += `\nStack: ${error.stack || error.message || error}`;
    }
    console.error(logMessage);
    writeToFile(BACKEND_ERROR_LOG_FILE, logMessage);
    writeToFile(BACKEND_LOG_FILE, logMessage);
  },
  
  debug: (message, context = '') => {
    const logMessage = `[DEBUG] [${context}] ${message}`;
    console.log(logMessage);
    writeToFile(BACKEND_LOG_FILE, logMessage);
  }
};

// Logger spécifique pour l'API
const apiLogger = {
  request: (method, url, ip, userAgent) => {
    const logMessage = `[API_REQUEST] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`;
    writeToFile(API_LOG_FILE, logMessage);
  },
  
  response: (method, url, statusCode, responseTime) => {
    const logMessage = `[API_RESPONSE] ${method} ${url} - Status: ${statusCode} - Time: ${responseTime}ms`;
    writeToFile(API_LOG_FILE, logMessage);
  },
  
  error: (method, url, error, statusCode = 500) => {
    const logMessage = `[API_ERROR] ${method} ${url} - Status: ${statusCode} - Error: ${error.message || error}`;
    writeToFile(API_LOG_FILE, logMessage);
  }
};

// Logger spécifique pour le chatbot
const chatbotLogger = {
  question: (question, userId = 'anonymous') => {
    const logMessage = `[CHATBOT_QUESTION] User: ${userId} - Question: "${question}"`;
    writeToFile(CHATBOT_LOG_FILE, logMessage);
  },
  
  response: (question, response, responseTime) => {
    const logMessage = `[CHATBOT_RESPONSE] Question: "${question}" - Response: "${response}" - Time: ${responseTime}ms`;
    writeToFile(CHATBOT_LOG_FILE, logMessage);
  },
  
  error: (question, error) => {
    const logMessage = `[CHATBOT_ERROR] Question: "${question}" - Error: ${error.message || error}`;
    writeToFile(CHATBOT_LOG_FILE, logMessage);
  },
  
  fallback: (question, fallbackResponse) => {
    const logMessage = `[CHATBOT_FALLBACK] Question: "${question}" - Fallback: "${fallbackResponse}"`;
    writeToFile(CHATBOT_LOG_FILE, logMessage);
  }
};

// Logger spécifique pour MongoDB
const mongodbLogger = {
  connect: (uri) => {
    const logMessage = `[MONGODB_CONNECT] Attempting connection to: ${uri}`;
    writeToFile(MONGODB_LOG_FILE, logMessage);
  },
  
  connected: (uri) => {
    const logMessage = `[MONGODB_CONNECTED] Successfully connected to: ${uri}`;
    writeToFile(MONGODB_LOG_FILE, logMessage);
  },
  
  error: (error, context = '') => {
    const logMessage = `[MONGODB_ERROR] [${context}] ${error.message || error}`;
    writeToFile(MONGODB_LOG_FILE, logMessage);
  },
  
  query: (collection, operation, query = {}) => {
    const logMessage = `[MONGODB_QUERY] Collection: ${collection} - Operation: ${operation} - Query: ${JSON.stringify(query)}`;
    writeToFile(MONGODB_LOG_FILE, logMessage);
  },
  
  result: (collection, operation, count) => {
    const logMessage = `[MONGODB_RESULT] Collection: ${collection} - Operation: ${operation} - Count: ${count}`;
    writeToFile(MONGODB_LOG_FILE, logMessage);
  }
};

// Logger spécifique pour les actions utilisateur
const userActionsLogger = {
  login: (userId, ip, userAgent) => {
    const logMessage = `[USER_LOGIN] User: ${userId} - IP: ${ip} - User-Agent: ${userAgent}`;
    writeToFile(USER_ACTIONS_LOG_FILE, logMessage);
  },
  
  logout: (userId, ip) => {
    const logMessage = `[USER_LOGOUT] User: ${userId} - IP: ${ip}`;
    writeToFile(USER_ACTIONS_LOG_FILE, logMessage);
  },
  
  action: (userId, action, details = {}) => {
    const logMessage = `[USER_ACTION] User: ${userId} - Action: ${action} - Details: ${JSON.stringify(details)}`;
    writeToFile(USER_ACTIONS_LOG_FILE, logMessage);
  },
  
  navigation: (userId, page, fromPage = '') => {
    const logMessage = `[USER_NAVIGATION] User: ${userId} - To: ${page} - From: ${fromPage}`;
    writeToFile(USER_ACTIONS_LOG_FILE, logMessage);
  }
};

// Logger spécifique pour la sécurité
const securityLogger = {
  auth: (userId, action, success, details = {}) => {
    const status = success ? 'SUCCESS' : 'FAILED';
    const logMessage = `[SECURITY_AUTH] User: ${userId} - Action: ${action} - Status: ${status} - Details: ${JSON.stringify(details)}`;
    writeToFile(SECURITY_LOG_FILE, logMessage);
  },
  
  access: (userId, resource, action, success) => {
    const status = success ? 'ALLOWED' : 'DENIED';
    const logMessage = `[SECURITY_ACCESS] User: ${userId} - Resource: ${resource} - Action: ${action} - Status: ${status}`;
    writeToFile(SECURITY_LOG_FILE, logMessage);
  },
  
  threat: (ip, threatType, details = {}) => {
    const logMessage = `[SECURITY_THREAT] IP: ${ip} - Type: ${threatType} - Details: ${JSON.stringify(details)}`;
    writeToFile(SECURITY_LOG_FILE, logMessage);
  },
  
  audit: (userId, action, data = {}) => {
    const logMessage = `[SECURITY_AUDIT] User: ${userId} - Action: ${action} - Data: ${JSON.stringify(data)}`;
    writeToFile(SECURITY_LOG_FILE, logMessage);
  }
};

// Logger spécifique pour les performances
const performanceLogger = {
  api: (endpoint, responseTime, statusCode) => {
    const logMessage = `[PERFORMANCE_API] Endpoint: ${endpoint} - Time: ${responseTime}ms - Status: ${statusCode}`;
    writeToFile(PERFORMANCE_LOG_FILE, logMessage);
  },
  
  database: (operation, table, responseTime) => {
    const logMessage = `[PERFORMANCE_DB] Operation: ${operation} - Table: ${table} - Time: ${responseTime}ms`;
    writeToFile(PERFORMANCE_LOG_FILE, logMessage);
  },
  
  memory: (usage, type = 'current') => {
    const logMessage = `[PERFORMANCE_MEMORY] Type: ${type} - Usage: ${usage}MB`;
    writeToFile(PERFORMANCE_LOG_FILE, logMessage);
  },
  
  cpu: (usage, type = 'current') => {
    const logMessage = `[PERFORMANCE_CPU] Type: ${type} - Usage: ${usage}%`;
    writeToFile(PERFORMANCE_LOG_FILE, logMessage);
  }
};

// Logger spécifique pour les opérations de fichiers
const fileOperationsLogger = {
  upload: (userId, fileName, fileSize, fileType) => {
    const logMessage = `[FILE_UPLOAD] User: ${userId} - File: ${fileName} - Size: ${fileSize} - Type: ${fileType}`;
    writeToFile(FILE_OPERATIONS_LOG_FILE, logMessage);
  },
  
  download: (userId, fileName, fileSize) => {
    const logMessage = `[FILE_DOWNLOAD] User: ${userId} - File: ${fileName} - Size: ${fileSize}`;
    writeToFile(FILE_OPERATIONS_LOG_FILE, logMessage);
  },
  
  delete: (userId, fileName) => {
    const logMessage = `[FILE_DELETE] User: ${userId} - File: ${fileName}`;
    writeToFile(FILE_OPERATIONS_LOG_FILE, logMessage);
  },
  
  error: (userId, operation, fileName, error) => {
    const logMessage = `[FILE_ERROR] User: ${userId} - Operation: ${operation} - File: ${fileName} - Error: ${error.message || error}`;
    writeToFile(FILE_OPERATIONS_LOG_FILE, logMessage);
  }
};

// Logger spécifique pour l'audit Oracle
const oracleAuditLogger = {
  question: (userId, question, context = '') => {
    const logMessage = `[ORACLE_QUESTION] User: ${userId} - Question: "${question}" - Context: ${context}`;
    writeToFile(ORACLE_AUDIT_LOG_FILE, logMessage);
  },
  
  analysis: (userId, question, result, responseTime) => {
    const logMessage = `[ORACLE_ANALYSIS] User: ${userId} - Question: "${question}" - Result: ${result} - Time: ${responseTime}ms`;
    writeToFile(ORACLE_AUDIT_LOG_FILE, logMessage);
  },
  
  data: (userId, action, dataCount, details = {}) => {
    const logMessage = `[ORACLE_DATA] User: ${userId} - Action: ${action} - Count: ${dataCount} - Details: ${JSON.stringify(details)}`;
    writeToFile(ORACLE_AUDIT_LOG_FILE, logMessage);
  },
  
  error: (userId, question, error) => {
    const logMessage = `[ORACLE_ERROR] User: ${userId} - Question: "${question}" - Error: ${error.message || error}`;
    writeToFile(ORACLE_AUDIT_LOG_FILE, logMessage);
  }
};

// Logger spécifique pour les événements système
const systemEventsLogger = {
  startup: (version, environment) => {
    const logMessage = `[SYSTEM_STARTUP] Version: ${version} - Environment: ${environment}`;
    writeToFile(SYSTEM_EVENTS_LOG_FILE, logMessage);
  },
  
  shutdown: (reason) => {
    const logMessage = `[SYSTEM_SHUTDOWN] Reason: ${reason}`;
    writeToFile(SYSTEM_EVENTS_LOG_FILE, logMessage);
  },
  
  maintenance: (action, details = {}) => {
    const logMessage = `[SYSTEM_MAINTENANCE] Action: ${action} - Details: ${JSON.stringify(details)}`;
    writeToFile(SYSTEM_EVENTS_LOG_FILE, logMessage);
  },
  
  error: (component, error, context = '') => {
    const logMessage = `[SYSTEM_ERROR] Component: ${component} - Context: ${context} - Error: ${error.message || error}`;
    writeToFile(SYSTEM_EVENTS_LOG_FILE, logMessage);
  }
};

// Logger spécifique pour la navigation
const navigationLogger = {
  page: (userId, page, referrer = '') => {
    const logMessage = `[NAVIGATION_PAGE] User: ${userId} - Page: ${page} - Referrer: ${referrer}`;
    writeToFile(NAVIGATION_LOG_FILE, logMessage);
  },
  
  component: (userId, component, action, details = {}) => {
    const logMessage = `[NAVIGATION_COMPONENT] User: ${userId} - Component: ${component} - Action: ${action} - Details: ${JSON.stringify(details)}`;
    writeToFile(NAVIGATION_LOG_FILE, logMessage);
  },
  
  error: (userId, page, error) => {
    const logMessage = `[NAVIGATION_ERROR] User: ${userId} - Page: ${page} - Error: ${error.message || error}`;
    writeToFile(NAVIGATION_LOG_FILE, logMessage);
  }
};

// Logger spécifique pour la base de données
const databaseLogger = {
  query: (table, operation, query = {}) => {
    const logMessage = `[DATABASE_QUERY] Table: ${table} - Operation: ${operation} - Query: ${JSON.stringify(query)}`;
    writeToFile(DATABASE_LOG_FILE, logMessage);
  },
  
  result: (table, operation, count, responseTime) => {
    const logMessage = `[DATABASE_RESULT] Table: ${table} - Operation: ${operation} - Count: ${count} - Time: ${responseTime}ms`;
    writeToFile(DATABASE_LOG_FILE, logMessage);
  },
  
  error: (table, operation, error) => {
    const logMessage = `[DATABASE_ERROR] Table: ${table} - Operation: ${operation} - Error: ${error.message || error}`;
    writeToFile(DATABASE_LOG_FILE, logMessage);
  },
  
  connection: (status, details = {}) => {
    const logMessage = `[DATABASE_CONNECTION] Status: ${status} - Details: ${JSON.stringify(details)}`;
    writeToFile(DATABASE_LOG_FILE, logMessage);
  }
};

// Logger général
const generalLogger = {
  info: (message, category = 'GENERAL') => {
    const logMessage = `[INFO] [${category}] ${message}`;
    writeToFile(GENERAL_LOG_FILE, logMessage);
  },
  
  warn: (message, category = 'GENERAL') => {
    const logMessage = `[WARN] [${category}] ${message}`;
    writeToFile(GENERAL_LOG_FILE, logMessage);
  },
  
  error: (message, error = null, category = 'GENERAL') => {
    let logMessage = `[ERROR] [${category}] ${message}`;
    if (error) {
      logMessage += ` - Error: ${error.message || error}`;
    }
    writeToFile(GENERAL_LOG_FILE, logMessage);
  }
};

// Fonction de nettoyage périodique des logs
const cleanLogs = () => {
  const logFiles = [
    BACKEND_LOG_FILE,
    BACKEND_ERROR_LOG_FILE,
    API_LOG_FILE,
    CHATBOT_LOG_FILE,
    MONGODB_LOG_FILE,
    USER_ACTIONS_LOG_FILE,
    SECURITY_LOG_FILE,
    PERFORMANCE_LOG_FILE,
    FILE_OPERATIONS_LOG_FILE,
    ORACLE_AUDIT_LOG_FILE,
    SYSTEM_EVENTS_LOG_FILE,
    NAVIGATION_LOG_FILE,
    DATABASE_LOG_FILE,
    GENERAL_LOG_FILE
  ];
  
  logFiles.forEach(cleanOldLogs);
};

// Nettoyer les logs au démarrage
cleanLogs();

// Middleware Express pour logger les requêtes
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Logger la requête
  apiLogger.request(
    req.method,
    req.originalUrl,
    req.ip || req.connection.remoteAddress,
    req.get('User-Agent') || 'Unknown'
  );
  
  // Intercepter la réponse
  res.on('finish', () => {
    const duration = Date.now() - start;
    apiLogger.response(req.method, req.originalUrl, res.statusCode, duration);
  });
  
  next();
};

// Fonction pour logger les erreurs non capturées
const setupErrorHandling = () => {
  process.on('uncaughtException', (error) => {
    backendLogger.error('Uncaught Exception', error, 'PROCESS');
    systemEventsLogger.error('Process', error, 'Uncaught Exception');
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    backendLogger.error('Unhandled Rejection', reason, 'PROCESS');
    systemEventsLogger.error('Process', reason, 'Unhandled Rejection');
  });
  
  process.on('SIGTERM', () => {
    backendLogger.info('SIGTERM received, shutting down gracefully', 'PROCESS');
    systemEventsLogger.shutdown('SIGTERM received');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    backendLogger.info('SIGINT received, shutting down gracefully', 'PROCESS');
    systemEventsLogger.shutdown('SIGINT received');
    process.exit(0);
  });
};

module.exports = {
  backendLogger,
  apiLogger,
  chatbotLogger,
  mongodbLogger,
  userActionsLogger,
  securityLogger,
  performanceLogger,
  fileOperationsLogger,
  oracleAuditLogger,
  systemEventsLogger,
  navigationLogger,
  databaseLogger,
  generalLogger,
  requestLogger,
  setupErrorHandling,
  cleanLogs
}; 
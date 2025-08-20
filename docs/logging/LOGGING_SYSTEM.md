# Système de Logging Complet

## 🎯 Vue d'Ensemble

Système de logging robuste pour le backend et le frontend qui écrit directement dans des fichiers spécifiques du dossier `logs/`.

## 📁 Structure des Fichiers de Logs

```
SIO/logs/
├── backend.log           # Logs généraux du backend
├── backend-errors.log    # Erreurs du backend uniquement
├── api.log              # Logs des requêtes/réponses API
├── chatbot.log          # Logs spécifiques au chatbot
├── mongodb.log          # Logs des opérations MongoDB
├── frontend.log         # Logs généraux du frontend
├── frontend-errors.log  # Erreurs du frontend uniquement
├── frontend-ui.log      # Logs des interactions UI
├── frontend-api.log     # Logs des appels API frontend
└── frontend-chatbot.log # Logs du chatbot côté frontend
```

## 🔧 Backend Logging

### **Configuration**
- **Fichier** : `SIO/backend/utils/logger.js`
- **Fonctionnalités** : Logs structurés, rotation automatique, nettoyage périodique
- **Formats** : Timestamp ISO, niveau de log, contexte, message

### **Loggers Disponibles**

#### **1. BackendLogger**
```javascript
backendLogger.info('Message info', 'CONTEXT');
backendLogger.warn('Message warning', 'CONTEXT');
backendLogger.error('Message error', error, 'CONTEXT');
backendLogger.debug('Message debug', 'CONTEXT');
```

#### **2. ApiLogger**
```javascript
apiLogger.request('GET', '/api/endpoint', '192.168.1.1', 'User-Agent');
apiLogger.response('GET', '/api/endpoint', 200, 150);
apiLogger.error('POST', '/api/endpoint', error, 500);
```

#### **3. ChatbotLogger**
```javascript
chatbotLogger.question('Question utilisateur', 'user_id');
chatbotLogger.response('Question', 'Réponse', 250);
chatbotLogger.error('Question', error);
chatbotLogger.fallback('Question', 'Réponse de fallback');
```

#### **4. MongoDBLogger**
```javascript
mongodbLogger.connect('mongodb://localhost:27017/db');
mongodbLogger.connected('mongodb://localhost:27017/db');
mongodbLogger.query('collection', 'operation', query);
mongodbLogger.result('collection', 'operation', count);
mongodbLogger.error(error, 'CONTEXT');
```

### **Intégration dans index.js**
```javascript
const { 
  backendLogger, 
  apiLogger, 
  chatbotLogger, 
  mongodbLogger, 
  requestLogger, 
  setupErrorHandling 
} = require('./utils/logger');

// Configuration des erreurs non capturées
setupErrorHandling();

// Middleware de logging des requêtes
app.use(requestLogger);

// Utilisation dans les endpoints
app.get('/api/audit/raw', async (req, res) => {
  backendLogger.info('Demande de données d\'audit brutes', 'AUDIT');
  // ... logique
});
```

## 🎨 Frontend Logging

### **Configuration**
- **Fichier** : `SIO/project/src/utils/logger.ts`
- **Fonctionnalités** : Logs en localStorage, gestion d'erreurs, performance
- **Formats** : Timestamp ISO, niveau de log, contexte, message

### **Loggers Disponibles**

#### **1. Logger Principal**
```typescript
logger.info('Message info', 'CONTEXT', data);
logger.warn('Message warning', 'CONTEXT', data);
logger.error('Message error', error, 'CONTEXT', data);
logger.debug('Message debug', 'CONTEXT', data);
```

#### **2. Logger UI**
```typescript
logUserAction('button_click', 'ComponentName', { button: 'submit' });
logger.ui('action', 'component', details);
```

#### **3. Logger API**
```typescript
logApiCall('GET', '/api/endpoint', 200, 150);
logger.api('GET', '/api/endpoint', 200, 150);
```

#### **4. Logger Chatbot**
```typescript
logChatbot('question_sent', 'Question utilisateur');
logChatbot('response_received', 'Question', 'Réponse');
logChatbot('error', 'Question', null, error);
```

### **Intégration dans ChatbotPage**
```typescript
import logger, { logChatbot, logUserAction } from '../../utils/logger';

const handleSendMessage = async () => {
  logUserAction('send_message', 'ChatbotPage', { question: inputText });
  logChatbot('question_sent', inputText);
  
  try {
    // ... logique API
    logChatbot('response_received', question, response);
  } catch (error) {
    logger.error('Erreur API', error, 'CHATBOT_API');
    logChatbot('error', question, null, error);
  }
};
```

## 📊 Fonctionnalités Avancées

### **1. Rotation Automatique**
- **Nettoyage** : Tous les 7 jours
- **Limite** : 1000 lignes par fichier
- **Rétention** : Logs récents conservés

### **2. Gestion d'Erreurs**
```javascript
// Backend
process.on('uncaughtException', (error) => {
  backendLogger.error('Uncaught Exception', error, 'PROCESS');
});

// Frontend
window.addEventListener('error', (event) => {
  logger.error('Erreur JavaScript', event.error, 'UNCAUGHT_ERROR');
});
```

### **3. Performance Monitoring**
```typescript
// Frontend
export const logPerformance = (name: string, duration: number): void => {
  logger.info(`Performance: ${name}`, 'PERFORMANCE', { duration });
};
```

### **4. Middleware Express**
```javascript
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  apiLogger.request(req.method, req.originalUrl, req.ip, req.get('User-Agent'));
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    apiLogger.response(req.method, req.originalUrl, res.statusCode, duration);
  });
  
  next();
};
```

## 🧪 Tests et Validation

### **Script de Test Backend**
```bash
cd SIO
node test_logging.js
```

### **Vérification des Fichiers**
```bash
ls -la SIO/logs/
cat SIO/logs/backend.log
cat SIO/logs/api.log
cat SIO/logs/chatbot.log
```

### **Test Frontend**
```typescript
// Dans la console du navigateur
logger.info('Test frontend', 'TEST');
logger.getLogs('frontend.log');
logger.exportLogs('frontend.log');
```

## 📈 Exemples de Logs

### **Backend - API Request**
```
2025-07-31T16:30:15.123Z [API_REQUEST] GET /api/audit/raw - IP: 192.168.1.100 - User-Agent: Mozilla/5.0
2025-07-31T16:30:15.456Z [API_RESPONSE] GET /api/audit/raw - Status: 200 - Time: 333ms
```

### **Backend - Chatbot**
```
2025-07-31T16:30:20.789Z [CHATBOT_QUESTION] User: anonymous - Question: "Quels utilisateurs ont utilisé SQL Developer ?"
2025-07-31T16:30:21.012Z [CHATBOT_RESPONSE] Question: "Quels utilisateurs ont utilisé SQL Developer ?" - Response: "Les utilisateurs sont: datchemi, ATCHEMI" - Time: 223ms
```

### **Frontend - UI Action**
```
2025-07-31T16:30:25.345Z [INFO] [UI_ChatbotPage] UI Action: send_message - Data: {"question":"Test question"}
```

### **Frontend - API Call**
```
2025-07-31T16:30:30.678Z [INFO] [API] GET /api/chatbot - Data: {"status":200,"responseTime":150}
```

## 🔍 Surveillance et Debugging

### **1. Monitoring en Temps Réel**
```bash
# Suivre les logs en temps réel
tail -f SIO/logs/backend.log
tail -f SIO/logs/api.log
tail -f SIO/logs/chatbot.log
```

### **2. Recherche dans les Logs**
```bash
# Rechercher les erreurs
grep "ERROR" SIO/logs/backend-errors.log

# Rechercher les requêtes lentes
grep "Time: [0-9]\{3,\}ms" SIO/logs/api.log

# Rechercher les questions chatbot
grep "CHATBOT_QUESTION" SIO/logs/chatbot.log
```

### **3. Analyse des Performances**
```bash
# Analyser les temps de réponse
awk '/API_RESPONSE/ {print $NF}' SIO/logs/api.log | sort -n

# Compter les erreurs par type
grep "ERROR" SIO/logs/backend-errors.log | awk '{print $4}' | sort | uniq -c
```

## 🚀 Avantages du Système

### **1. Traçabilité Complète**
- ✅ Toutes les actions sont loggées
- ✅ Contexte détaillé pour chaque log
- ✅ Timestamps précis
- ✅ Données structurées

### **2. Debugging Facile**
- ✅ Logs séparés par fonctionnalité
- ✅ Niveaux de log appropriés
- ✅ Stack traces pour les erreurs
- ✅ Performance monitoring

### **3. Maintenance Automatique**
- ✅ Rotation automatique des logs
- ✅ Nettoyage périodique
- ✅ Limitation de taille
- ✅ Gestion mémoire optimisée

### **4. Sécurité et Conformité**
- ✅ Logs d'audit complets
- ✅ Traçabilité des actions utilisateur
- ✅ Monitoring des erreurs
- ✅ Historique des performances

---

*Dernière mise à jour : 31 juillet 2025*
*Version : Système de Logging v2.0* 
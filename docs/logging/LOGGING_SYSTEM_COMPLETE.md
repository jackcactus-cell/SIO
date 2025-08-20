# Système de Logging Complet - SIO Application

## 🎯 Vue d'Ensemble

Système de logging robuste et complet pour l'application SIO qui capture tous les événements, erreurs et actions utilisateur dans des fichiers organisés et structurés.

## 📁 Structure des Fichiers de Logs

```
SIO/logs/
├── backend.log              # Logs généraux du backend Node.js
├── backend-errors.log       # Erreurs du backend uniquement
├── api.log                  # Logs des requêtes/réponses API
├── chatbot.log              # Logs spécifiques au chatbot
├── mongodb.log              # Logs des opérations MongoDB
├── app.log                  # Logs de l'application Python
├── frontend.log             # Logs généraux du frontend (localStorage)
├── frontend-errors.log      # Erreurs du frontend uniquement
├── frontend-ui.log          # Logs des interactions UI
├── frontend-api.log         # Logs des appels API frontend
├── frontend-chatbot.log     # Logs du chatbot côté frontend
├── log_report.json          # Rapport automatique des logs
└── archive/                 # Archives des anciens logs
    └── YYYY-MM-DD/
        ├── backend.log
        ├── api.log
        └── ...
```

## 🔧 Configuration Backend (Node.js)

### **Fichier Principal** : `SIO/backend/utils/logger.js`

#### **Loggers Disponibles**

##### **1. BackendLogger**
```javascript
backendLogger.info('Message info', 'CONTEXT');
backendLogger.warn('Message warning', 'CONTEXT');
backendLogger.error('Message error', error, 'CONTEXT');
backendLogger.debug('Message debug', 'CONTEXT');
```

##### **2. ApiLogger**
```javascript
apiLogger.request('GET', '/api/endpoint', '192.168.1.1', 'User-Agent');
apiLogger.response('GET', '/api/endpoint', 200, 150);
apiLogger.error('POST', '/api/endpoint', error, 500);
```

##### **3. ChatbotLogger**
```javascript
chatbotLogger.question('Question utilisateur', 'user_id');
chatbotLogger.response('Question', 'Réponse', 250);
chatbotLogger.error('Question', error);
chatbotLogger.fallback('Question', 'Réponse de fallback');
```

##### **4. MongoDBLogger**
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

// Configuration automatique
setupErrorHandling();
app.use(requestLogger);

// Utilisation dans les endpoints
app.get('/api/audit/raw', async (req, res) => {
  backendLogger.info('Demande de données d\'audit brutes', 'AUDIT');
  // ... logique
});
```

## 🎨 Configuration Frontend (TypeScript/React)

### **Fichier Principal** : `SIO/project/src/utils/logger.ts`

#### **Loggers Disponibles**

##### **1. Logger Principal**
```typescript
logger.info('Message info', 'CONTEXT', data);
logger.warn('Message warning', 'CONTEXT', data);
logger.error('Message error', error, 'CONTEXT', data);
logger.debug('Message debug', 'CONTEXT', data);
```

##### **2. Logger UI**
```typescript
logUserAction('button_click', 'ComponentName', { button: 'submit' });
logger.ui('action', 'component', details);
```

##### **3. Logger API**
```typescript
logApiCall('GET', '/api/endpoint', 200, 150);
logger.api('GET', '/api/endpoint', 200, 150);
```

##### **4. Logger Chatbot**
```typescript
logChatbot('question_sent', 'Question utilisateur');
logChatbot('response_received', 'Question', 'Réponse');
logChatbot('error', 'Question', null, error);
```

### **Intégration dans main.tsx**
```typescript
import { setupErrorHandling } from './utils/logger';

// Initialisation du système de logging frontend
setupErrorHandling();
```

## 📊 Format des Logs

### **Structure Standard**
```
2025-01-03T10:30:45.123Z [LEVEL] [CONTEXT] Message - Data: {...}
```

### **Exemples de Logs**

#### **Backend Logs**
```
2025-01-03T10:30:45.123Z [INFO] [AUDIT] Demande de données d'audit brutes
2025-01-03T10:30:45.124Z [ERROR] [MONGODB] Erreur de connexion - Error: Connection refused
2025-01-03T10:30:45.125Z [API_REQUEST] GET /api/audit/raw - IP: 192.168.1.1 - User-Agent: Mozilla/5.0
2025-01-03T10:30:45.126Z [API_RESPONSE] GET /api/audit/raw - Status: 200 - Time: 150ms
```

#### **Frontend Logs**
```
2025-01-03T10:30:45.123Z [INFO] [UI_OracleLogin] UI Action: test_connection - Data: {"host":"localhost","port":1521}
2025-01-03T10:30:45.124Z [INFO] [API] GET /api/oracle/test-connection - Data: {"status":200,"responseTime":150}
2025-01-03T10:30:45.125Z [INFO] [CHATBOT] Chatbot question_sent - Data: {"question":"Comment analyser les performances?"}
```

## 🔄 Gestion Automatique des Logs

### **Rotation des Logs**
- **Limite de taille** : 1000 lignes par fichier
- **Rotation quotidienne** : Nouveaux fichiers créés chaque jour
- **Archivage automatique** : Anciens logs déplacés dans `archive/YYYY-MM-DD/`

### **Nettoyage Périodique**
- **Rétention** : 7 jours maximum
- **Nettoyage automatique** : Suppression des logs anciens
- **Compression** : Logs archivés compressés

### **Surveillance**
```bash
# Suivre les logs en temps réel
tail -f SIO/logs/backend.log
tail -f SIO/logs/api.log
tail -f SIO/logs/chatbot.log

# Rechercher les erreurs
grep "ERROR" SIO/logs/backend-errors.log

# Rechercher les requêtes lentes
grep "Time: [0-9]\{3,\}ms" SIO/logs/api.log
```

## 🛠️ Scripts de Maintenance

### **Test du Système de Logging**
```bash
node SIO/test_logging_complete.js
```

### **Nettoyage des Logs**
```bash
node SIO/cleanup_logs.js
```

### **Fonctionnalités des Scripts**

#### **test_logging_complete.js**
- ✅ Vérification de l'existence des fichiers
- ✅ Test des différents types de logs
- ✅ Analyse de la structure des logs
- ✅ Vérification de la rotation
- ✅ Rapport de santé du système

#### **cleanup_logs.js**
- 🧹 Nettoyage des anciens logs
- 📦 Archivage automatique
- 🔍 Vérification de l'intégrité
- 📊 Génération de rapports
- 📁 Organisation par date

## 📈 Monitoring et Alertes

### **Métriques Surveillées**
- **Volume de logs** : Nombre de lignes par fichier
- **Taux d'erreurs** : Pourcentage d'erreurs vs logs totaux
- **Performance** : Temps de réponse des API
- **Utilisation** : Actions utilisateur fréquentes

### **Alertes Automatiques**
- **Fichiers trop volumineux** : > 1000 lignes
- **Logs anciens** : > 7 jours
- **Taux d'erreurs élevé** : > 10%
- **Performance dégradée** : Temps de réponse > 500ms

## 🔒 Sécurité et Conformité

### **Données Sensibles**
- **Mots de passe** : Jamais loggés
- **Tokens** : Masqués dans les logs
- **IPs** : Loggées pour audit
- **Actions utilisateur** : Traçées pour conformité

### **Audit Trail**
- **Toutes les actions** : Enregistrées avec timestamp
- **Contexte complet** : Données associées aux actions
- **Traçabilité** : Suivi des sessions utilisateur
- **Conformité** : Respect des normes d'audit

## 🚀 Utilisation Avancée

### **Logs Personnalisés**
```javascript
// Backend
backendLogger.info('Action métier spécifique', 'BUSINESS_LOGIC', {
  userId: 'user123',
  action: 'data_export',
  timestamp: new Date().toISOString()
});

// Frontend
logger.info('Action utilisateur complexe', 'USER_ACTION', {
  component: 'Dashboard',
  action: 'export_report',
  parameters: { format: 'pdf', dateRange: 'last_month' }
});
```

### **Logs de Performance**
```javascript
// Mesure du temps d'exécution
const startTime = Date.now();
// ... opération
const duration = Date.now() - startTime;
logger.info(`Opération terminée en ${duration}ms`, 'PERFORMANCE');
```

### **Logs d'Erreurs Détaillés**
```javascript
try {
  // ... opération risquée
} catch (error) {
  logger.error('Échec de l\'opération', error, 'CRITICAL_OPERATION', {
    context: 'data_processing',
    userId: currentUser.id,
    timestamp: new Date().toISOString()
  });
}
```

## 📋 Checklist de Vérification

### **Installation**
- [ ] Dossier `logs/` créé
- [ ] Fichiers de logs initialisés
- [ ] Permissions d'écriture configurées
- [ ] Rotation automatique activée

### **Configuration**
- [ ] Loggers importés dans les fichiers principaux
- [ ] Middleware de logging configuré
- [ ] Gestion d'erreurs non capturées activée
- [ ] Niveaux de log appropriés définis

### **Test**
- [ ] Scripts de test exécutés
- [ ] Logs écrits dans les bons fichiers
- [ ] Format des logs vérifié
- [ ] Rotation et nettoyage testés

### **Monitoring**
- [ ] Surveillance en temps réel configurée
- [ ] Alertes définies
- [ ] Rapports automatiques activés
- [ ] Archivage fonctionnel

## 🎯 Bénéfices

### **Pour les Développeurs**
- **Debugging facilité** : Logs structurés et détaillés
- **Performance monitoring** : Temps de réponse et métriques
- **Traçabilité** : Suivi complet des actions
- **Maintenance** : Rotation et nettoyage automatiques

### **Pour les Administrateurs**
- **Surveillance** : Monitoring en temps réel
- **Alertes** : Notifications automatiques
- **Audit** : Conformité et traçabilité
- **Maintenance** : Gestion automatisée des logs

### **Pour les Utilisateurs**
- **Fiabilité** : Système robuste et fiable
- **Performance** : Optimisation continue
- **Sécurité** : Traçabilité des actions
- **Support** : Debugging facilité

---

**Système de Logging Complet - Version 1.0**  
*Documentation mise à jour le 3 janvier 2025*

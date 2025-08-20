# Système de Logging Complet - Toutes les Activités

## 🎯 Vue d'Ensemble

Système de logging avancé qui capture **toutes les activités** de l'application SIO dans des fichiers spécifiques, avec une granularité maximale et une organisation optimale.

## 📁 Structure Complète des Fichiers de Logs

### **Backend Logs (Node.js)**
```
SIO/logs/
├── backend.log              # Logs généraux du backend
├── backend-errors.log       # Erreurs du backend uniquement
├── api.log                  # Logs des requêtes/réponses API
├── chatbot.log              # Logs spécifiques au chatbot
├── mongodb.log              # Logs des opérations MongoDB
├── app.log                  # Logs de l'application Python
```

### **Frontend Logs (TypeScript/React)**
```
SIO/logs/
├── frontend-general.log     # Logs généraux du frontend
├── frontend-errors.log      # Erreurs du frontend uniquement
├── frontend-ui.log          # Logs des interactions UI
├── frontend-api.log         # Logs des appels API frontend
├── frontend-chatbot.log     # Logs du chatbot côté frontend
├── frontend-oracle-audit.log # Logs spécifiques Oracle Audit
├── frontend-user-actions.log # Logs des actions utilisateur
├── frontend-performance.log # Logs de performance
├── frontend-security.log    # Logs de sécurité
├── frontend-file-operations.log # Logs des opérations de fichiers
├── frontend-navigation.log  # Logs de navigation
├── frontend-database.log    # Logs des opérations de base de données
```

### **Logs Unifiés (Système complet)**
```
SIO/logs/unified/
├── unified-application.log  # Tous les logs d'application
├── unified-errors.log       # Toutes les erreurs
├── unified-api.log          # Tous les appels API
├── unified-user-actions.log # Toutes les actions utilisateur
├── unified-performance.log  # Toutes les métriques de performance
├── unified-security.log     # Tous les événements de sécurité
├── unified-database.log     # Toutes les opérations de base de données
├── unified-file-operations.log # Toutes les opérations de fichiers
├── unified-navigation.log   # Toutes les navigations
├── unified-chatbot.log      # Toutes les interactions chatbot
├── unified-oracle-audit.log # Toutes les opérations Oracle Audit
├── unified-system.log       # Tous les événements système
```

## 🔧 Loggers Spécifiques par Activité

### **1. Logger Backend (Node.js)**
```javascript
// Logs généraux
backendLogger.info('Message info', 'CONTEXT');
backendLogger.warn('Message warning', 'CONTEXT');
backendLogger.error('Message error', error, 'CONTEXT');
backendLogger.debug('Message debug', 'CONTEXT');

// Logs API spécifiques
apiLogger.request('GET', '/api/endpoint', '192.168.1.1', 'User-Agent');
apiLogger.response('GET', '/api/endpoint', 200, 150);
apiLogger.error('POST', '/api/endpoint', error, 500);

// Logs Chatbot spécifiques
chatbotLogger.question('Question utilisateur', 'user_id');
chatbotLogger.response('Question', 'Réponse', 250);
chatbotLogger.error('Question', error);
chatbotLogger.fallback('Question', 'Réponse de fallback');

// Logs MongoDB spécifiques
mongodbLogger.connect('mongodb://localhost:27017/db');
mongodbLogger.connected('mongodb://localhost:27017/db');
mongodbLogger.query('collection', 'operation', query);
mongodbLogger.result('collection', 'operation', count);
mongodbLogger.error(error, 'CONTEXT');
```

### **2. Logger Frontend Avancé (TypeScript/React)**
```typescript
// Logger général
logger.info('Message info', 'CONTEXT', data, 'Component', 'action');
logger.warn('Message warning', 'CONTEXT', data, 'Component', 'action');
logger.error('Message error', error, 'CONTEXT', data, 'Component', 'action');
logger.debug('Message debug', 'CONTEXT', data, 'Component', 'action');

// Logger UI spécifique
logUserAction('button_click', 'ComponentName', { button: 'submit' }, 'user_id');

// Logger API spécifique
logApiCall('GET', '/api/endpoint', 200, 150, undefined, 'ComponentName');

// Logger Chatbot spécifique
logChatbot('question_sent', 'Question utilisateur', undefined, undefined, 'ComponentName');

// Logger Oracle Audit spécifique
logOracleAudit('page_accessed', { timestamp: new Date().toISOString() }, 'OracleAuditPage');

// Logger Performance spécifique
logPerformance('page_load', 1250, 'ComponentName');

// Logger Sécurité spécifique
logSecurity('session_created', { userId: 'admin' }, 'AuthComponent');

// Logger Opérations de fichiers spécifique
logFileOperation('upload_started', 'file.log', 1024, { fileCount: 2 }, 'ComponentName');

// Logger Navigation spécifique
logNavigation('/dashboard', '/oracle-audit', { userId: 'admin' });

// Logger Base de données spécifique
logDatabase('cache_loaded', 'oracle_audit_cache', { itemCount: 15 }, 'ComponentName');
```

## 📊 Format des Logs par Activité

### **Structure Standard**
```
2025-01-03T10:30:45.123Z [LEVEL] [CONTEXT] Message - Component: ComponentName - Action: action - Session: session_id - User: user_id
```

### **Exemples par Type d'Activité**

#### **Activités Backend**
```
2025-01-03T10:30:45.123Z [INFO] [AUDIT] Demande de données d'audit brutes
2025-01-03T10:30:45.124Z [ERROR] [MONGODB] Erreur de connexion - Error: Connection refused
2025-01-03T10:30:45.125Z [API_REQUEST] GET /api/audit/raw - IP: 192.168.1.1 - User-Agent: Mozilla/5.0
2025-01-03T10:30:45.126Z [API_RESPONSE] GET /api/audit/raw - Status: 200 - Time: 150ms
```

#### **Activités Frontend**
```
2025-01-03T10:30:45.123Z [INFO] [UI_ACTION] Bouton cliqué - Component: OracleAuditPage - Action: upload_logs - Session: session_123 - User: admin
2025-01-03T10:30:45.124Z [INFO] [API] GET /api/oracle/test-connection - Status: 200 - Time: 150ms - Component: OracleAuditPage
2025-01-03T10:30:45.125Z [INFO] [CHATBOT] Question envoyée - Question: "Analyse des performances" - Component: OracleAuditPage
2025-01-03T10:30:45.126Z [INFO] [ORACLE_AUDIT] Page accédée - Timestamp: 2025-01-03T10:30:45.126Z - Component: OracleAuditPage
```

#### **Activités de Performance**
```
2025-01-03T10:30:45.123Z [INFO] [PERFORMANCE] Page load - Duration: 1250ms - Component: OracleAuditPage
2025-01-03T10:30:45.124Z [INFO] [PERFORMANCE] API call - Duration: 2500ms - Endpoint: /api/ask-llm - Component: OracleAuditPage
```

#### **Activités de Sécurité**
```
2025-01-03T10:30:45.123Z [INFO] [SECURITY] Session créée - User: admin - SessionId: session_123456 - Component: AuthComponent
2025-01-03T10:30:45.124Z [INFO] [SECURITY] Page accédée - User: admin - Page: /oracle-audit - Component: Router
```

#### **Activités de Navigation**
```
2025-01-03T10:30:45.123Z [INFO] [NAVIGATION] Navigation: /dashboard → /oracle-audit - User: admin
2025-01-03T10:30:45.124Z [INFO] [NAVIGATION] Page loaded - Page: /oracle-audit - LoadTime: 1250ms
```

## 🎯 Activités Loggées par Composant

### **OracleAuditPage**
- ✅ **Accès à la page** → `frontend-navigation.log`
- ✅ **Chargement des données** → `frontend-database.log`
- ✅ **Upload de fichiers** → `frontend-file-operations.log`
- ✅ **Envoi de questions** → `frontend-chatbot.log`
- ✅ **Appels API** → `frontend-api.log`
- ✅ **Actions utilisateur** → `frontend-user-actions.log`
- ✅ **Performance** → `frontend-performance.log`
- ✅ **Erreurs** → `frontend-errors.log`
- ✅ **Opérations Oracle Audit** → `frontend-oracle-audit.log`

### **Système Backend**
- ✅ **Requêtes API** → `api.log`
- ✅ **Opérations MongoDB** → `mongodb.log`
- ✅ **Interactions Chatbot** → `chatbot.log`
- ✅ **Erreurs système** → `backend-errors.log`
- ✅ **Logs généraux** → `backend.log`

### **Système Python**
- ✅ **Logs d'application** → `app.log`
- ✅ **Opérations LLM** → `app.log`
- ✅ **Traitement des données** → `app.log`

## 🔄 Gestion Automatique

### **Rotation des Logs**
- **Limite de taille** : 1000 lignes par fichier
- **Rotation quotidienne** : Nouveaux fichiers créés chaque jour
- **Archivage automatique** : Anciens logs déplacés dans `archive/YYYY-MM-DD/`

### **Nettoyage Périodique**
- **Rétention** : 7 jours maximum
- **Nettoyage automatique** : Suppression des logs anciens
- **Compression** : Logs archivés compressés

### **Synchronisation**
- **Logs unifiés** : Tous les logs regroupés par type d'activité
- **Préfixes** : [BACKEND], [FRONTEND], [PYTHON] pour identifier la source
- **Métadonnées** : Session ID, User ID, Component, Action

## 📈 Monitoring et Surveillance

### **Commandes de Surveillance par Activité**
```bash
# Suivre les logs en temps réel par activité
tail -f logs/backend.log                    # Activités backend
tail -f logs/api.log                        # Activités API
tail -f logs/chatbot.log                    # Activités chatbot
tail -f logs/frontend-ui.log                # Activités UI
tail -f logs/frontend-api.log               # Activités API frontend
tail -f logs/frontend-oracle-audit.log      # Activités Oracle Audit
tail -f logs/frontend-user-actions.log      # Actions utilisateur
tail -f logs/frontend-performance.log       # Performance
tail -f logs/frontend-security.log          # Sécurité
tail -f logs/frontend-file-operations.log   # Opérations fichiers
tail -f logs/frontend-navigation.log        # Navigation
tail -f logs/frontend-database.log          # Base de données

# Logs unifiés
tail -f logs/unified/unified-application.log
tail -f logs/unified/unified-errors.log
tail -f logs/unified/unified-api.log
tail -f logs/unified/unified-user-actions.log
```

### **Recherche Spécifique par Activité**
```bash
# Rechercher les erreurs
grep "ERROR" logs/backend-errors.log
grep "ERROR" logs/frontend-errors.log

# Rechercher les actions utilisateur
grep "USER_ACTION" logs/frontend-user-actions.log

# Rechercher les appels API lents
grep "Time: [0-9]\{3,\}ms" logs/api.log

# Rechercher les questions chatbot
grep "CHATBOT_QUESTION" logs/chatbot.log

# Rechercher les opérations Oracle Audit
grep "ORACLE_AUDIT" logs/frontend-oracle-audit.log

# Rechercher les problèmes de performance
grep "Duration: [0-9]\{4,\}ms" logs/frontend-performance.log
```

## 🛠️ Scripts de Maintenance

### **Test du Système**
```bash
node test_logging_complete.js
```

### **Nettoyage des Logs**
```bash
node cleanup_logs.js
```

### **Synchronisation Unifiée**
```bash
node sync_logs.js
```

### **Démarrage Complet**
```bash
.\start_application.ps1
```

## 📊 Rapports Automatiques

### **Rapports Générés**
- `logs/log_report.json` - Rapport général des logs
- `logs/advanced_health_report.json` - Rapport de santé avancé
- `logs/sync_report.json` - Rapport de synchronisation

### **Métriques Surveillées**
- **Volume de logs** : Nombre de lignes par fichier
- **Taux d'erreurs** : Pourcentage d'erreurs vs logs totaux
- **Performance** : Temps de réponse des API
- **Utilisation** : Actions utilisateur fréquentes
- **Sécurité** : Événements de sécurité
- **Navigation** : Pages les plus visitées

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

## 🎯 Bénéfices du Système

### **Pour les Développeurs**
- **Debugging facilité** : Logs structurés et détaillés par activité
- **Performance monitoring** : Temps de réponse et métriques par composant
- **Traçabilité** : Suivi complet des actions utilisateur
- **Maintenance** : Rotation et nettoyage automatiques

### **Pour les Administrateurs**
- **Surveillance** : Monitoring en temps réel par type d'activité
- **Alertes** : Notifications automatiques par catégorie
- **Audit** : Conformité et traçabilité complète
- **Maintenance** : Gestion automatisée des logs

### **Pour les Utilisateurs**
- **Fiabilité** : Système robuste et fiable
- **Performance** : Optimisation continue basée sur les logs
- **Sécurité** : Traçabilité des actions
- **Support** : Debugging facilité

## ✅ Checklist de Vérification

### **Système de Logging**
- [x] Dossier `logs/` créé et fonctionnel
- [x] Fichiers de logs spécifiques initialisés
- [x] Rotation automatique configurée
- [x] Nettoyage périodique activé
- [x] Scripts de test et maintenance créés
- [x] Documentation complète rédigée

### **Loggers Spécifiques**
- [x] Logger backend avec contexte détaillé
- [x] Logger frontend avancé avec métadonnées
- [x] Logger API avec métriques de performance
- [x] Logger chatbot avec contexte utilisateur
- [x] Logger MongoDB avec opérations détaillées
- [x] Logger Oracle Audit spécifique
- [x] Logger Performance avec mesures
- [x] Logger Sécurité avec événements
- [x] Logger Navigation avec traçabilité
- [x] Logger Base de données avec opérations

### **Système Unifié**
- [x] Logs unifiés par type d'activité
- [x] Préfixes pour identifier la source
- [x] Métadonnées complètes (Session, User, Component, Action)
- [x] Synchronisation automatique
- [x] Rapports de santé

---

**Système de Logging Complet - Version 2.0**  
*Toutes les activités loggées différemment dans des fichiers spécifiques*  
*Documentation mise à jour le 3 janvier 2025*

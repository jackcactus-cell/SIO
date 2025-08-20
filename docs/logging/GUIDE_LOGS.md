# 📊 Guide Complet du Système de Logs - SAO

## 🎯 Vue d'ensemble

Le système SAO dispose d'un système de logging complet et organisé qui enregistre toutes les actions dans des fichiers spécifiques dans le dossier `logs/`.

## 📁 Structure des fichiers de logs

### 🔧 Logs système
- **`backend.log`** - Logs généraux du backend
- **`backend-errors.log`** - Erreurs du backend uniquement
- **`api.log`** - Requêtes et réponses API
- **`system-events.log`** - Événements système (démarrage, arrêt, maintenance)

### 🤖 Logs chatbot
- **`chatbot.log`** - Questions, réponses et erreurs du chatbot
- **`oracle-audit.log`** - Analyse d'audit Oracle spécifique

### 👤 Logs utilisateur
- **`user-actions.log`** - Actions des utilisateurs (connexion, navigation, clics)
- **`navigation.log`** - Navigation entre les pages
- **`security.log`** - Authentification, autorisations, menaces

### 💾 Logs base de données
- **`mongodb.log`** - Connexions et requêtes MongoDB
- **`database.log`** - Opérations de base de données générales

### 📈 Logs performance
- **`performance.log`** - Temps de réponse, utilisation mémoire/CPU
- **`file-operations.log`** - Upload, download, suppression de fichiers

### 📋 Logs généraux
- **`general.log`** - Logs généraux non catégorisés

## 🛠️ Utilisation des loggers

### Dans le code backend

```javascript
const {
  backendLogger,
  userActionsLogger,
  securityLogger,
  performanceLogger,
  fileOperationsLogger,
  oracleAuditLogger,
  systemEventsLogger,
  navigationLogger,
  databaseLogger,
  generalLogger
} = require('./utils/logger');

// Exemples d'utilisation
backendLogger.info('Message d\'information', 'CONTEXT');
backendLogger.warn('Avertissement', 'CONTEXT');
backendLogger.error('Erreur', error, 'CONTEXT');

userActionsLogger.login('user123', '192.168.1.1', 'Chrome');
userActionsLogger.action('user123', 'button_click', { button: 'submit' });

securityLogger.auth('user123', 'login', true, { method: 'password' });
securityLogger.threat('192.168.1.100', 'brute_force', { attempts: 10 });

performanceLogger.api('/api/users', 150, 200);
performanceLogger.database('select', 'users', 50);

fileOperationsLogger.upload('user123', 'data.csv', '1024', 'text/csv');
oracleAuditLogger.question('user123', 'Quels utilisateurs actifs ?', 'ChatbotPage');
```

### Dans le code frontend

```typescript
import logger, { 
  logUserAction, 
  logSecurity, 
  logPerformance, 
  logFileOperation, 
  logOracleAudit 
} from '../utils/logger';

// Exemples d'utilisation
logger.info('Action utilisateur', 'UI_ACTION', { component: 'LoginForm' });
logUserAction('login_attempt', 'LoginPage', { method: 'password' });
logSecurity('auth_attempt', 'LoginPage', { success: true });
logPerformance('page_load', 250, 'DashboardPage');
logFileOperation('file_upload', 'data.csv', 1024, { type: 'csv' });
logOracleAudit('question_sent', { question: 'Quels utilisateurs actifs ?' });
```

## 🔍 Analyse des logs

### Script d'analyse automatique

```bash
cd SIO/backend
node log_analyzer.js
```

Ce script fournit :
- 📊 Statistiques générales
- 🕒 Dernières entrées par type
- 🔍 Recherche de patterns spécifiques
- 📄 Génération de rapport JSON
- 🧹 Nettoyage automatique des anciens logs

### Commandes utiles pour l'analyse

```bash
# Voir les dernières entrées d'un log spécifique
tail -f logs/backend.log
tail -f logs/user-actions.log

# Rechercher des erreurs
grep "\[ERROR\]" logs/backend.log

# Rechercher des actions d'un utilisateur
grep "user123" logs/user-actions.log

# Rechercher des problèmes de performance
grep "time.*[5-9][0-9][0-9]ms" logs/performance.log

# Rechercher des menaces de sécurité
grep "threat" logs/security.log
```

## 📊 Types de logs détaillés

### 1. **Backend Logs** (`backend.log`, `backend-errors.log`)
```
[INFO] [STARTUP] Serveur démarré sur le port 4000
[WARN] [MONGODB] Tentative de reconnexion
[ERROR] [API] Erreur lors du traitement de la requête
```

### 2. **API Logs** (`api.log`)
```
[API_REQUEST] GET /api/users - IP: 192.168.1.1 - User-Agent: Chrome
[API_RESPONSE] GET /api/users - Status: 200 - Time: 150ms
[API_ERROR] POST /api/login - Status: 401 - Error: Invalid credentials
```

### 3. **User Actions** (`user-actions.log`)
```
[USER_LOGIN] User: user123 - IP: 192.168.1.1 - User-Agent: Chrome
[USER_ACTION] User: user123 - Action: button_click - Details: {"button":"submit"}
[USER_NAVIGATION] User: user123 - To: /dashboard - From: /login
```

### 4. **Security** (`security.log`)
```
[SECURITY_AUTH] User: user123 - Action: login - Status: SUCCESS - Details: {"method":"password"}
[SECURITY_ACCESS] User: user123 - Resource: /admin - Action: read - Status: DENIED
[SECURITY_THREAT] IP: 192.168.1.100 - Type: brute_force - Details: {"attempts":10}
```

### 5. **Performance** (`performance.log`)
```
[PERFORMANCE_API] Endpoint: /api/users - Time: 150ms - Status: 200
[PERFORMANCE_DB] Operation: select - Table: users - Time: 50ms
[PERFORMANCE_MEMORY] Type: current - Usage: 512MB
```

### 6. **Chatbot** (`chatbot.log`)
```
[CHATBOT_QUESTION] User: user123 - Question: "Quels utilisateurs actifs ?"
[CHATBOT_RESPONSE] Question: "Quels utilisateurs actifs ?" - Response: "5 utilisateurs trouvés" - Time: 200ms
[CHATBOT_ERROR] Question: "Question complexe" - Error: Timeout
```

## 🔧 Configuration et maintenance

### Rotation automatique des logs
- **Rétention** : 7 jours maximum
- **Taille maximale** : 1000 lignes par fichier
- **Nettoyage automatique** au démarrage du serveur

### Surveillance en temps réel
```bash
# Surveiller tous les logs
tail -f logs/*.log

# Surveiller les erreurs
tail -f logs/backend-errors.log

# Surveiller les actions utilisateur
tail -f logs/user-actions.log
```

### Alertes automatiques
Le système peut être configuré pour envoyer des alertes en cas de :
- Erreurs critiques
- Tentatives de connexion suspectes
- Performances dégradées
- Menaces de sécurité

## 📈 Métriques et KPIs

### Métriques de performance
- Temps de réponse API moyen
- Utilisation mémoire/CPU
- Temps de requête base de données

### Métriques de sécurité
- Tentatives de connexion échouées
- Accès refusés
- Menaces détectées

### Métriques d'utilisation
- Nombre d'utilisateurs actifs
- Actions les plus fréquentes
- Pages les plus visitées

## 🚨 Dépannage

### Problèmes courants

1. **Logs trop volumineux**
   ```bash
   node log_analyzer.js  # Nettoie automatiquement
   ```

2. **Erreurs répétitives**
   ```bash
   grep "\[ERROR\]" logs/backend-errors.log | sort | uniq -c | sort -nr
   ```

3. **Performances dégradées**
   ```bash
   grep "time.*[0-9][0-9][0-9][0-9]ms" logs/performance.log
   ```

4. **Problèmes de sécurité**
   ```bash
   grep "threat\|denied\|unauthorized" logs/security.log
   ```

## 📋 Checklist de surveillance

- [ ] Vérifier les erreurs critiques quotidiennement
- [ ] Surveiller les performances hebdomadairement
- [ ] Analyser les tentatives de connexion suspectes
- [ ] Vérifier l'utilisation des ressources
- [ ] Nettoyer les anciens logs mensuellement
- [ ] Sauvegarder les logs importants

## 🎯 Bonnes pratiques

1. **Logs informatifs** : Inclure toujours le contexte
2. **Logs structurés** : Utiliser des formats JSON pour les détails
3. **Logs sécurisés** : Ne jamais logger les mots de passe
4. **Logs performants** : Éviter les logs dans les boucles critiques
5. **Logs utiles** : Logger ce qui aide au débogage

---

## ✅ Système de logs opérationnel !

Votre système SAO dispose maintenant d'un système de logging complet qui enregistre toutes les actions dans des fichiers organisés et analysables. Utilisez les outils fournis pour surveiller et optimiser votre application ! 🚀

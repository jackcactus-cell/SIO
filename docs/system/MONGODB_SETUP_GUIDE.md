# Guide de configuration MongoDB

## Vue d'ensemble

Ce guide explique comment configurer et utiliser MongoDB avec Docker pour l'application SIO Audit. La configuration inclut :

- MongoDB 7.0 avec authentification
- Mongo Express pour l'interface web
- Scripts d'initialisation automatique
- Données d'exemple pour les tests
- Vues d'analyse pour les requêtes

## Prérequis

### 1. Docker et Docker Compose
- Docker Desktop installé et démarré
- Docker Compose disponible
- Au moins 2GB de RAM disponible

### 2. Ports requis
- Port 27017 : MongoDB
- Port 8081 : Mongo Express (interface web)

## Configuration rapide

### 1. Démarrage automatique
```powershell
# Exécuter le script de configuration
.\scripts\setup_mongodb.ps1
```

### 2. Démarrage manuel
```bash
# Aller dans le dossier de configuration
cd config/docker

# Démarrer MongoDB
docker-compose -f mongodb-compose.yml up -d

# Vérifier les logs
docker-compose -f mongodb-compose.yml logs -f
```

## Structure de la base de données

### Collections principales

#### 1. actions_audit
Stocke les actions d'audit Oracle :
```javascript
{
  OS_USERNAME: "datchemi",
  DBUSERNAME: "datchemi", 
  ACTION_NAME: "SELECT",
  OBJECT_NAME: "EMPLOYEES",
  EVENT_TIMESTAMP: ISODate("2025-01-15T10:00:00Z"),
  CLIENT_PROGRAM_NAME: "SQL Developer",
  OBJECT_SCHEMA: "HR",
  USERHOST: "192.168.60.42",
  SESSION_ID: "SESS_001",
  SQL_TEXT: "SELECT * FROM employees WHERE department_id = 10"
}
```

#### 2. audit_logs
Logs système de l'application :
```javascript
{
  timestamp: ISODate("2025-01-15T10:00:00Z"),
  level: "INFO",
  component: "AUTHENTICATION",
  message: "Utilisateur datchemi connecté avec succès",
  user_id: "datchemi",
  session_id: "SESS_001",
  ip_address: "192.168.60.42"
}
```

#### 3. user_sessions
Sessions utilisateur :
```javascript
{
  user_id: "datchemi",
  session_id: "SESS_001",
  session_start: ISODate("2025-01-15T10:00:00Z"),
  session_end: ISODate("2025-01-15T12:00:00Z"),
  ip_address: "192.168.60.42",
  client_program: "SQL Developer",
  actions_count: 15,
  status: "COMPLETED"
}
```

### Vues d'analyse

#### 1. user_action_stats
Statistiques par utilisateur :
```javascript
{
  username: "datchemi",
  total_actions: 25,
  last_action: ISODate("2025-01-15T17:00:00Z"),
  first_action: ISODate("2025-01-15T10:00:00Z"),
  activity_period: 7
}
```

#### 2. security_alerts
Alertes de sécurité :
```javascript
{
  alert_type: "SYS_ACCESS",
  username: "SYS",
  action: "SELECT",
  object: "DBA_USERS",
  schema: "SYS",
  severity: "HIGH",
  timestamp: ISODate("2025-01-15T13:00:00Z")
}
```

## Connexion à la base

### 1. Informations de connexion
- **URI MongoDB** : `mongodb://admin:securepassword123@localhost:27017/`
- **Base de données** : `audit_db`
- **Utilisateur application** : `audit_user` / `audit_password_123`

### 2. Interface web Mongo Express
- **URL** : http://localhost:8081
- **Identifiants** : `admin` / `admin123`

### 3. Connexion depuis Python
```python
from pymongo import MongoClient

# Connexion avec authentification
client = MongoClient("mongodb://admin:securepassword123@localhost:27017/")
db = client["audit_db"]

# Ou avec l'utilisateur application
client = MongoClient("mongodb://audit_user:audit_password_123@localhost:27017/audit_db")
```

## Extraction des données

### 1. Script Python automatique
```bash
# Exécuter le script d'extraction
python data/load_mongo.py
```

### 2. Extraction manuelle
```python
from data.load_mongo import MongoDBLoader

# Créer l'instance
loader = MongoDBLoader()

# Se connecter
if loader.connect():
    # Extraire les données
    audit_data = loader.extract_audit_data()
    user_stats = loader.extract_user_stats()
    security_alerts = loader.extract_security_alerts()
    
    # Exporter
    loader.export_to_json(audit_data, "audit_data.json")
    loader.export_to_csv(audit_data, "audit_data.csv")
```

## Requêtes utiles

### 1. Actions par utilisateur
```javascript
db.actions_audit.aggregate([
  {
    $group: {
      _id: "$OS_USERNAME",
      total_actions: { $sum: 1 },
      actions: { $push: "$ACTION_NAME" }
    }
  }
])
```

### 2. Actions récentes
```javascript
db.actions_audit.find({
  EVENT_TIMESTAMP: {
    $gte: new Date(Date.now() - 24*60*60*1000)
  }
}).sort({ EVENT_TIMESTAMP: -1 })
```

### 3. Alertes de sécurité
```javascript
db.security_alerts.find({
  severity: "HIGH"
}).sort({ timestamp: -1 })
```

### 4. Utiliser les vues
```javascript
// Statistiques utilisateur
db.user_action_stats.find()

// Résumé des actions
db.action_type_summary.find()

// Sessions avec détails
db.user_session_details.find()
```

## Gestion des conteneurs

### 1. Commandes Docker Compose
```bash
# Démarrer
docker-compose -f config/docker/mongodb-compose.yml up -d

# Arrêter
docker-compose -f config/docker/mongodb-compose.yml down

# Voir les logs
docker-compose -f config/docker/mongodb-compose.yml logs -f

# Redémarrer
docker-compose -f config/docker/mongodb-compose.yml restart

# Nettoyer (supprime les données)
docker-compose -f config/docker/mongodb-compose.yml down -v
```

### 2. Accès direct au conteneur
```bash
# Se connecter au shell MongoDB
docker exec -it mongodb-audit mongosh

# Se connecter à Mongo Express
docker exec -it mongo-express sh
```

## Sauvegarde et restauration

### 1. Sauvegarde
```bash
# Sauvegarde complète
docker exec mongodb-audit mongodump --out /data/backup

# Sauvegarde d'une collection
docker exec mongodb-audit mongodump --collection actions_audit --db audit_db --out /data/backup
```

### 2. Restauration
```bash
# Restauration complète
docker exec mongodb-audit mongorestore /data/backup

# Restauration d'une collection
docker exec mongodb-audit mongorestore --collection actions_audit --db audit_db /data/backup/audit_db/actions_audit.bson
```

## Dépannage

### 1. Problèmes de connexion
```bash
# Vérifier que MongoDB est démarré
docker ps | grep mongodb

# Vérifier les logs
docker-compose -f config/docker/mongodb-compose.yml logs mongodb

# Tester la connexion
docker exec mongodb-audit mongosh --eval "db.adminCommand('ping')"
```

### 2. Problèmes d'authentification
```bash
# Se connecter en tant qu'admin
docker exec -it mongodb-audit mongosh -u admin -p securepassword123

# Vérifier les utilisateurs
use audit_db
show users
```

### 3. Problèmes de données
```bash
# Vérifier les collections
docker exec -it mongodb-audit mongosh audit_db --eval "show collections"

# Compter les documents
docker exec -it mongodb-audit mongosh audit_db --eval "db.actions_audit.countDocuments()"
```

## Performance et optimisation

### 1. Index existants
- `EVENT_TIMESTAMP` : Pour les requêtes temporelles
- `OS_USERNAME` : Pour les requêtes par utilisateur
- `ACTION_NAME` : Pour les requêtes par type d'action
- `OBJECT_NAME` : Pour les requêtes par objet
- `OBJECT_SCHEMA` : Pour les requêtes par schéma

### 2. Ajouter des index
```javascript
// Index composé pour les requêtes fréquentes
db.actions_audit.createIndex({
  "OS_USERNAME": 1,
  "EVENT_TIMESTAMP": -1
})

// Index de texte pour la recherche
db.actions_audit.createIndex({
  "SQL_TEXT": "text"
})
```

### 3. Monitoring
```javascript
// Statistiques de la base
db.stats()

// Statistiques d'une collection
db.actions_audit.stats()

// Profil des requêtes
db.setProfilingLevel(1)
```

## Sécurité

### 1. Authentification
- Utilisateur admin : `admin` / `securepassword123`
- Utilisateur application : `audit_user` / `audit_password_123`

### 2. Réseau
- MongoDB accessible uniquement sur localhost
- Mongo Express protégé par authentification basique

### 3. Recommandations
- Changer les mots de passe par défaut en production
- Utiliser des certificats SSL/TLS
- Limiter l'accès réseau
- Surveiller les logs d'accès

## Intégration avec l'application

### 1. Configuration backend Python
```python
# Dans config.py
mongodb_uri = "mongodb://admin:securepassword123@localhost:27017/"
mongodb_db_name = "audit_db"
```

### 2. Connexion dans le code
```python
from database import db_manager

# Connexion automatique au démarrage
await db_manager.connect_mongodb()

# Utilisation
collection = db_manager.get_mongodb_collection("actions_audit")
```

### 3. Endpoints API
- `/api/audit/search` : Recherche dans les logs
- `/api/audit/user-activity` : Activité utilisateur
- `/api/audit/anomalies` : Détection d'anomalies

## Conclusion

Cette configuration MongoDB offre une base solide pour l'audit et l'analyse des données Oracle. Les vues d'analyse facilitent les requêtes complexes et l'interface Mongo Express permet une gestion visuelle de la base de données.

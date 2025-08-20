# Configuration MongoDB - Résolution du problème de récupération des données

## Problème identifié

Le système ne récupère pas toutes les données depuis MongoDB. Voici les problèmes corrigés :

### 1. Incohérences dans les noms de base de données et collections
- **Avant** : `auditdb` vs `audit_db`
- **Avant** : `audit_data` vs `actions_audit`
- **Après** : Uniformisation sur `audit_db` et `audit_data`

### 2. Problème de limite dans les requêtes
- **Avant** : `.limit(0)` (peut causer des problèmes)
- **Après** : Suppression de la limite pour récupérer toutes les données

### 3. MongoDB non installé/démarré
- Ajout de scripts pour démarrer MongoDB avec Docker

## Solutions proposées

### Option 1 : Utiliser Docker (Recommandé)

#### 1. Démarrer MongoDB avec Docker
```powershell
# Utiliser le script PowerShell
.\start_mongodb.ps1

# Ou utiliser docker-compose
docker-compose -f mongodb-compose.yml up -d
```

#### 2. Vérifier la connexion
```bash
cd SIO
node test_mongodb_connection.js
```

#### 3. Configurer les données de test
```bash
cd SIO/backend
node setup_mongodb.js
```

### Option 2 : Installer MongoDB localement

#### 1. Télécharger et installer MongoDB Community Server
- Aller sur https://www.mongodb.com/try/download/community
- Télécharger la version Windows
- Installer avec les paramètres par défaut

#### 2. Démarrer le service MongoDB
```powershell
# Démarrer le service MongoDB
net start MongoDB

# Ou démarrer manuellement
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
```

#### 3. Configurer les données
```bash
cd SIO/backend
node setup_mongodb.js
```

## Vérification de la correction

### 1. Tester la connexion
```bash
cd SIO
node test_mongodb_connection.js
```

### 2. Tester l'API
```bash
# Démarrer le serveur backend
cd SIO/backend
npm start

# Dans un autre terminal, tester l'API
curl http://localhost:4000/api/mongodb/diagnostic
curl http://localhost:4000/api/audit/raw
```

### 3. Vérifier les logs
Les logs sont disponibles dans le dossier `SIO/logs/` :
- `backend.log` : Logs du serveur backend
- `mongodb.log` : Logs spécifiques à MongoDB

## Endpoints de diagnostic ajoutés

### `/api/mongodb/diagnostic`
Retourne des informations détaillées sur :
- État de la connexion MongoDB
- Collections disponibles
- Nombre de documents dans `audit_data`
- Échantillon de données

### `/api/health`
Vérification rapide de l'état du serveur et de MongoDB

## Structure des données

Les données d'audit sont stockées dans la collection `audit_data` avec la structure suivante :

```javascript
{
  OS_USERNAME: 'datchemi',
  DBUSERNAME: 'datchemi',
  ACTION_NAME: 'SELECT',
  OBJECT_NAME: 'SEQ$',
  EVENT_TIMESTAMP: '2025-01-15T10:00:00Z',
  CLIENT_PROGRAM_NAME: 'SQL Developer',
  TERMINAL: 'unknown',
  AUTHENTICATION_TYPE: 'DATABASE',
  OBJECT_SCHEMA: 'SYS',
  USERHOST: '192.168.60.42'
}
```

## Dépannage

### MongoDB ne démarre pas
1. Vérifier que Docker est installé et démarré
2. Vérifier que le port 27017 n'est pas utilisé
3. Utiliser `docker logs mongodb-audit` pour voir les erreurs

### Aucune donnée récupérée
1. Vérifier que MongoDB est connecté : `GET /api/mongodb/diagnostic`
2. Vérifier que la collection `audit_data` existe
3. Exécuter `node setup_mongodb.js` pour insérer des données de test

### Erreurs de connexion
1. Vérifier l'URI de connexion dans `index.js`
2. Vérifier que MongoDB est accessible sur `localhost:27017`
3. Vérifier les logs dans `logs/mongodb.log`

## Commandes utiles

```bash
# Démarrer MongoDB avec Docker
docker run -d -p 27017:27017 --name mongodb-audit mongo:latest

# Vérifier le statut du conteneur
docker ps

# Voir les logs du conteneur
docker logs mongodb-audit

# Arrêter MongoDB
docker stop mongodb-audit

# Supprimer le conteneur
docker rm mongodb-audit

# Se connecter à MongoDB
docker exec -it mongodb-audit mongosh audit_db
``` 
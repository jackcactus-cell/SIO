# 🐳 SIO Audit App - Guide Docker Complet

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Démarrage rapide](#démarrage-rapide)
- [Configuration](#configuration)
- [Architecture des services](#architecture-des-services)
- [Commandes utiles](#commandes-utiles)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## 🎯 Vue d'ensemble

L'application SIO Audit est complètement dockerisée avec une architecture microservices comprenant :

- **Frontend React/Vite** - Interface utilisateur moderne
- **Backend Node.js** - API principale et logique métier
- **Backend Python** - Connexion Oracle et traitement de données
- **Service LLM** - Analyse intelligente et traitement NLP
- **MongoDB** - Base de données principale

## ✅ Prérequis

### Logiciels requis
- Docker 20.10+ 
- Docker Compose 2.0+
- Git (pour cloner le projet)

### Ressources système recommandées
- **RAM** : 8 GB minimum, 16 GB recommandé
- **CPU** : 4 cores minimum
- **Disque** : 20 GB d'espace libre
- **Réseau** : Connexion internet pour le téléchargement des images

### Vérification des prérequis
```bash
# Vérifier Docker
docker --version
docker info

# Vérifier Docker Compose
docker-compose --version
```

## 🚀 Démarrage rapide

### Option 1 : Script automatique (recommandé)

**Sur Linux/macOS :**
```bash
chmod +x quick-start.sh
./quick-start.sh
```

**Sur Windows (PowerShell) :**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\quick-start.ps1
```

### Option 2 : Démarrage manuel

1. **Cloner et configurer**
```bash
git clone <your-repo>
cd SIO
cp env.example .env
cp backend_python/env.example backend_python/.env
```

2. **Mode Production**
```bash
docker-compose build
docker-compose up -d
```

3. **Mode Développement**
```bash
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d
```

## ⚙️ Configuration

### Fichiers d'environnement

#### `.env` (Principal)
```bash
# Configuration générale
COMPOSE_PROJECT_NAME=sio-audit-app
ENVIRONMENT=production

# Oracle Database
ORACLE_HOST=oracle-db
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XE
ORACLE_USERNAME=audit_user
ORACLE_PASSWORD=your_secure_password

# MongoDB
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=securepassword123
MONGODB_DATABASE=audit_146

# Ports
FRONTEND_PORT=80
BACKEND_NODE_PORT=4000
BACKEND_PYTHON_PORT=8000
BACKEND_LLM_PORT=8001
```

#### `backend_python/.env` (Backend Python)
```bash
# Oracle connexion
ORACLE_HOST=oracle-db
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XE
ORACLE_USERNAME=audit_user
ORACLE_PASSWORD=your_secure_password

# MongoDB
MONGODB_URI=mongodb://admin:securepassword123@mongodb:27017/audit_146?authSource=admin

# FastAPI
APP_NAME="SIO Audit Backend Python"
DEBUG=false
LOG_LEVEL=INFO
```

### Variables d'environnement importantes

| Variable | Description | Défaut |
|----------|-------------|--------|
| `ORACLE_HOST` | Serveur Oracle | `oracle-db` |
| `ORACLE_USERNAME` | Utilisateur Oracle | `audit_user` |
| `MONGODB_URI` | URI MongoDB | `mongodb://mongodb:27017` |
| `LOG_LEVEL` | Niveau de logs | `INFO` |
| `NODE_ENV` | Environnement Node.js | `production` |

## 🏗️ Architecture des services

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Backend Node   │    │ Backend Python  │
│  React/Vite     │◄──►│  Express.js     │◄──►│   FastAPI       │
│  Port: 80/5173  │    │  Port: 4000     │    │  Port: 8000     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Service LLM   │    │    MongoDB      │    │   Oracle DB     │
│   Python/AI     │    │   Database      │    │  (Externe)      │
│  Port: 8001     │    │  Port: 27017    │    │  Port: 1521     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Services détaillés

#### Frontend (React/Vite + Nginx)
- **Image** : Multi-stage build (Node.js → Nginx)
- **Ports** : 80 (prod), 5173 (dev)
- **Volumes** : Assets statiques
- **Health check** : HTTP GET /health

#### Backend Node.js (Express)
- **Image** : Node.js 18 Alpine
- **Ports** : 4000
- **Volumes** : Logs, données SQLite
- **Health check** : HTTP GET /api/health
- **Hot reload** : Nodemon en développement

#### Backend Python (FastAPI)
- **Image** : Python 3.11 Slim
- **Ports** : 8000
- **Volumes** : Logs, cache
- **Health check** : HTTP GET /health
- **Features** : Connexion Oracle, API REST

#### Service LLM (Python)
- **Image** : Python 3.11 Slim
- **Ports** : 8001
- **Volumes** : ChromaDB, uploads, logs
- **Features** : NLP, analyse intelligente

#### MongoDB
- **Image** : MongoDB 7 Jammy
- **Ports** : 27017
- **Volumes** : Données persistantes
- **Health check** : mongosh ping
- **Auth** : Username/password configurables

## 🔧 Commandes utiles

### Gestion avec scripts personnalisés

```bash
# Linux/macOS
./docker-manager.sh start prod        # Démarrer en production
./docker-manager.sh start dev         # Démarrer en développement
./docker-manager.sh logs prod backend # Voir les logs du backend
./docker-manager.sh status dev        # Statut des services
./docker-manager.sh backup            # Sauvegarder MongoDB
./docker-manager.sh cleanup prod      # Nettoyer les ressources

# Windows PowerShell
.\docker-manager.ps1 start prod
.\docker-manager.ps1 logs dev frontend
.\docker-manager.ps1 monitor
```

### Commandes Docker Compose directes

```bash
# Construction
docker-compose build
docker-compose -f docker-compose.dev.yml build

# Démarrage
docker-compose up -d
docker-compose -f docker-compose.dev.yml up -d

# Arrêt
docker-compose down
docker-compose down -v  # Avec suppression des volumes

# Logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs --tail=100 frontend

# Statut
docker-compose ps
docker-compose top

# Mise à jour
docker-compose pull
docker-compose up -d --force-recreate
```

### Commandes de maintenance

```bash
# Reconstruction complète
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Nettoyage Docker
docker system prune -a
docker volume prune
docker network prune

# Surveillance des ressources
docker stats
docker system df
```

## 🌐 URLs d'accès

### Mode Production
- **Frontend** : http://localhost:80
- **API Node.js** : http://localhost:4000
- **API Python** : http://localhost:8000
- **Service LLM** : http://localhost:8001
- **MongoDB** : localhost:27017

### Mode Développement
- **Frontend** : http://localhost:5173
- **API Node.js** : http://localhost:4000
- **API Python** : http://localhost:8000
- **Service LLM** : http://localhost:8001
- **MongoDB** : localhost:27017
- **Adminer** : http://localhost:8080

## 🛠️ Troubleshooting

### Problèmes courants

#### Services ne démarrent pas
```bash
# Vérifier les logs
docker-compose logs

# Vérifier l'état des conteneurs
docker-compose ps

# Redémarrer un service spécifique
docker-compose restart backend
```

#### Problèmes de connexion MongoDB
```bash
# Vérifier MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Recréer MongoDB
docker-compose stop mongodb
docker volume rm sio_mongodb_data
docker-compose up -d mongodb
```

#### Problèmes de build
```bash
# Build sans cache
docker-compose build --no-cache

# Supprimer les images et rebuilder
docker-compose down --rmi all
docker-compose build
```

#### Erreurs de permissions
```bash
# Sur Linux, ajuster les permissions
sudo chown -R $USER:$USER .
chmod +x *.sh
```

#### Port déjà utilisé
```bash
# Identifier le processus utilisant le port
netstat -tulpn | grep :4000
lsof -i :4000

# Modifier les ports dans .env ou docker-compose.yml
```

### Logs et debugging

```bash
# Logs détaillés
docker-compose logs -f --timestamps

# Accéder à un conteneur
docker-compose exec backend bash
docker-compose exec mongodb mongosh

# Inspecter les réseaux
docker network ls
docker network inspect sio_network

# Inspecter les volumes
docker volume ls
docker volume inspect sio_mongodb_data
```

## 🔄 Maintenance

### Sauvegardes automatiques

```bash
# Script de sauvegarde MongoDB
#!/bin/bash
BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
docker exec sio_mongodb_prod mongodump --out /tmp/backup
docker cp sio_mongodb_prod:/tmp/backup $BACKUP_DIR/
```

### Mise à jour de l'application

```bash
# Avec le script manager
./docker-manager.sh update prod

# Manuel
git pull
docker-compose build
docker-compose up -d --force-recreate
```

### Monitoring

```bash
# Surveillance continue
./docker-manager.sh monitor

# Métriques Docker
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Espace disque
docker system df
docker volume ls
```

### Rotation des logs

```bash
# Configuration logrotate pour les logs Docker
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
```

## 📚 Ressources supplémentaires

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)

## 🆘 Support

En cas de problème :

1. Consultez les logs : `docker-compose logs -f`
2. Vérifiez la configuration : `.env` et `docker-compose.yml`
3. Redémarrez les services : `docker-compose restart`
4. Nettoyage complet : `./docker-manager.sh cleanup`

---

**Version** : 1.0.0  
**Dernière mise à jour** : $(date)
**Maintenu par** : Équipe SIO Audit



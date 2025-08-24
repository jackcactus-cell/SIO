# Scripts de Dockerisation SIO - Linux

## Vue d'ensemble

Ce dossier contient tous les scripts nécessaires pour dockeriser et déployer l'application SIO sur Linux de manière automatisée et robuste.

## Architecture du projet

```
SIO/
├── backend_python/          # Backend FastAPI (Oracle + MongoDB)
├── backend/                 # Backend Node.js + LLM
├── project/                 # Frontend React/Vite
├── config/docker/          # Configurations Docker
├── data/                   # Données et backups
└── scripts/                # Scripts de déploiement
```

## Structure des scripts

```
scripts/
├── README.md                 # Ce guide
├── install.sh               # Installation des prérequis
├── build.sh                 # Construction des images Docker
├── deploy.sh                # Déploiement complet
├── start.sh                 # Démarrage des services
├── stop.sh                  # Arrêt des services
├── restart.sh               # Redémarrage des services
├── logs.sh                  # Affichage des logs
├── backup.sh                # Sauvegarde des données
├── restore.sh               # Restauration des données
├── cleanup.sh               # Nettoyage du système
├── health-check.sh          # Vérification de santé
├── update.sh                # Mise à jour du système
├── monitor.sh               # Monitoring en temps réel
└── utils/                   # Utilitaires
    ├── docker-utils.sh      # Fonctions Docker
    ├── backup-utils.sh      # Fonctions de sauvegarde
    ├── health-utils.sh      # Fonctions de santé
    └── config-utils.sh      # Fonctions de configuration
```

## Prérequis

- Linux (Ubuntu 20.04+ / CentOS 8+ / Debian 11+)
- Docker 20.10+
- Docker Compose 2.0+
- Git
- curl, wget, jq
- Au moins 4GB RAM
- Au moins 20GB espace disque

## Installation rapide

```bash
# 1. Cloner le projet
git clone <repository-url>
cd SIO

# 2. Installation des prérequis
chmod +x scripts/install.sh
./scripts/install.sh

# 3. Configuration
cp backend_python/env.example backend_python/.env
# Éditer backend_python/.env avec vos paramètres

# 4. Déploiement
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## Utilisation des scripts

### Installation et configuration

```bash
# Installation des prérequis
./scripts/install.sh

# Construction des images
./scripts/build.sh

# Configuration de l'environnement
./scripts/configure.sh
```

### Gestion des services

```bash
# Démarrage complet
./scripts/deploy.sh

# Démarrage rapide
./scripts/start.sh

# Arrêt des services
./scripts/stop.sh

# Redémarrage
./scripts/restart.sh
```

### Monitoring et maintenance

```bash
# Vérification de santé
./scripts/health-check.sh

# Affichage des logs
./scripts/logs.sh

# Monitoring en temps réel
./scripts/monitor.sh

# Sauvegarde
./scripts/backup.sh

# Restauration
./scripts/restore.sh
```

### Maintenance

```bash
# Mise à jour
./scripts/update.sh

# Nettoyage
./scripts/cleanup.sh
```

## Services déployés

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 80 | Interface utilisateur React |
| Backend Python | 8000 | API FastAPI (Oracle + MongoDB) |
| Backend Node.js | 4000 | API Node.js |
| Backend LLM | 8001 | Service d'analyse intelligente |
| MongoDB | 27017 | Base de données |
| Mongo Express | 8081 | Interface web MongoDB |

## Variables d'environnement

### Backend Python (.env)
```bash
# Oracle Database
ORACLE_HOST=your-oracle-host
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XE
ORACLE_USERNAME=audit_user
ORACLE_PASSWORD=your-password

# MongoDB
MONGODB_URI=mongodb://admin:securepassword123@mongodb:27017/
MONGODB_DB_NAME=audit_db

# Application
DEBUG=false
LOG_LEVEL=INFO
SECRET_KEY=your-secret-key
```

## Sécurité

- Tous les mots de passe sont stockés dans des variables d'environnement
- Les volumes Docker sont isolés
- Les ports sensibles ne sont exposés qu'en interne
- Health checks configurés pour tous les services

## Troubleshooting

### Problèmes courants

1. **Ports déjà utilisés**
   ```bash
   ./scripts/stop.sh
   # Vérifier les ports avec: netstat -tulpn | grep :80
   ```

2. **Espace disque insuffisant**
   ```bash
   ./scripts/cleanup.sh
   # Ou libérer de l'espace manuellement
   ```

3. **Services qui ne démarrent pas**
   ```bash
   ./scripts/health-check.sh
   ./scripts/logs.sh
   ```

### Logs et debugging

```bash
# Logs de tous les services
./scripts/logs.sh

# Logs d'un service spécifique
docker-compose -f config/docker/docker-compose.yml logs frontend

# Debug d'un conteneur
docker exec -it sio_frontend_prod /bin/bash
```

## Support

En cas de problème :
1. Vérifiez les logs : `./scripts/logs.sh`
2. Vérifiez la santé : `./scripts/health-check.sh`
3. Consultez la documentation dans `docs/`
4. Vérifiez les variables d'environnement

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

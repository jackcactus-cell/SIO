# 🚀 Scripts Docker SIO Audit App

Ce dossier contient tous les scripts nécessaires pour gérer l'application SIO Audit avec Docker de manière simple et efficace.

## 📋 Vue d'ensemble

### 🎯 Script principal
- **`sio-docker.sh`** - Point d'entrée unique pour toutes les opérations

### 📱 Scripts spécialisés
- **`start.sh`** - Démarrage de l'application
- **`stop.sh`** - Arrêt de l'application  
- **`restart.sh`** - Redémarrage de l'application
- **`logs.sh`** - Visualisation des logs
- **`status.sh`** - État et monitoring des services
- **`backup.sh`** - Sauvegarde des données
- **`cleanup.sh`** - Nettoyage des ressources

## 🚀 Démarrage rapide

### Option 1 : Script principal (recommandé)
```bash
# Rendre le script exécutable
chmod +x scripts/sio-docker.sh

# Démarrer en production
./scripts/sio-docker.sh start

# Démarrer en développement
./scripts/sio-docker.sh start dev

# Voir l'aide complète
./scripts/sio-docker.sh help
```

### Option 2 : Scripts individuels
```bash
# Rendre tous les scripts exécutables
chmod +x scripts/*.sh

# Démarrer
./scripts/start.sh

# Voir les logs
./scripts/logs.sh

# Arrêter
./scripts/stop.sh
```

## 📖 Guide détaillé des scripts

### 🎯 sio-docker.sh - Script principal

Le script principal centralise toutes les opérations Docker avec une interface uniforme.

#### Commandes disponibles

**Gestion des services :**
```bash
./scripts/sio-docker.sh start [env]           # Démarrer
./scripts/sio-docker.sh stop [env]            # Arrêter  
./scripts/sio-docker.sh restart [env]         # Redémarrer
./scripts/sio-docker.sh status [env]          # État des services
```

**Logs et surveillance :**
```bash
./scripts/sio-docker.sh logs [env] [service]  # Voir les logs
./scripts/sio-docker.sh monitor [env]         # Surveillance continue
./scripts/sio-docker.sh health [env]          # Vérification de santé
```

**Maintenance :**
```bash
./scripts/sio-docker.sh backup [env]          # Sauvegarde
./scripts/sio-docker.sh cleanup [env]         # Nettoyage
./scripts/sio-docker.sh update [env]          # Mise à jour
```

**Développement :**
```bash
./scripts/sio-docker.sh build [env]           # Construire
./scripts/sio-docker.sh rebuild [env]         # Reconstruire
./scripts/sio-docker.sh shell <service>       # Accès shell
./scripts/sio-docker.sh exec <service> <cmd>  # Exécuter commande
```

### 🚀 start.sh - Démarrage

Démarre l'application avec vérifications automatiques et configuration.

```bash
# Démarrage simple
./scripts/start.sh

# Démarrage en développement
./scripts/start.sh dev

# Aide
./scripts/start.sh --help
```

**Fonctionnalités :**
- ✅ Vérification des prérequis Docker
- ⚙️ Configuration automatique des fichiers d'environnement
- 🔨 Construction des images si nécessaire
- 🏥 Tests de santé des services
- 📊 Affichage des URLs d'accès
- 🌐 Option d'ouverture automatique dans le navigateur

### 🛑 stop.sh - Arrêt

Arrête l'application de manière propre et sécurisée.

```bash
# Arrêt simple
./scripts/stop.sh

# Arrêt avec suppression des volumes (ATTENTION)
./scripts/stop.sh --volumes

# Arrêt forcé sans confirmation
./scripts/stop.sh --force

# Aide
./scripts/stop.sh --help
```

**Fonctionnalités :**
- 🛡️ Arrêt ordonné des services
- 💾 Sauvegarde automatique avant suppression des volumes
- 🔍 Vérification finale de l'arrêt
- 🧹 Nettoyage des ressources orphelines

### 🔄 restart.sh - Redémarrage

Redémarre l'application avec options avancées.

```bash
# Redémarrage simple
./scripts/restart.sh

# Redémarrage d'un service spécifique
./scripts/restart.sh prod backend

# Redémarrage avec reconstruction
./scripts/restart.sh dev --rebuild

# Redémarrage avec recréation forcée
./scripts/restart.sh --force

# Aide
./scripts/restart.sh --help
```

**Fonctionnalités :**
- 🔄 Redémarrage intelligent (service spécifique ou tous)
- 🔨 Option de reconstruction des images
- 💾 Sauvegarde préventive en production
- 🏥 Vérification de santé post-redémarrage

### 📜 logs.sh - Visualisation des logs

Affiche et suit les logs avec options avancées.

```bash
# Tous les logs
./scripts/logs.sh

# Logs d'un service spécifique
./scripts/logs.sh prod backend

# Suivi en temps réel
./scripts/logs.sh dev --follow

# Logs avec timestamps
./scripts/logs.sh --timestamps

# Dernières lignes
./scripts/logs.sh --lines 100

# Aide
./scripts/logs.sh --help
```

**Fonctionnalités :**
- 🎨 Colorisation automatique par niveau de log
- ⏰ Support des timestamps
- 🔍 Filtrage par service
- 📊 Informations sur l'état des conteneurs

### 📊 status.sh - État et monitoring

Affiche l'état détaillé des services et ressources.

```bash
# État simple
./scripts/status.sh

# État détaillé avec métriques
./scripts/status.sh --detailed

# Surveillance continue
./scripts/status.sh --watch

# Aide
./scripts/status.sh --help
```

**Fonctionnalités :**
- 📋 État de tous les services
- 🌐 URLs d'accès avec tests de santé
- 📈 Métriques de ressources (CPU, mémoire)
- 💾 Utilisation de l'espace disque Docker
- 🔄 Mode surveillance continue

### 💾 backup.sh - Sauvegarde

Sauvegarde complète ou partielle des données.

```bash
# Sauvegarde complète
./scripts/backup.sh

# Sauvegarde MongoDB uniquement
./scripts/backup.sh --mongodb-only

# Sauvegarde sans compression
./scripts/backup.sh --no-compression

# Sauvegarde avec upload S3
./scripts/backup.sh --upload-s3

# Aide
./scripts/backup.sh --help
```

**Types de sauvegarde :**
- **`--full`** - Complète (MongoDB + volumes + logs + config)
- **`--mongodb-only`** - Base de données uniquement
- **`--volumes-only`** - Volumes Docker uniquement
- **`--logs-only`** - Logs uniquement

**Fonctionnalités :**
- 📦 Compression automatique
- ☁️ Upload S3 optionnel
- 🔄 Rotation automatique des sauvegardes
- 📊 Informations détaillées sur les sauvegardes

### 🧹 cleanup.sh - Nettoyage

Nettoie les ressources Docker inutilisées.

```bash
# Nettoyage de base
./scripts/cleanup.sh

# Nettoyage approfondi
./scripts/cleanup.sh --deep

# Nettoyage complet (ATTENTION)
./scripts/cleanup.sh --full

# Nettoyage des logs uniquement
./scripts/cleanup.sh --logs-only

# Aide
./scripts/cleanup.sh --help
```

**Niveaux de nettoyage :**
- **`--basic`** - Images inutilisées, conteneurs arrêtés
- **`--deep`** - + réseaux, volumes anonymes, cache build
- **`--full`** - + volumes de données, sauvegardes anciennes ⚠️
- **`--logs-only`** - Logs uniquement
- **`--docker-only`** - Nettoyage Docker complet

## 🎨 Environnements

### Production (défaut)
- Fichier : `docker-compose.yml`
- Port frontend : 80
- Optimisé pour la performance et la sécurité

### Développement
- Fichier : `docker-compose.dev.yml` 
- Port frontend : 5173
- Hot reload activé
- Outils de développement (Adminer sur port 8080)

## 🔧 Services disponibles

| Service | Description | Port | Environnement |
|---------|-------------|------|---------------|
| `frontend` | Interface React/Vite | 80/5173 | Tous |
| `backend` | API Node.js/Express | 4000 | Tous |
| `backend_python` | API Python/FastAPI | 8000 | Tous |
| `backend_llm` | Service LLM/IA | 8001 | Tous |
| `mongodb` | Base de données | 27017 | Tous |
| `adminer` | Interface DB | 8080 | Dev uniquement |

## 📋 Exemples d'utilisation

### Workflow de développement
```bash
# 1. Démarrer en mode développement
./scripts/sio-docker.sh start dev

# 2. Voir les logs du backend
./scripts/sio-docker.sh logs dev backend --follow

# 3. Accéder au shell MongoDB
./scripts/sio-docker.sh shell mongodb

# 4. Redémarrer après modifications
./scripts/sio-docker.sh restart dev backend

# 5. Nettoyer à la fin
./scripts/sio-docker.sh cleanup dev
```

### Workflow de production
```bash
# 1. Démarrer en production
./scripts/sio-docker.sh start

# 2. Vérifier l'état
./scripts/sio-docker.sh status --detailed

# 3. Sauvegarder les données
./scripts/sio-docker.sh backup

# 4. Surveiller les performances
./scripts/sio-docker.sh monitor

# 5. Mise à jour
./scripts/sio-docker.sh update
```

### Maintenance et troubleshooting
```bash
# Vérifier la santé des services
./scripts/sio-docker.sh health

# Voir les logs d'erreur
./scripts/sio-docker.sh logs | grep -i error

# Redémarrer avec reconstruction
./scripts/sio-docker.sh restart --rebuild

# Nettoyage en cas de problème
./scripts/sio-docker.sh cleanup --deep

# Informations système
./scripts/sio-docker.sh info
```

## 🔒 Permissions et sécurité

### Rendre les scripts exécutables
```bash
# Tous les scripts
chmod +x scripts/*.sh

# Script principal uniquement
chmod +x scripts/sio-docker.sh
```

### Utilisateur non-root
Les scripts sont conçus pour fonctionner avec un utilisateur non-root membre du groupe `docker`.

```bash
# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer la session ou
newgrp docker
```

## 🐛 Troubleshooting

### Problèmes courants

**Scripts non exécutables :**
```bash
chmod +x scripts/*.sh
```

**Erreur de permissions Docker :**
```bash
sudo usermod -aG docker $USER
# Puis redémarrer la session
```

**Ports déjà utilisés :**
```bash
# Identifier le processus
netstat -tulpn | grep :4000

# Modifier les ports dans .env
```

**Services qui ne démarrent pas :**
```bash
# Vérifier les logs
./scripts/logs.sh

# Reconstruire les images
./scripts/sio-docker.sh rebuild

# Nettoyer et redémarrer
./scripts/cleanup.sh --deep
./scripts/start.sh
```

### Logs de débogage

Les scripts génèrent des logs détaillés :
- Logs d'application : `logs/`
- Logs de sauvegarde : `backup/backup.log`
- Logs de nettoyage : `cleanup.log`

## 📚 Ressources supplémentaires

- **Documentation complète :** `DOCKER_README.md`
- **Guide de déploiement :** `DEPLOYMENT_GUIDE.md`
- **Configuration :** Fichiers `.env.example`

## 🆘 Support

En cas de problème :
1. Vérifiez les logs : `./scripts/logs.sh`
2. Consultez l'état : `./scripts/status.sh --detailed`
3. Testez la santé : `./scripts/sio-docker.sh health`
4. Nettoyez si nécessaire : `./scripts/cleanup.sh`

---

**Version :** 1.0.0  
**Maintenu par :** Équipe SIO Audit



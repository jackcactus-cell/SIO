# 📁 Scripts SIO - Gestion Docker Complète

Ce dossier contient tous les scripts nécessaires pour gérer votre application SIO de manière complète et automatisée.

## 🚀 Scripts Principaux

### **Dockerisation Complète**
```bash
./scripts/docker-complete.sh
```
**Script principal** pour dockeriser complètement votre projet SIO :
- ✅ Vérification des prérequis
- ✅ Configuration automatique de l'environnement
- ✅ Construction des images Docker
- ✅ Démarrage des services
- ✅ Vérification et tests
- ✅ Extraction des données Oracle

### **Gestion des Services**

#### Démarrage
```bash
./scripts/start.sh [options]
```
**Options :**
- `--build, -b` : Reconstruire les images avant démarrage
- `--force, -f` : Forcer le redémarrage

#### Arrêt
```bash
./scripts/stop.sh [options]
```
**Options :**
- `--force, -f` : Forcer l'arrêt
- `--volumes, -v` : Supprimer aussi les volumes
- `--images, -i` : Supprimer aussi les images
- `--all, -a` : Arrêt complet (volumes + images)

#### Redémarrage
```bash
./scripts/restart.sh [options]
```
**Options :**
- `--build, -b` : Reconstruire les images
- `--force, -f` : Forcer le redémarrage

### **Monitoring et Maintenance**

#### État des Services
```bash
./scripts/status.sh
```
Affiche :
- 📊 État des conteneurs
- 🌐 Test de connectivité des services
- 💾 Utilisation des ressources
- 📋 Logs récentes

#### Logs
```bash
./scripts/logs.sh [service] [options]
```
**Services :** `all`, `frontend`, `backend-node`, `backend-python`, `backend-llm`, `mongodb`
**Options :**
- `--follow, -f` : Suivre les logs en temps réel
- `--tail N, -t N` : Afficher les N dernières lignes
- `--since TIME` : Logs depuis TIME

#### Sauvegarde
```bash
./scripts/backup.sh [options]
```
**Options :**
- `--full, -f` : Sauvegarde complète (MongoDB + volumes)
- `--mongodb, -m` : MongoDB uniquement
- `--volumes, -v` : Volumes uniquement
- `--compress, -c` : Compresser la sauvegarde

#### Nettoyage
```bash
./scripts/cleanup.sh [options]
```
**Options :**
- `--containers, -c` : Supprimer les conteneurs arrêtés
- `--images, -i` : Supprimer les images non utilisées
- `--volumes, -v` : Supprimer les volumes non utilisés
- `--networks, -n` : Supprimer les réseaux non utilisés
- `--all, -a` : Nettoyage complet
- `--force, -f` : Forcer sans confirmation

## 🐳 Scripts Docker Spécialisés

### **Configuration Interactive**
```bash
./scripts/docker/env-config.sh
```
Configuration interactive de tous les paramètres :
- 🔐 Oracle Database
- 🗄️ MongoDB
- 🔒 Sécurité
- 🤖 OpenAI
- 🌐 Ports

### **Déploiement Rapide**
```bash
./scripts/docker/quick-deploy.sh
```
Déploiement automatique complet en une commande.

### **Démonstration Interactive**
```bash
./scripts/docker/demo-docker-tools.sh
```
Guide interactif pour tester tous les outils Docker.

## 📊 Architecture des Services

| Service | Port | Description | Image |
|---------|------|-------------|-------|
| Frontend | 80 | Interface React | sio-frontend:latest |
| Backend Node.js | 4000 | API Node.js | sio-backend-node:latest |
| Backend Python | 8000 | API FastAPI + Oracle | sio-backend-python:latest |
| Backend LLM | 8001 | Service IA | sio-backend-llm:latest |
| MongoDB | 27017 | Base de données | mongo:7-jammy |

## 🚀 Workflows Recommandés

### **Première Installation**
```bash
# 1. Dockerisation complète
./scripts/docker-complete.sh

# 2. Vérification
./scripts/status.sh

# 3. Logs en temps réel
./scripts/logs.sh --follow
```

### **Développement Quotidien**
```bash
# Démarrage
./scripts/start.sh

# Vérification
./scripts/status.sh

# Logs
./scripts/logs.sh

# Arrêt
./scripts/stop.sh
```

### **Maintenance**
```bash
# Sauvegarde
./scripts/backup.sh --full --compress

# Redémarrage avec reconstruction
./scripts/restart.sh --build

# Nettoyage
./scripts/cleanup.sh --containers --images
```

### **Production**
```bash
# Configuration interactive
./scripts/docker/env-config.sh

# Démarrage
./scripts/start.sh

# Validation
./scripts/status.sh

# Sauvegarde automatique
./scripts/backup.sh --full --compress
```

## 🔧 Scripts Windows (PowerShell)

Pour les utilisateurs Windows, utilisez les scripts PowerShell dans `scripts/startup/` :

```powershell
# Démarrage complet
.\scripts\startup\start_project.ps1

# Gestion Docker
.\scripts\startup\docker-manager.ps1

# Démarrage rapide
.\scripts\startup\quick-start.ps1
```

## 📋 Prérequis

### **Système**
- Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+)
- Windows 10+ avec WSL2 ou Docker Desktop
- macOS 10.15+ avec Docker Desktop

### **Logiciels**
- Docker 20.10+
- Docker Compose 2.0+
- Git

### **Ressources**
- RAM : 4GB minimum (8GB recommandé)
- Stockage : 20GB minimum
- CPU : 2 cœurs minimum

## 🔍 Dépannage

### **Problèmes Courants**

#### Services ne démarrent pas
```bash
# Vérifier l'état
./scripts/status.sh

# Voir les logs
./scripts/logs.sh

# Redémarrer
./scripts/restart.sh --force
```

#### Ports déjà utilisés
```bash
# Vérifier les ports
sudo netstat -tulpn | grep -E ":(80|4000|8000|8001|27017)"

# Arrêter les services conflictuels
sudo systemctl stop apache2 nginx  # si nécessaire
```

#### Connexion Oracle échoue
```bash
# Vérifier la configuration
cat .env | grep ORACLE

# Tester la connexion
./scripts/docker/12-validate.sh
```

### **Logs de Diagnostic**
```bash
# Logs de tous les services
./scripts/logs.sh all

# Logs d'un service spécifique
./scripts/logs.sh backend-python --tail 100

# Logs en temps réel
./scripts/logs.sh --follow
```

## 📞 Support

### **Commandes de Diagnostic**
```bash
# État général
./scripts/status.sh

# Logs détaillées
./scripts/logs.sh all --tail 50

# Validation complète
./scripts/docker/12-validate.sh

# Sauvegarde d'urgence
./scripts/backup.sh --full --compress
```

### **Informations Système**
```bash
# Version Docker
docker --version
docker-compose --version

# Espace disque
df -h

# Mémoire
free -h

# Ports utilisés
netstat -tulpn | grep -E ":(80|4000|8000|8001|27017)"
```

## 📚 Documentation Complète

- [Guide de Dockerisation](GUIDE_DOCKERISATION_COMPLETE.md)
- [Guide de Déploiement](scripts/docker/DEPLOYMENT_GUIDE.md)
- [README Docker](scripts/docker/README.md)

## 🎯 Objectifs

✅ **Simplicité** : Scripts clairs et faciles à utiliser
✅ **Robustesse** : Gestion d'erreurs et validation
✅ **Flexibilité** : Options multiples pour différents cas d'usage
✅ **Sécurité** : Confirmations pour les actions destructives
✅ **Monitoring** : Outils de surveillance intégrés

---

**🎉 Votre projet SIO est maintenant prêt pour une gestion Docker complète et automatisée !**



# 🐳 Guide Complet - Dockerisation SIO

## 📋 Vue d'ensemble

Ce guide vous explique comment utiliser tous les outils de dockerisation disponibles dans le dossier `scripts/` pour déployer votre projet SIO de manière complète et automatisée.

## 🚀 Options de Déploiement

### **Option 1: Déploiement Rapide (Recommandé pour débutants)**

```bash
# Rendre les scripts exécutables
chmod +x scripts/docker/*.sh

# Déploiement automatique complet
./scripts/docker/quick-deploy.sh
```

**Avantages :**
- ✅ Configuration automatique
- ✅ Installation Docker si nécessaire
- ✅ Génération automatique des clés
- ✅ Démarrage complet en une commande

### **Option 2: Déploiement Interactif (Recommandé pour production)**

```bash
# Configuration interactive
./scripts/docker/env-config.sh

# Construction des images
./scripts/docker/02-build-images.sh

# Démarrage des services
./scripts/docker/03-start-services.sh

# Validation
./scripts/docker/12-validate.sh
```

**Avantages :**
- ✅ Configuration personnalisée
- ✅ Validation des paramètres
- ✅ Contrôle total du processus

### **Option 3: Déploiement Windows (PowerShell)**

```powershell
# Script PowerShell pour Windows
.\scripts\startup\docker-manager.ps1
```

## 📁 Structure des Scripts Docker

### **Scripts de Configuration**
```
scripts/docker/
├── 01-setup-environment.sh      # Configuration de base
├── env-config.sh                # Configuration interactive
├── quick-deploy.sh              # Déploiement rapide
└── deploy-windows.ps1           # Version Windows
```

### **Scripts de Construction**
```
scripts/docker/
├── 02-build-images.sh           # Construction des images
└── 03-start-services.sh         # Démarrage des services
```

### **Scripts de Gestion**
```
scripts/docker/
├── 04-oracle-extract.sh         # Extraction Oracle
├── 05-stop-services.sh          # Arrêt des services
├── 06-logs.sh                   # Affichage des logs
├── 07-backup.sh                 # Sauvegarde
├── 08-cleanup.sh                # Nettoyage complet
└── 10-status.sh                 # État des services
```

### **Scripts Avancés**
```
scripts/docker/
├── 09-deploy.sh                 # Déploiement complet
├── 11-extract-advanced.sh       # Extraction avancée
├── 12-validate.sh               # Validation complète
└── oracle-extract-advanced.py   # Script Python avancé
```

## 🔧 Utilisation Détaillée

### **1. Configuration de l'Environnement**

#### Configuration Interactive
```bash
./scripts/docker/env-config.sh
```

**Ce script vous demande :**
- 🔐 **Oracle Database :** Host, port, service name, credentials
- 🗄️ **MongoDB :** Username, password, database
- 🔒 **Sécurité :** Secret key, token expiration
- 🤖 **OpenAI :** API key, modèle (optionnel)
- 🌐 **Ports :** Frontend, Backend Node.js, Python, LLM

#### Configuration Automatique
```bash
./scripts/docker/01-setup-environment.sh
```

**Configuration par défaut :**
- Oracle: localhost:1521/XE
- MongoDB: admin/securepassword123
- Ports: 80, 4000, 8000, 8001

### **2. Construction des Images**

```bash
./scripts/docker/02-build-images.sh
```

**Images construites :**
- `sio-frontend:latest` - Interface React
- `sio-backend-node:latest` - API Node.js
- `sio-backend-python:latest` - API FastAPI + Oracle
- `sio-backend-llm:latest` - Service IA

### **3. Démarrage des Services**

```bash
./scripts/docker/03-start-services.sh
```

**Services démarrés :**
- Frontend (port 80)
- Backend Node.js (port 4000)
- Backend Python (port 8000)
- Backend LLM (port 8001)
- MongoDB (port 27017)

### **4. Extraction des Données Oracle**

#### Extraction Simple
```bash
./scripts/docker/04-oracle-extract.sh
```

#### Extraction Avancée
```bash
./scripts/docker/11-extract-advanced.sh
```

**Données extraites :**
- 📊 Données d'audit (30 derniers jours)
- 🗂️ Informations du schéma
- 📈 Statistiques de performance
- 👥 Activité utilisateur (7 derniers jours)

### **5. Monitoring et Maintenance**

#### Vérification de l'État
```bash
./scripts/docker/10-status.sh
```

**Informations affichées :**
- 📊 État des conteneurs
- 🌐 Accessibilité des services
- 💾 Utilisation des ressources
- 🔗 Connexions réseau

#### Affichage des Logs
```bash
./scripts/docker/06-logs.sh
```

**Logs disponibles :**
- Frontend (React)
- Backend Node.js
- Backend Python
- Backend LLM
- MongoDB

#### Sauvegarde
```bash
./scripts/docker/07-backup.sh
```

**Sauvegardes créées :**
- 📦 Données MongoDB
- 📁 Volumes persistants
- ⏰ Horodatage automatique

### **6. Gestion des Services**

#### Arrêt des Services
```bash
./scripts/docker/05-stop-services.sh
```

#### Nettoyage Complet
```bash
./scripts/docker/08-cleanup.sh
```

**Options de nettoyage :**
- 🛑 Arrêt des conteneurs
- 🗑️ Suppression des images
- 💾 Suppression des volumes (optionnel)

### **7. Validation Complète**

```bash
./scripts/docker/12-validate.sh
```

**Tests effectués :**
- ✅ Connexion Oracle
- ✅ Connexion MongoDB
- ✅ Services web accessibles
- ✅ API fonctionnelles
- ✅ Extraction de données

## 🖥️ Utilisation sur Windows

### **Scripts PowerShell**

```powershell
# Démarrage complet
.\scripts\startup\start_project.ps1

# Gestion Docker
.\scripts\startup\docker-manager.ps1

# Démarrage rapide
.\scripts\startup\quick-start.ps1
```

### **Fonctionnalités Windows**
- 🐳 Gestion Docker Desktop
- 🔧 Configuration automatique
- 📊 Monitoring des services
- 🚀 Démarrage/arrêt automatique

## 📊 Architecture des Services

### **Services Déployés**
| Service | Port | Description | Image |
|---------|------|-------------|-------|
| Frontend | 80 | Interface React | sio-frontend:latest |
| Backend Node.js | 4000 | API Node.js | sio-backend-node:latest |
| Backend Python | 8000 | API FastAPI + Oracle | sio-backend-python:latest |
| Backend LLM | 8001 | Service IA | sio-backend-llm:latest |
| MongoDB | 27017 | Base de données | mongo:7-jammy |

### **Volumes Persistants**
- `sio_mongodb_data` : Données MongoDB
- `sio_backend_data` : Données backend Node.js
- `sio_python_logs` : Logs Python
- `sio_python_cache` : Cache Python

## 🔍 Dépannage

### **Problèmes Courants**

#### 1. Ports déjà utilisés
```bash
# Vérifier les ports
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :4000
sudo netstat -tulpn | grep :8000
sudo netstat -tulpn | grep :8001
```

#### 2. Connexion Oracle échoue
```bash
# Tester la connexion
python3 -c "
import oracledb
import os
from dotenv import load_dotenv
load_dotenv()
conn = oracledb.connect(
    user=os.getenv('ORACLE_USERNAME'),
    password=os.getenv('ORACLE_PASSWORD'),
    dsn=f\"{os.getenv('ORACLE_HOST')}:{os.getenv('ORACLE_PORT')}/{os.getenv('ORACLE_SERVICE_NAME')}\"
)
print('Connexion réussie')
conn.close()
"
```

#### 3. Services ne répondent pas
```bash
# Vérifier l'état
./scripts/docker/10-status.sh

# Voir les logs
./scripts/docker/06-logs.sh

# Redémarrer
./scripts/docker/05-stop-services.sh
./scripts/docker/03-start-services.sh
```

### **Logs de Diagnostic**
```bash
# Logs de tous les services
docker-compose -f config/docker/docker-compose.yml logs

# Logs d'un service spécifique
docker logs sio_frontend_prod
docker logs sio_backend_python_prod
docker logs sio_mongodb_prod
```

## 🚀 Workflows Recommandés

### **Développement Local**
```bash
# 1. Configuration rapide
./scripts/docker/quick-deploy.sh

# 2. Vérification
./scripts/docker/10-status.sh

# 3. Logs en temps réel
./scripts/docker/06-logs.sh
```

### **Production**
```bash
# 1. Configuration interactive
./scripts/docker/env-config.sh

# 2. Construction et démarrage
./scripts/docker/02-build-images.sh
./scripts/docker/03-start-services.sh

# 3. Validation complète
./scripts/docker/12-validate.sh

# 4. Extraction des données
./scripts/docker/04-oracle-extract.sh
```

### **Maintenance**
```bash
# 1. Sauvegarde
./scripts/docker/07-backup.sh

# 2. Mise à jour
./scripts/docker/05-stop-services.sh
./scripts/docker/02-build-images.sh
./scripts/docker/03-start-services.sh

# 3. Validation
./scripts/docker/12-validate.sh
```

## 📞 Support et Ressources

### **Documentation**
- [Guide de déploiement](scripts/docker/DEPLOYMENT_GUIDE.md)
- [README Docker](scripts/docker/README.md)
- [Documentation système](docs/system/)

### **Commandes Utiles**
```bash
# État général
./scripts/docker/10-status.sh

# Logs en temps réel
./scripts/docker/06-logs.sh

# Validation complète
./scripts/docker/12-validate.sh

# Sauvegarde
./scripts/docker/07-backup.sh
```

### **Informations de Diagnostic**
En cas de problème, fournissez :
1. **Version du système** : `uname -a`
2. **Version Docker** : `docker --version`
3. **Logs des services** : `./scripts/docker/06-logs.sh`
4. **État des conteneurs** : `./scripts/docker/10-status.sh`
5. **Résultat de validation** : `./scripts/docker/12-validate.sh`

---

**🎯 Votre projet SIA est maintenant prêt pour un déploiement Docker complet et automatisé !**

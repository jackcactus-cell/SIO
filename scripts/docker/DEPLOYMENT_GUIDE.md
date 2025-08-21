# Guide de Déploiement SIO - Docker

Ce guide vous accompagne dans le déploiement complet de l'application SIO sur un serveur Linux avec Docker.

## 🚀 Déploiement Rapide

### Option 1 : Déploiement automatique (Recommandé)
```bash
# Rendre les scripts exécutables
chmod +x scripts/docker/*.sh

# Déploiement complet automatique
./scripts/docker/quick-deploy.sh
```

### Option 2 : Déploiement étape par étape
```bash
# 1. Configuration de l'environnement
./scripts/docker/env-config.sh

# 2. Construction des images
./scripts/docker/02-build-images.sh

# 3. Démarrage des services
./scripts/docker/03-start-services.sh

# 4. Validation de l'installation
./scripts/docker/12-validate.sh
```

## 📋 Prérequis Système

### Serveur Linux
- **OS** : Ubuntu 20.04+, CentOS 8+, ou Debian 11+
- **RAM** : Minimum 4GB (recommandé 8GB+)
- **Stockage** : Minimum 20GB d'espace libre
- **Réseau** : Accès Internet pour télécharger les images Docker

### Accès Oracle
- Base de données Oracle accessible
- Utilisateur avec privilèges d'audit
- Connexion réseau depuis le serveur

## 🔧 Configuration

### 1. Configuration Oracle
Modifiez le fichier `.env` avec vos paramètres Oracle :
```bash
ORACLE_HOST=votre_serveur_oracle
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XE
ORACLE_USERNAME=audit_user
ORACLE_PASSWORD=votre_mot_de_passe
```

### 2. Configuration MongoDB
Les paramètres MongoDB sont configurés automatiquement :
```bash
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=securepassword123
MONGODB_DATABASE=audit_146
```

### 3. Configuration Sécurité
Générez une clé secrète forte :
```bash
SECRET_KEY=$(openssl rand -hex 32)
```

## 🐳 Architecture Docker

### Services déployés
| Service | Port | Description | Image |
|---------|------|-------------|-------|
| Frontend | 80 | Interface React | sio-frontend:latest |
| Backend Node.js | 4000 | API Node.js | sio-backend-node:latest |
| Backend Python | 8000 | API FastAPI + Oracle | sio-backend-python:latest |
| Backend LLM | 8001 | Service IA | sio-backend-llm:latest |
| MongoDB | 27017 | Base de données | mongo:7-jammy |

### Volumes persistants
- `sio_mongodb_data` : Données MongoDB
- `sio_backend_data` : Données backend Node.js
- `sio_python_logs` : Logs Python
- `sio_python_cache` : Cache Python

## 📊 Extraction des Données Oracle

### Extraction simple
```bash
./scripts/docker/04-oracle-extract.sh
```

### Extraction avancée
```bash
./scripts/docker/11-extract-advanced.sh
```

L'extraction avancée inclut :
- Données d'audit (30 derniers jours)
- Informations du schéma
- Statistiques de performance
- Activité utilisateur (7 derniers jours)

## 🔍 Monitoring et Maintenance

### Vérification de l'état
```bash
./scripts/docker/10-status.sh
```

### Affichage des logs
```bash
./scripts/docker/06-logs.sh
```

### Sauvegarde des données
```bash
./scripts/docker/07-backup.sh
```

### Validation complète
```bash
./scripts/docker/12-validate.sh
```

## 🛠️ Gestion des Services

### Arrêt des services
```bash
./scripts/docker/05-stop-services.sh
```

### Redémarrage des services
```bash
./scripts/docker/05-stop-services.sh
./scripts/docker/03-start-services.sh
```

### Nettoyage complet
```bash
./scripts/docker/08-cleanup.sh
```

## 🔐 Sécurité

### Recommandations
1. **Changez les mots de passe par défaut**
2. **Utilisez des clés secrètes fortes**
3. **Limitez l'accès aux ports sensibles**
4. **Configurez un firewall approprié**
5. **Surveillez les logs régulièrement**

### Configuration firewall
```bash
# Autoriser uniquement les ports nécessaires
sudo ufw allow 80/tcp    # Frontend
sudo ufw allow 443/tcp   # HTTPS (si configuré)
sudo ufw deny 27017/tcp  # MongoDB (accès local uniquement)
```

## 📈 Performance

### Optimisations recommandées
1. **Allocation de ressources** : Ajustez les limites CPU/RAM dans docker-compose.yml
2. **Persistance des données** : Utilisez des volumes SSD pour MongoDB
3. **Cache Redis** : Activez le cache pour améliorer les performances
4. **Monitoring** : Configurez des alertes sur l'utilisation des ressources

### Surveillance des ressources
```bash
# Utilisation des ressources
docker stats

# Espace disque
df -h

# Utilisation mémoire
free -h
```

## 🚨 Dépannage

### Problèmes courants

#### 1. Ports déjà utilisés
```bash
# Vérifier les ports utilisés
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :4000
sudo netstat -tulpn | grep :8000
sudo netstat -tulpn | grep :8001
```

#### 2. Connexion Oracle échoue
```bash
# Tester la connexion Oracle
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

#### 3. MongoDB ne démarre pas
```bash
# Vérifier les logs MongoDB
docker logs sio_mongodb_prod

# Vérifier l'espace disque
df -h
```

#### 4. Services ne répondent pas
```bash
# Vérifier l'état des conteneurs
docker ps -a

# Redémarrer les services
./scripts/docker/03-start-services.sh

# Vérifier les logs
./scripts/docker/06-logs.sh
```

### Logs de diagnostic
```bash
# Logs de tous les services
docker-compose -f config/docker/docker-compose.yml logs

# Logs d'un service spécifique
docker logs sio_frontend_prod
docker logs sio_backend_python_prod
docker logs sio_mongodb_prod
```

## 📞 Support

### Informations de diagnostic
En cas de problème, fournissez :
1. **Version du système** : `uname -a`
2. **Version Docker** : `docker --version`
3. **Logs des services** : `./scripts/docker/06-logs.sh`
4. **État des conteneurs** : `./scripts/docker/10-status.sh`
5. **Résultat de validation** : `./scripts/docker/12-validate.sh`

### Ressources utiles
- [Documentation Docker](https://docs.docker.com/)
- [Documentation MongoDB](https://docs.mongodb.com/)
- [Documentation Oracle](https://docs.oracle.com/en/database/)
- [Logs de l'application](logs/)

## 🎯 Checklist de Déploiement

- [ ] Serveur Linux configuré
- [ ] Docker et Docker Compose installés
- [ ] Accès Oracle configuré
- [ ] Fichiers .env créés
- [ ] Images Docker construites
- [ ] Services démarrés
- [ ] Extraction Oracle testée
- [ ] Validation complète réussie
- [ ] Sauvegarde configurée
- [ ] Monitoring en place
- [ ] Sécurité configurée

## 📝 Notes de Version

### Version 1.0.0
- Déploiement initial avec Docker
- Support Oracle et MongoDB
- Scripts d'automatisation complets
- Extraction de données avancée
- Monitoring et validation intégrés

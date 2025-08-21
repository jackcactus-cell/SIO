# Scripts Docker pour SIO

Ce dossier contient tous les scripts nécessaires pour dockeriser et déployer l'application SIO sur un serveur Linux.

## 📋 Prérequis

- Docker installé
- Docker Compose installé
- Python 3.8+ (pour l'extraction Oracle)
- Accès à une base de données Oracle

## 🚀 Scripts disponibles

### 1. Configuration de l'environnement
```bash
./01-setup-environment.sh
```
- Vérifie les prérequis Docker
- Crée les fichiers `.env` nécessaires
- Crée les dossiers de logs et données

### 2. Construction des images
```bash
./02-build-images.sh
```
- Construit toutes les images Docker :
  - Frontend (React/Vite)
  - Backend Node.js
  - Backend Python (FastAPI)
  - Backend LLM

### 3. Démarrage des services
```bash
./03-start-services.sh
```
- Démarre tous les services avec Docker Compose
- Vérifie l'état des services

### 4. Extraction Oracle → MongoDB
```bash
./04-oracle-extract.sh
```
- Extrait les données d'audit Oracle
- Les stocke dans MongoDB
- Nécessite une configuration Oracle valide

### 5. Arrêt des services
```bash
./05-stop-services.sh
```
- Arrête tous les services Docker

### 6. Affichage des logs
```bash
./06-logs.sh
```
- Affiche les logs en temps réel de tous les services

### 7. Sauvegarde des données
```bash
./07-backup.sh
```
- Sauvegarde MongoDB et les volumes
- Crée un dossier de sauvegarde daté

### 8. Nettoyage complet
```bash
./08-cleanup.sh
```
- Arrête et supprime les conteneurs
- Supprime les images
- Option de suppression des volumes

### 9. Déploiement complet
```bash
./09-deploy.sh
```
- Script de déploiement automatique complet
- Installe Docker si nécessaire
- Configure et démarre toute l'application

### 10. Vérification de l'état
```bash
./10-status.sh
```
- Affiche l'état des conteneurs
- Vérifie l'accessibilité des services
- Montre l'utilisation des ressources

## 🔧 Configuration

### Fichier .env principal
```bash
# Configuration Oracle
ORACLE_HOST=your_oracle_host
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XE
ORACLE_USERNAME=audit_user
ORACLE_PASSWORD=your_oracle_password

# Configuration MongoDB
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=securepassword123
MONGODB_DATABASE=audit_146

# Configuration sécurité
SECRET_KEY=your_super_secret_key_here_change_in_production
```

### Fichier backend_python/.env
```bash
# Variables héritées du .env principal
ORACLE_HOST=${ORACLE_HOST}
ORACLE_PASSWORD=${ORACLE_PASSWORD}
# ... autres variables
```

## 🚀 Déploiement rapide

Pour un déploiement complet en une seule commande :

```bash
chmod +x scripts/docker/*.sh
./scripts/docker/09-deploy.sh
```

## 📊 Services déployés

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 80 | Interface utilisateur React |
| Backend Node.js | 4000 | API Node.js |
| Backend Python | 8000 | API FastAPI + Oracle |
| Backend LLM | 8001 | Service d'analyse intelligente |
| MongoDB | 27017 | Base de données |

## 🔍 Dépannage

### Vérifier l'état des services
```bash
./10-status.sh
```

### Voir les logs
```bash
./06-logs.sh
```

### Redémarrer les services
```bash
./05-stop-services.sh
./03-start-services.sh
```

### Problèmes courants

1. **Ports déjà utilisés** : Vérifiez qu'aucun service n'utilise les ports 80, 4000, 8000, 8001
2. **Connexion Oracle** : Vérifiez la configuration dans le fichier `.env`
3. **Permissions Docker** : Assurez-vous que l'utilisateur est dans le groupe docker

## 📁 Structure des données

```
SIO/
├── logs/           # Logs de l'application
├── data/           # Données persistantes
├── cache/          # Cache de l'application
├── backups/        # Sauvegardes automatiques
└── .env            # Configuration principale
```

## 🔐 Sécurité

- Changez les mots de passe par défaut
- Utilisez des clés secrètes fortes
- Configurez le firewall approprié
- Limitez l'accès aux ports sensibles

## 📞 Support

En cas de problème, vérifiez :
1. Les logs avec `./06-logs.sh`
2. L'état des services avec `./10-status.sh`
3. La configuration dans les fichiers `.env`

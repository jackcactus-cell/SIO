# 🏗️ Guide Complet de Réorganisation - Projet SIO Audit

## 🎯 Objectif

Ce guide vous accompagne dans la réorganisation complète de votre projet SIO Audit vers une structure moderne, professionnelle et maintenable.

## 📋 Avant de Commencer

### Prérequis
- ✅ Sauvegarde complète de votre projet
- ✅ Git configuré (recommandé)
- ✅ Docker et Docker Compose installés
- ✅ Droits d'écriture sur le projet

### Vérifications Préalables
```bash
# Vérifier la structure actuelle
ls -la

# Sauvegarder le projet
cp -r . ../sio-backup-$(date +%Y%m%d)

# Optionnel: Commiter les changements actuels
git add . && git commit -m "État avant réorganisation"
```

## 🚀 Étapes de Réorganisation

### Étape 1: Préparation

1. **Arrêter tous les services en cours**
   ```bash
   # Si des conteneurs Docker tournent
   docker-compose down
   
   # Si des processus Node.js/Python tournent
   pkill -f node
   pkill -f python
   ```

2. **Rendre les scripts exécutables**
   ```bash
   chmod +x reorganize-project.sh
   chmod +x validate-structure.sh
   ```

### Étape 2: Exécution de la Réorganisation

```bash
# Lancer la réorganisation automatique
./reorganize-project.sh
```

**Ce script va :**
- ✅ Créer la nouvelle structure de dossiers
- ✅ Migrer toutes les applications
- ✅ Réorganiser l'infrastructure Docker
- ✅ Classer la documentation
- ✅ Organiser les scripts
- ✅ Mettre à jour les chemins
- ✅ Créer les fichiers de configuration

### Étape 3: Validation

```bash
# Valider la nouvelle structure
./validate-structure.sh
```

### Étape 4: Test de Fonctionnement

```bash
# Tester Docker Compose
cd infrastructure/docker
docker-compose config

# Démarrer en mode développement
docker-compose -f docker-compose.dev.yml up
```

### Étape 5: Nettoyage (Optionnel)

```bash
# Retourner à la racine
cd ../..

# Supprimer les anciens dossiers (ATTENTION: Irréversible)
./cleanup-old.sh
```

## 📁 Nouvelle Structure Détaillée

```
SIO/
├── 📁 apps/                          # Applications principales
│   ├── 📁 frontend/                  # React/Vite/TypeScript
│   │   ├── 📁 src/                   # Code source
│   │   │   ├── 📁 components/        # Composants React
│   │   │   ├── 📁 pages/             # Pages de l'application
│   │   │   ├── 📁 context/           # Contextes React
│   │   │   ├── 📁 utils/             # Utilitaires frontend
│   │   │   └── main.tsx              # Point d'entrée
│   │   ├── 📁 public/                # Assets statiques
│   │   ├── package.json              # Dépendances frontend
│   │   ├── vite.config.ts            # Configuration Vite
│   │   ├── Dockerfile                # Container production
│   │   └── Dockerfile.dev            # Container développement
│   │
│   ├── 📁 backend-api/               # API Node.js/Express
│   │   ├── 📁 src/                   # Code source
│   │   │   ├── 📁 routes/             # Routes API
│   │   │   ├── 📁 middleware/        # Middlewares Express
│   │   │   ├── 📁 utils/             # Utilitaires backend
│   │   │   ├── 📁 models/            # Modèles de données
│   │   │   ├── 📁 services/          # Services métier
│   │   │   └── index.js              # Point d'entrée
│   │   ├── 📁 tests/                 # Tests unitaires
│   │   ├── package.json              # Dépendances backend
│   │   ├── Dockerfile                # Container production
│   │   └── Dockerfile.dev            # Container développement
│   │
│   ├── 📁 backend-python/            # Service Python/FastAPI
│   │   ├── 📁 src/                   # Code source Python
│   │   │   ├── main.py               # Point d'entrée FastAPI
│   │   │   ├── auth.py               # Authentification
│   │   │   ├── database.py           # Connexions DB
│   │   │   └── models.py             # Modèles Pydantic
│   │   ├── 📁 tests/                 # Tests Python
│   │   ├── requirements.txt          # Dépendances Python
│   │   ├── Dockerfile                # Container production
│   │   └── .env                      # Variables d'environnement
│   │
│   └── 📁 llm-service/               # Service IA/LLM
│       ├── 📁 src/                   # Code source IA
│       │   ├── api_server.py         # Serveur API IA
│       │   ├── llm_service.py        # Service LLM
│       │   └── file_processor.py     # Traitement fichiers
│       ├── 📁 models/                # Modèles IA et data
│       ├── requirements.txt          # Dépendances IA
│       └── Dockerfile                # Container IA
│
├── 📁 infrastructure/                # Infrastructure et déploiement
│   ├── 📁 docker/                    # Configuration Docker
│   │   ├── docker-compose.yml        # Production
│   │   ├── docker-compose.dev.yml    # Développement
│   │   ├── nginx.conf                # Configuration Nginx
│   │   └── 📁 config/                # Configs spécifiques
│   ├── 📁 kubernetes/                # Kubernetes (futur)
│   └── 📁 terraform/                 # Infrastructure as Code (futur)
│
├── 📁 scripts/                       # Scripts d'automatisation
│   ├── 📁 docker/                    # Scripts Docker
│   │   ├── start.sh                  # Démarrage
│   │   ├── stop.sh                   # Arrêt
│   │   ├── logs.sh                   # Logs
│   │   ├── restart.sh                # Redémarrage
│   │   ├── status.sh                 # Statut
│   │   ├── backup.sh                 # Sauvegarde
│   │   └── cleanup.sh                # Nettoyage
│   ├── 📁 deployment/                # Scripts de déploiement
│   ├── 📁 development/               # Scripts de développement
│   │   ├── quick-start.sh            # Démarrage rapide
│   │   └── setup-dev.sh              # Configuration dev
│   └── 📁 maintenance/               # Scripts de maintenance
│
├── 📁 shared/                        # Code partagé entre apps
│   ├── 📁 types/                     # Types TypeScript communs
│   ├── 📁 utils/                     # Utilitaires partagés
│   ├── 📁 constants/                 # Constantes globales
│   └── 📁 schemas/                   # Schémas de validation
│
├── 📁 data/                          # Données et migrations
│   ├── 📁 seeds/                     # Données d'exemple
│   ├── 📁 migrations/                # Scripts de migration DB
│   └── 📁 samples/                   # Fichiers d'exemple/tests
│
├── 📁 docs/                          # Documentation complète
│   ├── 📁 api/                       # Documentation API
│   ├── 📁 architecture/              # Documentation technique
│   │   ├── LOGGING_SYSTEM.md         # Système de logs
│   │   ├── ARCHITECTURE.md           # Architecture globale
│   │   └── DATABASE_SCHEMA.md        # Schémas de données
│   ├── 📁 deployment/                # Guides de déploiement
│   │   ├── DOCKER_GUIDE.md           # Guide Docker
│   │   ├── PRODUCTION_DEPLOY.md      # Déploiement production
│   │   └── ENVIRONMENT_SETUP.md      # Configuration environnements
│   ├── 📁 development/               # Guides de développement
│   │   ├── GETTING_STARTED.md        # Commencer
│   │   ├── CODING_STANDARDS.md       # Standards de code
│   │   └── CONTRIBUTING.md           # Contribution
│   └── 📁 user/                      # Documentation utilisateur
│       ├── USER_MANUAL.md            # Manuel utilisateur
│       └── FAQ.md                    # Questions fréquentes
│
├── 📁 tests/                         # Tests d'intégration
│   ├── 📁 integration/               # Tests d'intégration
│   ├── 📁 e2e/                       # Tests end-to-end
│   └── 📁 performance/               # Tests de performance
│
├── 📁 tools/                         # Outils de développement
│   ├── 📁 linting/                   # Configuration linting
│   ├── 📁 testing/                   # Outils de test
│   └── 📁 analysis/                  # Outils d'analyse
│
├── 📁 storage/                       # Stockage de données
│   ├── 📁 logs/                      # Logs de l'application
│   │   ├── README.md                 # Guide des logs
│   │   └── .gitkeep                  # Garder le dossier
│   ├── 📁 backups/                   # Sauvegardes automatiques
│   ├── 📁 uploads/                   # Fichiers uploadés
│   └── 📁 cache/                     # Cache de l'application
│
├── 📁 config/                        # Configuration globale
│   ├── 📁 environments/              # Configs par environnement
│   │   ├── .env.example              # Exemple configuration
│   │   ├── .env.development.example  # Configuration développement
│   │   └── backend-python.env.example # Config Python
│   ├── 📁 security/                  # Configuration sécurité
│   └── 📁 monitoring/                # Configuration monitoring
│
├── package.json                      # Configuration workspace
├── README.md                         # Documentation principale
├── .gitignore                        # Exclusions Git
├── .dockerignore                     # Exclusions Docker
├── CHANGELOG.md                      # Journal des modifications
└── LICENSE                           # Licence du projet
```

## 🔄 Migration des Données

### Correspondances des Dossiers

| Ancien Chemin | Nouveau Chemin | Description |
|---------------|----------------|-------------|
| `project/` | `apps/frontend/` | Application React |
| `backend/` | `apps/backend-api/` | API Node.js |
| `backend_python/` | `apps/backend-python/` | Service Python |
| `backend/llm-prototype/` | `apps/llm-service/` | Service IA |
| `logs/` | `storage/logs/` | Logs centralisés |
| `backup/` | `storage/backups/` | Sauvegardes |
| `scripts/` | `scripts/docker/` | Scripts Docker |
| `*.md` | `docs/*/` | Documentation classée |

### Mise à Jour des Chemins

Les chemins suivants sont automatiquement mis à jour :

- **Docker Compose** : Chemins des contextes de build
- **Scripts** : Références aux fichiers de configuration
- **Imports** : Chemins relatifs dans le code
- **Documentation** : Liens internes

## ✅ Validation et Tests

### Checklist de Validation

Après la réorganisation, vérifiez :

- [ ] **Structure** : Tous les dossiers créés
- [ ] **Applications** : Code source migré
- [ ] **Infrastructure** : Docker fonctionnel
- [ ] **Scripts** : Exécutables et fonctionnels
- [ ] **Documentation** : Bien classée
- [ ] **Configuration** : Fichiers d'environnement

### Tests Recommandés

```bash
# 1. Validation automatique
./validate-structure.sh

# 2. Test Docker Compose
cd infrastructure/docker
docker-compose config
docker-compose -f docker-compose.dev.yml up --build

# 3. Test des applications individuelles
cd ../../apps/frontend
npm install && npm run build

cd ../backend-api
npm install && npm test

cd ../backend-python
pip install -r requirements.txt
python -m pytest

# 4. Test des scripts
cd ../../scripts/docker
./start.sh dev
./status.sh
./stop.sh
```

## 🚨 Résolution de Problèmes

### Problèmes Courants

#### 1. Erreurs de chemins Docker
```bash
# Vérifier les chemins dans docker-compose
grep -r "../apps/" infrastructure/docker/

# Corriger manuellement si nécessaire
sed -i 's|./project|../apps/frontend|g' infrastructure/docker/docker-compose.yml
```

#### 2. Scripts non exécutables
```bash
# Rendre tous les scripts exécutables
chmod +x scripts/**/*.sh
chmod +x *.sh
```

#### 3. Dépendances manquantes
```bash
# Réinstaller les dépendances
cd apps/frontend && npm install
cd ../backend-api && npm install
cd ../backend-python && pip install -r requirements.txt
cd ../llm-service && pip install -r requirements.txt
```

#### 4. Fichiers de configuration manquants
```bash
# Recréer les fichiers d'environnement
cp config/environments/.env.example .env
cp config/environments/backend-python.env.example apps/backend-python/.env
```

### Rollback (Restauration)

Si la réorganisation échoue :

```bash
# Restaurer depuis la sauvegarde
rm -rf apps infrastructure scripts docs storage config
mv ../sio-backup-* ./

# Ou depuis Git
git reset --hard HEAD~1
git clean -fd
```

## 📈 Bénéfices de la Nouvelle Structure

### 🎯 Organisation Claire
- **Séparation logique** des applications
- **Infrastructure centralisée**
- **Documentation structurée**
- **Scripts organisés par fonction**

### 🚀 Développement Amélioré
- **Workspace NPM** pour gestion unifiée
- **Hot reload** optimisé
- **Tests isolés** par application
- **Déploiement simplifié**

### 🔧 Maintenance Facilitée
- **Logs centralisés**
- **Configuration unifiée**
- **Monitoring intégré**
- **Sauvegardes automatisées**

### 📦 Déploiement Moderne
- **Containers optimisés**
- **Orchestration simplifiée**
- **Scaling horizontal** préparé
- **CI/CD ready**

## 🎉 Finalisation

Une fois la réorganisation terminée et validée :

1. **Committez les changements**
   ```bash
   git add .
   git commit -m "Réorganisation complète du projet SIO Audit"
   ```

2. **Mettez à jour la documentation**
   - README principal
   - Guides de développement
   - Documentation API

3. **Informez l'équipe**
   - Nouveaux chemins
   - Nouvelles procédures
   - Formation si nécessaire

4. **Configurez les environnements**
   - Développement
   - Test
   - Production

---

**🎯 Résultat :** Votre projet SIO Audit est maintenant organisé selon les meilleures pratiques modernes, facilitant le développement, la maintenance et le déploiement !

## 📞 Support

En cas de problème :
1. Consultez la [section troubleshooting](#-résolution-de-problèmes)
2. Exécutez `./validate-structure.sh` pour diagnostiquer
3. Vérifiez les logs dans `storage/logs/`
4. Contactez l'équipe de développement



#!/bin/bash

# =================================================================
# Script de Réorganisation Complète du Projet SIO
# =================================================================

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}======================================${NC}"
echo -e "${MAGENTA}  SIO Audit - Réorganisation Complète${NC}"
echo -e "${MAGENTA}======================================${NC}"
echo ""

# Vérification des prérequis
if [ ! -f "backend/index.js" ] || [ ! -f "project/package.json" ]; then
    echo -e "${RED}❌ Structure de projet non reconnue${NC}"
    exit 1
fi

echo -e "${YELLOW}🏗️ Phase 1: Création de la nouvelle structure...${NC}"

# Créer la nouvelle structure de dossiers
mkdir -p {apps,infrastructure,scripts,shared,data,docs,tests,tools,storage,config}

# Applications
mkdir -p apps/{frontend,backend-api,backend-python,llm-service}
mkdir -p apps/frontend/{src,public}
mkdir -p apps/backend-api/{src,tests}
mkdir -p apps/backend-python/{src,tests}
mkdir -p apps/llm-service/{src,models}

# Infrastructure
mkdir -p infrastructure/{docker,kubernetes,terraform}
mkdir -p infrastructure/docker/config

# Scripts par catégorie
mkdir -p scripts/{docker,deployment,development,maintenance}

# Shared
mkdir -p shared/{types,utils,constants,schemas}

# Data
mkdir -p data/{seeds,migrations,samples}

# Documentation
mkdir -p docs/{api,architecture,deployment,development,user}

# Tests
mkdir -p tests/{integration,e2e,performance}

# Tools
mkdir -p tools/{linting,testing,analysis}

# Storage
mkdir -p storage/{logs,backups,uploads,cache}

# Config
mkdir -p config/{environments,security,monitoring}

echo -e "${GREEN}✅ Structure créée${NC}"

echo -e "${YELLOW}🔄 Phase 2: Migration des applications...${NC}"

# Migration du Frontend (project -> apps/frontend)
if [ -d "project" ]; then
    echo -e "${BLUE}   📱 Migration du frontend...${NC}"
    
    # Copier le contenu en préservant la structure
    cp -r project/* apps/frontend/ 2>/dev/null || true
    cp project/.* apps/frontend/ 2>/dev/null || true
    
    # Nettoyer le dossier original plus tard
fi

# Migration du Backend API (backend -> apps/backend-api)
if [ -d "backend" ]; then
    echo -e "${BLUE}   🔧 Migration du backend API...${NC}"
    
    # Créer la structure src
    mkdir -p apps/backend-api/src/{routes,middleware,utils,models,services}
    
    # Copier les fichiers principaux
    cp backend/index.js apps/backend-api/src/
    cp backend/package*.json apps/backend-api/
    
    # Copier les utilitaires
    [ -d "backend/utils" ] && cp -r backend/utils apps/backend-api/src/
    
    # Copier les autres fichiers JS
    find backend -maxdepth 1 -name "*.js" -not -name "index.js" -exec cp {} apps/backend-api/src/ \;
    
    # Copier le Dockerfile
    [ -f "backend/Dockerfile" ] && cp backend/Dockerfile apps/backend-api/
    [ -f "backend/Dockerfile.dev" ] && cp backend/Dockerfile.dev apps/backend-api/
fi

# Migration du Backend Python
if [ -d "backend_python" ]; then
    echo -e "${BLUE}   🐍 Migration du backend Python...${NC}"
    
    # Copier tout le contenu
    cp -r backend_python/* apps/backend-python/ 2>/dev/null || true
    cp backend_python/.* apps/backend-python/ 2>/dev/null || true
    
    # Organiser en src
    mkdir -p apps/backend-python/src
    find apps/backend-python -maxdepth 1 -name "*.py" -exec mv {} apps/backend-python/src/ \;
fi

# Migration du Service LLM
if [ -d "backend/llm-prototype" ]; then
    echo -e "${BLUE}   🤖 Migration du service LLM...${NC}"
    
    # Copier tout le contenu
    cp -r backend/llm-prototype/* apps/llm-service/ 2>/dev/null || true
    
    # Organiser en src
    mkdir -p apps/llm-service/src
    find apps/llm-service -maxdepth 1 -name "*.py" -exec mv {} apps/llm-service/src/ \;
    
    # Garder les modèles séparés
    [ -d "apps/llm-service/chroma_db" ] && mv apps/llm-service/chroma_db apps/llm-service/models/
fi

echo -e "${GREEN}✅ Applications migrées${NC}"

echo -e "${YELLOW}🐳 Phase 3: Migration de l'infrastructure...${NC}"

# Migration des fichiers Docker
echo -e "${BLUE}   📦 Migration Docker...${NC}"

# Docker Compose files
[ -f "docker-compose.yml" ] && mv docker-compose.yml infrastructure/docker/
[ -f "docker-compose.dev.yml" ] && mv docker-compose.dev.yml infrastructure/docker/

# Configuration Nginx
[ -f "project/nginx.conf" ] && cp project/nginx.conf infrastructure/docker/

# Fichiers d'environnement
[ -f "env.example" ] && mv env.example config/environments/
[ -f "env.dev.example" ] && mv env.dev.example config/environments/
[ -f "backend_python/env.example" ] && mv backend_python/env.example config/environments/backend-python.env.example

echo -e "${GREEN}✅ Infrastructure migrée${NC}"

echo -e "${YELLOW}📜 Phase 4: Migration des scripts...${NC}"

# Migration des scripts Docker
echo -e "${BLUE}   🔧 Organisation des scripts...${NC}"

# Scripts Docker
[ -d "scripts" ] && cp -r scripts/* scripts/docker/ 2>/dev/null || true

# Scripts de démarrage rapide
[ -f "quick-start.sh" ] && mv quick-start.sh scripts/development/
[ -f "quick-start.ps1" ] && mv quick-start.ps1 scripts/development/
[ -f "docker-manager.sh" ] && mv docker-manager.sh scripts/docker/
[ -f "docker-manager.ps1" ] && mv docker-manager.ps1 scripts/docker/

# Scripts de maintenance
for script in *.ps1 *.sh; do
    if [ -f "$script" ] && [[ "$script" == *"start"* || "$script" == *"restart"* || "$script" == *"mongo"* ]]; then
        mv "$script" scripts/maintenance/ 2>/dev/null || true
    fi
done

echo -e "${GREEN}✅ Scripts organisés${NC}"

echo -e "${YELLOW}📚 Phase 5: Migration de la documentation...${NC}"

# Migration de tous les fichiers MD
echo -e "${BLUE}   📖 Organisation de la documentation...${NC}"

# Documentation architecture
for doc in *LOGGING* *SYSTEM* *ARCHITECTURE* *RESUME*; do
    [ -f "$doc" ] && mv "$doc" docs/architecture/ 2>/dev/null || true
done

# Documentation API et développement
for doc in README* *GUIDE* *IMPROVEMENT* *FIX*; do
    [ -f "$doc" ] && mv "$doc" docs/development/ 2>/dev/null || true
done

# Documentation déploiement
for doc in DOCKER* DEPLOYMENT* *DEPLOY*; do
    [ -f "$doc" ] && mv "$doc" docs/deployment/ 2>/dev/null || true
done

# Documentation utilisateur
for doc in *MANUAL* *USER* *HELP*; do
    [ -f "$doc" ] && mv "$doc" docs/user/ 2>/dev/null || true
done

# Déplacer les questions et exemples
for doc in *QUESTION* *SAMPLE* *EXAMPLE*; do
    [ -f "$doc" ] && mv "$doc" data/samples/ 2>/dev/null || true
done

echo -e "${GREEN}✅ Documentation organisée${NC}"

echo -e "${YELLOW}💾 Phase 6: Migration du stockage...${NC}"

# Migration des logs
echo -e "${BLUE}   📊 Organisation du stockage...${NC}"

[ -d "logs" ] && mv logs/* storage/logs/ 2>/dev/null || true
[ -d "backup" ] && mv backup storage/backups/ 2>/dev/null || true

# Créer les dossiers de stockage avec des README
echo "# Logs de l'application SIO" > storage/logs/README.md
echo "# Sauvegardes automatiques" > storage/backups/README.md
echo "# Fichiers uploadés par les utilisateurs" > storage/uploads/README.md
echo "# Cache de l'application" > storage/cache/README.md

echo -e "${GREEN}✅ Stockage organisé${NC}"

echo -e "${YELLOW}🔧 Phase 7: Création des fichiers de configuration...${NC}"

# Package.json racine pour workspace
cat > package.json << 'EOF'
{
  "name": "sio-audit-workspace",
  "version": "1.0.0",
  "description": "Application d'audit Oracle SIO - Workspace",
  "private": true,
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspace=apps/frontend & npm run dev --workspace=apps/backend-api",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "docker:up": "./scripts/docker/start.sh",
    "docker:down": "./scripts/docker/stop.sh",
    "docker:logs": "./scripts/docker/logs.sh"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "keywords": ["audit", "oracle", "mongodb", "react", "express", "fastapi"],
  "author": "Équipe SIO",
  "license": "MIT"
}
EOF

# README principal
cat > README.md << 'EOF'
# 🏢 SIO Audit Application

Application complète d'audit Oracle avec interface moderne et analyse intelligente.

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Développement
npm run dev

# Docker
npm run docker:up
```

## 📁 Structure du Projet

```
SIO/
├── apps/                 # Applications
├── infrastructure/       # Docker, K8s, etc.
├── scripts/             # Scripts d'automatisation
├── docs/                # Documentation
└── storage/             # Logs, backups, uploads
```

## 📚 Documentation

- [Guide de Développement](docs/development/)
- [Guide de Déploiement](docs/deployment/)
- [Documentation API](docs/api/)
- [Architecture](docs/architecture/)

## 🛠️ Technologies

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Python, FastAPI
- **Base de données**: MongoDB, Oracle
- **Infrastructure**: Docker, Docker Compose
- **IA**: Service LLM pour analyse intelligente

## 📞 Support

Consultez la [documentation](docs/) ou contactez l'équipe de développement.
EOF

# .gitignore amélioré
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/
__pycache__/
*.py[cod]
*$py.class

# Logs
*.log
storage/logs/*.log
!storage/logs/README.md

# Environment variables
.env
.env.local
.env.development
.env.test
.env.production

# Build outputs
dist/
build/
*.tsbuildinfo

# Cache
.cache/
storage/cache/*
!storage/cache/README.md

# Uploads
storage/uploads/*
!storage/uploads/README.md

# Backups
storage/backups/*
!storage/backups/README.md

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
.docker/

# Temporary files
*.tmp
*.temp
EOF

echo -e "${GREEN}✅ Configuration créée${NC}"

echo -e "${YELLOW}🧹 Phase 8: Mise à jour des chemins...${NC}"

# Mettre à jour les chemins dans docker-compose
if [ -f "infrastructure/docker/docker-compose.yml" ]; then
    echo -e "${BLUE}   🔄 Mise à jour docker-compose.yml...${NC}"
    
    sed -i 's|./project|../apps/frontend|g' infrastructure/docker/docker-compose.yml
    sed -i 's|./backend|../apps/backend-api|g' infrastructure/docker/docker-compose.yml
    sed -i 's|./backend_python|../apps/backend-python|g' infrastructure/docker/docker-compose.yml
    sed -i 's|./backend/llm-prototype|../apps/llm-service|g' infrastructure/docker/docker-compose.yml
fi

if [ -f "infrastructure/docker/docker-compose.dev.yml" ]; then
    echo -e "${BLUE}   🔄 Mise à jour docker-compose.dev.yml...${NC}"
    
    sed -i 's|./project|../apps/frontend|g' infrastructure/docker/docker-compose.dev.yml
    sed -i 's|./backend|../apps/backend-api|g' infrastructure/docker/docker-compose.dev.yml
    sed -i 's|./backend_python|../apps/backend-python|g' infrastructure/docker/docker-compose.dev.yml
    sed -i 's|./backend/llm-prototype|../apps/llm-service|g' infrastructure/docker/docker-compose.dev.yml
fi

# Mettre à jour les scripts Docker
echo -e "${BLUE}   🔄 Mise à jour des scripts...${NC}"

for script in scripts/docker/*.sh; do
    if [ -f "$script" ]; then
        sed -i 's|docker-compose.yml|infrastructure/docker/docker-compose.yml|g' "$script"
        sed -i 's|docker-compose.dev.yml|infrastructure/docker/docker-compose.dev.yml|g' "$script"
    fi
done

echo -e "${GREEN}✅ Chemins mis à jour${NC}"

echo -e "${YELLOW}🗑️ Phase 9: Nettoyage...${NC}"

# Supprimer les dossiers vides originaux (avec confirmation)
echo -e "${BLUE}   🧹 Nettoyage des anciens dossiers...${NC}"

# Créer un script de nettoyage sécurisé
cat > cleanup-old.sh << 'EOF'
#!/bin/bash
echo "Ce script supprimera les anciens dossiers après migration."
echo "Vérifiez que tout fonctionne avant de l'exécuter !"
echo ""
read -p "Voulez-vous vraiment supprimer les anciens dossiers ? (y/N): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    echo "Suppression des anciens dossiers..."
    
    # Supprimer seulement si les nouveaux dossiers existent et contiennent des fichiers
    [ -d "apps/frontend/src" ] && [ "$(ls -A project 2>/dev/null)" ] && rm -rf project
    [ -d "apps/backend-api/src" ] && [ "$(ls -A backend 2>/dev/null)" ] && rm -rf backend
    [ -d "apps/backend-python/src" ] && [ "$(ls -A backend_python 2>/dev/null)" ] && rm -rf backend_python
    
    # Supprimer les scripts en double
    [ -d "scripts/docker" ] && rm -rf scripts/*.sh 2>/dev/null || true
    
    # Supprimer les anciens logs
    [ -d "storage/logs" ] && rm -rf logs 2>/dev/null || true
    
    echo "Nettoyage terminé !"
else
    echo "Nettoyage annulé."
fi
EOF

chmod +x cleanup-old.sh

echo -e "${GREEN}✅ Script de nettoyage créé (cleanup-old.sh)${NC}"

echo -e "${YELLOW}📋 Phase 10: Validation...${NC}"

# Vérifications finales
echo -e "${BLUE}   ✅ Vérification de la structure...${NC}"

validation_errors=0

# Vérifier que les applications ont été migrées
for app in frontend backend-api backend-python llm-service; do
    if [ ! -d "apps/$app" ]; then
        echo -e "${RED}   ❌ apps/$app manquant${NC}"
        validation_errors=$((validation_errors + 1))
    else
        echo -e "${GREEN}   ✅ apps/$app créé${NC}"
    fi
done

# Vérifier l'infrastructure
if [ ! -f "infrastructure/docker/docker-compose.yml" ]; then
    echo -e "${RED}   ❌ infrastructure/docker/docker-compose.yml manquant${NC}"
    validation_errors=$((validation_errors + 1))
else
    echo -e "${GREEN}   ✅ infrastructure/docker configuré${NC}"
fi

# Vérifier les scripts
if [ ! -d "scripts/docker" ] || [ -z "$(ls -A scripts/docker 2>/dev/null)" ]; then
    echo -e "${RED}   ❌ scripts/docker vide${NC}"
    validation_errors=$((validation_errors + 1))
else
    echo -e "${GREEN}   ✅ scripts/docker configuré${NC}"
fi

# Vérifier la documentation
if [ ! -d "docs" ] || [ -z "$(ls -A docs 2>/dev/null)" ]; then
    echo -e "${RED}   ❌ docs vide${NC}"
    validation_errors=$((validation_errors + 1))
else
    echo -e "${GREEN}   ✅ docs organisé${NC}"
fi

echo ""
if [ $validation_errors -eq 0 ]; then
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}  ✅ Réorganisation Réussie !${NC}"
    echo -e "${GREEN}======================================${NC}"
    echo ""
    echo -e "${CYAN}📁 Nouvelle structure créée avec succès${NC}"
    echo -e "${CYAN}🔧 Tous les chemins mis à jour${NC}"
    echo -e "${CYAN}📚 Documentation organisée${NC}"
    echo -e "${CYAN}🐳 Docker configuré${NC}"
    echo ""
    echo -e "${YELLOW}🔄 Prochaines étapes:${NC}"
    echo "1. Testez la nouvelle structure: cd infrastructure/docker && docker-compose up"
    echo "2. Vérifiez que tout fonctionne correctement"
    echo "3. Exécutez ./cleanup-old.sh pour supprimer les anciens dossiers"
    echo "4. Commitez les changements: git add . && git commit -m 'Réorganisation complète du projet'"
    echo ""
    echo -e "${GREEN}🎉 Projet SIO complètement réorganisé !${NC}"
else
    echo -e "${RED}======================================${NC}"
    echo -e "${RED}  ❌ Erreurs de Migration${NC}"
    echo -e "${RED}======================================${NC}"
    echo ""
    echo -e "${YELLOW}$validation_errors erreur(s) détectée(s)${NC}"
    echo "Veuillez corriger les erreurs avant de continuer."
fi



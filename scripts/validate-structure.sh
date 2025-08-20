#!/bin/bash

# =================================================================
# Script de Validation de la Structure Réorganisée
# =================================================================

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Validation Structure SIO Audit${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Compteurs
total_checks=0
passed_checks=0
failed_checks=0
warnings=0

# Fonction de vérification
check_item() {
    local item=$1
    local description=$2
    local type=${3:-"file"}  # file, dir, content
    
    total_checks=$((total_checks + 1))
    
    if [ "$type" = "file" ]; then
        if [ -f "$item" ]; then
            echo -e "${GREEN}   ✅ $description${NC}"
            passed_checks=$((passed_checks + 1))
            return 0
        else
            echo -e "${RED}   ❌ $description${NC}"
            failed_checks=$((failed_checks + 1))
            return 1
        fi
    elif [ "$type" = "dir" ]; then
        if [ -d "$item" ]; then
            echo -e "${GREEN}   ✅ $description${NC}"
            passed_checks=$((passed_checks + 1))
            return 0
        else
            echo -e "${RED}   ❌ $description${NC}"
            failed_checks=$((failed_checks + 1))
            return 1
        fi
    elif [ "$type" = "content" ]; then
        if [ -d "$item" ] && [ "$(ls -A "$item" 2>/dev/null)" ]; then
            echo -e "${GREEN}   ✅ $description${NC}"
            passed_checks=$((passed_checks + 1))
            return 0
        else
            echo -e "${YELLOW}   ⚠️  $description (vide ou absent)${NC}"
            warnings=$((warnings + 1))
            return 1
        fi
    fi
}

# Fonction de vérification avec warning
check_optional() {
    local item=$1
    local description=$2
    local type=${3:-"file"}
    
    if [ "$type" = "file" ]; then
        if [ -f "$item" ]; then
            echo -e "${GREEN}   ✅ $description${NC}"
        else
            echo -e "${YELLOW}   ⚠️  $description (optionnel)${NC}"
            warnings=$((warnings + 1))
        fi
    elif [ "$type" = "dir" ]; then
        if [ -d "$item" ]; then
            echo -e "${GREEN}   ✅ $description${NC}"
        else
            echo -e "${YELLOW}   ⚠️  $description (optionnel)${NC}"
            warnings=$((warnings + 1))
        fi
    fi
}

echo -e "${CYAN}🏗️ Vérification de la structure principale...${NC}"

# Structure racine
check_item "apps" "Dossier applications" "dir"
check_item "infrastructure" "Dossier infrastructure" "dir"
check_item "scripts" "Dossier scripts" "dir"
check_item "docs" "Dossier documentation" "dir"
check_item "storage" "Dossier stockage" "dir"
check_item "config" "Dossier configuration" "dir"

echo ""
echo -e "${CYAN}📱 Vérification des applications...${NC}"

# Applications
check_item "apps/frontend" "Application frontend" "dir"
check_item "apps/backend-api" "Application backend API" "dir"
check_item "apps/backend-python" "Application backend Python" "dir"
check_item "apps/llm-service" "Service LLM" "dir"

# Structure des applications
check_item "apps/frontend/package.json" "Frontend package.json"
check_item "apps/frontend/src" "Frontend source" "content"
check_item "apps/backend-api/package.json" "Backend API package.json"
check_item "apps/backend-api/src" "Backend API source" "content"
check_item "apps/backend-python/requirements.txt" "Backend Python requirements"
check_item "apps/llm-service/requirements.txt" "LLM service requirements"

echo ""
echo -e "${CYAN}🐳 Vérification de l'infrastructure...${NC}"

# Infrastructure Docker
check_item "infrastructure/docker" "Infrastructure Docker" "dir"
check_item "infrastructure/docker/docker-compose.yml" "Docker Compose production"
check_item "infrastructure/docker/docker-compose.dev.yml" "Docker Compose développement"

# Dockerfiles
check_item "apps/frontend/Dockerfile" "Frontend Dockerfile"
check_item "apps/backend-api/Dockerfile" "Backend API Dockerfile"
check_item "apps/backend-python/Dockerfile" "Backend Python Dockerfile"
check_item "apps/llm-service/Dockerfile" "LLM Service Dockerfile"

echo ""
echo -e "${CYAN}📜 Vérification des scripts...${NC}"

# Scripts
check_item "scripts/docker" "Scripts Docker" "content"
check_optional "scripts/deployment" "Scripts déploiement" "dir"
check_optional "scripts/development" "Scripts développement" "dir"
check_optional "scripts/maintenance" "Scripts maintenance" "dir"

echo ""
echo -e "${CYAN}📚 Vérification de la documentation...${NC}"

# Documentation
check_optional "docs/api" "Documentation API" "dir"
check_optional "docs/architecture" "Documentation architecture" "dir"
check_optional "docs/deployment" "Documentation déploiement" "dir"
check_optional "docs/development" "Documentation développement" "dir"

echo ""
echo -e "${CYAN}💾 Vérification du stockage...${NC}"

# Storage
check_item "storage/logs" "Dossier logs" "dir"
check_item "storage/backups" "Dossier sauvegardes" "dir"
check_item "storage/uploads" "Dossier uploads" "dir"
check_item "storage/cache" "Dossier cache" "dir"

echo ""
echo -e "${CYAN}⚙️ Vérification de la configuration...${NC}"

# Configuration
check_item "config/environments" "Configuration environnements" "dir"
check_optional "config/security" "Configuration sécurité" "dir"
check_optional "config/monitoring" "Configuration monitoring" "dir"

# Fichiers racine
check_item "package.json" "Package.json workspace"
check_item "README.md" "README principal"
check_item ".gitignore" "Fichier gitignore"

echo ""
echo -e "${CYAN}🔗 Vérification des liens et dépendances...${NC}"

# Vérifier les chemins dans docker-compose
if [ -f "infrastructure/docker/docker-compose.yml" ]; then
    if grep -q "../apps/" "infrastructure/docker/docker-compose.yml"; then
        echo -e "${GREEN}   ✅ Chemins mis à jour dans docker-compose.yml${NC}"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${RED}   ❌ Chemins non mis à jour dans docker-compose.yml${NC}"
        failed_checks=$((failed_checks + 1))
    fi
    total_checks=$((total_checks + 1))
fi

# Vérifier que les anciens dossiers n'existent plus (si nettoyage effectué)
old_folders=("project" "backend" "backend_python")
cleaned_folders=0
for folder in "${old_folders[@]}"; do
    if [ ! -d "$folder" ]; then
        cleaned_folders=$((cleaned_folders + 1))
    fi
done

if [ $cleaned_folders -eq ${#old_folders[@]} ]; then
    echo -e "${GREEN}   ✅ Anciens dossiers nettoyés${NC}"
elif [ $cleaned_folders -eq 0 ]; then
    echo -e "${YELLOW}   ⚠️  Anciens dossiers encore présents (exécutez cleanup-old.sh)${NC}"
    warnings=$((warnings + 1))
else
    echo -e "${YELLOW}   ⚠️  Nettoyage partiel des anciens dossiers${NC}"
    warnings=$((warnings + 1))
fi

echo ""
echo -e "${CYAN}🧪 Tests de fonctionnement...${NC}"

# Test des commandes Docker Compose
cd infrastructure/docker 2>/dev/null || {
    echo -e "${RED}   ❌ Impossible d'accéder au dossier infrastructure/docker${NC}"
    failed_checks=$((failed_checks + 1))
    total_checks=$((total_checks + 1))
}

if [ -f "docker-compose.yml" ]; then
    if command -v docker-compose &> /dev/null; then
        if docker-compose config &> /dev/null; then
            echo -e "${GREEN}   ✅ Docker Compose configuration valide${NC}"
            passed_checks=$((passed_checks + 1))
        else
            echo -e "${RED}   ❌ Docker Compose configuration invalide${NC}"
            failed_checks=$((failed_checks + 1))
        fi
    else
        echo -e "${YELLOW}   ⚠️  Docker Compose non installé${NC}"
        warnings=$((warnings + 1))
    fi
    total_checks=$((total_checks + 1))
fi

cd - > /dev/null

# Test des scripts
if [ -f "scripts/docker/start.sh" ]; then
    if [ -x "scripts/docker/start.sh" ]; then
        echo -e "${GREEN}   ✅ Scripts Docker exécutables${NC}"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${YELLOW}   ⚠️  Scripts Docker non exécutables${NC}"
        warnings=$((warnings + 1))
    fi
    total_checks=$((total_checks + 1))
fi

echo ""
echo -e "${CYAN}📊 Résumé de la validation...${NC}"

# Calcul des pourcentages
if [ $total_checks -gt 0 ]; then
    success_rate=$((passed_checks * 100 / total_checks))
else
    success_rate=0
fi

echo "   Total des vérifications: $total_checks"
echo "   Réussies: $passed_checks"
echo "   Échouées: $failed_checks"
echo "   Avertissements: $warnings"
echo "   Taux de réussite: $success_rate%"

echo ""

# Résultat final
if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}  ✅ Validation Réussie !${NC}"
    echo -e "${GREEN}======================================${NC}"
    echo ""
    echo -e "${GREEN}🎉 La structure du projet SIO est correctement organisée !${NC}"
    echo ""
    
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}💡 Recommandations:${NC}"
        echo "   • Complétez la documentation manquante"
        echo "   • Exécutez cleanup-old.sh si pas encore fait"
        echo "   • Vérifiez les configurations optionnelles"
        echo ""
    fi
    
    echo -e "${CYAN}🚀 Prochaines étapes:${NC}"
    echo "   1. Testez l'application: cd infrastructure/docker && docker-compose up"
    echo "   2. Vérifiez tous les services"
    echo "   3. Mettez à jour la documentation"
    echo "   4. Commitez les changements"
    
    exit 0
    
elif [ $failed_checks -le 3 ]; then
    echo -e "${YELLOW}======================================${NC}"
    echo -e "${YELLOW}  ⚠️  Validation Partielle${NC}"
    echo -e "${YELLOW}======================================${NC}"
    echo ""
    echo -e "${YELLOW}La structure est globalement correcte mais nécessite quelques ajustements.${NC}"
    echo ""
    echo -e "${CYAN}🔧 Actions recommandées:${NC}"
    echo "   • Corrigez les éléments marqués ❌"
    echo "   • Relancez la validation"
    echo "   • Vérifiez la documentation"
    
    exit 1
    
else
    echo -e "${RED}======================================${NC}"
    echo -e "${RED}  ❌ Validation Échouée${NC}"
    echo -e "${RED}======================================${NC}"
    echo ""
    echo -e "${RED}La structure présente de nombreux problèmes.${NC}"
    echo ""
    echo -e "${CYAN}🚨 Actions requises:${NC}"
    echo "   • Relancez la réorganisation: ./reorganize-project.sh"
    echo "   • Vérifiez les erreurs de migration"
    echo "   • Contactez l'équipe de développement si nécessaire"
    
    exit 2
fi



#!/bin/bash

# =================================================================
# SIO Audit App - Script de configuration Docker
# Configuration initiale pour la dockerisation
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
echo -e "${MAGENTA}  SIO Audit App - Configuration Docker${NC}"
echo -e "${MAGENTA}======================================${NC}"
echo ""

# Fonction de vérification des prérequis
check_prerequisites() {
    echo -e "${YELLOW}1. Vérification des prérequis...${NC}"
    
    local errors=0
    
    # Vérifier Docker
    if command -v docker &> /dev/null; then
        if docker info &> /dev/null; then
            echo -e "${GREEN}   ✅ Docker installé et fonctionnel${NC}"
            echo "      Version: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
        else
            echo -e "${RED}   ❌ Docker installé mais non démarré${NC}"
            echo "      Démarrez Docker Desktop ou le service Docker"
            errors=$((errors + 1))
        fi
    else
        echo -e "${RED}   ❌ Docker non installé${NC}"
        echo "      Installez Docker depuis: https://docs.docker.com/get-docker/"
        errors=$((errors + 1))
    fi
    
    # Vérifier Docker Compose
    if command -v docker-compose &> /dev/null; then
        echo -e "${GREEN}   ✅ Docker Compose installé${NC}"
        echo "      Version: $(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)"
    else
        echo -e "${RED}   ❌ Docker Compose non installé${NC}"
        echo "      Installez Docker Compose depuis: https://docs.docker.com/compose/install/"
        errors=$((errors + 1))
    fi
    
    # Vérifier Git (optionnel)
    if command -v git &> /dev/null; then
        echo -e "${GREEN}   ✅ Git installé${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Git non installé (optionnel)${NC}"
    fi
    
    # Vérifier curl (pour les health checks)
    if command -v curl &> /dev/null; then
        echo -e "${GREEN}   ✅ curl installé${NC}"
    else
        echo -e "${YELLOW}   ⚠️  curl non installé (recommandé)${NC}"
        echo "      Installez curl pour les tests de santé"
    fi
    
    return $errors
}

# Configuration des permissions
setup_permissions() {
    echo -e "${YELLOW}2. Configuration des permissions...${NC}"
    
    # Rendre tous les scripts exécutables
    if [ -d "scripts" ]; then
        echo -e "${BLUE}   📝 Scripts dans le dossier scripts/...${NC}"
        chmod +x scripts/*.sh
        echo -e "${GREEN}   ✅ Scripts rendus exécutables${NC}"
    fi
    
    # Scripts à la racine
    for script in quick-start.sh docker-manager.sh setup-docker.sh; do
        if [ -f "$script" ]; then
            chmod +x "$script"
            echo -e "${GREEN}   ✅ $script rendu exécutable${NC}"
        fi
    done
    
    # Vérifier les permissions Docker (Linux/macOS)
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if groups $USER | grep -q docker; then
            echo -e "${GREEN}   ✅ Utilisateur dans le groupe docker${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Utilisateur pas dans le groupe docker${NC}"
            echo "      Exécutez: sudo usermod -aG docker \$USER"
            echo "      Puis redémarrez votre session"
        fi
    fi
}

# Configuration des fichiers d'environnement
setup_environment() {
    echo -e "${YELLOW}3. Configuration des fichiers d'environnement...${NC}"
    
    # Fichier principal .env
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            echo -e "${GREEN}   ✅ Fichier .env créé depuis env.example${NC}"
            echo -e "${CYAN}   📝 Modifiez .env avec vos paramètres${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Fichier env.example introuvable${NC}"
        fi
    else
        echo -e "${GREEN}   ✅ Fichier .env existe déjà${NC}"
    fi
    
    # Fichier backend Python
    if [ ! -f "backend_python/.env" ]; then
        if [ -f "backend_python/env.example" ]; then
            cp backend_python/env.example backend_python/.env
            echo -e "${GREEN}   ✅ Fichier backend_python/.env créé${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Fichier backend_python/env.example introuvable${NC}"
        fi
    else
        echo -e "${GREEN}   ✅ Fichier backend_python/.env existe déjà${NC}"
    fi
}

# Vérification des fichiers Docker
check_docker_files() {
    echo -e "${YELLOW}4. Vérification des fichiers Docker...${NC}"
    
    local files=(
        "docker-compose.yml:Production"
        "docker-compose.dev.yml:Développement"
        "project/Dockerfile:Frontend"
        "backend/Dockerfile:Backend Node.js"
        "backend_python/Dockerfile:Backend Python"
        "backend/llm-prototype/Dockerfile:Service LLM"
    )
    
    for file_info in "${files[@]}"; do
        IFS=':' read -r file desc <<< "$file_info"
        if [ -f "$file" ]; then
            echo -e "${GREEN}   ✅ $desc: $file${NC}"
        else
            echo -e "${RED}   ❌ $desc: $file manquant${NC}"
        fi
    done
}

# Configuration des dossiers
setup_directories() {
    echo -e "${YELLOW}5. Configuration des dossiers...${NC}"
    
    local dirs=(
        "logs:Logs de l'application"
        "backup:Sauvegardes"
        "data:Données persistantes"
    )
    
    for dir_info in "${dirs[@]}"; do
        IFS=':' read -r dir desc <<< "$dir_info"
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            echo -e "${GREEN}   ✅ Dossier $desc créé: $dir${NC}"
        else
            echo -e "${GREEN}   ✅ Dossier $desc existe: $dir${NC}"
        fi
    done
    
    # .dockerignore files
    echo -e "${BLUE}   📝 Vérification des fichiers .dockerignore...${NC}"
    local dockerignore_files=(
        ".dockerignore:Racine"
        "project/.dockerignore:Frontend" 
        "backend/.dockerignore:Backend Node.js"
        "backend_python/.dockerignore:Backend Python"
        "backend/llm-prototype/.dockerignore:Service LLM"
    )
    
    for file_info in "${dockerignore_files[@]}"; do
        IFS=':' read -r file desc <<< "$file_info"
        if [ -f "$file" ]; then
            echo -e "${GREEN}      ✅ $desc: $file${NC}"
        else
            echo -e "${YELLOW}      ⚠️  $desc: $file manquant${NC}"
        fi
    done
}

# Test de fonctionnement de base
test_basic_functionality() {
    echo -e "${YELLOW}6. Test de fonctionnement de base...${NC}"
    
    # Test du script principal
    if [ -f "scripts/sio-docker.sh" ]; then
        echo -e "${BLUE}   🧪 Test du script principal...${NC}"
        if ./scripts/sio-docker.sh version &> /dev/null; then
            echo -e "${GREEN}   ✅ Script principal fonctionnel${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Problème avec le script principal${NC}"
        fi
    fi
    
    # Test Docker Compose
    echo -e "${BLUE}   🧪 Test des fichiers Docker Compose...${NC}"
    if [ -f "docker-compose.yml" ]; then
        if docker-compose -f docker-compose.yml config &> /dev/null; then
            echo -e "${GREEN}   ✅ docker-compose.yml valide${NC}"
        else
            echo -e "${RED}   ❌ Erreur dans docker-compose.yml${NC}"
        fi
    fi
    
    if [ -f "docker-compose.dev.yml" ]; then
        if docker-compose -f docker-compose.dev.yml config &> /dev/null; then
            echo -e "${GREEN}   ✅ docker-compose.dev.yml valide${NC}"
        else
            echo -e "${RED}   ❌ Erreur dans docker-compose.dev.yml${NC}"
        fi
    fi
}

# Affichage des informations finales
show_final_info() {
    echo ""
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}  ✅ Configuration terminée${NC}"
    echo -e "${GREEN}======================================${NC}"
    echo ""
    
    echo -e "${CYAN}🚀 Commandes pour commencer:${NC}"
    echo ""
    echo -e "${BLUE}Démarrage rapide:${NC}"
    echo "  ./quick-start.sh                 # Assistant de démarrage"
    echo ""
    echo -e "${BLUE}Ou utilisation manuelle:${NC}"
    echo "  ./scripts/sio-docker.sh start    # Démarrer en production"
    echo "  ./scripts/sio-docker.sh start dev # Démarrer en développement"
    echo "  ./scripts/sio-docker.sh help     # Voir toutes les commandes"
    echo ""
    echo -e "${BLUE}Scripts individuels:${NC}"
    echo "  ./scripts/start.sh               # Démarrer"
    echo "  ./scripts/logs.sh                # Voir les logs"
    echo "  ./scripts/status.sh              # État des services"
    echo "  ./scripts/stop.sh                # Arrêter"
    echo ""
    
    echo -e "${CYAN}📚 Documentation:${NC}"
    echo "  DOCKER_README.md                 # Guide Docker complet"
    echo "  DEPLOYMENT_GUIDE.md              # Guide de déploiement"
    echo "  scripts/README.md                # Guide des scripts"
    echo ""
    
    echo -e "${CYAN}🌐 URLs d'accès (après démarrage):${NC}"
    echo "  Production:"
    echo "    Frontend:           http://localhost:80"
    echo "  Développement:"
    echo "    Frontend:           http://localhost:5173"
    echo "    Adminer (DB):       http://localhost:8080"
    echo "  Commun:"
    echo "    Backend Node.js:    http://localhost:4000"
    echo "    Backend Python:     http://localhost:8000" 
    echo "    Service LLM:        http://localhost:8001"
    echo ""
    
    if [ -f ".env" ]; then
        echo -e "${YELLOW}⚠️  Important:${NC}"
        echo "   Modifiez les fichiers .env avec vos paramètres avant le démarrage"
        echo "   Notamment les mots de passe Oracle et MongoDB"
    fi
    
    echo ""
    echo -e "${GREEN}🎯 Configuration SIO Audit App terminée avec succès!${NC}"
}

# Fonction principale
main() {
    local errors=0
    
    # Vérification des prérequis
    if ! check_prerequisites; then
        errors=$((errors + 1))
    fi
    
    # Configuration seulement si les prérequis sont OK
    if [ $errors -eq 0 ]; then
        setup_permissions
        setup_environment
        check_docker_files
        setup_directories
        test_basic_functionality
        show_final_info
    else
        echo ""
        echo -e "${RED}❌ Configuration interrompue en raison de prérequis manquants${NC}"
        echo -e "${YELLOW}Installez les composants requis et relancez ce script${NC}"
        exit 1
    fi
}

# Gestion des arguments
case "${1:-}" in
    "--help"|"-h")
        echo "Script de configuration Docker pour SIO Audit App"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h    Afficher cette aide"
        echo "  --check-only  Vérifier seulement les prérequis"
        echo ""
        echo "Ce script configure automatiquement:"
        echo "  - Permissions des scripts"
        echo "  - Fichiers d'environnement"
        echo "  - Dossiers nécessaires"
        echo "  - Tests de base"
        exit 0
        ;;
    "--check-only")
        check_prerequisites
        exit $?
        ;;
    "")
        main
        ;;
    *)
        echo -e "${RED}Option inconnue: $1${NC}"
        echo "Utilisez --help pour voir les options disponibles"
        exit 1
        ;;
esac



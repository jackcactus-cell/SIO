#!/bin/bash

# Script de Démarrage SIO
# Auteur: Assistant IA

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}📋 $1${NC}"
    echo "============================================="
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --build, -b           - Reconstruire les images avant démarrage"
    echo "  --force, -f           - Forcer le redémarrage (arrêt puis démarrage)"
    echo "  --help, -h            - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                    # Démarrage normal"
    echo "  $0 --build            # Reconstruire et démarrer"
    echo "  $0 --force            # Forcer le redémarrage"
}

# Variables
BUILD=false
FORCE=false

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --build|-b)
            BUILD=true
            shift
            ;;
        --force|-f)
            FORCE=true
            shift
            ;;
        *)
            print_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Vérifications
if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose n'est pas installé"
    exit 1
fi

if [ ! -f "config/docker/docker-compose.yml" ]; then
    print_error "Fichier docker-compose.yml non trouvé"
    exit 1
fi

# Vérifier si les services sont déjà en cours d'exécution
check_running_services() {
    local running_services=$(docker-compose -f config/docker/docker-compose.yml ps --services --filter "status=running" 2>/dev/null || echo "")
    if [ -n "$running_services" ]; then
        print_warning "Des services sont déjà en cours d'exécution"
        echo "Services actifs:"
        echo "$running_services" | while read -r service; do
            if [ -n "$service" ]; then
                echo "  • $service"
            fi
        done
        
        if [ "$FORCE" = false ]; then
            echo ""
            read -p "Voulez-vous continuer ? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "Démarrage annulé"
                exit 0
            fi
        fi
    fi
}

# Arrêter les services existants
stop_existing_services() {
    print_header "Arrêt des Services Existants"
    
    print_step "Arrêt des conteneurs"
    docker-compose -f config/docker/docker-compose.yml down 2>/dev/null || true
    
    print_info "Services arrêtés"
}

# Construire les images si demandé
build_images() {
    if [ "$BUILD" = true ]; then
        print_header "Construction des Images"
        
        print_step "Construction de l'image Frontend"
        docker build -t sio-frontend:latest ./project
        
        print_step "Construction de l'image Backend Node.js"
        docker build -t sio-backend-node:latest ./backend
        
        print_step "Construction de l'image Backend Python"
        docker build -t sio-backend-python:latest ./backend_python
        
        print_step "Construction de l'image Backend LLM"
        docker build -t sio-backend-llm:latest ./backend/llm-prototype
        
        print_info "Images construites avec succès"
    fi
}

# Démarrer les services
start_services() {
    print_header "Démarrage des Services"
    
    print_step "Démarrage des conteneurs"
    docker-compose -f config/docker/docker-compose.yml up -d
    
    print_step "Attente du démarrage des services"
    sleep 30
    
    print_info "Services démarrés"
}

# Vérifier l'état des services
verify_services() {
    print_header "Vérification des Services"
    
    print_step "État des conteneurs"
    docker-compose -f config/docker/docker-compose.yml ps
    
    print_step "Test de connectivité"
    
    # Test Frontend
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        print_info "Frontend accessible sur http://localhost"
    else
        print_warning "Frontend non accessible"
    fi
    
    # Test Backend Node.js
    if curl -f http://localhost:4000/health > /dev/null 2>&1; then
        print_info "Backend Node.js accessible sur http://localhost:4000"
    else
        print_warning "Backend Node.js non accessible"
    fi
    
    # Test Backend Python
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_info "Backend Python accessible sur http://localhost:8000"
    else
        print_warning "Backend Python non accessible"
    fi
    
    # Test Backend LLM
    if curl -f http://localhost:8001/health > /dev/null 2>&1; then
        print_info "Backend LLM accessible sur http://localhost:8001"
    else
        print_warning "Backend LLM non accessible"
    fi
    
    # Test MongoDB
    if docker exec sio_mongodb_prod mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        print_info "MongoDB accessible"
    else
        print_warning "MongoDB non accessible"
    fi
}

# Affichage des informations finales
show_final_info() {
    print_header "Démarrage Terminé"
    
    echo -e "${GREEN}🎉 Vos services SIO sont maintenant démarrés !${NC}"
    echo ""
    echo -e "${CYAN}📊 Services disponibles :${NC}"
    echo "   Frontend:     http://localhost"
    echo "   Backend Node.js: http://localhost:4000"
    echo "   Backend Python:  http://localhost:8000"
    echo "   Backend LLM:     http://localhost:8001"
    echo "   MongoDB:         localhost:27017"
    echo ""
    echo -e "${PURPLE}🔧 Commandes utiles :${NC}"
    echo "   ./scripts/status.sh    # Vérifier l'état"
    echo "   ./scripts/logs.sh      # Voir les logs"
    echo "   ./scripts/stop.sh      # Arrêter les services"
    echo "   ./scripts/restart.sh   # Redémarrer les services"
}

# Fonction principale
main() {
    echo -e "${BLUE}🚀 Démarrage des Services SIO${NC}"
    echo "============================================="
    echo ""
    
    check_running_services
    
    if [ "$FORCE" = true ]; then
        stop_existing_services
    fi
    
    build_images
    start_services
    verify_services
    show_final_info
}

# Exécution du script
main "$@"



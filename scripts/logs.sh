#!/bin/bash

# Script de Logs SIO
# Auteur: Assistant IA

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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
    echo "Usage: $0 [service] [options]"
    echo ""
    echo "Services:"
    echo "  all                    - Tous les services (défaut)"
    echo "  frontend               - Frontend React"
    echo "  backend-node           - Backend Node.js"
    echo "  backend-python         - Backend Python"
    echo "  backend-llm            - Backend LLM"
    echo "  mongodb                - MongoDB"
    echo ""
    echo "Options:"
    echo "  --follow, -f           - Suivre les logs en temps réel"
    echo "  --tail N, -t N         - Afficher les N dernières lignes (défaut: 50)"
    echo "  --since TIME           - Logs depuis TIME (ex: 1h, 30m, 2024-01-01)"
    echo "  --help, -h             - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                     # Logs de tous les services"
    echo "  $0 frontend            # Logs du frontend"
    echo "  $0 --follow            # Suivre tous les logs"
    echo "  $0 backend-python -t 100  # 100 dernières lignes du backend Python"
}

# Variables par défaut
SERVICE="all"
FOLLOW=false
TAIL_LINES=50
SINCE=""

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --follow|-f)
            FOLLOW=true
            shift
            ;;
        --tail|-t)
            TAIL_LINES="$2"
            shift 2
            ;;
        --since)
            SINCE="$2"
            shift 2
            ;;
        all|frontend|backend-node|backend-python|backend-llm|mongodb)
            SERVICE="$1"
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

# Construction des options Docker
DOCKER_OPTS="--tail $TAIL_LINES"
if [ "$FOLLOW" = true ]; then
    DOCKER_OPTS="$DOCKER_OPTS --follow"
fi
if [ -n "$SINCE" ]; then
    DOCKER_OPTS="$DOCKER_OPTS --since $SINCE"
fi

# Fonction pour afficher les logs d'un service
show_service_logs() {
    local service_name="$1"
    local container_name="$2"
    
    print_header "Logs de $service_name"
    
    if docker ps | grep -q "$container_name"; then
        docker logs $DOCKER_OPTS "$container_name" 2>/dev/null || print_warning "Impossible de récupérer les logs"
    else
        print_warning "Conteneur $container_name non trouvé ou arrêté"
    fi
    
    echo ""
}

# Affichage principal
echo -e "${BLUE}📋 Logs des Services SIO${NC}"
echo "============================================="
echo ""

if [ "$FOLLOW" = true ]; then
    echo -e "${CYAN}🔄 Mode suivi en temps réel activé (Ctrl+C pour arrêter)${NC}"
    echo ""
fi

# Affichage selon le service demandé
case $SERVICE in
    all)
        show_service_logs "Frontend" "sio_frontend_prod"
        show_service_logs "Backend Node.js" "sio_backend_node_prod"
        show_service_logs "Backend Python" "sio_backend_python_prod"
        show_service_logs "Backend LLM" "sio_backend_llm_prod"
        show_service_logs "MongoDB" "sio_mongodb_prod"
        ;;
    frontend)
        show_service_logs "Frontend" "sio_frontend_prod"
        ;;
    backend-node)
        show_service_logs "Backend Node.js" "sio_backend_node_prod"
        ;;
    backend-python)
        show_service_logs "Backend Python" "sio_backend_python_prod"
        ;;
    backend-llm)
        show_service_logs "Backend LLM" "sio_backend_llm_prod"
        ;;
    mongodb)
        show_service_logs "MongoDB" "sio_mongodb_prod"
        ;;
    *)
        print_error "Service inconnu: $SERVICE"
        show_help
        exit 1
        ;;
esac

print_info "Logs affichés avec succès"



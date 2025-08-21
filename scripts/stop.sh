#!/bin/bash

# Script d'Arrêt SIO
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
    echo "  --force, -f           - Forcer l'arrêt (kill)"
    echo "  --volumes, -v         - Supprimer aussi les volumes"
    echo "  --images, -i          - Supprimer aussi les images"
    echo "  --all, -a             - Arrêt complet (volumes + images)"
    echo "  --help, -h            - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                    # Arrêt normal"
    echo "  $0 --force            # Forcer l'arrêt"
    echo "  $0 --volumes          # Arrêter et supprimer les volumes"
    echo "  $0 --all              # Arrêt complet"
}

# Variables
FORCE=false
REMOVE_VOLUMES=false
REMOVE_IMAGES=false

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --force|-f)
            FORCE=true
            shift
            ;;
        --volumes|-v)
            REMOVE_VOLUMES=true
            shift
            ;;
        --images|-i)
            REMOVE_IMAGES=true
            shift
            ;;
        --all|-a)
            REMOVE_VOLUMES=true
            REMOVE_IMAGES=true
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

# Vérifier si des services sont en cours d'exécution
check_running_services() {
    local running_services=$(docker-compose -f config/docker/docker-compose.yml ps --services --filter "status=running" 2>/dev/null || echo "")
    if [ -z "$running_services" ]; then
        print_warning "Aucun service SIO n'est en cours d'exécution"
        return 1
    fi
    return 0
}

# Arrêter les services
stop_services() {
    print_header "Arrêt des Services"
    
    if [ "$FORCE" = true ]; then
        print_step "Arrêt forcé des conteneurs"
        docker-compose -f config/docker/docker-compose.yml kill 2>/dev/null || true
    else
        print_step "Arrêt gracieux des conteneurs"
        docker-compose -f config/docker/docker-compose.yml stop 2>/dev/null || true
    fi
    
    print_step "Suppression des conteneurs"
    docker-compose -f config/docker/docker-compose.yml down 2>/dev/null || true
    
    print_info "Services arrêtés"
}

# Supprimer les volumes si demandé
remove_volumes() {
    if [ "$REMOVE_VOLUMES" = true ]; then
        print_header "Suppression des Volumes"
        
        print_step "Suppression des volumes SIO"
        docker volume rm sio_mongodb_data sio_backend_data sio_python_logs sio_python_cache 2>/dev/null || true
        
        print_info "Volumes supprimés"
    fi
}

# Supprimer les images si demandé
remove_images() {
    if [ "$REMOVE_IMAGES" = true ]; then
        print_header "Suppression des Images"
        
        print_step "Suppression des images SIO"
        docker rmi sio-frontend:latest sio-backend-node:latest sio-backend-python:latest sio-backend-llm:latest 2>/dev/null || true
        
        print_info "Images supprimées"
    fi
}

# Nettoyer les ressources Docker
cleanup_docker() {
    print_header "Nettoyage Docker"
    
    print_step "Suppression des conteneurs arrêtés"
    docker container prune -f 2>/dev/null || true
    
    print_step "Suppression des réseaux non utilisés"
    docker network prune -f 2>/dev/null || true
    
    if [ "$REMOVE_VOLUMES" = true ]; then
        print_step "Suppression des volumes non utilisés"
        docker volume prune -f 2>/dev/null || true
    fi
    
    print_info "Nettoyage terminé"
}

# Vérifier l'état final
verify_stop() {
    print_header "Vérification de l'Arrêt"
    
    local running_services=$(docker-compose -f config/docker/docker-compose.yml ps --services --filter "status=running" 2>/dev/null || echo "")
    
    if [ -z "$running_services" ]; then
        print_info "Tous les services SIO sont arrêtés"
    else
        print_warning "Certains services sont encore en cours d'exécution:"
        echo "$running_services" | while read -r service; do
            if [ -n "$service" ]; then
                echo "  • $service"
            fi
        done
    fi
    
    # Vérifier les ports
    echo ""
    print_step "Vérification des ports"
    
    local ports=(80 4000 8000 8001 27017)
    for port in "${ports[@]}"; do
        if netstat -tulpn 2>/dev/null | grep -q ":$port "; then
            print_warning "Port $port encore utilisé"
        else
            print_info "Port $port libre"
        fi
    done
}

# Affichage des informations finales
show_final_info() {
    print_header "Arrêt Terminé"
    
    echo -e "${GREEN}🎉 Vos services SIO ont été arrêtés !${NC}"
    echo ""
    
    if [ "$REMOVE_VOLUMES" = true ]; then
        echo -e "${YELLOW}⚠️  ATTENTION : Les volumes ont été supprimés${NC}"
        echo "   Les données MongoDB ont été perdues"
    fi
    
    if [ "$REMOVE_IMAGES" = true ]; then
        echo -e "${YELLOW}⚠️  ATTENTION : Les images ont été supprimées${NC}"
        echo "   Vous devrez les reconstruire au prochain démarrage"
    fi
    
    echo ""
    echo -e "${PURPLE}🔧 Commandes utiles :${NC}"
    echo "   ./scripts/start.sh    # Redémarrer les services"
    echo "   ./scripts/status.sh   # Vérifier l'état"
    echo "   docker ps             # Voir tous les conteneurs"
    echo "   docker volume ls      # Voir les volumes"
    echo "   docker image ls       # Voir les images"
}

# Fonction principale
main() {
    echo -e "${BLUE}🛑 Arrêt des Services SIO${NC}"
    echo "============================================="
    echo ""
    
    # Vérifier si des services sont en cours d'exécution
    if ! check_running_services; then
        print_info "Aucun service à arrêter"
        exit 0
    fi
    
    # Confirmation pour les actions destructives
    if [ "$REMOVE_VOLUMES" = true ] || [ "$REMOVE_IMAGES" = true ]; then
        echo -e "${YELLOW}⚠️  ATTENTION : Actions destructives demandées${NC}"
        if [ "$REMOVE_VOLUMES" = true ]; then
            echo "   - Suppression des volumes (données perdues)"
        fi
        if [ "$REMOVE_IMAGES" = true ]; then
            echo "   - Suppression des images"
        fi
        echo ""
        read -p "Êtes-vous sûr de vouloir continuer ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Arrêt annulé"
            exit 0
        fi
    fi
    
    stop_services
    remove_volumes
    remove_images
    cleanup_docker
    verify_stop
    show_final_info
}

# Exécution du script
main "$@"



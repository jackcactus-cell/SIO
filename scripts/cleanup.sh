#!/bin/bash

# Script de Nettoyage SIO
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

print_step() {
    echo -e "${CYAN}🔧 $1${NC}"
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --containers, -c      - Supprimer les conteneurs arrêtés"
    echo "  --images, -i          - Supprimer les images non utilisées"
    echo "  --volumes, -v         - Supprimer les volumes non utilisés"
    echo "  --networks, -n        - Supprimer les réseaux non utilisés"
    echo "  --all, -a             - Nettoyage complet (tout supprimer)"
    echo "  --force, -f           - Forcer sans confirmation"
    echo "  --help, -h            - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                    # Nettoyage sécurisé"
    echo "  $0 --all              # Nettoyage complet"
    echo "  $0 --containers --images  # Conteneurs et images"
    echo "  $0 --all --force      # Nettoyage complet sans confirmation"
}

# Variables
CLEAN_CONTAINERS=false
CLEAN_IMAGES=false
CLEAN_VOLUMES=false
CLEAN_NETWORKS=false
FORCE=false

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --containers|-c)
            CLEAN_CONTAINERS=true
            shift
            ;;
        --images|-i)
            CLEAN_IMAGES=true
            shift
            ;;
        --volumes|-v)
            CLEAN_VOLUMES=true
            shift
            ;;
        --networks|-n)
            CLEAN_NETWORKS=true
            shift
            ;;
        --all|-a)
            CLEAN_CONTAINERS=true
            CLEAN_IMAGES=true
            CLEAN_VOLUMES=true
            CLEAN_NETWORKS=true
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

# Vérifier si des services SIO sont en cours d'exécution
check_sio_services() {
    local running_services=$(docker ps --filter "name=sio" --format "{{.Names}}" 2>/dev/null || echo "")
    if [ -n "$running_services" ]; then
        print_warning "Des services SIO sont en cours d'exécution:"
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
                print_info "Nettoyage annulé"
                exit 0
            fi
        fi
    fi
}

# Nettoyer les conteneurs
clean_containers() {
    if [ "$CLEAN_CONTAINERS" = true ]; then
        print_header "Nettoyage des Conteneurs"
        
        local stopped_containers=$(docker ps -a --filter "status=exited" --filter "status=created" -q 2>/dev/null || echo "")
        
        if [ -n "$stopped_containers" ]; then
            print_step "Suppression des conteneurs arrêtés"
            echo "$stopped_containers" | xargs docker rm -f 2>/dev/null || true
            print_info "Conteneurs arrêtés supprimés"
        else
            print_info "Aucun conteneur arrêté à supprimer"
        fi
    fi
}

# Nettoyer les images
clean_images() {
    if [ "$CLEAN_IMAGES" = true ]; then
        print_header "Nettoyage des Images"
        
        local dangling_images=$(docker images -f "dangling=true" -q 2>/dev/null || echo "")
        
        if [ -n "$dangling_images" ]; then
            print_step "Suppression des images non utilisées"
            echo "$dangling_images" | xargs docker rmi -f 2>/dev/null || true
            print_info "Images non utilisées supprimées"
        else
            print_info "Aucune image non utilisée à supprimer"
        fi
        
        # Supprimer les images SIO si elles ne sont pas utilisées
        local sio_images=$(docker images --filter "reference=sio*" --format "{{.Repository}}:{{.Tag}}" 2>/dev/null || echo "")
        
        if [ -n "$sio_images" ]; then
            print_step "Suppression des images SIO non utilisées"
            echo "$sio_images" | while read -r image; do
                if [ -n "$image" ]; then
                    docker rmi "$image" 2>/dev/null || print_warning "Impossible de supprimer $image"
                fi
            done
            print_info "Images SIO non utilisées supprimées"
        fi
    fi
}

# Nettoyer les volumes
clean_volumes() {
    if [ "$CLEAN_VOLUMES" = true ]; then
        print_header "Nettoyage des Volumes"
        
        # Vérifier si des volumes SIO sont utilisés
        local sio_volumes=("sio_mongodb_data" "sio_backend_data" "sio_python_logs" "sio_python_cache")
        
        for volume in "${sio_volumes[@]}"; do
            if docker volume ls | grep -q "$volume"; then
                if [ "$FORCE" = false ]; then
                    echo ""
                    read -p "Supprimer le volume $volume ? (y/N): " -n 1 -r
                    echo
                    if [[ $REPLY =~ ^[Yy]$ ]]; then
                        docker volume rm "$volume" 2>/dev/null || print_warning "Impossible de supprimer $volume"
                        print_info "Volume $volume supprimé"
                    else
                        print_info "Volume $volume conservé"
                    fi
                else
                    docker volume rm "$volume" 2>/dev/null || print_warning "Impossible de supprimer $volume"
                    print_info "Volume $volume supprimé"
                fi
            fi
        done
        
        # Supprimer les volumes non utilisés
        local unused_volumes=$(docker volume ls -q -f "dangling=true" 2>/dev/null || echo "")
        
        if [ -n "$unused_volumes" ]; then
            print_step "Suppression des volumes non utilisés"
            echo "$unused_volumes" | xargs docker volume rm 2>/dev/null || true
            print_info "Volumes non utilisés supprimés"
        fi
    fi
}

# Nettoyer les réseaux
clean_networks() {
    if [ "$CLEAN_NETWORKS" = true ]; then
        print_header "Nettoyage des Réseaux"
        
        local unused_networks=$(docker network ls --filter "type=custom" -q 2>/dev/null || echo "")
        
        if [ -n "$unused_networks" ]; then
            print_step "Suppression des réseaux non utilisés"
            echo "$unused_networks" | xargs docker network rm 2>/dev/null || true
            print_info "Réseaux non utilisés supprimés"
        else
            print_info "Aucun réseau non utilisé à supprimer"
        fi
    fi
}

# Nettoyer les logs
clean_logs() {
    print_header "Nettoyage des Logs"
    
    # Nettoyer les logs Docker
    if [ -d "/var/lib/docker/containers" ]; then
        print_step "Nettoyage des logs Docker"
        sudo find /var/lib/docker/containers/ -name "*-json.log" -exec truncate -s 0 {} \; 2>/dev/null || true
        print_info "Logs Docker nettoyés"
    fi
    
    # Nettoyer les logs de l'application
    if [ -d "logs" ]; then
        print_step "Nettoyage des logs de l'application"
        find logs/ -name "*.log" -size +100M -exec truncate -s 0 {} \; 2>/dev/null || true
        print_info "Logs de l'application nettoyés"
    fi
}

# Nettoyer le cache
clean_cache() {
    print_header "Nettoyage du Cache"
    
    # Nettoyer le cache Docker
    print_step "Nettoyage du cache Docker"
    docker system prune -f 2>/dev/null || true
    print_info "Cache Docker nettoyé"
    
    # Nettoyer le cache de l'application
    if [ -d "cache" ]; then
        print_step "Nettoyage du cache de l'application"
        rm -rf cache/* 2>/dev/null || true
        print_info "Cache de l'application nettoyé"
    fi
}

# Afficher les statistiques
show_statistics() {
    print_header "Statistiques après Nettoyage"
    
    echo -e "${CYAN}📊 Espace libéré :${NC}"
    docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}"
    
    echo ""
    echo -e "${CYAN}📁 Conteneurs :${NC}"
    echo "   Actifs: $(docker ps -q | wc -l)"
    echo "   Arrêtés: $(docker ps -a --filter "status=exited" -q | wc -l)"
    
    echo ""
    echo -e "${CYAN}🖼️  Images :${NC}"
    echo "   Total: $(docker images -q | wc -l)"
    echo "   Non utilisées: $(docker images -f "dangling=true" -q | wc -l)"
    
    echo ""
    echo -e "${CYAN}💾 Volumes :${NC}"
    echo "   Total: $(docker volume ls -q | wc -l)"
    echo "   Non utilisés: $(docker volume ls -q -f "dangling=true" | wc -l)"
    
    echo ""
    echo -e "${CYAN}🌐 Réseaux :${NC}"
    echo "   Total: $(docker network ls -q | wc -l)"
    echo "   Non utilisés: $(docker network ls --filter "type=custom" -q | wc -l)"
}

# Fonction principale
main() {
    echo -e "${BLUE}🧹 Nettoyage SIO${NC}"
    echo "============================================="
    echo ""
    
    # Vérifier si des services SIO sont en cours d'exécution
    check_sio_services
    
    # Confirmation pour le nettoyage complet
    if [ "$CLEAN_VOLUMES" = true ] && [ "$FORCE" = false ]; then
        echo -e "${YELLOW}⚠️  ATTENTION : Suppression des volumes demandée${NC}"
        echo "   Cela supprimera définitivement les données MongoDB"
        echo ""
        read -p "Êtes-vous sûr de vouloir continuer ? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Nettoyage annulé"
            exit 0
        fi
    fi
    
    # Effectuer le nettoyage
    clean_containers
    clean_images
    clean_volumes
    clean_networks
    clean_logs
    clean_cache
    
    # Afficher les statistiques
    show_statistics
    
    # Affichage final
    print_header "Nettoyage Terminé"
    
    echo -e "${GREEN}🎉 Nettoyage effectué avec succès !${NC}"
    echo ""
    echo -e "${PURPLE}🔧 Commandes utiles :${NC}"
    echo "   ./scripts/start.sh    # Redémarrer les services"
    echo "   ./scripts/status.sh   # Vérifier l'état"
    echo "   docker system df      # Voir l'utilisation de l'espace"
}

# Exécution du script
main "$@"



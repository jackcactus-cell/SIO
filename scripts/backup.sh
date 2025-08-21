#!/bin/bash

# Script de Sauvegarde SIO
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
    echo "  --full, -f            - Sauvegarde complète (MongoDB + volumes)"
    echo "  --mongodb, -m         - Sauvegarde MongoDB uniquement"
    echo "  --volumes, -v         - Sauvegarde des volumes uniquement"
    echo "  --compress, -c        - Compresser la sauvegarde"
    echo "  --help, -h            - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                    # Sauvegarde automatique"
    echo "  $0 --full             # Sauvegarde complète"
    echo "  $0 --mongodb --compress  # MongoDB compressé"
}

# Variables
BACKUP_TYPE="auto"
COMPRESS=false

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --full|-f)
            BACKUP_TYPE="full"
            shift
            ;;
        --mongodb|-m)
            BACKUP_TYPE="mongodb"
            shift
            ;;
        --volumes|-v)
            BACKUP_TYPE="volumes"
            shift
            ;;
        --compress|-c)
            COMPRESS=true
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

# Créer le dossier de sauvegarde
create_backup_dir() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="backups/sio_backup_$timestamp"
    
    mkdir -p "$backup_dir"
    echo "$backup_dir"
}

# Sauvegarder MongoDB
backup_mongodb() {
    local backup_dir="$1"
    
    print_step "Sauvegarde de MongoDB"
    
    if docker ps | grep -q "sio_mongodb_prod"; then
        # Créer le dossier de sauvegarde MongoDB
        mkdir -p "$backup_dir/mongodb"
        
        # Sauvegarder MongoDB
        if docker exec sio_mongodb_prod mongodump --out /tmp/mongodb_backup 2>/dev/null; then
            docker cp sio_mongodb_prod:/tmp/mongodb_backup "$backup_dir/mongodb/"
            print_info "MongoDB sauvegardé avec succès"
        else
            print_warning "Échec de la sauvegarde MongoDB"
        fi
    else
        print_warning "MongoDB n'est pas en cours d'exécution"
    fi
}

# Sauvegarder les volumes
backup_volumes() {
    local backup_dir="$1"
    
    print_step "Sauvegarde des volumes"
    
    # Créer le dossier de sauvegarde des volumes
    mkdir -p "$backup_dir/volumes"
    
    # Liste des volumes à sauvegarder
    local volumes=("sio_mongodb_data" "sio_backend_data" "sio_python_logs" "sio_python_cache")
    
    for volume in "${volumes[@]}"; do
        if docker volume ls | grep -q "$volume"; then
            print_step "Sauvegarde du volume $volume"
            
            # Créer un conteneur temporaire pour sauvegarder le volume
            docker run --rm -v "$volume":/data -v "$backup_dir/volumes":/backup alpine tar czf "/backup/${volume}.tar.gz" -C /data . 2>/dev/null || true
            
            if [ -f "$backup_dir/volumes/${volume}.tar.gz" ]; then
                print_info "Volume $volume sauvegardé"
            else
                print_warning "Échec de la sauvegarde du volume $volume"
            fi
        else
            print_warning "Volume $volume non trouvé"
        fi
    done
}

# Sauvegarder les fichiers de configuration
backup_config() {
    local backup_dir="$1"
    
    print_step "Sauvegarde des fichiers de configuration"
    
    # Créer le dossier de configuration
    mkdir -p "$backup_dir/config"
    
    # Copier les fichiers de configuration
    if [ -f ".env" ]; then
        cp .env "$backup_dir/config/"
        print_info "Fichier .env sauvegardé"
    fi
    
    if [ -f "backend_python/.env" ]; then
        cp backend_python/.env "$backup_dir/config/"
        print_info "Fichier backend_python/.env sauvegardé"
    fi
    
    if [ -f "config/docker/docker-compose.yml" ]; then
        cp config/docker/docker-compose.yml "$backup_dir/config/"
        print_info "Fichier docker-compose.yml sauvegardé"
    fi
}

# Créer un fichier de métadonnées
create_metadata() {
    local backup_dir="$1"
    
    print_step "Création des métadonnées"
    
    cat > "$backup_dir/metadata.json" << EOF
{
    "backup_date": "$(date -Iseconds)",
    "backup_type": "$BACKUP_TYPE",
    "compressed": $COMPRESS,
    "system_info": {
        "hostname": "$(hostname)",
        "docker_version": "$(docker --version)",
        "docker_compose_version": "$(docker-compose --version)"
    },
    "services": {
        "frontend": "$(docker ps --filter "name=sio_frontend_prod" --format "{{.Status}}" 2>/dev/null || echo "Not running")",
        "backend_node": "$(docker ps --filter "name=sio_backend_node_prod" --format "{{.Status}}" 2>/dev/null || echo "Not running")",
        "backend_python": "$(docker ps --filter "name=sio_backend_python_prod" --format "{{.Status}}" 2>/dev/null || echo "Not running")",
        "backend_llm": "$(docker ps --filter "name=sio_backend_llm_prod" --format "{{.Status}}" 2>/dev/null || echo "Not running")",
        "mongodb": "$(docker ps --filter "name=sio_mongodb_prod" --format "{{.Status}}" 2>/dev/null || echo "Not running")"
    },
    "volumes": [
        $(docker volume ls --filter "name=sio" --format "{{.Name}}" 2>/dev/null | tr '\n' ',' | sed 's/,$//' | sed 's/^/"/' | sed 's/,/","/g' | sed 's/$/"/')
    ]
}
EOF
    
    print_info "Métadonnées créées"
}

# Compresser la sauvegarde
compress_backup() {
    local backup_dir="$1"
    
    if [ "$COMPRESS" = true ]; then
        print_step "Compression de la sauvegarde"
        
        local parent_dir=$(dirname "$backup_dir")
        local backup_name=$(basename "$backup_dir")
        
        cd "$parent_dir"
        tar -czf "${backup_name}.tar.gz" "$backup_name" 2>/dev/null
        
        if [ -f "${backup_name}.tar.gz" ]; then
            rm -rf "$backup_name"
            print_info "Sauvegarde compressée: ${backup_name}.tar.gz"
            echo "$parent_dir/${backup_name}.tar.gz"
        else
            print_warning "Échec de la compression"
            echo "$backup_dir"
        fi
    else
        echo "$backup_dir"
    fi
}

# Nettoyer les anciennes sauvegardes
cleanup_old_backups() {
    print_step "Nettoyage des anciennes sauvegardes"
    
    # Garder seulement les 10 dernières sauvegardes
    local backup_count=$(find backups/ -maxdepth 1 -name "sio_backup_*" -type d | wc -l)
    
    if [ "$backup_count" -gt 10 ]; then
        local to_delete=$((backup_count - 10))
        find backups/ -maxdepth 1 -name "sio_backup_*" -type d -printf '%T@ %p\n' | sort -n | head -n "$to_delete" | cut -d' ' -f2- | xargs rm -rf
        print_info "$to_delete anciennes sauvegardes supprimées"
    else
        print_info "Aucune ancienne sauvegarde à supprimer"
    fi
}

# Fonction principale
main() {
    echo -e "${BLUE}💾 Sauvegarde SIO${NC}"
    echo "============================================="
    echo ""
    
    print_header "Démarrage de la Sauvegarde"
    
    # Créer le dossier de sauvegarde
    local backup_dir=$(create_backup_dir)
    print_info "Dossier de sauvegarde créé: $backup_dir"
    
    # Effectuer la sauvegarde selon le type
    case $BACKUP_TYPE in
        "auto"|"full")
            backup_mongodb "$backup_dir"
            backup_volumes "$backup_dir"
            backup_config "$backup_dir"
            ;;
        "mongodb")
            backup_mongodb "$backup_dir"
            ;;
        "volumes")
            backup_volumes "$backup_dir"
            ;;
    esac
    
    # Créer les métadonnées
    create_metadata "$backup_dir"
    
    # Compresser si demandé
    local final_backup=$(compress_backup "$backup_dir")
    
    # Nettoyer les anciennes sauvegardes
    cleanup_old_backups
    
    # Affichage final
    print_header "Sauvegarde Terminée"
    
    echo -e "${GREEN}🎉 Sauvegarde créée avec succès !${NC}"
    echo ""
    echo -e "${CYAN}📁 Emplacement :${NC}"
    echo "   $final_backup"
    echo ""
    echo -e "${CYAN}📊 Taille :${NC}"
    if [ -d "$final_backup" ]; then
        echo "   $(du -sh "$final_backup" | cut -f1)"
    else
        echo "   $(du -sh "$final_backup" | cut -f1)"
    fi
    echo ""
    echo -e "${PURPLE}🔧 Commandes utiles :${NC}"
    echo "   ./scripts/restore.sh $final_backup  # Restaurer la sauvegarde"
    echo "   ls -la backups/                     # Lister les sauvegardes"
    echo "   ./scripts/status.sh                 # Vérifier l'état"
}

# Exécution du script
main "$@"



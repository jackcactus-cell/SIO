#!/bin/bash

# =================================================================
# SIO Audit App - Docker Manager Script
# Script de gestion Docker complet pour l'application SIO Audit
# =================================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="sio-audit-app"
DEV_COMPOSE_FILE="docker-compose.dev.yml"
PROD_COMPOSE_FILE="docker-compose.yml"

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker est installé et fonctionne
check_docker() {
    log_info "Vérification de Docker..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé ou n'est pas dans le PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker n'est pas démarré ou n'est pas accessible"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé ou n'est pas dans le PATH"
        exit 1
    fi
    
    log_success "Docker et Docker Compose sont disponibles"
}

# Créer les fichiers d'environnement s'ils n'existent pas
setup_env_files() {
    log_info "Configuration des fichiers d'environnement..."
    
    # Fichier principal .env
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            log_success "Fichier .env créé depuis env.example"
        else
            log_warning "Fichier env.example introuvable, veuillez créer .env manuellement"
        fi
    fi
    
    # Fichier backend Python .env
    if [ ! -f "backend_python/.env" ]; then
        if [ -f "backend_python/env.example" ]; then
            cp backend_python/env.example backend_python/.env
            log_success "Fichier backend_python/.env créé"
        else
            log_warning "Fichier backend_python/env.example introuvable"
        fi
    fi
}

# Construire les images Docker
build_images() {
    local environment=${1:-production}
    local compose_file=$PROD_COMPOSE_FILE
    
    if [ "$environment" = "dev" ]; then
        compose_file=$DEV_COMPOSE_FILE
    fi
    
    log_info "Construction des images Docker pour l'environnement: $environment"
    
    docker-compose -f $compose_file build --no-cache
    
    log_success "Images construites avec succès"
}

# Démarrer les services
start_services() {
    local environment=${1:-production}
    local compose_file=$PROD_COMPOSE_FILE
    
    if [ "$environment" = "dev" ]; then
        compose_file=$DEV_COMPOSE_FILE
    fi
    
    log_info "Démarrage des services pour l'environnement: $environment"
    
    docker-compose -f $compose_file up -d
    
    log_success "Services démarrés"
    
    # Afficher le statut
    show_status $environment
}

# Arrêter les services
stop_services() {
    local environment=${1:-production}
    local compose_file=$PROD_COMPOSE_FILE
    
    if [ "$environment" = "dev" ]; then
        compose_file=$DEV_COMPOSE_FILE
    fi
    
    log_info "Arrêt des services pour l'environnement: $environment"
    
    docker-compose -f $compose_file down
    
    log_success "Services arrêtés"
}

# Redémarrer les services
restart_services() {
    local environment=${1:-production}
    
    log_info "Redémarrage des services..."
    
    stop_services $environment
    start_services $environment
}

# Afficher le statut des services
show_status() {
    local environment=${1:-production}
    local compose_file=$PROD_COMPOSE_FILE
    
    if [ "$environment" = "dev" ]; then
        compose_file=$DEV_COMPOSE_FILE
    fi
    
    log_info "Statut des services:"
    docker-compose -f $compose_file ps
    
    echo ""
    log_info "URLs d'accès:"
    if [ "$environment" = "dev" ]; then
        echo "  Frontend (Dev): http://localhost:5173"
        echo "  Adminer (DB):   http://localhost:8080"
    else
        echo "  Frontend:       http://localhost:80"
    fi
    echo "  Backend Node:   http://localhost:4000"
    echo "  Backend Python: http://localhost:8000"
    echo "  Backend LLM:    http://localhost:8001"
    echo "  MongoDB:        localhost:27017"
}

# Afficher les logs
show_logs() {
    local environment=${1:-production}
    local service=${2:-""}
    local compose_file=$PROD_COMPOSE_FILE
    
    if [ "$environment" = "dev" ]; then
        compose_file=$DEV_COMPOSE_FILE
    fi
    
    if [ -n "$service" ]; then
        log_info "Logs du service: $service"
        docker-compose -f $compose_file logs -f $service
    else
        log_info "Logs de tous les services"
        docker-compose -f $compose_file logs -f
    fi
}

# Nettoyer les ressources Docker
cleanup() {
    local environment=${1:-production}
    local compose_file=$PROD_COMPOSE_FILE
    
    if [ "$environment" = "dev" ]; then
        compose_file=$DEV_COMPOSE_FILE
    fi
    
    log_warning "Nettoyage des ressources Docker..."
    
    # Arrêter et supprimer les conteneurs
    docker-compose -f $compose_file down -v --remove-orphans
    
    # Supprimer les images inutilisées
    docker image prune -f
    
    # Optionnel: supprimer les volumes (attention aux données)
    read -p "Voulez-vous supprimer les volumes de données? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
        log_warning "Volumes supprimés"
    fi
    
    log_success "Nettoyage terminé"
}

# Sauvegarder les données MongoDB
backup_mongodb() {
    log_info "Sauvegarde de MongoDB..."
    
    # Créer le dossier de sauvegarde
    backup_dir="backup/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $backup_dir
    
    # Dump MongoDB
    docker exec sio_mongodb_prod mongodump --out /tmp/backup
    docker cp sio_mongodb_prod:/tmp/backup $backup_dir/
    
    log_success "Sauvegarde créée dans: $backup_dir"
}

# Restaurer les données MongoDB
restore_mongodb() {
    local backup_path=$1
    
    if [ -z "$backup_path" ]; then
        log_error "Chemin de sauvegarde requis"
        exit 1
    fi
    
    log_info "Restauration de MongoDB depuis: $backup_path"
    
    docker cp $backup_path sio_mongodb_prod:/tmp/restore
    docker exec sio_mongodb_prod mongorestore /tmp/restore
    
    log_success "Restauration terminée"
}

# Surveiller les performances
monitor() {
    log_info "Surveillance des performances..."
    
    watch -n 5 "
        echo '=== CPU et Mémoire ==='
        docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}'
        echo ''
        echo '=== Espace disque ==='
        docker system df
    "
}

# Mise à jour de l'application
update() {
    local environment=${1:-production}
    
    log_info "Mise à jour de l'application..."
    
    # Pull des dernières images
    git pull
    
    # Rebuild et redémarrage
    build_images $environment
    restart_services $environment
    
    log_success "Mise à jour terminée"
}

# Afficher l'aide
show_help() {
    echo "SIO Audit App - Docker Manager"
    echo ""
    echo "Usage: $0 <command> [environment] [options]"
    echo ""
    echo "Commands:"
    echo "  build [env]          Construire les images Docker"
    echo "  start [env]          Démarrer les services"
    echo "  stop [env]           Arrêter les services"
    echo "  restart [env]        Redémarrer les services"
    echo "  status [env]         Afficher le statut des services"
    echo "  logs [env] [service] Afficher les logs"
    echo "  cleanup [env]        Nettoyer les ressources Docker"
    echo "  backup               Sauvegarder MongoDB"
    echo "  restore <path>       Restaurer MongoDB"
    echo "  monitor              Surveiller les performances"
    echo "  update [env]         Mettre à jour l'application"
    echo "  help                 Afficher cette aide"
    echo ""
    echo "Environments:"
    echo "  production (default) Mode production"
    echo "  dev                  Mode développement"
    echo ""
    echo "Examples:"
    echo "  $0 start dev         Démarrer en mode développement"
    echo "  $0 logs prod backend Voir les logs du backend en prod"
    echo "  $0 backup            Sauvegarder les données"
}

# Script principal
main() {
    local command=$1
    local environment=${2:-production}
    local option=$3
    
    # Vérifier Docker au démarrage
    check_docker
    setup_env_files
    
    case $command in
        "build")
            build_images $environment
            ;;
        "start")
            start_services $environment
            ;;
        "stop")
            stop_services $environment
            ;;
        "restart")
            restart_services $environment
            ;;
        "status")
            show_status $environment
            ;;
        "logs")
            show_logs $environment $option
            ;;
        "cleanup")
            cleanup $environment
            ;;
        "backup")
            backup_mongodb
            ;;
        "restore")
            restore_mongodb $environment
            ;;
        "monitor")
            monitor
            ;;
        "update")
            update $environment
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            log_error "Commande inconnue: $command"
            show_help
            exit 1
            ;;
    esac
}

# Exécuter le script principal
main "$@"



#!/bin/bash

# =============================================================================
# Utilitaires Docker pour le projet SIO
# =============================================================================

set -euo pipefail

# Couleurs pour les messages
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Configuration
readonly COMPOSE_FILE="config/docker/docker-compose.yml"
readonly PROJECT_NAME="sio"
readonly LOG_DIR="logs"

# =============================================================================
# Fonctions de logging
# =============================================================================

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

log_debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${PURPLE}[DEBUG]${NC} $1"
    fi
}

# =============================================================================
# Vérifications système
# =============================================================================

check_docker() {
    log_info "Vérification de Docker..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        return 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker n'est pas démarré ou vous n'avez pas les permissions"
        return 1
    fi
    
    log_success "Docker est disponible"
    return 0
}

check_docker_compose() {
    log_info "Vérification de Docker Compose..."
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        return 1
    fi
    
    log_success "Docker Compose est disponible"
    return 0
}

check_compose_file() {
    log_info "Vérification du fichier docker-compose.yml..."
    
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        log_error "Fichier docker-compose.yml non trouvé: $COMPOSE_FILE"
        return 1
    fi
    
    log_success "Fichier docker-compose.yml trouvé"
    return 0
}

check_disk_space() {
    local required_space=20480  # 20GB en MB
    local available_space
    
    log_info "Vérification de l'espace disque..."
    
    available_space=$(df . | awk 'NR==2 {print $4}')
    available_space=$((available_space / 1024))  # Convertir en MB
    
    if [[ $available_space -lt $required_space ]]; then
        log_warning "Espace disque insuffisant: ${available_space}MB disponible, ${required_space}MB requis"
        return 1
    fi
    
    log_success "Espace disque suffisant: ${available_space}MB disponible"
    return 0
}

check_ports() {
    local ports=("80" "8000" "4000" "8001" "27017" "8081")
    local occupied_ports=()
    
    log_info "Vérification des ports..."
    
    for port in "${ports[@]}"; do
        if netstat -tuln | grep -q ":$port "; then
            occupied_ports+=("$port")
        fi
    done
    
    if [[ ${#occupied_ports[@]} -gt 0 ]]; then
        log_warning "Ports déjà utilisés: ${occupied_ports[*]}"
        return 1
    fi
    
    log_success "Tous les ports requis sont disponibles"
    return 0
}

# =============================================================================
# Fonctions Docker Compose
# =============================================================================

docker_compose_cmd() {
    local cmd="$1"
    shift
    
    log_debug "Exécution: docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME $cmd $*"
    
    if ! docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" "$cmd" "$@"; then
        log_error "Échec de la commande docker-compose: $cmd"
        return 1
    fi
    
    return 0
}

build_images() {
    log_info "Construction des images Docker..."
    
    if ! docker_compose_cmd build --no-cache; then
        log_error "Échec de la construction des images"
        return 1
    fi
    
    log_success "Images construites avec succès"
    return 0
}

start_services() {
    log_info "Démarrage des services..."
    
    if ! docker_compose_cmd up -d; then
        log_error "Échec du démarrage des services"
        return 1
    fi
    
    log_success "Services démarrés avec succès"
    return 0
}

stop_services() {
    log_info "Arrêt des services..."
    
    if ! docker_compose_cmd down; then
        log_error "Échec de l'arrêt des services"
        return 1
    fi
    
    log_success "Services arrêtés avec succès"
    return 0
}

restart_services() {
    log_info "Redémarrage des services..."
    
    if ! docker_compose_cmd restart; then
        log_error "Échec du redémarrage des services"
        return 1
    fi
    
    log_success "Services redémarrés avec succès"
    return 0
}

# =============================================================================
# Fonctions de monitoring
# =============================================================================

get_service_status() {
    local service_name="$1"
    
    docker_compose_cmd ps "$service_name" --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
}

get_all_services_status() {
    log_info "Statut de tous les services..."
    
    docker_compose_cmd ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
}

get_service_logs() {
    local service_name="$1"
    local lines="${2:-50}"
    
    log_info "Logs du service $service_name (dernières $lines lignes)..."
    
    docker_compose_cmd logs --tail="$lines" -f "$service_name"
}

get_all_logs() {
    local lines="${1:-50}"
    
    log_info "Logs de tous les services (dernières $lines lignes)..."
    
    docker_compose_cmd logs --tail="$lines" -f
}

# =============================================================================
# Fonctions de santé
# =============================================================================

check_service_health() {
    local service_name="$1"
    local max_attempts="${2:-30}"
    local attempt=1
    
    log_info "Vérification de la santé du service $service_name..."
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker_compose_cmd ps "$service_name" | grep -q "Up"; then
            log_success "Service $service_name est en cours d'exécution"
            return 0
        fi
        
        log_debug "Tentative $attempt/$max_attempts pour $service_name..."
        sleep 2
        ((attempt++))
    done
    
    log_error "Service $service_name n'est pas en cours d'exécution après $max_attempts tentatives"
    return 1
}

check_all_services_health() {
    local services=("frontend" "backend" "backend_python" "backend_llm" "mongodb")
    local failed_services=()
    
    log_info "Vérification de la santé de tous les services..."
    
    for service in "${services[@]}"; do
        if ! check_service_health "$service"; then
            failed_services+=("$service")
        fi
    done
    
    if [[ ${#failed_services[@]} -gt 0 ]]; then
        log_error "Services en échec: ${failed_services[*]}"
        return 1
    fi
    
    log_success "Tous les services sont en bonne santé"
    return 0
}

# =============================================================================
# Fonctions de nettoyage
# =============================================================================

cleanup_containers() {
    log_info "Nettoyage des conteneurs arrêtés..."
    
    if ! docker container prune -f; then
        log_error "Échec du nettoyage des conteneurs"
        return 1
    fi
    
    log_success "Conteneurs nettoyés"
    return 0
}

cleanup_images() {
    log_info "Nettoyage des images non utilisées..."
    
    if ! docker image prune -f; then
        log_error "Échec du nettoyage des images"
        return 1
    fi
    
    log_success "Images nettoyées"
    return 0
}

cleanup_volumes() {
    log_info "Nettoyage des volumes non utilisés..."
    
    if ! docker volume prune -f; then
        log_error "Échec du nettoyage des volumes"
        return 1
    fi
    
    log_success "Volumes nettoyés"
    return 0
}

cleanup_networks() {
    log_info "Nettoyage des réseaux non utilisés..."
    
    if ! docker network prune -f; then
        log_error "Échec du nettoyage des réseaux"
        return 1
    fi
    
    log_success "Réseaux nettoyés"
    return 0
}

cleanup_all() {
    log_info "Nettoyage complet du système Docker..."
    
    cleanup_containers
    cleanup_images
    cleanup_volumes
    cleanup_networks
    
    log_success "Nettoyage complet terminé"
}

# =============================================================================
# Fonctions de sauvegarde
# =============================================================================

backup_volumes() {
    local backup_dir="${1:-backups}"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/sio_backup_$timestamp.tar"
    
    log_info "Sauvegarde des volumes Docker..."
    
    mkdir -p "$backup_dir"
    
    if ! docker run --rm -v sio_mongodb_data:/data -v "$(pwd)/$backup_dir:/backup" alpine tar czf "/backup/mongodb_$timestamp.tar.gz" -C /data .; then
        log_error "Échec de la sauvegarde MongoDB"
        return 1
    fi
    
    log_success "Sauvegarde créée: $backup_file"
    return 0
}

# =============================================================================
# Fonctions utilitaires
# =============================================================================

wait_for_service() {
    local service_name="$1"
    local port="$2"
    local max_attempts="${3:-30}"
    local attempt=1
    
    log_info "Attente du service $service_name sur le port $port..."
    
    while [[ $attempt -le $max_attempts ]]; do
        if nc -z localhost "$port" 2>/dev/null; then
            log_success "Service $service_name est accessible sur le port $port"
            return 0
        fi
        
        log_debug "Tentative $attempt/$max_attempts pour $service_name..."
        sleep 2
        ((attempt++))
    done
    
    log_error "Service $service_name n'est pas accessible après $max_attempts tentatives"
    return 1
}

get_container_ip() {
    local container_name="$1"
    
    docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$container_name"
}

get_container_info() {
    local container_name="$1"
    
    docker inspect "$container_name" | jq '.[0] | {Name: .Name, Status: .State.Status, IP: .NetworkSettings.Networks.sio_network.IPAddress, Ports: .NetworkSettings.Ports}'
}

# =============================================================================
# Fonction principale de vérification
# =============================================================================

verify_environment() {
    log_info "Vérification de l'environnement..."
    
    local checks=(
        check_docker
        check_docker_compose
        check_compose_file
        check_disk_space
        check_ports
    )
    
    local failed_checks=0
    
    for check in "${checks[@]}"; do
        if ! "$check"; then
            ((failed_checks++))
        fi
    done
    
    if [[ $failed_checks -gt 0 ]]; then
        log_error "$failed_checks vérification(s) ont échoué"
        return 1
    fi
    
    log_success "Toutes les vérifications ont réussi"
    return 0
}

# =============================================================================
# Export des fonctions
# =============================================================================

export -f log_info log_success log_warning log_error log_debug
export -f check_docker check_docker_compose check_compose_file check_disk_space check_ports
export -f docker_compose_cmd build_images start_services stop_services restart_services
export -f get_service_status get_all_services_status get_service_logs get_all_logs
export -f check_service_health check_all_services_health
export -f cleanup_containers cleanup_images cleanup_volumes cleanup_networks cleanup_all
export -f backup_volumes wait_for_service get_container_ip get_container_info
export -f verify_environment

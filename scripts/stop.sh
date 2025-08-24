#!/bin/bash

# =============================================================================
# Script d'arrêt des services SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"
source "$SCRIPT_DIR/utils/backup-utils.sh"

# Configuration
readonly STOP_LOG_FILE="logs/stop.log"

# =============================================================================
# Fonctions d'arrêt
# =============================================================================

check_running_services() {
    log_info "Vérification des services en cours d'exécution..."
    
    local running_services=$(docker_compose_cmd ps --quiet)
    
    if [[ -z "$running_services" ]]; then
        log_info "Aucun service en cours d'exécution"
        return 1
    fi
    
    log_info "Services en cours d'exécution:"
    docker_compose_cmd ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    return 0
}

create_pre_stop_backup() {
    log_info "Création d'une sauvegarde avant arrêt..."
    
    local backup_dir="backups/pre_stop_$(date +%Y%m%d_%H%M%S)"
    
    if create_full_backup "$backup_dir"; then
        log_success "Sauvegarde créée: $backup_dir"
        return 0
    else
        log_warning "Échec de la création de la sauvegarde"
        return 1
    fi
}

stop_services_gracefully() {
    log_info "Arrêt gracieux des services..."
    
    # Arrêter les services dans l'ordre inverse
    local services=(
        "frontend"
        "mongo-express"
        "backend_llm"
        "backend"
        "backend_python"
        "mongodb"
    )
    
    for service in "${services[@]}"; do
        if docker_compose_cmd ps "$service" --quiet | grep -q .; then
            log_info "Arrêt de $service..."
            if ! docker_compose_cmd stop "$service"; then
                log_warning "Échec de l'arrêt gracieux de $service"
            fi
        fi
    done
    
    log_success "Arrêt gracieux terminé"
    return 0
}

stop_services_force() {
    log_info "Arrêt forcé des services..."
    
    if ! stop_services; then
        log_error "Échec de l'arrêt des services"
        return 1
    fi
    
    log_success "Services arrêtés"
    return 0
}

wait_for_services_stop() {
    log_info "Attente de l'arrêt des services..."
    
    local timeout=60
    local elapsed=0
    
    while [[ $elapsed -lt $timeout ]]; do
        if ! docker_compose_cmd ps --quiet | grep -q .; then
            log_success "Tous les services sont arrêtés"
            return 0
        fi
        
        log_info "Attente... ($elapsed/$timeout secondes)"
        sleep 2
        ((elapsed += 2))
    done
    
    log_warning "Timeout lors de l'arrêt des services"
    return 1
}

cleanup_containers() {
    log_info "Nettoyage des conteneurs..."
    
    # Supprimer les conteneurs arrêtés
    local stopped_containers=$(docker ps -a --filter "status=exited" --filter "label=com.docker.compose.project=sio" --format "{{.ID}}")
    
    if [[ -n "$stopped_containers" ]]; then
        log_info "Suppression des conteneurs arrêtés..."
        echo "$stopped_containers" | xargs -r docker rm -f
    fi
    
    # Nettoyer les conteneurs orphelins
    cleanup_containers
    
    log_success "Nettoyage terminé"
}

display_stop_summary() {
    echo
    echo "=========================================="
    echo "  Résumé de l'arrêt des services"
    echo "=========================================="
    echo
    
    # Afficher les conteneurs restants
    local remaining_containers=$(docker ps -a --filter "label=com.docker.compose.project=sio" --format "{{.Names}}\t{{.Status}}")
    
    if [[ -n "$remaining_containers" ]]; then
        echo "Conteneurs restants:"
        echo "$remaining_containers"
    else
        echo "Aucun conteneur restant"
    fi
    
    echo
    echo "Volumes conservés:"
    docker volume ls --filter "label=com.docker.compose.project=sio" --format "table {{.Name}}\t{{.Driver}}"
    
    echo
    echo "Réseaux conservés:"
    docker network ls --filter "label=com.docker.compose.project=sio" --format "table {{.Name}}\t{{.Driver}}"
    
    echo
    echo "Ressources système libérées:"
    echo "  CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')%"
    echo "  Mémoire: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
    echo "  Disque: $(df . | awk 'NR==2 {print $5}') utilisé"
    echo
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    echo "=========================================="
    echo "  Arrêt des services SIO"
    echo "=========================================="
    echo
    
    # Créer le répertoire de logs
    mkdir -p "$(dirname "$STOP_LOG_FILE")"
    
    # Vérifier les services en cours d'exécution
    if ! check_running_services; then
        log_info "Aucun service à arrêter"
        exit 0
    fi
    
    # Demander confirmation
    echo "Les services suivants vont être arrêtés:"
    docker_compose_cmd ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo
    
    read -p "Continuer? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Arrêt annulé"
        exit 0
    fi
    
    # Créer une sauvegarde avant arrêt
    create_pre_stop_backup
    
    # Choisir le mode d'arrêt
    local stop_mode="graceful"
    if [[ "${1:-}" == "--force" ]]; then
        stop_mode="force"
    fi
    
    # Arrêter les services
    case "$stop_mode" in
        "graceful")
            if ! stop_services_gracefully; then
                log_warning "Arrêt gracieux partiellement échoué"
            fi
            ;;
        "force")
            if ! stop_services_force; then
                log_error "Échec de l'arrêt forcé"
                exit 1
            fi
            ;;
    esac
    
    # Attendre que les services s'arrêtent
    if ! wait_for_services_stop; then
        log_warning "Certains services n'ont pas pu être arrêtés proprement"
    fi
    
    # Nettoyer les conteneurs
    cleanup_containers
    
    # Afficher le résumé
    display_stop_summary
    
    echo "=========================================="
    echo "  Services arrêtés avec succès!"
    echo "=========================================="
    echo
    echo "Commandes utiles:"
    echo "  Démarrer:    ./scripts/start.sh"
    echo "  Redémarrer:  ./scripts/restart.sh"
    echo "  Nettoyer:    ./scripts/cleanup.sh"
    echo "  Sauvegarde:  ./scripts/backup.sh"
    echo
}

# =============================================================================
# Exécution du script
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

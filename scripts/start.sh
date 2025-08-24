#!/bin/bash

# =============================================================================
# Script de démarrage des services SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"
source "$SCRIPT_DIR/utils/health-utils.sh"

# Configuration
readonly START_LOG_FILE="logs/start.log"

# =============================================================================
# Fonctions de démarrage
# =============================================================================

check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Docker
    if ! check_docker; then
        log_error "Docker n'est pas disponible"
        return 1
    fi
    
    # Vérifier Docker Compose
    if ! check_docker_compose; then
        log_error "Docker Compose n'est pas disponible"
        return 1
    fi
    
    # Vérifier le fichier docker-compose.yml
    if ! check_compose_file; then
        log_error "Fichier docker-compose.yml non trouvé"
        return 1
    fi
    
    # Vérifier les ports
    if ! check_ports; then
        log_warning "Certains ports sont déjà utilisés"
        read -p "Continuer quand même? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    log_success "Prérequis vérifiés"
    return 0
}

start_services_sequential() {
    log_info "Démarrage séquentiel des services..."
    
    # Démarrer MongoDB en premier
    log_info "Démarrage de MongoDB..."
    if ! docker_compose_cmd up -d mongodb; then
        log_error "Échec du démarrage de MongoDB"
        return 1
    fi
    
    # Attendre que MongoDB soit prêt
    log_info "Attente de MongoDB..."
    if ! wait_for_service "mongodb" "27017" 60; then
        log_error "MongoDB n'est pas prêt"
        return 1
    fi
    
    # Démarrer les backends
    log_info "Démarrage des backends..."
    if ! docker_compose_cmd up -d backend_python backend backend_llm; then
        log_error "Échec du démarrage des backends"
        return 1
    fi
    
    # Attendre que les backends soient prêts
    log_info "Attente des backends..."
    if ! wait_for_service "backend_python" "8000" 60; then
        log_warning "Backend Python n'est pas prêt"
    fi
    
    if ! wait_for_service "backend" "4000" 60; then
        log_warning "Backend Node.js n'est pas prêt"
    fi
    
    if ! wait_for_service "backend_llm" "8001" 60; then
        log_warning "Backend LLM n'est pas prêt"
    fi
    
    # Démarrer le frontend
    log_info "Démarrage du frontend..."
    if ! docker_compose_cmd up -d frontend; then
        log_error "Échec du démarrage du frontend"
        return 1
    fi
    
    # Démarrer Mongo Express
    log_info "Démarrage de Mongo Express..."
    if ! docker_compose_cmd up -d mongo-express; then
        log_warning "Échec du démarrage de Mongo Express"
    fi
    
    log_success "Services démarrés séquentiellement"
    return 0
}

start_services_parallel() {
    log_info "Démarrage parallèle des services..."
    
    if ! start_services; then
        log_error "Échec du démarrage des services"
        return 1
    fi
    
    log_success "Services démarrés en parallèle"
    return 0
}

wait_for_all_services() {
    log_info "Attente de tous les services..."
    
    local services=(
        "mongodb|27017"
        "backend_python|8000"
        "backend|4000"
        "backend_llm|8001"
        "frontend|80"
        "mongo-express|8081"
    )
    
    local timeout=180
    local elapsed=0
    local ready_services=0
    local total_services=${#services[@]}
    
    while [[ $elapsed -lt $timeout ]]; do
        ready_services=0
        
        for service in "${services[@]}"; do
            local service_name="${service%|*}"
            local port="${service#*|}"
            
            if wait_for_service "$service_name" "$port" 5; then
                ((ready_services++))
            fi
        done
        
        if [[ $ready_services -eq $total_services ]]; then
            log_success "Tous les services sont prêts"
            return 0
        fi
        
        log_info "Services prêts: $ready_services/$total_services ($elapsed/$timeout secondes)"
        sleep 10
        ((elapsed += 10))
    done
    
    log_warning "Timeout lors de l'attente des services"
    return 1
}

verify_services_health() {
    log_info "Vérification de la santé des services..."
    
    # Vérifier la santé des conteneurs
    if ! check_all_services_health; then
        log_warning "Certains services ne sont pas en bonne santé"
    fi
    
    # Vérifier les endpoints
    if ! check_service_endpoints; then
        log_warning "Certains endpoints ne sont pas accessibles"
    fi
    
    # Vérifier les connexions aux bases de données
    if ! check_database_connections; then
        log_warning "Problèmes de connexion aux bases de données"
    fi
    
    log_success "Vérification de santé terminée"
    return 0
}

display_service_status() {
    echo
    echo "=========================================="
    echo "  Statut des services SIO"
    echo "=========================================="
    echo
    
    # Afficher le statut des conteneurs
    docker_compose_cmd ps
    
    echo
    echo "Endpoints disponibles:"
    echo "  Frontend:        http://localhost:80"
    echo "  Backend Python:  http://localhost:8000"
    echo "  Backend Node.js: http://localhost:4000"
    echo "  Backend LLM:     http://localhost:8001"
    echo "  Mongo Express:   http://localhost:8081"
    echo
    
    # Afficher les ressources utilisées
    echo "Ressources système:"
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
    echo "  Démarrage des services SIO"
    echo "=========================================="
    echo
    
    # Créer le répertoire de logs
    mkdir -p "$(dirname "$START_LOG_FILE")"
    
    # Vérifier les prérequis
    if ! check_prerequisites; then
        log_error "Prérequis non satisfaits"
        exit 1
    fi
    
    # Vérifier si des services sont déjà en cours d'exécution
    if docker_compose_cmd ps --quiet | grep -q .; then
        log_warning "Des services sont déjà en cours d'exécution"
        read -p "Redémarrer les services? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "Arrêt des services existants..."
            stop_services
            sleep 5
        else
            log_info "Affichage du statut des services existants..."
            display_service_status
            exit 0
        fi
    fi
    
    # Choisir le mode de démarrage
    local start_mode="parallel"
    if [[ "${1:-}" == "--sequential" ]]; then
        start_mode="sequential"
    fi
    
    # Démarrer les services
    case "$start_mode" in
        "sequential")
            if ! start_services_sequential; then
                log_error "Échec du démarrage séquentiel"
                exit 1
            fi
            ;;
        "parallel")
            if ! start_services_parallel; then
                log_error "Échec du démarrage parallèle"
                exit 1
            fi
            ;;
    esac
    
    # Attendre que tous les services soient prêts
    if ! wait_for_all_services; then
        log_warning "Certains services ne sont pas prêts"
    fi
    
    # Vérifier la santé des services
    verify_services_health
    
    # Afficher le statut final
    display_service_status
    
    echo "=========================================="
    echo "  Services démarrés avec succès!"
    echo "=========================================="
    echo
    echo "Commandes utiles:"
    echo "  Arrêter:     ./scripts/stop.sh"
    echo "  Redémarrer:  ./scripts/restart.sh"
    echo "  Logs:        ./scripts/logs.sh"
    echo "  Santé:       ./scripts/health-check.sh"
    echo "  Monitoring:  ./scripts/monitor.sh"
    echo
}

# =============================================================================
# Exécution du script
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

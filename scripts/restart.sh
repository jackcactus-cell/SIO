#!/bin/bash

# =============================================================================
# Script de redémarrage des services SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"
source "$SCRIPT_DIR/utils/health-utils.sh"

# Configuration
readonly RESTART_LOG_FILE="logs/restart.log"

# =============================================================================
# Fonctions de redémarrage
# =============================================================================

check_services_status() {
    log_info "Vérification du statut des services..."
    
    local running_services=$(docker_compose_cmd ps --quiet)
    
    if [[ -z "$running_services" ]]; then
        log_info "Aucun service en cours d'exécution"
        return 1
    fi
    
    log_info "Services en cours d'exécution:"
    docker_compose_cmd ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    return 0
}

restart_services_soft() {
    log_info "Redémarrage doux des services..."
    
    if ! restart_services; then
        log_error "Échec du redémarrage des services"
        return 1
    fi
    
    log_success "Services redémarrés"
    return 0
}

restart_services_hard() {
    log_info "Redémarrage complet des services..."
    
    # Arrêter les services
    log_info "Arrêt des services..."
    if ! stop_services; then
        log_error "Échec de l'arrêt des services"
        return 1
    fi
    
    # Attendre que les services s'arrêtent
    log_info "Attente de l'arrêt des services..."
    sleep 10
    
    # Démarrer les services
    log_info "Démarrage des services..."
    if ! start_services; then
        log_error "Échec du démarrage des services"
        return 1
    fi
    
    log_success "Services redémarrés"
    return 0
}

restart_services_sequential() {
    log_info "Redémarrage séquentiel des services..."
    
    local services=(
        "mongodb"
        "backend_python"
        "backend"
        "backend_llm"
        "frontend"
        "mongo-express"
    )
    
    for service in "${services[@]}"; do
        if docker_compose_cmd ps "$service" --quiet | grep -q .; then
            log_info "Redémarrage de $service..."
            if ! docker_compose_cmd restart "$service"; then
                log_warning "Échec du redémarrage de $service"
            fi
            
            # Attendre que le service soit prêt
            local port=""
            case "$service" in
                "mongodb") port="27017" ;;
                "backend_python") port="8000" ;;
                "backend") port="4000" ;;
                "backend_llm") port="8001" ;;
                "frontend") port="80" ;;
                "mongo-express") port="8081" ;;
            esac
            
            if [[ -n "$port" ]]; then
                log_info "Attente de $service..."
                wait_for_service "$service" "$port" 60 || log_warning "$service n'est pas prêt"
            fi
        fi
    done
    
    log_success "Redémarrage séquentiel terminé"
    return 0
}

wait_for_services_ready() {
    log_info "Attente de la disponibilité des services..."
    
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

verify_restart() {
    log_info "Vérification du redémarrage..."
    
    # Vérifier la santé des services
    if ! perform_health_check; then
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
    
    log_success "Vérification terminée"
    return 0
}

display_restart_summary() {
    echo
    echo "=========================================="
    echo "  Résumé du redémarrage"
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
    echo "  Redémarrage des services SIO"
    echo "=========================================="
    echo
    
    # Créer le répertoire de logs
    mkdir -p "$(dirname "$RESTART_LOG_FILE")"
    
    # Vérifier les prérequis
    if ! verify_environment; then
        log_error "Environnement non valide"
        exit 1
    fi
    
    # Vérifier le statut des services
    if ! check_services_status; then
        log_info "Aucun service en cours d'exécution, démarrage des services..."
        exec "$SCRIPT_DIR/start.sh" "$@"
    fi
    
    # Choisir le mode de redémarrage
    local restart_mode="soft"
    case "${1:-}" in
        "--hard")
            restart_mode="hard"
            ;;
        "--sequential")
            restart_mode="sequential"
            ;;
        "--help"|"-h")
            echo "Usage: $0 [OPTION]"
            echo
            echo "Options:"
            echo "  --soft       Redémarrage doux (défaut)"
            echo "  --hard       Redémarrage complet (arrêt + démarrage)"
            echo "  --sequential Redémarrage séquentiel des services"
            echo "  --help       Afficher cette aide"
            exit 0
            ;;
    esac
    
    # Demander confirmation
    echo "Mode de redémarrage: $restart_mode"
    echo "Services à redémarrer:"
    docker_compose_cmd ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo
    
    read -p "Continuer? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Redémarrage annulé"
        exit 0
    fi
    
    # Redémarrer les services
    case "$restart_mode" in
        "soft")
            if ! restart_services_soft; then
                log_error "Échec du redémarrage doux"
                exit 1
            fi
            ;;
        "hard")
            if ! restart_services_hard; then
                log_error "Échec du redémarrage complet"
                exit 1
            fi
            ;;
        "sequential")
            if ! restart_services_sequential; then
                log_error "Échec du redémarrage séquentiel"
                exit 1
            fi
            ;;
    esac
    
    # Attendre que les services soient prêts
    if ! wait_for_services_ready; then
        log_warning "Certains services ne sont pas prêts"
    fi
    
    # Vérifier le redémarrage
    verify_restart
    
    # Afficher le résumé
    display_restart_summary
    
    echo "=========================================="
    echo "  Redémarrage terminé avec succès!"
    echo "=========================================="
    echo
    echo "Commandes utiles:"
    echo "  Arrêter:     ./scripts/stop.sh"
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

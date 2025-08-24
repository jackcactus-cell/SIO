#!/bin/bash

# =============================================================================
# Script de déploiement complet pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"
source "$SCRIPT_DIR/utils/backup-utils.sh"
source "$SCRIPT_DIR/utils/health-utils.sh"
source "$SCRIPT_DIR/utils/config-utils.sh"

# Configuration
readonly DEPLOY_LOG_FILE="logs/deploy.log"
readonly DEPLOY_TIMEOUT=300  # 5 minutes

# =============================================================================
# Fonctions de déploiement
# =============================================================================

prepare_deployment() {
    log_info "Préparation du déploiement..."
    
    # Créer le répertoire de logs
    mkdir -p "$(dirname "$DEPLOY_LOG_FILE")"
    
    # Vérifier l'environnement
    if ! verify_environment; then
        log_error "Environnement non valide pour le déploiement"
        return 1
    fi
    
    # Vérifier les images Docker
    local required_images=(
        "sio-frontend:latest"
        "sio-backend:latest"
        "sio-backend-python:latest"
        "sio-backend-llm:latest"
    )
    
    local missing_images=()
    for image in "${required_images[@]}"; do
        if ! docker image inspect "$image" &> /dev/null; then
            missing_images+=("$image")
        fi
    done
    
    if [[ ${#missing_images[@]} -gt 0 ]]; then
        log_error "Images manquantes: ${missing_images[*]}"
        log_info "Exécutez d'abord: ./scripts/build.sh"
        return 1
    fi
    
    # Vérifier les fichiers de configuration
    if ! validate_docker_configuration; then
        log_error "Configuration Docker invalide"
        return 1
    fi
    
    # Créer une sauvegarde avant déploiement
    log_info "Création d'une sauvegarde avant déploiement..."
    create_full_backup "backups/pre_deploy_$(date +%Y%m%d_%H%M%S)"
    
    log_success "Déploiement préparé"
    return 0
}

stop_existing_services() {
    log_info "Arrêt des services existants..."
    
    # Vérifier si des services sont en cours d'exécution
    if docker_compose_cmd ps --quiet | grep -q .; then
        log_info "Arrêt des services existants..."
        stop_services
        
        # Attendre que les services s'arrêtent
        local timeout=60
        local elapsed=0
        
        while [[ $elapsed -lt $timeout ]]; do
            if ! docker_compose_cmd ps --quiet | grep -q .; then
                log_success "Services arrêtés"
                return 0
            fi
            sleep 2
            ((elapsed += 2))
        done
        
        log_warning "Timeout lors de l'arrêt des services"
        return 1
    else
        log_info "Aucun service en cours d'exécution"
        return 0
    fi
}

cleanup_old_containers() {
    log_info "Nettoyage des anciens conteneurs..."
    
    # Supprimer les conteneurs arrêtés
    docker container prune -f
    
    # Supprimer les conteneurs orphelins
    local orphaned_containers=$(docker ps -a --filter "label=com.docker.compose.project=sio" --format "{{.ID}}")
    if [[ -n "$orphaned_containers" ]]; then
        log_info "Suppression des conteneurs orphelins..."
        echo "$orphaned_containers" | xargs -r docker rm -f
    fi
    
    log_success "Nettoyage terminé"
}

deploy_services() {
    log_info "Déploiement des services..."
    
    # Démarrer les services
    if ! start_services; then
        log_error "Échec du démarrage des services"
        return 1
    fi
    
    # Attendre que les services démarrent
    log_info "Attente du démarrage des services..."
    local timeout=$DEPLOY_TIMEOUT
    local elapsed=0
    
    while [[ $elapsed -lt $timeout ]]; do
        if check_all_services_health; then
            log_success "Tous les services sont démarrés"
            return 0
        fi
        
        log_info "Attente... ($elapsed/$timeout secondes)"
        sleep 10
        ((elapsed += 10))
    done
    
    log_error "Timeout lors du démarrage des services"
    return 1
}

wait_for_services_ready() {
    log_info "Attente de la disponibilité des services..."
    
    local services=(
        "http://localhost:80|Frontend"
        "http://localhost:8000|Backend Python"
        "http://localhost:4000|Backend Node.js"
        "http://localhost:8001|Backend LLM"
        "http://localhost:8081|Mongo Express"
    )
    
    local timeout=120
    local elapsed=0
    
    while [[ $elapsed -lt $timeout ]]; do
        local all_ready=true
        
        for service in "${services[@]}"; do
            local url="${service%|*}"
            local name="${service#*|}"
            
            if ! curl -s -f --max-time 5 "$url" &> /dev/null; then
                all_ready=false
                break
            fi
        done
        
        if [[ "$all_ready" == "true" ]]; then
            log_success "Tous les services sont prêts"
            return 0
        fi
        
        log_info "Attente de la disponibilité... ($elapsed/$timeout secondes)"
        sleep 5
        ((elapsed += 5))
    done
    
    log_error "Timeout lors de l'attente de la disponibilité des services"
    return 1
}

verify_deployment() {
    log_info "Vérification du déploiement..."
    
    # Vérifier la santé des services
    if ! perform_health_check; then
        log_error "Vérification de santé échouée"
        return 1
    fi
    
    # Vérifier les endpoints
    if ! check_service_endpoints; then
        log_error "Vérification des endpoints échouée"
        return 1
    fi
    
    # Vérifier les connexions aux bases de données
    if ! check_database_connections; then
        log_error "Vérification des connexions aux bases de données échouée"
        return 1
    fi
    
    log_success "Déploiement vérifié avec succès"
    return 0
}

run_post_deployment_tests() {
    log_info "Exécution des tests post-déploiement..."
    
    # Test de l'API Backend Python
    log_info "Test de l'API Backend Python..."
    if curl -s -f "http://localhost:8000/health" &> /dev/null; then
        log_success "API Backend Python accessible"
    else
        log_error "API Backend Python non accessible"
        return 1
    fi
    
    # Test de l'API Backend Node.js
    log_info "Test de l'API Backend Node.js..."
    if curl -s -f "http://localhost:4000/health" &> /dev/null; then
        log_success "API Backend Node.js accessible"
    else
        log_error "API Backend Node.js non accessible"
        return 1
    fi
    
    # Test de l'API Backend LLM
    log_info "Test de l'API Backend LLM..."
    if curl -s -f "http://localhost:8001/health" &> /dev/null; then
        log_success "API Backend LLM accessible"
    else
        log_error "API Backend LLM non accessible"
        return 1
    fi
    
    # Test du Frontend
    log_info "Test du Frontend..."
    if curl -s -f "http://localhost:80" &> /dev/null; then
        log_success "Frontend accessible"
    else
        log_error "Frontend non accessible"
        return 1
    fi
    
    # Test de Mongo Express
    log_info "Test de Mongo Express..."
    if curl -s -f "http://localhost:8081" &> /dev/null; then
        log_success "Mongo Express accessible"
    else
        log_error "Mongo Express non accessible"
        return 1
    fi
    
    log_success "Tous les tests post-déploiement ont réussi"
    return 0
}

generate_deployment_report() {
    local report_file="logs/deployment_report_$(date +%Y%m%d_%H%M%S).json"
    
    log_info "Génération du rapport de déploiement: $report_file"
    
    # Créer le rapport
    cat > "$report_file" << EOF
{
    "deployment_timestamp": "$(date -Iseconds)",
    "deployment_duration": "$(($(date +%s) - DEPLOY_START_TIME))s",
    "system_info": {
        "hostname": "$(hostname)",
        "os": "$(uname -s)",
        "kernel": "$(uname -r)",
        "docker_version": "$(docker --version)",
        "docker_compose_version": "$(docker-compose --version)"
    },
    "services_status": {
EOF
    
    local services=(
        "frontend"
        "backend"
        "backend_python"
        "backend_llm"
        "mongodb"
        "mongo-express"
    )
    
    local first=true
    for service in "${services[@]}"; do
        local status=$(docker_compose_cmd ps "$service" --format '{{.Status}}' 2>/dev/null || echo "unknown")
        local port=$(docker_compose_cmd ps "$service" --format '{{.Ports}}' 2>/dev/null || echo "unknown")
        
        if [[ "$first" == "true" ]]; then
            first=false
        else
            echo "," >> "$report_file"
        fi
        
        cat >> "$report_file" << EOF
        "$service": {
            "status": "$status",
            "ports": "$port"
        }
EOF
    done
    
    cat >> "$report_file" << EOF
    },
    "endpoints": {
        "frontend": "http://localhost:80",
        "backend_python": "http://localhost:8000",
        "backend_nodejs": "http://localhost:4000",
        "backend_llm": "http://localhost:8001",
        "mongo_express": "http://localhost:8081"
    },
    "deployment_log": "$DEPLOY_LOG_FILE"
}
EOF
    
    log_success "Rapport de déploiement généré: $report_file"
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    echo "=========================================="
    echo "  Déploiement de l'application SIO"
    echo "=========================================="
    echo
    
    # Enregistrer le temps de début
    DEPLOY_START_TIME=$(date +%s)
    
    # Préparer le déploiement
    if ! prepare_deployment; then
        log_error "Échec de la préparation du déploiement"
        exit 1
    fi
    
    # Arrêter les services existants
    if ! stop_existing_services; then
        log_warning "Problème lors de l'arrêt des services existants"
    fi
    
    # Nettoyer les anciens conteneurs
    cleanup_old_containers
    
    # Déployer les services
    if ! deploy_services; then
        log_error "Échec du déploiement des services"
        exit 1
    fi
    
    # Attendre que les services soient prêts
    if ! wait_for_services_ready; then
        log_error "Échec de l'attente de la disponibilité des services"
        exit 1
    fi
    
    # Vérifier le déploiement
    if ! verify_deployment; then
        log_error "Échec de la vérification du déploiement"
        exit 1
    fi
    
    # Exécuter les tests post-déploiement
    if ! run_post_deployment_tests; then
        log_error "Échec des tests post-déploiement"
        exit 1
    fi
    
    # Générer le rapport
    generate_deployment_report
    
    # Calculer la durée totale
    local duration=$(($(date +%s) - DEPLOY_START_TIME))
    
    echo
    echo "=========================================="
    echo "  Déploiement terminé avec succès!"
    echo "=========================================="
    echo
    echo "Durée totale: ${duration}s"
    echo "Logs: $DEPLOY_LOG_FILE"
    echo
    echo "Services déployés:"
    docker_compose_cmd ps
    echo
    echo "Endpoints disponibles:"
    echo "  Frontend:        http://localhost:80"
    echo "  Backend Python:  http://localhost:8000"
    echo "  Backend Node.js: http://localhost:4000"
    echo "  Backend LLM:     http://localhost:8001"
    echo "  Mongo Express:   http://localhost:8081"
    echo
    echo "Prochaines étapes:"
    echo "1. Vérifier la santé: ./scripts/health-check.sh"
    echo "2. Consulter les logs: ./scripts/logs.sh"
    echo "3. Monitoring: ./scripts/monitor.sh"
    echo "4. Sauvegarde: ./scripts/backup.sh"
    echo
}

# =============================================================================
# Exécution du script
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

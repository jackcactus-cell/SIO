#!/bin/bash

# =============================================================================
# Utilitaires de santé et monitoring pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires Docker
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/docker-utils.sh"

# Configuration
readonly HEALTH_CHECK_INTERVAL=30
readonly HEALTH_CHECK_TIMEOUT=10
readonly MAX_RETRIES=3

# =============================================================================
# Fonctions de vérification de santé
# =============================================================================

check_system_resources() {
    log_info "Vérification des ressources système..."
    
    local report=()
    local warnings=0
    
    # Vérification de la mémoire
    local total_mem=$(free -m | awk 'NR==2{print $2}')
    local used_mem=$(free -m | awk 'NR==2{print $3}')
    local mem_usage=$((used_mem * 100 / total_mem))
    
    if [[ $mem_usage -gt 90 ]]; then
        report+=("⚠️  Mémoire: ${mem_usage}% utilisée (${used_mem}MB/${total_mem}MB)")
        ((warnings++))
    else
        report+=("✅ Mémoire: ${mem_usage}% utilisée (${used_mem}MB/${total_mem}MB)")
    fi
    
    # Vérification de l'espace disque
    local disk_usage=$(df . | awk 'NR==2 {print $5}' | sed 's/%//')
    local available_space=$(df . | awk 'NR==2 {print $4}')
    
    if [[ $disk_usage -gt 90 ]]; then
        report+=("⚠️  Disque: ${disk_usage}% utilisé (${available_space}KB libre)")
        ((warnings++))
    else
        report+=("✅ Disque: ${disk_usage}% utilisé (${available_space}KB libre)")
    fi
    
    # Vérification de la charge CPU
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cpu_cores=$(nproc)
    local load_per_core=$(echo "scale=2; $load_avg / $cpu_cores" | bc)
    
    if (( $(echo "$load_per_core > 1.0" | bc -l) )); then
        report+=("⚠️  CPU: Charge moyenne ${load_avg} (${load_per_core} par cœur)")
        ((warnings++))
    else
        report+=("✅ CPU: Charge moyenne ${load_avg} (${load_per_core} par cœur)")
    fi
    
    # Affichage du rapport
    echo "=== Ressources Système ==="
    for line in "${report[@]}"; do
        echo "$line"
    done
    
    if [[ $warnings -gt 0 ]]; then
        log_warning "$warnings avertissement(s) détecté(s)"
        return 1
    else
        log_success "Toutes les ressources système sont normales"
        return 0
    fi
}

check_docker_health() {
    log_info "Vérification de la santé Docker..."
    
    local report=()
    local errors=0
    
    # Vérification du daemon Docker
    if ! docker info &> /dev/null; then
        report+=("❌ Daemon Docker: Non accessible")
        ((errors++))
    else
        report+=("✅ Daemon Docker: Accessible")
    fi
    
    # Vérification des conteneurs
    local running_containers=$(docker ps --format "{{.Names}}" | wc -l)
    local total_containers=$(docker ps -a --format "{{.Names}}" | wc -l)
    
    if [[ $running_containers -eq 0 ]]; then
        report+=("⚠️  Conteneurs: Aucun conteneur en cours d'exécution")
        ((errors++))
    else
        report+=("✅ Conteneurs: $running_containers/$total_containers en cours d'exécution")
    fi
    
    # Vérification des images
    local images_count=$(docker images --format "{{.Repository}}" | wc -l)
    report+=("ℹ️  Images: $images_count images disponibles")
    
    # Vérification des volumes
    local volumes_count=$(docker volume ls --format "{{.Name}}" | wc -l)
    report+=("ℹ️  Volumes: $volumes_count volumes créés")
    
    # Vérification des réseaux
    local networks_count=$(docker network ls --format "{{.Name}}" | wc -l)
    report+=("ℹ️  Réseaux: $networks_count réseaux créés")
    
    # Affichage du rapport
    echo "=== Santé Docker ==="
    for line in "${report[@]}"; do
        echo "$line"
    done
    
    if [[ $errors -gt 0 ]]; then
        log_error "$errors problème(s) détecté(s)"
        return 1
    else
        log_success "Docker est en bonne santé"
        return 0
    fi
}

check_service_endpoints() {
    log_info "Vérification des endpoints des services..."
    
    local endpoints=(
        "http://localhost:80|Frontend"
        "http://localhost:8000|Backend Python"
        "http://localhost:4000|Backend Node.js"
        "http://localhost:8001|Backend LLM"
        "http://localhost:8081|Mongo Express"
    )
    
    local report=()
    local errors=0
    
    for endpoint in "${endpoints[@]}"; do
        local url="${endpoint%|*}"
        local service="${endpoint#*|}"
        
        if curl -s -f --max-time 5 "$url" &> /dev/null; then
            report+=("✅ $service: Accessible")
        else
            report+=("❌ $service: Non accessible")
            ((errors++))
        fi
    done
    
    # Affichage du rapport
    echo "=== Endpoints des Services ==="
    for line in "${report[@]}"; do
        echo "$line"
    done
    
    if [[ $errors -gt 0 ]]; then
        log_error "$errors service(s) non accessible(s)"
        return 1
    else
        log_success "Tous les services sont accessibles"
        return 0
    fi
}

check_database_connections() {
    log_info "Vérification des connexions aux bases de données..."
    
    local report=()
    local errors=0
    
    # Vérification MongoDB
    if docker run --rm --network sio_network mongo:7.0 mongosh --host mongodb --port 27017 --username admin --password securepassword123 --authenticationDatabase admin --eval "db.adminCommand('ping')" &> /dev/null; then
        report+=("✅ MongoDB: Connecté")
    else
        report+=("❌ MongoDB: Non connecté")
        ((errors++))
    fi
    
    # Vérification Oracle (si configuré)
    if [[ -f "backend_python/.env" ]] && grep -q "ORACLE_HOST" "backend_python/.env"; then
        if curl -s -f "http://localhost:8000/api/oracle/test-connection" &> /dev/null; then
            report+=("✅ Oracle: Connecté")
        else
            report+=("⚠️  Oracle: Non connecté")
            ((errors++))
        fi
    else
        report+=("ℹ️  Oracle: Non configuré")
    fi
    
    # Affichage du rapport
    echo "=== Connexions aux Bases de Données ==="
    for line in "${report[@]}"; do
        echo "$line"
    done
    
    if [[ $errors -gt 0 ]]; then
        log_error "$errors problème(s) de connexion détecté(s)"
        return 1
    else
        log_success "Toutes les connexions aux bases de données sont établies"
        return 0
    fi
}

check_log_health() {
    log_info "Vérification de la santé des logs..."
    
    local report=()
    local warnings=0
    
    # Vérification des logs d'erreur récents
    local error_logs=$(docker_compose_cmd logs --since=1h 2>&1 | grep -i "error\|exception\|failed" | wc -l)
    
    if [[ $error_logs -gt 10 ]]; then
        report+=("⚠️  Logs d'erreur: $error_logs erreurs dans la dernière heure")
        ((warnings++))
    else
        report+=("✅ Logs d'erreur: $error_logs erreurs dans la dernière heure")
    fi
    
    # Vérification de la taille des logs
    local log_size=$(docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}" | grep "Containers" | awk '{print $3}')
    report+=("ℹ️  Taille des logs: $log_size")
    
    # Affichage du rapport
    echo "=== Santé des Logs ==="
    for line in "${report[@]}"; do
        echo "$line"
    done
    
    if [[ $warnings -gt 0 ]]; then
        log_warning "$warnings avertissement(s) détecté(s)"
        return 1
    else
        log_success "Les logs sont en bonne santé"
        return 0
    fi
}

# =============================================================================
# Fonctions de monitoring en temps réel
# =============================================================================

monitor_system_resources() {
    log_info "Démarrage du monitoring des ressources système..."
    
    echo "=== Monitoring des Ressources Système ==="
    echo "Appuyez sur Ctrl+C pour arrêter"
    echo
    
    while true; do
        clear
        echo "=== $(date) ==="
        echo
        
        # CPU et mémoire
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')% | Mémoire: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
        
        # Disque
        echo "Disque: $(df . | awk 'NR==2 {print $5}') utilisé"
        
        # Conteneurs
        echo "Conteneurs: $(docker ps --format "{{.Names}}" | wc -l) en cours d'exécution"
        
        # Réseau
        echo "Connexions réseau: $(netstat -an | grep ESTABLISHED | wc -l)"
        
        sleep 2
    done
}

monitor_docker_services() {
    log_info "Démarrage du monitoring des services Docker..."
    
    echo "=== Monitoring des Services Docker ==="
    echo "Appuyez sur Ctrl+C pour arrêter"
    echo
    
    while true; do
        clear
        echo "=== $(date) ==="
        echo
        
        docker_compose_cmd ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
        
        echo
        echo "Logs récents:"
        docker_compose_cmd logs --tail=5 --no-color
        
        sleep 5
    done
}

monitor_service_endpoints() {
    log_info "Démarrage du monitoring des endpoints..."
    
    local endpoints=(
        "http://localhost:80|Frontend"
        "http://localhost:8000|Backend Python"
        "http://localhost:4000|Backend Node.js"
        "http://localhost:8001|Backend LLM"
        "http://localhost:8081|Mongo Express"
    )
    
    echo "=== Monitoring des Endpoints ==="
    echo "Appuyez sur Ctrl+C pour arrêter"
    echo
    
    while true; do
        clear
        echo "=== $(date) ==="
        echo
        
        for endpoint in "${endpoints[@]}"; do
            local url="${endpoint%|*}"
            local service="${endpoint#*|}"
            local start_time=$(date +%s.%N)
            
            if curl -s -f --max-time 5 "$url" &> /dev/null; then
                local end_time=$(date +%s.%N)
                local response_time=$(echo "$end_time - $start_time" | bc)
                echo "✅ $service: ${response_time}s"
            else
                echo "❌ $service: Timeout/Erreur"
            fi
        done
        
        sleep 10
    done
}

# =============================================================================
# Fonctions de diagnostic
# =============================================================================

generate_health_report() {
    local report_file="${1:-health_report_$(date +%Y%m%d_%H%M%S).txt}"
    
    log_info "Génération du rapport de santé: $report_file"
    
    {
        echo "=== RAPPORT DE SANTÉ SIO ==="
        echo "Date: $(date)"
        echo "Hostname: $(hostname)"
        echo "OS: $(uname -s) $(uname -r)"
        echo
        
        echo "=== RESSOURCES SYSTÈME ==="
        check_system_resources 2>&1 || true
        echo
        
        echo "=== SANTÉ DOCKER ==="
        check_docker_health 2>&1 || true
        echo
        
        echo "=== ENDPOINTS DES SERVICES ==="
        check_service_endpoints 2>&1 || true
        echo
        
        echo "=== CONNEXIONS AUX BASES DE DONNÉES ==="
        check_database_connections 2>&1 || true
        echo
        
        echo "=== SANTÉ DES LOGS ==="
        check_log_health 2>&1 || true
        echo
        
        echo "=== STATUT DES CONTENEURS ==="
        docker_compose_cmd ps 2>&1 || true
        echo
        
        echo "=== LOGS RÉCENTS ==="
        docker_compose_cmd logs --tail=20 --no-color 2>&1 || true
        
    } > "$report_file"
    
    log_success "Rapport de santé généré: $report_file"
    return 0
}

diagnose_service_issues() {
    local service_name="$1"
    
    log_info "Diagnostic du service: $service_name"
    
    echo "=== DIAGNOSTIC DU SERVICE: $service_name ==="
    echo
    
    # Statut du conteneur
    echo "1. Statut du conteneur:"
    docker_compose_cmd ps "$service_name" 2>&1 || true
    echo
    
    # Logs récents
    echo "2. Logs récents:"
    docker_compose_cmd logs --tail=20 "$service_name" 2>&1 || true
    echo
    
    # Ressources utilisées
    echo "3. Ressources utilisées:"
    docker stats --no-stream "$(docker_compose_cmd ps -q "$service_name" 2>/dev/null)" 2>&1 || true
    echo
    
    # Configuration du service
    echo "4. Configuration du service:"
    docker inspect "$(docker_compose_cmd ps -q "$service_name" 2>/dev/null)" 2>&1 | jq '.[0] | {Name: .Name, Status: .State.Status, Image: .Config.Image, Env: .Config.Env, Ports: .NetworkSettings.Ports}' 2>/dev/null || true
    echo
    
    # Vérification de la connectivité réseau
    echo "5. Connectivité réseau:"
    local container_ip=$(get_container_ip "$(docker_compose_cmd ps -q "$service_name" 2>/dev/null)")
    if [[ -n "$container_ip" ]]; then
        echo "IP du conteneur: $container_ip"
        ping -c 3 "$container_ip" 2>&1 || true
    else
        echo "Impossible de récupérer l'IP du conteneur"
    fi
}

# =============================================================================
# Fonctions d'alerte
# =============================================================================

check_critical_issues() {
    local critical_issues=()
    
    # Vérification de l'espace disque critique
    local disk_usage=$(df . | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 95 ]]; then
        critical_issues+=("Espace disque critique: ${disk_usage}% utilisé")
    fi
    
    # Vérification de la mémoire critique
    local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [[ $mem_usage -gt 95 ]]; then
        critical_issues+=("Mémoire critique: ${mem_usage}% utilisée")
    fi
    
    # Vérification des conteneurs arrêtés
    local stopped_containers=$(docker_compose_cmd ps | grep -c "Exit\|Created" || true)
    if [[ $stopped_containers -gt 0 ]]; then
        critical_issues+=("$stopped_containers conteneur(s) arrêté(s)")
    fi
    
    # Vérification des services critiques non accessibles
    local critical_services=("http://localhost:8000" "http://localhost:4000")
    for service in "${critical_services[@]}"; do
        if ! curl -s -f --max-time 5 "$service" &> /dev/null; then
            critical_issues+=("Service critique non accessible: $service")
        fi
    done
    
    if [[ ${#critical_issues[@]} -gt 0 ]]; then
        log_error "Problèmes critiques détectés:"
        for issue in "${critical_issues[@]}"; do
            echo "  - $issue"
        done
        return 1
    else
        log_success "Aucun problème critique détecté"
        return 0
    fi
}

# =============================================================================
# Fonction principale de vérification de santé
# =============================================================================

perform_health_check() {
    log_info "Démarrage de la vérification de santé complète..."
    
    local checks=(
        check_system_resources
        check_docker_health
        check_service_endpoints
        check_database_connections
        check_log_health
    )
    
    local failed_checks=0
    local total_checks=${#checks[@]}
    
    for check in "${checks[@]}"; do
        echo
        if ! "$check"; then
            ((failed_checks++))
        fi
    done
    
    echo
    echo "=== RÉSUMÉ DE LA VÉRIFICATION DE SANTÉ ==="
    echo "Total des vérifications: $total_checks"
    echo "Vérifications réussies: $((total_checks - failed_checks))"
    echo "Vérifications échouées: $failed_checks"
    
    if [[ $failed_checks -gt 0 ]]; then
        log_error "La vérification de santé a détecté $failed_checks problème(s)"
        return 1
    else
        log_success "Toutes les vérifications de santé ont réussi"
        return 0
    fi
}

# =============================================================================
# Fonctions d'export
# =============================================================================

export -f check_system_resources check_docker_health check_service_endpoints
export -f check_database_connections check_log_health
export -f monitor_system_resources monitor_docker_services monitor_service_endpoints
export -f generate_health_report diagnose_service_issues
export -f check_critical_issues perform_health_check

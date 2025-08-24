#!/bin/bash

# =============================================================================
# Script de vérification de santé pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"
source "$SCRIPT_DIR/utils/health-utils.sh"

# Configuration
readonly HEALTH_LOG_FILE="logs/health.log"
readonly HEALTH_REPORT_DIR="logs/health_reports"

# =============================================================================
# Fonctions de vérification de santé
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  -q, --quick         Vérification rapide (services seulement)"
    echo "  -f, --full          Vérification complète (défaut)"
    echo "  -c, --critical      Vérification des problèmes critiques"
    echo "  -r, --report        Générer un rapport détaillé"
    echo "  -m, --monitor       Monitoring en temps réel"
    echo "  -s, --service NAME  Vérifier un service spécifique"
    echo "  -d, --diagnose      Diagnostic approfondi"
    echo "  -h, --help          Afficher cette aide"
    echo
    echo "Services disponibles:"
    echo "  frontend           Frontend React/Vite"
    echo "  backend            Backend Node.js"
    echo "  backend_python     Backend Python (FastAPI)"
    echo "  backend_llm        Backend LLM"
    echo "  mongodb            Base de données MongoDB"
    echo "  mongo-express      Interface web MongoDB"
    echo
    echo "Exemples:"
    echo "  $0                 # Vérification complète"
    echo "  $0 -q              # Vérification rapide"
    echo "  $0 -s backend_python  # Vérifier le backend Python"
    echo "  $0 -r              # Générer un rapport"
    echo "  $0 -m              # Monitoring en temps réel"
}

quick_health_check() {
    log_info "Vérification rapide de santé..."
    
    echo "=== VÉRIFICATION RAPIDE DE SANTÉ ==="
    echo "Date: $(date)"
    echo
    
    # Vérifier les services Docker
    echo "1. Services Docker:"
    if check_all_services_health; then
        echo "   ✅ Tous les services sont en cours d'exécution"
    else
        echo "   ❌ Certains services ne sont pas en cours d'exécution"
    fi
    echo
    
    # Vérifier les endpoints
    echo "2. Endpoints des services:"
    if check_service_endpoints; then
        echo "   ✅ Tous les endpoints sont accessibles"
    else
        echo "   ❌ Certains endpoints ne sont pas accessibles"
    fi
    echo
    
    # Vérifier les connexions aux bases de données
    echo "3. Connexions aux bases de données:"
    if check_database_connections; then
        echo "   ✅ Toutes les connexions sont établies"
    else
        echo "   ❌ Problèmes de connexion aux bases de données"
    fi
    echo
    
    log_success "Vérification rapide terminée"
}

full_health_check() {
    log_info "Vérification complète de santé..."
    
    echo "=== VÉRIFICATION COMPLÈTE DE SANTÉ ==="
    echo "Date: $(date)"
    echo
    
    # Vérifier les ressources système
    echo "1. Ressources système:"
    check_system_resources
    echo
    
    # Vérifier la santé Docker
    echo "2. Santé Docker:"
    check_docker_health
    echo
    
    # Vérifier les services
    echo "3. Services:"
    check_all_services_health
    echo
    
    # Vérifier les endpoints
    echo "4. Endpoints:"
    check_service_endpoints
    echo
    
    # Vérifier les connexions aux bases de données
    echo "5. Connexions aux bases de données:"
    check_database_connections
    echo
    
    # Vérifier la santé des logs
    echo "6. Santé des logs:"
    check_log_health
    echo
    
    log_success "Vérification complète terminée"
}

critical_health_check() {
    log_info "Vérification des problèmes critiques..."
    
    echo "=== VÉRIFICATION DES PROBLÈMES CRITIQUES ==="
    echo "Date: $(date)"
    echo
    
    local critical_issues=0
    
    # Vérifier l'espace disque critique
    local disk_usage=$(df . | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 95 ]]; then
        echo "❌ ESPACE DISQUE CRITIQUE: ${disk_usage}% utilisé"
        ((critical_issues++))
    else
        echo "✅ Espace disque: ${disk_usage}% utilisé"
    fi
    
    # Vérifier la mémoire critique
    local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [[ $mem_usage -gt 95 ]]; then
        echo "❌ MÉMOIRE CRITIQUE: ${mem_usage}% utilisée"
        ((critical_issues++))
    else
        echo "✅ Mémoire: ${mem_usage}% utilisée"
    fi
    
    # Vérifier les conteneurs arrêtés
    local stopped_containers=$(docker_compose_cmd ps | grep -c "Exit\|Created" || true)
    if [[ $stopped_containers -gt 0 ]]; then
        echo "❌ CONTENEURS ARRÊTÉS: $stopped_containers conteneur(s)"
        ((critical_issues++))
    else
        echo "✅ Tous les conteneurs sont en cours d'exécution"
    fi
    
    # Vérifier les services critiques non accessibles
    local critical_services=("http://localhost:8000" "http://localhost:4000")
    for service in "${critical_services[@]}"; do
        if ! curl -s -f --max-time 5 "$service" &> /dev/null; then
            echo "❌ SERVICE CRITIQUE NON ACCESSIBLE: $service"
            ((critical_issues++))
        else
            echo "✅ Service critique accessible: $service"
        fi
    done
    
    echo
    if [[ $critical_issues -gt 0 ]]; then
        log_error "$critical_issues problème(s) critique(s) détecté(s)"
        return 1
    else
        log_success "Aucun problème critique détecté"
        return 0
    fi
}

service_health_check() {
    local service_name="$1"
    
    log_info "Vérification de santé du service: $service_name"
    
    echo "=== VÉRIFICATION DE SANTÉ: $service_name ==="
    echo "Date: $(date)"
    echo
    
    # Vérifier le statut du conteneur
    echo "1. Statut du conteneur:"
    if check_service_health "$service_name"; then
        echo "   ✅ Conteneur en cours d'exécution"
    else
        echo "   ❌ Conteneur non en cours d'exécution"
    fi
    echo
    
    # Vérifier l'endpoint du service
    echo "2. Endpoint du service:"
    local port=""
    case "$service_name" in
        "frontend") port="80" ;;
        "backend_python") port="8000" ;;
        "backend") port="4000" ;;
        "backend_llm") port="8001" ;;
        "mongo-express") port="8081" ;;
        "mongodb") port="27017" ;;
    esac
    
    if [[ -n "$port" ]]; then
        if wait_for_service "$service_name" "$port" 10; then
            echo "   ✅ Service accessible sur le port $port"
        else
            echo "   ❌ Service non accessible sur le port $port"
        fi
    fi
    echo
    
    # Afficher les logs récents
    echo "3. Logs récents:"
    docker_compose_cmd logs --tail=10 --no-color "$service_name" 2>/dev/null || echo "   Aucun log disponible"
    echo
    
    # Afficher les ressources utilisées
    echo "4. Ressources utilisées:"
    docker stats --no-stream "$(docker_compose_cmd ps -q "$service_name" 2>/dev/null)" 2>/dev/null || echo "   Statistiques non disponibles"
    echo
    
    log_success "Vérification de santé de $service_name terminée"
}

generate_health_report() {
    log_info "Génération du rapport de santé..."
    
    # Créer le répertoire de rapports
    mkdir -p "$HEALTH_REPORT_DIR"
    
    local report_file="$HEALTH_REPORT_DIR/health_report_$(date +%Y%m%d_%H%M%S).txt"
    
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
        
        echo "=== SERVICES ==="
        check_all_services_health 2>&1 || true
        echo
        
        echo "=== ENDPOINTS ==="
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
    echo "Rapport disponible: $report_file"
}

monitor_health() {
    log_info "Démarrage du monitoring de santé en temps réel..."
    
    echo "=== MONITORING DE SANTÉ EN TEMPS RÉEL ==="
    echo "Appuyez sur Ctrl+C pour arrêter"
    echo
    
    while true; do
        clear
        echo "=== $(date) ==="
        echo
        
        # Afficher le statut des services
        echo "Services:"
        docker_compose_cmd ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Aucun service en cours d'exécution"
        echo
        
        # Afficher les ressources système
        echo "Ressources système:"
        echo "  CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')%"
        echo "  Mémoire: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
        echo "  Disque: $(df . | awk 'NR==2 {print $5}') utilisé"
        echo
        
        # Vérifier les problèmes critiques
        echo "Problèmes critiques:"
        local issues=0
        
        # Vérifier l'espace disque
        local disk_usage=$(df . | awk 'NR==2 {print $5}' | sed 's/%//')
        if [[ $disk_usage -gt 90 ]]; then
            echo "  ⚠️  Espace disque: ${disk_usage}%"
            ((issues++))
        fi
        
        # Vérifier la mémoire
        local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        if [[ $mem_usage -gt 90 ]]; then
            echo "  ⚠️  Mémoire: ${mem_usage}%"
            ((issues++))
        fi
        
        # Vérifier les conteneurs arrêtés
        local stopped_containers=$(docker_compose_cmd ps | grep -c "Exit\|Created" || true)
        if [[ $stopped_containers -gt 0 ]]; then
            echo "  ⚠️  Conteneurs arrêtés: $stopped_containers"
            ((issues++))
        fi
        
        if [[ $issues -eq 0 ]]; then
            echo "  ✅ Aucun problème détecté"
        fi
        
        sleep 5
    done
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    # Variables par défaut
    local check_type="full"
    local service_name=""
    local generate_report=false
    local monitor_mode=false
    local diagnose_mode=false
    
    # Parser les arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -q|--quick)
                check_type="quick"
                shift
                ;;
            -f|--full)
                check_type="full"
                shift
                ;;
            -c|--critical)
                check_type="critical"
                shift
                ;;
            -s|--service)
                service_name="$2"
                shift 2
                ;;
            -r|--report)
                generate_report=true
                shift
                ;;
            -m|--monitor)
                monitor_mode=true
                shift
                ;;
            -d|--diagnose)
                diagnose_mode=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -*)
                echo "Option inconnue: $1"
                show_help
                exit 1
                ;;
            *)
                echo "Argument inconnu: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Créer le répertoire de logs
    mkdir -p "$(dirname "$HEALTH_LOG_FILE")"
    
    # Vérifier les prérequis
    if ! verify_environment; then
        log_error "Environnement non valide"
        exit 1
    fi
    
    # Mode monitoring
    if [[ "$monitor_mode" == "true" ]]; then
        monitor_health
        exit 0
    fi
    
    # Mode diagnostic
    if [[ "$diagnose_mode" == "true" ]]; then
        if [[ -n "$service_name" ]]; then
            diagnose_service_issues "$service_name"
        else
            log_error "Service requis pour le diagnostic"
            exit 1
        fi
        exit 0
    fi
    
    # Générer un rapport
    if [[ "$generate_report" == "true" ]]; then
        generate_health_report
        exit 0
    fi
    
    # Vérification de santé selon le type
    case "$check_type" in
        "quick")
            quick_health_check
            ;;
        "full")
            full_health_check
            ;;
        "critical")
            if ! critical_health_check; then
                exit 1
            fi
            ;;
    esac
    
    # Vérification d'un service spécifique
    if [[ -n "$service_name" ]]; then
        echo
        service_health_check "$service_name"
    fi
    
    echo
    echo "=========================================="
    echo "  Vérification de santé terminée"
    echo "=========================================="
    echo
    echo "Commandes utiles:"
    echo "  Monitoring:  $0 -m"
    echo "  Rapport:     $0 -r"
    echo "  Diagnostic:  $0 -d -s SERVICE"
    echo "  Logs:        ./scripts/logs.sh"
    echo
}

# =============================================================================
# Exécution du script
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

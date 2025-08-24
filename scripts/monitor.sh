#!/bin/bash

# =============================================================================
# Script de monitoring pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"
source "$SCRIPT_DIR/utils/health-utils.sh"

# Configuration
readonly MONITOR_LOG_FILE="logs/monitor.log"
readonly MONITOR_INTERVAL=5  # secondes

# =============================================================================
# Fonctions de monitoring
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  -s, --system         Monitoring des ressources système"
    echo "  -d, --docker         Monitoring des services Docker"
    echo "  -e, --endpoints      Monitoring des endpoints"
    echo "  -a, --all            Monitoring complet (défaut)"
    echo "  -i, --interval SEC   Intervalle de rafraîchissement (défaut: 5s)"
    echo "  -l, --log            Enregistrer les données dans un fichier"
    echo "  -h, --help           Afficher cette aide"
    echo
    echo "Exemples:"
    echo "  $0                   # Monitoring complet"
    echo "  $0 -s                # Monitoring système seulement"
    echo "  $0 -i 10             # Rafraîchissement toutes les 10 secondes"
    echo "  $0 -l                # Enregistrer les données"
}

monitor_system_resources() {
    log_info "Démarrage du monitoring des ressources système..."
    
    echo "=== MONITORING DES RESSOURCES SYSTÈME ==="
    echo "Appuyez sur Ctrl+C pour arrêter"
    echo
    
    while true; do
        clear
        echo "=== $(date) ==="
        echo
        
        # CPU
        echo "CPU:"
        echo "  Utilisation: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')%"
        echo "  Charge moyenne: $(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')"
        echo "  Cœurs: $(nproc)"
        echo
        
        # Mémoire
        echo "Mémoire:"
        local total_mem=$(free -m | awk 'NR==2{print $2}')
        local used_mem=$(free -m | awk 'NR==2{print $3}')
        local free_mem=$(free -m | awk 'NR==2{print $4}')
        local mem_usage=$((used_mem * 100 / total_mem))
        
        echo "  Utilisation: ${mem_usage}%"
        echo "  Utilisée: ${used_mem}MB"
        echo "  Libre: ${free_mem}MB"
        echo "  Totale: ${total_mem}MB"
        echo
        
        # Disque
        echo "Disque:"
        local disk_usage=$(df . | awk 'NR==2 {print $5}')
        local disk_used=$(df . | awk 'NR==2 {print $3}')
        local disk_avail=$(df . | awk 'NR==2 {print $4}')
        
        echo "  Utilisation: $disk_usage"
        echo "  Utilisé: $(numfmt --to=iec $((disk_used * 1024)))"
        echo "  Disponible: $(numfmt --to=iec $((disk_avail * 1024)))"
        echo
        
        # Réseau
        echo "Réseau:"
        echo "  Connexions établies: $(netstat -an | grep ESTABLISHED | wc -l)"
        echo "  Connexions en écoute: $(netstat -an | grep LISTEN | wc -l)"
        echo
        
        # Processus
        echo "Processus:"
        echo "  Total: $(ps aux | wc -l)"
        echo "  Docker: $(ps aux | grep docker | wc -l)"
        echo
        
        sleep "$MONITOR_INTERVAL"
    done
}

monitor_docker_services() {
    log_info "Démarrage du monitoring des services Docker..."
    
    echo "=== MONITORING DES SERVICES DOCKER ==="
    echo "Appuyez sur Ctrl+C pour arrêter"
    echo
    
    while true; do
        clear
        echo "=== $(date) ==="
        echo
        
        # Statut des services
        echo "Services:"
        docker_compose_cmd ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Aucun service en cours d'exécution"
        echo
        
        # Statistiques des conteneurs
        echo "Statistiques des conteneurs:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" 2>/dev/null || echo "Aucune statistique disponible"
        echo
        
        # Ressources Docker
        echo "Ressources Docker:"
        docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}" 2>/dev/null || echo "Aucune information disponible"
        echo
        
        # Logs récents
        echo "Logs récents:"
        docker_compose_cmd logs --tail=5 --no-color 2>/dev/null || echo "Aucun log disponible"
        echo
        
        sleep "$MONITOR_INTERVAL"
    done
}

monitor_endpoints() {
    log_info "Démarrage du monitoring des endpoints..."
    
    echo "=== MONITORING DES ENDPOINTS ==="
    echo "Appuyez sur Ctrl+C pour arrêter"
    echo
    
    local endpoints=(
        "http://localhost:80|Frontend"
        "http://localhost:8000|Backend Python"
        "http://localhost:4000|Backend Node.js"
        "http://localhost:8001|Backend LLM"
        "http://localhost:8081|Mongo Express"
    )
    
    while true; do
        clear
        echo "=== $(date) ==="
        echo
        
        echo "Endpoints:"
        for endpoint in "${endpoints[@]}"; do
            local url="${endpoint%|*}"
            local name="${endpoint#*|}"
            local start_time=$(date +%s.%N)
            
            if curl -s -f --max-time 5 "$url" &> /dev/null; then
                local end_time=$(date +%s.%N)
                local response_time=$(echo "$end_time - $start_time" | bc)
                echo "  ✅ $name: ${response_time}s"
            else
                echo "  ❌ $name: Timeout/Erreur"
            fi
        done
        echo
        
        # Test des APIs
        echo "APIs:"
        local apis=(
            "http://localhost:8000/health|Backend Python API"
            "http://localhost:4000/health|Backend Node.js API"
            "http://localhost:8001/health|Backend LLM API"
        )
        
        for api in "${apis[@]}"; do
            local url="${api%|*}"
            local name="${api#*|}"
            local start_time=$(date +%s.%N)
            
            if curl -s -f --max-time 5 "$url" &> /dev/null; then
                local end_time=$(date +%s.%N)
                local response_time=$(echo "$end_time - $start_time" | bc)
                echo "  ✅ $name: ${response_time}s"
            else
                echo "  ❌ $name: Timeout/Erreur"
            fi
        done
        echo
        
        sleep "$MONITOR_INTERVAL"
    done
}

monitor_all() {
    log_info "Démarrage du monitoring complet..."
    
    echo "=== MONITORING COMPLET SIO ==="
    echo "Appuyez sur Ctrl+C pour arrêter"
    echo
    
    while true; do
        clear
        echo "=== $(date) ==="
        echo
        
        # Ressources système
        echo "=== RESSOURCES SYSTÈME ==="
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')% | Mémoire: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}') | Disque: $(df . | awk 'NR==2 {print $5}')"
        echo
        
        # Services Docker
        echo "=== SERVICES DOCKER ==="
        docker_compose_cmd ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Aucun service en cours d'exécution"
        echo
        
        # Endpoints
        echo "=== ENDPOINTS ==="
        local endpoints=(
            "http://localhost:80|Frontend"
            "http://localhost:8000|Backend Python"
            "http://localhost:4000|Backend Node.js"
            "http://localhost:8001|Backend LLM"
            "http://localhost:8081|Mongo Express"
        )
        
        for endpoint in "${endpoints[@]}"; do
            local url="${endpoint%|*}"
            local name="${endpoint#*|}"
            
            if curl -s -f --max-time 3 "$url" &> /dev/null; then
                echo "  ✅ $name"
            else
                echo "  ❌ $name"
            fi
        done
        echo
        
        # Alertes
        echo "=== ALERTES ==="
        local alerts=0
        
        # Vérifier l'espace disque
        local disk_usage=$(df . | awk 'NR==2 {print $5}' | sed 's/%//')
        if [[ $disk_usage -gt 90 ]]; then
            echo "  ⚠️  Espace disque critique: ${disk_usage}%"
            ((alerts++))
        fi
        
        # Vérifier la mémoire
        local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        if [[ $mem_usage -gt 90 ]]; then
            echo "  ⚠️  Mémoire critique: ${mem_usage}%"
            ((alerts++))
        fi
        
        # Vérifier les conteneurs arrêtés
        local stopped_containers=$(docker_compose_cmd ps | grep -c "Exit\|Created" || true)
        if [[ $stopped_containers -gt 0 ]]; then
            echo "  ⚠️  Conteneurs arrêtés: $stopped_containers"
            ((alerts++))
        fi
        
        if [[ $alerts -eq 0 ]]; then
            echo "  ✅ Aucune alerte"
        fi
        echo
        
        sleep "$MONITOR_INTERVAL"
    done
}

log_monitoring_data() {
    local log_file="logs/monitoring_$(date +%Y%m%d_%H%M%S).log"
    
    log_info "Enregistrement des données de monitoring dans $log_file..."
    
    # Créer le répertoire de logs
    mkdir -p "$(dirname "$log_file")"
    
    # Fonction pour enregistrer les données
    log_data() {
        echo "$(date -Iseconds),$1" >> "$log_file"
    }
    
    # Enregistrer les données en continu
    while true; do
        # Ressources système
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
        local mem_usage=$(free -m | awk 'NR==2{printf "%.1f", $3*100/$2}')
        local disk_usage=$(df . | awk 'NR==2 {print $5}' | sed 's/%//')
        
        log_data "system,cpu=$cpu_usage,memory=$mem_usage,disk=$disk_usage"
        
        # Services Docker
        local running_services=$(docker_compose_cmd ps --quiet | wc -l)
        log_data "docker,services=$running_services"
        
        # Endpoints
        local endpoints_up=0
        local endpoints=("http://localhost:80" "http://localhost:8000" "http://localhost:4000" "http://localhost:8001" "http://localhost:8081")
        
        for endpoint in "${endpoints[@]}"; do
            if curl -s -f --max-time 3 "$endpoint" &> /dev/null; then
                ((endpoints_up++))
            fi
        done
        
        log_data "endpoints,up=$endpoints_up,total=${#endpoints[@]}"
        
        sleep "$MONITOR_INTERVAL"
    done
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    # Variables par défaut
    local monitor_system=false
    local monitor_docker=false
    local monitor_endpoints=false
    local monitor_all_flag=true
    local log_data_flag=false
    
    # Parser les arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -s|--system)
                monitor_system=true
                monitor_all_flag=false
                shift
                ;;
            -d|--docker)
                monitor_docker=true
                monitor_all_flag=false
                shift
                ;;
            -e|--endpoints)
                monitor_endpoints=true
                monitor_all_flag=false
                shift
                ;;
            -a|--all)
                monitor_all_flag=true
                shift
                ;;
            -i|--interval)
                MONITOR_INTERVAL="$2"
                shift 2
                ;;
            -l|--log)
                log_data_flag=true
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
    mkdir -p "$(dirname "$MONITOR_LOG_FILE")"
    
    # Vérifier les prérequis
    if ! verify_environment; then
        log_error "Environnement non valide"
        exit 1
    fi
    
    # Mode enregistrement des données
    if [[ "$log_data_flag" == "true" ]]; then
        log_monitoring_data
        exit 0
    fi
    
    # Démarrer le monitoring selon le type
    if [[ "$monitor_all_flag" == "true" ]]; then
        monitor_all
    elif [[ "$monitor_system" == "true" ]]; then
        monitor_system_resources
    elif [[ "$monitor_docker" == "true" ]]; then
        monitor_docker_services
    elif [[ "$monitor_endpoints" == "true" ]]; then
        monitor_endpoints
    else
        monitor_all
    fi
}

# =============================================================================
# Exécution du script
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

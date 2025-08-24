#!/bin/bash

# =============================================================================
# Script de gestion des logs pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"

# Configuration
readonly LOGS_DIR="logs"
readonly MAX_LOG_LINES=1000

# =============================================================================
# Fonctions de gestion des logs
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTION] [SERVICE]"
    echo
    echo "Options:"
    echo "  -a, --all           Afficher les logs de tous les services"
    echo "  -f, --follow        Suivre les logs en temps réel"
    echo "  -n, --lines N       Afficher les N dernières lignes (défaut: 50)"
    echo "  -e, --errors        Afficher seulement les erreurs"
    echo "  -s, --since TIME    Afficher les logs depuis TIME (ex: 1h, 2d)"
    echo "  -u, --until TIME    Afficher les logs jusqu'à TIME"
    echo "  --save FILE         Sauvegarder les logs dans FILE"
    echo "  --clean             Nettoyer les anciens logs"
    echo "  --rotate            Rotation des logs"
    echo "  --stats             Statistiques des logs"
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
    echo "  $0                    # Logs de tous les services (50 dernières lignes)"
    echo "  $0 -f                 # Suivre tous les logs en temps réel"
    echo "  $0 backend_python     # Logs du backend Python"
    echo "  $0 -n 100 -e          # 100 dernières erreurs de tous les services"
    echo "  $0 -s 1h --save logs.txt  # Logs de la dernière heure sauvegardés"
}

get_all_services() {
    docker_compose_cmd ps --services
}

show_logs() {
    local service="$1"
    local lines="${2:-50}"
    local follow="${3:-false}"
    local since="${4:-}"
    local until="${5:-}"
    local errors_only="${6:-false}"
    
    local cmd_args=()
    
    # Ajouter les arguments selon les options
    if [[ "$follow" == "true" ]]; then
        cmd_args+=("-f")
    fi
    
    if [[ -n "$since" ]]; then
        cmd_args+=("--since=$since")
    fi
    
    if [[ -n "$until" ]]; then
        cmd_args+=("--until=$until")
    fi
    
    if [[ "$errors_only" == "true" ]]; then
        cmd_args+=("--tail=$lines")
        # Filtrer les erreurs après récupération
        docker_compose_cmd logs "${cmd_args[@]}" "$service" 2>&1 | grep -i "error\|exception\|failed\|critical" || true
    else
        cmd_args+=("--tail=$lines")
        docker_compose_cmd logs "${cmd_args[@]}" "$service"
    fi
}

show_all_logs() {
    local lines="${1:-50}"
    local follow="${2:-false}"
    local since="${3:-}"
    local until="${4:-}"
    local errors_only="${5:-false}"
    
    local services=($(get_all_services))
    
    for service in "${services[@]}"; do
        echo "=========================================="
        echo "  Logs de $service"
        echo "=========================================="
        echo
        
        show_logs "$service" "$lines" "$follow" "$since" "$until" "$errors_only"
        
        echo
        echo
    done
}

save_logs() {
    local output_file="$1"
    local lines="${2:-50}"
    local since="${3:-}"
    local until="${4:-}"
    
    log_info "Sauvegarde des logs dans $output_file..."
    
    # Créer le répertoire parent si nécessaire
    local output_dir=$(dirname "$output_file")
    if [[ ! -d "$output_dir" ]]; then
        mkdir -p "$output_dir"
    fi
    
    # Sauvegarder les logs
    {
        echo "=== LOGS SIO - $(date) ==="
        echo
        
        local services=($(get_all_services))
        
        for service in "${services[@]}"; do
            echo "=== $service ==="
            show_logs "$service" "$lines" "false" "$since" "$until" "false"
            echo
        done
        
    } > "$output_file"
    
    log_success "Logs sauvegardés dans $output_file"
}

clean_logs() {
    log_info "Nettoyage des anciens logs..."
    
    # Nettoyer les logs Docker
    docker system prune -f --volumes
    
    # Nettoyer les fichiers de logs locaux
    if [[ -d "$LOGS_DIR" ]]; then
        find "$LOGS_DIR" -name "*.log" -mtime +7 -delete
        log_info "Logs locaux nettoyés"
    fi
    
    log_success "Nettoyage des logs terminé"
}

rotate_logs() {
    log_info "Rotation des logs..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local rotated_dir="$LOGS_DIR/rotated_$timestamp"
    
    # Créer le répertoire de rotation
    mkdir -p "$rotated_dir"
    
    # Sauvegarder les logs actuels
    save_logs "$rotated_dir/all_logs.log" 1000
    
    # Nettoyer les logs Docker
    docker system prune -f --volumes
    
    log_success "Rotation des logs terminée: $rotated_dir"
}

show_log_stats() {
    log_info "Statistiques des logs..."
    
    echo "=== STATISTIQUES DES LOGS ==="
    echo
    
    local services=($(get_all_services))
    
    for service in "${services[@]}"; do
        echo "Service: $service"
        
        # Nombre total de lignes
        local total_lines=$(docker_compose_cmd logs --no-color "$service" 2>/dev/null | wc -l)
        echo "  Total de lignes: $total_lines"
        
        # Nombre d'erreurs
        local error_lines=$(docker_compose_cmd logs --no-color "$service" 2>/dev/null | grep -i "error\|exception\|failed\|critical" | wc -l)
        echo "  Erreurs: $error_lines"
        
        # Taille des logs
        local log_size=$(docker_compose_cmd logs --no-color "$service" 2>/dev/null | wc -c)
        echo "  Taille: $(numfmt --to=iec $log_size)"
        
        # Dernière activité
        local last_activity=$(docker_compose_cmd logs --no-color --tail=1 "$service" 2>/dev/null | head -1 | cut -d' ' -f1-2 || echo "Aucune")
        echo "  Dernière activité: $last_activity"
        
        echo
    done
    
    # Statistiques globales
    echo "=== STATISTIQUES GLOBALES ==="
    echo
    
    local total_logs=$(docker_compose_cmd logs --no-color 2>/dev/null | wc -l)
    local total_errors=$(docker_compose_cmd logs --no-color 2>/dev/null | grep -i "error\|exception\|failed\|critical" | wc -l)
    local total_size=$(docker_compose_cmd logs --no-color 2>/dev/null | wc -c)
    
    echo "Total de lignes: $total_logs"
    echo "Total d'erreurs: $total_errors"
    echo "Taille totale: $(numfmt --to=iec $total_size)"
    
    if [[ $total_logs -gt 0 ]]; then
        local error_rate=$((total_errors * 100 / total_logs))
        echo "Taux d'erreur: ${error_rate}%"
    fi
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    # Variables par défaut
    local service=""
    local lines=50
    local follow=false
    local since=""
    local until=""
    local errors_only=false
    local save_file=""
    local clean_logs=false
    local rotate_logs=false
    local show_stats=false
    
    # Parser les arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -a|--all)
                service="all"
                shift
                ;;
            -f|--follow)
                follow=true
                shift
                ;;
            -n|--lines)
                lines="$2"
                shift 2
                ;;
            -e|--errors)
                errors_only=true
                shift
                ;;
            -s|--since)
                since="$2"
                shift 2
                ;;
            -u|--until)
                until="$2"
                shift 2
                ;;
            --save)
                save_file="$2"
                shift 2
                ;;
            --clean)
                clean_logs=true
                shift
                ;;
            --rotate)
                rotate_logs=true
                shift
                ;;
            --stats)
                show_stats=true
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
                if [[ -z "$service" ]]; then
                    service="$1"
                else
                    echo "Service déjà spécifié: $service"
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Vérifier les prérequis
    if ! verify_environment; then
        log_error "Environnement non valide"
        exit 1
    fi
    
    # Actions spéciales
    if [[ "$clean_logs" == "true" ]]; then
        clean_logs
        exit 0
    fi
    
    if [[ "$rotate_logs" == "true" ]]; then
        rotate_logs
        exit 0
    fi
    
    if [[ "$show_stats" == "true" ]]; then
        show_log_stats
        exit 0
    fi
    
    # Sauvegarder les logs si demandé
    if [[ -n "$save_file" ]]; then
        save_logs "$save_file" "$lines" "$since" "$until"
        exit 0
    fi
    
    # Afficher les logs
    if [[ -z "$service" || "$service" == "all" ]]; then
        show_all_logs "$lines" "$follow" "$since" "$until" "$errors_only"
    else
        # Vérifier que le service existe
        local services=($(get_all_services))
        if [[ ! " ${services[@]} " =~ " ${service} " ]]; then
            log_error "Service inconnu: $service"
            echo "Services disponibles: ${services[*]}"
            exit 1
        fi
        
        show_logs "$service" "$lines" "$follow" "$since" "$until" "$errors_only"
    fi
}

# =============================================================================
# Exécution du script
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

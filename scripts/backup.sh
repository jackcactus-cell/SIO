#!/bin/bash

# =============================================================================
# Script de sauvegarde pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"
source "$SCRIPT_DIR/utils/backup-utils.sh"

# Configuration
readonly BACKUP_LOG_FILE="logs/backup.log"

# =============================================================================
# Fonctions de sauvegarde
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  -f, --full           Sauvegarde complète (défaut)"
    echo "  -d, --data           Sauvegarde des données seulement"
    echo "  -c, --config         Sauvegarde de la configuration seulement"
    echo "  -l, --logs           Sauvegarde des logs seulement"
    echo "  -v, --volumes        Sauvegarde des volumes Docker"
    echo "  -a, --auto           Sauvegarde automatique (cron)"
    echo "  -r, --restore FILE   Restaurer depuis un fichier de sauvegarde"
    echo "  -l, --list           Lister les sauvegardes disponibles"
    echo "  -c, --clean          Nettoyer les anciennes sauvegardes"
    echo "  -h, --help           Afficher cette aide"
    echo
    echo "Exemples:"
    echo "  $0                   # Sauvegarde complète"
    echo "  $0 -d                # Sauvegarde des données"
    echo "  $0 -r backup.tar.gz  # Restaurer depuis backup.tar.gz"
    echo "  $0 -l                # Lister les sauvegardes"
    echo "  $0 -c                # Nettoyer les anciennes sauvegardes"
}

perform_full_backup() {
    log_info "Démarrage de la sauvegarde complète..."
    
    local backup_dir="backups/full_$(date +%Y%m%d_%H%M%S)"
    
    if create_full_backup "$backup_dir"; then
        log_success "Sauvegarde complète créée: $backup_dir"
        return 0
    else
        log_error "Échec de la sauvegarde complète"
        return 1
    fi
}

perform_data_backup() {
    log_info "Démarrage de la sauvegarde des données..."
    
    local backup_dir="backups/data_$(date +%Y%m%d_%H%M%S)"
    
    if backup_mongodb_data "$backup_dir"; then
        log_success "Sauvegarde des données créée: $backup_dir"
        return 0
    else
        log_error "Échec de la sauvegarde des données"
        return 1
    fi
}

perform_config_backup() {
    log_info "Démarrage de la sauvegarde de la configuration..."
    
    local backup_dir="backups/config_$(date +%Y%m%d_%H%M%S)"
    
    if backup_config_files "$backup_dir"; then
        log_success "Sauvegarde de la configuration créée: $backup_dir"
        return 0
    else
        log_error "Échec de la sauvegarde de la configuration"
        return 1
    fi
}

perform_logs_backup() {
    log_info "Démarrage de la sauvegarde des logs..."
    
    local backup_dir="backups/logs_$(date +%Y%m%d_%H%M%S)"
    
    if backup_logs "$backup_dir"; then
        log_success "Sauvegarde des logs créée: $backup_dir"
        return 0
    else
        log_error "Échec de la sauvegarde des logs"
        return 1
    fi
}

perform_volumes_backup() {
    log_info "Démarrage de la sauvegarde des volumes..."
    
    local backup_dir="backups/volumes_$(date +%Y%m%d_%H%M%S)"
    
    if backup_docker_volumes "$backup_dir"; then
        log_success "Sauvegarde des volumes créée: $backup_dir"
        return 0
    else
        log_error "Échec de la sauvegarde des volumes"
        return 1
    fi
}

restore_backup() {
    local backup_file="$1"
    
    log_info "Restauration depuis: $backup_file"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Fichier de sauvegarde non trouvé: $backup_file"
        return 1
    fi
    
    # Détecter le type de sauvegarde
    local backup_type=""
    if [[ "$backup_file" == *"mongodb_"* ]]; then
        backup_type="mongodb"
    elif [[ "$backup_file" == *"config_"* ]]; then
        backup_type="config"
    elif [[ "$backup_file" == *"volumes_"* ]]; then
        backup_type="volumes"
    elif [[ "$backup_file" == *"full_"* ]]; then
        backup_type="full"
    else
        backup_type="unknown"
    fi
    
    echo "Type de sauvegarde détecté: $backup_type"
    echo "ATTENTION: Cette opération va écraser les données existantes!"
    read -p "Continuer? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Restauration annulée"
        return 0
    fi
    
    # Restaurer selon le type
    case "$backup_type" in
        "mongodb")
            if restore_mongodb_data "$backup_file"; then
                log_success "Restauration MongoDB terminée"
                return 0
            else
                log_error "Échec de la restauration MongoDB"
                return 1
            fi
            ;;
        "config")
            if restore_config_files "$backup_file"; then
                log_success "Restauration de la configuration terminée"
                return 0
            else
                log_error "Échec de la restauration de la configuration"
                return 1
            fi
            ;;
        "volumes")
            if restore_docker_volumes "$backup_file"; then
                log_success "Restauration des volumes terminée"
                return 0
            else
                log_error "Échec de la restauration des volumes"
                return 1
            fi
            ;;
        "full")
            log_info "Restauration complète..."
            # Pour une sauvegarde complète, restaurer chaque composant
            # Cette fonctionnalité nécessiterait une implémentation plus complexe
            log_warning "Restauration complète non implémentée"
            return 1
            ;;
        *)
            log_error "Type de sauvegarde non reconnu"
            return 1
            ;;
    esac
}

list_backups() {
    log_info "Liste des sauvegardes disponibles..."
    
    if list_backups; then
        log_success "Liste des sauvegardes affichée"
        return 0
    else
        log_error "Échec de l'affichage des sauvegardes"
        return 1
    fi
}

cleanup_old_backups() {
    log_info "Nettoyage des anciennes sauvegardes..."
    
    local retention_days="${1:-30}"
    
    if cleanup_old_backups "backups" "$retention_days"; then
        log_success "Nettoyage des sauvegardes terminé"
        return 0
    else
        log_error "Échec du nettoyage des sauvegardes"
        return 1
    fi
}

setup_auto_backup() {
    log_info "Configuration de la sauvegarde automatique..."
    
    # Créer le script de sauvegarde automatique
    local auto_backup_script="/usr/local/bin/sio-auto-backup.sh"
    
    cat > "$auto_backup_script" << 'EOF'
#!/bin/bash

# Script de sauvegarde automatique SIO
cd /path/to/sio/project
./scripts/backup.sh -f >> logs/auto_backup.log 2>&1
EOF
    
    chmod +x "$auto_backup_script"
    
    # Ajouter au crontab
    local cron_job="0 2 * * * $auto_backup_script"
    
    if crontab -l 2>/dev/null | grep -q "$auto_backup_script"; then
        log_info "Tâche cron déjà configurée"
    else
        (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
        log_success "Tâche cron ajoutée: sauvegarde quotidienne à 2h00"
    fi
    
    log_success "Sauvegarde automatique configurée"
}

verify_backup_integrity() {
    local backup_file="$1"
    
    log_info "Vérification de l'intégrité de la sauvegarde: $backup_file"
    
    if verify_backup_integrity "$backup_file"; then
        log_success "Sauvegarde valide: $backup_file"
        return 0
    else
        log_error "Sauvegarde corrompue: $backup_file"
        return 1
    fi
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    # Variables par défaut
    local backup_type="full"
    local restore_file=""
    local list_mode=false
    local cleanup_mode=false
    local auto_backup=false
    local verify_file=""
    
    # Parser les arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--full)
                backup_type="full"
                shift
                ;;
            -d|--data)
                backup_type="data"
                shift
                ;;
            -c|--config)
                backup_type="config"
                shift
                ;;
            -l|--logs)
                backup_type="logs"
                shift
                ;;
            -v|--volumes)
                backup_type="volumes"
                shift
                ;;
            -r|--restore)
                restore_file="$2"
                shift 2
                ;;
            -l|--list)
                list_mode=true
                shift
                ;;
            -c|--clean)
                cleanup_mode=true
                shift
                ;;
            -a|--auto)
                auto_backup=true
                shift
                ;;
            --verify)
                verify_file="$2"
                shift 2
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
    mkdir -p "$(dirname "$BACKUP_LOG_FILE")"
    
    # Vérifier les prérequis
    if ! verify_environment; then
        log_error "Environnement non valide"
        exit 1
    fi
    
    # Actions spéciales
    if [[ "$list_mode" == "true" ]]; then
        list_backups
        exit 0
    fi
    
    if [[ "$cleanup_mode" == "true" ]]; then
        cleanup_old_backups
        exit 0
    fi
    
    if [[ "$auto_backup" == "true" ]]; then
        setup_auto_backup
        exit 0
    fi
    
    if [[ -n "$verify_file" ]]; then
        verify_backup_integrity "$verify_file"
        exit 0
    fi
    
    # Restauration
    if [[ -n "$restore_file" ]]; then
        if restore_backup "$restore_file"; then
            echo
            echo "=========================================="
            echo "  Restauration terminée avec succès!"
            echo "=========================================="
            echo
            echo "Prochaines étapes:"
            echo "1. Redémarrer les services: ./scripts/restart.sh"
            echo "2. Vérifier la santé: ./scripts/health-check.sh"
            echo
        else
            log_error "Échec de la restauration"
            exit 1
        fi
        exit 0
    fi
    
    # Sauvegarde
    echo "=========================================="
    echo "  Sauvegarde SIO"
    echo "=========================================="
    echo
    
    local success=false
    
    case "$backup_type" in
        "full")
            if perform_full_backup; then
                success=true
            fi
            ;;
        "data")
            if perform_data_backup; then
                success=true
            fi
            ;;
        "config")
            if perform_config_backup; then
                success=true
            fi
            ;;
        "logs")
            if perform_logs_backup; then
                success=true
            fi
            ;;
        "volumes")
            if perform_volumes_backup; then
                success=true
            fi
            ;;
        *)
            log_error "Type de sauvegarde inconnu: $backup_type"
            exit 1
            ;;
    esac
    
    if [[ "$success" == "true" ]]; then
        echo
        echo "=========================================="
        echo "  Sauvegarde terminée avec succès!"
        echo "=========================================="
        echo
        echo "Commandes utiles:"
        echo "  Lister:     $0 -l"
        echo "  Restaurer:  $0 -r FILE"
        echo "  Nettoyer:   $0 -c"
        echo "  Auto:       $0 -a"
        echo
    else
        log_error "Échec de la sauvegarde"
        exit 1
    fi
}

# =============================================================================
# Exécution du script
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

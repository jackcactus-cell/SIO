#!/bin/bash

# =============================================================================
# Script de restauration pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"
source "$SCRIPT_DIR/utils/backup-utils.sh"

# Configuration
readonly RESTORE_LOG_FILE="logs/restore.log"

# =============================================================================
# Fonctions de restauration
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTION] [BACKUP_PATH]"
    echo
    echo "Options:"
    echo "  -f, --full BACKUP_PATH    Restauration complète depuis un backup"
    echo "  -d, --data BACKUP_PATH    Restauration des données seulement"
    echo "  -c, --config BACKUP_PATH  Restauration de la configuration"
    echo "  -v, --volumes BACKUP_PATH Restauration des volumes Docker"
    echo "  -l, --list               Lister les backups disponibles"
    echo "  -i, --info BACKUP_PATH   Informations sur un backup"
    echo "  -f, --force              Restauration forcée"
    echo "  -h, --help               Afficher cette aide"
    echo
    echo "Exemples:"
    echo "  $0 -l                    # Lister les backups"
    echo "  $0 -f backups/20231201_143022_full"
    echo "  $0 -d backups/20231201_143022_full"
    echo "  $0 -i backups/20231201_143022_full"
    echo "  $0 --force -f backups/20231201_143022_full"
}

list_available_backups() {
    log_info "Backups disponibles:"
    echo
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_warning "Aucun répertoire de backup trouvé: $BACKUP_DIR"
        return 1
    fi
    
    local found_backups=false
    
    for backup in "$BACKUP_DIR"/*; do
        if [[ -d "$backup" ]]; then
            local backup_name=$(basename "$backup")
            local backup_date=$(echo "$backup_name" | grep -oE '[0-9]{8}_[0-9]{6}' || echo "Date inconnue")
            local backup_size=$(du -sh "$backup" 2>/dev/null | cut -f1 || echo "Taille inconnue")
            
            echo "  📁 $backup_name"
            echo "     Date: $backup_date"
            echo "     Taille: $backup_size"
            
            # Vérifier l'intégrité
            if verify_backup_integrity "$backup"; then
                echo "     ✅ Intégrité: OK"
            else
                echo "     ❌ Intégrité: CORROMPU"
            fi
            echo
            
            found_backups=true
        fi
    done
    
    if [[ "$found_backups" == "false" ]]; then
        log_warning "Aucun backup trouvé dans $BACKUP_DIR"
        return 1
    fi
    
    return 0
}

get_backup_info() {
    local backup_path="$1"
    
    if [[ ! -d "$backup_path" ]]; then
        log_error "Backup introuvable: $backup_path"
        return 1
    fi
    
    echo "=========================================="
    echo "  Informations sur le backup"
    echo "=========================================="
    echo
    echo "Chemin: $backup_path"
    echo "Nom: $(basename "$backup_path")"
    echo "Taille: $(du -sh "$backup_path" | cut -f1)"
    echo "Date de création: $(stat -c %y "$backup_path" 2>/dev/null || echo "Inconnue")"
    echo
    
    # Vérifier l'intégrité
    echo "Vérification de l'intégrité..."
    if verify_backup_integrity "$backup_path"; then
        echo "✅ Intégrité: OK"
    else
        echo "❌ Intégrité: CORROMPU"
        return 1
    fi
    echo
    
    # Afficher le contenu
    echo "Contenu du backup:"
    if [[ -f "$backup_path/metadata.json" ]]; then
        echo "  📄 metadata.json - Informations sur le backup"
    fi
    
    if [[ -d "$backup_path/mongodb" ]]; then
        echo "  🗄️  mongodb/ - Données MongoDB"
    fi
    
    if [[ -d "$backup_path/config" ]]; then
        echo "  ⚙️  config/ - Fichiers de configuration"
    fi
    
    if [[ -d "$backup_path/logs" ]]; then
        echo "  📋 logs/ - Fichiers de logs"
    fi
    
    if [[ -d "$backup_path/volumes" ]]; then
        echo "  📦 volumes/ - Volumes Docker"
    fi
    
    echo
    
    # Afficher les métadonnées si disponibles
    if [[ -f "$backup_path/metadata.json" ]]; then
        echo "Métadonnées:"
        if command -v jq &> /dev/null; then
            jq '.' "$backup_path/metadata.json" 2>/dev/null || cat "$backup_path/metadata.json"
        else
            cat "$backup_path/metadata.json"
        fi
    fi
    
    return 0
}

restore_full_backup() {
    local backup_path="$1"
    local force_mode="$2"
    
    log_info "Restauration complète depuis: $backup_path"
    
    # Vérifier l'intégrité du backup
    if ! verify_backup_integrity "$backup_path"; then
        log_error "Backup corrompu: $backup_path"
        return 1
    fi
    
    # Arrêter les services
    log_info "Arrêt des services..."
    if ! stop_services; then
        log_warning "Échec de l'arrêt des services"
    fi
    
    # Créer un backup de l'état actuel
    if [[ "$force_mode" != "true" ]]; then
        log_info "Création d'un backup de l'état actuel..."
        local pre_restore_backup="backups/pre_restore_$(date +%Y%m%d_%H%M%S)"
        if create_full_backup "$pre_restore_backup"; then
            log_success "Backup de sécurité créé: $pre_restore_backup"
        else
            log_warning "Échec de la création du backup de sécurité"
        fi
    fi
    
    # Restaurer les données MongoDB
    if [[ -d "$backup_path/mongodb" ]]; then
        log_info "Restauration des données MongoDB..."
        if ! restore_mongodb_data "$backup_path/mongodb"; then
            log_error "Échec de la restauration MongoDB"
            return 1
        fi
    fi
    
    # Restaurer la configuration
    if [[ -d "$backup_path/config" ]]; then
        log_info "Restauration de la configuration..."
        if ! restore_config_files "$backup_path/config"; then
            log_error "Échec de la restauration de la configuration"
            return 1
        fi
    fi
    
    # Restaurer les volumes Docker
    if [[ -d "$backup_path/volumes" ]]; then
        log_info "Restauration des volumes Docker..."
        if ! restore_docker_volumes "$backup_path/volumes"; then
            log_error "Échec de la restauration des volumes"
            return 1
        fi
    fi
    
    # Redémarrer les services
    log_info "Redémarrage des services..."
    if ! start_services; then
        log_error "Échec du redémarrage des services"
        return 1
    fi
    
    # Vérifier la restauration
    log_info "Vérification de la restauration..."
    if ! verify_restoration; then
        log_warning "La restauration a été effectuée mais certains problèmes ont été détectés"
    fi
    
    log_success "Restauration complète terminée"
    return 0
}

restore_data_only() {
    local backup_path="$1"
    
    log_info "Restauration des données depuis: $backup_path"
    
    # Vérifier l'intégrité du backup
    if ! verify_backup_integrity "$backup_path"; then
        log_error "Backup corrompu: $backup_path"
        return 1
    fi
    
    # Restaurer les données MongoDB
    if [[ -d "$backup_path/mongodb" ]]; then
        log_info "Restauration des données MongoDB..."
        if ! restore_mongodb_data "$backup_path/mongodb"; then
            log_error "Échec de la restauration MongoDB"
            return 1
        fi
    else
        log_warning "Aucune donnée MongoDB trouvée dans le backup"
    fi
    
    log_success "Restauration des données terminée"
    return 0
}

restore_config_only() {
    local backup_path="$1"
    
    log_info "Restauration de la configuration depuis: $backup_path"
    
    # Vérifier l'intégrité du backup
    if ! verify_backup_integrity "$backup_path"; then
        log_error "Backup corrompu: $backup_path"
        return 1
    fi
    
    # Restaurer la configuration
    if [[ -d "$backup_path/config" ]]; then
        log_info "Restauration de la configuration..."
        if ! restore_config_files "$backup_path/config"; then
            log_error "Échec de la restauration de la configuration"
            return 1
        fi
    else
        log_warning "Aucune configuration trouvée dans le backup"
    fi
    
    log_success "Restauration de la configuration terminée"
    return 0
}

restore_volumes_only() {
    local backup_path="$1"
    
    log_info "Restauration des volumes depuis: $backup_path"
    
    # Vérifier l'intégrité du backup
    if ! verify_backup_integrity "$backup_path"; then
        log_error "Backup corrompu: $backup_path"
        return 1
    fi
    
    # Arrêter les services
    log_info "Arrêt des services..."
    if ! stop_services; then
        log_warning "Échec de l'arrêt des services"
    fi
    
    # Restaurer les volumes Docker
    if [[ -d "$backup_path/volumes" ]]; then
        log_info "Restauration des volumes Docker..."
        if ! restore_docker_volumes "$backup_path/volumes"; then
            log_error "Échec de la restauration des volumes"
            return 1
        fi
    else
        log_warning "Aucun volume trouvé dans le backup"
    fi
    
    # Redémarrer les services
    log_info "Redémarrage des services..."
    if ! start_services; then
        log_error "Échec du redémarrage des services"
        return 1
    fi
    
    log_success "Restauration des volumes terminée"
    return 0
}

verify_restoration() {
    log_info "Vérification de la restauration..."
    
    # Vérifier la santé des services
    if ! perform_health_check; then
        log_warning "Certains services ne sont pas en bonne santé après la restauration"
        return 1
    fi
    
    # Vérifier les connexions aux bases de données
    if ! check_database_connections; then
        log_warning "Problèmes de connexion aux bases de données après la restauration"
        return 1
    fi
    
    # Vérifier les endpoints
    if ! check_service_endpoints; then
        log_warning "Certains endpoints ne sont pas accessibles après la restauration"
        return 1
    fi
    
    log_success "Restauration vérifiée avec succès"
    return 0
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    # Variables par défaut
    local restore_type=""
    local backup_path=""
    local force_mode=false
    local list_backups=false
    local info_backup=""
    
    # Parser les arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--full)
                restore_type="full"
                if [[ -n "$2" && "$2" != -* ]]; then
                    backup_path="$2"
                    shift 2
                else
                    log_error "Chemin du backup requis pour --full"
                    show_help
                    exit 1
                fi
                ;;
            -d|--data)
                restore_type="data"
                if [[ -n "$2" && "$2" != -* ]]; then
                    backup_path="$2"
                    shift 2
                else
                    log_error "Chemin du backup requis pour --data"
                    show_help
                    exit 1
                fi
                ;;
            -c|--config)
                restore_type="config"
                if [[ -n "$2" && "$2" != -* ]]; then
                    backup_path="$2"
                    shift 2
                else
                    log_error "Chemin du backup requis pour --config"
                    show_help
                    exit 1
                fi
                ;;
            -v|--volumes)
                restore_type="volumes"
                if [[ -n "$2" && "$2" != -* ]]; then
                    backup_path="$2"
                    shift 2
                else
                    log_error "Chemin du backup requis pour --volumes"
                    show_help
                    exit 1
                fi
                ;;
            -l|--list)
                list_backups=true
                shift
                ;;
            -i|--info)
                if [[ -n "$2" && "$2" != -* ]]; then
                    info_backup="$2"
                    shift 2
                else
                    log_error "Chemin du backup requis pour --info"
                    show_help
                    exit 1
                fi
                ;;
            --force)
                force_mode=true
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
    mkdir -p "$(dirname "$RESTORE_LOG_FILE")"
    
    # Lister les backups
    if [[ "$list_backups" == "true" ]]; then
        list_available_backups
        exit $?
    fi
    
    # Afficher les informations sur un backup
    if [[ -n "$info_backup" ]]; then
        get_backup_info "$info_backup"
        exit $?
    fi
    
    # Vérifier qu'un type de restauration est spécifié
    if [[ -z "$restore_type" ]]; then
        log_error "Type de restauration requis"
        show_help
        exit 1
    fi
    
    # Vérifier que le chemin du backup est spécifié
    if [[ -z "$backup_path" ]]; then
        log_error "Chemin du backup requis"
        show_help
        exit 1
    fi
    
    # Vérifier que le backup existe
    if [[ ! -d "$backup_path" ]]; then
        log_error "Backup introuvable: $backup_path"
        exit 1
    fi
    
    echo "=========================================="
    echo "  Restauration du système SIO"
    echo "=========================================="
    echo
    
    # Afficher les informations sur la restauration
    echo "Type de restauration: $restore_type"
    echo "Backup source: $backup_path"
    echo "Mode forcé: $([[ "$force_mode" == "true" ]] && echo "Oui" || echo "Non")"
    echo
    
    # Demander confirmation sauf en mode forcé
    if [[ "$force_mode" != "true" ]]; then
        echo "ATTENTION: Cette opération va restaurer le système!"
        echo "Les données actuelles peuvent être perdues."
        read -p "Continuer? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Restauration annulée"
            exit 0
        fi
    fi
    
    # Effectuer la restauration
    local success=false
    
    case "$restore_type" in
        "full")
            if restore_full_backup "$backup_path" "$force_mode"; then
                success=true
            fi
            ;;
        "data")
            if restore_data_only "$backup_path"; then
                success=true
            fi
            ;;
        "config")
            if restore_config_only "$backup_path"; then
                success=true
            fi
            ;;
        "volumes")
            if restore_volumes_only "$backup_path"; then
                success=true
            fi
            ;;
        *)
            log_error "Type de restauration inconnu: $restore_type"
            exit 1
            ;;
    esac
    
    if [[ "$success" == "true" ]]; then
        echo
        echo "=========================================="
        echo "  Restauration terminée avec succès!"
        echo "=========================================="
        echo
        echo "Commandes utiles:"
        echo "  Vérifier:   ./scripts/health-check.sh"
        echo "  Logs:       ./scripts/logs.sh"
        echo "  Monitoring: ./scripts/monitor.sh"
        echo
    else
        log_error "Restauration échouée"
        exit 1
    fi
}

# =============================================================================
# Exécution du script
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

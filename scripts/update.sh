#!/bin/bash

# =============================================================================
# Script de mise à jour pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"
source "$SCRIPT_DIR/utils/backup-utils.sh"

# Configuration
readonly UPDATE_LOG_FILE="logs/update.log"

# =============================================================================
# Fonctions de mise à jour
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  -c, --code           Mise à jour du code source"
    echo "  -i, --images         Mise à jour des images Docker"
    echo "  -d, --dependencies   Mise à jour des dépendances"
    echo "  -s, --system         Mise à jour du système"
    echo "  -a, --all            Mise à jour complète (défaut)"
    echo "  -f, --force          Mise à jour forcée"
    echo "  -b, --backup         Créer une sauvegarde avant mise à jour"
    echo "  -h, --help           Afficher cette aide"
    echo
    echo "Exemples:"
    echo "  $0                   # Mise à jour complète"
    echo "  $0 -c                # Mise à jour du code seulement"
    echo "  $0 -i -b             # Mise à jour des images avec sauvegarde"
    echo "  $0 -f                # Mise à jour forcée"
}

update_code() {
    log_info "Mise à jour du code source..."
    
    # Vérifier si nous sommes dans un dépôt Git
    if [[ ! -d ".git" ]]; then
        log_error "Ce répertoire n'est pas un dépôt Git"
        return 1
    fi
    
    # Sauvegarder l'état actuel
    local current_branch=$(git branch --show-current)
    local current_commit=$(git rev-parse HEAD)
    
    log_info "Branche actuelle: $current_branch"
    log_info "Commit actuel: $current_commit"
    
    # Récupérer les dernières modifications
    log_info "Récupération des dernières modifications..."
    if ! git fetch --all; then
        log_error "Échec de la récupération des modifications"
        return 1
    fi
    
    # Vérifier s'il y a des modifications locales
    if ! git diff-index --quiet HEAD --; then
        log_warning "Modifications locales détectées"
        read -p "Voulez-vous les sauvegarder? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git stash push -m "Sauvegarde avant mise à jour - $(date)"
            log_info "Modifications sauvegardées dans le stash"
        else
            log_error "Mise à jour annulée à cause des modifications locales"
            return 1
        fi
    fi
    
    # Mettre à jour la branche
    log_info "Mise à jour de la branche..."
    if ! git pull origin "$current_branch"; then
        log_error "Échec de la mise à jour de la branche"
        return 1
    fi
    
    # Vérifier les nouveaux commits
    local new_commit=$(git rev-parse HEAD)
    if [[ "$current_commit" == "$new_commit" ]]; then
        log_info "Aucune mise à jour disponible"
    else
        log_success "Code mis à jour: $current_commit -> $new_commit"
    fi
    
    return 0
}

update_images() {
    log_info "Mise à jour des images Docker..."
    
    # Arrêter les services
    log_info "Arrêt des services..."
    if ! stop_services; then
        log_warning "Échec de l'arrêt des services"
    fi
    
    # Supprimer les anciennes images
    log_info "Suppression des anciennes images..."
    docker rmi sio-frontend:latest sio-backend:latest sio-backend-python:latest sio-backend-llm:latest 2>/dev/null || true
    
    # Reconstruire les images
    log_info "Reconstruction des images..."
    if ! "$SCRIPT_DIR/build.sh"; then
        log_error "Échec de la reconstruction des images"
        return 1
    fi
    
    # Redémarrer les services
    log_info "Redémarrage des services..."
    if ! start_services; then
        log_error "Échec du redémarrage des services"
        return 1
    fi
    
    log_success "Images mises à jour"
    return 0
}

update_dependencies() {
    log_info "Mise à jour des dépendances..."
    
    # Mettre à jour les dépendances Python
    if [[ -f "backend_python/requirements.txt" ]]; then
        log_info "Mise à jour des dépendances Python..."
        cd backend_python
        if ! pip install --upgrade -r requirements.txt; then
            log_error "Échec de la mise à jour des dépendances Python"
            cd ..
            return 1
        fi
        cd ..
    fi
    
    # Mettre à jour les dépendances Node.js
    if [[ -f "project/package.json" ]]; then
        log_info "Mise à jour des dépendances Frontend..."
        cd project
        if ! npm update; then
            log_error "Échec de la mise à jour des dépendances Frontend"
            cd ..
            return 1
        fi
        cd ..
    fi
    
    if [[ -f "backend/package.json" ]]; then
        log_info "Mise à jour des dépendances Backend..."
        cd backend
        if ! npm update; then
            log_error "Échec de la mise à jour des dépendances Backend"
            cd ..
            return 1
        fi
        cd ..
    fi
    
    log_success "Dépendances mises à jour"
    return 0
}

update_system() {
    log_info "Mise à jour du système..."
    
    # Détecter le système d'exploitation
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        case "$ID" in
            "ubuntu"|"debian")
                log_info "Mise à jour du système Ubuntu/Debian..."
                sudo apt-get update
                sudo apt-get upgrade -y
                ;;
            "centos"|"rhel"|"fedora")
                log_info "Mise à jour du système CentOS/RHEL/Fedora..."
                sudo yum update -y
                ;;
            *)
                log_warning "Système d'exploitation non supporté: $ID"
                return 1
                ;;
        esac
    else
        log_warning "Impossible de détecter le système d'exploitation"
        return 1
    fi
    
    # Mettre à jour Docker
    log_info "Mise à jour de Docker..."
    if command -v docker &> /dev/null; then
        case "$ID" in
            "ubuntu"|"debian")
                sudo apt-get install --only-upgrade docker-ce docker-ce-cli containerd.io
                ;;
            "centos"|"rhel"|"fedora")
                sudo yum update docker-ce docker-ce-cli containerd.io
                ;;
        esac
    fi
    
    # Mettre à jour Docker Compose
    log_info "Mise à jour de Docker Compose..."
    local compose_version="v2.20.0"
    local compose_url="https://github.com/docker/compose/releases/download/${compose_version}/docker-compose-$(uname -s)-$(uname -m)"
    
    sudo curl -L "$compose_url" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    log_success "Système mis à jour"
    return 0
}

create_pre_update_backup() {
    log_info "Création d'une sauvegarde avant mise à jour..."
    
    local backup_dir="backups/pre_update_$(date +%Y%m%d_%H%M%S)"
    
    if create_full_backup "$backup_dir"; then
        log_success "Sauvegarde créée: $backup_dir"
        return 0
    else
        log_error "Échec de la création de la sauvegarde"
        return 1
    fi
}

verify_update() {
    log_info "Vérification de la mise à jour..."
    
    # Vérifier la santé des services
    if ! perform_health_check; then
        log_warning "Certains services ne sont pas en bonne santé après la mise à jour"
        return 1
    fi
    
    # Vérifier les endpoints
    if ! check_service_endpoints; then
        log_warning "Certains endpoints ne sont pas accessibles après la mise à jour"
        return 1
    fi
    
    # Vérifier les connexions aux bases de données
    if ! check_database_connections; then
        log_warning "Problèmes de connexion aux bases de données après la mise à jour"
        return 1
    fi
    
    log_success "Mise à jour vérifiée avec succès"
    return 0
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    # Variables par défaut
    local update_code_flag=false
    local update_images_flag=false
    local update_dependencies_flag=false
    local update_system_flag=false
    local update_all_flag=true
    local force_mode=false
    local backup_flag=false
    
    # Parser les arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--code)
                update_code_flag=true
                update_all_flag=false
                shift
                ;;
            -i|--images)
                update_images_flag=true
                update_all_flag=false
                shift
                ;;
            -d|--dependencies)
                update_dependencies_flag=true
                update_all_flag=false
                shift
                ;;
            -s|--system)
                update_system_flag=true
                update_all_flag=false
                shift
                ;;
            -a|--all)
                update_all_flag=true
                shift
                ;;
            -f|--force)
                force_mode=true
                shift
                ;;
            -b|--backup)
                backup_flag=true
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
    mkdir -p "$(dirname "$UPDATE_LOG_FILE")"
    
    # Vérifier les prérequis
    if ! verify_environment; then
        log_error "Environnement non valide"
        exit 1
    fi
    
    echo "=========================================="
    echo "  Mise à jour du système SIO"
    echo "=========================================="
    echo
    
    # Afficher ce qui va être mis à jour
    echo "Opérations de mise à jour à effectuer:"
    if [[ "$update_all_flag" == "true" ]]; then
        echo "  ✅ Mise à jour complète (tous les composants)"
    else
        [[ "$update_code_flag" == "true" ]] && echo "  ✅ Code source"
        [[ "$update_images_flag" == "true" ]] && echo "  ✅ Images Docker"
        [[ "$update_dependencies_flag" == "true" ]] && echo "  ✅ Dépendances"
        [[ "$update_system_flag" == "true" ]] && echo "  ✅ Système"
    fi
    
    if [[ "$backup_flag" == "true" ]]; then
        echo "  ✅ Sauvegarde avant mise à jour"
    fi
    echo
    
    # Demander confirmation sauf en mode forcé
    if [[ "$force_mode" != "true" ]]; then
        echo "ATTENTION: Cette opération va mettre à jour le système!"
        read -p "Continuer? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Mise à jour annulée"
            exit 0
        fi
    fi
    
    # Créer une sauvegarde si demandé
    if [[ "$backup_flag" == "true" ]]; then
        if ! create_pre_update_backup; then
            log_error "Échec de la création de la sauvegarde"
            exit 1
        fi
    fi
    
    # Effectuer les mises à jour
    local success=true
    
    if [[ "$update_all_flag" == "true" ]]; then
        # Mise à jour complète
        if ! update_code; then
            success=false
        fi
        
        if ! update_dependencies; then
            success=false
        fi
        
        if ! update_images; then
            success=false
        fi
        
        if ! update_system; then
            success=false
        fi
    else
        # Mises à jour spécifiques
        [[ "$update_code_flag" == "true" ]] && ! update_code && success=false
        [[ "$update_dependencies_flag" == "true" ]] && ! update_dependencies && success=false
        [[ "$update_images_flag" == "true" ]] && ! update_images && success=false
        [[ "$update_system_flag" == "true" ]] && ! update_system && success=false
    fi
    
    # Vérifier la mise à jour
    if [[ "$success" == "true" ]]; then
        if ! verify_update; then
            log_warning "La mise à jour a été effectuée mais certains problèmes ont été détectés"
        fi
    fi
    
    if [[ "$success" == "true" ]]; then
        echo
        echo "=========================================="
        echo "  Mise à jour terminée avec succès!"
        echo "=========================================="
        echo
        echo "Commandes utiles:"
        echo "  Vérifier:   ./scripts/health-check.sh"
        echo "  Logs:       ./scripts/logs.sh"
        echo "  Monitoring: ./scripts/monitor.sh"
        echo
    else
        log_error "Mise à jour partiellement échouée"
        exit 1
    fi
}

# =============================================================================
# Exécution du script
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

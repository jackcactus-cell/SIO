#!/bin/bash

# =============================================================================
# Script de nettoyage pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"

# Configuration
readonly CLEANUP_LOG_FILE="logs/cleanup.log"

# =============================================================================
# Fonctions de nettoyage
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  -c, --containers     Nettoyer les conteneurs arrêtés"
    echo "  -i, --images         Nettoyer les images non utilisées"
    echo "  -v, --volumes        Nettoyer les volumes non utilisés"
    echo "  -n, --networks       Nettoyer les réseaux non utilisés"
    echo "  -l, --logs           Nettoyer les anciens logs"
    echo "  -b, --backups        Nettoyer les anciennes sauvegardes"
    echo  "  -a, --all           Nettoyage complet (défaut)"
    echo "  -f, --force          Nettoyage forcé (sans confirmation)"
    echo "  -h, --help           Afficher cette aide"
    echo
    echo "Exemples:"
    echo "  $0                   # Nettoyage complet"
    echo "  $0 -c                # Nettoyer les conteneurs"
    echo "  $0 -i -v             # Nettoyer images et volumes"
    echo "  $0 -f                # Nettoyage forcé"
}

cleanup_containers() {
    log_info "Nettoyage des conteneurs..."
    
    # Compter les conteneurs avant nettoyage
    local containers_before=$(docker ps -a --format "{{.Names}}" | wc -l)
    
    if cleanup_containers; then
        local containers_after=$(docker ps -a --format "{{.Names}}" | wc -l)
        local removed=$((containers_before - containers_after))
        log_success "$removed conteneur(s) supprimé(s)"
        return 0
    else
        log_error "Échec du nettoyage des conteneurs"
        return 1
    fi
}

cleanup_images() {
    log_info "Nettoyage des images..."
    
    # Compter les images avant nettoyage
    local images_before=$(docker images --format "{{.Repository}}" | wc -l)
    
    if cleanup_images; then
        local images_after=$(docker images --format "{{.Repository}}" | wc -l)
        local removed=$((images_before - images_after))
        log_success "$removed image(s) supprimée(s)"
        return 0
    else
        log_error "Échec du nettoyage des images"
        return 1
    fi
}

cleanup_volumes() {
    log_info "Nettoyage des volumes..."
    
    # Compter les volumes avant nettoyage
    local volumes_before=$(docker volume ls --format "{{.Name}}" | wc -l)
    
    if cleanup_volumes; then
        local volumes_after=$(docker volume ls --format "{{.Name}}" | wc -l)
        local removed=$((volumes_before - volumes_after))
        log_success "$removed volume(s) supprimé(s)"
        return 0
    else
        log_error "Échec du nettoyage des volumes"
        return 1
    fi
}

cleanup_networks() {
    log_info "Nettoyage des réseaux..."
    
    # Compter les réseaux avant nettoyage
    local networks_before=$(docker network ls --format "{{.Name}}" | wc -l)
    
    if cleanup_networks; then
        local networks_after=$(docker network ls --format "{{.Name}}" | wc -l)
        local removed=$((networks_before - networks_after))
        log_success "$removed réseau(x) supprimé(s)"
        return 0
    else
        log_error "Échec du nettoyage des réseaux"
        return 1
    fi
}

cleanup_logs() {
    log_info "Nettoyage des logs..."
    
    # Nettoyer les logs Docker
    docker system prune -f --volumes
    
    # Nettoyer les fichiers de logs locaux
    if [[ -d "logs" ]]; then
        local logs_removed=0
        
        # Supprimer les logs de plus de 7 jours
        while IFS= read -r -d '' file; do
            rm -f "$file"
            ((logs_removed++))
        done < <(find logs -name "*.log" -mtime +7 -print0)
        
        # Supprimer les rapports de plus de 30 jours
        while IFS= read -r -d '' file; do
            rm -f "$file"
            ((logs_removed++))
        done < <(find logs -name "*report*" -mtime +30 -print0)
        
        log_success "$logs_removed fichier(s) de log supprimé(s)"
    else
        log_info "Répertoire de logs non trouvé"
    fi
    
    return 0
}

cleanup_backups() {
    log_info "Nettoyage des sauvegardes..."
    
    if [[ -d "backups" ]]; then
        local backups_removed=0
        
        # Supprimer les sauvegardes de plus de 30 jours
        while IFS= read -r -d '' file; do
            rm -f "$file"
            ((backups_removed++))
        done < <(find backups -name "*.tar.gz" -mtime +30 -print0)
        
        # Supprimer les répertoires de sauvegarde de plus de 30 jours
        while IFS= read -r -d '' dir; do
            rm -rf "$dir"
            ((backups_removed++))
        done < <(find backups -type d -name "*backup*" -mtime +30 -print0)
        
        log_success "$backups_removed sauvegarde(s) supprimée(s)"
    else
        log_info "Répertoire de sauvegardes non trouvé"
    fi
    
    return 0
}

cleanup_build_cache() {
    log_info "Nettoyage du cache de construction..."
    
    # Nettoyer le cache Docker
    docker builder prune -f
    
    # Nettoyer le cache local
    if [[ -d ".docker-cache" ]]; then
        rm -rf .docker-cache
        log_success "Cache de construction supprimé"
    fi
    
    # Nettoyer les fichiers temporaires
    if [[ -d "tmp" ]]; then
        rm -rf tmp/*
        log_success "Fichiers temporaires supprimés"
    fi
    
    return 0
}

cleanup_all() {
    log_info "Nettoyage complet du système..."
    
    local total_cleaned=0
    
    # Nettoyer tous les composants
    if cleanup_containers; then
        ((total_cleaned++))
    fi
    
    if cleanup_images; then
        ((total_cleaned++))
    fi
    
    if cleanup_volumes; then
        ((total_cleaned++))
    fi
    
    if cleanup_networks; then
        ((total_cleaned++))
    fi
    
    if cleanup_logs; then
        ((total_cleaned++))
    fi
    
    if cleanup_backups; then
        ((total_cleaned++))
    fi
    
    if cleanup_build_cache; then
        ((total_cleaned++))
    fi
    
    log_success "Nettoyage complet terminé ($total_cleaned composant(s) nettoyé(s))"
    return 0
}

show_cleanup_summary() {
    echo
    echo "=========================================="
    echo "  Résumé du nettoyage"
    echo "=========================================="
    echo
    
    # Afficher l'espace libéré
    echo "Espace disque:"
    echo "  Avant: $(df . | awk 'NR==2 {print $3}' | numfmt --to=iec)"
    echo "  Après:  $(df . | awk 'NR==2 {print $3}' | numfmt --to=iec)"
    echo
    
    # Afficher les ressources Docker
    echo "Ressources Docker:"
    echo "  Conteneurs: $(docker ps -a --format "{{.Names}}" | wc -l)"
    echo "  Images: $(docker images --format "{{.Repository}}" | wc -l)"
    echo "  Volumes: $(docker volume ls --format "{{.Name}}" | wc -l)"
    echo "  Réseaux: $(docker network ls --format "{{.Name}}" | wc -l)"
    echo
    
    # Afficher l'espace Docker
    echo "Espace Docker:"
    docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}"
    echo
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    # Variables par défaut
    local cleanup_containers_flag=false
    local cleanup_images_flag=false
    local cleanup_volumes_flag=false
    local cleanup_networks_flag=false
    local cleanup_logs_flag=false
    local cleanup_backups_flag=false
    local cleanup_all_flag=true
    local force_mode=false
    
    # Parser les arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--containers)
                cleanup_containers_flag=true
                cleanup_all_flag=false
                shift
                ;;
            -i|--images)
                cleanup_images_flag=true
                cleanup_all_flag=false
                shift
                ;;
            -v|--volumes)
                cleanup_volumes_flag=true
                cleanup_all_flag=false
                shift
                ;;
            -n|--networks)
                cleanup_networks_flag=true
                cleanup_all_flag=false
                shift
                ;;
            -l|--logs)
                cleanup_logs_flag=true
                cleanup_all_flag=false
                shift
                ;;
            -b|--backups)
                cleanup_backups_flag=true
                cleanup_all_flag=false
                shift
                ;;
            -a|--all)
                cleanup_all_flag=true
                shift
                ;;
            -f|--force)
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
    mkdir -p "$(dirname "$CLEANUP_LOG_FILE")"
    
    # Vérifier les prérequis
    if ! verify_environment; then
        log_error "Environnement non valide"
        exit 1
    fi
    
    echo "=========================================="
    echo "  Nettoyage du système SIO"
    echo "=========================================="
    echo
    
    # Afficher ce qui va être nettoyé
    echo "Opérations de nettoyage à effectuer:"
    if [[ "$cleanup_all_flag" == "true" ]]; then
        echo "  ✅ Nettoyage complet (tous les composants)"
    else
        [[ "$cleanup_containers_flag" == "true" ]] && echo "  ✅ Conteneurs arrêtés"
        [[ "$cleanup_images_flag" == "true" ]] && echo "  ✅ Images non utilisées"
        [[ "$cleanup_volumes_flag" == "true" ]] && echo "  ✅ Volumes non utilisés"
        [[ "$cleanup_networks_flag" == "true" ]] && echo "  ✅ Réseaux non utilisés"
        [[ "$cleanup_logs_flag" == "true" ]] && echo "  ✅ Anciens logs"
        [[ "$cleanup_backups_flag" == "true" ]] && echo "  ✅ Anciennes sauvegardes"
    fi
    echo
    
    # Demander confirmation sauf en mode forcé
    if [[ "$force_mode" != "true" ]]; then
        echo "ATTENTION: Cette opération va supprimer définitivement des données!"
        read -p "Continuer? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Nettoyage annulé"
            exit 0
        fi
    fi
    
    # Effectuer le nettoyage
    local success=true
    
    if [[ "$cleanup_all_flag" == "true" ]]; then
        if ! cleanup_all; then
            success=false
        fi
    else
        [[ "$cleanup_containers_flag" == "true" ]] && ! cleanup_containers && success=false
        [[ "$cleanup_images_flag" == "true" ]] && ! cleanup_images && success=false
        [[ "$cleanup_volumes_flag" == "true" ]] && ! cleanup_volumes && success=false
        [[ "$cleanup_networks_flag" == "true" ]] && ! cleanup_networks && success=false
        [[ "$cleanup_logs_flag" == "true" ]] && ! cleanup_logs && success=false
        [[ "$cleanup_backups_flag" == "true" ]] && ! cleanup_backups && success=false
    fi
    
    # Afficher le résumé
    show_cleanup_summary
    
    if [[ "$success" == "true" ]]; then
        echo "=========================================="
        echo "  Nettoyage terminé avec succès!"
        echo "=========================================="
        echo
        echo "Commandes utiles:"
        echo "  Vérifier:   ./scripts/health-check.sh"
        echo "  Redémarrer: ./scripts/restart.sh"
        echo "  Logs:       ./scripts/logs.sh"
        echo
    else
        log_error "Nettoyage partiellement échoué"
        exit 1
    fi
}

# =============================================================================
# Exécution du script
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

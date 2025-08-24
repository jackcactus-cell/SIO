#!/bin/bash

# =============================================================================
# Utilitaires de sauvegarde pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires Docker
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/docker-utils.sh"

# Configuration de sauvegarde
readonly BACKUP_DIR="backups"
readonly BACKUP_RETENTION_DAYS=30
readonly BACKUP_COMPRESSION="gzip"
readonly BACKUP_TIMESTAMP_FORMAT="%Y%m%d_%H%M%S"

# =============================================================================
# Fonctions de sauvegarde
# =============================================================================

create_backup_directory() {
    local backup_dir="$1"
    
    log_info "Création du répertoire de sauvegarde: $backup_dir"
    
    if [[ ! -d "$backup_dir" ]]; then
        if ! mkdir -p "$backup_dir"; then
            log_error "Impossible de créer le répertoire de sauvegarde: $backup_dir"
            return 1
        fi
    fi
    
    log_success "Répertoire de sauvegarde créé: $backup_dir"
    return 0
}

generate_backup_filename() {
    local prefix="$1"
    local extension="${2:-tar.gz}"
    local timestamp=$(date +"$BACKUP_TIMESTAMP_FORMAT")
    
    echo "${prefix}_${timestamp}.${extension}"
}

backup_mongodb_data() {
    local backup_dir="${1:-$BACKUP_DIR}"
    local backup_name=$(generate_backup_filename "mongodb")
    local backup_path="$backup_dir/$backup_name"
    
    log_info "Sauvegarde des données MongoDB..."
    
    create_backup_directory "$backup_dir"
    
    # Vérifier que MongoDB est en cours d'exécution
    if ! docker_compose_cmd ps mongodb | grep -q "Up"; then
        log_error "MongoDB n'est pas en cours d'exécution"
        return 1
    fi
    
    # Créer la sauvegarde avec mongodump
    if ! docker run --rm \
        --network sio_network \
        -v "$(pwd)/$backup_dir:/backup" \
        mongo:7.0 \
        mongodump \
        --host mongodb \
        --port 27017 \
        --username admin \
        --password securepassword123 \
        --authenticationDatabase admin \
        --db audit_db \
        --out "/backup/mongodb_dump"; then
        log_error "Échec de la sauvegarde MongoDB"
        return 1
    fi
    
    # Compresser la sauvegarde
    if ! tar -czf "$backup_path" -C "$backup_dir" mongodb_dump; then
        log_error "Échec de la compression de la sauvegarde MongoDB"
        return 1
    fi
    
    # Nettoyer le dump temporaire
    rm -rf "$backup_dir/mongodb_dump"
    
    log_success "Sauvegarde MongoDB créée: $backup_path"
    return 0
}

backup_config_files() {
    local backup_dir="${1:-$BACKUP_DIR}"
    local backup_name=$(generate_backup_filename "config")
    local backup_path="$backup_dir/$backup_name"
    
    log_info "Sauvegarde des fichiers de configuration..."
    
    create_backup_directory "$backup_dir"
    
    # Créer une liste des fichiers de configuration
    local config_files=(
        "backend_python/.env"
        "backend_python/config.py"
        "config/docker/docker-compose.yml"
        "project/.env"
        "project/package.json"
        "backend/package.json"
    )
    
    local temp_dir="$backup_dir/config_temp"
    mkdir -p "$temp_dir"
    
    # Copier les fichiers de configuration existants
    for file in "${config_files[@]}"; do
        if [[ -f "$file" ]]; then
            local dir_path=$(dirname "$file")
            mkdir -p "$temp_dir/$dir_path"
            cp "$file" "$temp_dir/$file"
        fi
    done
    
    # Compresser la sauvegarde
    if ! tar -czf "$backup_path" -C "$temp_dir" .; then
        log_error "Échec de la compression de la sauvegarde de configuration"
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Nettoyer le répertoire temporaire
    rm -rf "$temp_dir"
    
    log_success "Sauvegarde de configuration créée: $backup_path"
    return 0
}

backup_logs() {
    local backup_dir="${1:-$BACKUP_DIR}"
    local backup_name=$(generate_backup_filename "logs")
    local backup_path="$backup_dir/$backup_name"
    
    log_info "Sauvegarde des logs..."
    
    create_backup_directory "$backup_dir"
    
    # Créer une sauvegarde des logs Docker
    if ! docker_compose_cmd logs --no-color > "$backup_dir/docker_logs.txt" 2>/dev/null; then
        log_warning "Impossible de récupérer tous les logs Docker"
    fi
    
    # Compresser les logs
    if ! tar -czf "$backup_path" -C "$backup_dir" docker_logs.txt; then
        log_error "Échec de la compression des logs"
        rm -f "$backup_dir/docker_logs.txt"
        return 1
    fi
    
    # Nettoyer le fichier temporaire
    rm -f "$backup_dir/docker_logs.txt"
    
    log_success "Sauvegarde des logs créée: $backup_path"
    return 0
}

backup_docker_volumes() {
    local backup_dir="${1:-$BACKUP_DIR}"
    local backup_name=$(generate_backup_filename "volumes")
    local backup_path="$backup_dir/$backup_name"
    
    log_info "Sauvegarde des volumes Docker..."
    
    create_backup_directory "$backup_dir"
    
    # Arrêter les services pour une sauvegarde cohérente
    log_info "Arrêt des services pour la sauvegarde..."
    stop_services
    
    # Sauvegarder les volumes
    if ! docker run --rm \
        -v sio_mongodb_data:/data \
        -v "$(pwd)/$backup_dir:/backup" \
        alpine \
        tar czf "/backup/volumes_temp.tar.gz" -C /data .; then
        log_error "Échec de la sauvegarde des volumes"
        start_services
        return 1
    fi
    
    # Renommer le fichier de sauvegarde
    mv "$backup_dir/volumes_temp.tar.gz" "$backup_path"
    
    # Redémarrer les services
    log_info "Redémarrage des services..."
    start_services
    
    log_success "Sauvegarde des volumes créée: $backup_path"
    return 0
}

create_full_backup() {
    local backup_dir="${1:-$BACKUP_DIR}"
    local timestamp=$(date +"$BACKUP_TIMESTAMP_FORMAT")
    local full_backup_dir="$backup_dir/full_backup_$timestamp"
    
    log_info "Création d'une sauvegarde complète..."
    
    create_backup_directory "$full_backup_dir"
    
    # Créer toutes les sauvegardes
    local backup_functions=(
        "backup_mongodb_data"
        "backup_config_files"
        "backup_logs"
    )
    
    local failed_backups=0
    
    for backup_func in "${backup_functions[@]}"; do
        if ! "$backup_func" "$full_backup_dir"; then
            ((failed_backups++))
        fi
    done
    
    if [[ $failed_backups -gt 0 ]]; then
        log_warning "$failed_backups sauvegarde(s) ont échoué"
    fi
    
    # Créer un fichier de métadonnées
    create_backup_metadata "$full_backup_dir"
    
    log_success "Sauvegarde complète créée: $full_backup_dir"
    return 0
}

create_backup_metadata() {
    local backup_dir="$1"
    local metadata_file="$backup_dir/backup_metadata.json"
    
    log_info "Création des métadonnées de sauvegarde..."
    
    cat > "$metadata_file" << EOF
{
    "backup_timestamp": "$(date -Iseconds)",
    "backup_type": "full",
    "system_info": {
        "hostname": "$(hostname)",
        "os": "$(uname -s)",
        "kernel": "$(uname -r)"
    },
    "docker_info": {
        "version": "$(docker --version)",
        "compose_version": "$(docker-compose --version)"
    },
    "services": {
        "frontend": "$(docker_compose_cmd ps frontend --format '{{.Status}}' 2>/dev/null || echo 'unknown')",
        "backend": "$(docker_compose_cmd ps backend --format '{{.Status}}' 2>/dev/null || echo 'unknown')",
        "backend_python": "$(docker_compose_cmd ps backend_python --format '{{.Status}}' 2>/dev/null || echo 'unknown')",
        "backend_llm": "$(docker_compose_cmd ps backend_llm --format '{{.Status}}' 2>/dev/null || echo 'unknown')",
        "mongodb": "$(docker_compose_cmd ps mongodb --format '{{.Status}}' 2>/dev/null || echo 'unknown')"
    },
    "files": [
        $(find "$backup_dir" -type f -name "*.tar.gz" -o -name "*.json" | sed 's/.*/"&",/' | sed '$s/,$//')
    ]
}
EOF
    
    log_success "Métadonnées créées: $metadata_file"
}

# =============================================================================
# Fonctions de restauration
# =============================================================================

restore_mongodb_data() {
    local backup_file="$1"
    local temp_dir="/tmp/mongodb_restore_$$"
    
    log_info "Restauration des données MongoDB depuis: $backup_file"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Fichier de sauvegarde non trouvé: $backup_file"
        return 1
    fi
    
    # Vérifier que MongoDB est en cours d'exécution
    if ! docker_compose_cmd ps mongodb | grep -q "Up"; then
        log_error "MongoDB n'est pas en cours d'exécution"
        return 1
    fi
    
    # Créer un répertoire temporaire
    mkdir -p "$temp_dir"
    
    # Extraire la sauvegarde
    if ! tar -xzf "$backup_file" -C "$temp_dir"; then
        log_error "Échec de l'extraction de la sauvegarde"
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Restaurer les données
    if ! docker run --rm \
        --network sio_network \
        -v "$temp_dir:/backup" \
        mongo:7.0 \
        mongorestore \
        --host mongodb \
        --port 27017 \
        --username admin \
        --password securepassword123 \
        --authenticationDatabase admin \
        --db audit_db \
        --drop \
        "/backup/mongodb_dump/audit_db"; then
        log_error "Échec de la restauration MongoDB"
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Nettoyer
    rm -rf "$temp_dir"
    
    log_success "Restauration MongoDB terminée"
    return 0
}

restore_config_files() {
    local backup_file="$1"
    local temp_dir="/tmp/config_restore_$$"
    
    log_info "Restauration des fichiers de configuration depuis: $backup_file"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Fichier de sauvegarde non trouvé: $backup_file"
        return 1
    fi
    
    # Créer un répertoire temporaire
    mkdir -p "$temp_dir"
    
    # Extraire la sauvegarde
    if ! tar -xzf "$backup_file" -C "$temp_dir"; then
        log_error "Échec de l'extraction de la sauvegarde"
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Restaurer les fichiers de configuration
    if [[ -d "$temp_dir/backend_python" ]]; then
        cp -r "$temp_dir/backend_python"/* backend_python/ 2>/dev/null || true
    fi
    
    if [[ -d "$temp_dir/config" ]]; then
        cp -r "$temp_dir/config"/* config/ 2>/dev/null || true
    fi
    
    if [[ -d "$temp_dir/project" ]]; then
        cp -r "$temp_dir/project"/* project/ 2>/dev/null || true
    fi
    
    if [[ -d "$temp_dir/backend" ]]; then
        cp -r "$temp_dir/backend"/* backend/ 2>/dev/null || true
    fi
    
    # Nettoyer
    rm -rf "$temp_dir"
    
    log_success "Restauration des fichiers de configuration terminée"
    return 0
}

restore_docker_volumes() {
    local backup_file="$1"
    
    log_info "Restauration des volumes Docker depuis: $backup_file"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Fichier de sauvegarde non trouvé: $backup_file"
        return 1
    fi
    
    # Arrêter les services
    log_info "Arrêt des services pour la restauration..."
    stop_services
    
    # Supprimer le volume existant
    if ! docker volume rm sio_mongodb_data 2>/dev/null; then
        log_warning "Volume MongoDB non trouvé ou déjà supprimé"
    fi
    
    # Restaurer le volume
    if ! docker run --rm \
        -v sio_mongodb_data:/data \
        -v "$(pwd)/$(dirname "$backup_file"):/backup" \
        alpine \
        tar xzf "/backup/$(basename "$backup_file")" -C /data; then
        log_error "Échec de la restauration des volumes"
        start_services
        return 1
    fi
    
    # Redémarrer les services
    log_info "Redémarrage des services..."
    start_services
    
    log_success "Restauration des volumes terminée"
    return 0
}

# =============================================================================
# Fonctions de gestion des sauvegardes
# =============================================================================

list_backups() {
    local backup_dir="${1:-$BACKUP_DIR}"
    
    log_info "Liste des sauvegardes disponibles dans: $backup_dir"
    
    if [[ ! -d "$backup_dir" ]]; then
        log_warning "Répertoire de sauvegarde non trouvé: $backup_dir"
        return 1
    fi
    
    echo "=== Sauvegardes MongoDB ==="
    find "$backup_dir" -name "mongodb_*.tar.gz" -type f -exec ls -lh {} \;
    
    echo -e "\n=== Sauvegardes de configuration ==="
    find "$backup_dir" -name "config_*.tar.gz" -type f -exec ls -lh {} \;
    
    echo -e "\n=== Sauvegardes de logs ==="
    find "$backup_dir" -name "logs_*.tar.gz" -type f -exec ls -lh {} \;
    
    echo -e "\n=== Sauvegardes complètes ==="
    find "$backup_dir" -name "full_backup_*" -type d -exec ls -lh {} \;
    
    echo -e "\n=== Sauvegardes de volumes ==="
    find "$backup_dir" -name "volumes_*.tar.gz" -type f -exec ls -lh {} \;
}

cleanup_old_backups() {
    local backup_dir="${1:-$BACKUP_DIR}"
    local retention_days="${2:-$BACKUP_RETENTION_DAYS}"
    
    log_info "Nettoyage des sauvegardes de plus de $retention_days jours..."
    
    if [[ ! -d "$backup_dir" ]]; then
        log_warning "Répertoire de sauvegarde non trouvé: $backup_dir"
        return 1
    fi
    
    # Supprimer les fichiers de sauvegarde anciens
    local deleted_files=0
    
    # Fichiers tar.gz
    while IFS= read -r -d '' file; do
        if [[ $(find "$file" -mtime +$retention_days) ]]; then
            rm -f "$file"
            log_info "Supprimé: $file"
            ((deleted_files++))
        fi
    done < <(find "$backup_dir" -name "*.tar.gz" -type f -print0)
    
    # Répertoires de sauvegarde complète
    while IFS= read -r -d '' dir; do
        if [[ $(find "$dir" -mtime +$retention_days) ]]; then
            rm -rf "$dir"
            log_info "Supprimé: $dir"
            ((deleted_files++))
        fi
    done < <(find "$backup_dir" -name "full_backup_*" -type d -print0)
    
    log_success "$deleted_files sauvegarde(s) supprimée(s)"
    return 0
}

verify_backup_integrity() {
    local backup_file="$1"
    
    log_info "Vérification de l'intégrité de la sauvegarde: $backup_file"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Fichier de sauvegarde non trouvé: $backup_file"
        return 1
    fi
    
    # Vérifier que le fichier tar.gz est valide
    if ! tar -tzf "$backup_file" > /dev/null 2>&1; then
        log_error "Fichier de sauvegarde corrompu: $backup_file"
        return 1
    fi
    
    log_success "Sauvegarde valide: $backup_file"
    return 0
}

get_backup_size() {
    local backup_dir="${1:-$BACKUP_DIR}"
    
    if [[ ! -d "$backup_dir" ]]; then
        echo "0"
        return 0
    fi
    
    du -sb "$backup_dir" | cut -f1
}

# =============================================================================
# Fonctions d'export
# =============================================================================

export -f create_backup_directory generate_backup_filename
export -f backup_mongodb_data backup_config_files backup_logs backup_docker_volumes
export -f create_full_backup create_backup_metadata
export -f restore_mongodb_data restore_config_files restore_docker_volumes
export -f list_backups cleanup_old_backups verify_backup_integrity get_backup_size

#!/bin/bash

# =============================================================================
# Script de construction des images Docker pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"
source "$SCRIPT_DIR/utils/config-utils.sh"

# Configuration
readonly BUILD_CACHE_DIR=".docker-cache"
readonly BUILD_LOG_FILE="logs/build.log"

# =============================================================================
# Fonctions de construction
# =============================================================================

prepare_build_environment() {
    log_info "Préparation de l'environnement de construction..."
    
    # Créer le répertoire de cache
    if [[ ! -d "$BUILD_CACHE_DIR" ]]; then
        mkdir -p "$BUILD_CACHE_DIR"
        log_info "Répertoire de cache créé: $BUILD_CACHE_DIR"
    fi
    
    # Créer le répertoire de logs
    mkdir -p "$(dirname "$BUILD_LOG_FILE")"
    
    # Vérifier les fichiers de configuration
    if ! validate_project_structure; then
        log_error "Structure du projet invalide"
        return 1
    fi
    
    # Vérifier les fichiers d'environnement
    local env_files=(
        "backend_python/.env"
        "project/.env"
        "backend/.env"
    )
    
    for env_file in "${env_files[@]}"; do
        if [[ ! -f "$env_file" ]]; then
            log_warning "Fichier d'environnement manquant: $env_file"
            create_env_file "$env_file"
        fi
    done
    
    log_success "Environnement de construction préparé"
    return 0
}

build_frontend_image() {
    log_info "Construction de l'image Frontend..."
    
    local build_context="project"
    local dockerfile="$build_context/Dockerfile"
    
    # Vérifier que le Dockerfile existe
    if [[ ! -f "$dockerfile" ]]; then
        log_error "Dockerfile Frontend non trouvé: $dockerfile"
        return 1
    fi
    
    # Vérifier les dépendances
    if [[ ! -f "$build_context/package.json" ]]; then
        log_error "package.json Frontend non trouvé"
        return 1
    fi
    
    # Construire l'image
    log_info "Construction de l'image Frontend depuis $build_context..."
    
    if docker build \
        --file "$dockerfile" \
        --tag "sio-frontend:latest" \
        --build-arg NODE_ENV=production \
        --cache-from "sio-frontend:latest" \
        "$build_context" 2>&1 | tee -a "$BUILD_LOG_FILE"; then
        log_success "Image Frontend construite avec succès"
        return 0
    else
        log_error "Échec de la construction de l'image Frontend"
        return 1
    fi
}

build_backend_image() {
    log_info "Construction de l'image Backend Node.js..."
    
    local build_context="backend"
    local dockerfile="$build_context/Dockerfile"
    
    # Vérifier que le Dockerfile existe
    if [[ ! -f "$dockerfile" ]]; then
        log_error "Dockerfile Backend non trouvé: $dockerfile"
        return 1
    fi
    
    # Vérifier les dépendances
    if [[ ! -f "$build_context/package.json" ]]; then
        log_error "package.json Backend non trouvé"
        return 1
    fi
    
    # Construire l'image
    log_info "Construction de l'image Backend depuis $build_context..."
    
    if docker build \
        --file "$dockerfile" \
        --tag "sio-backend:latest" \
        --build-arg NODE_ENV=production \
        --cache-from "sio-backend:latest" \
        "$build_context" 2>&1 | tee -a "$BUILD_LOG_FILE"; then
        log_success "Image Backend construite avec succès"
        return 0
    else
        log_error "Échec de la construction de l'image Backend"
        return 1
    fi
}

build_backend_python_image() {
    log_info "Construction de l'image Backend Python..."
    
    local build_context="backend_python"
    local dockerfile="$build_context/Dockerfile"
    
    # Vérifier que le Dockerfile existe
    if [[ ! -f "$dockerfile" ]]; then
        log_error "Dockerfile Backend Python non trouvé: $dockerfile"
        return 1
    fi
    
    # Vérifier les dépendances
    if [[ ! -f "$build_context/requirements.txt" ]]; then
        log_error "requirements.txt Backend Python non trouvé"
        return 1
    fi
    
    # Construire l'image
    log_info "Construction de l'image Backend Python depuis $build_context..."
    
    if docker build \
        --file "$dockerfile" \
        --tag "sio-backend-python:latest" \
        --build-arg PYTHON_VERSION=3.11 \
        --cache-from "sio-backend-python:latest" \
        "$build_context" 2>&1 | tee -a "$BUILD_LOG_FILE"; then
        log_success "Image Backend Python construite avec succès"
        return 0
    else
        log_error "Échec de la construction de l'image Backend Python"
        return 1
    fi
}

build_backend_llm_image() {
    log_info "Construction de l'image Backend LLM..."
    
    local build_context="backend"
    local dockerfile="$build_context/Dockerfile.llm"
    
    # Vérifier que le Dockerfile existe
    if [[ ! -f "$dockerfile" ]]; then
        log_error "Dockerfile Backend LLM non trouvé: $dockerfile"
        return 1
    fi
    
    # Vérifier les dépendances
    if [[ ! -f "$build_context/package.json" ]]; then
        log_error "package.json Backend non trouvé"
        return 1
    fi
    
    # Construire l'image
    log_info "Construction de l'image Backend LLM depuis $build_context..."
    
    if docker build \
        --file "$dockerfile" \
        --tag "sio-backend-llm:latest" \
        --build-arg NODE_ENV=production \
        --build-arg LLM_MODEL=gpt-3.5-turbo \
        --cache-from "sio-backend-llm:latest" \
        "$build_context" 2>&1 | tee -a "$BUILD_LOG_FILE"; then
        log_success "Image Backend LLM construite avec succès"
        return 0
    else
        log_error "Échec de la construction de l'image Backend LLM"
        return 1
    fi
}

build_all_images() {
    log_info "Construction de toutes les images Docker..."
    
    local build_functions=(
        "build_frontend_image"
        "build_backend_image"
        "build_backend_python_image"
        "build_backend_llm_image"
    )
    
    local failed_builds=0
    local total_builds=${#build_functions[@]}
    
    for build_func in "${build_functions[@]}"; do
        echo
        if ! "$build_func"; then
            ((failed_builds++))
        fi
    done
    
    echo
    echo "=== RÉSUMÉ DE LA CONSTRUCTION ==="
    echo "Total des constructions: $total_builds"
    echo "Constructions réussies: $((total_builds - failed_builds))"
    echo "Constructions échouées: $failed_builds"
    
    if [[ $failed_builds -gt 0 ]]; then
        log_error "La construction a échoué pour $failed_builds image(s)"
        return 1
    else
        log_success "Toutes les images ont été construites avec succès"
        return 0
    fi
}

optimize_images() {
    log_info "Optimisation des images Docker..."
    
    # Nettoyer les images non utilisées
    log_info "Nettoyage des images non utilisées..."
    docker image prune -f
    
    # Optimiser les images construites
    local images=(
        "sio-frontend:latest"
        "sio-backend:latest"
        "sio-backend-python:latest"
        "sio-backend-llm:latest"
    )
    
    for image in "${images[@]}"; do
        if docker image inspect "$image" &> /dev/null; then
            log_info "Optimisation de l'image: $image"
            
            # Créer une image optimisée
            local optimized_image="${image%:*}-optimized:latest"
            
            # Utiliser docker-slim pour optimiser (si disponible)
            if command -v docker-slim &> /dev/null; then
                docker-slim build --target "$image" --tag "$optimized_image" || true
            fi
        fi
    done
    
    log_success "Optimisation des images terminée"
}

verify_images() {
    log_info "Vérification des images construites..."
    
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
        else
            local size=$(docker image inspect "$image" --format='{{.Size}}' | numfmt --to=iec)
            log_info "$image: $size"
        fi
    done
    
    if [[ ${#missing_images[@]} -gt 0 ]]; then
        log_error "Images manquantes: ${missing_images[*]}"
        return 1
    fi
    
    log_success "Toutes les images requises sont disponibles"
    return 0
}

generate_build_report() {
    local report_file="logs/build_report_$(date +%Y%m%d_%H%M%S).json"
    
    log_info "Génération du rapport de construction: $report_file"
    
    # Créer le rapport
    cat > "$report_file" << EOF
{
    "build_timestamp": "$(date -Iseconds)",
    "build_duration": "$(($(date +%s) - BUILD_START_TIME))s",
    "system_info": {
        "hostname": "$(hostname)",
        "os": "$(uname -s)",
        "kernel": "$(uname -r)",
        "docker_version": "$(docker --version)",
        "docker_compose_version": "$(docker-compose --version)"
    },
    "images": {
EOF
    
    local images=(
        "sio-frontend:latest"
        "sio-backend:latest"
        "sio-backend-python:latest"
        "sio-backend-llm:latest"
    )
    
    local first=true
    for image in "${images[@]}"; do
        if docker image inspect "$image" &> /dev/null; then
            local size=$(docker image inspect "$image" --format='{{.Size}}')
            local created=$(docker image inspect "$image" --format='{{.Created}}')
            local digest=$(docker image inspect "$image" --format='{{.Id}}')
            
            if [[ "$first" == "true" ]]; then
                first=false
            else
                echo "," >> "$report_file"
            fi
            
            cat >> "$report_file" << EOF
        "$image": {
            "size": $size,
            "size_human": "$(numfmt --to=iec $size)",
            "created": "$created",
            "digest": "$digest"
        }
EOF
        fi
    done
    
    cat >> "$report_file" << EOF
    },
    "build_log": "$BUILD_LOG_FILE"
}
EOF
    
    log_success "Rapport de construction généré: $report_file"
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    echo "=========================================="
    echo "  Construction des images Docker SIO"
    echo "=========================================="
    echo
    
    # Enregistrer le temps de début
    BUILD_START_TIME=$(date +%s)
    
    # Vérifier les prérequis
    if ! verify_environment; then
        log_error "Environnement non valide pour la construction"
        exit 1
    fi
    
    # Préparer l'environnement
    if ! prepare_build_environment; then
        log_error "Échec de la préparation de l'environnement"
        exit 1
    fi
    
    # Construire toutes les images
    if ! build_all_images; then
        log_error "Échec de la construction des images"
        exit 1
    fi
    
    # Vérifier les images construites
    if ! verify_images; then
        log_error "Vérification des images échouée"
        exit 1
    fi
    
    # Optimiser les images
    optimize_images
    
    # Générer le rapport
    generate_build_report
    
    # Calculer la durée totale
    local duration=$(($(date +%s) - BUILD_START_TIME))
    
    echo
    echo "=========================================="
    echo "  Construction terminée avec succès!"
    echo "=========================================="
    echo
    echo "Durée totale: ${duration}s"
    echo "Logs: $BUILD_LOG_FILE"
    echo
    echo "Images construites:"
    docker images | grep "sio-" || true
    echo
    echo "Prochaines étapes:"
    echo "1. Déployer l'application: ./scripts/deploy.sh"
    echo "2. Vérifier la santé: ./scripts/health-check.sh"
    echo "3. Consulter les logs: ./scripts/logs.sh"
    echo
}

# =============================================================================
# Exécution du script
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

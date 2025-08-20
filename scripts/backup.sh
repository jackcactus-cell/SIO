#!/bin/bash

# =================================================================
# SIO Audit App - Script de sauvegarde
# =================================================================

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
DEFAULT_ENV="production"
ENV=${1:-$DEFAULT_ENV}
BACKUP_TYPE="full"
COMPRESSION=true
UPLOAD_S3=false

# Fichiers de configuration
if [ "$ENV" = "dev" ] || [ "$ENV" = "development" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    ENV_NAME="développement"
    DB_NAME="audit_146_dev"
else
    COMPOSE_FILE="docker-compose.yml"
    ENV_NAME="production"
    DB_NAME="audit_146"
fi

# Dossiers
BACKUP_ROOT="backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/${ENV}_${TIMESTAMP}"

# Fonction d'aide
show_help() {
    echo "Usage: $0 [environment] [options]"
    echo ""
    echo "Environments:"
    echo "  production (default) - Mode production"
    echo "  dev                  - Mode développement"
    echo ""
    echo "Types de sauvegarde:"
    echo "  --full               - Sauvegarde complète (défaut)"
    echo "  --mongodb-only       - Seulement MongoDB"
    echo "  --volumes-only       - Seulement les volumes"
    echo "  --logs-only          - Seulement les logs"
    echo ""
    echo "Options:"
    echo "  --no-compression     - Pas de compression"
    echo "  --upload-s3          - Upload vers S3 (nécessite configuration)"
    echo "  --help, -h           - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                   # Sauvegarde complète en production"
    echo "  $0 dev               # Sauvegarde complète en développement"
    echo "  $0 --mongodb-only    # Seulement la base de données"
    echo "  $0 prod --upload-s3  # Sauvegarde avec upload S3"
}

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --full)
            BACKUP_TYPE="full"
            shift
            ;;
        --mongodb-only)
            BACKUP_TYPE="mongodb"
            shift
            ;;
        --volumes-only)
            BACKUP_TYPE="volumes"
            shift
            ;;
        --logs-only)
            BACKUP_TYPE="logs"
            shift
            ;;
        --no-compression)
            COMPRESSION=false
            shift
            ;;
        --upload-s3)
            UPLOAD_S3=true
            shift
            ;;
        dev|development|prod|production)
            ENV=$1
            if [ "$ENV" = "dev" ] || [ "$ENV" = "development" ]; then
                COMPOSE_FILE="docker-compose.dev.yml"
                ENV_NAME="développement"
                DB_NAME="audit_146_dev"
            else
                COMPOSE_FILE="docker-compose.yml"
                ENV_NAME="production"
                DB_NAME="audit_146"
            fi
            shift
            ;;
        *)
            echo -e "${RED}Option inconnue: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  SIO Audit App - Sauvegarde${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Vérification de Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

# Vérification du fichier compose
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Fichier $COMPOSE_FILE introuvable${NC}"
    exit 1
fi

# Affichage de la configuration
echo -e "${CYAN}💾 Configuration de la sauvegarde:${NC}"
echo "   Environnement:      $ENV_NAME"
echo "   Type:               $BACKUP_TYPE"
echo "   Compression:        $([ "$COMPRESSION" = true ] && echo "Oui" || echo "Non")"
echo "   Upload S3:          $([ "$UPLOAD_S3" = true ] && echo "Oui" || echo "Non")"
echo "   Dossier:            $BACKUP_DIR"
echo ""

# Vérifier l'état des services
echo -e "${YELLOW}1. Vérification de l'état des services...${NC}"

RUNNING_SERVICES=$(docker-compose -f $COMPOSE_FILE ps --services --filter "status=running" 2>/dev/null || echo "")

if [ -z "$RUNNING_SERVICES" ]; then
    echo -e "${YELLOW}⚠️  Aucun service en cours d'exécution${NC}"
    echo "Certaines sauvegardes peuvent être limitées."
else
    echo -e "${GREEN}✅ Services actifs détectés${NC}"
fi

# Créer le dossier de sauvegarde
echo -e "${YELLOW}2. Préparation du dossier de sauvegarde...${NC}"

mkdir -p "$BACKUP_DIR"
chmod 755 "$BACKUP_DIR"

echo -e "${GREEN}✅ Dossier créé: $BACKUP_DIR${NC}"

# Fonction de sauvegarde MongoDB
backup_mongodb() {
    echo -e "${YELLOW}3. Sauvegarde de MongoDB...${NC}"
    
    if ! echo "$RUNNING_SERVICES" | grep -q "mongodb"; then
        echo -e "${RED}❌ MongoDB n'est pas en cours d'exécution${NC}"
        return 1
    fi
    
    local mongo_backup_dir="$BACKUP_DIR/mongodb"
    mkdir -p "$mongo_backup_dir"
    
    echo -e "${BLUE}   📦 Dump de la base de données $DB_NAME...${NC}"
    
    # Dump de la base de données
    if docker-compose -f $COMPOSE_FILE exec -T mongodb mongodump --db $DB_NAME --out /tmp/backup_$TIMESTAMP; then
        # Copier le dump depuis le conteneur
        docker-compose -f $COMPOSE_FILE cp mongodb:/tmp/backup_$TIMESTAMP "$mongo_backup_dir/"
        
        # Nettoyer le conteneur
        docker-compose -f $COMPOSE_FILE exec -T mongodb rm -rf /tmp/backup_$TIMESTAMP
        
        echo -e "${GREEN}   ✅ Sauvegarde MongoDB réussie${NC}"
        
        # Informations sur la sauvegarde
        local backup_size=$(du -sh "$mongo_backup_dir" | cut -f1)
        echo -e "${CYAN}   📊 Taille: $backup_size${NC}"
        
        return 0
    else
        echo -e "${RED}   ❌ Échec du dump MongoDB${NC}"
        return 1
    fi
}

# Fonction de sauvegarde des volumes
backup_volumes() {
    echo -e "${YELLOW}3. Sauvegarde des volumes Docker...${NC}"
    
    local volumes_backup_dir="$BACKUP_DIR/volumes"
    mkdir -p "$volumes_backup_dir"
    
    # Lister les volumes SIO
    local sio_volumes=$(docker volume ls --format "{{.Name}}" | grep "sio" || echo "")
    
    if [ -z "$sio_volumes" ]; then
        echo -e "${YELLOW}   ⚠️  Aucun volume SIO trouvé${NC}"
        return 0
    fi
    
    echo -e "${BLUE}   📦 Sauvegarde des volumes:${NC}"
    
    for volume in $sio_volumes; do
        echo -e "${CYAN}      • $volume${NC}"
        
        # Créer une archive du volume
        docker run --rm \
            -v "$volume":/volume \
            -v "$(pwd)/$volumes_backup_dir":/backup \
            busybox tar czf "/backup/${volume}.tar.gz" -C /volume . \
            2>/dev/null || echo -e "${YELLOW}      ⚠️  Erreur pour $volume${NC}"
    done
    
    echo -e "${GREEN}   ✅ Sauvegarde des volumes terminée${NC}"
    
    # Informations sur la sauvegarde
    local backup_size=$(du -sh "$volumes_backup_dir" | cut -f1)
    echo -e "${CYAN}   📊 Taille: $backup_size${NC}"
}

# Fonction de sauvegarde des logs
backup_logs() {
    echo -e "${YELLOW}3. Sauvegarde des logs...${NC}"
    
    local logs_backup_dir="$BACKUP_DIR/logs"
    mkdir -p "$logs_backup_dir"
    
    # Sauvegarder les logs du système
    if [ -d "logs" ]; then
        echo -e "${BLUE}   📦 Copie des logs système...${NC}"
        cp -r logs/* "$logs_backup_dir/" 2>/dev/null || true
    fi
    
    # Sauvegarder les logs des conteneurs
    echo -e "${BLUE}   📦 Export des logs des conteneurs...${NC}"
    
    for service in frontend backend backend_python backend_llm mongodb; do
        if echo "$RUNNING_SERVICES" | grep -q "$service"; then
            echo -e "${CYAN}      • $service${NC}"
            docker-compose -f $COMPOSE_FILE logs --no-color $service > "$logs_backup_dir/${service}.log" 2>/dev/null || true
        fi
    done
    
    echo -e "${GREEN}   ✅ Sauvegarde des logs terminée${NC}"
    
    # Informations sur la sauvegarde
    local backup_size=$(du -sh "$logs_backup_dir" | cut -f1)
    echo -e "${CYAN}   📊 Taille: $backup_size${NC}"
}

# Fonction de sauvegarde des configurations
backup_configs() {
    echo -e "${YELLOW}4. Sauvegarde des configurations...${NC}"
    
    local config_backup_dir="$BACKUP_DIR/config"
    mkdir -p "$config_backup_dir"
    
    # Fichiers de configuration importants
    local config_files=(
        "docker-compose.yml"
        "docker-compose.dev.yml"
        ".env.example"
        "backend_python/env.example"
        "project/nginx.conf"
    )
    
    for config_file in "${config_files[@]}"; do
        if [ -f "$config_file" ]; then
            echo -e "${CYAN}   📄 $config_file${NC}"
            cp "$config_file" "$config_backup_dir/" 2>/dev/null || true
        fi
    done
    
    # Copier les fichiers d'environnement (sans les mots de passe)
    if [ -f ".env" ]; then
        echo -e "${CYAN}   📄 .env (sans secrets)${NC}"
        grep -v -E "(PASSWORD|SECRET|KEY)" .env > "$config_backup_dir/env.sanitized" 2>/dev/null || true
    fi
    
    echo -e "${GREEN}   ✅ Sauvegarde des configurations terminée${NC}"
}

# Exécution selon le type de sauvegarde
case $BACKUP_TYPE in
    "mongodb")
        backup_mongodb
        ;;
    "volumes")
        backup_volumes
        ;;
    "logs")
        backup_logs
        ;;
    "full")
        backup_mongodb
        backup_volumes
        backup_logs
        backup_configs
        ;;
esac

# Compression si demandée
if [ "$COMPRESSION" = true ]; then
    echo -e "${YELLOW}5. Compression de la sauvegarde...${NC}"
    
    local archive_name="${ENV}_backup_${TIMESTAMP}.tar.gz"
    local archive_path="$BACKUP_ROOT/$archive_name"
    
    echo -e "${BLUE}   🗜️  Création de l'archive: $archive_name${NC}"
    
    tar -czf "$archive_path" -C "$BACKUP_ROOT" "${ENV}_${TIMESTAMP}" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ Archive créée avec succès${NC}"
        
        # Informations sur l'archive
        local archive_size=$(du -sh "$archive_path" | cut -f1)
        echo -e "${CYAN}   📊 Taille de l'archive: $archive_size${NC}"
        
        # Supprimer le dossier non compressé
        rm -rf "$BACKUP_DIR"
        
        FINAL_BACKUP_PATH="$archive_path"
    else
        echo -e "${RED}   ❌ Erreur lors de la compression${NC}"
        FINAL_BACKUP_PATH="$BACKUP_DIR"
    fi
else
    FINAL_BACKUP_PATH="$BACKUP_DIR"
fi

# Upload S3 si demandé
if [ "$UPLOAD_S3" = true ]; then
    echo -e "${YELLOW}6. Upload vers S3...${NC}"
    
    if command -v aws &> /dev/null; then
        local s3_bucket="${BACKUP_S3_BUCKET:-sio-audit-backups}"
        local s3_path="s3://$s3_bucket/$(basename $FINAL_BACKUP_PATH)"
        
        echo -e "${BLUE}   ☁️  Upload vers: $s3_path${NC}"
        
        if aws s3 cp "$FINAL_BACKUP_PATH" "$s3_path"; then
            echo -e "${GREEN}   ✅ Upload S3 réussi${NC}"
        else
            echo -e "${RED}   ❌ Échec de l'upload S3${NC}"
        fi
    else
        echo -e "${RED}   ❌ AWS CLI non installé${NC}"
    fi
fi

# Nettoyage des anciennes sauvegardes
echo -e "${YELLOW}7. Nettoyage des anciennes sauvegardes...${NC}"

local retention_days=${BACKUP_RETENTION_DAYS:-7}

echo -e "${BLUE}   🧹 Suppression des sauvegardes > $retention_days jours${NC}"

find "$BACKUP_ROOT" -name "*backup*" -type f -mtime +$retention_days -delete 2>/dev/null || true
find "$BACKUP_ROOT" -name "${ENV}_*" -type d -mtime +$retention_days -exec rm -rf {} + 2>/dev/null || true

echo -e "${GREEN}   ✅ Nettoyage terminé${NC}"

# Résumé final
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  ✅ Sauvegarde terminée${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

echo -e "${BLUE}📊 Résumé:${NC}"
echo "   Environnement:      $ENV_NAME"
echo "   Type:               $BACKUP_TYPE"
echo "   Timestamp:          $TIMESTAMP"
echo "   Emplacement:        $FINAL_BACKUP_PATH"

if [ -f "$FINAL_BACKUP_PATH" ] || [ -d "$FINAL_BACKUP_PATH" ]; then
    local final_size=$(du -sh "$FINAL_BACKUP_PATH" | cut -f1)
    echo "   Taille finale:      $final_size"
fi

echo ""
echo -e "${BLUE}🔄 Pour restaurer:${NC}"
echo "   ./scripts/restore.sh $ENV $FINAL_BACKUP_PATH"

echo ""
echo -e "${GREEN}💾 Sauvegarde SIO Audit réussie !${NC}"

# Log de la sauvegarde
echo "$(date): Sauvegarde $BACKUP_TYPE réussie - $FINAL_BACKUP_PATH" >> "$BACKUP_ROOT/backup.log"



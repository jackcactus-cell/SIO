#!/bin/bash

# =================================================================
# SIO Audit App - Script de nettoyage
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
CLEANUP_TYPE="basic"
FORCE=false

# Fichiers de configuration
if [ "$ENV" = "dev" ] || [ "$ENV" = "development" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    ENV_NAME="développement"
else
    COMPOSE_FILE="docker-compose.yml"
    ENV_NAME="production"
fi

# Fonction d'aide
show_help() {
    echo "Usage: $0 [environment] [options]"
    echo ""
    echo "Environments:"
    echo "  production (default) - Mode production"
    echo "  dev                  - Mode développement"
    echo ""
    echo "Types de nettoyage:"
    echo "  --basic              - Nettoyage de base (défaut)"
    echo "  --deep               - Nettoyage approfondi"
    echo "  --full               - Nettoyage complet (ATTENTION: supprime tout)"
    echo "  --logs-only          - Nettoyage des logs uniquement"
    echo "  --docker-only        - Nettoyage Docker uniquement"
    echo ""
    echo "Options:"
    echo "  --force, -f          - Forcer sans confirmation"
    echo "  --help, -h           - Afficher cette aide"
    echo ""
    echo "Niveaux de nettoyage:"
    echo "  basic:  Images inutilisées, conteneurs arrêtés"
    echo "  deep:   + réseaux, volumes anonymes, cache build"
    echo "  full:   + volumes de données, sauvegardes anciennes"
    echo ""
    echo "Exemples:"
    echo "  $0                   # Nettoyage de base en production"
    echo "  $0 dev --deep        # Nettoyage approfondi en développement"
    echo "  $0 --logs-only       # Nettoyage des logs uniquement"
    echo "  $0 --full --force    # Nettoyage complet sans confirmation"
}

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --basic)
            CLEANUP_TYPE="basic"
            shift
            ;;
        --deep)
            CLEANUP_TYPE="deep"
            shift
            ;;
        --full)
            CLEANUP_TYPE="full"
            shift
            ;;
        --logs-only)
            CLEANUP_TYPE="logs"
            shift
            ;;
        --docker-only)
            CLEANUP_TYPE="docker"
            shift
            ;;
        --force|-f)
            FORCE=true
            shift
            ;;
        dev|development|prod|production)
            ENV=$1
            if [ "$ENV" = "dev" ] || [ "$ENV" = "development" ]; then
                COMPOSE_FILE="docker-compose.dev.yml"
                ENV_NAME="développement"
            else
                COMPOSE_FILE="docker-compose.yml"
                ENV_NAME="production"
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
echo -e "${BLUE}  SIO Audit App - Nettoyage${NC}"
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

# Affichage de la configuration
echo -e "${CYAN}🧹 Configuration du nettoyage:${NC}"
echo "   Environnement:      $ENV_NAME"
echo "   Type:               $CLEANUP_TYPE"
echo "   Force:              $([ "$FORCE" = true ] && echo "Oui" || echo "Non")"
echo ""

# Fonction pour afficher l'espace avant/après
show_docker_space() {
    echo -e "${CYAN}💾 Espace Docker:${NC}"
    docker system df
    echo ""
}

# Espace initial
echo -e "${YELLOW}📊 État initial:${NC}"
show_docker_space

# Vérifier l'état des services
echo -e "${YELLOW}1. Vérification de l'état des services...${NC}"

RUNNING_SERVICES=$(docker-compose -f $COMPOSE_FILE ps --services --filter "status=running" 2>/dev/null || echo "")

if [ -n "$RUNNING_SERVICES" ]; then
    echo -e "${YELLOW}⚠️  Services en cours d'exécution détectés:${NC}"
    echo "$RUNNING_SERVICES" | while read -r service; do
        if [ -n "$service" ]; then
            echo "   • $service"
        fi
    done
    echo ""
    
    if [ "$FORCE" = false ] && [ "$CLEANUP_TYPE" != "logs" ]; then
        echo -e "${RED}❌ Des services sont actifs. Arrêtez-les d'abord ou utilisez --force${NC}"
        echo "   Commande: ./scripts/stop.sh $ENV"
        exit 1
    fi
elif [ -f "$COMPOSE_FILE" ]; then
    echo -e "${GREEN}✅ Aucun service actif${NC}"
else
    echo -e "${YELLOW}⚠️  Fichier compose introuvable${NC}"
fi

# Demander confirmation si pas forcé
if [ "$FORCE" = false ]; then
    echo -e "${YELLOW}⚠️  Attention:${NC}"
    case $CLEANUP_TYPE in
        "basic")
            echo "   - Suppression des images Docker inutilisées"
            echo "   - Suppression des conteneurs arrêtés"
            echo "   - Nettoyage du cache build"
            ;;
        "deep")
            echo "   - Nettoyage de base +"
            echo "   - Suppression des réseaux non utilisés"
            echo "   - Suppression des volumes anonymes"
            echo "   - Suppression de toutes les images non utilisées"
            ;;
        "full")
            echo -e "${RED}   - Nettoyage approfondi +${NC}"
            echo -e "${RED}   - Suppression des volumes de données SIO${NC}"
            echo -e "${RED}   - Suppression des sauvegardes anciennes${NC}"
            echo -e "${RED}   - PERTE DÉFINITIVE DES DONNÉES${NC}"
            ;;
        "logs")
            echo "   - Suppression des logs anciens"
            echo "   - Rotation des logs Docker"
            ;;
        "docker")
            echo "   - Nettoyage complet Docker"
            echo "   - Suppression de toutes les ressources inutilisées"
            ;;
    esac
    
    echo ""
    read -p "Voulez-vous continuer ? (y/N): " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo -e "${BLUE}Nettoyage annulé.${NC}"
        exit 0
    fi
fi

# Fonction de nettoyage de base
cleanup_basic() {
    echo -e "${YELLOW}2. Nettoyage de base...${NC}"
    
    echo -e "${BLUE}   🗑️  Suppression des conteneurs arrêtés...${NC}"
    docker container prune -f
    
    echo -e "${BLUE}   🗑️  Suppression des images dangereuses...${NC}"
    docker image prune -f
    
    echo -e "${BLUE}   🗑️  Nettoyage du cache de build...${NC}"
    docker builder prune -f
    
    echo -e "${GREEN}   ✅ Nettoyage de base terminé${NC}"
}

# Fonction de nettoyage approfondi
cleanup_deep() {
    cleanup_basic
    
    echo -e "${YELLOW}3. Nettoyage approfondi...${NC}"
    
    echo -e "${BLUE}   🗑️  Suppression des réseaux non utilisés...${NC}"
    docker network prune -f
    
    echo -e "${BLUE}   🗑️  Suppression des volumes anonymes...${NC}"
    docker volume prune -f
    
    echo -e "${BLUE}   🗑️  Suppression de toutes les images non utilisées...${NC}"
    docker image prune -a -f
    
    echo -e "${GREEN}   ✅ Nettoyage approfondi terminé${NC}"
}

# Fonction de nettoyage complet
cleanup_full() {
    cleanup_deep
    
    echo -e "${YELLOW}4. Nettoyage complet (DANGEREUX)...${NC}"
    
    # Sauvegarder avant suppression si possible
    if [ -f "$COMPOSE_FILE" ] && echo "$RUNNING_SERVICES" | grep -q "mongodb" 2>/dev/null; then
        echo -e "${BLUE}   💾 Sauvegarde d'urgence avant suppression...${NC}"
        ./scripts/backup.sh $ENV --mongodb-only --no-compression 2>/dev/null || true
    fi
    
    echo -e "${BLUE}   🗑️  Suppression des volumes SIO...${NC}"
    docker volume ls --format "{{.Name}}" | grep "sio" | while read -r volume; do
        if [ -n "$volume" ]; then
            echo -e "${CYAN}      Suppression: $volume${NC}"
            docker volume rm "$volume" 2>/dev/null || true
        fi
    done
    
    echo -e "${BLUE}   🗑️  Suppression des anciennes sauvegardes...${NC}"
    if [ -d "backup" ]; then
        find backup -name "*" -type f -mtime +1 -delete 2>/dev/null || true
        echo -e "${CYAN}      Sauvegardes > 1 jour supprimées${NC}"
    fi
    
    echo -e "${BLUE}   🗑️  Nettoyage système Docker...${NC}"
    docker system prune -a -f --volumes
    
    echo -e "${GREEN}   ✅ Nettoyage complet terminé${NC}"
}

# Fonction de nettoyage des logs
cleanup_logs() {
    echo -e "${YELLOW}2. Nettoyage des logs...${NC}"
    
    # Logs du projet
    if [ -d "logs" ]; then
        echo -e "${BLUE}   🗑️  Nettoyage des logs du projet...${NC}"
        
        find logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
        find logs -name "*.log.*" -delete 2>/dev/null || true
        
        echo -e "${CYAN}      Logs > 7 jours supprimés${NC}"
    fi
    
    # Logs Docker (si possible)
    echo -e "${BLUE}   🗑️  Nettoyage des logs Docker...${NC}"
    
    docker container ls -a --format "{{.ID}}" | while read -r container; do
        if [ -n "$container" ]; then
            docker logs --tail 1000 "$container" > /dev/null 2>&1 || true
        fi
    done
    
    # Rotation des logs système (si logrotate disponible)
    if command -v logrotate &> /dev/null; then
        echo -e "${BLUE}   🗑️  Rotation des logs système...${NC}"
        logrotate -f /etc/logrotate.conf 2>/dev/null || true
    fi
    
    echo -e "${GREEN}   ✅ Nettoyage des logs terminé${NC}"
}

# Fonction de nettoyage Docker uniquement
cleanup_docker() {
    echo -e "${YELLOW}2. Nettoyage Docker complet...${NC}"
    
    echo -e "${BLUE}   🗑️  Arrêt de tous les conteneurs...${NC}"
    docker stop $(docker ps -aq) 2>/dev/null || true
    
    echo -e "${BLUE}   🗑️  Suppression de tous les conteneurs...${NC}"
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    echo -e "${BLUE}   🗑️  Suppression de toutes les images...${NC}"
    docker rmi $(docker images -aq) -f 2>/dev/null || true
    
    echo -e "${BLUE}   🗑️  Suppression de tous les volumes...${NC}"
    docker volume rm $(docker volume ls -q) 2>/dev/null || true
    
    echo -e "${BLUE}   🗑️  Suppression de tous les réseaux...${NC}"
    docker network rm $(docker network ls -q) 2>/dev/null || true
    
    echo -e "${BLUE}   🗑️  Nettoyage système complet...${NC}"
    docker system prune -a -f --volumes
    
    echo -e "${GREEN}   ✅ Nettoyage Docker complet terminé${NC}"
}

# Exécution selon le type
case $CLEANUP_TYPE in
    "basic")
        cleanup_basic
        ;;
    "deep")
        cleanup_deep
        ;;
    "full")
        cleanup_full
        ;;
    "logs")
        cleanup_logs
        ;;
    "docker")
        cleanup_docker
        ;;
esac

# Nettoyage final des fichiers temporaires
echo -e "${YELLOW}5. Nettoyage des fichiers temporaires...${NC}"

# Nettoyer les fichiers temporaires du projet
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true

# Nettoyer les caches Node.js si présents
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache 2>/dev/null || true
fi

if [ -d "project/node_modules/.cache" ]; then
    rm -rf project/node_modules/.cache 2>/dev/null || true
fi

if [ -d "backend/node_modules/.cache" ]; then
    rm -rf backend/node_modules/.cache 2>/dev/null || true
fi

echo -e "${GREEN}   ✅ Fichiers temporaires nettoyés${NC}"

# Espace final
echo ""
echo -e "${YELLOW}📊 État final:${NC}"
show_docker_space

# Résumé final
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  ✅ Nettoyage terminé${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

echo -e "${BLUE}📊 Résumé:${NC}"
echo "   Environnement:      $ENV_NAME"
echo "   Type de nettoyage:  $CLEANUP_TYPE"
echo "   Timestamp:          $(date '+%Y-%m-%d %H:%M:%S')"

# Conseils post-nettoyage
echo ""
echo -e "${BLUE}💡 Prochaines étapes:${NC}"

if [ "$CLEANUP_TYPE" = "full" ] || [ "$CLEANUP_TYPE" = "docker" ]; then
    echo "   1. Reconstruire les images: ./scripts/start.sh $ENV"
    echo "   2. Restaurer les données: ./scripts/restore.sh $ENV [backup_path]"
else
    echo "   1. Redémarrer si nécessaire: ./scripts/start.sh $ENV"
    echo "   2. Vérifier l'état: ./scripts/status.sh $ENV"
fi

echo ""
echo -e "${GREEN}🎯 Nettoyage SIO Audit terminé avec succès !${NC}"

# Log du nettoyage
echo "$(date): Nettoyage $CLEANUP_TYPE effectué en $ENV_NAME" >> "cleanup.log" 2>/dev/null || true



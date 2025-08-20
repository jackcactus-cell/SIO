#!/bin/bash

# =================================================================
# SIO Audit App - Script d'arrêt
# =================================================================

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DEFAULT_ENV="production"
ENV=${1:-$DEFAULT_ENV}

# Fichiers de configuration
if [ "$ENV" = "dev" ] || [ "$ENV" = "development" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    ENV_NAME="développement"
else
    COMPOSE_FILE="docker-compose.yml"
    ENV_NAME="production"
fi

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  SIO Audit App - Arrêt${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Fonction d'aide
show_help() {
    echo "Usage: $0 [environment] [options]"
    echo ""
    echo "Environments:"
    echo "  production (default) - Mode production"
    echo "  dev                  - Mode développement"
    echo ""
    echo "Options:"
    echo "  --volumes, -v        - Supprimer aussi les volumes de données"
    echo "  --force, -f          - Forcer l'arrêt sans confirmation"
    echo "  --help, -h           - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                   # Arrêt simple en production"
    echo "  $0 dev               # Arrêt en développement"
    echo "  $0 --volumes         # Arrêt avec suppression des volumes"
    echo "  $0 dev --force       # Arrêt forcé en développement"
}

# Variables pour les options
REMOVE_VOLUMES=false
FORCE_STOP=false

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --volumes|-v)
            REMOVE_VOLUMES=true
            shift
            ;;
        --force|-f)
            FORCE_STOP=true
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

# Vérifier si des services sont en cours d'exécution
echo -e "${YELLOW}1. Vérification de l'état des services...${NC}"

RUNNING_SERVICES=$(docker-compose -f $COMPOSE_FILE ps --services --filter "status=running" 2>/dev/null || echo "")

if [ -z "$RUNNING_SERVICES" ]; then
    echo -e "${GREEN}✅ Aucun service en cours d'exécution${NC}"
    echo "Rien à arrêter."
    exit 0
fi

echo -e "${BLUE}Services en cours d'exécution :${NC}"
docker-compose -f $COMPOSE_FILE ps

# Demander confirmation si pas de force
if [ "$FORCE_STOP" = false ]; then
    echo ""
    echo -e "${YELLOW}Environnement : $ENV_NAME${NC}"
    if [ "$REMOVE_VOLUMES" = true ]; then
        echo -e "${RED}⚠️  ATTENTION: Les volumes de données seront supprimés !${NC}"
        echo -e "${RED}   Cela effacera toutes les données de la base de données.${NC}"
    fi
    echo ""
    read -p "Voulez-vous vraiment arrêter l'application ? (y/N): " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo -e "${BLUE}Arrêt annulé.${NC}"
        exit 0
    fi
fi

# Sauvegarde automatique avant arrêt (si en production et si les volumes doivent être supprimés)
if [ "$REMOVE_VOLUMES" = true ] && [ "$ENV" != "dev" ] && [ "$ENV" != "development" ]; then
    echo -e "${YELLOW}2. Sauvegarde automatique avant suppression des données...${NC}"
    
    BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)_before_stop"
    mkdir -p "$BACKUP_DIR"
    
    # Sauvegarde MongoDB si possible
    if docker-compose -f $COMPOSE_FILE ps | grep -q "mongodb.*Up"; then
        echo -e "${YELLOW}   Sauvegarde de MongoDB...${NC}"
        if docker-compose -f $COMPOSE_FILE exec -T mongodb mongodump --out /tmp/backup_stop 2>/dev/null; then
            docker-compose -f $COMPOSE_FILE cp mongodb:/tmp/backup_stop "$BACKUP_DIR/" 2>/dev/null || true
            echo -e "${GREEN}   ✅ Sauvegarde MongoDB créée dans $BACKUP_DIR${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Impossible de sauvegarder MongoDB${NC}"
        fi
    fi
else
    echo -e "${YELLOW}2. Arrêt des services...${NC}"
fi

# Arrêt gracieux des services
echo -e "${YELLOW}   Envoi du signal d'arrêt aux services...${NC}"

# Arrêter d'abord les services frontend pour éviter de nouvelles requêtes
if echo "$RUNNING_SERVICES" | grep -q "frontend"; then
    echo -e "${BLUE}   🛑 Arrêt du frontend...${NC}"
    docker-compose -f $COMPOSE_FILE stop frontend
fi

# Ensuite les backends
for service in backend backend_python backend_llm; do
    if echo "$RUNNING_SERVICES" | grep -q "$service"; then
        echo -e "${BLUE}   🛑 Arrêt du $service...${NC}"
        docker-compose -f $COMPOSE_FILE stop $service
    fi
done

# Enfin la base de données
if echo "$RUNNING_SERVICES" | grep -q "mongodb"; then
    echo -e "${BLUE}   🛑 Arrêt de MongoDB...${NC}"
    docker-compose -f $COMPOSE_FILE stop mongodb
fi

# Arrêter tous les autres services restants
echo -e "${BLUE}   🛑 Arrêt des services restants...${NC}"
docker-compose -f $COMPOSE_FILE stop

# Supprimer les conteneurs
echo -e "${YELLOW}3. Suppression des conteneurs...${NC}"

if [ "$REMOVE_VOLUMES" = true ]; then
    docker-compose -f $COMPOSE_FILE down -v --remove-orphans
    echo -e "${GREEN}   ✅ Conteneurs et volumes supprimés${NC}"
else
    docker-compose -f $COMPOSE_FILE down --remove-orphans
    echo -e "${GREEN}   ✅ Conteneurs supprimés (volumes conservés)${NC}"
fi

# Nettoyage optionnel
echo -e "${YELLOW}4. Nettoyage...${NC}"

# Supprimer les réseaux orphelins
docker network prune -f > /dev/null 2>&1 || true

# Supprimer les images inutilisées (si demandé)
if [ "$FORCE_STOP" = true ]; then
    echo -e "${YELLOW}   Suppression des images inutilisées...${NC}"
    docker image prune -f > /dev/null 2>&1 || true
fi

echo -e "${GREEN}   ✅ Nettoyage terminé${NC}"

# Vérification finale
echo -e "${YELLOW}5. Vérification finale...${NC}"

REMAINING_CONTAINERS=$(docker-compose -f $COMPOSE_FILE ps -q 2>/dev/null || echo "")

if [ -z "$REMAINING_CONTAINERS" ]; then
    echo -e "${GREEN}   ✅ Tous les conteneurs sont arrêtés${NC}"
else
    echo -e "${YELLOW}   ⚠️  Quelques conteneurs persistent :${NC}"
    docker-compose -f $COMPOSE_FILE ps
fi

# Résumé final
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  ✅ Arrêt terminé${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

echo -e "${BLUE}📊 Résumé :${NC}"
echo "   Environnement:      $ENV_NAME"
echo "   Volumes supprimés:  $([ "$REMOVE_VOLUMES" = true ] && echo "Oui" || echo "Non")"
if [ "$REMOVE_VOLUMES" = true ] && [ -n "$BACKUP_DIR" ]; then
    echo "   Sauvegarde:         $BACKUP_DIR"
fi

echo ""
echo -e "${BLUE}🔄 Pour redémarrer :${NC}"
echo "   ./scripts/start.sh $ENV"

echo ""
echo -e "${GREEN}🎯 Application SIO Audit arrêtée avec succès !${NC}"

# Affichage des ressources libérées
if command -v docker &> /dev/null; then
    echo ""
    echo -e "${BLUE}💾 Espace Docker après arrêt :${NC}"
    docker system df
fi



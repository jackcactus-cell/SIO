#!/bin/bash

# =================================================================
# SIO Audit App - Script de visualisation des logs
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
SERVICE=""
LINES=""
FOLLOW=false
TIMESTAMPS=false

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
    echo "Usage: $0 [environment] [service] [options]"
    echo ""
    echo "Environments:"
    echo "  production (default) - Mode production"
    echo "  dev                  - Mode développement"
    echo ""
    echo "Services disponibles:"
    echo "  frontend            - Frontend React/Vite"
    echo "  backend             - Backend Node.js"
    echo "  backend_python      - Backend Python/FastAPI"
    echo "  backend_llm         - Service LLM/IA"
    echo "  mongodb             - Base de données MongoDB"
    echo "  nginx               - Serveur web Nginx (prod uniquement)"
    echo "  adminer             - Interface DB (dev uniquement)"
    echo ""
    echo "Options:"
    echo "  --follow, -f        - Suivre les logs en temps réel"
    echo "  --lines N, -n N     - Afficher les N dernières lignes"
    echo "  --timestamps, -t    - Afficher les timestamps"
    echo "  --help, -h          - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                          # Tous les logs en production"
    echo "  $0 dev                      # Tous les logs en développement"
    echo "  $0 prod backend             # Logs du backend en production"
    echo "  $0 dev frontend --follow    # Suivre les logs du frontend en dev"
    echo "  $0 --lines 100 backend      # 100 dernières lignes du backend"
    echo "  $0 backend --timestamps -f  # Backend avec timestamps en temps réel"
}

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --follow|-f)
            FOLLOW=true
            shift
            ;;
        --timestamps|-t)
            TIMESTAMPS=true
            shift
            ;;
        --lines|-n)
            if [[ -n $2 && $2 =~ ^[0-9]+$ ]]; then
                LINES=$2
                shift 2
            else
                echo -e "${RED}Erreur: --lines nécessite un nombre${NC}"
                exit 1
            fi
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
        frontend|backend|backend_python|backend_llm|mongodb|nginx|adminer)
            SERVICE=$1
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
echo -e "${BLUE}  SIO Audit App - Logs${NC}"
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

# Vérifier l'état des services
echo -e "${YELLOW}🔍 Vérification de l'état des services ($ENV_NAME)...${NC}"

RUNNING_SERVICES=$(docker-compose -f $COMPOSE_FILE ps --services --filter "status=running" 2>/dev/null || echo "")

if [ -z "$RUNNING_SERVICES" ]; then
    echo -e "${RED}❌ Aucun service n'est en cours d'exécution${NC}"
    echo "Démarrez l'application avec: ./scripts/start.sh $ENV"
    exit 1
fi

echo -e "${GREEN}✅ Services actifs:${NC}"
echo "$RUNNING_SERVICES" | while read -r service; do
    if [ -n "$service" ]; then
        echo "   • $service"
    fi
done

# Vérification du service spécifique
if [ -n "$SERVICE" ]; then
    if ! echo "$RUNNING_SERVICES" | grep -q "^$SERVICE$"; then
        echo -e "${RED}❌ Le service '$SERVICE' n'est pas en cours d'exécution${NC}"
        echo -e "${YELLOW}Services disponibles:${NC}"
        echo "$RUNNING_SERVICES" | while read -r service; do
            if [ -n "$service" ]; then
                echo "   • $service"
            fi
        done
        exit 1
    fi
fi

# Construction de la commande docker-compose logs
DOCKER_CMD="docker-compose -f $COMPOSE_FILE logs"

# Ajouter les options
if [ "$FOLLOW" = true ]; then
    DOCKER_CMD="$DOCKER_CMD --follow"
fi

if [ "$TIMESTAMPS" = true ]; then
    DOCKER_CMD="$DOCKER_CMD --timestamps"
fi

if [ -n "$LINES" ]; then
    DOCKER_CMD="$DOCKER_CMD --tail=$LINES"
fi

# Ajouter le service spécifique
if [ -n "$SERVICE" ]; then
    DOCKER_CMD="$DOCKER_CMD $SERVICE"
fi

# Affichage des informations
echo ""
echo -e "${CYAN}📊 Configuration des logs:${NC}"
echo "   Environnement:    $ENV_NAME"
echo "   Service:          $([ -n "$SERVICE" ] && echo "$SERVICE" || echo "Tous les services")"
echo "   Temps réel:       $([ "$FOLLOW" = true ] && echo "Oui" || echo "Non")"
echo "   Timestamps:       $([ "$TIMESTAMPS" = true ] && echo "Oui" || echo "Non")"
echo "   Lignes:           $([ -n "$LINES" ] && echo "$LINES dernières" || echo "Toutes")"

echo ""
if [ "$FOLLOW" = true ]; then
    echo -e "${YELLOW}📜 Affichage des logs en temps réel (Ctrl+C pour arrêter)...${NC}"
else
    echo -e "${YELLOW}📜 Affichage des logs...${NC}"
fi
echo ""

# Fonction pour coloriser les logs selon leur niveau
colorize_logs() {
    while IFS= read -r line; do
        if [[ $line =~ ERROR|ERRO|FATAL|CRITICAL ]]; then
            echo -e "${RED}$line${NC}"
        elif [[ $line =~ WARN|WARNING ]]; then
            echo -e "${YELLOW}$line${NC}"
        elif [[ $line =~ INFO ]]; then
            echo -e "${BLUE}$line${NC}"
        elif [[ $line =~ DEBUG ]]; then
            echo -e "${CYAN}$line${NC}"
        elif [[ $line =~ SUCCESS|OK ]]; then
            echo -e "${GREEN}$line${NC}"
        else
            echo "$line"
        fi
    done
}

# Gestion des signaux pour un arrêt propre
cleanup() {
    echo ""
    echo -e "${BLUE}📋 Logs arrêtés.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Exécution de la commande avec colorisation
if [ "$FOLLOW" = true ]; then
    echo -e "${CYAN}🔄 Suivre les logs (Ctrl+C pour arrêter):${NC}"
    echo ""
    eval $DOCKER_CMD | colorize_logs
else
    eval $DOCKER_CMD | colorize_logs
fi

echo ""
echo -e "${GREEN}✅ Logs affichés avec succès${NC}"

# Conseils supplémentaires
echo ""
echo -e "${BLUE}💡 Conseils utiles:${NC}"
echo "   • Pour suivre en temps réel: $0 $ENV ${SERVICE:-"[service]"} --follow"
echo "   • Pour voir les erreurs: $0 $ENV ${SERVICE:-"[service]"} | grep -i error"
echo "   • Pour sauvegarder: $0 $ENV ${SERVICE:-"[service]"} > logs_$(date +%Y%m%d_%H%M%S).txt"
echo "   • Pour plus d'options: $0 --help"

# Affichage de l'état actuel des conteneurs
if [ "$FOLLOW" = false ]; then
    echo ""
    echo -e "${BLUE}📊 État actuel des conteneurs:${NC}"
    docker-compose -f $COMPOSE_FILE ps
fi



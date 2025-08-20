#!/bin/bash

# =================================================================
# SIO Audit App - Script de redémarrage
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
REBUILD=false
FORCE_RECREATE=false

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
    echo "  --rebuild, -r       - Reconstruire les images avant redémarrage"
    echo "  --force, -f         - Forcer la recréation des conteneurs"
    echo "  --help, -h          - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                          # Redémarrer tous les services en production"
    echo "  $0 dev                      # Redémarrer tous les services en développement"
    echo "  $0 prod backend             # Redémarrer seulement le backend"
    echo "  $0 dev --rebuild            # Redémarrer avec reconstruction des images"
    echo "  $0 backend --force          # Forcer la recréation du backend"
}

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --rebuild|-r)
            REBUILD=true
            shift
            ;;
        --force|-f)
            FORCE_RECREATE=true
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
echo -e "${BLUE}  SIO Audit App - Redémarrage${NC}"
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
echo -e "${CYAN}🔄 Configuration du redémarrage:${NC}"
echo "   Environnement:      $ENV_NAME"
echo "   Service(s):         $([ -n "$SERVICE" ] && echo "$SERVICE" || echo "Tous les services")"
echo "   Reconstruction:     $([ "$REBUILD" = true ] && echo "Oui" || echo "Non")"
echo "   Recréation forcée:  $([ "$FORCE_RECREATE" = true ] && echo "Oui" || echo "Non")"
echo ""

# Vérifier l'état des services
echo -e "${YELLOW}1. Vérification de l'état actuel...${NC}"

RUNNING_SERVICES=$(docker-compose -f $COMPOSE_FILE ps --services --filter "status=running" 2>/dev/null || echo "")

if [ -z "$RUNNING_SERVICES" ]; then
    echo -e "${YELLOW}⚠️  Aucun service en cours d'exécution${NC}"
    echo "Démarrage initial de l'application..."
    
    # Lancer le script de démarrage à la place
    if [ -n "$SERVICE" ]; then
        echo -e "${BLUE}Note: Le service spécifique sera démarré avec tous les autres${NC}"
    fi
    
    exec ./scripts/start.sh $ENV
    exit 0
fi

echo -e "${GREEN}✅ Services actifs détectés:${NC}"
echo "$RUNNING_SERVICES" | while read -r service; do
    if [ -n "$service" ]; then
        echo "   • $service"
    fi
done

# Vérification du service spécifique
if [ -n "$SERVICE" ]; then
    if ! echo "$RUNNING_SERVICES" | grep -q "^$SERVICE$"; then
        echo -e "${YELLOW}⚠️  Le service '$SERVICE' n'est pas en cours d'exécution${NC}"
        echo "Il sera démarré lors du redémarrage."
    fi
fi

# Sauvegarde automatique avant redémarrage (pour MongoDB en production)
if [ "$ENV" != "dev" ] && [ "$ENV" != "development" ] && [ "$FORCE_RECREATE" = true ]; then
    if [ -z "$SERVICE" ] || [ "$SERVICE" = "mongodb" ]; then
        echo -e "${YELLOW}2. Sauvegarde préventive de MongoDB...${NC}"
        
        if docker-compose -f $COMPOSE_FILE ps | grep -q "mongodb.*Up"; then
            BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)_before_restart"
            mkdir -p "$BACKUP_DIR"
            
            if docker-compose -f $COMPOSE_FILE exec -T mongodb mongodump --out /tmp/backup_restart 2>/dev/null; then
                docker-compose -f $COMPOSE_FILE cp mongodb:/tmp/backup_restart "$BACKUP_DIR/" 2>/dev/null || true
                echo -e "${GREEN}   ✅ Sauvegarde créée dans $BACKUP_DIR${NC}"
            else
                echo -e "${YELLOW}   ⚠️  Sauvegarde impossible, continuer? (y/N)${NC}"
                read -p "" confirm
                if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
                    echo "Redémarrage annulé."
                    exit 0
                fi
            fi
        fi
    fi
fi

# Étape de reconstruction si demandée
if [ "$REBUILD" = true ]; then
    echo -e "${YELLOW}2. Reconstruction des images...${NC}"
    
    if [ -n "$SERVICE" ]; then
        echo -e "${BLUE}   🔨 Reconstruction de $SERVICE...${NC}"
        docker-compose -f $COMPOSE_FILE build --no-cache $SERVICE
    else
        echo -e "${BLUE}   🔨 Reconstruction de toutes les images...${NC}"
        docker-compose -f $COMPOSE_FILE build --no-cache
    fi
    
    echo -e "${GREEN}   ✅ Images reconstruites${NC}"
fi

# Étape d'arrêt
echo -e "${YELLOW}3. Arrêt des services...${NC}"

if [ -n "$SERVICE" ]; then
    echo -e "${BLUE}   🛑 Arrêt de $SERVICE...${NC}"
    docker-compose -f $COMPOSE_FILE stop $SERVICE
else
    echo -e "${BLUE}   🛑 Arrêt de tous les services...${NC}"
    
    # Arrêt ordonné : frontend -> backends -> base de données
    for stop_service in frontend backend backend_python backend_llm nginx adminer; do
        if echo "$RUNNING_SERVICES" | grep -q "^$stop_service$"; then
            echo -e "${CYAN}      Arrêt de $stop_service...${NC}"
            docker-compose -f $COMPOSE_FILE stop $stop_service
        fi
    done
    
    # MongoDB en dernier
    if echo "$RUNNING_SERVICES" | grep -q "mongodb"; then
        echo -e "${CYAN}      Arrêt de MongoDB...${NC}"
        docker-compose -f $COMPOSE_FILE stop mongodb
    fi
fi

echo -e "${GREEN}   ✅ Services arrêtés${NC}"

# Suppression des conteneurs si recréation forcée
if [ "$FORCE_RECREATE" = true ]; then
    echo -e "${YELLOW}4. Suppression des conteneurs...${NC}"
    
    if [ -n "$SERVICE" ]; then
        docker-compose -f $COMPOSE_FILE rm -f $SERVICE
    else
        docker-compose -f $COMPOSE_FILE rm -f
    fi
    
    echo -e "${GREEN}   ✅ Conteneurs supprimés${NC}"
fi

# Étape de redémarrage
echo -e "${YELLOW}5. Redémarrage des services...${NC}"

# Construction de la commande
RESTART_CMD="docker-compose -f $COMPOSE_FILE up -d"

if [ "$FORCE_RECREATE" = true ]; then
    RESTART_CMD="$RESTART_CMD --force-recreate"
fi

if [ -n "$SERVICE" ]; then
    RESTART_CMD="$RESTART_CMD $SERVICE"
    echo -e "${BLUE}   🚀 Redémarrage de $SERVICE...${NC}"
else
    echo -e "${BLUE}   🚀 Redémarrage de tous les services...${NC}"
fi

# Exécution du redémarrage
if ! eval $RESTART_CMD; then
    echo -e "${RED}❌ Erreur lors du redémarrage${NC}"
    echo ""
    echo -e "${YELLOW}Tentative de diagnostic:${NC}"
    docker-compose -f $COMPOSE_FILE ps
    docker-compose -f $COMPOSE_FILE logs --tail=20
    exit 1
fi

echo -e "${GREEN}   ✅ Services redémarrés${NC}"

# Vérification de la santé des services
echo -e "${YELLOW}6. Vérification de la santé des services...${NC}"

sleep 5

# Fonction pour vérifier si un service est en bonne santé
check_service_health() {
    local service=$1
    local url=$2
    local max_attempts=15
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s $url > /dev/null 2>&1; then
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    return 1
}

# Vérifications spécifiques selon le service
if [ -z "$SERVICE" ] || [ "$SERVICE" = "mongodb" ]; then
    echo -e "${CYAN}   🔍 MongoDB...${NC}"
    if docker-compose -f $COMPOSE_FILE exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ MongoDB opérationnel${NC}"
    else
        echo -e "${YELLOW}   ⚠️  MongoDB encore en cours de démarrage${NC}"
    fi
fi

if [ -z "$SERVICE" ] || [ "$SERVICE" = "backend" ]; then
    echo -e "${CYAN}   🔍 Backend Node.js...${NC}"
    if check_service_health "backend" "http://localhost:4000/api/health"; then
        echo -e "${GREEN}   ✅ Backend Node.js opérationnel${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Backend Node.js encore en démarrage${NC}"
    fi
fi

if [ -z "$SERVICE" ] || [ "$SERVICE" = "backend_python" ]; then
    echo -e "${CYAN}   🔍 Backend Python...${NC}"
    if check_service_health "backend_python" "http://localhost:8000/health"; then
        echo -e "${GREEN}   ✅ Backend Python opérationnel${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Backend Python encore en démarrage${NC}"
    fi
fi

if [ -z "$SERVICE" ] || [ "$SERVICE" = "backend_llm" ]; then
    echo -e "${CYAN}   🔍 Service LLM...${NC}"
    if check_service_health "backend_llm" "http://localhost:8001/health"; then
        echo -e "${GREEN}   ✅ Service LLM opérationnel${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Service LLM encore en démarrage${NC}"
    fi
fi

# Résumé final
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  ✅ Redémarrage terminé${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

echo -e "${BLUE}📊 Résumé:${NC}"
echo "   Environnement:      $ENV_NAME"
echo "   Service(s):         $([ -n "$SERVICE" ] && echo "$SERVICE" || echo "Tous les services")"
echo "   Images reconstruites: $([ "$REBUILD" = true ] && echo "Oui" || echo "Non")"
echo "   Conteneurs recréés: $([ "$FORCE_RECREATE" = true ] && echo "Oui" || echo "Non")"

# Afficher les URLs d'accès
echo ""
echo -e "${BLUE}📱 URLs d'accès:${NC}"
if [ "$ENV" = "dev" ] || [ "$ENV" = "development" ]; then
    echo "   Frontend (Dev):     http://localhost:5173"
    echo "   Adminer (DB):       http://localhost:8080"
else
    echo "   Frontend:           http://localhost:80"
fi
echo "   Backend Node.js:    http://localhost:4000"
echo "   Backend Python:     http://localhost:8000"
echo "   Service LLM:        http://localhost:8001"

# Afficher le statut final
echo ""
echo -e "${BLUE}📋 Statut final des services:${NC}"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo -e "${BLUE}💡 Commandes utiles:${NC}"
echo "   Voir les logs:      ./scripts/logs.sh $ENV"
echo "   Arrêter:            ./scripts/stop.sh $ENV"
echo "   Surveiller:         ./scripts/monitor.sh $ENV"

echo ""
echo -e "${GREEN}🎯 Redémarrage de l'application SIO Audit réussi !${NC}"



#!/bin/bash

# =================================================================
# SIO Audit App - Script de démarrage
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
echo -e "${BLUE}  SIO Audit App - Démarrage${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Fonction d'aide
show_help() {
    echo "Usage: $0 [environment]"
    echo ""
    echo "Environments:"
    echo "  production (default) - Mode production"
    echo "  dev                  - Mode développement"
    echo ""
    echo "Exemples:"
    echo "  $0                   # Démarrage en production"
    echo "  $0 dev               # Démarrage en développement"
}

# Vérification des arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Vérification de Docker
echo -e "${YELLOW}1. Vérification de Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas démarré${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker est prêt${NC}"

# Vérification des fichiers de configuration
echo -e "${YELLOW}2. Vérification de la configuration...${NC}"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Fichier $COMPOSE_FILE introuvable${NC}"
    exit 1
fi

# Création des fichiers d'environnement si nécessaire
if [ ! -f ".env" ] && [ -f "env.example" ]; then
    echo -e "${YELLOW}📝 Création du fichier .env depuis env.example${NC}"
    cp env.example .env
fi

if [ ! -f "backend_python/.env" ] && [ -f "backend_python/env.example" ]; then
    echo -e "${YELLOW}📝 Création du fichier backend_python/.env${NC}"
    cp backend_python/env.example backend_python/.env
fi

echo -e "${GREEN}✅ Configuration vérifiée${NC}"

# Vérification si les services sont déjà en cours d'exécution
echo -e "${YELLOW}3. Vérification de l'état des services...${NC}"

if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  Des services sont déjà en cours d'exécution${NC}"
    echo ""
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    read -p "Voulez-vous les redémarrer ? (y/N): " restart_choice
    
    if [ "$restart_choice" = "y" ] || [ "$restart_choice" = "Y" ]; then
        echo -e "${YELLOW}🔄 Redémarrage des services...${NC}"
        docker-compose -f $COMPOSE_FILE down
    else
        echo -e "${GREEN}✅ Services déjà actifs${NC}"
        exit 0
    fi
fi

# Construction des images si nécessaire
echo -e "${YELLOW}4. Vérification des images Docker...${NC}"

# Vérifier si les images existent
IMAGES_EXIST=true
for service in frontend backend backend_python backend_llm; do
    if ! docker images | grep -q "sio.*$service"; then
        IMAGES_EXIST=false
        break
    fi
done

if [ "$IMAGES_EXIST" = false ]; then
    echo -e "${YELLOW}🔨 Construction des images Docker...${NC}"
    echo "Cela peut prendre quelques minutes..."
    
    if ! docker-compose -f $COMPOSE_FILE build; then
        echo -e "${RED}❌ Erreur lors de la construction des images${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Images construites avec succès${NC}"
else
    echo -e "${GREEN}✅ Images Docker présentes${NC}"
fi

# Démarrage des services
echo -e "${YELLOW}5. Démarrage des services en mode $ENV_NAME...${NC}"

if ! docker-compose -f $COMPOSE_FILE up -d; then
    echo -e "${RED}❌ Erreur lors du démarrage des services${NC}"
    exit 1
fi

# Attendre que les services soient prêts
echo -e "${YELLOW}6. Attente du démarrage complet...${NC}"

# Fonction pour vérifier si un service est en bonne santé
check_service_health() {
    local service=$1
    local url=$2
    local max_attempts=30
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

# Vérifier les services de base
sleep 5

echo -e "${YELLOW}   Vérification de MongoDB...${NC}"
if docker-compose -f $COMPOSE_FILE exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ MongoDB prêt${NC}"
else
    echo -e "${YELLOW}   ⏳ MongoDB en cours de démarrage...${NC}"
    sleep 10
fi

echo -e "${YELLOW}   Vérification du Backend Node.js...${NC}"
if check_service_health "backend" "http://localhost:4000/api/health"; then
    echo -e "${GREEN}   ✅ Backend Node.js prêt${NC}"
else
    echo -e "${YELLOW}   ⚠️  Backend Node.js encore en démarrage${NC}"
fi

echo -e "${YELLOW}   Vérification du Backend Python...${NC}"
if check_service_health "backend_python" "http://localhost:8000/health"; then
    echo -e "${GREEN}   ✅ Backend Python prêt${NC}"
else
    echo -e "${YELLOW}   ⚠️  Backend Python encore en démarrage${NC}"
fi

# Affichage du statut final
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  🎉 Application démarrée !${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Afficher les URLs d'accès
echo -e "${BLUE}📱 URLs d'accès :${NC}"
if [ "$ENV" = "dev" ] || [ "$ENV" = "development" ]; then
    echo "   Frontend (Dev):     http://localhost:5173"
    echo "   Adminer (DB):       http://localhost:8080"
else
    echo "   Frontend:           http://localhost:80"
fi
echo "   Backend Node.js:    http://localhost:4000"
echo "   Backend Python:     http://localhost:8000"
echo "   Service LLM:        http://localhost:8001"
echo "   MongoDB:            localhost:27017"

echo ""
echo -e "${BLUE}📊 Commandes utiles :${NC}"
echo "   Voir les logs:      ./scripts/logs.sh"
echo "   Voir le statut:     docker-compose -f $COMPOSE_FILE ps"
echo "   Arrêter:            ./scripts/stop.sh"
echo "   Redémarrer:         ./scripts/restart.sh"

# Afficher le statut des conteneurs
echo ""
echo -e "${BLUE}📋 Statut des services :${NC}"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo -e "${GREEN}✨ L'application SIO Audit est prête à être utilisée !${NC}"

# Option pour ouvrir automatiquement le navigateur
if command -v xdg-open &> /dev/null || command -v open &> /dev/null; then
    echo ""
    read -p "Voulez-vous ouvrir l'application dans le navigateur ? (y/N): " open_browser
    
    if [ "$open_browser" = "y" ] || [ "$open_browser" = "Y" ]; then
        if [ "$ENV" = "dev" ] || [ "$ENV" = "development" ]; then
            URL="http://localhost:5173"
        else
            URL="http://localhost:80"
        fi
        
        if command -v xdg-open &> /dev/null; then
            xdg-open $URL
        elif command -v open &> /dev/null; then
            open $URL
        fi
    fi
fi



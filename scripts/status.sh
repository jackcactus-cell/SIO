#!/bin/bash

# =================================================================
# SIO Audit App - Script d'état et monitoring
# =================================================================

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
DEFAULT_ENV="production"
ENV=${1:-$DEFAULT_ENV}
DETAILED=false
WATCH_MODE=false

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
    echo "Options:"
    echo "  --detailed, -d      - Affichage détaillé avec métriques"
    echo "  --watch, -w         - Mode surveillance continue"
    echo "  --help, -h          - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                  # Statut rapide en production"
    echo "  $0 dev              # Statut en développement"
    echo "  $0 --detailed       # Statut détaillé avec métriques"
    echo "  $0 dev --watch      # Surveillance continue en développement"
}

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --detailed|-d)
            DETAILED=true
            shift
            ;;
        --watch|-w)
            WATCH_MODE=true
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

# Fonction pour afficher l'état complet
show_status() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}  SIO Audit App - État du Système${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
    
    # Informations générales
    echo -e "${CYAN}🏗️  Configuration:${NC}"
    echo "   Environnement:      $ENV_NAME"
    echo "   Fichier compose:    $COMPOSE_FILE"
    echo "   Timestamp:          $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # Vérification de Docker
    echo -e "${CYAN}🐳 Docker:${NC}"
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        echo -e "${GREEN}   ✅ Docker opérationnel${NC}"
        if [ "$DETAILED" = true ]; then
            echo "   Version: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
            echo "   Compose: $(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)"
        fi
    else
        echo -e "${RED}   ❌ Docker non disponible${NC}"
        return 1
    fi
    echo ""
    
    # Vérification du fichier compose
    if [ ! -f "$COMPOSE_FILE" ]; then
        echo -e "${RED}❌ Fichier $COMPOSE_FILE introuvable${NC}"
        return 1
    fi
    
    # État des services
    echo -e "${CYAN}📋 Services:${NC}"
    
    local services=$(docker-compose -f $COMPOSE_FILE config --services 2>/dev/null || echo "")
    local running_services=$(docker-compose -f $COMPOSE_FILE ps --services --filter "status=running" 2>/dev/null || echo "")
    
    if [ -z "$services" ]; then
        echo -e "${RED}   ❌ Impossible de lire la configuration${NC}"
        return 1
    fi
    
    local total_services=0
    local running_count=0
    
    for service in $services; do
        total_services=$((total_services + 1))
        if echo "$running_services" | grep -q "^$service$"; then
            echo -e "${GREEN}   ✅ $service${NC}"
            running_count=$((running_count + 1))
        else
            echo -e "${RED}   ❌ $service${NC}"
        fi
    done
    
    echo ""
    echo -e "${CYAN}📊 Résumé: $running_count/$total_services services actifs${NC}"
    echo ""
    
    # Détails des conteneurs
    if [ $running_count -gt 0 ]; then
        echo -e "${CYAN}🔍 Détails des conteneurs:${NC}"
        docker-compose -f $COMPOSE_FILE ps 2>/dev/null | tail -n +3 | while IFS= read -r line; do
            if [ -n "$line" ]; then
                if echo "$line" | grep -q "Up"; then
                    echo -e "${GREEN}   $line${NC}"
                else
                    echo -e "${RED}   $line${NC}"
                fi
            fi
        done
        echo ""
    fi
    
    # URLs d'accès si les services sont actifs
    if [ $running_count -gt 0 ]; then
        echo -e "${CYAN}🌐 URLs d'accès:${NC}"
        
        if echo "$running_services" | grep -q "frontend"; then
            if [ "$ENV" = "dev" ] || [ "$ENV" = "development" ]; then
                echo "   Frontend (Dev):     http://localhost:5173"
            else
                echo "   Frontend:           http://localhost:80"
            fi
        fi
        
        if echo "$running_services" | grep -q "backend"; then
            echo "   Backend Node.js:    http://localhost:4000"
            # Test de santé
            if curl -f -s http://localhost:4000/api/health > /dev/null 2>&1; then
                echo -e "${GREEN}                       (✅ Healthy)${NC}"
            else
                echo -e "${YELLOW}                       (⚠️  Starting)${NC}"
            fi
        fi
        
        if echo "$running_services" | grep -q "backend_python"; then
            echo "   Backend Python:     http://localhost:8000"
            # Test de santé
            if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
                echo -e "${GREEN}                       (✅ Healthy)${NC}"
            else
                echo -e "${YELLOW}                       (⚠️  Starting)${NC}"
            fi
        fi
        
        if echo "$running_services" | grep -q "backend_llm"; then
            echo "   Service LLM:        http://localhost:8001"
            # Test de santé
            if curl -f -s http://localhost:8001/health > /dev/null 2>&1; then
                echo -e "${GREEN}                       (✅ Healthy)${NC}"
            else
                echo -e "${YELLOW}                       (⚠️  Starting)${NC}"
            fi
        fi
        
        if echo "$running_services" | grep -q "mongodb"; then
            echo "   MongoDB:            localhost:27017"
            # Test de santé MongoDB
            if docker-compose -f $COMPOSE_FILE exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
                echo -e "${GREEN}                       (✅ Healthy)${NC}"
            else
                echo -e "${YELLOW}                       (⚠️  Starting)${NC}"
            fi
        fi
        
        if [ "$ENV" = "dev" ] && echo "$running_services" | grep -q "adminer"; then
            echo "   Adminer (DB):       http://localhost:8080"
        fi
        
        echo ""
    fi
    
    # Informations détaillées si demandées
    if [ "$DETAILED" = true ] && [ $running_count -gt 0 ]; then
        echo -e "${CYAN}📈 Utilisation des ressources:${NC}"
        
        # En-tête pour les stats
        echo "   Container           CPU %    Memory Usage    Memory %    Net I/O"
        echo "   ─────────────────────────────────────────────────────────────────"
        
        # Stats des conteneurs avec formatage
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}" | tail -n +2 | \
        while IFS=$'\t' read -r name cpu mem_usage mem_perc net_io; do
            if docker-compose -f $COMPOSE_FILE ps -q | xargs docker inspect --format '{{.Name}}' | grep -q "$name"; then
                printf "   %-18s  %-7s  %-14s  %-9s  %s\n" "${name:1}" "$cpu" "$mem_usage" "$mem_perc" "$net_io"
            fi
        done 2>/dev/null || echo "   Impossible de récupérer les métriques"
        
        echo ""
        
        # Espace disque Docker
        echo -e "${CYAN}💾 Espace disque Docker:${NC}"
        docker system df --format "table {{.Type}}\t{{.Total}}\t{{.Active}}\t{{.Size}}\t{{.Reclaimable}}" | \
        while IFS=$'\t' read -r type total active size reclaimable; do
            if [ "$type" != "TYPE" ]; then
                printf "   %-12s  Total: %-6s  Actif: %-6s  Taille: %-10s  Récupérable: %s\n" \
                    "$type" "$total" "$active" "$size" "$reclaimable"
            fi
        done
        echo ""
        
        # Volumes Docker
        echo -e "${CYAN}📦 Volumes Docker:${NC}"
        docker volume ls --format "table {{.Name}}\t{{.Driver}}" | grep "sio" | \
        while IFS=$'\t' read -r name driver; do
            if [ -n "$name" ]; then
                size=$(docker system df -v | grep "$name" | awk '{print $3}' || echo "Unknown")
                printf "   %-35s  Driver: %-6s  Taille: %s\n" "$name" "$driver" "$size"
            fi
        done 2>/dev/null || echo "   Aucun volume SIO trouvé"
        echo ""
        
        # Réseaux Docker
        echo -e "${CYAN}🌐 Réseaux Docker:${NC}"
        docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}" | grep -E "(sio|bridge)" | \
        while IFS=$'\t' read -r name driver scope; do
            if [ "$name" != "NAME" ]; then
                printf "   %-20s  Driver: %-7s  Scope: %s\n" "$name" "$driver" "$scope"
            fi
        done
        echo ""
    fi
    
    # Logs récents en cas de problème
    if [ $running_count -lt $total_services ] && [ $running_count -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Logs récents des services en erreur:${NC}"
        for service in $services; do
            if ! echo "$running_services" | grep -q "^$service$"; then
                echo -e "${RED}   ❌ $service:${NC}"
                docker-compose -f $COMPOSE_FILE logs --tail=3 $service 2>/dev/null | \
                sed 's/^/      /' || echo "      Pas de logs disponibles"
                echo ""
            fi
        done
    fi
    
    # Conseils
    echo -e "${CYAN}💡 Commandes utiles:${NC}"
    if [ $running_count -eq 0 ]; then
        echo "   Démarrer:           ./scripts/start.sh $ENV"
    else
        echo "   Voir les logs:      ./scripts/logs.sh $ENV"
        echo "   Redémarrer:         ./scripts/restart.sh $ENV"
        echo "   Arrêter:            ./scripts/stop.sh $ENV"
    fi
    echo "   Surveiller:         $0 $ENV --watch"
    echo "   Détails:            $0 $ENV --detailed"
}

# Vérification de Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

# Mode surveillance continue
if [ "$WATCH_MODE" = true ]; then
    echo -e "${MAGENTA}🔄 Mode surveillance continue activé (Ctrl+C pour arrêter)${NC}"
    echo ""
    
    # Gestion propre de l'arrêt
    cleanup() {
        echo ""
        echo -e "${BLUE}📋 Surveillance arrêtée.${NC}"
        exit 0
    }
    
    trap cleanup SIGINT SIGTERM
    
    while true; do
        clear
        show_status
        echo ""
        echo -e "${MAGENTA}🔄 Mise à jour dans 10 secondes... (Ctrl+C pour arrêter)${NC}"
        sleep 10
    done
else
    # Affichage unique
    show_status
fi



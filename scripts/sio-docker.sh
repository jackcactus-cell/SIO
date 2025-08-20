#!/bin/bash

# =================================================================
# SIO Audit App - Script principal de gestion Docker
# Point d'entrée unique pour toutes les opérations Docker
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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Fonction d'aide principale
show_help() {
    echo -e "${MAGENTA}======================================${NC}"
    echo -e "${MAGENTA}  SIO Audit App - Gestionnaire Docker${NC}"
    echo -e "${MAGENTA}======================================${NC}"
    echo ""
    echo -e "${CYAN}Usage: $0 <commande> [arguments...]${NC}"
    echo ""
    echo -e "${YELLOW}📱 Commandes principales:${NC}"
    echo "  start [env]                 Démarrer l'application"
    echo "  stop [env] [options]        Arrêter l'application"
    echo "  restart [env] [options]     Redémarrer l'application"
    echo "  status [env] [options]      Afficher l'état des services"
    echo ""
    echo -e "${YELLOW}📋 Gestion des logs:${NC}"
    echo "  logs [env] [service]        Afficher les logs"
    echo "  logs-follow [env] [service] Suivre les logs en temps réel"
    echo ""
    echo -e "${YELLOW}🔧 Maintenance:${NC}"
    echo "  backup [env] [options]      Sauvegarder les données"
    echo "  cleanup [env] [options]     Nettoyer les ressources"
    echo ""
    echo -e "${YELLOW}🏗️  Construction et développement:${NC}"
    echo "  build [env]                 Construire les images"
    echo "  rebuild [env]               Reconstruire sans cache"
    echo ""
    echo -e "${YELLOW}📊 Surveillance:${NC}"
    echo "  monitor [env]               Surveiller les performances"
    echo "  health [env]                Vérifier la santé des services"
    echo ""
    echo -e "${YELLOW}⚙️  Utilitaires:${NC}"
    echo "  shell <service>             Accéder au shell d'un service"
    echo "  exec <service> <command>    Exécuter une commande dans un service"
    echo "  update [env]                Mettre à jour l'application"
    echo ""
    echo -e "${YELLOW}🆘 Aide et information:${NC}"
    echo "  help                        Afficher cette aide"
    echo "  version                     Afficher la version"
    echo "  info                        Informations système"
    echo ""
    echo -e "${CYAN}Environnements disponibles:${NC}"
    echo "  production (prod)           Mode production (défaut)"
    echo "  development (dev)           Mode développement"
    echo ""
    echo -e "${CYAN}Services disponibles:${NC}"
    echo "  frontend                    Interface React/Vite"
    echo "  backend                     API Node.js/Express"
    echo "  backend_python              API Python/FastAPI"
    echo "  backend_llm                 Service LLM/IA"
    echo "  mongodb                     Base de données"
    echo ""
    echo -e "${GREEN}Exemples d'utilisation:${NC}"
    echo "  $0 start                    # Démarrer en production"
    echo "  $0 start dev                # Démarrer en développement"
    echo "  $0 logs backend             # Voir les logs du backend"
    echo "  $0 status dev --detailed    # État détaillé en dev"
    echo "  $0 backup --mongodb-only    # Sauvegarder seulement MongoDB"
    echo "  $0 shell mongodb            # Accéder au shell MongoDB"
    echo ""
    echo -e "${BLUE}💡 Astuce: Chaque commande a sa propre aide avec --help${NC}"
    echo "   Exemple: $0 start --help"
}

# Fonction de version
show_version() {
    echo -e "${BLUE}SIO Audit App - Gestionnaire Docker${NC}"
    echo "Version: 1.0.0"
    echo "Auteur: Équipe SIO Audit"
    echo ""
    echo -e "${CYAN}Composants:${NC}"
    
    if command -v docker &> /dev/null; then
        echo "  Docker: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
    else
        echo "  Docker: Non installé"
    fi
    
    if command -v docker-compose &> /dev/null; then
        echo "  Docker Compose: $(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)"
    else
        echo "  Docker Compose: Non installé"
    fi
    
    echo "  Système: $(uname -s) $(uname -r)"
}

# Fonction d'informations système
show_info() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}  Informations Système${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
    
    echo -e "${CYAN}🖥️  Système:${NC}"
    echo "  OS: $(uname -s) $(uname -r)"
    echo "  Architecture: $(uname -m)"
    echo "  Utilisateur: $(whoami)"
    echo "  Répertoire: $PROJECT_ROOT"
    echo ""
    
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        echo -e "${CYAN}🐳 Docker:${NC}"
        echo "  Version: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
        echo "  Compose: $(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)"
        echo "  Statut: Opérationnel"
        
        local containers=$(docker ps -q | wc -l)
        local images=$(docker images -q | wc -l)
        local volumes=$(docker volume ls -q | wc -l)
        
        echo "  Conteneurs actifs: $containers"
        echo "  Images: $images"
        echo "  Volumes: $volumes"
        echo ""
        
        echo -e "${CYAN}💾 Espace Docker:${NC}"
        docker system df --format "table {{.Type}}\t{{.Total}}\t{{.Active}}\t{{.Size}}"
    else
        echo -e "${RED}❌ Docker non disponible${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}📁 Fichiers de configuration:${NC}"
    
    for file in docker-compose.yml docker-compose.dev.yml .env backend_python/.env; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            echo -e "${GREEN}  ✅ $file${NC}"
        else
            echo -e "${RED}  ❌ $file${NC}"
        fi
    done
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    local errors=0
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker n'est pas installé${NC}"
        errors=$((errors + 1))
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
        errors=$((errors + 1))
    fi
    
    if command -v docker &> /dev/null && ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker n'est pas démarré${NC}"
        errors=$((errors + 1))
    fi
    
    if [ ! -d "$PROJECT_ROOT" ]; then
        echo -e "${RED}❌ Répertoire du projet introuvable${NC}"
        errors=$((errors + 1))
    fi
    
    return $errors
}

# Fonction pour exécuter un script spécialisé
run_script() {
    local script_name=$1
    shift
    local script_path="$SCRIPT_DIR/$script_name.sh"
    
    if [ -f "$script_path" ]; then
        cd "$PROJECT_ROOT"
        chmod +x "$script_path"
        exec "$script_path" "$@"
    else
        echo -e "${RED}❌ Script $script_name.sh introuvable${NC}"
        exit 1
    fi
}

# Fonction pour les commandes shell/exec
handle_shell_commands() {
    local command=$1
    local service=$2
    shift 2
    
    if [ -z "$service" ]; then
        echo -e "${RED}❌ Service requis pour la commande $command${NC}"
        echo "Services disponibles: frontend, backend, backend_python, backend_llm, mongodb"
        exit 1
    fi
    
    # Déterminer le fichier compose à utiliser
    local compose_file="docker-compose.yml"
    if [ -f "docker-compose.dev.yml" ]; then
        local running_dev=$(docker-compose -f docker-compose.dev.yml ps --services --filter "status=running" 2>/dev/null || echo "")
        if [ -n "$running_dev" ]; then
            compose_file="docker-compose.dev.yml"
        fi
    fi
    
    case $command in
        "shell")
            echo -e "${CYAN}🔧 Accès au shell de $service...${NC}"
            if [ "$service" = "mongodb" ]; then
                docker-compose -f $compose_file exec $service mongosh
            else
                docker-compose -f $compose_file exec $service bash
            fi
            ;;
        "exec")
            if [ $# -eq 0 ]; then
                echo -e "${RED}❌ Commande requise pour exec${NC}"
                exit 1
            fi
            echo -e "${CYAN}⚡ Exécution dans $service: $*${NC}"
            docker-compose -f $compose_file exec $service "$@"
            ;;
    esac
}

# Fonction pour la surveillance
handle_monitor() {
    local env=${1:-production}
    
    echo -e "${MAGENTA}📊 Surveillance SIO Audit App${NC}"
    echo -e "${CYAN}Environnement: $env${NC}"
    echo ""
    echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter${NC}"
    echo ""
    
    trap 'echo -e "\n${BLUE}Surveillance arrêtée${NC}"; exit 0' SIGINT
    
    while true; do
        clear
        echo -e "${MAGENTA}🔄 SIO Audit App - Surveillance Continue${NC}"
        echo -e "${CYAN}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo ""
        
        # Utiliser le script status avec surveillance
        "$SCRIPT_DIR/status.sh" $env --detailed
        
        echo ""
        echo -e "${YELLOW}⏳ Prochaine mise à jour dans 15 secondes...${NC}"
        sleep 15
    done
}

# Fonction pour vérifier la santé
handle_health() {
    local env=${1:-production}
    
    echo -e "${CYAN}🏥 Vérification de santé - Environnement: $env${NC}"
    echo ""
    
    # URLs de test selon l'environnement
    local urls=()
    if [ "$env" = "dev" ] || [ "$env" = "development" ]; then
        urls=(
            "http://localhost:5173"
            "http://localhost:4000/api/health"
            "http://localhost:8000/health"
            "http://localhost:8001/health"
        )
    else
        urls=(
            "http://localhost:80"
            "http://localhost:4000/api/health"
            "http://localhost:8000/health"
            "http://localhost:8001/health"
        )
    fi
    
    local names=("Frontend" "Backend Node.js" "Backend Python" "Service LLM")
    local healthy=0
    local total=${#urls[@]}
    
    for i in "${!urls[@]}"; do
        local url=${urls[$i]}
        local name=${names[$i]}
        
        echo -n "  $name: "
        
        if curl -f -s --max-time 5 "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Healthy${NC}"
            healthy=$((healthy + 1))
        else
            echo -e "${RED}❌ Unhealthy${NC}"
        fi
    done
    
    # Test MongoDB
    echo -n "  MongoDB: "
    local compose_file="docker-compose.yml"
    if [ "$env" = "dev" ] || [ "$env" = "development" ]; then
        compose_file="docker-compose.dev.yml"
    fi
    
    if docker-compose -f $compose_file exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
        healthy=$((healthy + 1))
        total=$((total + 1))
    else
        echo -e "${RED}❌ Unhealthy${NC}"
        total=$((total + 1))
    fi
    
    echo ""
    echo -e "${CYAN}📊 Résumé: $healthy/$total services en bonne santé${NC}"
    
    if [ $healthy -eq $total ]; then
        echo -e "${GREEN}🎉 Tous les services sont opérationnels !${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Certains services nécessitent votre attention${NC}"
        return 1
    fi
}

# Fonction de mise à jour
handle_update() {
    local env=${1:-production}
    
    echo -e "${CYAN}🔄 Mise à jour de l'application SIO Audit${NC}"
    echo ""
    
    # Vérifier git
    if command -v git &> /dev/null && [ -d ".git" ]; then
        echo -e "${YELLOW}1. Mise à jour du code source...${NC}"
        git pull
        echo ""
    fi
    
    # Reconstruire
    echo -e "${YELLOW}2. Reconstruction des images...${NC}"
    run_script "restart" $env --rebuild
}

# Script principal
main() {
    cd "$PROJECT_ROOT"
    
    local command=${1:-help}
    shift 2>/dev/null || true
    
    case $command in
        # Commandes principales
        "start")
            run_script "start" "$@"
            ;;
        "stop")
            run_script "stop" "$@"
            ;;
        "restart")
            run_script "restart" "$@"
            ;;
        "status")
            run_script "status" "$@"
            ;;
        
        # Logs
        "logs")
            run_script "logs" "$@"
            ;;
        "logs-follow")
            run_script "logs" "$@" --follow
            ;;
        
        # Maintenance
        "backup")
            run_script "backup" "$@"
            ;;
        "cleanup")
            run_script "cleanup" "$@"
            ;;
        
        # Construction
        "build")
            local env=${1:-production}
            local compose_file="docker-compose.yml"
            if [ "$env" = "dev" ] || [ "$env" = "development" ]; then
                compose_file="docker-compose.dev.yml"
            fi
            echo -e "${CYAN}🔨 Construction des images pour $env...${NC}"
            docker-compose -f $compose_file build
            ;;
        "rebuild")
            local env=${1:-production}
            local compose_file="docker-compose.yml"
            if [ "$env" = "dev" ] || [ "$env" = "development" ]; then
                compose_file="docker-compose.dev.yml"
            fi
            echo -e "${CYAN}🔨 Reconstruction complète pour $env...${NC}"
            docker-compose -f $compose_file build --no-cache
            ;;
        
        # Surveillance
        "monitor")
            handle_monitor "$@"
            ;;
        "health")
            handle_health "$@"
            ;;
        
        # Shell et exec
        "shell")
            handle_shell_commands "shell" "$@"
            ;;
        "exec")
            handle_shell_commands "exec" "$@"
            ;;
        
        # Mise à jour
        "update")
            handle_update "$@"
            ;;
        
        # Aide et info
        "help"|"--help"|"-h")
            show_help
            ;;
        "version"|"--version"|"-v")
            show_version
            ;;
        "info")
            show_info
            ;;
        
        # Commandes inconnues
        *)
            echo -e "${RED}❌ Commande inconnue: $command${NC}"
            echo ""
            echo -e "${YELLOW}Utilisez '$0 help' pour voir les commandes disponibles${NC}"
            exit 1
            ;;
    esac
}

# Vérifier les prérequis pour certaines commandes
if [[ "$1" != "help" && "$1" != "--help" && "$1" != "-h" && "$1" != "version" && "$1" != "--version" && "$1" != "-v" && "$1" != "info" ]]; then
    if ! check_prerequisites; then
        echo ""
        echo -e "${RED}❌ Prérequis non satisfaits${NC}"
        echo -e "${YELLOW}Consultez la documentation d'installation Docker${NC}"
        exit 1
    fi
fi

# Exécuter la fonction principale
main "$@"



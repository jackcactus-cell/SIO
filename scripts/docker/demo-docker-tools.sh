#!/bin/bash

# Script de démonstration des outils Docker SIO
# Auteur: Assistant IA
# Date: $(date +%Y-%m-%d)

echo "🐳 Démonstration des Outils Docker SIO"
echo "======================================"
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher les sections
print_section() {
    echo -e "${BLUE}📋 $1${NC}"
    echo "----------------------------------------"
}

# Fonction pour afficher les commandes
print_command() {
    echo -e "${YELLOW}💻 $1${NC}"
    echo -e "${CYAN}   $2${NC}"
    echo ""
}

# Fonction pour afficher les informations
print_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher les avertissements
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Fonction pour afficher les erreurs
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
print_section "Vérification des Prérequis"

if command -v docker &> /dev/null; then
    print_info "Docker est installé"
    docker --version
else
    print_error "Docker n'est pas installé"
    echo "Installez Docker avec : curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
fi

if command -v docker-compose &> /dev/null; then
    print_info "Docker Compose est installé"
    docker-compose --version
else
    print_error "Docker Compose n'est pas installé"
    echo "Installez Docker Compose avec : sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
fi

echo ""

# Présentation des scripts disponibles
print_section "Scripts Docker Disponibles"

echo -e "${PURPLE}📁 Structure des scripts :${NC}"
echo "scripts/docker/"
echo "├── 01-setup-environment.sh      # Configuration de base"
echo "├── env-config.sh                # Configuration interactive"
echo "├── quick-deploy.sh              # Déploiement rapide"
echo "├── 02-build-images.sh           # Construction des images"
echo "├── 03-start-services.sh         # Démarrage des services"
echo "├── 04-oracle-extract.sh         # Extraction Oracle"
echo "├── 05-stop-services.sh          # Arrêt des services"
echo "├── 06-logs.sh                   # Affichage des logs"
echo "├── 07-backup.sh                 # Sauvegarde"
echo "├── 08-cleanup.sh                # Nettoyage complet"
echo "├── 09-deploy.sh                 # Déploiement complet"
echo "├── 10-status.sh                 # État des services"
echo "├── 11-extract-advanced.sh       # Extraction avancée"
echo "└── 12-validate.sh               # Validation complète"
echo ""

# Options de déploiement
print_section "Options de Déploiement"

print_command "Option 1: Déploiement Rapide" "chmod +x scripts/docker/*.sh && ./scripts/docker/quick-deploy.sh"
print_info "Configuration automatique avec paramètres par défaut"
print_info "Installation Docker si nécessaire"
print_info "Génération automatique des clés"
print_warning "Adapté pour le développement et les tests"

print_command "Option 2: Déploiement Interactif" "./scripts/docker/env-config.sh"
print_info "Configuration personnalisée étape par étape"
print_info "Validation des paramètres"
print_info "Contrôle total du processus"
print_warning "Recommandé pour la production"

print_command "Option 3: Déploiement Windows" ".\scripts\startup\docker-manager.ps1"
print_info "Script PowerShell pour Windows"
print_info "Gestion Docker Desktop"
print_info "Interface graphique intégrée"

echo ""

# Démonstration des fonctionnalités
print_section "Fonctionnalités Principales"

echo -e "${PURPLE}🔧 Configuration :${NC}"
print_command "Configuration interactive" "./scripts/docker/env-config.sh"
print_info "Configure Oracle, MongoDB, sécurité, ports"

echo -e "${PURPLE}🏗️  Construction :${NC}"
print_command "Construction des images" "./scripts/docker/02-build-images.sh"
print_info "Construit 4 images : frontend, backend-node, backend-python, backend-llm"

echo -e "${PURPLE}🚀 Démarrage :${NC}"
print_command "Démarrage des services" "./scripts/docker/03-start-services.sh"
print_info "Démarre 5 services sur les ports 80, 4000, 8000, 8001, 27017"

echo -e "${PURPLE}📊 Monitoring :${NC}"
print_command "Vérification de l'état" "./scripts/docker/10-status.sh"
print_info "Affiche l'état des conteneurs et l'accessibilité des services"

print_command "Affichage des logs" "./scripts/docker/06-logs.sh"
print_info "Logs en temps réel de tous les services"

echo -e "${PURPLE}🗄️  Extraction Oracle :${NC}"
print_command "Extraction simple" "./scripts/docker/04-oracle-extract.sh"
print_info "Extrait les données d'audit Oracle vers MongoDB"

print_command "Extraction avancée" "./scripts/docker/11-extract-advanced.sh"
print_info "Extraction complète avec statistiques et métadonnées"

echo -e "${PURPLE}💾 Maintenance :${NC}"
print_command "Sauvegarde" "./scripts/docker/07-backup.sh"
print_info "Sauvegarde MongoDB et volumes avec horodatage"

print_command "Nettoyage" "./scripts/docker/08-cleanup.sh"
print_info "Arrêt et suppression des conteneurs et images"

print_command "Validation" "./scripts/docker/12-validate.sh"
print_info "Tests complets de connectivité et fonctionnalité"

echo ""

# Architecture des services
print_section "Architecture des Services"

echo -e "${PURPLE}🌐 Services déployés :${NC}"
echo "| Service | Port | Description |"
echo "|---------|------|-------------|"
echo "| Frontend | 80 | Interface React |"
echo "| Backend Node.js | 4000 | API Node.js |"
echo "| Backend Python | 8000 | API FastAPI + Oracle |"
echo "| Backend LLM | 8001 | Service IA |"
echo "| MongoDB | 27017 | Base de données |"

echo ""
echo -e "${PURPLE}💾 Volumes persistants :${NC}"
echo "- sio_mongodb_data : Données MongoDB"
echo "- sio_backend_data : Données backend Node.js"
echo "- sio_python_logs : Logs Python"
echo "- sio_python_cache : Cache Python"

echo ""

# Workflows recommandés
print_section "Workflows Recommandés"

echo -e "${PURPLE}🛠️  Développement Local :${NC}"
print_command "Démarrage rapide" "./scripts/docker/quick-deploy.sh"
print_command "Vérification" "./scripts/docker/10-status.sh"
print_command "Logs temps réel" "./scripts/docker/06-logs.sh"

echo -e "${PURPLE}🏭 Production :${NC}"
print_command "Configuration" "./scripts/docker/env-config.sh"
print_command "Construction" "./scripts/docker/02-build-images.sh"
print_command "Démarrage" "./scripts/docker/03-start-services.sh"
print_command "Validation" "./scripts/docker/12-validate.sh"
print_command "Extraction" "./scripts/docker/04-oracle-extract.sh"

echo -e "${PURPLE}🔧 Maintenance :${NC}"
print_command "Sauvegarde" "./scripts/docker/07-backup.sh"
print_command "Mise à jour" "./scripts/docker/05-stop-services.sh && ./scripts/docker/02-build-images.sh && ./scripts/docker/03-start-services.sh"
print_command "Validation" "./scripts/docker/12-validate.sh"

echo ""

# Dépannage
print_section "Dépannage"

echo -e "${PURPLE}🔍 Problèmes courants :${NC}"
print_warning "Ports déjà utilisés : sudo netstat -tulpn | grep :80"
print_warning "Connexion Oracle échoue : Vérifiez .env et accès réseau"
print_warning "Services ne répondent pas : ./scripts/docker/10-status.sh"

echo -e "${PURPLE}📋 Commandes de diagnostic :${NC}"
print_command "État des conteneurs" "docker ps -a"
print_command "Logs d'un service" "docker logs sio_frontend_prod"
print_command "Utilisation ressources" "docker stats"
print_command "Espace disque" "df -h"

echo ""

# Démonstration interactive
print_section "Démonstration Interactive"

echo -e "${PURPLE}🎯 Voulez-vous tester un script spécifique ?${NC}"
echo "1. Configuration interactive"
echo "2. Déploiement rapide"
echo "3. Vérification de l'état"
echo "4. Affichage des logs"
echo "5. Validation complète"
echo "6. Quitter"

read -p "Choisissez une option (1-6): " choice

case $choice in
    1)
        echo -e "${GREEN}🚀 Lancement de la configuration interactive...${NC}"
        ./scripts/docker/env-config.sh
        ;;
    2)
        echo -e "${GREEN}🚀 Lancement du déploiement rapide...${NC}"
        ./scripts/docker/quick-deploy.sh
        ;;
    3)
        echo -e "${GREEN}📊 Vérification de l'état des services...${NC}"
        ./scripts/docker/10-status.sh
        ;;
    4)
        echo -e "${GREEN}📋 Affichage des logs...${NC}"
        ./scripts/docker/06-logs.sh
        ;;
    5)
        echo -e "${GREEN}✅ Validation complète...${NC}"
        ./scripts/docker/12-validate.sh
        ;;
    6)
        echo -e "${GREEN}👋 Au revoir !${NC}"
        exit 0
        ;;
    *)
        print_error "Option invalide"
        ;;
esac

echo ""
print_section "Ressources Utiles"

echo -e "${PURPLE}📚 Documentation :${NC}"
echo "- Guide complet : GUIDE_DOCKERISATION_COMPLETE.md"
echo "- Guide de déploiement : scripts/docker/DEPLOYMENT_GUIDE.md"
echo "- README Docker : scripts/docker/README.md"

echo -e "${PURPLE}🔗 Liens utiles :${NC}"
echo "- Documentation Docker : https://docs.docker.com/"
echo "- Documentation MongoDB : https://docs.mongodb.com/"
echo "- Documentation Oracle : https://docs.oracle.com/en/database/"

echo ""
echo -e "${GREEN}🎉 Démonstration terminée !${NC}"
echo -e "${CYAN}Votre projet SIA est prêt pour un déploiement Docker complet !${NC}"

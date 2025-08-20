#!/bin/bash

# =================================================================
# SIO Audit App - Setup Complet et Réorganisation
# Script maître pour arrangement complet du projet
# =================================================================

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${MAGENTA}${BOLD}============================================${NC}"
echo -e "${MAGENTA}${BOLD}  SIO Audit App - Setup Complet${NC}"
echo -e "${MAGENTA}${BOLD}============================================${NC}"
echo ""

# Fonction d'aide
show_help() {
    echo -e "${CYAN}Usage: $0 [options]${NC}"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --help, -h              Afficher cette aide"
    echo "  --reorganize-only       Seulement réorganiser (sans Docker setup)"
    echo "  --docker-only           Seulement setup Docker (sans réorganisation)"
    echo "  --validate-only         Seulement valider la structure"
    echo "  --force                 Forcer l'exécution sans confirmations"
    echo "  --dry-run               Simulation sans modifications"
    echo ""
    echo -e "${CYAN}Ce script effectue :${NC}"
    echo "  1. 🏗️  Réorganisation complète du projet"
    echo "  2. 🐳 Configuration Docker optimisée"
    echo "  3. 📜 Setup des scripts d'automatisation"
    echo "  4. 📚 Organisation de la documentation"
    echo "  5. ✅ Validation et tests"
    echo ""
    echo -e "${GREEN}Exemples :${NC}"
    echo "  $0                      # Setup complet"
    echo "  $0 --reorganize-only    # Seulement réorganiser"
    echo "  $0 --force              # Sans confirmations"
}

# Variables de configuration
REORGANIZE=true
DOCKER_SETUP=true
FORCE=false
DRY_RUN=false
VALIDATE_ONLY=false

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --reorganize-only)
            REORGANIZE=true
            DOCKER_SETUP=false
            shift
            ;;
        --docker-only)
            REORGANIZE=false
            DOCKER_SETUP=true
            shift
            ;;
        --validate-only)
            VALIDATE_ONLY=true
            REORGANIZE=false
            DOCKER_SETUP=false
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            echo -e "${RED}Option inconnue: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Fonction de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifications préalables
log_info "Vérification de l'environnement..."

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "backend/index.js" ] || [ ! -d "project" ]; then
    log_error "Ce script doit être exécuté depuis la racine du projet SIO"
    log_error "Structure attendue: backend/, project/, etc."
    exit 1
fi

# Vérifier les permissions
if [ ! -w "." ]; then
    log_error "Permissions d'écriture insuffisantes dans le répertoire courant"
    exit 1
fi

log_success "Environnement validé"

# Mode validation seulement
if [ "$VALIDATE_ONLY" = true ]; then
    log_info "Mode validation uniquement"
    
    if [ -f "validate-structure.sh" ]; then
        chmod +x validate-structure.sh
        ./validate-structure.sh
    else
        log_error "Script de validation introuvable"
        exit 1
    fi
    exit 0
fi

# Affichage du plan
echo ""
echo -e "${CYAN}📋 Plan d'exécution :${NC}"
if [ "$REORGANIZE" = true ]; then
    echo "  ✅ Réorganisation complète du projet"
fi
if [ "$DOCKER_SETUP" = true ]; then
    echo "  ✅ Configuration Docker et scripts"
fi
echo "  ✅ Validation finale"

if [ "$DRY_RUN" = true ]; then
    echo ""
    log_warning "Mode simulation - Aucune modification ne sera effectuée"
    echo ""
    echo -e "${CYAN}Actions qui seraient effectuées :${NC}"
    echo "  • Création de la nouvelle structure de dossiers"
    echo "  • Migration des applications vers apps/"
    echo "  • Réorganisation de l'infrastructure Docker"
    echo "  • Classification de la documentation"
    echo "  • Organisation des scripts"
    echo "  • Mise à jour des chemins et configurations"
    echo ""
    log_info "Simulation terminée. Utilisez sans --dry-run pour exécuter réellement."
    exit 0
fi

# Demander confirmation si pas forcé
if [ "$FORCE" = false ]; then
    echo ""
    log_warning "Cette opération va réorganiser complètement votre projet"
    log_warning "Assurez-vous d'avoir une sauvegarde !"
    echo ""
    read -p "Voulez-vous continuer ? (y/N): " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "Opération annulée par l'utilisateur"
        exit 0
    fi
fi

# Fonction de sauvegarde automatique
create_backup() {
    local backup_dir="../sio-backup-$(date +%Y%m%d_%H%M%S)"
    
    log_info "Création d'une sauvegarde automatique..."
    
    if cp -r . "$backup_dir" 2>/dev/null; then
        log_success "Sauvegarde créée : $backup_dir"
        echo "$backup_dir" > .backup_path
    else
        log_warning "Impossible de créer la sauvegarde automatique"
        if [ "$FORCE" = false ]; then
            read -p "Continuer quand même ? (y/N): " confirm
            if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
                exit 1
            fi
        fi
    fi
}

# Créer la sauvegarde
create_backup

echo ""
echo -e "${YELLOW}🚀 Début de la réorganisation...${NC}"

# Phase 1: Réorganisation
if [ "$REORGANIZE" = true ]; then
    echo ""
    echo -e "${CYAN}Phase 1/3: Réorganisation du projet${NC}"
    
    # Rendre le script exécutable
    chmod +x reorganize-project.sh
    
    # Exécuter la réorganisation
    if ./reorganize-project.sh; then
        log_success "Réorganisation terminée avec succès"
    else
        log_error "Erreur lors de la réorganisation"
        
        # Proposer la restauration
        if [ -f ".backup_path" ]; then
            backup_path=$(cat .backup_path)
            echo ""
            log_warning "Voulez-vous restaurer la sauvegarde ? ($backup_path)"
            read -p "Restaurer ? (y/N): " restore
            
            if [ "$restore" = "y" ] || [ "$restore" = "Y" ]; then
                rm -rf apps infrastructure scripts docs storage config 2>/dev/null || true
                cp -r "$backup_path"/* .
                log_info "Projet restauré depuis la sauvegarde"
            fi
        fi
        exit 1
    fi
else
    log_info "Réorganisation ignorée (--docker-only)"
fi

# Phase 2: Configuration Docker
if [ "$DOCKER_SETUP" = true ]; then
    echo ""
    echo -e "${CYAN}Phase 2/3: Configuration Docker${NC}"
    
    # Vérifier si le script setup-docker existe
    if [ -f "setup-docker.sh" ]; then
        chmod +x setup-docker.sh
        
        # Exécuter la configuration Docker
        if ./setup-docker.sh; then
            log_success "Configuration Docker terminée"
        else
            log_error "Erreur lors de la configuration Docker"
            exit 1
        fi
    else
        log_warning "Script setup-docker.sh introuvable, création manuelle..."
        
        # Créer la configuration de base
        mkdir -p scripts config storage
        
        # Rendre les scripts exécutables
        find scripts -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
        
        log_success "Configuration Docker de base effectuée"
    fi
else
    log_info "Configuration Docker ignorée (--reorganize-only)"
fi

# Phase 3: Validation
echo ""
echo -e "${CYAN}Phase 3/3: Validation${NC}"

# Rendre le script de validation exécutable
chmod +x validate-structure.sh

# Exécuter la validation
validation_result=0
if ./validate-structure.sh; then
    validation_result=0
    log_success "Validation réussie"
else
    validation_result=$?
    log_warning "Validation incomplète (code: $validation_result)"
fi

# Résumé final
echo ""
echo -e "${MAGENTA}${BOLD}============================================${NC}"
echo -e "${MAGENTA}${BOLD}  Résumé du Setup Complet${NC}"
echo -e "${MAGENTA}${BOLD}============================================${NC}"
echo ""

echo -e "${CYAN}📊 État des opérations :${NC}"
if [ "$REORGANIZE" = true ]; then
    echo -e "${GREEN}  ✅ Réorganisation du projet${NC}"
else
    echo -e "${YELLOW}  ⏭️  Réorganisation ignorée${NC}"
fi

if [ "$DOCKER_SETUP" = true ]; then
    echo -e "${GREEN}  ✅ Configuration Docker${NC}"
else
    echo -e "${YELLOW}  ⏭️  Configuration Docker ignorée${NC}"
fi

if [ $validation_result -eq 0 ]; then
    echo -e "${GREEN}  ✅ Validation réussie${NC}"
elif [ $validation_result -eq 1 ]; then
    echo -e "${YELLOW}  ⚠️  Validation partielle${NC}"
else
    echo -e "${RED}  ❌ Validation échouée${NC}"
fi

# Sauvegarde
if [ -f ".backup_path" ]; then
    backup_path=$(cat .backup_path)
    echo -e "${BLUE}  💾 Sauvegarde : $backup_path${NC}"
fi

echo ""
echo -e "${CYAN}📁 Nouvelle structure créée :${NC}"
echo "  📁 apps/                 # Applications (frontend, backend, etc.)"
echo "  📁 infrastructure/       # Docker, Kubernetes, etc."
echo "  📁 scripts/             # Scripts d'automatisation"
echo "  📁 docs/                # Documentation organisée"
echo "  📁 storage/             # Logs, backups, uploads"
echo "  📁 config/              # Configuration globale"

echo ""
echo -e "${CYAN}🚀 Prochaines étapes :${NC}"

if [ $validation_result -eq 0 ]; then
    echo "  1. Testez l'application :"
    echo "     cd infrastructure/docker"
    echo "     docker-compose -f docker-compose.dev.yml up"
    echo ""
    echo "  2. Vérifiez tous les services :"
    echo "     ../scripts/docker/status.sh dev"
    echo ""
    echo "  3. Nettoyez les anciens dossiers :"
    echo "     cd ../.."
    echo "     ./cleanup-old.sh"
    echo ""
    echo "  4. Commitez les changements :"
    echo "     git add ."
    echo "     git commit -m 'Réorganisation complète du projet SIO'"
    
else
    echo "  1. Corrigez les erreurs de validation"
    echo "  2. Relancez la validation : ./validate-structure.sh"
    echo "  3. En cas de problème : consultez le backup créé"
    
    if [ -f ".backup_path" ]; then
        echo "  4. Restauration possible depuis : $(cat .backup_path)"
    fi
fi

echo ""
echo -e "${CYAN}🛠️ Commandes utiles :${NC}"
echo "  Démarrer :        ./scripts/docker/start.sh"
echo "  Arrêter :         ./scripts/docker/stop.sh"
echo "  Voir les logs :   ./scripts/docker/logs.sh"
echo "  État :            ./scripts/docker/status.sh"
echo "  Aide complète :   cat GUIDE_REORGANISATION.md"

echo ""
if [ $validation_result -eq 0 ]; then
    echo -e "${GREEN}${BOLD}🎉 Setup complet réussi ! Votre projet SIO est maintenant parfaitement organisé !${NC}"
    
    # Nettoyer le fichier de backup temporaire
    rm -f .backup_path
    
    exit 0
else
    echo -e "${YELLOW}${BOLD}⚠️ Setup terminé avec des avertissements. Veuillez corriger les points signalés.${NC}"
    exit 1
fi



#!/bin/bash

# =============================================================================
# Script d'installation des prérequis pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils/docker-utils.sh"
source "$SCRIPT_DIR/utils/config-utils.sh"

# Configuration
readonly REQUIRED_PACKAGES=(
    "curl"
    "wget"
    "git"
    "jq"
    "bc"
    "net-tools"
    "ca-certificates"
    "apt-transport-https"
    "software-properties-common"
)

readonly DOCKER_REPO_URL="https://download.docker.com/linux/ubuntu"
readonly DOCKER_GPG_KEY="https://download.docker.com/linux/ubuntu/gpg"

# =============================================================================
# Fonctions d'installation
# =============================================================================

detect_os() {
    log_info "Détection du système d'exploitation..."
    
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        OS=$(lsb_release -si)
        VER=$(lsb_release -sr)
    elif [[ -f /etc/lsb-release ]]; then
        . /etc/lsb-release
        OS=$DISTRIB_ID
        VER=$DISTRIB_RELEASE
    elif [[ -f /etc/debian_version ]]; then
        OS=Debian
        VER=$(cat /etc/debian_version)
    elif [[ -f /etc/SuSe-release ]]; then
        OS=SuSE
    elif [[ -f /etc/redhat-release ]]; then
        OS=RedHat
    else
        OS=$(uname -s)
        VER=$(uname -r)
    fi
    
    log_success "Système détecté: $OS $VER"
    echo "$OS"
}

install_packages_ubuntu() {
    log_info "Installation des paquets sur Ubuntu/Debian..."
    
    # Mettre à jour les paquets
    sudo apt-get update
    
    # Installer les paquets requis
    for package in "${REQUIRED_PACKAGES[@]}"; do
        if ! dpkg -l | grep -q "^ii  $package "; then
            log_info "Installation de $package..."
            sudo apt-get install -y "$package"
        else
            log_info "$package est déjà installé"
        fi
    done
    
    log_success "Paquets installés avec succès"
}

install_packages_centos() {
    log_info "Installation des paquets sur CentOS/RHEL..."
    
    # Installer EPEL si nécessaire
    if ! rpm -q epel-release >/dev/null 2>&1; then
        log_info "Installation d'EPEL..."
        sudo yum install -y epel-release
    fi
    
    # Installer les paquets requis
    for package in "${REQUIRED_PACKAGES[@]}"; do
        if ! rpm -q "$package" >/dev/null 2>&1; then
            log_info "Installation de $package..."
            sudo yum install -y "$package"
        else
            log_info "$package est déjà installé"
        fi
    done
    
    log_success "Paquets installés avec succès"
}

install_docker_ubuntu() {
    log_info "Installation de Docker sur Ubuntu/Debian..."
    
    # Vérifier si Docker est déjà installé
    if command -v docker &> /dev/null; then
        log_info "Docker est déjà installé"
        return 0
    fi
    
    # Ajouter la clé GPG Docker
    log_info "Ajout de la clé GPG Docker..."
    curl -fsSL "$DOCKER_GPG_KEY" | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Ajouter le dépôt Docker
    log_info "Ajout du dépôt Docker..."
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] $DOCKER_REPO_URL $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Mettre à jour les paquets
    sudo apt-get update
    
    # Installer Docker
    log_info "Installation de Docker..."
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Ajouter l'utilisateur au groupe docker
    sudo usermod -aG docker "$USER"
    
    # Démarrer et activer Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    log_success "Docker installé avec succès"
}

install_docker_centos() {
    log_info "Installation de Docker sur CentOS/RHEL..."
    
    # Vérifier si Docker est déjà installé
    if command -v docker &> /dev/null; then
        log_info "Docker est déjà installé"
        return 0
    fi
    
    # Installer Docker depuis le dépôt officiel
    log_info "Installation de Docker..."
    sudo yum install -y yum-utils
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Ajouter l'utilisateur au groupe docker
    sudo usermod -aG docker "$USER"
    
    # Démarrer et activer Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    log_success "Docker installé avec succès"
}

install_docker_compose() {
    log_info "Installation de Docker Compose..."
    
    # Vérifier si Docker Compose est déjà installé
    if command -v docker-compose &> /dev/null; then
        log_info "Docker Compose est déjà installé"
        return 0
    fi
    
    # Installer Docker Compose
    local compose_version="v2.20.0"
    local compose_url="https://github.com/docker/compose/releases/download/${compose_version}/docker-compose-$(uname -s)-$(uname -m)"
    
    log_info "Téléchargement de Docker Compose $compose_version..."
    sudo curl -L "$compose_url" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Créer un lien symbolique
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log_success "Docker Compose installé avec succès"
}

install_nodejs() {
    log_info "Installation de Node.js..."
    
    # Vérifier si Node.js est déjà installé
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        log_info "Node.js est déjà installé: $node_version"
        return 0
    fi
    
    # Installer Node.js via NodeSource
    local node_version="18.x"
    local os_distro=$(lsb_release -cs)
    
    log_info "Ajout du dépôt NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_${node_version} | sudo -E bash -
    
    log_info "Installation de Node.js..."
    sudo apt-get install -y nodejs
    
    log_success "Node.js installé avec succès"
}

install_python() {
    log_info "Installation de Python..."
    
    # Vérifier si Python 3.11+ est déjà installé
    if command -v python3 &> /dev/null; then
        local python_version=$(python3 --version | cut -d' ' -f2)
        log_info "Python est déjà installé: $python_version"
        return 0
    fi
    
    # Installer Python 3.11
    log_info "Installation de Python 3.11..."
    sudo apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip
    
    # Créer un lien symbolique
    sudo ln -sf /usr/bin/python3.11 /usr/bin/python3
    
    log_success "Python installé avec succès"
}

configure_firewall() {
    log_info "Configuration du pare-feu..."
    
    # Vérifier si ufw est disponible
    if command -v ufw &> /dev/null; then
        # Autoriser les ports nécessaires
        sudo ufw allow 22/tcp   # SSH
        sudo ufw allow 80/tcp   # HTTP
        sudo ufw allow 443/tcp  # HTTPS
        sudo ufw allow 8000/tcp # Backend Python
        sudo ufw allow 4000/tcp # Backend Node.js
        sudo ufw allow 8001/tcp # Backend LLM
        sudo ufw allow 8081/tcp # Mongo Express
        
        # Activer le pare-feu
        sudo ufw --force enable
        
        log_success "Pare-feu configuré avec succès"
    else
        log_warning "ufw non disponible, configuration du pare-feu ignorée"
    fi
}

create_directories() {
    log_info "Création des répertoires nécessaires..."
    
    local directories=(
        "logs"
        "backups"
        "data"
        "config/docker"
        "config/docker/init-mongo"
    )
    
    for dir in "${directories[@]}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir"
            log_info "Répertoire créé: $dir"
        else
            log_info "Répertoire existant: $dir"
        fi
    done
    
    log_success "Répertoires créés avec succès"
}

configure_git() {
    log_info "Configuration de Git..."
    
    # Configurer Git si pas déjà configuré
    if ! git config --global user.name &> /dev/null; then
        log_info "Configuration du nom d'utilisateur Git..."
        read -p "Entrez votre nom d'utilisateur Git: " git_username
        git config --global user.name "$git_username"
    fi
    
    if ! git config --global user.email &> /dev/null; then
        log_info "Configuration de l'email Git..."
        read -p "Entrez votre email Git: " git_email
        git config --global user.email "$git_email"
    fi
    
    # Configurer le pull par défaut
    git config --global pull.rebase false
    
    log_success "Git configuré avec succès"
}

verify_installation() {
    log_info "Vérification de l'installation..."
    
    local tools=(
        "docker"
        "docker-compose"
        "node"
        "npm"
        "python3"
        "pip3"
        "git"
        "curl"
        "jq"
    )
    
    local missing_tools=()
    
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        else
            local version=$("$tool" --version 2>/dev/null || echo "version inconnue")
            log_info "$tool: $version"
        fi
    done
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Outils manquants: ${missing_tools[*]}"
        return 1
    fi
    
    # Vérifier Docker
    if ! docker info &> /dev/null; then
        log_error "Docker n'est pas accessible. Redémarrez votre session ou exécutez: newgrp docker"
        return 1
    fi
    
    log_success "Tous les outils sont installés et fonctionnels"
    return 0
}

# =============================================================================
# Fonction principale
# =============================================================================

main() {
    echo "=========================================="
    echo "  Installation des prérequis SIO"
    echo "=========================================="
    echo
    
    # Vérifier si le script est exécuté en tant que root
    if [[ $EUID -eq 0 ]]; then
        log_error "Ce script ne doit pas être exécuté en tant que root"
        exit 1
    fi
    
    # Détecter le système d'exploitation
    local os=$(detect_os)
    
    # Installer les paquets selon le système
    case "$os" in
        *"Ubuntu"*|*"Debian"*)
            install_packages_ubuntu
            install_docker_ubuntu
            install_python
            ;;
        *"CentOS"*|*"Red Hat"*|*"Fedora"*)
            install_packages_centos
            install_docker_centos
            ;;
        *)
            log_error "Système d'exploitation non supporté: $os"
            exit 1
            ;;
    esac
    
    # Installer les outils communs
    install_docker_compose
    install_nodejs
    
    # Configuration système
    configure_firewall
    create_directories
    configure_git
    
    # Configuration du projet
    setup_project_configuration
    
    # Vérification finale
    if verify_installation; then
        echo
        echo "=========================================="
        echo "  Installation terminée avec succès!"
        echo "=========================================="
        echo
        echo "Prochaines étapes:"
        echo "1. Redémarrez votre session ou exécutez: newgrp docker"
        echo "2. Configurez vos variables d'environnement:"
        echo "   - Éditez backend_python/.env"
        echo "   - Modifiez les paramètres Oracle et MongoDB"
        echo "3. Construisez les images: ./scripts/build.sh"
        echo "4. Déployez l'application: ./scripts/deploy.sh"
        echo
        echo "Documentation: scripts/README.md"
        echo
    else
        echo
        echo "=========================================="
        echo "  Installation terminée avec des erreurs"
        echo "=========================================="
        echo
        echo "Veuillez corriger les erreurs et réessayer."
        echo "Consultez les logs ci-dessus pour plus de détails."
        echo
        exit 1
    fi
}

# =============================================================================
# Exécution du script
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

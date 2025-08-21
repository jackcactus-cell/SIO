#!/bin/bash
set -e

echo "Déploiement complet SIO sur serveur Linux"

# Vérification des prérequis
echo "Vérification des prérequis..."
if ! command -v docker &> /dev/null; then
    echo "Installation de Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installation de Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Configuration de l'environnement
echo "Configuration de l'environnement..."
./scripts/docker/01-setup-environment.sh

# Construction des images
echo "Construction des images..."
./scripts/docker/02-build-images.sh

# Démarrage des services
echo "Démarrage des services..."
./scripts/docker/03-start-services.sh

# Extraction des données Oracle (si configuré)
echo "Voulez-vous extraire les données Oracle maintenant ? (y/n)"
read -p "Réponse: " extract_oracle

if [[ $extract_oracle =~ ^[Yy]$ ]]; then
    echo "Extraction des données Oracle..."
    ./scripts/docker/04-oracle-extract.sh
fi

echo "Déploiement terminé avec succès !"
echo "Application accessible sur: http://localhost"


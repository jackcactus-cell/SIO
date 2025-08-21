#!/bin/bash
set -e

echo "Démarrage des services Docker SIO"

# Vérification du fichier .env
if [ ! -f ".env" ]; then
    echo "ERROR: Fichier .env manquant. Exécutez d'abord 01-setup-environment.sh"
    exit 1
fi

# Arrêt des services existants
echo "Arrêt des services existants..."
docker-compose -f config/docker/docker-compose.yml down

# Démarrage des services
echo "Démarrage des services..."
docker-compose -f config/docker/docker-compose.yml up -d

# Attente du démarrage de MongoDB
echo "Attente du démarrage de MongoDB..."
sleep 30

# Vérification de l'état des services
echo "Vérification de l'état des services..."
docker-compose -f config/docker/docker-compose.yml ps

echo "Services démarrés avec succès !"
echo "Frontend: http://localhost"
echo "Backend Node.js: http://localhost:4000"
echo "Backend Python: http://localhost:8000"
echo "Backend LLM: http://localhost:8001"


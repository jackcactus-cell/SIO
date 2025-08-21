#!/bin/bash
set -e

echo "Nettoyage des conteneurs et images Docker SIO"

# Arrêt et suppression des conteneurs
echo "Arrêt des conteneurs..."
docker-compose -f config/docker/docker-compose.yml down

# Suppression des images
echo "Suppression des images..."
docker rmi sio-frontend:latest sio-backend-node:latest sio-backend-python:latest sio-backend-llm:latest 2>/dev/null || true

# Nettoyage des volumes (optionnel)
echo "Voulez-vous supprimer les volumes de données ? (y/n)"
read -p "Réponse: " delete_volumes

if [[ $delete_volumes =~ ^[Yy]$ ]]; then
    echo "Suppression des volumes..."
    docker volume rm sio_mongodb_data sio_backend_data sio_python_logs sio_python_cache 2>/dev/null || true
fi

# Nettoyage des réseaux
echo "Nettoyage des réseaux..."
docker network rm sio_network 2>/dev/null || true

echo "Nettoyage terminé !"


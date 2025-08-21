#!/bin/bash
set -e

echo "Arrêt des services Docker SIO"

# Arrêt des services
docker-compose -f config/docker/docker-compose.yml down

echo "Services arrêtés avec succès !"


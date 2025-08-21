#!/bin/bash

echo "Affichage des logs des services Docker SIO"

# Affichage des logs de tous les services
docker-compose -f config/docker/docker-compose.yml logs -f


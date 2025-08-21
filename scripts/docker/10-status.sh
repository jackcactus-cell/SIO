#!/bin/bash

echo "État des services Docker SIO"
echo "============================"

# État des conteneurs
echo "État des conteneurs:"
docker-compose -f config/docker/docker-compose.yml ps

echo
echo "Utilisation des ressources:"
docker stats --no-stream

echo
echo "Logs récents (dernières 10 lignes):"
docker-compose -f config/docker/docker-compose.yml logs --tail=10

echo
echo "Vérification des ports:"
echo "Frontend (80): $(curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "Non accessible")"
echo "Backend Node.js (4000): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000 || echo "Non accessible")"
echo "Backend Python (8000): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 || echo "Non accessible")"
echo "Backend LLM (8001): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001 || echo "Non accessible")"


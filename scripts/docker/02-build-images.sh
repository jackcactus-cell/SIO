#!/bin/bash
set -e

echo "Construction des images Docker SIO"

# Vérification du fichier .env
if [ ! -f ".env" ]; then
    echo "ERROR: Fichier .env manquant. Exécutez d'abord 01-setup-environment.sh"
    exit 1
fi

# Chargement des variables d'environnement
source .env

echo "Construction de l'image frontend..."
docker build -t sio-frontend:latest ./project

echo "Construction de l'image backend Node.js..."
docker build -t sio-backend-node:latest ./backend

echo "Construction de l'image backend Python..."
docker build -t sio-backend-python:latest ./backend_python

echo "Construction de l'image LLM..."
docker build -t sio-backend-llm:latest ./backend/llm-prototype

echo "Toutes les images ont été construites avec succès !"


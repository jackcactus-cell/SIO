#!/bin/bash

# =================================================================
# SIO Audit App - Quick Start Script
# Script de démarrage rapide pour l'application SIO Audit
# =================================================================

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "========================================"
echo "  SIO Audit App - Démarrage Rapide"
echo "========================================"
echo -e "${NC}"

# Vérification des prérequis
echo -e "${YELLOW}1. Vérification des prérequis...${NC}"

if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

echo "✅ Docker et Docker Compose sont installés"

# Configuration des fichiers d'environnement
echo -e "${YELLOW}2. Configuration des fichiers d'environnement...${NC}"

if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Fichier .env créé"
    else
        echo "⚠️  Fichier env.example introuvable"
    fi
fi

if [ ! -f "backend_python/.env" ]; then
    if [ -f "backend_python/env.example" ]; then
        cp backend_python/env.example backend_python/.env
        echo "✅ Fichier backend_python/.env créé"
    else
        echo "⚠️  Fichier backend_python/env.example introuvable"
    fi
fi

# Choix du mode
echo -e "${YELLOW}3. Choisissez votre mode de démarrage:${NC}"
echo "1) Production (recommandé)"
echo "2) Développement"
read -p "Votre choix (1 ou 2): " mode_choice

if [ "$mode_choice" = "2" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    MODE="développement"
    PORT="5173"
else
    COMPOSE_FILE="docker-compose.yml"
    MODE="production"
    PORT="80"
fi

echo "✅ Mode $MODE sélectionné"

# Construction et démarrage
echo -e "${YELLOW}4. Construction des images Docker...${NC}"
docker-compose -f $COMPOSE_FILE build

echo -e "${YELLOW}5. Démarrage des services...${NC}"
docker-compose -f $COMPOSE_FILE up -d

# Attendre que les services soient prêts
echo -e "${YELLOW}6. Vérification des services...${NC}"
sleep 10

# Affichage des informations
echo -e "${GREEN}"
echo "========================================"
echo "  🎉 Application démarrée avec succès!"
echo "========================================"
echo -e "${NC}"

echo "📱 Frontend: http://localhost:$PORT"
echo "🔧 Backend Node.js: http://localhost:4000"
echo "🐍 Backend Python: http://localhost:8000"
echo "🤖 Service LLM: http://localhost:8001"
echo "🗄️  MongoDB: localhost:27017"

if [ "$mode_choice" = "2" ]; then
    echo "🔧 Adminer (DB): http://localhost:8080"
fi

echo ""
echo "📊 Pour voir le statut: docker-compose -f $COMPOSE_FILE ps"
echo "📜 Pour voir les logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "🛑 Pour arrêter: docker-compose -f $COMPOSE_FILE down"

echo ""
echo -e "${GREEN}✨ L'application SIO Audit est prête!${NC}"



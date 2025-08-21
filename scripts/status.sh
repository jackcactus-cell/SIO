#!/bin/bash

# Script de Statut SIO
# Auteur: Assistant IA

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}📊 $1${NC}"
    echo "============================================="
}

echo -e "${BLUE}🐳 État des Services SIO${NC}"
echo "============================================="
echo ""

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé"
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose n'est pas installé"
    exit 1
fi

# Vérifier si le fichier docker-compose existe
if [ ! -f "config/docker/docker-compose.yml" ]; then
    print_error "Fichier docker-compose.yml non trouvé"
    exit 1
fi

print_header "État des Conteneurs"

# Afficher l'état des conteneurs
docker-compose -f config/docker/docker-compose.yml ps

echo ""

print_header "Utilisation des Ressources"

# Afficher les statistiques des conteneurs
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

echo ""

print_header "Test de Connectivité"

# Test Frontend
if curl -f http://localhost:80 > /dev/null 2>&1; then
    print_info "Frontend (port 80): Accessible"
else
    print_warning "Frontend (port 80): Non accessible"
fi

# Test Backend Node.js
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    print_info "Backend Node.js (port 4000): Accessible"
else
    print_warning "Backend Node.js (port 4000): Non accessible"
fi

# Test Backend Python
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_info "Backend Python (port 8000): Accessible"
else
    print_warning "Backend Python (port 8000): Non accessible"
fi

# Test Backend LLM
if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    print_info "Backend LLM (port 8001): Accessible"
else
    print_warning "Backend LLM (port 8001): Non accessible"
fi

# Test MongoDB
if docker exec sio_mongodb_prod mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    print_info "MongoDB (port 27017): Accessible"
else
    print_warning "MongoDB (port 27017): Non accessible"
fi

echo ""

print_header "Informations Système"

# Espace disque
echo "📁 Espace disque:"
df -h | grep -E "(Filesystem|/$)"

echo ""

# Mémoire
echo "💾 Mémoire:"
free -h

echo ""

# Ports utilisés
echo "🌐 Ports utilisés:"
netstat -tulpn | grep -E ":(80|4000|8000|8001|27017)" | head -10

echo ""

print_header "Logs Récentes"

# Logs des 5 dernières lignes de chaque service
echo "📋 Logs récentes (5 dernières lignes):"
echo ""

echo "Frontend:"
docker logs --tail 5 sio_frontend_prod 2>/dev/null || echo "Conteneur non trouvé"

echo ""
echo "Backend Node.js:"
docker logs --tail 5 sio_backend_node_prod 2>/dev/null || echo "Conteneur non trouvé"

echo ""
echo "Backend Python:"
docker logs --tail 5 sio_backend_python_prod 2>/dev/null || echo "Conteneur non trouvé"

echo ""
echo "Backend LLM:"
docker logs --tail 5 sio_backend_llm_prod 2>/dev/null || echo "Conteneur non trouvé"

echo ""
echo "MongoDB:"
docker logs --tail 5 sio_mongodb_prod 2>/dev/null || echo "Conteneur non trouvé"

echo ""
print_info "Statut vérifié avec succès"



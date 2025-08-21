#!/bin/bash
set -e

echo "Validation de l'installation SIO"
echo "================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction de validation
validate() {
    local test_name="$1"
    local command="$2"
    local expected="$3"
    
    echo -n "Test: $test_name... "
    
    if eval "$command" 2>/dev/null | grep -q "$expected"; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ÉCHEC${NC}"
        return 1
    fi
}

# Fonction de test de port
test_port() {
    local port="$1"
    local service="$2"
    
    echo -n "Test: Port $port ($service)... "
    
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port" | grep -q "200\|404\|403"; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ÉCHEC${NC}"
        return 1
    fi
}

# Compteurs
total_tests=0
passed_tests=0

echo
echo "=== Vérification des prérequis ==="

# Test Docker
((total_tests++))
if validate "Docker installé" "docker --version" "Docker version"; then
    ((passed_tests++))
fi

# Test Docker Compose
((total_tests++))
if validate "Docker Compose installé" "docker-compose --version" "docker-compose version"; then
    ((passed_tests++))
fi

# Test fichier .env
((total_tests++))
if [ -f ".env" ]; then
    echo -e "Test: Fichier .env... ${GREEN}✅ OK${NC}"
    ((passed_tests++))
else
    echo -e "Test: Fichier .env... ${RED}❌ ÉCHEC${NC}"
fi

# Test fichier backend_python/.env
((total_tests++))
if [ -f "backend_python/.env" ]; then
    echo -e "Test: Fichier backend_python/.env... ${GREEN}✅ OK${NC}"
    ((passed_tests++))
else
    echo -e "Test: Fichier backend_python/.env... ${RED}❌ ÉCHEC${NC}"
fi

echo
echo "=== Vérification des conteneurs ==="

# Test conteneurs en cours d'exécution
((total_tests++))
if docker ps --format "table {{.Names}}" | grep -q "sio_"; then
    echo -e "Test: Conteneurs SIO en cours d'exécution... ${GREEN}✅ OK${NC}"
    ((passed_tests++))
else
    echo -e "Test: Conteneurs SIO en cours d'exécution... ${YELLOW}⚠️  AUCUN CONTENEUR${NC}"
fi

# Test images construites
((total_tests++))
if docker images | grep -q "sio-"; then
    echo -e "Test: Images SIO construites... ${GREEN}✅ OK${NC}"
    ((passed_tests++))
else
    echo -e "Test: Images SIO construites... ${YELLOW}⚠️  AUCUNE IMAGE${NC}"
fi

echo
echo "=== Vérification des services ==="

# Test MongoDB
((total_tests++))
if docker exec sio_mongodb_prod mongosh --eval "db.adminCommand('ping')" 2>/dev/null | grep -q "ok.*1"; then
    echo -e "Test: MongoDB accessible... ${GREEN}✅ OK${NC}"
    ((passed_tests++))
else
    echo -e "Test: MongoDB accessible... ${RED}❌ ÉCHEC${NC}"
fi

# Test des ports (si les services sont démarrés)
if docker ps | grep -q "sio_frontend_prod"; then
    ((total_tests++))
    if test_port "80" "Frontend"; then
        ((passed_tests++))
    fi
fi

if docker ps | grep -q "sio_backend_node_prod"; then
    ((total_tests++))
    if test_port "4000" "Backend Node.js"; then
        ((passed_tests++))
    fi
fi

if docker ps | grep -q "sio_backend_python_prod"; then
    ((total_tests++))
    if test_port "8000" "Backend Python"; then
        ((passed_tests++))
    fi
fi

if docker ps | grep -q "sio_backend_llm_prod"; then
    ((total_tests++))
    if test_port "8001" "Backend LLM"; then
        ((passed_tests++))
    fi
fi

echo
echo "=== Vérification des volumes ==="

# Test volumes Docker
((total_tests++))
if docker volume ls | grep -q "sio_"; then
    echo -e "Test: Volumes SIO créés... ${GREEN}✅ OK${NC}"
    ((passed_tests++))
else
    echo -e "Test: Volumes SIO créés... ${YELLOW}⚠️  AUCUN VOLUME${NC}"
fi

echo
echo "=== Vérification des dossiers ==="

# Test dossiers de données
for dir in logs data cache backups; do
    ((total_tests++))
    if [ -d "$dir" ]; then
        echo -e "Test: Dossier $dir... ${GREEN}✅ OK${NC}"
        ((passed_tests++))
    else
        echo -e "Test: Dossier $dir... ${YELLOW}⚠️  MANQUANT${NC}"
    fi
done

echo
echo "=== Résumé ==="
echo "Tests effectués: $total_tests"
echo "Tests réussis: $passed_tests"
echo "Tests échoués: $((total_tests - passed_tests))"

if [ $passed_tests -eq $total_tests ]; then
    echo -e "${GREEN}🎉 Tous les tests sont passés !${NC}"
    echo "L'installation SIO est complète et fonctionnelle."
elif [ $passed_tests -gt $((total_tests / 2)) ]; then
    echo -e "${YELLOW}⚠️  Installation partiellement réussie${NC}"
    echo "Certains composants nécessitent une attention."
else
    echo -e "${RED}❌ Installation incomplète${NC}"
    echo "Veuillez vérifier la configuration et relancer l'installation."
fi

echo
echo "🔧 Commandes utiles :"
echo "   ./scripts/docker/10-status.sh    # Vérifier l'état des services"
echo "   ./scripts/docker/06-logs.sh      # Voir les logs"
echo "   ./scripts/docker/03-start-services.sh  # Redémarrer les services"

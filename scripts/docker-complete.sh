#!/bin/bash

# Script de Dockerisation Complète SIO
# Auteur: Assistant IA
# Date: $(date +%Y-%m-%d)

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
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
    echo -e "${BLUE}📋 $1${NC}"
    echo "============================================="
}

print_step() {
    echo -e "${CYAN}🔧 $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    print_header "Vérification des Prérequis"
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé"
        echo "Installation de Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        print_info "Docker installé avec succès"
    else
        print_info "Docker est installé"
        docker --version
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose n'est pas installé"
        echo "Installation de Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_info "Docker Compose installé avec succès"
    else
        print_info "Docker Compose est installé"
        docker-compose --version
    fi
    
    # Vérifier les fichiers nécessaires
    if [ ! -f "project/package.json" ]; then
        print_error "Frontend package.json non trouvé"
        exit 1
    fi
    
    if [ ! -f "backend/package.json" ]; then
        print_error "Backend package.json non trouvé"
        exit 1
    fi
    
    if [ ! -f "backend_python/requirements.txt" ]; then
        print_error "Backend Python requirements.txt non trouvé"
        exit 1
    fi
    
    print_info "Tous les prérequis sont satisfaits"
}

# Configuration de l'environnement
setup_environment() {
    print_header "Configuration de l'Environnement"
    
    # Créer les dossiers nécessaires
    mkdir -p logs data cache backups
    
    # Générer une clé secrète
    SECRET_KEY=$(openssl rand -hex 32)
    
    # Créer le fichier .env principal
    print_step "Création du fichier .env principal"
    cat > .env << EOF
# Configuration de l'environnement
ENVIRONMENT=production
NODE_ENV=production

# Configuration des ports
FRONTEND_PORT=80
BACKEND_NODE_PORT=4000
BACKEND_PYTHON_PORT=8000
BACKEND_LLM_PORT=8001
MONGODB_PORT=27017

# Configuration MongoDB
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=securepassword123
MONGODB_DATABASE=audit_146
MONGODB_URI=mongodb://admin:securepassword123@mongodb:27017/audit_146?authSource=admin

# Configuration Oracle (à modifier selon votre environnement)
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XE
ORACLE_USERNAME=audit_user
ORACLE_PASSWORD=password

# Configuration sécurité
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Configuration OpenAI (optionnel)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# Configuration logging
LOG_LEVEL=INFO
LOG_FORMAT=detailed
CACHE_TTL=3600
EOF

    # Créer le fichier backend_python/.env
    print_step "Création du fichier backend_python/.env"
    cat > backend_python/.env << EOF
# Variables héritées du .env principal
ORACLE_HOST=\${ORACLE_HOST}
ORACLE_PORT=\${ORACLE_PORT}
ORACLE_SERVICE_NAME=\${ORACLE_SERVICE_NAME}
ORACLE_USERNAME=\${ORACLE_USERNAME}
ORACLE_PASSWORD=\${ORACLE_PASSWORD}
ORACLE_DSN=\${ORACLE_HOST}:\${ORACLE_PORT}/\${ORACLE_SERVICE_NAME}
MONGODB_URI=\${MONGODB_URI}
MONGODB_DATABASE=\${MONGODB_DATABASE}
SECRET_KEY=\${SECRET_KEY}
ALGORITHM=\${ALGORITHM}
ACCESS_TOKEN_EXPIRE_MINUTES=\${ACCESS_TOKEN_EXPIRE_MINUTES}
LOG_LEVEL=\${LOG_LEVEL}
OPENAI_API_KEY=\${OPENAI_API_KEY}
ENVIRONMENT=\${ENVIRONMENT}
EOF

    print_info "Configuration de l'environnement terminée"
    print_warning "Modifiez le fichier .env avec vos paramètres Oracle et OpenAI"
}

# Construction des images Docker
build_images() {
    print_header "Construction des Images Docker"
    
    print_step "Construction de l'image Frontend (React)"
    docker build -t sio-frontend:latest ./project
    
    print_step "Construction de l'image Backend Node.js"
    docker build -t sio-backend-node:latest ./backend
    
    print_step "Construction de l'image Backend Python"
    docker build -t sio-backend-python:latest ./backend_python
    
    print_step "Construction de l'image Backend LLM"
    docker build -t sio-backend-llm:latest ./backend/llm-prototype
    
    print_info "Toutes les images ont été construites avec succès"
}

# Démarrage des services
start_services() {
    print_header "Démarrage des Services"
    
    print_step "Arrêt des services existants"
    docker-compose -f config/docker/docker-compose.yml down 2>/dev/null || true
    
    print_step "Démarrage des services"
    docker-compose -f config/docker/docker-compose.yml up -d
    
    print_step "Attente du démarrage des services"
    sleep 30
    
    print_info "Services démarrés avec succès"
}

# Vérification des services
verify_services() {
    print_header "Vérification des Services"
    
    print_step "Vérification de l'état des conteneurs"
    docker-compose -f config/docker/docker-compose.yml ps
    
    print_step "Test de connectivité des services"
    
    # Test Frontend
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        print_info "Frontend accessible sur http://localhost"
    else
        print_warning "Frontend non accessible"
    fi
    
    # Test Backend Node.js
    if curl -f http://localhost:4000/health > /dev/null 2>&1; then
        print_info "Backend Node.js accessible sur http://localhost:4000"
    else
        print_warning "Backend Node.js non accessible"
    fi
    
    # Test Backend Python
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_info "Backend Python accessible sur http://localhost:8000"
    else
        print_warning "Backend Python non accessible"
    fi
    
    # Test Backend LLM
    if curl -f http://localhost:8001/health > /dev/null 2>&1; then
        print_info "Backend LLM accessible sur http://localhost:8001"
    else
        print_warning "Backend LLM non accessible"
    fi
    
    # Test MongoDB
    if docker exec sio_mongodb_prod mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        print_info "MongoDB accessible"
    else
        print_warning "MongoDB non accessible"
    fi
}

# Extraction des données Oracle
extract_oracle_data() {
    print_header "Extraction des Données Oracle"
    
    print_step "Test de connexion Oracle"
    if [ -f "backend_python/oracle_service_api.py" ]; then
        docker exec sio_backend_python_prod python -c "
import oracledb
import os
from dotenv import load_dotenv
load_dotenv()

try:
    conn = oracledb.connect(
        user=os.getenv('ORACLE_USERNAME'),
        password=os.getenv('ORACLE_PASSWORD'),
        dsn=f\"{os.getenv('ORACLE_HOST')}:{os.getenv('ORACLE_PORT')}/{os.getenv('ORACLE_SERVICE_NAME')}\"
    )
    print('✅ Connexion Oracle réussie')
    conn.close()
except Exception as e:
    print(f'❌ Erreur de connexion Oracle: {e}')
"
    else
        print_warning "Script d'extraction Oracle non trouvé"
    fi
    
    print_step "Extraction des données d'audit"
    docker exec sio_backend_python_prod python -c "
import sys
sys.path.append('/app')
from oracle_service_api import extract_audit_data
try:
    extract_audit_data()
    print('✅ Extraction des données d\'audit terminée')
except Exception as e:
    print(f'❌ Erreur lors de l\'extraction: {e}')
" 2>/dev/null || print_warning "Extraction des données échouée"
}

# Affichage des informations finales
show_final_info() {
    print_header "Déploiement Terminé"
    
    echo -e "${GREEN}🎉 Votre application SIO est maintenant déployée !${NC}"
    echo ""
    echo -e "${CYAN}📊 Services disponibles :${NC}"
    echo "   Frontend:     http://localhost"
    echo "   Backend Node.js: http://localhost:4000"
    echo "   Backend Python:  http://localhost:8000"
    echo "   Backend LLM:     http://localhost:8001"
    echo "   MongoDB:         localhost:27017"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT :${NC}"
    echo "   - Configurez les paramètres Oracle dans le fichier .env"
    echo "   - Changez les mots de passe par défaut"
    echo "   - Configurez votre clé OpenAI si nécessaire"
    echo ""
    echo -e "${PURPLE}🔧 Commandes utiles :${NC}"
    echo "   ./scripts/status.sh           # Vérifier l'état"
    echo "   ./scripts/logs.sh             # Voir les logs"
    echo "   ./scripts/stop.sh             # Arrêter les services"
    echo "   ./scripts/restart.sh          # Redémarrer les services"
    echo "   ./scripts/backup.sh           # Sauvegarder les données"
    echo "   ./scripts/cleanup.sh          # Nettoyer complètement"
}

# Fonction principale
main() {
    echo -e "${PURPLE}🐳 Dockerisation Complète SIO${NC}"
    echo "============================================="
    echo ""
    
    check_prerequisites
    setup_environment
    build_images
    start_services
    verify_services
    extract_oracle_data
    show_final_info
}

# Exécution du script
main "$@"

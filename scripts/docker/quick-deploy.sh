#!/bin/bash
set -e

echo "🚀 Déploiement rapide SIO sur Linux"
echo "=================================="

# Vérification des prérequis
echo "📋 Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installation en cours..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installé"
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Installation en cours..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installé"
fi

# Configuration automatique
echo "⚙️  Configuration automatique..."

# Génération d'une clé secrète
SECRET_KEY=$(openssl rand -hex 32)

# Création du fichier .env
cat > .env << EOF
ENVIRONMENT=production
NODE_ENV=production
FRONTEND_PORT=80
BACKEND_NODE_PORT=4000
BACKEND_PYTHON_PORT=8000
BACKEND_LLM_PORT=8001
MONGODB_PORT=27017
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=securepassword123
MONGODB_DATABASE=audit_146
MONGODB_URI=mongodb://admin:securepassword123@mongodb:27017/audit_146?authSource=admin
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XE
ORACLE_USERNAME=audit_user
ORACLE_PASSWORD=password
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
LOG_LEVEL=INFO
LOG_FORMAT=detailed
CACHE_TTL=3600
EOF

# Création du fichier backend_python/.env
cat > backend_python/.env << EOF
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

# Création des dossiers
mkdir -p logs data cache backups

# Construction des images
echo "🔨 Construction des images Docker..."
docker build -t sio-frontend:latest ./project
docker build -t sio-backend-node:latest ./backend
docker build -t sio-backend-python:latest ./backend_python
docker build -t sio-backend-llm:latest ./backend/llm-prototype

# Démarrage des services
echo "🚀 Démarrage des services..."
docker-compose -f config/docker/docker-compose.yml down
docker-compose -f config/docker/docker-compose.yml up -d

# Attente du démarrage
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérification
echo "✅ Vérification de l'état des services..."
docker-compose -f config/docker/docker-compose.yml ps

echo ""
echo "🎉 Déploiement terminé avec succès !"
echo ""
echo "📊 Services disponibles :"
echo "   Frontend: http://localhost"
echo "   Backend Node.js: http://localhost:4000"
echo "   Backend Python: http://localhost:8000"
echo "   Backend LLM: http://localhost:8001"
echo ""
echo "⚠️  IMPORTANT :"
echo "   - Configurez les paramètres Oracle dans le fichier .env"
echo "   - Changez les mots de passe par défaut"
echo "   - Configurez votre clé OpenAI si nécessaire"
echo ""
echo "🔧 Commandes utiles :"
echo "   ./scripts/docker/10-status.sh    # Vérifier l'état"
echo "   ./scripts/docker/06-logs.sh      # Voir les logs"
echo "   ./scripts/docker/05-stop-services.sh  # Arrêter les services"

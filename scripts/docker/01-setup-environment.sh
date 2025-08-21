#!/bin/bash
set -e

echo "Configuration de l'environnement Docker SIO"

# Vérification des prérequis
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose n'est pas installé"
    exit 1
fi

# Création des fichiers .env
echo "Création des fichiers de configuration..."

cat > .env << 'EOF'
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
ORACLE_HOST=your_oracle_host
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XE
ORACLE_USERNAME=audit_user
ORACLE_PASSWORD=your_oracle_password
SECRET_KEY=your_super_secret_key_here_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
LOG_LEVEL=INFO
LOG_FORMAT=detailed
CACHE_TTL=3600
EOF

cat > backend_python/.env << 'EOF'
ORACLE_HOST=${ORACLE_HOST}
ORACLE_PORT=${ORACLE_PORT}
ORACLE_SERVICE_NAME=${ORACLE_SERVICE_NAME}
ORACLE_USERNAME=${ORACLE_USERNAME}
ORACLE_PASSWORD=${ORACLE_PASSWORD}
ORACLE_DSN=${ORACLE_HOST}:${ORACLE_PORT}/${ORACLE_SERVICE_NAME}
MONGODB_URI=${MONGODB_URI}
MONGODB_DATABASE=${MONGODB_DATABASE}
SECRET_KEY=${SECRET_KEY}
ALGORITHM=${ALGORITHM}
ACCESS_TOKEN_EXPIRE_MINUTES=${ACCESS_TOKEN_EXPIRE_MINUTES}
LOG_LEVEL=${LOG_LEVEL}
OPENAI_API_KEY=${OPENAI_API_KEY}
ENVIRONMENT=${ENVIRONMENT}
EOF

# Création des dossiers
mkdir -p logs data cache backups

echo "Configuration terminée !"
echo "N'oubliez pas de configurer les paramètres Oracle dans le fichier .env"

#!/bin/bash
set -e

echo "Configuration dynamique de l'environnement SIO"

# Fonction pour demander une valeur avec validation
ask_value() {
    local prompt="$1"
    local default="$2"
    local required="$3"
    local value
    
    while true; do
        if [ -n "$default" ]; then
            read -p "$prompt [$default]: " value
            value=${value:-$default}
        else
            read -p "$prompt: " value
        fi
        
        if [ "$required" = "true" ] && [ -z "$value" ]; then
            echo "Cette valeur est obligatoire"
            continue
        fi
        
        break
    done
    
    echo "$value"
}

# Fonction pour valider une adresse IP
validate_ip() {
    local ip="$1"
    if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        IFS='.' read -ra ADDR <<< "$ip"
        for i in "${ADDR[@]}"; do
            if [ "$i" -gt 255 ] || [ "$i" -lt 0 ]; then
                return 1
            fi
        done
        return 0
    fi
    return 1
}

# Fonction pour valider un port
validate_port() {
    local port="$1"
    if [[ $port =~ ^[0-9]+$ ]] && [ "$port" -ge 1 ] && [ "$port" -le 65535 ]; then
        return 0
    fi
    return 1
}

echo "=== Configuration Oracle Database ==="
ORACLE_HOST=$(ask_value "Host Oracle" "localhost" "true")
while ! validate_ip "$ORACLE_HOST" && [ "$ORACLE_HOST" != "localhost" ]; do
    echo "Adresse IP invalide"
    ORACLE_HOST=$(ask_value "Host Oracle" "localhost" "true")
done

ORACLE_PORT=$(ask_value "Port Oracle" "1521" "true")
while ! validate_port "$ORACLE_PORT"; do
    echo "Port invalide (1-65535)"
    ORACLE_PORT=$(ask_value "Port Oracle" "1521" "true")
done

ORACLE_SERVICE_NAME=$(ask_value "Service Name Oracle" "XE" "true")
ORACLE_USERNAME=$(ask_value "Username Oracle" "audit_user" "true")
ORACLE_PASSWORD=$(ask_value "Password Oracle" "" "true")

echo
echo "=== Configuration MongoDB ==="
MONGODB_ROOT_USERNAME=$(ask_value "Username MongoDB admin" "admin" "true")
MONGODB_ROOT_PASSWORD=$(ask_value "Password MongoDB admin" "securepassword123" "true")
MONGODB_DATABASE=$(ask_value "Database MongoDB" "audit_146" "true")

echo
echo "=== Configuration Sécurité ==="
SECRET_KEY=$(ask_value "Secret Key (généré automatiquement si vide)" "" "false")
if [ -z "$SECRET_KEY" ]; then
    SECRET_KEY=$(openssl rand -hex 32)
    echo "Clé secrète générée: $SECRET_KEY"
fi

ACCESS_TOKEN_EXPIRE_MINUTES=$(ask_value "Durée de validité du token (minutes)" "30" "true")

echo
echo "=== Configuration OpenAI (optionnel) ==="
OPENAI_API_KEY=$(ask_value "OpenAI API Key (optionnel)" "" "false")
OPENAI_MODEL=$(ask_value "Modèle OpenAI" "gpt-3.5-turbo" "false")

echo
echo "=== Configuration des ports ==="
FRONTEND_PORT=$(ask_value "Port Frontend" "80" "true")
while ! validate_port "$FRONTEND_PORT"; do
    echo "Port invalide (1-65535)"
    FRONTEND_PORT=$(ask_value "Port Frontend" "80" "true")
done

BACKEND_NODE_PORT=$(ask_value "Port Backend Node.js" "4000" "true")
while ! validate_port "$BACKEND_NODE_PORT"; do
    echo "Port invalide (1-65535)"
    BACKEND_NODE_PORT=$(ask_value "Port Backend Node.js" "4000" "true")
done

BACKEND_PYTHON_PORT=$(ask_value "Port Backend Python" "8000" "true")
while ! validate_port "$BACKEND_PYTHON_PORT"; do
    echo "Port invalide (1-65535)"
    BACKEND_PYTHON_PORT=$(ask_value "Port Backend Python" "8000" "true")
done

BACKEND_LLM_PORT=$(ask_value "Port Backend LLM" "8001" "true")
while ! validate_port "$BACKEND_LLM_PORT"; do
    echo "Port invalide (1-65535)"
    BACKEND_LLM_PORT=$(ask_value "Port Backend LLM" "8001" "true")
done

# Génération de l'URI MongoDB
MONGODB_URI="mongodb://$MONGODB_ROOT_USERNAME:$MONGODB_ROOT_PASSWORD@mongodb:27017/$MONGODB_DATABASE?authSource=admin"

# Création du fichier .env principal
echo "Création du fichier .env..."
cat > .env << EOF
ENVIRONMENT=production
NODE_ENV=production
FRONTEND_PORT=$FRONTEND_PORT
BACKEND_NODE_PORT=$BACKEND_NODE_PORT
BACKEND_PYTHON_PORT=$BACKEND_PYTHON_PORT
BACKEND_LLM_PORT=$BACKEND_LLM_PORT
MONGODB_PORT=27017
MONGODB_ROOT_USERNAME=$MONGODB_ROOT_USERNAME
MONGODB_ROOT_PASSWORD=$MONGODB_ROOT_PASSWORD
MONGODB_DATABASE=$MONGODB_DATABASE
MONGODB_URI=$MONGODB_URI
ORACLE_HOST=$ORACLE_HOST
ORACLE_PORT=$ORACLE_PORT
ORACLE_SERVICE_NAME=$ORACLE_SERVICE_NAME
ORACLE_USERNAME=$ORACLE_USERNAME
ORACLE_PASSWORD=$ORACLE_PASSWORD
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=$ACCESS_TOKEN_EXPIRE_MINUTES
OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_MODEL=$OPENAI_MODEL
LOG_LEVEL=INFO
LOG_FORMAT=detailed
CACHE_TTL=3600
EOF

# Création du fichier backend_python/.env
echo "Création du fichier backend_python/.env..."
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

echo
echo "✅ Configuration terminée !"
echo
echo "📋 Résumé de la configuration :"
echo "   Oracle: $ORACLE_HOST:$ORACLE_PORT/$ORACLE_SERVICE_NAME"
echo "   MongoDB: $MONGODB_DATABASE"
echo "   Frontend: http://localhost:$FRONTEND_PORT"
echo "   Backend Node.js: http://localhost:$BACKEND_NODE_PORT"
echo "   Backend Python: http://localhost:$BACKEND_PYTHON_PORT"
echo "   Backend LLM: http://localhost:$BACKEND_LLM_PORT"
echo
echo "🔧 Prochaines étapes :"
echo "   1. Vérifiez la configuration dans le fichier .env"
echo "   2. Exécutez : ./scripts/docker/02-build-images.sh"
echo "   3. Exécutez : ./scripts/docker/03-start-services.sh"

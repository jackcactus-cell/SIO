#!/bin/bash

# =============================================================================
# Utilitaires de configuration pour le projet SIO
# =============================================================================

set -euo pipefail

# Source des utilitaires Docker
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/docker-utils.sh"

# Configuration
readonly CONFIG_DIR="config"
readonly ENV_TEMPLATE_DIR="templates"
readonly DEFAULT_ENV_FILE="backend_python/.env"

# =============================================================================
# Fonctions de gestion des variables d'environnement
# =============================================================================

create_env_file() {
    local env_file="${1:-$DEFAULT_ENV_FILE}"
    local template_file="${2:-}"
    
    log_info "Création du fichier d'environnement: $env_file"
    
    # Créer le répertoire parent si nécessaire
    local env_dir=$(dirname "$env_file")
    if [[ ! -d "$env_dir" ]]; then
        mkdir -p "$env_dir"
    fi
    
    # Si un template est fourni, l'utiliser
    if [[ -n "$template_file" && -f "$template_file" ]]; then
        cp "$template_file" "$env_file"
        log_success "Fichier d'environnement créé à partir du template: $env_file"
        return 0
    fi
    
    # Créer un fichier .env par défaut pour le backend Python
    if [[ "$env_file" == "backend_python/.env" ]]; then
        cat > "$env_file" << 'EOF'
# Configuration Oracle Database
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XE
ORACLE_USERNAME=audit_user
ORACLE_PASSWORD=your_password_here

# Configuration MongoDB
MONGODB_URI=mongodb://admin:securepassword123@mongodb:27017/
MONGODB_DB_NAME=audit_db
MONGODB_USERNAME=audit_user
MONGODB_PASSWORD=audit_password_123

# Configuration de l'application
DEBUG=false
LOG_LEVEL=INFO
SECRET_KEY=your-secret-key-here-change-in-production
CORS_ORIGINS=["http://localhost:3000", "http://localhost:80"]

# Configuration du serveur
HOST=0.0.0.0
PORT=8000
WORKERS=4

# Configuration des logs
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10MB
LOG_BACKUP_COUNT=5
EOF
        log_success "Fichier d'environnement par défaut créé: $env_file"
        return 0
    fi
    
    # Créer un fichier .env vide pour les autres services
    touch "$env_file"
    log_success "Fichier d'environnement vide créé: $env_file"
    return 0
}

validate_env_file() {
    local env_file="$1"
    
    log_info "Validation du fichier d'environnement: $env_file"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Fichier d'environnement non trouvé: $env_file"
        return 1
    fi
    
    local required_vars=()
    local missing_vars=()
    
    # Définir les variables requises selon le fichier
    if [[ "$env_file" == "backend_python/.env" ]]; then
        required_vars=(
            "ORACLE_HOST"
            "ORACLE_PORT"
            "ORACLE_SERVICE_NAME"
            "ORACLE_USERNAME"
            "ORACLE_PASSWORD"
            "MONGODB_URI"
            "MONGODB_DB_NAME"
            "SECRET_KEY"
        )
    fi
    
    # Vérifier chaque variable requise
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file"; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Variables manquantes dans $env_file:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        return 1
    fi
    
    log_success "Fichier d'environnement valide: $env_file"
    return 0
}

update_env_variable() {
    local env_file="$1"
    local variable="$2"
    local value="$3"
    
    log_info "Mise à jour de la variable $variable dans $env_file"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Fichier d'environnement non trouvé: $env_file"
        return 1
    fi
    
    # Vérifier si la variable existe déjà
    if grep -q "^${variable}=" "$env_file"; then
        # Mettre à jour la variable existante
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^${variable}=.*/${variable}=${value}/" "$env_file"
        else
            # Linux
            sed -i "s/^${variable}=.*/${variable}=${value}/" "$env_file"
        fi
    else
        # Ajouter la nouvelle variable
        echo "${variable}=${value}" >> "$env_file"
    fi
    
    log_success "Variable $variable mise à jour dans $env_file"
    return 0
}

get_env_variable() {
    local env_file="$1"
    local variable="$2"
    
    if [[ ! -f "$env_file" ]]; then
        log_error "Fichier d'environnement non trouvé: $env_file"
        return 1
    fi
    
    local value=$(grep "^${variable}=" "$env_file" | cut -d'=' -f2-)
    if [[ -n "$value" ]]; then
        echo "$value"
        return 0
    else
        log_error "Variable $variable non trouvée dans $env_file"
        return 1
    fi
}

# =============================================================================
# Fonctions de configuration Docker
# =============================================================================

generate_docker_compose() {
    local output_file="${1:-config/docker/docker-compose.yml}"
    
    log_info "Génération du fichier docker-compose.yml: $output_file"
    
    # Créer le répertoire parent si nécessaire
    local output_dir=$(dirname "$output_file")
    if [[ ! -d "$output_dir" ]]; then
        mkdir -p "$output_dir"
    fi
    
    cat > "$output_file" << 'EOF'
version: '3.8'

services:
  # Frontend React/Vite
  frontend:
    build:
      context: ./project
      dockerfile: Dockerfile
    container_name: sio_frontend_prod
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./project:/app
      - /app/node_modules
    networks:
      - sio_network
    depends_on:
      - backend
      - backend_python
    environment:
      - NODE_ENV=production
      - VITE_API_URL=http://localhost:8000
      - VITE_BACKEND_URL=http://localhost:4000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Backend Node.js
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sio_backend_prod
    restart: unless-stopped
    ports:
      - "4000:4000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - sio_network
    environment:
      - NODE_ENV=production
      - PORT=4000
      - MONGODB_URI=mongodb://admin:securepassword123@mongodb:27017/
      - MONGODB_DB_NAME=audit_db
    depends_on:
      - mongodb
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Backend Python (FastAPI)
  backend_python:
    build:
      context: ./backend_python
      dockerfile: Dockerfile
    container_name: sio_backend_python_prod
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./backend_python:/app
      - ./logs:/app/logs
    networks:
      - sio_network
    env_file:
      - ./backend_python/.env
    depends_on:
      - mongodb
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Backend LLM
  backend_llm:
    build:
      context: ./backend
      dockerfile: Dockerfile.llm
    container_name: sio_backend_llm_prod
    restart: unless-stopped
    ports:
      - "8001:8001"
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - sio_network
    environment:
      - NODE_ENV=production
      - PORT=8001
      - LLM_MODEL=gpt-3.5-turbo
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # MongoDB
  mongodb:
    image: mongo:7.0
    container_name: sio_mongodb_prod
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: audit_db
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: securepassword123
    volumes:
      - mongodb_data:/data/db
      - ./config/docker/init-mongo:/docker-entrypoint-initdb.d:ro
    networks:
      - sio_network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Mongo Express (Interface web MongoDB)
  mongo-express:
    image: mongo-express:latest
    container_name: sio_mongo_express_prod
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: securepassword123
      ME_CONFIG_MONGODB_URL: mongodb://admin:securepassword123@mongodb:27017/
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: admin123
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - sio_network

volumes:
  mongodb_data:
    driver: local

networks:
  sio_network:
    driver: bridge
EOF
    
    log_success "Fichier docker-compose.yml généré: $output_file"
    return 0
}

generate_dockerfile() {
    local service="$1"
    local output_file="$2"
    
    log_info "Génération du Dockerfile pour $service: $output_file"
    
    # Créer le répertoire parent si nécessaire
    local output_dir=$(dirname "$output_file")
    if [[ ! -d "$output_dir" ]]; then
        mkdir -p "$output_dir"
    fi
    
    case "$service" in
        "frontend")
            cat > "$output_file" << 'EOF'
# Dockerfile pour le Frontend React/Vite
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Installer nginx pour servir l'application
RUN apk add --no-cache nginx

# Configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
EOF
            ;;
        
        "backend")
            cat > "$output_file" << 'EOF'
# Dockerfile pour le Backend Node.js
FROM node:18-alpine

WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache curl

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 4000

# Démarrer l'application
CMD ["npm", "start"]
EOF
            ;;
        
        "backend_python")
            cat > "$output_file" << 'EOF'
# Dockerfile pour le Backend Python (FastAPI)
FROM python:3.11-slim

WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Créer le répertoire de logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 8000

# Démarrer l'application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
EOF
            ;;
        
        *)
            log_error "Service non reconnu: $service"
            return 1
            ;;
    esac
    
    log_success "Dockerfile généré pour $service: $output_file"
    return 0
}

# =============================================================================
# Fonctions de configuration des scripts d'initialisation
# =============================================================================

generate_mongodb_init_scripts() {
    local init_dir="config/docker/init-mongo"
    
    log_info "Génération des scripts d'initialisation MongoDB: $init_dir"
    
    # Créer le répertoire d'initialisation
    mkdir -p "$init_dir"
    
    # Script d'initialisation de la base de données
    cat > "$init_dir/01-init-database.js" << 'EOF'
// Script d'initialisation de la base de données MongoDB
print('=== Initialisation de la base de données audit_db ===');

// Créer la base de données audit_db
db = db.getSiblingDB('audit_db');

// Créer l'utilisateur audit_user
db.createUser({
    user: 'audit_user',
    pwd: 'audit_password_123',
    roles: [
        { role: 'readWrite', db: 'audit_db' },
        { role: 'dbAdmin', db: 'audit_db' }
    ]
});

// Créer les collections principales
db.createCollection('actions_audit');
db.createCollection('users');
db.createCollection('sessions');
db.createCollection('system_logs');

// Créer les index pour optimiser les performances
db.actions_audit.createIndex({ "timestamp": 1 });
db.actions_audit.createIndex({ "user_id": 1 });
db.actions_audit.createIndex({ "action_type": 1 });
db.actions_audit.createIndex({ "resource": 1 });

db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

db.sessions.createIndex({ "session_id": 1 }, { unique: true });
db.sessions.createIndex({ "user_id": 1 });
db.sessions.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 });

db.system_logs.createIndex({ "timestamp": 1 });
db.system_logs.createIndex({ "level": 1 });
db.system_logs.createIndex({ "service": 1 });

print('=== Base de données audit_db initialisée avec succès ===');
EOF
    
    # Script de chargement des données d'exemple
    cat > "$init_dir/02-load-sample-data.js" << 'EOF'
// Script de chargement des données d'exemple
print('=== Chargement des données d\'exemple ===');

db = db.getSiblingDB('audit_db');

// Données d'exemple pour les utilisateurs
db.users.insertMany([
    {
        _id: ObjectId(),
        username: 'admin',
        email: 'admin@sio.local',
        password_hash: '$2b$10$example.hash.here',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
    },
    {
        _id: ObjectId(),
        username: 'user1',
        email: 'user1@sio.local',
        password_hash: '$2b$10$example.hash.here',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
    }
]);

// Données d'exemple pour les actions d'audit
db.actions_audit.insertMany([
    {
        _id: ObjectId(),
        user_id: 'admin',
        action_type: 'login',
        resource: 'auth',
        details: {
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timestamp: new Date(),
        status: 'success'
    },
    {
        _id: ObjectId(),
        user_id: 'user1',
        action_type: 'data_access',
        resource: 'oracle_database',
        details: {
            table: 'employees',
            operation: 'SELECT',
            rows_affected: 150
        },
        timestamp: new Date(),
        status: 'success'
    },
    {
        _id: ObjectId(),
        user_id: 'admin',
        action_type: 'configuration_change',
        resource: 'system',
        details: {
            setting: 'log_level',
            old_value: 'INFO',
            new_value: 'DEBUG'
        },
        timestamp: new Date(),
        status: 'success'
    }
]);

// Données d'exemple pour les logs système
db.system_logs.insertMany([
    {
        _id: ObjectId(),
        level: 'INFO',
        service: 'backend_python',
        message: 'Application démarrée avec succès',
        timestamp: new Date(),
        metadata: {
            version: '1.0.0',
            environment: 'production'
        }
    },
    {
        _id: ObjectId(),
        level: 'INFO',
        service: 'mongodb',
        message: 'Base de données connectée',
        timestamp: new Date(),
        metadata: {
            database: 'audit_db',
            collections: 4
        }
    }
]);

print('=== Données d\'exemple chargées avec succès ===');
EOF
    
    # Script de création des vues MongoDB
    cat > "$init_dir/03-create-views.js" << 'EOF'
// Script de création des vues MongoDB pour l'analyse
print('=== Création des vues MongoDB ===');

db = db.getSiblingDB('audit_db');

// Vue des statistiques d'actions par utilisateur
db.createView(
    'user_action_stats',
    'actions_audit',
    [
        {
            $group: {
                _id: '$user_id',
                total_actions: { $sum: 1 },
                successful_actions: {
                    $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                },
                failed_actions: {
                    $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                },
                last_action: { $max: '$timestamp' },
                action_types: { $addToSet: '$action_type' }
            }
        },
        {
            $project: {
                user_id: '$_id',
                total_actions: 1,
                successful_actions: 1,
                failed_actions: 1,
                success_rate: {
                    $multiply: [
                        { $divide: ['$successful_actions', '$total_actions'] },
                        100
                    ]
                },
                last_action: 1,
                action_types: 1
            }
        }
    ]
);

// Vue des actions par type et période
db.createView(
    'action_type_timeline',
    'actions_audit',
    [
        {
            $group: {
                _id: {
                    action_type: '$action_type',
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$timestamp'
                        }
                    }
                },
                count: { $sum: 1 },
                success_count: {
                    $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                }
            }
        },
        {
            $project: {
                action_type: '$_id.action_type',
                date: '$_id.date',
                count: 1,
                success_count: 1,
                success_rate: {
                    $multiply: [
                        { $divide: ['$success_count', '$count'] },
                        100
                    ]
                }
            }
        },
        { $sort: { date: 1, action_type: 1 } }
    ]
);

// Vue des ressources les plus accédées
db.createView(
    'resource_access_stats',
    'actions_audit',
    [
        {
            $group: {
                _id: '$resource',
                total_access: { $sum: 1 },
                unique_users: { $addToSet: '$user_id' },
                last_access: { $max: '$timestamp' }
            }
        },
        {
            $project: {
                resource: '$_id',
                total_access: 1,
                unique_users_count: { $size: '$unique_users' },
                last_access: 1
            }
        },
        { $sort: { total_access: -1 } }
    ]
);

print('=== Vues MongoDB créées avec succès ===');
EOF
    
    log_success "Scripts d'initialisation MongoDB générés dans: $init_dir"
    return 0
}

# =============================================================================
# Fonctions de validation de configuration
# =============================================================================

validate_project_structure() {
    log_info "Validation de la structure du projet..."
    
    local required_dirs=(
        "backend_python"
        "backend"
        "project"
        "config"
        "scripts"
    )
    
    local required_files=(
        "backend_python/requirements.txt"
        "backend/package.json"
        "project/package.json"
        "config/docker/docker-compose.yml"
    )
    
    local missing_dirs=()
    local missing_files=()
    
    # Vérifier les répertoires requis
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            missing_dirs+=("$dir")
        fi
    done
    
    # Vérifier les fichiers requis
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_dirs[@]} -gt 0 ]]; then
        log_error "Répertoires manquants:"
        for dir in "${missing_dirs[@]}"; do
            echo "  - $dir"
        done
    fi
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        log_error "Fichiers manquants:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
    fi
    
    if [[ ${#missing_dirs[@]} -gt 0 || ${#missing_files[@]} -gt 0 ]]; then
        return 1
    fi
    
    log_success "Structure du projet valide"
    return 0
}

validate_docker_configuration() {
    log_info "Validation de la configuration Docker..."
    
    local compose_file="config/docker/docker-compose.yml"
    
    if [[ ! -f "$compose_file" ]]; then
        log_error "Fichier docker-compose.yml non trouvé: $compose_file"
        return 1
    fi
    
    # Valider la syntaxe du docker-compose.yml
    if ! docker-compose -f "$compose_file" config &> /dev/null; then
        log_error "Erreur de syntaxe dans le fichier docker-compose.yml"
        return 1
    fi
    
    log_success "Configuration Docker valide"
    return 0
}

# =============================================================================
# Fonctions de configuration automatique
# =============================================================================

setup_project_configuration() {
    log_info "Configuration automatique du projet..."
    
    # Valider la structure du projet
    if ! validate_project_structure; then
        log_error "Structure du projet invalide"
        return 1
    fi
    
    # Générer les fichiers de configuration Docker
    generate_docker_compose
    generate_dockerfile "frontend" "project/Dockerfile"
    generate_dockerfile "backend" "backend/Dockerfile"
    generate_dockerfile "backend_python" "backend_python/Dockerfile"
    
    # Générer les scripts d'initialisation MongoDB
    generate_mongodb_init_scripts
    
    # Créer les fichiers d'environnement
    create_env_file "backend_python/.env"
    create_env_file "project/.env"
    create_env_file "backend/.env"
    
    # Créer les répertoires nécessaires
    mkdir -p logs
    mkdir -p backups
    mkdir -p data
    
    log_success "Configuration du projet terminée"
    return 0
}

# =============================================================================
# Fonctions d'export
# =============================================================================

export -f create_env_file validate_env_file update_env_variable get_env_variable
export -f generate_docker_compose generate_dockerfile
export -f generate_mongodb_init_scripts
export -f validate_project_structure validate_docker_configuration
export -f setup_project_configuration

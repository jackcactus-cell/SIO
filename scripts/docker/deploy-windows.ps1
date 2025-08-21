# Script de déploiement SIO pour Windows
Write-Host "Déploiement SIO sur Windows" -ForegroundColor Green

# Vérification de Docker Desktop
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker Desktop n'est pas installé ou démarré" -ForegroundColor Red
    Write-Host "Veuillez installer Docker Desktop depuis https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Vérification de Docker Compose
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker Compose n'est pas disponible" -ForegroundColor Red
    exit 1
}

Write-Host "Configuration de l'environnement..." -ForegroundColor Blue

# Création du fichier .env principal
@"
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
"@ | Out-File -FilePath ".env" -Encoding UTF8

# Création du fichier .env backend Python
@"
ORACLE_HOST=`${ORACLE_HOST}`
ORACLE_PORT=`${ORACLE_PORT}`
ORACLE_SERVICE_NAME=`${ORACLE_SERVICE_NAME}`
ORACLE_USERNAME=`${ORACLE_USERNAME}`
ORACLE_PASSWORD=`${ORACLE_PASSWORD}`
ORACLE_DSN=`${ORACLE_HOST}`:`${ORACLE_PORT}`/`${ORACLE_SERVICE_NAME}`
MONGODB_URI=`${MONGODB_URI}`
MONGODB_DATABASE=`${MONGODB_DATABASE}`
SECRET_KEY=`${SECRET_KEY}`
ALGORITHM=`${ALGORITHM}`
ACCESS_TOKEN_EXPIRE_MINUTES=`${ACCESS_TOKEN_EXPIRE_MINUTES}`
LOG_LEVEL=`${LOG_LEVEL}`
OPENAI_API_KEY=`${OPENAI_API_KEY}`
ENVIRONMENT=`${ENVIRONMENT}`
"@ | Out-File -FilePath "backend_python\.env" -Encoding UTF8

# Création des dossiers
New-Item -ItemType Directory -Force -Path "logs", "data", "cache", "backups" | Out-Null

Write-Host "Construction des images Docker..." -ForegroundColor Blue
docker build -t sio-frontend:latest ./project
docker build -t sio-backend-node:latest ./backend
docker build -t sio-backend-python:latest ./backend_python
docker build -t sio-backend-llm:latest ./backend/llm-prototype

Write-Host "Démarrage des services..." -ForegroundColor Blue
docker-compose -f config/docker/docker-compose.yml down
docker-compose -f config/docker/docker-compose.yml up -d

Write-Host "Attente du démarrage des services..." -ForegroundColor Blue
Start-Sleep -Seconds 30

Write-Host "Vérification de l'état des services..." -ForegroundColor Blue
docker-compose -f config/docker/docker-compose.yml ps

Write-Host "Déploiement terminé avec succès !" -ForegroundColor Green
Write-Host "Application accessible sur: http://localhost" -ForegroundColor Yellow

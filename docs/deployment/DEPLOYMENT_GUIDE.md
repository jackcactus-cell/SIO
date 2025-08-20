# 🚀 Guide de Déploiement Production - SIO Audit App

## 📋 Checklist de déploiement

### Avant le déploiement

- [ ] Serveur avec Docker et Docker Compose installés
- [ ] Certificats SSL/TLS configurés
- [ ] Noms de domaine configurés
- [ ] Pare-feu configuré
- [ ] Base de données Oracle accessible
- [ ] Ressources système suffisantes (CPU, RAM, Disque)
- [ ] Stratégie de sauvegarde en place
- [ ] Monitoring configuré

## 🖥️ Configuration du serveur

### Prérequis système

**Spécifications minimales :**
- **CPU** : 4 vCPUs
- **RAM** : 8 GB
- **Disque** : 100 GB SSD
- **OS** : Ubuntu 20.04 LTS, CentOS 8, ou équivalent

**Spécifications recommandées :**
- **CPU** : 8 vCPUs
- **RAM** : 16 GB
- **Disque** : 200 GB SSD
- **OS** : Ubuntu 22.04 LTS

### Installation Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl enable docker
sudo systemctl start docker

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🔧 Configuration de production

### 1. Variables d'environnement

Créer `/opt/sio-audit/.env` :

```bash
# =================================================================
# Configuration Production SIO Audit App
# =================================================================

# Général
COMPOSE_PROJECT_NAME=sio-audit-prod
ENVIRONMENT=production

# Domaines et URLs
DOMAIN_NAME=audit.votre-domaine.com
FRONTEND_URL=https://audit.votre-domaine.com
API_URL=https://api.audit.votre-domaine.com

# Oracle Database (Production)
ORACLE_HOST=oracle-prod.votre-domaine.com
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=PROD
ORACLE_USERNAME=audit_user_prod
ORACLE_PASSWORD=super_secure_oracle_password_here

# Configuration pool Oracle
ORACLE_MIN_POOL_SIZE=5
ORACLE_MAX_POOL_SIZE=20
ORACLE_CONNECTION_TIMEOUT=60

# MongoDB (Production)
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=ultra_secure_mongodb_password_here
MONGODB_DATABASE=audit_146_prod
MONGODB_PORT=27017

# Sécurité
JWT_SECRET=your_super_long_jwt_secret_key_for_production_here
ENCRYPTION_KEY=your_32_character_encryption_key_here
SESSION_SECRET=your_session_secret_key_here

# SSL/TLS
SSL_CERT_PATH=/etc/ssl/certs/audit.crt
SSL_KEY_PATH=/etc/ssl/private/audit.key

# Logs
LOG_LEVEL=INFO
LOG_RETENTION_DAYS=90
SYSLOG_HOST=logs.votre-domaine.com

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
HEALTH_CHECK_INTERVAL=30s

# Email/Notifications
SMTP_HOST=smtp.votre-domaine.com
SMTP_PORT=587
SMTP_USER=notifications@votre-domaine.com
SMTP_PASSWORD=smtp_password_here
ALERT_EMAIL=admin@votre-domaine.com

# Backup
BACKUP_SCHEDULE="0 2 * * *"  # 2h du matin tous les jours
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=sio-audit-backups
BACKUP_S3_REGION=eu-west-1
```

### 2. Configuration nginx avec SSL

Créer `/opt/sio-audit/nginx-prod.conf` :

```nginx
# Configuration Nginx Production avec SSL
server {
    listen 80;
    server_name audit.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name audit.votre-domaine.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/audit.crt;
    ssl_certificate_key /etc/ssl/private/audit.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Backend
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health checks
    location /health {
        access_log off;
        proxy_pass http://backend:4000/api/health;
    }

    # Monitoring endpoints
    location /metrics {
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        deny all;
        proxy_pass http://backend:4000/metrics;
    }
}
```

### 3. Docker Compose Production

Modifier `docker-compose.yml` pour la production :

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./project
      dockerfile: Dockerfile
    container_name: sio_frontend_prod
    restart: unless-stopped
    networks:
      - internal
    depends_on:
      backend:
        condition: service_healthy
    labels:
      - "com.example.service=frontend"
      - "com.example.environment=production"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sio_backend_prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:${MONGODB_ROOT_PASSWORD}@mongodb:27017/audit_146_prod?authSource=admin
    volumes:
      - backend_data:/app/data
      - backend_logs:/app/logs
      - /etc/localtime:/etc/localtime:ro
    networks:
      - internal
    depends_on:
      mongodb:
        condition: service_healthy
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1'
        reservations:
          memory: 512M
          cpus: '0.5'

  backend_python:
    build:
      context: ./backend_python
      dockerfile: Dockerfile
    container_name: sio_backend_python_prod
    restart: unless-stopped
    env_file:
      - ./backend_python/.env
    volumes:
      - python_logs:/app/logs
      - python_cache:/app/cache
      - /etc/localtime:/etc/localtime:ro
    networks:
      - internal
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1'
        reservations:
          memory: 512M
          cpus: '0.5'

  backend_llm:
    build:
      context: ./backend/llm-prototype
      dockerfile: Dockerfile
    container_name: sio_backend_llm_prod
    restart: unless-stopped
    environment:
      - PYTHONPATH=/app
      - PYTHONUNBUFFERED=1
      - MONGODB_URI=mongodb://admin:${MONGODB_ROOT_PASSWORD}@mongodb:27017/audit_146_prod?authSource=admin
      - ORACLE_HOST=${ORACLE_HOST}
      - ORACLE_PORT=${ORACLE_PORT}
      - ORACLE_SERVICE_NAME=${ORACLE_SERVICE_NAME}
      - ORACLE_USERNAME=${ORACLE_USERNAME}
      - ORACLE_PASSWORD=${ORACLE_PASSWORD}
      - LOG_LEVEL=INFO
    volumes:
      - llm_data:/app/chroma_db
      - llm_logs:/app/logs
      - llm_uploads:/app/uploads
      - /etc/localtime:/etc/localtime:ro
    networks:
      - internal
    depends_on:
      mongodb:
        condition: service_healthy
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2'
        reservations:
          memory: 1G
          cpus: '1'

  mongodb:
    image: mongo:7-jammy
    container_name: sio_mongodb_prod
    restart: unless-stopped
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGODB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGODB_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=audit_146_prod
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
      - mongodb_logs:/var/log/mongodb
      - /etc/localtime:/etc/localtime:ro
      - ./mongodb-init-prod.js:/docker-entrypoint-initdb.d/init.js:ro
    networks:
      - internal
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2'
        reservations:
          memory: 1G
          cpus: '0.5'
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  nginx:
    image: nginx:alpine
    container_name: sio_nginx_prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-prod.conf:/etc/nginx/nginx.conf:ro
      - /etc/ssl/certs:/etc/ssl/certs:ro
      - /etc/ssl/private:/etc/ssl/private:ro
      - nginx_logs:/var/log/nginx
    networks:
      - internal
      - external
    depends_on:
      - frontend
      - backend

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    container_name: sio_prometheus_prod
    restart: unless-stopped
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - internal
    profiles:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: sio_grafana_prod
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - internal
    profiles:
      - monitoring

networks:
  internal:
    driver: bridge
    internal: true
  external:
    driver: bridge

volumes:
  mongodb_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/sio-audit/data/mongodb
  mongodb_config:
    driver: local
  mongodb_logs:
    driver: local
  backend_data:
    driver: local
  backend_logs:
    driver: local
  python_logs:
    driver: local
  python_cache:
    driver: local
  llm_data:
    driver: local
  llm_logs:
    driver: local
  llm_uploads:
    driver: local
  nginx_logs:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local
```

## 🛡️ Sécurité

### 1. Pare-feu (UFW/Firewall)

```bash
# Ubuntu UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 27017  # MongoDB - accès interne uniquement
sudo ufw deny 4000   # Backend - accès interne uniquement
sudo ufw deny 8000   # Python Backend - accès interne uniquement
sudo ufw deny 8001   # LLM Service - accès interne uniquement
```

### 2. Secrets et mots de passe

```bash
# Générer des mots de passe sécurisés
openssl rand -base64 32  # JWT Secret
openssl rand -base64 24  # MongoDB password
openssl rand -base64 24  # Oracle password

# Stocker les secrets de manière sécurisée
sudo chmod 600 /opt/sio-audit/.env
sudo chown root:docker /opt/sio-audit/.env
```

### 3. SSL/TLS

```bash
# Certificat Let's Encrypt avec Certbot
sudo apt install certbot
sudo certbot certonly --standalone -d audit.votre-domaine.com

# Ou certificat commercial
# Copier les fichiers .crt et .key dans /etc/ssl/
sudo cp audit.votre-domaine.com.crt /etc/ssl/certs/
sudo cp audit.votre-domaine.com.key /etc/ssl/private/
sudo chmod 644 /etc/ssl/certs/audit.votre-domaine.com.crt
sudo chmod 600 /etc/ssl/private/audit.votre-domaine.com.key
```

## 📊 Monitoring et logs

### 1. Configuration Prometheus

Créer `monitoring/prometheus.yml` :

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sio-audit-backend'
    static_configs:
      - targets: ['backend:4000']
    metrics_path: '/metrics'

  - job_name: 'sio-audit-python'
    static_configs:
      - targets: ['backend_python:8000']
    metrics_path: '/metrics'

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb:27017']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
```

### 2. Rotation des logs

Créer `/etc/logrotate.d/sio-audit` :

```bash
/opt/sio-audit/logs/*.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    delaycompress
    copytruncate
}
```

### 3. Alertes

Configurer des alertes pour :
- Utilisation CPU > 80%
- Utilisation mémoire > 85%
- Espace disque < 10%
- Services down
- Erreurs applicatives

## 💾 Sauvegarde

### 1. Script de sauvegarde automatique

Créer `/opt/sio-audit/backup.sh` :

```bash
#!/bin/bash

BACKUP_DIR="/opt/sio-audit/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarde MongoDB
docker exec sio_mongodb_prod mongodump --out /tmp/backup_$DATE
docker cp sio_mongodb_prod:/tmp/backup_$DATE $BACKUP_DIR/mongodb_$DATE

# Sauvegarde des volumes
tar -czf $BACKUP_DIR/volumes_$DATE.tar.gz /opt/sio-audit/data

# Compression
tar -czf $BACKUP_DIR/complete_backup_$DATE.tar.gz $BACKUP_DIR/mongodb_$DATE $BACKUP_DIR/volumes_$DATE.tar.gz

# Nettoyage des anciens backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Upload vers S3 (optionnel)
if [ ! -z "$BACKUP_S3_BUCKET" ]; then
    aws s3 cp $BACKUP_DIR/complete_backup_$DATE.tar.gz s3://$BACKUP_S3_BUCKET/
fi

echo "Backup completed: $BACKUP_DIR/complete_backup_$DATE.tar.gz"
```

### 2. Crontab pour automatisation

```bash
# Ajouter dans /etc/crontab
0 2 * * * root /opt/sio-audit/backup.sh >> /var/log/sio-audit-backup.log 2>&1
```

## 🚀 Déploiement étape par étape

### 1. Préparation du serveur

```bash
# Créer l'utilisateur et les répertoires
sudo useradd -m -s /bin/bash sio-audit
sudo mkdir -p /opt/sio-audit
sudo chown sio-audit:sio-audit /opt/sio-audit

# Cloner le code
cd /opt/sio-audit
git clone https://github.com/votre-repo/sio-audit.git .
```

### 2. Configuration

```bash
# Copier et configurer les fichiers d'environnement
cp env.example .env
cp backend_python/env.example backend_python/.env

# Éditer les configurations
nano .env
nano backend_python/.env
```

### 3. Construction et démarrage

```bash
# Construction des images
docker-compose build --no-cache

# Premier démarrage
docker-compose up -d

# Vérification
docker-compose ps
docker-compose logs -f
```

### 4. Tests post-déploiement

```bash
# Test de santé des services
curl -f http://localhost/health
curl -f http://localhost:4000/api/health
curl -f http://localhost:8000/health

# Test de l'interface
curl -I https://audit.votre-domaine.com

# Test de la base de données
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

## 🔄 Maintenance et mise à jour

### Mise à jour de l'application

```bash
# Script de mise à jour
#!/bin/bash
cd /opt/sio-audit

# Backup avant mise à jour
./backup.sh

# Pull du code
git pull

# Rebuild et redémarrage
docker-compose build
docker-compose up -d --force-recreate

# Vérification
./health-check.sh
```

### Surveillance continue

```bash
# Créer un script de surveillance
#!/bin/bash
# /opt/sio-audit/health-check.sh

SERVICES=("frontend" "backend" "backend_python" "backend_llm" "mongodb")

for service in "${SERVICES[@]}"; do
    if ! docker-compose ps | grep -q "$service.*Up"; then
        echo "ALERT: Service $service is down"
        # Envoyer une alerte email/Slack
    fi
done
```

## 📞 Support et dépannage

### Commandes de diagnostic

```bash
# Statut général
docker-compose ps
docker-compose top

# Utilisation des ressources
docker stats

# Logs détaillés
docker-compose logs --timestamps --follow

# Espace disque
df -h
docker system df

# Connexions réseau
docker-compose exec backend netstat -tulpn
```

### Contacts d'urgence

- **Admin Système** : admin@votre-domaine.com
- **Équipe Dev** : dev@votre-domaine.com
- **Support Oracle** : oracle-support@votre-domaine.com

---

**Ce guide doit être adapté selon votre infrastructure spécifique et vos politiques de sécurité.**



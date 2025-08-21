#!/bin/bash
set -e

echo "Sauvegarde des données SIO"

# Création du dossier de sauvegarde
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Sauvegarde de MongoDB..."
docker exec sio_mongodb_prod mongodump --out /tmp/backup
docker cp sio_mongodb_prod:/tmp/backup "$BACKUP_DIR/mongodb"

echo "Sauvegarde des volumes..."
docker run --rm -v sio_mongodb_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/mongodb_data.tar.gz -C /data .
docker run --rm -v sio_backend_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/backend_data.tar.gz -C /data .
docker run --rm -v sio_python_logs:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/python_logs.tar.gz -C /data .

echo "Sauvegarde terminée dans: $BACKUP_DIR"


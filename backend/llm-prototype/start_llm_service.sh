#!/bin/bash

echo "🚀 Démarrage du service LLM Oracle Audit"
echo "=================================="

# Attendre que MongoDB soit prêt
echo "⏳ Attente de MongoDB..."
while ! nc -z mongodb 27017; do
  sleep 1
done
echo "✅ MongoDB disponible"

# Attendre que Oracle soit prêt (optionnel)
if [ ! -z "$ORACLE_HOST" ] && [ "$ORACLE_HOST" != "localhost" ]; then
  echo "⏳ Attente d'Oracle Database..."
  timeout=30
  counter=0
  while ! nc -z $ORACLE_HOST $ORACLE_PORT && [ $counter -lt $timeout ]; do
    sleep 2
    counter=$((counter + 1))
  done
  
  if [ $counter -lt $timeout ]; then
    echo "✅ Oracle Database disponible"
    
    # Lancer l'extraction automatique des données Oracle si configuré
    if [ "$AUTO_EXTRACT_ORACLE" = "true" ]; then
      echo "🔄 Extraction automatique des données Oracle..."
      python oracle_audit_extractor.py &
    fi
  else
    echo "⚠️  Oracle Database non disponible, continue sans extraction automatique"
  fi
fi

# Créer les répertoires s'ils n'existent pas
mkdir -p /app/logs /app/chroma_db /app/uploads

# Initialiser la base vectorielle
echo "🧠 Initialisation de la base vectorielle..."
python -c "
import os
from pathlib import Path
chroma_path = Path('/app/chroma_db')
chroma_path.mkdir(exist_ok=True)
print('✅ Base vectorielle initialisée')
"

# Vérifier les permissions
chmod -R 755 /app/logs /app/chroma_db /app/uploads

echo "🌐 Démarrage du serveur API..."
echo "📡 Server accessible sur http://0.0.0.0:8001"
echo "📚 Documentation: http://0.0.0.0:8001/docs"

# Démarrer le serveur
exec uvicorn simple_api_server:app \
  --host 0.0.0.0 \
  --port 8001 \
  --log-level info \
  --access-log

#!/bin/bash
set -e

echo "Extraction avancée des données Oracle vers MongoDB"

# Vérification du fichier .env
if [ ! -f ".env" ]; then
    echo "ERROR: Fichier .env manquant"
    exit 1
fi

source .env

# Vérification de Python et des dépendances
echo "Vérification des dépendances Python..."
python3 -c "import oracledb, pymongo, dotenv" 2>/dev/null || {
    echo "Installation des dépendances Python..."
    pip3 install oracledb pymongo python-dotenv
}

# Création du dossier logs si nécessaire
mkdir -p logs

# Exécution du script d'extraction avancée
echo "Exécution de l'extraction avancée..."
python3 scripts/docker/oracle-extract-advanced.py

echo "Extraction avancée terminée !"
echo "Logs disponibles dans: logs/oracle_extract.log"

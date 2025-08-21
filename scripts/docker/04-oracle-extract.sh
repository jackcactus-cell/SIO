#!/bin/bash
set -e

echo "Extraction des données Oracle vers MongoDB"

# Vérification du fichier .env
if [ ! -f ".env" ]; then
    echo "ERROR: Fichier .env manquant"
    exit 1
fi

source .env

# Création du script d'extraction
cat > oracle_extract.py << 'EOF'
import oracledb
import pymongo
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def extract_data():
    print("Connexion à Oracle...")
    oracle_conn = oracledb.connect(
        user=os.getenv('ORACLE_USERNAME'),
        password=os.getenv('ORACLE_PASSWORD'),
        dsn=f"{os.getenv('ORACLE_HOST')}:{os.getenv('ORACLE_PORT')}/{os.getenv('ORACLE_SERVICE_NAME')}"
    )
    
    print("Connexion à MongoDB...")
    client = pymongo.MongoClient(os.getenv('MONGODB_URI'))
    db = client[os.getenv('MONGODB_DATABASE')]
    
    # Extraction des données d'audit
    cursor = oracle_conn.cursor()
    cursor.execute("""
        SELECT USERNAME, TIMESTAMP, OBJ_NAME, ACTION_NAME, RETURNCODE
        FROM DBA_AUDIT_TRAIL 
        WHERE TIMESTAMP >= SYSDATE - 30
        ORDER BY TIMESTAMP DESC
    """)
    
    audit_collection = db['oracle_audit_trail']
    audit_collection.delete_many({})
    
    count = 0
    for row in cursor:
        audit_record = {
            'username': row[0],
            'timestamp': row[1].isoformat() if row[1] else None,
            'object_name': row[2],
            'action_name': row[3],
            'returncode': row[4],
            'extracted_at': datetime.now().isoformat()
        }
        audit_collection.insert_one(audit_record)
        count += 1
    
    print(f"Extraction terminée: {count} enregistrements")
    cursor.close()
    oracle_conn.close()

if __name__ == "__main__":
    extract_data()
EOF

# Exécution
python3 oracle_extract.py
rm oracle_extract.py

echo "Extraction terminée !"

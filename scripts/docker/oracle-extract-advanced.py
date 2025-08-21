#!/usr/bin/env python3
"""
Script d'extraction avancée des données Oracle vers MongoDB
"""

import oracledb
import pymongo
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/oracle_extract.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()

class OracleExtractor:
    def __init__(self):
        self.oracle_conn = None
        self.mongodb_client = None
        self.mongodb_db = None
        
    def connect_oracle(self):
        """Connexion à Oracle"""
        try:
            self.oracle_conn = oracledb.connect(
                user=os.getenv('ORACLE_USERNAME'),
                password=os.getenv('ORACLE_PASSWORD'),
                dsn=f"{os.getenv('ORACLE_HOST')}:{os.getenv('ORACLE_PORT')}/{os.getenv('ORACLE_SERVICE_NAME')}"
            )
            logger.info("Connexion Oracle réussie")
        except Exception as e:
            logger.error(f"Erreur de connexion Oracle: {e}")
            raise
    
    def connect_mongodb(self):
        """Connexion à MongoDB"""
        try:
            self.mongodb_client = pymongo.MongoClient(os.getenv('MONGODB_URI'))
            self.mongodb_db = self.mongodb_client[os.getenv('MONGODB_DATABASE')]
            logger.info("Connexion MongoDB réussie")
        except Exception as e:
            logger.error(f"Erreur de connexion MongoDB: {e}")
            raise
    
    def extract_audit_trail(self, days_back=30):
        """Extraction des données d'audit"""
        logger.info(f"Extraction des données d'audit (derniers {days_back} jours)")
        
        query = """
        SELECT 
            USERNAME,
            TIMESTAMP,
            OBJ_NAME,
            ACTION_NAME,
            RETURNCODE,
            COMMENT_TEXT,
            SESSIONID,
            OS_USERNAME,
            USERHOST
        FROM DBA_AUDIT_TRAIL 
        WHERE TIMESTAMP >= SYSDATE - :days_back
        ORDER BY TIMESTAMP DESC
        """
        
        cursor = self.oracle_conn.cursor()
        cursor.execute(query, days_back=days_back)
        
        audit_collection = self.mongodb_db['oracle_audit_trail']
        
        # Suppression des anciennes données
        audit_collection.delete_many({})
        
        count = 0
        for row in cursor:
            audit_record = {
                'username': row[0],
                'timestamp': row[1].isoformat() if row[1] else None,
                'object_name': row[2],
                'action_name': row[3],
                'returncode': row[4],
                'comment_text': row[5],
                'sessionid': row[6],
                'os_username': row[7],
                'userhost': row[8],
                'extracted_at': datetime.now().isoformat()
            }
            
            audit_collection.insert_one(audit_record)
            count += 1
            
            if count % 100 == 0:
                logger.info(f"Extrait {count} enregistrements...")
        
        logger.info(f"Extraction audit terminée: {count} enregistrements")
        cursor.close()
    
    def extract_schema_info(self):
        """Extraction des informations du schéma"""
        logger.info("Extraction des informations du schéma")
        
        # Tables
        tables_query = """
        SELECT 
            TABLE_NAME,
            TABLESPACE_NAME,
            NUM_ROWS,
            BLOCKS,
            AVG_ROW_LEN,
            LAST_ANALYZED,
            PARTITIONED,
            TEMPORARY
        FROM USER_TABLES
        """
        
        cursor = self.oracle_conn.cursor()
        cursor.execute(tables_query)
        
        schema_collection = self.mongodb_db['oracle_schema']
        schema_collection.delete_many({'type': 'table'})
        
        for row in cursor:
            table_info = {
                'type': 'table',
                'table_name': row[0],
                'tablespace_name': row[1],
                'num_rows': row[2],
                'blocks': row[3],
                'avg_row_len': row[4],
                'last_analyzed': row[5].isoformat() if row[5] else None,
                'partitioned': row[6],
                'temporary': row[7],
                'extracted_at': datetime.now().isoformat()
            }
            
            schema_collection.insert_one(table_info)
        
        # Colonnes
        columns_query = """
        SELECT 
            TABLE_NAME,
            COLUMN_NAME,
            DATA_TYPE,
            DATA_LENGTH,
            NULLABLE,
            COLUMN_ID,
            DATA_DEFAULT
        FROM USER_TAB_COLUMNS
        ORDER BY TABLE_NAME, COLUMN_ID
        """
        
        cursor.execute(columns_query)
        schema_collection.delete_many({'type': 'column'})
        
        for row in cursor:
            column_info = {
                'type': 'column',
                'table_name': row[0],
                'column_name': row[1],
                'data_type': row[2],
                'data_length': row[3],
                'nullable': row[4],
                'column_id': row[5],
                'data_default': row[6],
                'extracted_at': datetime.now().isoformat()
            }
            
            schema_collection.insert_one(column_info)
        
        logger.info("Informations du schéma extraites")
        cursor.close()
    
    def extract_performance_stats(self):
        """Extraction des statistiques de performance"""
        logger.info("Extraction des statistiques de performance")
        
        # Statistiques des tables
        stats_query = """
        SELECT 
            TABLE_NAME,
            NUM_ROWS,
            BLOCKS,
            AVG_ROW_LEN,
            LAST_ANALYZED,
            SAMPLE_SIZE
        FROM USER_TAB_STATISTICS
        """
        
        cursor = self.oracle_conn.cursor()
        cursor.execute(stats_query)
        
        stats_collection = self.mongodb_db['oracle_performance_stats']
        stats_collection.delete_many({})
        
        for row in cursor:
            stats_record = {
                'table_name': row[0],
                'num_rows': row[1],
                'blocks': row[2],
                'avg_row_len': row[3],
                'last_analyzed': row[4].isoformat() if row[4] else None,
                'sample_size': row[5],
                'extracted_at': datetime.now().isoformat()
            }
            
            stats_collection.insert_one(stats_record)
        
        logger.info("Statistiques de performance extraites")
        cursor.close()
    
    def extract_user_activity(self, days_back=7):
        """Extraction de l'activité utilisateur"""
        logger.info(f"Extraction de l'activité utilisateur (derniers {days_back} jours)")
        
        activity_query = """
        SELECT 
            USERNAME,
            COUNT(*) as action_count,
            MIN(TIMESTAMP) as first_action,
            MAX(TIMESTAMP) as last_action
        FROM DBA_AUDIT_TRAIL 
        WHERE TIMESTAMP >= SYSDATE - :days_back
        GROUP BY USERNAME
        ORDER BY action_count DESC
        """
        
        cursor = self.oracle_conn.cursor()
        cursor.execute(activity_query, days_back=days_back)
        
        activity_collection = self.mongodb_db['oracle_user_activity']
        activity_collection.delete_many({})
        
        for row in cursor:
            activity_record = {
                'username': row[0],
                'action_count': row[1],
                'first_action': row[2].isoformat() if row[2] else None,
                'last_action': row[3].isoformat() if row[3] else None,
                'extracted_at': datetime.now().isoformat()
            }
            
            activity_collection.insert_one(activity_record)
        
        logger.info("Activité utilisateur extraite")
        cursor.close()
    
    def close_connections(self):
        """Fermeture des connexions"""
        if self.oracle_conn:
            self.oracle_conn.close()
        if self.mongodb_client:
            self.mongodb_client.close()
        logger.info("Connexions fermées")

def main():
    """Fonction principale"""
    extractor = OracleExtractor()
    
    try:
        logger.info("Début de l'extraction des données Oracle")
        
        # Connexions
        extractor.connect_oracle()
        extractor.connect_mongodb()
        
        # Extractions
        extractor.extract_audit_trail(days_back=30)
        extractor.extract_schema_info()
        extractor.extract_performance_stats()
        extractor.extract_user_activity(days_back=7)
        
        logger.info("Extraction terminée avec succès !")
        
    except Exception as e:
        logger.error(f"Erreur lors de l'extraction: {e}")
        raise
    finally:
        extractor.close_connections()

if __name__ == "__main__":
    main()

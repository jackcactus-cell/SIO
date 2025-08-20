"""
Script d'extraction des données Oracle Audit Trail vers MongoDB
"""

import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
try:
    import oracledb
except ImportError:
    oracledb = None
    
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    from pymongo.errors import DuplicateKeyError
except ImportError:
    AsyncIOMotorClient = None
    DuplicateKeyError = None
import pandas as pd
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class OracleAuditExtractor:
    """Extracteur de données Oracle Audit Trail vers MongoDB"""
    
    def __init__(self, oracle_config: Dict[str, Any], mongo_uri: str):
        self.oracle_config = oracle_config
        self.mongo_uri = mongo_uri
        self.mongo_client = None
        self.oracle_pool = None
        
        # Configuration des requêtes d'audit
        self.audit_queries = {
            'audit_trail': """
                SELECT 
                    TIMESTAMP,
                    OS_USERNAME,
                    USERNAME as DB_USERNAME,
                    ACTION_NAME,
                    OBJECT_NAME,
                    OBJECT_SCHEMA,
                    CLIENT_PROGRAM_NAME,
                    USERHOST,
                    TO_CHAR(SESSIONID) as SESSION_ID,
                    INSTANCE_NUMBER,
                    SQL_TEXT,
                    SQL_BIND,
                    RETURN_CODE,
                    COMMENT_TEXT,
                    SCN,
                    EXTENDED_TIMESTAMP,
                    GLOBAL_UID,
                    CLIENT_ID,
                    EXT_NAME,
                    SRC_NAME,
                    SRC_PROGRAM,
                    UNIFIED_AUDIT_POLICIES
                FROM DBA_AUDIT_TRAIL 
                WHERE TIMESTAMP >= :start_date 
                AND TIMESTAMP <= :end_date
                ORDER BY TIMESTAMP DESC
            """,
            
            'fga_audit': """
                SELECT 
                    TIMESTAMP,
                    OS_USERNAME,
                    DB_USER as DB_USERNAME,
                    OBJECT_SCHEMA,
                    OBJECT_NAME,
                    POLICY_NAME,
                    SCN,
                    SQL_TEXT,
                    SQL_BIND,
                    USERHOST,
                    CLIENT_PROGRAM_NAME,
                    SESSION_ID
                FROM DBA_FGA_AUDIT_TRAIL
                WHERE TIMESTAMP >= :start_date 
                AND TIMESTAMP <= :end_date
                ORDER BY TIMESTAMP DESC
            """,
            
            'unified_audit': """
                SELECT 
                    EVENT_TIMESTAMP,
                    OS_USERNAME,
                    DBUSERNAME as DB_USERNAME,
                    ACTION_NAME,
                    OBJECT_NAME,
                    OBJECT_SCHEMA,
                    CLIENT_PROGRAM_NAME,
                    USERHOST,
                    SESSION_ID,
                    INSTANCE_ID,
                    SQL_TEXT,
                    SQL_BINDS,
                    RETURN_CODE,
                    SCN,
                    CLIENT_ID,
                    EXTERNAL_USERID,
                    GLOBAL_USERID,
                    AUDIT_TYPE,
                    UNIFIED_AUDIT_POLICIES,
                    APPLICATION_CONTEXTS,
                    CLIENT_IDENTIFIER
                FROM UNIFIED_AUDIT_TRAIL
                WHERE EVENT_TIMESTAMP >= :start_date 
                AND EVENT_TIMESTAMP <= :end_date
                ORDER BY EVENT_TIMESTAMP DESC
            """
        }
    
    async def initialize(self):
        """Initialise les connexions Oracle et MongoDB"""
        try:
            # Vérifier les dépendances
            if AsyncIOMotorClient is None:
                raise ImportError("Motor (MongoDB async driver) n'est pas installé")
            if oracledb is None:
                raise ImportError("oracledb n'est pas installé")
                
            # Connexion MongoDB
            self.mongo_client = AsyncIOMotorClient(self.mongo_uri)
            await self.mongo_client.admin.command('ping')
            logger.info("Connexion MongoDB établie")
            
            # Connexion Oracle
            self.oracle_pool = oracledb.create_pool(
                user=self.oracle_config['username'],
                password=self.oracle_config['password'],
                dsn=f"{self.oracle_config['host']}:{self.oracle_config['port']}/{self.oracle_config['service_name']}",
                min=2,
                max=10,
                increment=1
            )
            logger.info("Pool de connexions Oracle créé")
            
        except Exception as e:
            logger.error(f"Erreur d'initialisation: {e}")
            raise
    
    async def extract_audit_data(self, start_date: datetime, end_date: datetime, 
                               audit_type: str = 'all') -> Dict[str, int]:
        """Extrait les données d'audit Oracle et les insère dans MongoDB"""
        try:
            stats = {'total_extracted': 0, 'errors': 0}
            
            if audit_type in ['all', 'audit_trail']:
                count = await self._extract_and_insert('audit_trail', start_date, end_date)
                stats['audit_trail'] = count
                stats['total_extracted'] += count
            
            if audit_type in ['all', 'fga_audit']:
                count = await self._extract_and_insert('fga_audit', start_date, end_date)
                stats['fga_audit'] = count
                stats['total_extracted'] += count
            
            if audit_type in ['all', 'unified_audit']:
                count = await self._extract_and_insert('unified_audit', start_date, end_date)
                stats['unified_audit'] = count
                stats['total_extracted'] += count
            
            logger.info(f"Extraction terminée: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction: {e}")
            stats['errors'] += 1
            return stats
    
    async def _extract_and_insert(self, audit_type: str, start_date: datetime, 
                                end_date: datetime) -> int:
        """Extrait et insère les données pour un type d'audit spécifique"""
        logger.info(f"Extraction {audit_type} du {start_date} au {end_date}")
        
        query = self.audit_queries[audit_type]
        collection_name = f"oracle_{audit_type}"
        
        try:
            # Extraction Oracle
            with self.oracle_pool.acquire() as connection:
                cursor = connection.cursor()
                cursor.execute(query, {
                    'start_date': start_date,
                    'end_date': end_date
                })
                
                # Récupérer les noms de colonnes
                columns = [desc[0].lower() for desc in cursor.description]
                
                # Traitement par batch
                batch_size = 1000
                total_inserted = 0
                
                while True:
                    rows = cursor.fetchmany(batch_size)
                    if not rows:
                        break
                    
                    # Convertir en documents MongoDB
                    documents = []
                    for row in rows:
                        doc = dict(zip(columns, row))
                        
                        # Normaliser les types de données
                        doc = self._normalize_document(doc, audit_type)
                        
                        # Ajouter métadonnées
                        doc['_extraction_time'] = datetime.utcnow()
                        doc['_audit_type'] = audit_type
                        doc['_source'] = 'oracle_audit_trail'
                        
                        documents.append(doc)
                    
                    # Insertion MongoDB
                    if documents:
                        inserted = await self._insert_documents(collection_name, documents)
                        total_inserted += inserted
                        logger.info(f"{audit_type}: {total_inserted} documents insérés")
                
                cursor.close()
                return total_inserted
                
        except Exception as e:
            logger.error(f"Erreur extraction {audit_type}: {e}")
            raise
    
    def _normalize_document(self, doc: Dict[str, Any], audit_type: str) -> Dict[str, Any]:
        """Normalise un document pour MongoDB"""
        normalized = {}
        
        for key, value in doc.items():
            # Nettoyer les clés
            clean_key = key.lower().strip()
            
            # Traiter les valeurs
            if value is None:
                normalized[clean_key] = None
            elif isinstance(value, (datetime,)):
                normalized[clean_key] = value.isoformat()
            elif isinstance(value, (int, float)):
                normalized[clean_key] = value
            else:
                # Convertir en string et nettoyer
                str_value = str(value).strip()
                normalized[clean_key] = str_value if str_value else None
        
        # Créer un ID unique pour éviter les doublons
        id_fields = []
        if 'timestamp' in normalized:
            id_fields.append(str(normalized['timestamp']))
        if 'event_timestamp' in normalized:
            id_fields.append(str(normalized['event_timestamp']))
        if 'session_id' in normalized:
            id_fields.append(str(normalized['session_id']))
        if 'scn' in normalized:
            id_fields.append(str(normalized['scn']))
        
        if id_fields:
            import hashlib
            unique_id = hashlib.md5('_'.join(id_fields).encode()).hexdigest()
            normalized['_unique_id'] = unique_id
        
        return normalized
    
    async def _insert_documents(self, collection_name: str, documents: List[Dict[str, Any]]) -> int:
        """Insère les documents dans MongoDB en gérant les doublons"""
        try:
            db = self.mongo_client.auditdb
            collection = db[collection_name]
            
            # Créer l'index sur _unique_id si il n'existe pas
            await collection.create_index([("_unique_id", 1)], unique=True, background=True)
            
            inserted_count = 0
            for doc in documents:
                try:
                    await collection.insert_one(doc)
                    inserted_count += 1
                except Exception as e:
                    if DuplicateKeyError and isinstance(e, DuplicateKeyError):
                        # Document déjà existant, on ignore
                        pass
                    else:
                        logger.warning(f"Erreur insertion document: {e}")
            
            return inserted_count
            
        except Exception as e:
            logger.error(f"Erreur insertion batch: {e}")
            return 0
    
    async def cleanup(self):
        """Nettoie les ressources"""
        if self.oracle_pool:
            self.oracle_pool.close()
            logger.info("Pool Oracle fermé")
        
        if self.mongo_client:
            self.mongo_client.close()
            logger.info("Connexion MongoDB fermée")
    
    async def get_extraction_stats(self) -> Dict[str, Any]:
        """Retourne les statistiques d'extraction"""
        try:
            db = self.mongo_client.auditdb
            stats = {}
            
            for audit_type in ['oracle_audit_trail', 'oracle_fga_audit', 'oracle_unified_audit']:
                collection = db[audit_type]
                count = await collection.count_documents({})
                
                if count > 0:
                    # Période couverte
                    pipeline = [
                        {"$group": {
                            "_id": None,
                            "min_date": {"$min": "$timestamp"},
                            "max_date": {"$max": "$timestamp"},
                            "min_event_date": {"$min": "$event_timestamp"},
                            "max_event_date": {"$max": "$event_timestamp"}
                        }}
                    ]
                    
                    async for result in collection.aggregate(pipeline):
                        stats[audit_type] = {
                            'count': count,
                            'date_range': {
                                'min_date': result.get('min_date') or result.get('min_event_date'),
                                'max_date': result.get('max_date') or result.get('max_event_date')
                            }
                        }
                        break
                else:
                    stats[audit_type] = {'count': 0}
            
            return stats
            
        except Exception as e:
            logger.error(f"Erreur récupération stats: {e}")
            return {}

async def main():
    """Fonction principale pour test/exécution standalone"""
    
    # Configuration Oracle (à adapter)
    oracle_config = {
        'host': os.getenv('ORACLE_HOST', 'localhost'),
        'port': int(os.getenv('ORACLE_PORT', 1521)),
        'service_name': os.getenv('ORACLE_SERVICE_NAME', 'XE'),
        'username': os.getenv('ORACLE_USERNAME', 'audit_user'),
        'password': os.getenv('ORACLE_PASSWORD', 'password')
    }
    
    # Configuration MongoDB
    mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    
    # Période d'extraction (7 derniers jours par défaut)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    extractor = OracleAuditExtractor(oracle_config, mongo_uri)
    
    try:
        await extractor.initialize()
        
        # Extraction
        stats = await extractor.extract_audit_data(start_date, end_date)
        print(f"Extraction terminée: {stats}")
        
        # Statistiques
        db_stats = await extractor.get_extraction_stats()
        print(f"Statistiques MongoDB: {db_stats}")
        
    except Exception as e:
        logger.error(f"Erreur: {e}")
    finally:
        await extractor.cleanup()

if __name__ == "__main__":
    asyncio.run(main())

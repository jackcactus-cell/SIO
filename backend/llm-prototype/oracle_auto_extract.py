#!/usr/bin/env python3
"""
Script d'extraction automatique des données Oracle Audit Trail
Utilisé dans Docker pour l'extraction périodique
"""

import asyncio
import os
import sys
import schedule
import time
import logging
from datetime import datetime, timedelta
from oracle_audit_extractor import OracleAuditExtractor

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/logs/oracle_extract.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class OracleAutoExtractor:
    """Service d'extraction automatique Oracle"""
    
    def __init__(self):
        self.oracle_config = {
            'host': os.getenv('ORACLE_HOST', 'localhost'),
            'port': int(os.getenv('ORACLE_PORT', 1521)),
            'service_name': os.getenv('ORACLE_SERVICE_NAME', 'XE'),
            'username': os.getenv('ORACLE_USERNAME', 'audit_user'),
            'password': os.getenv('ORACLE_PASSWORD', 'password')
        }
        
        self.mongo_uri = os.getenv('MONGODB_URI', 'mongodb://mongodb:27017')
        self.extraction_interval = int(os.getenv('EXTRACTION_INTERVAL_HOURS', 6))
        self.extraction_days = int(os.getenv('EXTRACTION_DAYS_BACK', 1))
        self.audit_types = os.getenv('AUDIT_TYPES', 'all').split(',')
        
        logger.info(f"Configuration Oracle: {self.oracle_config['host']}:{self.oracle_config['port']}")
        logger.info(f"Intervalle d'extraction: {self.extraction_interval} heures")
        logger.info(f"Types d'audit: {self.audit_types}")
    
    async def extract_data(self):
        """Effectue l'extraction des données"""
        try:
            logger.info("🔄 Début de l'extraction automatique Oracle")
            
            # Calculer les dates
            end_date = datetime.now()
            start_date = end_date - timedelta(days=self.extraction_days)
            
            # Initialiser l'extracteur
            extractor = OracleAuditExtractor(self.oracle_config, self.mongo_uri)
            
            try:
                await extractor.initialize()
                
                total_extracted = 0
                for audit_type in self.audit_types:
                    audit_type = audit_type.strip()
                    if audit_type in ['all', 'audit_trail', 'fga_audit', 'unified_audit']:
                        logger.info(f"📊 Extraction {audit_type}...")
                        stats = await extractor.extract_audit_data(start_date, end_date, audit_type)
                        extracted = stats.get('total_extracted', 0)
                        total_extracted += extracted
                        logger.info(f"✅ {audit_type}: {extracted} enregistrements extraits")
                
                # Statistiques finales
                db_stats = await extractor.get_extraction_stats()
                logger.info(f"🎯 Extraction terminée: {total_extracted} nouveaux enregistrements")
                logger.info(f"📈 Statistiques MongoDB: {db_stats}")
                
                return {
                    'success': True,
                    'total_extracted': total_extracted,
                    'database_stats': db_stats
                }
                
            finally:
                await extractor.cleanup()
                
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'extraction: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def run_extraction_sync(self):
        """Wrapper synchrone pour l'extraction"""
        try:
            result = asyncio.run(self.extract_data())
            if result['success']:
                logger.info("✅ Extraction automatique terminée avec succès")
            else:
                logger.error(f"❌ Échec de l'extraction: {result.get('error')}")
        except Exception as e:
            logger.error(f"❌ Erreur dans l'extraction synchrone: {e}")
    
    def start_scheduler(self):
        """Démarre le planificateur d'extraction"""
        logger.info(f"📅 Planification des extractions toutes les {self.extraction_interval} heures")
        
        # Planifier l'extraction
        schedule.every(self.extraction_interval).hours.do(self.run_extraction_sync)
        
        # Optionnel: extraction au démarrage
        if os.getenv('EXTRACT_ON_START', 'false').lower() == 'true':
            logger.info("🚀 Extraction au démarrage activée")
            self.run_extraction_sync()
        
        # Boucle principale
        logger.info("⏰ Planificateur démarré, en attente...")
        while True:
            schedule.run_pending()
            time.sleep(60)  # Vérifier toutes les minutes

def main():
    """Fonction principale"""
    logger.info("🏁 Démarrage du service d'extraction automatique Oracle")
    
    # Vérifier la configuration
    oracle_host = os.getenv('ORACLE_HOST')
    if not oracle_host or oracle_host == 'localhost':
        logger.warning("⚠️  Oracle non configuré, extraction désactivée")
        return
    
    # Créer et démarrer le service
    extractor = OracleAutoExtractor()
    
    try:
        extractor.start_scheduler()
    except KeyboardInterrupt:
        logger.info("🛑 Arrêt du service d'extraction")
    except Exception as e:
        logger.error(f"❌ Erreur fatale: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

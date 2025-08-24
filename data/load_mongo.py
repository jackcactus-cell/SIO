#!/usr/bin/env python3
"""
Script de chargement et d'extraction des données MongoDB
"""
import os
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import pandas as pd
from loguru import logger

class MongoDBLoader:
    """Classe pour charger et extraire les données MongoDB"""
    
    def __init__(self, connection_string: str = "mongodb://admin:securepassword123@localhost:27017/"):
        self.connection_string = connection_string
        self.client = None
        self.db = None
        
    def connect(self) -> bool:
        """Connexion à MongoDB"""
        try:
            self.client = MongoClient(self.connection_string, serverSelectionTimeoutMS=5000)
            # Test de la connexion
            self.client.admin.command('ping')
            self.db = self.client['audit_db']
            logger.info("✅ Connexion MongoDB réussie")
            return True
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"❌ Erreur de connexion MongoDB: {e}")
            return False
    
    def disconnect(self):
        """Déconnexion de MongoDB"""
        if self.client:
            self.client.close()
            logger.info("🔌 Déconnexion MongoDB")
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Obtenir les statistiques des collections"""
        stats = {}
        collections = ['actions_audit', 'audit_logs', 'user_sessions', 'system_events']
        
        for collection_name in collections:
            try:
                collection = self.db[collection_name]
                count = collection.count_documents({})
                stats[collection_name] = {
                    'count': count,
                    'exists': True
                }
            except Exception as e:
                stats[collection_name] = {
                    'count': 0,
                    'exists': False,
                    'error': str(e)
                }
        
        return stats
    
    def extract_audit_data(self, limit: int = 1000) -> List[Dict[str, Any]]:
        """Extraire les données d'audit"""
        try:
            collection = self.db['actions_audit']
            cursor = collection.find({}).limit(limit)
            data = list(cursor)
            
            # Convertir les ObjectId en string pour la sérialisation JSON
            for item in data:
                if '_id' in item:
                    item['_id'] = str(item['_id'])
            
            logger.info(f"✅ {len(data)} documents extraits de actions_audit")
            return data
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'extraction des données d'audit: {e}")
            return []
    
    def extract_user_stats(self) -> List[Dict[str, Any]]:
        """Extraire les statistiques utilisateur depuis la vue"""
        try:
            # Utiliser la vue user_action_stats
            cursor = self.db['user_action_stats'].find({})
            data = list(cursor)
            
            for item in data:
                if '_id' in item:
                    item['_id'] = str(item['_id'])
            
            logger.info(f"✅ {len(data)} statistiques utilisateur extraites")
            return data
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'extraction des statistiques utilisateur: {e}")
            return []
    
    def extract_security_alerts(self, days: int = 7) -> List[Dict[str, Any]]:
        """Extraire les alertes de sécurité récentes"""
        try:
            # Utiliser la vue security_alerts
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            cursor = self.db['security_alerts'].find({
                'timestamp': {'$gte': cutoff_date}
            }).sort('timestamp', -1)
            
            data = list(cursor)
            
            for item in data:
                if '_id' in item:
                    item['_id'] = str(item['_id'])
            
            logger.info(f"✅ {len(data)} alertes de sécurité extraites")
            return data
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'extraction des alertes: {e}")
            return []
    
    def export_to_json(self, data: List[Dict[str, Any]], filename: str):
        """Exporter les données en JSON"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str, ensure_ascii=False)
            logger.info(f"✅ Données exportées vers {filename}")
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'export JSON: {e}")
    
    def export_to_csv(self, data: List[Dict[str, Any]], filename: str):
        """Exporter les données en CSV"""
        try:
            if data:
                df = pd.DataFrame(data)
                df.to_csv(filename, index=False, encoding='utf-8')
                logger.info(f"✅ Données exportées vers {filename}")
            else:
                logger.warning("⚠️ Aucune donnée à exporter")
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'export CSV: {e}")
    
    def run_full_extraction(self, output_dir: str = "extracted_data"):
        """Exécuter l'extraction complète des données"""
        logger.info("🚀 Début de l'extraction complète des données")
        
        # Créer le répertoire de sortie
        os.makedirs(output_dir, exist_ok=True)
        
        # Obtenir les statistiques
        stats = self.get_collection_stats()
        logger.info("📊 Statistiques des collections:")
        for collection, stat in stats.items():
            if stat['exists']:
                logger.info(f"   - {collection}: {stat['count']} documents")
            else:
                logger.warning(f"   - {collection}: Collection inexistante")
        
        # Extraire les données d'audit
        audit_data = self.extract_audit_data()
        if audit_data:
            self.export_to_json(audit_data, f"{output_dir}/audit_actions.json")
            self.export_to_csv(audit_data, f"{output_dir}/audit_actions.csv")
        
        # Extraire les statistiques utilisateur
        user_stats = self.extract_user_stats()
        if user_stats:
            self.export_to_json(user_stats, f"{output_dir}/user_statistics.json")
            self.export_to_csv(user_stats, f"{output_dir}/user_statistics.csv")
        
        # Extraire les alertes de sécurité
        security_alerts = self.extract_security_alerts()
        if security_alerts:
            self.export_to_json(security_alerts, f"{output_dir}/security_alerts.json")
            self.export_to_csv(security_alerts, f"{output_dir}/security_alerts.csv")
        
        logger.info("🎉 Extraction complète terminée")

def main():
    """Fonction principale"""
    logger.info("🚀 Script de chargement MongoDB")
    logger.info("=" * 50)
    
    # Configuration de la connexion
    connection_string = os.getenv('MONGODB_URI', 'mongodb://admin:securepassword123@localhost:27017/')
    
    # Créer l'instance du loader
    loader = MongoDBLoader(connection_string)
    
    # Se connecter à MongoDB
    if not loader.connect():
        logger.error("❌ Impossible de se connecter à MongoDB")
        sys.exit(1)
    
    try:
        # Exécuter l'extraction complète
        loader.run_full_extraction()
    finally:
        # Se déconnecter
        loader.disconnect()
    
    logger.info("✅ Script terminé avec succès")

if __name__ == "__main__":
    main()

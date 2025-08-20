"""Gestion des connexions aux bases de données"""
import sqlite3
import asyncio
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from loguru import logger
from config import settings


class DatabaseManager:
    """Gestionnaire des connexions aux bases de données"""
    
    def __init__(self):
        self.mongodb_client: Optional[AsyncIOMotorClient] = None
        self.mongodb_db = None
        self.sqlite_conn: Optional[sqlite3.Connection] = None
    
    async def connect_mongodb(self):
        """Connexion à MongoDB"""
        try:
            self.mongodb_client = AsyncIOMotorClient(settings.mongodb_uri)
            # Test de la connexion
            await self.mongodb_client.admin.command('ping')
            self.mongodb_db = self.mongodb_client[settings.mongodb_db_name]
            logger.info(f"Connecté à MongoDB: {settings.mongodb_uri}")
            return True
        except ConnectionFailure as e:
            logger.error(f"Erreur de connexion MongoDB: {e}")
            return False
    
    def connect_sqlite(self):
        """Connexion à SQLite"""
        try:
            import os
            os.makedirs(os.path.dirname(settings.sqlite_db_path), exist_ok=True)
            
            self.sqlite_conn = sqlite3.connect(
                settings.sqlite_db_path, 
                check_same_thread=False
            )
            self.sqlite_conn.row_factory = sqlite3.Row
            
            # Activation des clés étrangères et mode WAL
            self.sqlite_conn.execute('PRAGMA foreign_keys = ON')
            self.sqlite_conn.execute('PRAGMA journal_mode = WAL')
            
            # Création des tables
            self._create_sqlite_tables()
            logger.info(f"Connecté à SQLite: {settings.sqlite_db_path}")
            return True
        except Exception as e:
            logger.error(f"Erreur de connexion SQLite: {e}")
            return False
    
    def _create_sqlite_tables(self):
        """Création des tables SQLite"""
        cursor = self.sqlite_conn.cursor()
        
        # Table pour le cache des requêtes
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS query_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query_hash TEXT UNIQUE NOT NULL,
                normalized_query TEXT NOT NULL,
                result TEXT NOT NULL,
                hit_count INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Table pour le cache des actions
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS action_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action_type TEXT NOT NULL,
                user_name TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT
            )
        ''')
        
        # Table pour les statistiques des questions
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS question_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                normalized_question TEXT UNIQUE NOT NULL,
                count INTEGER DEFAULT 1,
                last_asked DATETIME DEFAULT CURRENT_TIMESTAMP,
                variations TEXT
            )
        ''')
        
        # Index pour améliorer les performances
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_query_hash ON query_cache(query_hash)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_action_timestamp ON action_cache(timestamp)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_question_normalized ON question_stats(normalized_question)')
        
        self.sqlite_conn.commit()
        logger.info("Tables SQLite créées avec succès")
    
    async def close_connections(self):
        """Fermeture des connexions"""
        if self.mongodb_client:
            self.mongodb_client.close()
            logger.info("Connexion MongoDB fermée")
        
        if self.sqlite_conn:
            self.sqlite_conn.close()
            logger.info("Connexion SQLite fermée")
    
    def get_mongodb_collection(self, collection_name: str):
        """Récupérer une collection MongoDB"""
        if not self.mongodb_db:
            raise Exception("MongoDB non connecté")
        return self.mongodb_db[collection_name]
    
    def execute_sqlite_query(self, query: str, params: tuple = ()):
        """Exécuter une requête SQLite"""
        if not self.sqlite_conn:
            raise Exception("SQLite non connecté")
        
        cursor = self.sqlite_conn.cursor()
        cursor.execute(query, params)
        self.sqlite_conn.commit()
        return cursor
    
    def fetch_sqlite_query(self, query: str, params: tuple = ()):
        """Récupérer des données SQLite"""
        if not self.sqlite_conn:
            raise Exception("SQLite non connecté")
        
        cursor = self.sqlite_conn.cursor()
        cursor.execute(query, params)
        return cursor.fetchall()


# Instance globale du gestionnaire de base de données
db_manager = DatabaseManager()

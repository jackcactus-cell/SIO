"""Services de cache et analyse des requêtes"""
import json
import hashlib
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from database import db_manager
from models import QueryCache, ActionCache, QuestionStats
from loguru import logger


class CacheService:
    """Service de gestion du cache"""
    
    @staticmethod
    def normalize_query(query: str) -> str:
        """Normaliser une requête pour le cache"""
        return query.lower().strip().replace("  ", " ")
    
    @staticmethod
    def generate_query_hash(query: str) -> str:
        """Générer un hash pour une requête"""
        normalized = CacheService.normalize_query(query)
        return hashlib.md5(normalized.encode()).hexdigest()
    
    @staticmethod
    async def get_cached_query(query: str) -> Optional[Dict[str, Any]]:
        """Récupérer une requête du cache"""
        try:
            query_hash = CacheService.generate_query_hash(query)
            
            # Rechercher dans SQLite
            result = db_manager.fetch_sqlite_query(
                "SELECT * FROM query_cache WHERE query_hash = ?",
                (query_hash,)
            )
            
            if result:
                row = result[0]
                # Mettre à jour le compteur et la date d'accès
                db_manager.execute_sqlite_query(
                    "UPDATE query_cache SET hit_count = hit_count + 1, last_accessed = ? WHERE query_hash = ?",
                    (datetime.utcnow().isoformat(), query_hash)
                )
                
                return {
                    "result": json.loads(row["result"]),
                    "hit_count": row["hit_count"] + 1,
                    "cached": True
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du cache: {e}")
            return None
    
    @staticmethod
    async def cache_query_result(query: str, result: Dict[str, Any]):
        """Mettre en cache le résultat d'une requête"""
        try:
            query_hash = CacheService.generate_query_hash(query)
            normalized_query = CacheService.normalize_query(query)
            result_json = json.dumps(result, ensure_ascii=False)
            
            # Insérer ou mettre à jour dans SQLite
            db_manager.execute_sqlite_query(
                """INSERT OR REPLACE INTO query_cache 
                   (query_hash, normalized_query, result, hit_count, created_at, last_accessed)
                   VALUES (?, ?, ?, 1, ?, ?)""",
                (query_hash, normalized_query, result_json, 
                 datetime.utcnow().isoformat(), datetime.utcnow().isoformat())
            )
            
            logger.info(f"Requête mise en cache: {query_hash}")
            
        except Exception as e:
            logger.error(f"Erreur lors de la mise en cache: {e}")
    
    @staticmethod
    async def get_cache_stats() -> Dict[str, Any]:
        """Obtenir les statistiques du cache"""
        try:
            # Statistiques générales
            total_queries = db_manager.fetch_sqlite_query(
                "SELECT COUNT(*) as count FROM query_cache"
            )[0]["count"]
            
            total_hits = db_manager.fetch_sqlite_query(
                "SELECT SUM(hit_count) as total FROM query_cache"
            )[0]["total"] or 0
            
            # Top requêtes
            top_queries = db_manager.fetch_sqlite_query(
                """SELECT normalized_query, hit_count, last_accessed 
                   FROM query_cache 
                   ORDER BY hit_count DESC 
                   LIMIT 10"""
            )
            
            # Requêtes récentes
            recent_queries = db_manager.fetch_sqlite_query(
                """SELECT normalized_query, hit_count, last_accessed 
                   FROM query_cache 
                   ORDER BY last_accessed DESC 
                   LIMIT 10"""
            )
            
            return {
                "total_queries": total_queries,
                "total_hits": total_hits,
                "hit_rate": (total_hits / max(total_queries, 1)) * 100,
                "top_queries": [dict(row) for row in top_queries],
                "recent_queries": [dict(row) for row in recent_queries]
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des stats: {e}")
            return {}
    
    @staticmethod
    async def cache_action(action_type: str, user: Optional[str] = None, metadata: Optional[Dict] = None):
        """Mettre en cache une action"""
        try:
            metadata_json = json.dumps(metadata or {}, ensure_ascii=False)
            
            db_manager.execute_sqlite_query(
                "INSERT INTO action_cache (action_type, user_name, metadata) VALUES (?, ?, ?)",
                (action_type, user, metadata_json)
            )
            
        except Exception as e:
            logger.error(f"Erreur lors de la mise en cache de l'action: {e}")
    
    @staticmethod
    async def get_action_stats(timeframe: str = "24h") -> Dict[str, Any]:
        """Obtenir les statistiques des actions"""
        try:
            # Calculer la date de début selon le timeframe
            if timeframe == "1h":
                start_time = datetime.utcnow() - timedelta(hours=1)
            elif timeframe == "24h":
                start_time = datetime.utcnow() - timedelta(days=1)
            elif timeframe == "7d":
                start_time = datetime.utcnow() - timedelta(days=7)
            else:
                start_time = datetime.utcnow() - timedelta(days=1)
            
            # Actions par type
            actions_by_type = db_manager.fetch_sqlite_query(
                """SELECT action_type, COUNT(*) as count 
                   FROM action_cache 
                   WHERE timestamp >= ? 
                   GROUP BY action_type 
                   ORDER BY count DESC""",
                (start_time.isoformat(),)
            )
            
            # Actions par utilisateur
            actions_by_user = db_manager.fetch_sqlite_query(
                """SELECT user_name, COUNT(*) as count 
                   FROM action_cache 
                   WHERE timestamp >= ? AND user_name IS NOT NULL
                   GROUP BY user_name 
                   ORDER BY count DESC 
                   LIMIT 10""",
                (start_time.isoformat(),)
            )
            
            # Total des actions
            total_actions = db_manager.fetch_sqlite_query(
                "SELECT COUNT(*) as count FROM action_cache WHERE timestamp >= ?",
                (start_time.isoformat(),)
            )[0]["count"]
            
            return {
                "timeframe": timeframe,
                "total_actions": total_actions,
                "actions_by_type": [dict(row) for row in actions_by_type],
                "actions_by_user": [dict(row) for row in actions_by_user]
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des stats d'actions: {e}")
            return {}
    
    @staticmethod
    async def cleanup_old_cache(max_age_days: int = 30):
        """Nettoyer les anciennes entrées du cache"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=max_age_days)
            
            # Nettoyer les requêtes anciennes
            db_manager.execute_sqlite_query(
                "DELETE FROM query_cache WHERE created_at < ?",
                (cutoff_date.isoformat(),)
            )
            
            # Nettoyer les actions anciennes
            db_manager.execute_sqlite_query(
                "DELETE FROM action_cache WHERE timestamp < ?",
                (cutoff_date.isoformat(),)
            )
            
            logger.info(f"Cache nettoyé: entrées plus anciennes que {max_age_days} jours supprimées")
            
        except Exception as e:
            logger.error(f"Erreur lors du nettoyage du cache: {e}")


class QuestionStatsService:
    """Service de gestion des statistiques de questions"""
    
    @staticmethod
    async def update_question_stats(question: str):
        """Mettre à jour les statistiques d'une question"""
        try:
            normalized = CacheService.normalize_query(question)
            
            # Vérifier si la question existe déjà
            existing = db_manager.fetch_sqlite_query(
                "SELECT * FROM question_stats WHERE normalized_question = ?",
                (normalized,)
            )
            
            if existing:
                # Mettre à jour le compteur
                variations = json.loads(existing[0]["variations"] or "[]")
                if question not in variations:
                    variations.append(question)
                
                db_manager.execute_sqlite_query(
                    """UPDATE question_stats 
                       SET count = count + 1, last_asked = ?, variations = ?
                       WHERE normalized_question = ?""",
                    (datetime.utcnow().isoformat(), json.dumps(variations), normalized)
                )
            else:
                # Créer une nouvelle entrée
                db_manager.execute_sqlite_query(
                    """INSERT INTO question_stats 
                       (normalized_question, count, last_asked, variations)
                       VALUES (?, 1, ?, ?)""",
                    (normalized, datetime.utcnow().isoformat(), json.dumps([question]))
                )
                
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour des stats de question: {e}")
    
    @staticmethod
    async def get_frequent_questions(limit: int = 10) -> List[Dict[str, Any]]:
        """Obtenir les questions les plus fréquentes"""
        try:
            results = db_manager.fetch_sqlite_query(
                """SELECT normalized_question, count, last_asked, variations
                   FROM question_stats 
                   ORDER BY count DESC 
                   LIMIT ?""",
                (limit,)
            )
            
            return [
                {
                    "question": row["normalized_question"],
                    "count": row["count"],
                    "last_asked": row["last_asked"],
                    "variations": json.loads(row["variations"] or "[]")
                }
                for row in results
            ]
            
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des questions fréquentes: {e}")
            return []

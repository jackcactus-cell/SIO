"""Services de traitement du langage naturel et d'analyse"""
import re
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from loguru import logger
from models import QueryAnalysis, AuditQuery
from database import db_manager


class NLPService:
    """Service de traitement du langage naturel"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='french')
        self.question_patterns = self._load_question_patterns()
    
    def _load_question_patterns(self) -> Dict[str, List[str]]:
        """Charger les patterns de questions prédéfinis"""
        return {
            "USER_ACTIVITY": [
                r"utilisateurs? .*(?:exécuté|fait|réalisé)",
                r"qui .*(?:a fait|a exécuté|a réalisé)",
                r"actions? .*(?:utilisateur|user)",
                r"activité.*utilisateur"
            ],
            "OBJECT_MODIFICATIONS": [
                r"(?:modifications?|changements?) .*(?:table|objet)",
                r"(?:créé|supprimé|modifié) .*(?:table|objet)",
                r"(?:CREATE|DROP|ALTER|INSERT|UPDATE|DELETE)",
                r"structure.*(?:table|base)"
            ],
            "TIME_ANALYSIS": [
                r"(?:aujourd'hui|hier|cette semaine|ce mois)",
                r"(?:pendant|durant|au cours de)",
                r"(?:heure|jour|semaine|mois)",
                r"(?:quand|à quel moment)"
            ],
            "SECURITY_ANALYSIS": [
                r"(?:sécurité|accès|permissions?)",
                r"(?:tentatives?|échecs?) .*connexion",
                r"(?:utilisateurs? suspects?|activité suspecte)",
                r"(?:violations?|infractions?)"
            ],
            "PERFORMANCE_ANALYSIS": [
                r"(?:performances?|lenteur|rapidité)",
                r"(?:requêtes? lentes?|temps de réponse)",
                r"(?:optimisation|amélioration)",
                r"(?:charge|utilisation)"
            ]
        }
    
    def extract_entities(self, text: str) -> Dict[str, Any]:
        """Extraire les entités du texte"""
        entities = {}
        
        # Extraction des utilisateurs
        user_patterns = [
            r"utilisateur(?:\s+(?:os|db))?\s+([A-Za-z0-9_-]+)",
            r"user\s+([A-Za-z0-9_-]+)",
            r"(?:je suis|je m'appelle)\s+([A-Za-zÀ-ÿ-]+)"
        ]
        
        for pattern in user_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities["user"] = match.group(1)
                break
        
        # Extraction des actions SQL
        sql_actions = re.findall(r'\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b', text, re.IGNORECASE)
        if sql_actions:
            entities["actions"] = [action.upper() for action in sql_actions]
        
        # Extraction des objets/tables
        object_patterns = [
            r"(?:table|objet)\s+([A-Za-z0-9_-]+)",
            r"(?:sur|dans)\s+([A-Za-z0-9_-]+)",
            r"(?:CREATE|DROP|ALTER)\s+(?:TABLE\s+)?([A-Za-z0-9_-]+)"
        ]
        
        for pattern in object_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities["object_name"] = match.group(1).upper()
                break
        
        # Extraction des schémas
        schema_match = re.search(r"schéma\s+([A-Za-z0-9_-]+)", text, re.IGNORECASE)
        if schema_match:
            entities["schema"] = schema_match.group(1).upper()
        
        # Extraction des dates
        date_patterns = [
            r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})",
            r"(aujourd'hui|hier)",
            r"(cette semaine|ce mois|cette année)",
            r"(pendant|durant)\s+(\d+)\s+(heures?|jours?|semaines?|mois)"
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates.extend([match if isinstance(match, str) else ' '.join(match) for match in matches])
        
        if dates:
            entities["dates"] = dates
        
        # Extraction des programmes/clients
        program_match = re.search(r"(SQL Developer|Toad|DBeaver|PL\/SQL Developer|SSMS)", text, re.IGNORECASE)
        if program_match:
            entities["program"] = program_match.group(1)
        
        # Extraction des hosts/postes
        host_match = re.search(r"(?:poste|host)\s+([A-Za-z0-9_-]+)", text, re.IGNORECASE)
        if host_match:
            entities["client_host"] = host_match.group(1).upper()
        
        return entities
    
    def classify_intent(self, text: str) -> Tuple[str, float]:
        """Classifier l'intention de la question"""
        text_lower = text.lower()
        best_intent = "GENERAL"
        best_score = 0.0
        
        for intent, patterns in self.question_patterns.items():
            score = 0.0
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    score += 1.0
            
            # Normaliser le score
            if patterns:
                score = score / len(patterns)
            
            if score > best_score:
                best_score = score
                best_intent = intent
        
        return best_intent, best_score
    
    def extract_timeframe(self, text: str) -> Dict[str, Any]:
        """Extraire la période temporelle"""
        timeframe = {}
        now = datetime.utcnow()
        
        # Patterns temporels
        if re.search(r"aujourd'hui", text, re.IGNORECASE):
            timeframe["start"] = now.replace(hour=0, minute=0, second=0, microsecond=0)
            timeframe["end"] = now
            timeframe["period"] = "today"
        
        elif re.search(r"hier", text, re.IGNORECASE):
            yesterday = now - timedelta(days=1)
            timeframe["start"] = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
            timeframe["end"] = yesterday.replace(hour=23, minute=59, second=59)
            timeframe["period"] = "yesterday"
        
        elif re.search(r"cette semaine", text, re.IGNORECASE):
            start_week = now - timedelta(days=now.weekday())
            timeframe["start"] = start_week.replace(hour=0, minute=0, second=0, microsecond=0)
            timeframe["end"] = now
            timeframe["period"] = "this_week"
        
        elif re.search(r"ce mois", text, re.IGNORECASE):
            timeframe["start"] = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            timeframe["end"] = now
            timeframe["period"] = "this_month"
        
        # Patterns de durée
        duration_match = re.search(r"(?:pendant|durant|dernières?)\s+(\d+)\s+(heures?|jours?|semaines?|mois)", text, re.IGNORECASE)
        if duration_match:
            amount = int(duration_match.group(1))
            unit = duration_match.group(2).lower()
            
            if "heure" in unit:
                timeframe["start"] = now - timedelta(hours=amount)
            elif "jour" in unit:
                timeframe["start"] = now - timedelta(days=amount)
            elif "semaine" in unit:
                timeframe["start"] = now - timedelta(weeks=amount)
            elif "mois" in unit:
                timeframe["start"] = now - timedelta(days=amount * 30)
            
            timeframe["end"] = now
            timeframe["period"] = f"last_{amount}_{unit}"
        
        return timeframe
    
    def analyze_question(self, question: str) -> QueryAnalysis:
        """Analyser une question complète"""
        # Normaliser la question
        normalized = question.lower().strip()
        
        # Extraire les entités
        entities = self.extract_entities(question)
        
        # Classifier l'intention
        intent, confidence = self.classify_intent(question)
        
        # Extraire la période temporelle
        timeframe = self.extract_timeframe(question)
        if timeframe:
            entities["timeframe"] = timeframe
        
        # Générer des filtres suggérés
        suggested_filters = self._generate_suggested_filters(entities, intent)
        
        return QueryAnalysis(
            original_query=question,
            normalized_query=normalized,
            intent=intent,
            entities=entities,
            confidence=confidence,
            suggested_filters=suggested_filters
        )
    
    def _generate_suggested_filters(self, entities: Dict[str, Any], intent: str) -> Dict[str, Any]:
        """Générer des filtres suggérés basés sur l'analyse"""
        filters = {}
        
        # Filtres basés sur les entités
        if "user" in entities:
            filters["os_username"] = entities["user"]
            filters["dbusername"] = entities["user"]
        
        if "actions" in entities:
            filters["action_name"] = entities["actions"]
        
        if "object_name" in entities:
            filters["object_name"] = entities["object_name"]
        
        if "schema" in entities:
            filters["object_schema"] = entities["schema"]
        
        if "program" in entities:
            filters["client_program_name"] = entities["program"]
        
        if "client_host" in entities:
            filters["client_host"] = entities["client_host"]
        
        # Filtres temporels
        if "timeframe" in entities:
            tf = entities["timeframe"]
            if "start" in tf:
                filters["date_start"] = tf["start"].isoformat()
            if "end" in tf:
                filters["date_end"] = tf["end"].isoformat()
        
        # Filtres basés sur l'intention
        if intent == "SECURITY_ANALYSIS":
            filters["focus"] = "security"
        elif intent == "PERFORMANCE_ANALYSIS":
            filters["focus"] = "performance"
        elif intent == "USER_ACTIVITY":
            filters["focus"] = "user_activity"
        
        return filters
    
    def find_similar_questions(self, question: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Trouver des questions similaires"""
        try:
            # Récupérer les questions existantes
            existing_questions = db_manager.fetch_sqlite_query(
                "SELECT normalized_question, count FROM question_stats ORDER BY count DESC LIMIT 100"
            )
            
            if not existing_questions:
                return []
            
            # Préparer les textes pour la vectorisation
            questions_text = [row["normalized_question"] for row in existing_questions]
            questions_text.append(question.lower().strip())
            
            # Vectoriser
            tfidf_matrix = self.vectorizer.fit_transform(questions_text)
            
            # Calculer la similarité
            similarities = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1]).flatten()
            
            # Obtenir les indices des questions les plus similaires
            similar_indices = similarities.argsort()[-limit:][::-1]
            
            results = []
            for idx in similar_indices:
                if similarities[idx] > 0.1:  # Seuil de similarité
                    results.append({
                        "question": existing_questions[idx]["normalized_question"],
                        "count": existing_questions[idx]["count"],
                        "similarity": float(similarities[idx])
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de questions similaires: {e}")
            return []


class AuditAnalysisService:
    """Service d'analyse des données d'audit"""
    
    @staticmethod
    async def analyze_user_activity(filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Analyser l'activité des utilisateurs"""
        try:
            collection = db_manager.get_mongodb_collection("actions_audit")
            
            # Pipeline d'agrégation pour l'analyse des utilisateurs
            pipeline = []
            
            # Filtres
            if filters:
                match_stage = {}
                if "timeframe" in filters:
                    tf = filters["timeframe"]
                    if "start" in tf and "end" in tf:
                        match_stage["event_timestamp"] = {
                            "$gte": tf["start"].isoformat(),
                            "$lte": tf["end"].isoformat()
                        }
                
                if match_stage:
                    pipeline.append({"$match": match_stage})
            
            # Agrégation par utilisateur
            pipeline.extend([
                {
                    "$group": {
                        "_id": "$os_username",
                        "total_actions": {"$sum": 1},
                        "unique_objects": {"$addToSet": "$object_name"},
                        "actions_by_type": {"$push": "$action_name"},
                        "last_activity": {"$max": "$event_timestamp"}
                    }
                },
                {
                    "$project": {
                        "username": "$_id",
                        "total_actions": 1,
                        "unique_objects_count": {"$size": "$unique_objects"},
                        "unique_objects": 1,
                        "actions_by_type": 1,
                        "last_activity": 1
                    }
                },
                {"$sort": {"total_actions": -1}},
                {"$limit": 20}
            ])
            
            results = []
            async for doc in collection.aggregate(pipeline):
                # Compter les actions par type
                action_counts = {}
                for action in doc.get("actions_by_type", []):
                    action_counts[action] = action_counts.get(action, 0) + 1
                
                results.append({
                    "username": doc.get("username"),
                    "total_actions": doc.get("total_actions", 0),
                    "unique_objects_count": doc.get("unique_objects_count", 0),
                    "unique_objects": doc.get("unique_objects", []),
                    "action_counts": action_counts,
                    "last_activity": doc.get("last_activity")
                })
            
            return {
                "analysis_type": "user_activity",
                "results": results,
                "summary": {
                    "total_users": len(results),
                    "most_active_user": results[0]["username"] if results else None,
                    "total_actions": sum(r["total_actions"] for r in results)
                }
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse d'activité utilisateur: {e}")
            return {"error": str(e)}
    
    @staticmethod
    async def detect_anomalies(timeframe: str = "24h") -> Dict[str, Any]:
        """Détecter les anomalies dans les actions d'audit"""
        try:
            collection = db_manager.get_mongodb_collection("actions_audit")
            
            # Calculer la période
            if timeframe == "1h":
                start_time = datetime.utcnow() - timedelta(hours=1)
            elif timeframe == "24h":
                start_time = datetime.utcnow() - timedelta(days=1)
            elif timeframe == "7d":
                start_time = datetime.utcnow() - timedelta(days=7)
            else:
                start_time = datetime.utcnow() - timedelta(days=1)
            
            # Pipeline pour détecter les anomalies
            pipeline = [
                {
                    "$match": {
                        "event_timestamp": {"$gte": start_time.isoformat()}
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "user": "$os_username",
                            "action": "$action_name",
                            "hour": {"$substr": ["$event_timestamp", 11, 2]}
                        },
                        "count": {"$sum": 1}
                    }
                },
                {
                    "$group": {
                        "_id": {"user": "$_id.user", "action": "$_id.action"},
                        "hourly_counts": {"$push": {"hour": "$_id.hour", "count": "$count"}},
                        "total_count": {"$sum": "$count"},
                        "avg_per_hour": {"$avg": "$count"}
                    }
                }
            ]
            
            anomalies = []
            async for doc in collection.aggregate(pipeline):
                # Détecter les pics d'activité (plus de 3x la moyenne)
                avg = doc.get("avg_per_hour", 0)
                threshold = avg * 3
                
                for hourly in doc.get("hourly_counts", []):
                    if hourly["count"] > threshold and avg > 0:
                        anomalies.append({
                            "type": "activity_spike",
                            "user": doc["_id"]["user"],
                            "action": doc["_id"]["action"],
                            "hour": hourly["hour"],
                            "count": hourly["count"],
                            "average": avg,
                            "threshold": threshold,
                            "severity": "high" if hourly["count"] > threshold * 2 else "medium"
                        })
            
            return {
                "timeframe": timeframe,
                "anomalies_detected": len(anomalies),
                "anomalies": anomalies,
                "analysis_summary": {
                    "high_severity": len([a for a in anomalies if a["severity"] == "high"]),
                    "medium_severity": len([a for a in anomalies if a["severity"] == "medium"])
                }
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de la détection d'anomalies: {e}")
            return {"error": str(e)}

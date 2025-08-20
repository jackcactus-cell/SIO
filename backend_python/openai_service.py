"""Service d'intégration avec OpenAI pour le chatbot"""
import openai
from typing import Dict, List, Any, Optional
from loguru import logger
from config import settings
from nlp_service import NLPService, AuditAnalysisService
from cache_service import CacheService, QuestionStatsService
from models import ChatResponse


class OpenAIService:
    """Service d'intégration avec OpenAI"""
    
    def __init__(self):
        openai.api_key = settings.openai_api_key
        self.nlp_service = NLPService()
        self.max_tokens = 1000
        self.temperature = 0.7
    
    async def process_chat_message(self, message: str, user_id: Optional[str] = None) -> ChatResponse:
        """Traiter un message de chat avec analyse NLP et OpenAI"""
        try:
            # Vérifier le cache d'abord
            cached_result = await CacheService.get_cached_query(message)
            if cached_result:
                logger.info(f"Réponse trouvée dans le cache pour: {message[:50]}...")
                return ChatResponse(
                    response=cached_result["result"].get("response", ""),
                    analysis=cached_result["result"].get("analysis"),
                    suggestions=cached_result["result"].get("suggestions"),
                    cached=True
                )
            
            # Analyser la question avec NLP
            analysis = self.nlp_service.analyze_question(message)
            logger.info(f"Analyse NLP - Intent: {analysis.intent}, Confidence: {analysis.confidence}")
            
            # Mettre à jour les statistiques de questions
            await QuestionStatsService.update_question_stats(message)
            
            # Générer la réponse selon l'intention
            if analysis.intent in ["USER_ACTIVITY", "OBJECT_MODIFICATIONS", "SECURITY_ANALYSIS"]:
                response = await self._handle_audit_query(message, analysis)
            else:
                response = await self._handle_general_query(message, analysis)
            
            # Trouver des questions similaires pour suggestions
            similar_questions = self.nlp_service.find_similar_questions(message)
            suggestions = [q["question"] for q in similar_questions[:3]]
            
            # Créer la réponse finale
            chat_response = ChatResponse(
                response=response,
                analysis=analysis.dict(),
                suggestions=suggestions,
                cached=False
            )
            
            # Mettre en cache la réponse
            await CacheService.cache_query_result(message, chat_response.dict())
            
            # Logger l'action
            await CacheService.cache_action("chat_query", user_id, {
                "intent": analysis.intent,
                "confidence": analysis.confidence
            })
            
            return chat_response
            
        except Exception as e:
            logger.error(f"Erreur lors du traitement du message: {e}")
            return ChatResponse(
                response="Désolé, une erreur s'est produite lors du traitement de votre demande.",
                analysis=None,
                suggestions=[],
                cached=False
            )
    
    async def _handle_audit_query(self, message: str, analysis) -> str:
        """Traiter une requête d'audit spécifique"""
        try:
            # Exécuter l'analyse d'audit basée sur l'intention
            if analysis.intent == "USER_ACTIVITY":
                audit_results = await AuditAnalysisService.analyze_user_activity(
                    filters=analysis.suggested_filters
                )
            elif analysis.intent == "SECURITY_ANALYSIS":
                audit_results = await AuditAnalysisService.detect_anomalies()
            else:
                # Requête générale d'audit
                audit_results = await self._execute_audit_query(analysis.suggested_filters)
            
            # Préparer le contexte pour OpenAI
            context = self._prepare_audit_context(message, analysis, audit_results)
            
            # Générer la réponse avec OpenAI
            response = await self._generate_openai_response(context)
            
            return response
            
        except Exception as e:
            logger.error(f"Erreur lors de la requête d'audit: {e}")
            return f"Je n'ai pas pu analyser les données d'audit pour cette requête. Erreur: {str(e)}"
    
    async def _handle_general_query(self, message: str, analysis) -> str:
        """Traiter une requête générale"""
        try:
            # Préparer le contexte général
            context = f"""
            Question de l'utilisateur: {message}
            
            Analyse NLP:
            - Intention détectée: {analysis.intent}
            - Confiance: {analysis.confidence}
            - Entités extraites: {analysis.entities}
            
            Vous êtes un assistant spécialisé dans l'analyse d'audit de bases de données.
            Répondez de manière claire et professionnelle en français.
            Si la question concerne l'audit, proposez des requêtes ou analyses pertinentes.
            """
            
            response = await self._generate_openai_response(context)
            return response
            
        except Exception as e:
            logger.error(f"Erreur lors de la requête générale: {e}")
            return "Je peux vous aider avec l'analyse d'audit de bases de données. Pouvez-vous reformuler votre question ?"
    
    async def _execute_audit_query(self, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Exécuter une requête d'audit avec les filtres"""
        try:
            from database import db_manager
            collection = db_manager.get_mongodb_collection("actions_audit")
            
            # Construire la requête MongoDB
            query = {}
            
            if "os_username" in filters:
                query["os_username"] = {"$regex": filters["os_username"], "$options": "i"}
            
            if "action_name" in filters:
                if isinstance(filters["action_name"], list):
                    query["action_name"] = {"$in": filters["action_name"]}
                else:
                    query["action_name"] = filters["action_name"]
            
            if "object_name" in filters:
                query["object_name"] = {"$regex": filters["object_name"], "$options": "i"}
            
            if "object_schema" in filters:
                query["object_schema"] = {"$regex": filters["object_schema"], "$options": "i"}
            
            if "date_start" in filters and "date_end" in filters:
                query["event_timestamp"] = {
                    "$gte": filters["date_start"],
                    "$lte": filters["date_end"]
                }
            
            # Exécuter la requête
            results = []
            async for doc in collection.find(query).limit(100):
                # Convertir ObjectId en string
                doc["_id"] = str(doc["_id"])
                results.append(doc)
            
            return {
                "query": query,
                "results": results,
                "count": len(results)
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de l'exécution de la requête d'audit: {e}")
            return {"error": str(e), "results": [], "count": 0}
    
    def _prepare_audit_context(self, message: str, analysis, audit_results: Dict[str, Any]) -> str:
        """Préparer le contexte pour OpenAI avec les résultats d'audit"""
        results_summary = ""
        
        if "results" in audit_results and audit_results["results"]:
            results_count = len(audit_results["results"])
            results_summary = f"J'ai trouvé {results_count} résultats correspondant à votre requête.\n\n"
            
            # Résumer les premiers résultats
            for i, result in enumerate(audit_results["results"][:5]):
                results_summary += f"Résultat {i+1}:\n"
                results_summary += f"- Utilisateur: {result.get('os_username', 'N/A')}\n"
                results_summary += f"- Action: {result.get('action_name', 'N/A')}\n"
                results_summary += f"- Objet: {result.get('object_name', 'N/A')}\n"
                results_summary += f"- Timestamp: {result.get('event_timestamp', 'N/A')}\n\n"
            
            if results_count > 5:
                results_summary += f"... et {results_count - 5} autres résultats.\n\n"
        
        elif "analysis_type" in audit_results:
            # Résultats d'analyse spécialisée
            results_summary = f"Analyse {audit_results['analysis_type']} effectuée.\n"
            if "summary" in audit_results:
                for key, value in audit_results["summary"].items():
                    results_summary += f"- {key}: {value}\n"
        
        context = f"""
        Question de l'utilisateur: {message}
        
        Analyse effectuée:
        - Type d'intention: {analysis.intent}
        - Entités détectées: {analysis.entities}
        - Filtres appliqués: {analysis.suggested_filters}
        
        Résultats de l'audit:
        {results_summary}
        
        Vous êtes un expert en audit de bases de données. 
        Analysez ces résultats et fournissez une réponse claire et détaillée en français.
        Incluez des insights pertinents et des recommandations si approprié.
        Si aucun résultat n'est trouvé, suggérez des alternatives ou des clarifications.
        """
        
        return context
    
    async def _generate_openai_response(self, context: str) -> str:
        """Générer une réponse avec OpenAI"""
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "Vous êtes un assistant expert en audit de bases de données. Répondez toujours en français de manière professionnelle et claire."
                    },
                    {
                        "role": "user",
                        "content": context
                    }
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Erreur OpenAI: {e}")
            return "Je rencontre des difficultés pour générer une réponse détaillée. Pouvez-vous reformuler votre question ?"
    
    async def get_chat_suggestions(self, partial_message: str) -> List[str]:
        """Obtenir des suggestions de complétion pour un message partiel"""
        try:
            # Trouver des questions similaires
            similar = self.nlp_service.find_similar_questions(partial_message, limit=5)
            
            # Obtenir les questions fréquentes
            frequent = await QuestionStatsService.get_frequent_questions(limit=5)
            
            # Combiner et filtrer les suggestions
            suggestions = []
            
            # Ajouter les questions similaires
            for q in similar:
                if q["similarity"] > 0.3:
                    suggestions.append(q["question"])
            
            # Ajouter les questions fréquentes si pas assez de similaires
            if len(suggestions) < 3:
                for q in frequent:
                    if q["question"] not in suggestions:
                        suggestions.append(q["question"])
                        if len(suggestions) >= 5:
                            break
            
            return suggestions[:5]
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération de suggestions: {e}")
            return []

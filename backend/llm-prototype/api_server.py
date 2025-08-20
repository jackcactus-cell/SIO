"""
Serveur API FastAPI pour les services LLM d'audit Oracle
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
from loguru import logger

from audit_llm_service import audit_llm_service, AuditEvent

# Configuration du logger
logger.add("llm_api.log", rotation="1 day", level="INFO")

app = FastAPI(
    title="Oracle Audit LLM API",
    description="API pour l'analyse intelligente des logs d'audit Oracle",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles Pydantic
class QuestionRequest(BaseModel):
    question: str
    log_id: Optional[str] = None

class QuestionResponse(BaseModel):
    success: bool
    answer: str
    confidence: float
    analysis_type: str
    sources: List[Dict[str, Any]]
    # Champs additionnels pour un rendu UI enrichi (compatibilité ascendante)
    type: Optional[str] = None
    data: Optional[Any] = None
    columns: Optional[List[str]] = None
    summary: Optional[str] = None
    interpretation: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class UploadResponse(BaseModel):
    success: bool
    message: str
    log_id: Optional[str] = None
    events_count: int = 0
    summary: Optional[str] = None
    error: Optional[str] = None

class PatternAnalysisResponse(BaseModel):
    success: bool
    patterns: Dict[str, Any]
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    vector_db_ready: bool
    version: str

@app.get("/", response_model=HealthResponse)
async def health_check():
    """Vérification de l'état du service"""
    try:
        return HealthResponse(
            status="healthy",
            model_loaded=audit_llm_service.model is not None,
            vector_db_ready=audit_llm_service.vectorization_service.collection is not None,
            version="1.0.0"
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            model_loaded=False,
            vector_db_ready=False,
            version="1.0.0"
        )

@app.post("/api/upload-logs", response_model=UploadResponse)
async def upload_logs(file: UploadFile = File(...)):
    """
    Upload et traitement d'un fichier de logs Oracle
    """
    try:
        logger.info(f"Processing log upload: {file.filename}")
        
        # Lire le contenu du fichier
        content = await file.read()
        log_content = content.decode('utf-8')
        
        # Traiter les logs
        result = audit_llm_service.process_log_upload(log_content)
        
        # Parser pour extraire les informations
        events = audit_llm_service.log_parser.parse_log_content(log_content)
        
        return UploadResponse(
            success=True,
            message=result,
            log_id=f"log_{len(events)}_{hash(log_content) % 10000}",
            events_count=len(events),
            summary=audit_llm_service._generate_summary(events) if events else None
        )
        
    except Exception as e:
        logger.error(f"Error uploading logs: {e}")
        return UploadResponse(
            success=False,
            message="Erreur lors du traitement du fichier",
            error=str(e)
        )

@app.post("/api/ask-llm", response_model=QuestionResponse)
async def ask_llm(request: QuestionRequest):
    """
    Poser une question sur les logs d'audit
    """
    try:
        logger.info(f"Processing question: {request.question}")
        
        # Générer la réponse brute
        response = audit_llm_service.answer_question(
            question=request.question,
            log_id=request.log_id
        )

        # Détection de mots-clés pour structurer la sortie (table simple quand pertinent)
        q = request.question.lower().strip()
        columns: Optional[List[str]] = None
        data: Optional[Any] = None
        summary: Optional[str] = None
        msg_type: Optional[str] = None
        interpretation: Optional[Dict[str, Any]] = None

        is_count = any(k in q for k in ["combien", "nombre", "total", "count"])
        is_users = any(k in q for k in ["utilisateur", "user", "dbuser", "os_username"]) \
            or response.analysis_type in ["user_analysis", "user_count"]
        is_actions = any(k in q for k in ["action", "select", "insert", "update", "delete", "truncate"]) \
            or response.analysis_type == "action_analysis"
        is_schema = any(k in q for k in ["schéma", "schema", "objet", "table"]) \
            or response.analysis_type == "schema_analysis"
        is_time = any(k in q for k in ["heure", "temps", "fréquence", "quand"]) \
            or response.analysis_type == "time_analysis"
        is_security = any(k in q for k in ["sécurité", "suspect", "anomalie", "intrusion"]) \
            or response.analysis_type == "security_analysis"

        resp_data = getattr(response, 'data', None)
        if isinstance(resp_data, dict):
            if is_users and "top_users" in resp_data and isinstance(resp_data["top_users"], dict):
                columns = ["Utilisateur", "Actions"]
                data = [{"Utilisateur": k, "Actions": v} for k, v in resp_data["top_users"].items()]
                msg_type = "table"
                summary = response.answer
            elif is_actions and ("top_actions" in resp_data or any(k in resp_data for k in ["SELECT","INSERT","UPDATE","DELETE"])):
                columns = ["Action", "Occurrences"]
                action_counts = resp_data.get("top_actions", {k: resp_data.get(k) for k in ["SELECT","INSERT","UPDATE","DELETE"] if resp_data.get(k) is not None})
                action_counts = {k: v for k, v in action_counts.items() if v is not None}
                data = [{"Action": k, "Occurrences": v} for k, v in action_counts.items()]
                msg_type = "table"
                summary = response.answer
            elif is_schema and "top_schemas" in resp_data and isinstance(resp_data["top_schemas"], dict):
                columns = ["Schéma", "Accès"]
                data = [{"Schéma": k, "Accès": v} for k, v in resp_data["top_schemas"].items()]
                msg_type = "table"
                summary = response.answer
            elif is_time and ("hourly_activity" in resp_data or {"peak_hour", "peak_count"}.issubset(resp_data.keys())):
                columns = ["Heure", "Actions"]
                hourly = resp_data.get("hourly_activity", {})
                if not hourly and "peak_hour" in resp_data and "peak_count" in resp_data:
                    hourly = {str(resp_data["peak_hour"]): resp_data["peak_count"]}
                data = [{"Heure": str(h), "Actions": c} for h, c in hourly.items()]
                msg_type = "table"
                summary = response.answer
            elif is_security and "issues" in resp_data and isinstance(resp_data["issues"], list):
                columns = ["Problème"]
                data = [{"Problème": issue} for issue in resp_data["issues"]]
                msg_type = "table"
                summary = response.answer
            elif is_count and "total_events" in resp_data:
                columns = ["Indicateur", "Valeur"]
                data = [{"Indicateur": "Total événements", "Valeur": resp_data["total_events"]}]
                msg_type = "table"
                summary = response.answer

        interpretation = {
            "summary": response.answer,
            "insights": [],
            "recommendations": [],
            "anomalies": [],
            "trends": []
        }

        return QuestionResponse(
            success=True,
            answer=response.answer,
            confidence=response.confidence,
            analysis_type=response.analysis_type,
            sources=response.sources,
            type=msg_type or ("table" if columns and data else "text"),
            data=data,
            columns=columns,
            summary=summary or response.answer,
            interpretation=interpretation
        )
        
    except Exception as e:
        logger.error(f"Error generating answer: {e}")
        return QuestionResponse(
            success=False,
            answer="",
            confidence=0.0,
            analysis_type="error",
            sources=[],
            error=str(e)
        )

@app.post("/api/analyze-patterns", response_model=PatternAnalysisResponse)
async def analyze_patterns(log_content: str):
    """
    Analyser les patterns dans les logs
    """
    try:
        logger.info("Analyzing patterns in logs")
        
        # Parser les logs
        events = audit_llm_service.log_parser.parse_log_content(log_content)
        
        # Analyser les patterns
        patterns = audit_llm_service.analyze_patterns(events)
        
        return PatternAnalysisResponse(
            success=True,
            patterns=patterns
        )
        
    except Exception as e:
        logger.error(f"Error analyzing patterns: {e}")
        return PatternAnalysisResponse(
            success=False,
            patterns={},
            error=str(e)
        )

@app.get("/api/sample-questions")
async def get_sample_questions():
    """
    Retourne des exemples de questions d'audit
    """
    sample_questions = [
        "Quels sont les utilisateurs les plus actifs ?",
        "Combien d'opérations SELECT ont été effectuées ?",
        "Y a-t-il des activités suspectes ?",
        "Quels programmes clients sont les plus utilisés ?",
        "Combien d'actions destructives (DELETE, TRUNCATE) ont été détectées ?",
        "Quels schémas sont les plus consultés ?",
        "À quelles heures l'activité est-elle la plus élevée ?",
        "Y a-t-il des accès au schéma SYS ?",
        "Quels utilisateurs ont effectué des modifications ?",
        "Combien de sessions uniques sont enregistrées ?"
    ]
    
    return {
        "success": True,
        "questions": sample_questions,
        "categories": [
            "Utilisateurs et Sessions",
            "Actions et Requêtes", 
            "Sécurité et Anomalies",
            "Performance et Statistiques",
            "Objets et Schémas"
        ]
    }

@app.get("/api/question-templates")
async def get_question_templates():
    """
    Retourne les templates de questions disponibles
    """
    try:
        templates = audit_llm_service.question_template_service.templates
        return {
            "success": True,
            "templates": templates,
            "total_templates": len(templates),
            "categories": list(set([t["categorie"] for t in templates]))
        }
    except Exception as e:
        logger.error(f"Error getting question templates: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/model-info")
async def get_model_info():
    """
    Informations sur le modèle LLM utilisé
    """
    return {
        "success": True,
        "model_name": audit_llm_service.model_name,
        "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
        "vector_db": "ChromaDB",
        "features": [
            "Analyse d'audit Oracle",
            "Vectorisation des logs",
            "Recherche sémantique",
            "Détection d'anomalies",
            "Génération de réponses contextuelles"
        ]
    }

@app.get("/api/data-info")
async def get_data_info():
    """
    Informations sur les données actuellement disponibles
    """
    try:
        data_info = audit_llm_service.get_current_data_info()
        return {
            "success": True,
            "data_info": data_info
        }
    except Exception as e:
        logger.error(f"Error getting data info: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# Endpoints de test pour le développement
@app.post("/api/test-parse")
async def test_parse_logs(log_content: str):
    """
    Test du parsing de logs (développement uniquement)
    """
    try:
        events = audit_llm_service.log_parser.parse_log_content(log_content)
        
        return {
            "success": True,
            "events_count": len(events),
            "sample_events": [
                {
                    "timestamp": event.timestamp,
                    "os_username": event.os_username,
                    "db_username": event.db_username,
                    "action_name": event.action_name,
                    "object_name": event.object_name,
                    "object_schema": event.object_schema
                }
                for event in events[:5]  # Premiers 5 événements
            ]
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    logger.info("Starting Oracle Audit LLM API Server")
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    ) 
"""
Serveur API FastAPI simplifié pour les services LLM d'audit Oracle
Version sans les modèles lourds pour tests rapides
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import time
import logging
import os

try:
    from intelligent_llm_service import intelligent_audit_llm_service, AuditEvent
except ImportError:
    # Fallback vers le service offline si les dépendances ne sont pas disponibles
    from simple_offline_service import intelligent_audit_llm_service, AuditEvent
try:
    from file_processor import file_processor, ProcessedFileData
except ImportError:
    file_processor = None
    ProcessedFileData = None

from simple_file_processor import simple_file_processor, SimpleProcessedFileData
from oracle_audit_extractor import OracleAuditExtractor

# Configuration du logging
log_path = os.path.join(os.path.dirname(__file__), '..', '..', 'logs', 'llm_debug.log')
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_path),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Oracle Audit LLM API (Simple)",
    description="API simplifiée pour l'analyse intelligente des logs d'audit Oracle",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles Pydantic
class QuestionRequest(BaseModel):
    question: str
    log_id: Optional[str] = None
    logs: Optional[List[Dict[str, str]]] = None

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
    file_type: Optional[str] = None
    suggested_questions: Optional[List[str]] = None
    detected_patterns: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class PatternAnalysisResponse(BaseModel):
    success: bool
    patterns: Dict[str, Any]
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str

@app.get("/", response_model=HealthResponse)
async def health_check():
    """Vérification de l'état du service"""
    try:
        return HealthResponse(
            status="healthy",
            model_loaded=True,
            version="1.0.0-simple"
        )
    except Exception as e:
        return HealthResponse(
            status="unhealthy",
            model_loaded=False,
            version="1.0.0-simple"
        )

@app.post("/api/upload-logs", response_model=UploadResponse)
async def upload_logs(file: UploadFile = File(...)):
    """
    Upload et traitement d'un fichier de logs Oracle ou fichiers Excel/CSV/XLS
    """
    try:
        logger.info(f"Processing file upload: {file.filename}")
        
        # Lire le contenu du fichier
        content = await file.read()
        file_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
        
        # Déterminer le type de traitement
        if file_ext in ['csv', 'xlsx', 'xls', 'xlsm']:
            # Traitement Excel/CSV
            logger.info(f"Processing as Excel/CSV file: {file.filename}")
            try:
                # Essayer le processeur complet d'abord
                if file_processor is not None:
                    processed_data = file_processor.process_file(content, file.filename)
                else:
                    # Fallback vers le processeur simple
                    processed_data = simple_file_processor.process_file(content, file.filename)
            except Exception as e:
                logger.error(f"Error with full processor, trying simple processor: {e}")
                try:
                    # Fallback vers le processeur simple
                    processed_data = simple_file_processor.process_file(content, file.filename)
                except Exception as e2:
                    logger.error(f"Error with simple processor too: {e2}")
                    return UploadResponse(
                        success=False,
                        message=f"Erreur lors du traitement du fichier {file_ext.upper()}: {str(e2)}",
                        error=str(e2)
                    )
            
            # Stocker dans le service LLM pour les questions
            # Convertir en format compatible avec le service existant
            log_content = f"# Processed Excel/CSV file: {file.filename}\n"
            log_content += f"# Columns: {', '.join(processed_data.columns)}\n"
            log_content += f"# Rows: {processed_data.row_count}\n"
            
            # Ajouter un échantillon des données en format texte
            for i, row in enumerate(processed_data.data[:10]):  # Premier 10 lignes
                row_str = ", ".join([f"{k}={v}" for k, v in row.items()])
                log_content += f"Row {i+1}: {row_str}\n"
            
            result = intelligent_audit_llm_service.process_log_upload(log_content, file.filename)
            
            return UploadResponse(
                success=True,
                message=f"Fichier {file_ext.upper()} traité avec succès: {processed_data.row_count} lignes analysées",
                log_id=f"file_{processed_data.row_count}_{hash(str(processed_data.data)) % 10000}",
                events_count=processed_data.row_count,
                summary=processed_data.summary,
                file_type=processed_data.file_type,
                suggested_questions=processed_data.suggested_questions,
                detected_patterns=processed_data.detected_patterns
            )
            
        else:
            # Traitement traditionnel des logs texte
            logger.info(f"Processing as text log file: {file.filename}")
            log_content = content.decode('utf-8')
            
            # Traiter les logs
            result = intelligent_audit_llm_service.process_log_upload(log_content, file.filename)
            
            # Parser pour extraire les informations
            events = intelligent_audit_llm_service.log_parser.parse_log_content(log_content)
            
            return UploadResponse(
                success=True,
                message=result,
                log_id=f"log_{len(events)}_{hash(log_content) % 10000}",
                events_count=len(events),
                summary=intelligent_audit_llm_service._generate_intelligent_summary(events, intelligent_audit_llm_service._analyze_logs_intelligently(events)) if events else None,
                file_type=".txt"
            )
        
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        return UploadResponse(
            success=False,
            message=f"Erreur lors du traitement du fichier: {str(e)}",
            error=str(e)
        )

@app.post("/api/ask-llm", response_model=QuestionResponse)
async def ask_llm(request: QuestionRequest):
    """
    Poser une question sur les logs d'audit
    """
    try:
        logger.info(f"Processing question: {request.question}")
        
        # Simuler un délai de traitement
        time.sleep(1)
        
        # Traiter les logs si fournis
        if request.logs:
            logger.info(f"Processing {len(request.logs)} logs from request")
            for i, log_data in enumerate(request.logs):
                logger.info(f"Processing log {i+1}: {log_data.get('name', 'Unknown')}")
                intelligent_audit_llm_service.process_log_upload(log_data['content'], log_data['name'])
        else:
            logger.warning("No logs provided in request")
        
        logger.info(f"Available logs in service: {list(intelligent_audit_llm_service.uploaded_logs.keys())}")
        
        # Générer la réponse brute
        response = intelligent_audit_llm_service.answer_question(
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

        # Heuristiques simples de catégorisation
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

        # Mapper le dictionnaire data de la réponse vers tableaux simples quand possible
        resp_data = getattr(response, 'data', None)
        if isinstance(resp_data, dict):
            # Cas utilisateurs
            if is_users and "top_users" in resp_data and isinstance(resp_data["top_users"], dict):
                columns = ["Utilisateur", "Actions"]
                data = [
                    {"Utilisateur": k, "Actions": v} for k, v in resp_data["top_users"].items()
                ]
                msg_type = "table"
                summary = response.answer

            # Cas actions
            elif is_actions and ("top_actions" in resp_data or any(k in resp_data for k in ["SELECT","INSERT","UPDATE","DELETE"])):
                columns = ["Action", "Occurrences"]
                action_counts = resp_data.get("top_actions", {k: resp_data.get(k) for k in ["SELECT","INSERT","UPDATE","DELETE"] if resp_data.get(k) is not None})
                action_counts = {k: v for k, v in action_counts.items() if v is not None}
                data = [
                    {"Action": k, "Occurrences": v} for k, v in action_counts.items()
                ]
                msg_type = "table"
                summary = response.answer

            # Cas schémas
            elif is_schema and "top_schemas" in resp_data and isinstance(resp_data["top_schemas"], dict):
                columns = ["Schéma", "Accès"]
                data = [
                    {"Schéma": k, "Accès": v} for k, v in resp_data["top_schemas"].items()
                ]
                msg_type = "table"
                summary = response.answer

            # Cas temporel
            elif is_time and ("hourly_activity" in resp_data or {"peak_hour", "peak_count"}.issubset(resp_data.keys())):
                columns = ["Heure", "Actions"]
                hourly = resp_data.get("hourly_activity", {})
                # fallback si seulement pic
                if not hourly and "peak_hour" in resp_data and "peak_count" in resp_data:
                    hourly = {str(resp_data["peak_hour"]): resp_data["peak_count"]}
                data = [
                    {"Heure": str(h), "Actions": c} for h, c in hourly.items()
                ]
                msg_type = "table"
                summary = response.answer

            # Cas sécurité
            elif is_security and "issues" in resp_data and isinstance(resp_data["issues"], list):
                columns = ["Problème"]
                data = [{"Problème": issue} for issue in resp_data["issues"]]
                msg_type = "table"
                summary = response.answer

            # Cas total simple
            elif is_count and "total_events" in resp_data:
                columns = ["Indicateur", "Valeur"]
                data = [{"Indicateur": "Total événements", "Valeur": resp_data["total_events"]}]
                msg_type = "table"
                summary = response.answer

        # Construire une petite interprétation standardisée
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
        events = intelligent_audit_llm_service.log_parser.parse_log_content(log_content)
        
        # Analyser les patterns
        patterns = intelligent_audit_llm_service._analyze_logs_intelligently(events)
        
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
    Retourne des exemples de questions d'audit Oracle
    """
    sample_questions = intelligent_audit_llm_service.get_sample_questions()
    
    return {
        "success": True,
        "questions": sample_questions,
        "categories": [
            "Questions générales sur les données",
            "Utilisateurs et Sessions",
            "Actions spécifiques",
            "Schémas et Objets",
            "Horaires et Fréquence",
            "Connexions (LOGON)",
            "Adresses IP et Réseaux",
            "Rôles et Privilèges",
            "Schémas Applicatifs",
            "Actions de Maintenance",
            "Procédures et Fonctions",
            "Index",
            "Batchs et Automatisation",
            "Applications Spécifiques",
            "Schémas Système",
            "Schémas Temporaires",
            "Schémas Utilisateur",
            "Schémas de Production"
        ]
    }

@app.get("/api/model-info")
async def get_model_info():
    """
    Informations sur le modèle LLM utilisé
    """
    return {
        "success": True,
        "model_name": "Simple LLM Service",
        "embedding_model": "None (Simple Mode)",
        "vector_db": "None (Simple Mode)",
        "features": [
            "Analyse d'audit Oracle (Mode Simple)",
            "Parsing de logs",
            "Classification de questions",
            "Détection d'anomalies",
            "Génération de réponses simulées"
        ]
    }

@app.post("/api/test-parse")
async def test_parse_logs(log_content: str):
    """
    Test du parsing de logs (développement uniquement)
    """
    try:
        events = intelligent_audit_llm_service.log_parser.parse_log_content(log_content)
        
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

@app.post("/api/clear-logs")
async def clear_logs():
    """
    Vide tous les logs stockés dans le service
    """
    try:
        logger.info("Clearing all uploaded logs")
        intelligent_audit_llm_service.uploaded_logs.clear()
        intelligent_audit_llm_service.log_analyses.clear()
        
        return {
            "success": True,
            "message": "Tous les logs ont été supprimés"
        }
        
    except Exception as e:
        logger.error(f"Error clearing logs: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/logs-status")
async def get_logs_status():
    """
    Retourne l'état des logs stockés dans le service
    """
    try:
        logs_info = intelligent_audit_llm_service.get_stored_logs_info()
        logger.info(f"Logs status requested: {logs_info}")
        
        return {
            "success": True,
            "logs_info": logs_info
        }
        
    except Exception as e:
        logger.error(f"Error getting logs status: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/api/oracle/extract-audit")
async def extract_oracle_audit(
    oracle_host: str,
    oracle_port: int = 1521,
    oracle_service: str = "XE",
    oracle_user: str = "audit_user",
    oracle_password: str = "password",
    mongo_uri: str = "mongodb://mongodb:27017",
    days_back: int = 7,
    audit_type: str = "all"
):
    """
    Extraire les données Oracle Audit Trail vers MongoDB
    """
    try:
        logger.info(f"Starting Oracle audit extraction for {days_back} days")
        
        # Vérifier si les dépendances Oracle sont disponibles
        try:
            from oracle_audit_extractor import OracleAuditExtractor
        except ImportError as ie:
            return {
                "success": False,
                "error": f"Dépendances Oracle manquantes: {str(ie)}",
                "message": "L'extraction Oracle nécessite oracledb et motor. Installez-les avec: pip install oracledb motor"
            }
        
        oracle_config = {
            'host': oracle_host,
            'port': oracle_port,
            'service_name': oracle_service,
            'username': oracle_user,
            'password': oracle_password
        }
        
        # Calculer les dates
        from datetime import datetime, timedelta
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        # Initialiser l'extracteur
        extractor = OracleAuditExtractor(oracle_config, mongo_uri)
        await extractor.initialize()
        
        try:
            # Extraction
            stats = await extractor.extract_audit_data(start_date, end_date, audit_type)
            
            # Statistiques MongoDB
            db_stats = await extractor.get_extraction_stats()
            
            return {
                "success": True,
                "message": f"Extraction terminée: {stats['total_extracted']} enregistrements",
                "extraction_stats": stats,
                "database_stats": db_stats,
                "period": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "days": days_back
                }
            }
            
        finally:
            await extractor.cleanup()
        
    except Exception as e:
        logger.error(f"Error in Oracle audit extraction: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Erreur lors de l'extraction des données Oracle"
        }

@app.get("/api/oracle/stats")
async def get_oracle_stats(mongo_uri: str = "mongodb://mongodb:27017"):
    """
    Obtenir les statistiques des données Oracle dans MongoDB
    """
    try:
        # Vérifier si les dépendances Oracle sont disponibles
        try:
            from oracle_audit_extractor import OracleAuditExtractor
        except ImportError as ie:
            return {
                "success": False,
                "error": f"Dépendances Oracle manquantes: {str(ie)}",
                "message": "Les statistiques Oracle nécessitent motor. Installez avec: pip install motor"
            }
        
        oracle_config = {}  # Pas besoin pour les stats
        extractor = OracleAuditExtractor(oracle_config, mongo_uri)
        await extractor.initialize()
        
        try:
            stats = await extractor.get_extraction_stats()
            return {
                "success": True,
                "stats": stats
            }
        finally:
            await extractor.cleanup()
            
    except Exception as e:
        logger.error(f"Error getting Oracle stats: {e}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    print("🚀 Starting Simple Oracle Audit LLM API Server")
    print("📡 Server accessible on http://localhost:8001")
    print("📚 Documentation: http://localhost:8001/docs")
    print("⏹️  Press Ctrl+C to stop")
    
    uvicorn.run(
        "simple_api_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    ) 
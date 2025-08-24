"""Application FastAPI principale"""
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi import Body
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger

# Imports locaux
from config import settings
from database import db_manager
from models import (
    ChatMessage, ChatResponse,
    AuditQuery, AuditAction, QueryAnalysis, TrendAnalysis, AnomalyDetection, QuestionStats
)
## Suppression des imports liés à l'authentification
from openai_service import OpenAIService
from nlp_service import NLPService, AuditAnalysisService
from cache_service import CacheService, QuestionStatsService
import csv
from pathlib import Path
import asyncio
import json

try:
    import oracledb  # type: ignore
except Exception:
    oracledb = None  # fallback si non installé

from oracle_pool import oracle_pool, OraclePoolConfig


# Configuration des logs
logger.add(
    settings.log_file,
    rotation="1 day",
    retention="30 days",
    level=settings.log_level,
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestionnaire de cycle de vie de l'application"""
    # Démarrage
    logger.info("Démarrage de l'application SIO Audit Backend")
    
    # Connexion aux bases de données
    mongodb_connected = await db_manager.connect_mongodb()
    sqlite_connected = db_manager.connect_sqlite()
    
    if not mongodb_connected:
        logger.error("Impossible de se connecter à MongoDB")
    if not sqlite_connected:
        logger.error("Impossible de se connecter à SQLite")
    
    # Nettoyage périodique du cache
    await CacheService.cleanup_old_cache()
    
    # Initialisation optionnelle du pool Oracle si les paramètres sont présents
    try:
        if settings.oracle_host and settings.oracle_username and settings.oracle_password and settings.oracle_service_name and oracle_pool.is_available:
            pool_config = OraclePoolConfig(
                host=settings.oracle_host,
                port=settings.oracle_port,
                service_name=settings.oracle_service_name,
                username=settings.oracle_username,
                password=settings.oracle_password,
                driver_mode=settings.oracle_driver_mode,
                min_sessions=1,
                max_sessions=10,
                increment=1,
                connection_timeout_seconds=30,
            )
            initialized = oracle_pool.init_pool(pool_config)
            if initialized:
                logger.info("Pool Oracle initialisé au démarrage de l'application")
            else:
                logger.warning("Pool Oracle non initialisé (paramètres présents mais connexion échouée)")
        else:
            logger.info("Paramètres Oracle non fournis ou module indisponible, pool non initialisé")
    except Exception as e:
        logger.warning(f"Échec d'initialisation du pool Oracle au démarrage: {e}")
    
    yield
    
    # Arrêt
    logger.info("Arrêt de l'application")
    await db_manager.close_connections()


# Création de l'application FastAPI
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend Python pour l'application d'audit SIO avec chatbot intelligent",
    lifespan=lifespan
)
# =========================================================================
# ORACLE: Configuration dynamique (en mémoire, optionnellement persistable)
# =========================================================================

_oracle_runtime_config: dict[str, any] = {}

@app.post("/api/oracle/config/save")
async def oracle_config_save(config: Dict[str, Any]):
    required = ["host", "port", "serviceName", "username", "password", "driverMode"]
    if not all(k in config and config[k] for k in required):
        return JSONResponse(status_code=400, content={"success": False, "error": "Paramètres manquants"})
    # Sauvegarde en mémoire
    _oracle_runtime_config.update(config)
    try:
        pool_config = OraclePoolConfig(
            host=config["host"],
            port=int(config["port"]),
            service_name=config["serviceName"],
            username=config["username"],
            password=config["password"],
            driver_mode=config.get("driverMode", "thin"),
        )
        ok = oracle_pool.init_pool(pool_config)
        return {"success": ok, "message": "Pool initialisé" if ok else "Pool non initialisé"}
    except Exception as e:
        logger.error(f"Erreur init pool depuis config: {e}")
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


@app.get("/api/oracle/config/get")
async def oracle_config_get():
    return {"success": True, "config": _oracle_runtime_config, "pool": oracle_pool.stats()}


# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_service = OpenAIService()
nlp_service = NLPService()



# =========================================================================
# ENDPOINTS SANS AUTHENTIFICATION
# =========================================================================

@app.post("/api/chat/message", response_model=ChatResponse)
async def send_chat_message(message: ChatMessage):
    """Envoyer un message au chatbot"""
    try:
        response = await openai_service.process_chat_message(message.message, None)
        logger.info(f"Message traité: {message.message[:50]}...")
        return response
    except Exception as e:
        logger.error(f"Erreur lors du traitement du message: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors du traitement du message")


@app.post("/api/chatbot")
async def chatbot_endpoint(request: Dict[str, Any]):
    """Endpoint compatible avec le frontend - traite les questions du chatbot"""
    try:
        question = request.get("question", "")
        if not question:
            return {"type": "error", "data": "Question vide", "summary": "Erreur: aucune question fournie"}
        
        # Traitement de la question avec OpenAI
        response = await openai_service.process_chat_message(question, None)
        
        # Formatage de la réponse pour le frontend
        if hasattr(response, 'type') and response.type:
            return {
                "type": response.type,
                "data": response.data if hasattr(response, 'data') else response.message,
                "summary": response.summary if hasattr(response, 'summary') else None,
                "explanation": response.explanation if hasattr(response, 'explanation') else None,
                "columns": response.columns if hasattr(response, 'columns') else None
            }
        else:
            return {
                "type": "message",
                "data": response.message if hasattr(response, 'message') else str(response),
                "summary": "Réponse du chatbot"
            }
            
    except Exception as e:
        logger.error(f"Erreur dans l'endpoint chatbot: {e}")
        return {
            "type": "error",
            "data": f"Erreur lors du traitement: {str(e)}",
            "summary": "Une erreur est survenue lors du traitement de votre question"
        }


@app.get("/api/chat/suggestions")
async def get_chat_suggestions(partial_message: str):
    """Obtenir des suggestions de complétion pour un message"""
    try:
        suggestions = await openai_service.get_chat_suggestions(partial_message)
        return {"suggestions": suggestions}
    except Exception as e:
        logger.error(f"Erreur lors de la génération de suggestions: {e}")
        return {"suggestions": []}


@app.get("/api/chat/frequent-questions")
async def get_frequent_questions(limit: int = 10):
    """Obtenir les questions les plus fréquentes"""
    try:
        questions = await QuestionStatsService.get_frequent_questions(limit)
        return {"questions": questions}
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des questions fréquentes: {e}")
        return {"questions": []}


@app.post("/api/audit/analyze", response_model=Dict[str, Any])
async def analyze_audit_query(query: str):
    """Analyser une requête d'audit avec NLP"""
    try:
        analysis = nlp_service.analyze_question(query)
        return analysis.dict()
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse de la requête: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'analyse")


@app.get("/api/audit/user-activity")
async def get_user_activity_analysis(timeframe: Optional[str] = "24h", user_filter: Optional[str] = None):
    """Analyser l'activité des utilisateurs"""
    try:
        filters = {}
        if user_filter:
            filters["user"] = user_filter
        if timeframe:
            now = datetime.utcnow()
            if timeframe == "1h":
                start_time = now - timedelta(hours=1)
            elif timeframe == "24h":
                start_time = now - timedelta(days=1)
            elif timeframe == "7d":
                start_time = now - timedelta(days=7)
            else:
                start_time = now - timedelta(days=1)
            filters["timeframe"] = {"start": start_time, "end": now}
        results = await AuditAnalysisService.analyze_user_activity(filters)
        return results
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse d'activité utilisateur: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'analyse")


@app.get("/api/audit/anomalies")
async def detect_audit_anomalies(timeframe: str = "24h"):
    """Détecter les anomalies dans les données d'audit"""
    try:
        results = await AuditAnalysisService.detect_anomalies(timeframe)
        return results
    except Exception as e:
        logger.error(f"Erreur lors de la détection d'anomalies: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la détection")


@app.get("/api/audit/search")
async def search_audit_logs(
    query: Optional[str] = None,
    user: Optional[str] = None,
    action: Optional[str] = None,
    object_name: Optional[str] = None,
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
    limit: int = 100
):
    """Rechercher dans les logs d'audit"""
    try:
        collection = db_manager.get_mongodb_collection("actions_audit")
        filters = {}
        if user:
            filters["os_username"] = {"$regex": user, "$options": "i"}
        if action:
            filters["action_name"] = action.upper()
        if object_name:
            filters["object_name"] = {"$regex": object_name, "$options": "i"}
        if date_start and date_end:
            filters["event_timestamp"] = {"$gte": date_start, "$lte": date_end}
        results = []
        async for doc in collection.find(filters).limit(limit):
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return {
            "results": results,
            "count": len(results),
            "filters_applied": filters
        }
    except Exception as e:
        logger.error(f"Erreur lors de la recherche d'audit: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la recherche")


@app.get("/api/cache/stats")
async def get_cache_statistics():
    """Obtenir les statistiques du cache"""
    try:
        stats = await CacheService.get_cache_stats()
        return stats
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des stats de cache: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des statistiques")


@app.get("/api/cache/actions")
async def get_action_statistics(timeframe: str = "24h"):
    """Obtenir les statistiques des actions"""
    try:
        stats = await CacheService.get_action_stats(timeframe)
        return stats
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des stats d'actions: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des statistiques")


@app.post("/api/cache/cleanup")
async def cleanup_cache(background_tasks: BackgroundTasks, max_age_days: int = 30):
    """Nettoyer le cache (tâche en arrière-plan)"""
    try:
        background_tasks.add_task(CacheService.cleanup_old_cache, max_age_days)
        return {"message": f"Nettoyage du cache programmé (>{max_age_days} jours)"}
    except Exception as e:
        logger.error(f"Erreur lors du nettoyage du cache: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors du nettoyage")


# =========================================================================
# ORACLE: Connexion et AWR
# =========================================================================

@app.post("/api/oracle/test-connection")
async def oracle_test_connection(
    host: str = Body(...),
    port: int = Body(...),
    service_name: str = Body(...),
    username: str = Body(...),
    password: str = Body(...),
    driver_mode: str = Body("thin")  # thin par défaut; thick si Instant Client installé
):
    """Teste une connexion Oracle simple (SELECT 1 FROM dual)."""
    if oracledb is None:
        return JSONResponse(status_code=500, content={
            "success": False,
            "error": "Le module oracledb n'est pas installé. Faites: pip install oracledb"
        })

    try:
        if driver_mode == "thick":
            try:
                oracledb.init_oracle_client()  # s'il est déjà initialisé, ignore
            except Exception:
                pass

        dsn = f"(description=(address=(protocol=TCP)(host={host})(port={port}))(connect_data=(service_name={service_name})))"
        with oracledb.connect(user=username, password=password, dsn=dsn) as connection:
            with connection.cursor() as cursor:
                cursor.execute("select 1 from dual")
                row = cursor.fetchone()
                ok = bool(row and row[0] == 1)
        # Pré-initialiser le pool pour cette connexion (optionnel)
        try:
            pool_config = OraclePoolConfig(
                host=host,
                port=port,
                service_name=service_name,
                username=username,
                password=password,
                driver_mode=driver_mode,
            )
            oracle_pool.init_pool(pool_config)
        except Exception:
            pass
        return {"success": ok, "message": "Connexion Oracle OK" if ok else "Échec de la requête test"}
    except Exception as e:
        logger.error(f"Oracle test connection error: {e}")
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


@app.post("/api/oracle/init-pool")
async def oracle_init_pool(
    host: str = Body(...),
    port: int = Body(...),
    service_name: str = Body(...),
    username: str = Body(...),
    password: str = Body(...),
    driver_mode: str = Body("thin"),
    min_sessions: int = Body(1),
    max_sessions: int = Body(5),
    increment: int = Body(1)
):
    """Initialise le pool de connexions Oracle."""
    if oracledb is None:
        return JSONResponse(status_code=500, content={
            "success": False,
            "error": "Le module oracledb n'est pas installé. Faites: pip install oracledb"
        })

    try:
        pool_config = OraclePoolConfig(
            host=host,
            port=port,
            service_name=service_name,
            username=username,
            password=password,
            driver_mode=driver_mode,
            min_sessions=min_sessions,
            max_sessions=max_sessions,
            increment=increment,
        )
        
        success = oracle_pool.init_pool(pool_config)
        if success:
            return {"success": True, "message": "Pool Oracle initialisé avec succès"}
        else:
            return JSONResponse(status_code=500, content={
                "success": False,
                "error": "Échec d'initialisation du pool Oracle"
            })
    except Exception as e:
        logger.error(f"Oracle pool init error: {e}")
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


@app.get("/api/oracle/pool-stats")
async def oracle_pool_stats():
    """Retourne les statistiques du pool de connexions Oracle."""
    try:
        stats = oracle_pool.stats()
        return {
            "is_initialized": oracle_pool.is_initialized,
            "is_available": oracle_pool.is_available,
            "stats": stats
        }
    except Exception as e:
        logger.error(f"Oracle pool stats error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/api/oracle/awr/snapshots")
async def oracle_awr_snapshots(limit: int = 100):
    """Expose les snapshots AWR du CSV fourni pour alimenter le dashboard."""
    csv_path = Path(__file__).resolve().parents[1] / "SIO" / "awr_snapshots_20250803_082257.csv"
    # alternative si l'app est lancée depuis backend_python
    if not csv_path.exists():
        csv_path = Path(__file__).resolve().parents[0].parent / "SIO" / "awr_snapshots_20250803_082257.csv"
    if not csv_path.exists():
        # tenter chemin relatif à la racine projet connue
        csv_path = Path(__file__).resolve().parents[1] / "awr_snapshots_20250803_082257.csv"

    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="Fichier AWR CSV introuvable")

    try:
        items = []
        with csv_path.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                items.append({
                    "snap_id": int(row.get("SNAP_ID", "0") or 0),
                    "begin": row.get("BEGIN_INTERVAL_TIME"),
                    "end": row.get("END_INTERVAL_TIME")
                })
                if len(items) >= limit:
                    break
        return {"count": len(items), "items": items}
    except Exception as e:
        logger.error(f"Lecture AWR CSV échouée: {e}")
        raise HTTPException(status_code=500, detail="Impossible de lire le CSV AWR")


@app.post("/api/oracle/execute-sql")
async def oracle_execute_sql(
    query: str = Body(..., embed=True),
    host: str | None = Body(None),
    port: int | None = Body(None),
    service_name: str | None = Body(None),
    username: str | None = Body(None),
    password: str | None = Body(None),
    driver_mode: str = Body("thin"),
    max_rows: int = Body(1000),
    timeout_seconds: int = Body(30),
):
    """Exécute une requête SQL Oracle de lecture (SELECT) et retourne les lignes.

    Si les paramètres de connexion ne sont pas fournis, utilise ceux de la configuration.
    """
    if oracledb is None:
        return JSONResponse(status_code=500, content={
            "status": "error",
            "message": "Le module oracledb n'est pas installé. Faites: pip install oracledb"
        })

    try:
        # Paramètres par défaut depuis settings
        host = host or settings.oracle_host
        port = port or settings.oracle_port
        service_name = service_name or settings.oracle_service_name
        username = username or settings.oracle_username
        password = password or settings.oracle_password
        driver_mode = driver_mode or settings.oracle_driver_mode

        if not (host and port and service_name and username and password):
            return JSONResponse(status_code=400, content={
                "status": "error",
                "message": "Paramètres de connexion Oracle incomplets"
            })

        # Sécurité simple: empêcher les DML/DDL non désirées via cet endpoint
        normalized = query.strip().lower()
        if not normalized.startswith("select"):
            return JSONResponse(status_code=400, content={
                "status": "error",
                "message": "Seules les requêtes SELECT sont autorisées via cet endpoint"
            })

        # Utiliser le pool si initialisé, sinon tentative d'initialisation ad-hoc
        if not oracle_pool.is_initialized:
            pool_config = OraclePoolConfig(
                host=host,
                port=port,
                service_name=service_name,
                username=username,
                password=password,
                driver_mode=driver_mode,
            )
            oracle_pool.init_pool(pool_config)

        column_names, data = oracle_pool.execute_select(query, max_rows=max_rows)

        return {
            "status": "success",
            "data": data,
            "columns": column_names,
            "rowCount": len(data)
        }
    except Exception as e:
        logger.error(f"Oracle execute SQL error: {e}")
        return JSONResponse(status_code=500, content={
            "status": "error",
            "message": str(e)
        })


# =========================================================================
# ORACLE: Statut du pool et SSE pour métriques simples
# =========================================================================

@app.get("/api/oracle/pool-status")
async def oracle_pool_status():
    try:
        return oracle_pool.stats()
    except Exception as e:
        return {"initialized": False, "available": False, "error": str(e)}


@app.get("/api/oracle/metrics/stream")
async def oracle_metrics_stream():
    async def event_generator():
        while True:
            stats = oracle_pool.stats()
            try:
                payload = json.dumps(stats)
            except Exception:
                payload = "{}"
            yield f"data: {payload}\n\n"
            await asyncio.sleep(2)

    headers = {"Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive"}
    return StreamingResponse(event_generator(), headers=headers)


@app.get("/api/health")
async def health_check():
    """Vérification de l'état de santé de l'application"""
    try:
        mongodb_status = "connected" if db_manager.mongodb_client else "disconnected"
        sqlite_status = "connected" if db_manager.sqlite_conn else "disconnected"
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": settings.app_version,
            "databases": {
                "mongodb": mongodb_status,
                "sqlite": sqlite_status
            }
        }
    except Exception as e:
        logger.error(f"Erreur lors du health check: {e}")
        raise HTTPException(status_code=500, detail="Service unhealthy")


@app.get("/api/info")
async def get_app_info():
    """Obtenir les informations de l'application"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "description": "Backend Python pour l'application d'audit SIO",
        "endpoints": {
            "chat": ["/api/chat/message", "/api/chat/suggestions", "/api/chat/frequent-questions"],
            "audit": ["/api/audit/analyze", "/api/audit/user-activity", "/api/audit/anomalies", "/api/audit/search"],
            "cache": ["/api/cache/stats", "/api/cache/actions", "/api/cache/cleanup"],
            "system": ["/api/health", "/api/info"]
        }
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.warning(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return {"error": exc.detail, "status_code": exc.status_code}


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Erreur non gérée: {str(exc)}")
    return {"error": "Erreur interne du serveur", "status_code": 500}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )

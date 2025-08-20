from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from loguru import logger

from oracle_pool import OraclePoolManager, OraclePoolConfig, oracle_pool

app = FastAPI(title="Oracle Connectivity API", version="1.0.0")

class InitRequest(BaseModel):
    host: str
    port: int
    service_name: str
    username: str
    password: str
    driver_mode: str = "thin"
    min_sessions: int = 1
    max_sessions: int = 5
    increment: int = 1

class SelectRequest(BaseModel):
    query: str
    max_rows: int = 1000

@app.get("/health")
async def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "oracledb_available": oracle_pool.is_available,
        "pool_initialized": oracle_pool.is_initialized,
    }

@app.post("/init")
async def init_pool(req: InitRequest) -> Dict[str, Any]:
    cfg = OraclePoolConfig(
        host=req.host,
        port=req.port,
        service_name=req.service_name,
        username=req.username,
        password=req.password,
        driver_mode=req.driver_mode,
        min_sessions=req.min_sessions,
        max_sessions=req.max_sessions,
        increment=req.increment,
    )
    ok = oracle_pool.init_pool(cfg)
    if not ok:
        raise HTTPException(status_code=500, detail="Échec d'initialisation du pool Oracle")
    return {"status": "initialized", "stats": oracle_pool.stats()}

@app.get("/pool-stats")
async def pool_stats() -> Dict[str, Any]:
    return oracle_pool.stats()

@app.get("/ping")
async def ping() -> Dict[str, Any]:
    try:
        if not oracle_pool.is_initialized:
            raise RuntimeError("Pool Oracle non initialisé")
        with oracle_pool.acquire() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM dual")
                row = cur.fetchone()
        return {"status": "ok", "result": row[0] if row else None}
    except Exception as e:
        logger.error(f"Ping Oracle failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/select")
async def select(req: SelectRequest) -> Dict[str, Any]:
    try:
        cols, data = oracle_pool.execute_select(req.query, req.max_rows)
        return {"status": "ok", "columns": cols, "rows": data}
    except Exception as e:
        logger.error(f"Select failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))




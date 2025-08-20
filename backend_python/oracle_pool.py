"""Gestionnaire de pool Oracle robuste (thin/thick) avec retries.

Exposes a singleton-like OraclePoolManager to initialize a session pool and
provide helper methods to acquire connections and execute read-only queries.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple, Iterable
from dataclasses import dataclass

from loguru import logger

try:
    import oracledb  # type: ignore
except Exception:
    oracledb = None  # type: ignore

try:
    from config import settings  # type: ignore
except Exception:  # pragma: no cover
    settings = None  # type: ignore

try:
    from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
except Exception:
    # Fallback no-op decorators if tenacity is not installed (should be installed via requirements)
    def retry(*args, **kwargs):  # type: ignore
        def deco(fn):
            return fn
        return deco

    def stop_after_attempt(*args, **kwargs):  # type: ignore
        return None

    def wait_exponential(*args, **kwargs):  # type: ignore
        return None

    def retry_if_exception_type(*args, **kwargs):  # type: ignore
        return None


@dataclass
class OraclePoolConfig:
    host: str
    port: int
    service_name: str
    username: str
    password: str
    driver_mode: str = "thin"  # "thin" or "thick"
    min_sessions: int = 1
    max_sessions: int = 10
    increment: int = 1
    connection_timeout_seconds: int = 30


class OraclePoolManager:
    """Gère un pool Oracle partagé pour l'application FastAPI.

    - Initialise le client (thick) si demandé
    - Crée un pool de sessions réutilisable
    - Fournit des helpers pour exécuter des requêtes en lecture
    """

    def __init__(self) -> None:
        self._pool: Optional["oracledb.ConnectionPool"] = None
        self._initialized: bool = False
        self._config: Optional[OraclePoolConfig] = None

    @property
    def is_available(self) -> bool:
        return bool(oracledb is not None)

    @property
    def is_initialized(self) -> bool:
        return self._initialized and self._pool is not None

    def init_pool(self, config: OraclePoolConfig) -> bool:
        if not self.is_available:
            logger.error("Le module oracledb n'est pas disponible")
            return False

        if self.is_initialized:
            return True

        try:
            if config.driver_mode == "thick":
                try:
                    oracledb.init_oracle_client()
                    logger.info("Oracle client 'thick' initialisé")
                except Exception as e:
                    logger.warning(f"Impossible d'initialiser le client 'thick': {e}")

            dsn = (
                f"(description=(address=(protocol=TCP)(host={config.host})(port={config.port}))"
                f"(connect_data=(service_name={config.service_name})))"
            )

            self._pool = oracledb.create_pool(
                user=config.username,
                password=config.password,
                dsn=dsn,
                min=config.min_sessions,
                max=config.max_sessions,
                increment=config.increment,
                timeout=config.connection_timeout_seconds,
                homogeneous=True,
                # ping_interval: seconds between pinging idle sessions to keep them valid
                ping_interval=60,
            )
            self._config = config
            self._initialized = True
            logger.info(
                f"Pool Oracle initialisé (min={config.min_sessions}, max={config.max_sessions}, increment={config.increment})"
            )
            return True
        except Exception as e:
            logger.error(f"Échec d'initialisation du pool Oracle: {e}")
            self._initialized = False
            self._pool = None
            return False

    def stats(self) -> Dict[str, Any]:
        if not self.is_initialized:
            return {"initialized": False, "available": self.is_available}
        stats: Dict[str, Any] = {
            "initialized": True,
            "available": True,
        }
        # oracledb pools expose open/busy attributes in python-thick; try to read if present
        for attr in ("open", "busy", "max", "min", "increment"):
            stats[attr] = getattr(self._pool, attr, None) if self._pool else None
        return stats

    def acquire(self):
        if not self.is_initialized or not self._pool:
            raise RuntimeError("Pool Oracle non initialisé")
        return self._pool.acquire()

    @retry(
        reraise=True,
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=0.5, min=1, max=5),
        retry=retry_if_exception_type(Exception),
    )
    def execute_select(self, query: str, max_rows: int = 1000) -> Tuple[List[str], List[Dict[str, Any]]]:
        if not self.is_initialized or not self._pool:
            raise RuntimeError("Pool Oracle non initialisé")

        normalized = query.strip().lower()
        if not normalized.startswith("select"):
            raise ValueError("Seules les requêtes SELECT sont autorisées via execute_select")

        with self._pool.acquire() as connection:
            with connection.cursor() as cursor:
                cursor.arraysize = min(max_rows, 100000)
                cursor.execute(query)
                colnames = [d[0] for d in cursor.description]
                rows = cursor.fetchmany(numRows=max_rows)
                data = [
                    {colnames[i]: (row[i].isoformat() if hasattr(row[i], "isoformat") else row[i]) for i in range(len(colnames))}
                    for row in rows
                ]
        return colnames, data


# Instance globale du pool
oracle_pool = OraclePoolManager()




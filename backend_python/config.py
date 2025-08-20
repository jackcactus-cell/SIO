"""Configuration de l'application"""
import os
from typing import List
from pydantic import validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration de l'application"""
    
    # Application
    app_name: str = "SIO Audit Backend"
    app_version: str = "1.0.0"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Base de données
    mongodb_uri: str = "mongodb://localhost:27017/auditdb"
    mongodb_db_name: str = "auditdb"
    sqlite_db_path: str = "./cache/chatbot_cache.db"
    redis_url: str = "redis://localhost:6379"

    # Oracle DB (optionnel)
    oracle_host: str = ""
    oracle_port: int = 1521
    oracle_service_name: str = ""
    oracle_username: str = ""
    oracle_password: str = ""
    oracle_driver_mode: str = "thin"  # "thin" par défaut, "thick" si Instant Client installé
    
    # API Keys
    openai_api_key: str
    
    # Sécurité
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Logs
    log_level: str = "INFO"
    log_file: str = "./logs/app.log"
    
    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:80"
    ]
    
    @validator('cors_origins', pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Instance globale des paramètres
settings = Settings()

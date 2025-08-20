"""Modèles de données pour l'application"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from bson.objectid import ObjectId


class PyObjectId(ObjectId):
    """ObjectId personnalisé pour Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema, handler):
        schema.update(type="string")
        return schema


class MongoBaseModel(BaseModel):
    """Modèle de base pour MongoDB"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Modèles d'audit
class AuditAction(MongoBaseModel):
    """Action d'audit dans la base de données"""
    os_username: Optional[str] = None
    dbusername: Optional[str] = None
    client_program_name: Optional[str] = None
    object_schema: Optional[str] = None
    object_name: Optional[str] = None
    event_timestamp: Optional[str] = None
    action_name: Optional[str] = None
    client_host: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AuditQuery(BaseModel):
    """Requête d'audit"""
    os_username: Optional[str] = None
    dbusername: Optional[str] = None
    action: Optional[str] = None
    object_name: Optional[str] = None
    schema: Optional[str] = None
    date_start: Optional[str] = None
    date_end: Optional[str] = None
    client_host: Optional[str] = None
    program: Optional[str] = None
    limit: int = 100


# Modèles utilisateur


# Modèles de cache
class QueryCache(BaseModel):
    """Cache des requêtes"""
    query_hash: str
    normalized_query: str
    result: Dict[str, Any]
    hit_count: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_accessed: datetime = Field(default_factory=datetime.utcnow)


class ActionCache(BaseModel):
    """Cache des actions"""
    action_type: str
    user: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None


# Modèles de statistiques
class QuestionStats(MongoBaseModel):
    """Statistiques des questions"""
    normalized_question: str
    count: int = 1
    last_asked: datetime = Field(default_factory=datetime.utcnow)
    variations: List[str] = []


class TrendAnalysis(BaseModel):
    """Analyse des tendances"""
    period: str
    data: List[Dict[str, Any]]
    summary: Dict[str, Any]
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class AnomalyDetection(BaseModel):
    """Détection d'anomalies"""
    timeframe: str
    anomalies: List[Dict[str, Any]]
    threshold: float
    detected_at: datetime = Field(default_factory=datetime.utcnow)


# Modèles de chatbot
class ChatMessage(BaseModel):
    """Message de chat"""
    message: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Réponse du chatbot"""
    response: str
    analysis: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = None
    cached: bool = False


# Modèles d'analyse
class QueryAnalysis(BaseModel):
    """Analyse d'une requête"""
    original_query: str
    normalized_query: str
    intent: str
    entities: Dict[str, Any]
    confidence: float
    suggested_filters: Dict[str, Any]


class UserActivityAnalysis(BaseModel):
    """Analyse d'activité utilisateur"""
    user_stats: Dict[str, Any]
    top_actions: List[Dict[str, Any]]
    activity_patterns: Dict[str, Any]
    recommendations: List[str]

    @classmethod
    def __get_pydantic_json_schema__(cls, schema):
        schema.update(type="object")
        properties = {
            "user_stats": {"type": "object"},
            "top_actions": {"type": "array", "items": {"type": "object"}},
            "activity_patterns": {"type": "object"},
            "recommendations": {"type": "array", "items": {"type": "string"}},
        }
        required = ["user_stats", "top_actions", "activity_patterns", "recommendations"]
        for prop, spec in properties.items():
            schema["properties"][prop] = spec
        schema["required"] = required

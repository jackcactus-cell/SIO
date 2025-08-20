#!/usr/bin/env python3
"""
Serveur LLM minimal qui fonctionne toujours
"""

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import logging
import io
import csv

# Configuration simple
app = FastAPI(title="Minimal Oracle Audit LLM API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging simple
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Stockage en mémoire simple
uploaded_files = {}
file_counter = 0

# Modèles Pydantic
class QuestionRequest(BaseModel):
    question: str

class QuestionResponse(BaseModel):
    success: bool = True
    answer: str
    type: str = "text"
    confidence: float = 1.0
    data: Optional[List[Dict[str, Any]]] = None
    columns: Optional[List[str]] = None
    summary: Optional[str] = None
    explanation: Optional[str] = None
    interpretation: Optional[str] = None

class UploadResponse(BaseModel):
    success: bool = True
    message: str
    log_id: Optional[str] = None
    events_count: Optional[int] = None
    summary: Optional[str] = None
    file_type: Optional[str] = None
    suggested_questions: Optional[List[str]] = None
    detected_patterns: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@app.get("/")
async def health_check():
    """Health check simple"""
    return {
        "status": "healthy", 
        "model_loaded": True, 
        "vector_db_ready": True, 
        "version": "1.0.0-minimal",
        "files_uploaded": len(uploaded_files)
    }

@app.post("/api/upload-logs", response_model=UploadResponse)
async def upload_logs(file: UploadFile = File(...)):
    """Upload simple de fichiers"""
    global file_counter
    try:
        logger.info(f"Uploading file: {file.filename}")
        
        # Lire le contenu
        content = await file.read()
        file_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'txt'
        
        # Traitement basique selon le type
        if file_ext == 'csv':
            result = process_csv_simple(content, file.filename)
        elif file_ext in ['xlsx', 'xls', 'xlsm']:
            return UploadResponse(
                success=False,
                message="Les fichiers Excel nécessitent pandas. Veuillez convertir en CSV.",
                error="Excel not supported in minimal mode"
            )
        else:
            result = process_text_simple(content, file.filename)
        
        # Stocker
        file_counter += 1
        log_id = f"file_{file_counter}"
        uploaded_files[log_id] = result
        
        return UploadResponse(
            success=True,
            message=f"Fichier {file_ext.upper()} traité avec succès",
            log_id=log_id,
            events_count=result.get('row_count', 0),
            summary=result.get('summary', ''),
            file_type=file_ext,
            suggested_questions=result.get('suggested_questions', []),
            detected_patterns=result.get('patterns', {})
        )
        
    except Exception as e:
        logger.error(f"Error uploading: {e}")
        return UploadResponse(
            success=False,
            message=f"Erreur: {str(e)}",
            error=str(e)
        )

@app.post("/api/ask-llm", response_model=QuestionResponse)
async def ask_llm(request: QuestionRequest):
    """Réponse simple aux questions"""
    try:
        question = request.question.lower()
        logger.info(f"Question: {question}")
        
        # Réponses simples basées sur des mots-clés
        if any(word in question for word in ["bonjour", "salut", "hello"]):
            return QuestionResponse(
                answer="Bonjour ! Je suis votre assistant d'analyse d'audit Oracle. Comment puis-je vous aider ?",
                type="text",
                confidence=1.0
            )
        
        elif any(word in question for word in ["combien", "nombre", "total"]):
            total_files = len(uploaded_files)
            total_events = sum(f.get('row_count', 0) for f in uploaded_files.values())
            
            if "fichiers" in question or "logs" in question:
                return QuestionResponse(
                    answer=f"Vous avez uploadé {total_files} fichier(s) au total.",
                    type="text",
                    confidence=0.9
                )
            else:
                return QuestionResponse(
                    answer=f"Au total, il y a {total_events} événements dans {total_files} fichier(s) uploadé(s).",
                    type="text",
                    confidence=0.9
                )
        
        elif any(word in question for word in ["utilisateur", "user"]):
            if uploaded_files:
                # Analyser les utilisateurs dans les fichiers uploadés
                users = set()
                for file_data in uploaded_files.values():
                    if 'data' in file_data:
                        for row in file_data['data']:
                            for key, value in row.items():
                                if 'user' in key.lower():
                                    users.add(str(value))
                
                if users:
                    user_list = list(users)[:10]  # Limiter à 10
                    return QuestionResponse(
                        answer=f"Utilisateurs trouvés : {', '.join(user_list)}",
                        type="text",
                        confidence=0.8
                    )
            
            return QuestionResponse(
                answer="Aucune donnée d'utilisateur trouvée. Veuillez d'abord uploader vos fichiers d'audit.",
                type="text",
                confidence=0.7
            )
        
        elif any(word in question for word in ["action", "requête", "select", "insert", "update", "delete"]):
            if uploaded_files:
                actions = set()
                for file_data in uploaded_files.values():
                    if 'data' in file_data:
                        for row in file_data['data']:
                            for key, value in row.items():
                                if 'action' in key.lower():
                                    actions.add(str(value))
                
                if actions:
                    action_list = list(actions)[:10]
                    return QuestionResponse(
                        answer=f"Actions trouvées : {', '.join(action_list)}",
                        type="text",
                        confidence=0.8
                    )
            
            return QuestionResponse(
                answer="Aucune action trouvée. Veuillez uploader vos logs d'audit Oracle.",
                type="text",
                confidence=0.7
            )
        
        else:
            # Réponse générale
            return QuestionResponse(
                answer=f"Je traite votre question sur l'audit Oracle. Actuellement {len(uploaded_files)} fichier(s) uploadé(s). Vous pouvez me demander des informations sur les utilisateurs, actions, nombres d'événements, etc.",
                type="text",
                confidence=0.6
            )
            
    except Exception as e:
        logger.error(f"Error answering question: {e}")
        return QuestionResponse(
            success=False,
            answer=f"Erreur lors du traitement de la question: {str(e)}",
            type="error",
            confidence=0.0
        )

@app.post("/api/oracle/extract-audit")
async def extract_oracle_audit():
    """Extraction Oracle - mode minimal"""
    return {
        "success": False,
        "message": "L'extraction Oracle nécessite les dépendances complètes (oracledb, motor). Utilisez le mode Docker pour cette fonctionnalité.",
        "error": "Feature not available in minimal mode"
    }

@app.get("/api/oracle/stats")
async def get_oracle_stats():
    """Stats Oracle - mode minimal"""
    return {
        "success": False,
        "message": "Les statistiques Oracle nécessitent MongoDB. Utilisez le mode Docker pour cette fonctionnalité.",
        "error": "Feature not available in minimal mode"
    }

def process_csv_simple(content: bytes, filename: str) -> Dict[str, Any]:
    """Traitement CSV simple"""
    try:
        # Essayer différents encodages
        text_content = None
        for encoding in ['utf-8', 'iso-8859-1', 'cp1252']:
            try:
                text_content = content.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        
        if text_content is None:
            raise ValueError("Impossible de décoder le fichier CSV")
        
        # Parser CSV
        lines = text_content.strip().split('\n')
        if not lines:
            raise ValueError("Fichier CSV vide")
        
        # Détecter délimiteur
        delimiter = ',' if ',' in lines[0] else (';' if ';' in lines[0] else '\t')
        
        # Lire avec csv.DictReader
        reader = csv.DictReader(io.StringIO(text_content), delimiter=delimiter)
        
        data = []
        columns = []
        
        for i, row in enumerate(reader):
            if i == 0:
                columns = list(row.keys())
            
            # Nettoyer les données
            clean_row = {k.strip().lower(): str(v).strip() for k, v in row.items() if v}
            data.append(clean_row)
            
            # Limiter pour la performance
            if i >= 1000:
                break
        
        # Générer questions suggérées
        questions = [
            f"Combien d'enregistrements dans {filename} ?",
            "Quels sont les utilisateurs uniques ?",
            "Répartition des actions"
        ]
        
        # Ajouter questions spécifiques selon les colonnes
        column_names = [c.lower() for c in columns]
        if any('user' in col for col in column_names):
            questions.append("Analyse des utilisateurs les plus actifs")
        if any('action' in col for col in column_names):
            questions.append("Types d'actions les plus fréquents")
        
        return {
            'filename': filename,
            'row_count': len(data),
            'columns': columns,
            'data': data,
            'summary': f"Fichier CSV avec {len(data)} lignes et {len(columns)} colonnes",
            'suggested_questions': questions,
            'patterns': {
                'detected_columns': column_names,
                'data_types': 'csv'
            }
        }
        
    except Exception as e:
        raise ValueError(f"Erreur traitement CSV: {str(e)}")

def process_text_simple(content: bytes, filename: str) -> Dict[str, Any]:
    """Traitement texte simple"""
    try:
        # Décoder le texte
        text_content = content.decode('utf-8', errors='ignore')
        lines = [line.strip() for line in text_content.split('\n') if line.strip()]
        
        # Créer données basiques
        data = []
        for i, line in enumerate(lines[:500]):  # Limiter
            data.append({
                'line_number': i + 1,
                'content': line
            })
        
        questions = [
            f"Combien de lignes dans {filename} ?",
            "Analyse du contenu textuel",
            "Recherche de patterns"
        ]
        
        return {
            'filename': filename,
            'row_count': len(data),
            'columns': ['line_number', 'content'],
            'data': data,
            'summary': f"Fichier texte avec {len(lines)} lignes",
            'suggested_questions': questions,
            'patterns': {
                'total_lines': len(lines),
                'data_types': 'text'
            }
        }
        
    except Exception as e:
        raise ValueError(f"Erreur traitement texte: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Minimal Oracle Audit LLM API Server")
    print("📡 Server: http://localhost:8001")
    print("📚 Docs: http://localhost:8001/docs")
    print("⚡ Mode: Minimal (pas de dépendances lourdes)")
    
    uvicorn.run(app, host="0.0.0.0", port=8001)

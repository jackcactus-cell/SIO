"""
Service LLM intelligent pour l'analyse d'audit Oracle
Version avec traitement réel des logs et analyse adaptative
"""

import json
import re
import pandas as pd
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import os

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

@dataclass
class AuditEvent:
    """Représente un événement d'audit Oracle"""
    timestamp: str
    os_username: str
    db_username: str
    action_name: str
    object_name: str
    object_schema: str
    client_program: str
    userhost: str
    session_id: str
    instance: str
    raw_line: str

@dataclass
class LLMResponse:
    """Réponse du modèle LLM"""
    answer: str
    confidence: float
    sources: List[Dict[str, Any]]
    analysis_type: str
    data: Dict[str, Any]

class IntelligentOracleLogParser:
    """Parser intelligent pour les logs d'audit Oracle"""
    
    def __init__(self):
        # Patterns multiples pour différents formats de logs
        self.audit_patterns = {
            'csv_format': r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+)',
            'pipe_format': r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)',
            'tab_format': r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)'
        }
    
    def detect_format(self, content: str) -> str:
        """Détecte automatiquement le format du fichier"""
        lines = content.split('\n')[:10]
        
        for line in lines:
            if not line.strip():
                continue
                
            for format_name, pattern in self.audit_patterns.items():
                if re.search(pattern, line):
                    return format_name
        
        return 'csv_format'
    
    def parse_log_content(self, content: str) -> List[AuditEvent]:
        """Parse le contenu d'un fichier de log Oracle avec détection automatique"""
        events = []
        lines = content.split('\n')
        
        detected_format = self.detect_format(content)
        logger.info(f"Format détecté: {detected_format}")
        
        for line in lines:
            if not line.strip():
                continue
                
            event = self._parse_line(line, detected_format)
            if event:
                events.append(event)
        
        logger.info(f"Parsed {len(events)} audit events from log")
        return events
    
    def _parse_line(self, line: str, format_type: str) -> Optional[AuditEvent]:
        """Parse une ligne de log individuelle"""
        try:
            pattern = self.audit_patterns[format_type]
            match = re.search(pattern, line)
            
            if match:
                return AuditEvent(
                    timestamp=match.group(1),
                    os_username=match.group(2),
                    db_username=match.group(3),
                    action_name=match.group(4),
                    object_name=match.group(5),
                    object_schema=match.group(6),
                    client_program=match.group(7),
                    userhost=match.group(8),
                    session_id=match.group(9),
                    instance=match.group(10),
                    raw_line=line
                )
                
        except Exception as e:
            logger.warning(f"Failed to parse line: {line[:100]}... Error: {e}")
        
        return None

class IntelligentAuditLLMService:
    """Service LLM intelligent pour l'analyse d'audit"""
    
    def __init__(self):
        self.log_parser = IntelligentOracleLogParser()
        self.uploaded_logs = {}  # Stockage des logs uploadés
        self.log_analyses = {}   # Cache des analyses
        
        # Questions d'exemple (simplifiées)
        self.sample_questions = [
            "Combien d'événements d'audit sont enregistrés dans ce fichier ?",
            "Quels sont les utilisateurs les plus actifs ?",
            "Quels sont les types d'actions les plus fréquents ?",
            "Combien de requêtes SELECT ont été exécutées ?",
            "Quels sont les schémas les plus consultés ?",
            "À quelle heure l'activité est-elle la plus élevée ?",
            "Y a-t-il des actions suspectes ?",
            "Combien de sessions uniques sont enregistrées ?",
            "Quels programmes clients sont les plus utilisés ?",
            "Quels sont les hôtes les plus fréquents ?"
        ]
    
    def process_log_upload(self, log_content: str, filename: str = None) -> str:
        """Traite l'upload d'un fichier de log et le stocke"""
        try:
            logger.info(f"Processing log upload for {filename}")
            events = self.log_parser.parse_log_content(log_content)
            
            if not events:
                logger.warning("No events found in log")
                return "Aucun événement d'audit trouvé dans le fichier"
            
            log_id = f"log_{len(events)}_{hash(log_content) % 10000}"
            logger.info(f"Generated log_id = {log_id}")
            
            # Stocker les logs
            self.uploaded_logs[log_id] = {
                'events': events,
                'content': log_content,
                'filename': filename,
                'upload_time': datetime.now().isoformat()
            }
            
            logger.info(f"Stored log with {len(events)} events")
            logger.info(f"Total logs in service = {len(self.uploaded_logs)}")
            logger.debug(f"Available log IDs: {list(self.uploaded_logs.keys())}")
            
            # Analyser les patterns
            analysis = self._analyze_logs_intelligently(events)
            self.log_analyses[log_id] = analysis
            
            summary = self._generate_intelligent_summary(events, analysis)
            return f"Log traité avec succès! {len(events)} événements analysés. {summary}"
            
        except Exception as e:
            logger.error(f"Error processing log upload: {e}")
            return f"Erreur lors du traitement: {str(e)}"
    
    def answer_question(self, question: str, log_id: str = None) -> LLMResponse:
        """Répond intelligemment à une question sur les logs d'audit Oracle"""
        try:
            logger.info(f"Processing question: {question}")
            logger.info(f"Current uploaded_logs keys: {list(self.uploaded_logs.keys())}")
            logger.info(f"Requested log_id: {log_id}")
            
            # Vérifier si des logs sont disponibles
            if not self.uploaded_logs:
                logger.warning("No logs available in service")
                return LLMResponse(
                    answer="Aucun log d'audit disponible. Veuillez d'abord uploader vos logs.",
                    confidence=0.0,
                    sources=[{"type": "warning", "message": "No logs uploaded"}],
                    analysis_type="error",
                    data={}
                )
            
            # Si pas de log_id spécifié, utiliser le premier disponible
            if not log_id:
                log_id = list(self.uploaded_logs.keys())[0]
                logger.info(f"Using first available log_id: {log_id}")
            
            # Vérifier si le log_id existe
            if log_id not in self.uploaded_logs:
                logger.warning(f"Log ID {log_id} not found, using first available")
                log_id = list(self.uploaded_logs.keys())[0]
            
            log_data = self.uploaded_logs[log_id]
            events = log_data['events']
            analysis = self.log_analyses.get(log_id, {})
            
            logger.info(f"Analyzing {len(events)} events from log {log_id}")
            logger.info(f"Log filename: {log_data.get('filename', 'Unknown')}")
            
            # Générer une réponse intelligente basée sur les données Oracle
            answer, confidence, analysis_type, data = self._generate_intelligent_answer(
                question, events, analysis
            )
            
            logger.info(f"Generated answer with confidence: {confidence}")
            
            return LLMResponse(
                answer=answer,
                confidence=confidence,
                sources=[{"type": "log", "name": log_data.get('filename', 'Unknown'), "events_count": len(events)}],
                analysis_type=analysis_type,
                data=data
            )
            
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            return LLMResponse(
                answer=f"Erreur lors de l'analyse Oracle: {str(e)}",
                confidence=0.0,
                sources=[{"type": "error", "message": str(e)}],
                analysis_type="error",
                data={}
            )
    
    def _analyze_logs_intelligently(self, events: List[AuditEvent]) -> Dict[str, Any]:
        """Analyse intelligente des logs avec détection de patterns"""
        if not events:
            return {}
        
        df = pd.DataFrame([vars(event) for event in events])
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['hour'] = df['timestamp'].dt.hour
        
        analysis = {
            "total_events": len(events),
            "time_range": {
                "start": df['timestamp'].min().isoformat(),
                "end": df['timestamp'].max().isoformat()
            },
            "users": {
                "unique_os_users": df['os_username'].nunique(),
                "unique_db_users": df['db_username'].nunique(),
                "top_os_users": df['os_username'].value_counts().head(5).to_dict(),
                "top_db_users": df['db_username'].value_counts().head(5).to_dict()
            },
            "actions": {
                "action_distribution": df['action_name'].value_counts().to_dict(),
                "top_actions": df['action_name'].value_counts().head(10).to_dict()
            },
            "objects": {
                "unique_objects": df['object_name'].nunique(),
                "unique_schemas": df['object_schema'].nunique(),
                "top_objects": df['object_name'].value_counts().head(10).to_dict(),
                "top_schemas": df['object_schema'].value_counts().head(10).to_dict()
            },
            "sessions": {
                "unique_sessions": df['session_id'].nunique()
            },
            "programs": {
                "top_programs": df['client_program'].value_counts().head(10).to_dict()
            },
            "hosts": {
                "top_hosts": df['userhost'].value_counts().head(10).to_dict()
            },
            "hourly_activity": df['hour'].value_counts().sort_index().to_dict(),
            "security_analysis": self._analyze_security_patterns(df)
        }
        
        return analysis
    
    def _generate_intelligent_answer(self, question: str, events: List[AuditEvent], analysis: Dict[str, Any]) -> tuple:
        """Génère une réponse intelligente basée sur l'analyse réelle des logs"""
        question_lower = question.lower()
        
        if any(word in question_lower for word in ["combien", "nombre", "total"]):
            return self._answer_count_question(question, analysis)
        elif any(word in question_lower for word in ["utilisateur", "user", "qui"]):
            return self._answer_user_question(question, analysis)
        elif any(word in question_lower for word in ["action", "requête", "select", "insert", "update", "delete"]):
            return self._answer_action_question(question, analysis)
        elif any(word in question_lower for word in ["heure", "temps", "quand", "fréquence"]):
            return self._answer_time_question(question, analysis)
        elif any(word in question_lower for word in ["sécurité", "suspect", "anomalie"]):
            return self._answer_security_question(question, analysis)
        elif any(word in question_lower for word in ["schéma", "objet", "table"]):
            return self._answer_schema_question(question, analysis)
        else:
            return self._answer_general_question(question, analysis)
    
    def _answer_count_question(self, question: str, analysis: Dict[str, Any]) -> tuple:
        """Répond aux questions de comptage"""
        if "événements" in question.lower() or "total" in question.lower():
            count = analysis.get("total_events", 0)
            return f"Le fichier contient {count} événements d'audit au total.", 0.95, "count", {"total_events": count}
        
        elif "utilisateurs" in question.lower():
            unique_users = analysis.get("users", {}).get("unique_os_users", 0)
            return f"Il y a {unique_users} utilisateurs différents dans les logs.", 0.90, "user_count", {"unique_users": unique_users}
        
        elif "sessions" in question.lower():
            unique_sessions = analysis.get("sessions", {}).get("unique_sessions", 0)
            return f"Il y a {unique_sessions} sessions uniques enregistrées.", 0.90, "session_count", {"unique_sessions": unique_sessions}
        
        return "Je n'ai pas pu déterminer le type de comptage demandé.", 0.5, "general", {}
    
    def _answer_user_question(self, question: str, analysis: Dict[str, Any]) -> tuple:
        """Répond aux questions sur les utilisateurs"""
        users_data = analysis.get("users", {})
        top_users = users_data.get("top_os_users", {})
        
        if not top_users:
            return "Aucun utilisateur trouvé dans les logs.", 0.8, "user_analysis", {}
        
        user_list = [f"{user} ({count} actions)" for user, count in list(top_users.items())[:5]]
        answer = f"Les utilisateurs les plus actifs sont : {', '.join(user_list)}."
        
        return answer, 0.9, "user_analysis", {"top_users": top_users}
    
    def _answer_action_question(self, question: str, analysis: Dict[str, Any]) -> tuple:
        """Répond aux questions sur les actions"""
        actions_data = analysis.get("actions", {})
        action_dist = actions_data.get("action_distribution", {})
        
        if not action_dist:
            return "Aucune action trouvée dans les logs.", 0.8, "action_analysis", {}
        
        question_lower = question.lower()
        if "select" in question_lower:
            count = action_dist.get("SELECT", 0)
            return f"Il y a {count} requêtes SELECT dans les logs.", 0.95, "action_analysis", {"SELECT": count}
        elif "insert" in question_lower:
            count = action_dist.get("INSERT", 0)
            return f"Il y a {count} requêtes INSERT dans les logs.", 0.95, "action_analysis", {"INSERT": count}
        elif "update" in question_lower:
            count = action_dist.get("UPDATE", 0)
            return f"Il y a {count} requêtes UPDATE dans les logs.", 0.95, "action_analysis", {"UPDATE": count}
        elif "delete" in question_lower:
            count = action_dist.get("DELETE", 0)
            return f"Il y a {count} requêtes DELETE dans les logs.", 0.95, "action_analysis", {"DELETE": count}
        else:
            top_actions = actions_data.get("top_actions", {})
            action_list = [f"{action} ({count})" for action, count in list(top_actions.items())[:5]]
            return f"Les actions principales sont : {', '.join(action_list)}.", 0.9, "action_analysis", {"top_actions": top_actions}
    
    def _answer_time_question(self, question: str, analysis: Dict[str, Any]) -> tuple:
        """Répond aux questions temporelles"""
        hourly_activity = analysis.get("hourly_activity", {})
        
        if not hourly_activity:
            return "Pas de données temporelles disponibles.", 0.7, "time_analysis", {}
        
        peak_hour = max(hourly_activity.items(), key=lambda x: x[1])[0]
        peak_count = hourly_activity[peak_hour]
        
        return f"L'activité est la plus élevée à {peak_hour}h avec {peak_count} actions.", 0.9, "time_analysis", {
            "peak_hour": peak_hour,
            "peak_count": peak_count,
            "hourly_activity": hourly_activity
        }
    
    def _answer_security_question(self, question: str, analysis: Dict[str, Any]) -> tuple:
        """Répond aux questions de sécurité"""
        security_analysis = analysis.get("security_analysis", {})
        
        if not security_analysis:
            return "Aucune anomalie de sécurité détectée dans les logs.", 0.8, "security_analysis", {}
        
        issues = security_analysis.get("issues", [])
        if issues:
            return f"Anomalies de sécurité détectées : {', '.join(issues)}.", 0.9, "security_analysis", {"issues": issues}
        else:
            return "Aucune anomalie de sécurité détectée.", 0.8, "security_analysis", {}
    
    def _answer_schema_question(self, question: str, analysis: Dict[str, Any]) -> tuple:
        """Répond aux questions sur les schémas"""
        objects_data = analysis.get("objects", {})
        top_schemas = objects_data.get("top_schemas", {})
        
        if not top_schemas:
            return "Aucun schéma trouvé dans les logs.", 0.8, "schema_analysis", {}
        
        schema_list = [f"{schema} ({count} accès)" for schema, count in list(top_schemas.items())[:5]]
        return f"Les schémas les plus consultés sont : {', '.join(schema_list)}.", 0.9, "schema_analysis", {"top_schemas": top_schemas}
    
    def _answer_general_question(self, question: str, analysis: Dict[str, Any]) -> tuple:
        """Répond aux questions générales"""
        total_events = analysis.get("total_events", 0)
        unique_users = analysis.get("users", {}).get("unique_os_users", 0)
        
        return f"Analyse générale : {total_events} événements analysés, {unique_users} utilisateurs uniques.", 0.8, "general_analysis", {
            "total_events": total_events,
            "unique_users": unique_users
        }
    
    def _analyze_security_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyse les patterns de sécurité"""
        issues = []
        
        # Vérifier les accès système
        sys_access = df[df['object_schema'] == 'SYS']
        if len(sys_access) > 10:
            issues.append(f"Nombre élevé d'accès système ({len(sys_access)})")
        
        # Vérifier les actions destructives
        destructive_actions = df[df['action_name'].isin(['DELETE', 'TRUNCATE', 'DROP'])]
        if len(destructive_actions) > 5:
            issues.append(f"Actions destructives détectées ({len(destructive_actions)})")
        
        return {
            "issues": issues,
            "sys_access_count": len(sys_access),
            "destructive_actions_count": len(destructive_actions)
        }
    
    def _generate_intelligent_summary(self, events: List[AuditEvent], analysis: Dict[str, Any]) -> str:
        """Génère un résumé intelligent des logs"""
        if not events:
            return "Aucun événement à résumer"
        
        total_events = analysis.get("total_events", 0)
        unique_users = analysis.get("users", {}).get("unique_os_users", 0)
        top_action = list(analysis.get("actions", {}).get("top_actions", {}).items())[0] if analysis.get("actions", {}).get("top_actions") else None
        
        summary = f"Résumé intelligent : {total_events} événements analysés. "
        summary += f"Utilisateurs uniques : {unique_users}. "
        
        if top_action:
            summary += f"Action principale : {top_action[0]} ({top_action[1]} fois). "
        
        security_issues = analysis.get("security_analysis", {}).get("issues", [])
        if security_issues:
            summary += f"⚠️ {len(security_issues)} anomalie(s) de sécurité détectée(s)."
        
        return summary
    
    def get_sample_questions(self) -> List[str]:
        """Retourne les questions d'exemple pour l'audit Oracle"""
        return self.sample_questions

    def get_stored_logs_info(self) -> Dict[str, Any]:
        """Retourne des informations sur les logs stockés pour debug"""
        info = {
            'total_logs': len(self.uploaded_logs),
            'log_ids': list(self.uploaded_logs.keys()),
            'logs_details': {}
        }
        
        for log_id, log_data in self.uploaded_logs.items():
            info['logs_details'][log_id] = {
                'filename': log_data.get('filename', 'Unknown'),
                'events_count': len(log_data.get('events', [])),
                'upload_time': log_data.get('upload_time', 'Unknown')
            }
        
        logger.info(f"Stored logs info: {info}")
        return info

# Instance globale du service intelligent
intelligent_audit_llm_service = IntelligentAuditLLMService()

# Log de démarrage
logger.info("=== SERVICE LLM INTELLIGENT DÉMARRÉ ===")
logger.info(f"Log file path: {log_path}")
logger.info("Service ready for audit log processing") 
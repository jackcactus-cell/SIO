"""
Version simplifiée du service LLM pour tests rapides
Sans les modèles lourds (PyTorch, Transformers)
"""

import json
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import pandas as pd

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
    sources: List[str]
    analysis_type: str

class SimpleOracleLogParser:
    """Parser simplifié pour les logs d'audit Oracle"""
    
    def __init__(self):
        self.audit_patterns = {
            'simple': r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+)'
        }
    
    def parse_log_content(self, content: str) -> List[AuditEvent]:
        """Parse le contenu d'un fichier de log Oracle"""
        events = []
        lines = content.split('\n')
        
        for line in lines:
            if not line.strip():
                continue
                
            event = self._parse_line(line)
            if event:
                events.append(event)
        
        print(f"Parsed {len(events)} audit events from log")
        return events
    
    def _parse_line(self, line: str) -> Optional[AuditEvent]:
        """Parse une ligne de log individuelle"""
        try:
            # Pattern simplifié pour les logs de test
            match = re.search(self.audit_patterns['simple'], line)
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
            print(f"Failed to parse line: {line[:100]}... Error: {e}")
        
        return None

class SimpleAuditLLMService:
    """Service LLM simplifié pour l'analyse d'audit"""
    
    def __init__(self):
        self.log_parser = SimpleOracleLogParser()
        
        # Questions d'exemple basées sur l'audit Oracle
        self.sample_questions = [
            # Questions générales sur les données
            "Combien d'événements d'audit sont enregistrés dans ce fichier ?",
            "Quelle est la plage de dates couverte par ces données ?",
            "Quels sont les types d'actions (ACTION_NAME) les plus fréquents ?",
            "Combien d'utilisateurs différents (OS_USERNAME) sont enregistrés ?",
            "Quels sont les programmes clients (CLIENT_PROGRAM_NAME) les plus utilisés ?",
            
            # Questions sur les utilisateurs et les sessions
            "Quels sont les utilisateurs de base de données (DBUSERNAME) les plus actifs ?",
            "Combien de sessions uniques (SESSIONID) sont enregistrées ?",
            "Quels sont les hôtes (USERHOST) les plus fréquents ?",
            "Quels terminaux (TERMINAL) sont utilisés pour se connecter ?",
            "Quels sont les types d'authentification (AUTHENTICATION_TYPE) utilisés ?",
            
            # Questions sur les actions spécifiques
            "Combien de requêtes SELECT ont été exécutées ?",
            "Combien de requêtes TRUNCATE TABLE ont été exécutées ?",
            "Combien de requêtes UPDATE ont été exécutées ?",
            "Combien de requêtes INSERT ont été exécutées ?",
            "Combien de requêtes DELETE ont été exécutées ?",
            "Combien de requêtes ALTER SYSTEM ont été exécutées ?",
            "Combien de requêtes CREATE INDEX ont été exécutées ?",
            "Combien de requêtes CREATE PROCEDURE ont été exécutées ?",
            "Combien de requêtes ALTER PROCEDURE ont été exécutées ?",
            "Combien de requêtes SET ROLE ont été exécutées ?",
            
            # Questions sur les schémas et objets
            "Quels sont les schémas (OBJECT_SCHEMA) les plus fréquemment interrogés ?",
            "Quels sont les objets (OBJECT_NAME) les plus fréquemment interrogés ?",
            "Combien de fois la table SYS.OBJ$ a-t-elle été interrogée ?",
            "Combien de fois la table SYS.USER$ a-t-elle été interrogée ?",
            "Combien de fois la table SYS.TAB$ a-t-elle été interrogée ?",
            "Quels sont les objets les plus souvent modifiés (UPDATE, INSERT, DELETE) ?",
            "Quels sont les objets les plus souvent tronqués (TRUNCATE) ?",
            "Quels sont les objets liés aux privilèges (GV$ENABLEDPRIVS, V$ENABLEDPRIVS) interrogés ?",
            "Quels sont les objets système (SYS) les plus consultés ?",
            "Quels sont les objets des schémas applicatifs (SPT, EPOSTE, etc.) les plus consultés ?",
            
            # Questions sur les horaires et la fréquence
            "À quelle heure de la journée l'activité est-elle la plus élevée ?",
            "Quelle est la fréquence des actions par heure ?",
            "Combien d'actions ont été enregistrées entre 11h et 12h ?",
            "Combien d'actions ont été enregistrées entre 14h et 15h ?",
            "Quelle est la durée moyenne entre deux actions pour un même SESSIONID ?",
            
            # Questions sur les connexions (LOGON)
            "Combien de connexions (LOGON) ont été enregistrées ?",
            "Quels sont les utilisateurs les plus fréquents pour les connexions ?",
            "Quels sont les programmes clients utilisés pour les connexions ?",
            "À quelles heures les connexions sont-elles les plus fréquentes ?",
            "Y a-t-il des connexions depuis des hôtes inconnus (USERHOST) ?",
            
            # Questions sur les adresses IP et les réseaux
            "Quelles sont les adresses IP (HOST) les plus fréquentes ?",
            "Combien de connexions proviennent de 192.168.60.42 ?",
            "Combien de connexions proviennent de 192.168.200.93 ?",
            "Quels ports (PORT) sont les plus utilisés pour les connexions ?",
            "Y a-t-il des connexions depuis des adresses IP externes ?",
            
            # Questions sur les rôles et privilèges
            "Combien de fois l'action SET ROLE a-t-elle été exécutée ?",
            "Quels utilisateurs ont utilisé SET ROLE le plus souvent ?",
            "Quels programmes clients sont associés à SET ROLE ?",
            "Y a-t-il des actions suspectes liées aux rôles ?",
            "Quels sont les schémas concernés par SET ROLE ?",
            
            # Questions sur les schémas applicatifs
            "Combien d'actions concernent le schéma SPT ?",
            "Combien d'actions concernent le schéma EPOSTE ?",
            "Combien d'actions concernent le schéma IMOBILE ?",
            "Combien d'actions concernent le schéma MBUDGET ?",
            "Quelles tables du schéma SPT sont les plus consultées ?",
            
            # Questions sur les actions de maintenance
            "Combien de TRUNCATE TABLE ont été exécutés sur MOUVEMENT_EPOSTE ?",
            "Combien de TRUNCATE TABLE ont été exécutés sur MOUVEMENT_UL ?",
            "Combien de TRUNCATE TABLE ont été exécutés sur TEMPORAL_LIGNE ?",
            "Combien de TRUNCATE TABLE ont été exécutés sur TEMP2 ?",
            "Qui a exécuté le plus de TRUNCATE TABLE ?",
            
            # Questions sur les procédures et fonctions
            "Quelles procédures ont été créées ou modifiées ?",
            "Qui a créé ou modifié des procédures ?",
            "Combien de fois MOON_API_DATA_VALIDATION a-t-elle été modifiée ?",
            "Quels schémas contiennent des procédures modifiées ?",
            "À quelles heures les procédures sont-elles modifiées ?",
            
            # Questions sur les index
            "Combien de CREATE INDEX ont été exécutés ?",
            "Quels index ont été créés sur le schéma SPT ?",
            "Qui a créé des index ?",
            "À quelles heures les index sont-ils créés ?",
            "Quelles tables ont été indexées ?",
            
            # Questions sur les batchs et automatisation
            "Combien d'actions sont associées à JDBC Thin Client ?",
            "Quels utilisateurs utilisent JDBC Thin Client ?",
            "Quelles tables sont concernées par JDBC Thin Client ?",
            "Combien d'actions sont associées à sqlplus ?",
            "Quels utilisateurs utilisent sqlplus ?",
            
            # Questions sur les applications spécifiques
            "Combien d'actions sont associées à Toad.exe ?",
            "Quels utilisateurs utilisent Toad.exe ?",
            "Combien d'actions sont associées à SQL Developer ?",
            "Quels utilisateurs utilisent SQL Developer ?",
            "Combien d'actions sont associées à rwbuilder.exe ?",
            
            # Questions sur les schémas système
            "Combien d'actions concernent le schéma SYS ?",
            "Quelles tables système sont les plus consultées ?",
            "Qui consulte les tables système ?",
            "Combien de fois DUAL a-t-elle été interrogée ?",
            "Quelles vues système (GV$, V$) sont interrogées ?",
            
            # Questions sur les schémas temporaires
            "Combien d'actions concernent des tables temporaires (TEMP, TEMP2) ?",
            "Qui utilise des tables temporaires ?",
            "Quelles sont les actions les plus fréquentes sur les tables temporaires ?",
            "Combien de TRUNCATE sur des tables temporaires ?",
            "Quels schémas contiennent des tables temporaires ?",
            
            # Questions sur les schémas utilisateur
            "Quels schémas utilisateur (non système) sont les plus actifs ?",
            "Quelles tables utilisateur sont les plus modifiées ?",
            "Qui accède aux schémas utilisateur ?",
            "Combien d'actions sont des SELECT sur des tables utilisateur ?",
            "Combien d'actions sont des UPDATE sur des tables utilisateur ?",
            
            # Questions sur les schémas de production
            "Toutes les actions sont-elles marquées comme PRODUCTION (INSTANCE) ?",
            "Y a-t-il des actions suspectes en production ?",
            "Quelles sont les actions les plus risquées en production ?",
            "Qui a les droits les plus étendus en production ?",
            "Quelles sont les meilleures pratiques pour auditer ces actions en production ?"
        ]
        
        # Templates de réponses pour différents types d'analyses
        self.response_templates = {
            "user_analysis": {
                "question_patterns": ["utilisateur", "user", "qui", "qui a"],
                "template": "Basé sur l'analyse de vos logs, les utilisateurs les plus actifs sont : {users}. Total d'actions : {total_actions}."
            },
            "action_analysis": {
                "question_patterns": ["action", "requête", "select", "insert", "update", "delete"],
                "template": "Analyse des actions : {actions}. Actions principales : {main_actions}."
            },
            "security_analysis": {
                "question_patterns": ["sécurité", "sécurisé", "suspect", "anomalie"],
                "template": "Analyse de sécurité : {security_issues}. Activités suspectes détectées : {suspicious_count}."
            },
            "performance_analysis": {
                "question_patterns": ["performance", "temps", "heure", "fréquence"],
                "template": "Analyse de performance : {performance_metrics}. Période d'activité : {time_range}."
            }
        }
    
    def process_log_upload(self, log_content: str) -> str:
        """Traite l'upload d'un fichier de log"""
        try:
            # Parser les logs
            events = self.log_parser.parse_log_content(log_content)
            
            if not events:
                return "Aucun événement d'audit trouvé dans le fichier"
            
            # Générer un résumé automatique
            summary = self._generate_summary(events)
            
            return f"Log traité avec succès! {len(events)} événements analysés. {summary}"
            
        except Exception as e:
            print(f"Error processing log upload: {e}")
            return f"Erreur lors du traitement: {str(e)}"
    
    def answer_question(self, question: str, log_id: str = None) -> LLMResponse:
        """Répond à une question sur les logs d'audit"""
        try:
            # Déterminer le type d'analyse basé sur la question
            analysis_type = self._classify_question(question)
            
            # Générer une réponse basée sur le type d'analyse
            answer = self._generate_simple_response(question, analysis_type)
            
            return LLMResponse(
                answer=answer,
                confidence=0.85,  # Simulation pour le prototype
                sources=[],  # Pas de sources pour la version simple
                analysis_type=analysis_type
            )
            
        except Exception as e:
            print(f"Error generating answer: {e}")
            return LLMResponse(
                answer=f"Erreur lors de l'analyse: {str(e)}",
                confidence=0.0,
                sources=[],
                analysis_type="error"
            )
    
    def analyze_patterns(self, events: List[AuditEvent]) -> Dict[str, Any]:
        """Analyse les patterns dans les logs d'audit"""
        if not events:
            return {"error": "Aucun événement à analyser"}
        
        # Convertir en DataFrame pour l'analyse
        df = pd.DataFrame([vars(event) for event in events])
        
        patterns = {
            "total_events": len(events),
            "unique_users": df['os_username'].nunique(),
            "unique_actions": df['action_name'].value_counts().to_dict(),
            "top_programs": df['client_program'].value_counts().head(5).to_dict(),
            "top_objects": df['object_name'].value_counts().head(5).to_dict(),
            "time_range": {
                "start": df['timestamp'].min(),
                "end": df['timestamp'].max()
            },
            "suspicious_activities": self._detect_suspicious_activities(df)
        }
        
        return patterns
    
    def get_sample_questions(self) -> List[str]:
        """Retourne les questions d'exemple pour l'audit Oracle"""
        return self.sample_questions
    
    def _classify_question(self, question: str) -> str:
        """Classifie le type de question"""
        question_lower = question.lower()
        
        for analysis_type, config in self.response_templates.items():
            for pattern in config["question_patterns"]:
                if pattern in question_lower:
                    return analysis_type
        
        return "performance_analysis"  # Par défaut
    
    def _generate_simple_response(self, question: str, analysis_type: str) -> str:
        """Génère une réponse simple basée sur le type d'analyse"""
        if analysis_type == "user_analysis":
            return "Basé sur l'analyse de vos logs, les utilisateurs les plus actifs sont : user1 (45 actions), user2 (32 actions), user3 (28 actions)."
        elif analysis_type == "action_analysis":
            return "Analyse des actions : SELECT (150), INSERT (25), UPDATE (18), DELETE (5). Actions principales : SELECT représente 75% des opérations."
        elif analysis_type == "security_analysis":
            return "Analyse de sécurité : 3 accès suspects détectés, 2 connexions anormales, 1 tentative d'accès non autorisé au schéma SYS."
        else:
            return "Analyse de performance : Pic d'activité entre 10h et 11h, 85% des opérations en heures de bureau, performance stable."
    
    def _generate_summary(self, events: List[AuditEvent]) -> str:
        """Génère un résumé automatique des logs"""
        if not events:
            return "Aucun événement à résumer"
        
        df = pd.DataFrame([vars(event) for event in events])
        
        summary = f"Résumé: {len(events)} événements analysés. "
        summary += f"Utilisateurs uniques: {df['os_username'].nunique()}. "
        summary += f"Actions principales: {', '.join(df['action_name'].value_counts().head(3).index)}. "
        summary += f"Période: {df['timestamp'].min()} à {df['timestamp'].max()}"
        
        return summary
    
    def _detect_suspicious_activities(self, df: pd.DataFrame) -> List[str]:
        """Détecte les activités suspectes"""
        suspicious = []
        
        # Vérifier les accès système
        sys_access = df[df['object_schema'] == 'SYS']
        if len(sys_access) > 10:
            suspicious.append(f"Nombre élevé d'accès système ({len(sys_access)})")
        
        # Vérifier les actions de modification
        destructive_actions = df[df['action_name'].isin(['DELETE', 'TRUNCATE', 'DROP'])]
        if len(destructive_actions) > 5:
            suspicious.append(f"Actions destructives détectées ({len(destructive_actions)})")
        
        # Vérifier les connexions multiples
        user_sessions = df.groupby('os_username')['session_id'].nunique()
        if user_sessions.max() > 10:
            suspicious.append("Utilisateur avec trop de sessions simultanées")
        
        return suspicious

# Instance globale du service
simple_audit_llm_service = SimpleAuditLLMService() 
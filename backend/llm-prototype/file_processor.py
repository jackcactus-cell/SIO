"""
Service de traitement de fichiers Excel/CSV/XLS pour l'analyse d'audit Oracle
"""

try:
    import pandas as pd
    import numpy as np
except ImportError:
    pd = None
    np = None
import logging
import os
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import re
from pathlib import Path

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ProcessedFileData:
    """Données d'un fichier traité"""
    filename: str
    file_type: str
    row_count: int
    column_count: int
    columns: List[str]
    data: List[Dict[str, Any]]
    summary: str
    detected_patterns: Dict[str, Any]
    suggested_questions: List[str]
    metadata: Dict[str, Any]

class FileProcessor:
    """Processeur de fichiers Excel/CSV/XLS pour l'analyse d'audit"""
    
    def __init__(self):
        self.supported_formats = ['.csv', '.xlsx', '.xls', '.xlsm']
        self.audit_patterns = {
            'timestamp_columns': ['timestamp', 'date', 'time', 'event_timestamp', 'created_date', 'modified_date'],
            'user_columns': ['user', 'username', 'os_username', 'db_username', 'dbusername', 'client_user'],
            'action_columns': ['action', 'action_name', 'operation', 'event_type', 'activity'],
            'object_columns': ['object', 'object_name', 'table_name', 'schema', 'object_schema'],
            'host_columns': ['host', 'hostname', 'userhost', 'client_host', 'machine'],
            'session_columns': ['session', 'session_id', 'sessionid', 'connection_id'],
            'program_columns': ['program', 'client_program', 'application', 'tool']
        }
    
    def process_file(self, file_content: bytes, filename: str) -> ProcessedFileData:
        """Traite un fichier uploadé et extrait les données d'audit"""
        try:
            if pd is None:
                raise ImportError("Pandas n'est pas installé. Impossible de traiter les fichiers Excel/CSV.")
                
            logger.info(f"Processing file: {filename}")
            
            # Déterminer le type de fichier
            file_ext = Path(filename).suffix.lower()
            if file_ext not in self.supported_formats:
                raise ValueError(f"Format de fichier non supporté: {file_ext}")
            
            # Lire le fichier selon son format
            df = self._read_file(file_content, file_ext)
            
            if df.empty:
                raise ValueError("Le fichier est vide ou ne contient pas de données valides")
            
            logger.info(f"Loaded DataFrame with {len(df)} rows and {len(df.columns)} columns")
            
            # Nettoyer et normaliser les données
            df = self._clean_dataframe(df)
            
            # Détecter les patterns d'audit
            patterns = self._detect_audit_patterns(df)
            
            # Générer un résumé
            summary = self._generate_summary(df, patterns)
            
            # Suggérer des questions
            questions = self._suggest_questions(df, patterns)
            
            # Convertir en format standardisé
            data = df.to_dict('records')
            
            # Métadonnées
            metadata = {
                'upload_time': datetime.now().isoformat(),
                'file_size': len(file_content),
                'data_types': df.dtypes.to_dict(),
                'null_counts': df.isnull().sum().to_dict(),
                'unique_counts': df.nunique().to_dict()
            }
            
            return ProcessedFileData(
                filename=filename,
                file_type=file_ext,
                row_count=len(df),
                column_count=len(df.columns),
                columns=df.columns.tolist(),
                data=data,
                summary=summary,
                detected_patterns=patterns,
                suggested_questions=questions,
                metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"Error processing file {filename}: {e}")
            raise
    
    def _read_file(self, file_content: bytes, file_ext: str) -> pd.DataFrame:
        """Lit un fichier selon son extension"""
        if file_ext == '.csv':
            # Essayer différents encodages et séparateurs
            for encoding in ['utf-8', 'iso-8859-1', 'cp1252']:
                for sep in [',', ';', '\t', '|']:
                    try:
                        df = pd.read_csv(
                            pd.io.common.BytesIO(file_content),
                            encoding=encoding,
                            sep=sep,
                            low_memory=False
                        )
                        if len(df.columns) > 1 and len(df) > 0:
                            logger.info(f"Successfully read CSV with encoding={encoding}, sep='{sep}'")
                            return df
                    except:
                        continue
            
            # Fallback avec les paramètres par défaut
            return pd.read_csv(pd.io.common.BytesIO(file_content), low_memory=False)
            
        elif file_ext in ['.xlsx', '.xlsm']:
            return pd.read_excel(pd.io.common.BytesIO(file_content), engine='openpyxl')
            
        elif file_ext == '.xls':
            return pd.read_excel(pd.io.common.BytesIO(file_content), engine='xlrd')
            
        else:
            raise ValueError(f"Extension non supportée: {file_ext}")
    
    def _clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Nettoie et normalise le DataFrame"""
        # Supprimer les lignes complètement vides
        df = df.dropna(how='all')
        
        # Nettoyer les noms de colonnes
        df.columns = [str(col).strip().lower().replace(' ', '_') for col in df.columns]
        
        # Supprimer les colonnes vides
        df = df.dropna(axis=1, how='all')
        
        # Convertir les dates automatiquement
        for col in df.columns:
            if any(pattern in col for pattern in ['date', 'time', 'timestamp']):
                try:
                    df[col] = pd.to_datetime(df[col], errors='ignore')
                except:
                    pass
        
        # Limiter à un nombre raisonnable de lignes pour l'analyse
        if len(df) > 10000:
            logger.warning(f"File has {len(df)} rows, limiting to first 10000 for analysis")
            df = df.head(10000)
        
        return df
    
    def _detect_audit_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Détecte les patterns d'audit dans les données"""
        patterns = {
            'detected_columns': {},
            'data_insights': {},
            'potential_audit_fields': []
        }
        
        # Identifier les types de colonnes d'audit
        for pattern_type, keywords in self.audit_patterns.items():
            matching_cols = []
            for col in df.columns:
                if any(keyword in col for keyword in keywords):
                    matching_cols.append(col)
            
            if matching_cols:
                patterns['detected_columns'][pattern_type] = matching_cols
                patterns['potential_audit_fields'].extend(matching_cols)
        
        # Analyser les données
        patterns['data_insights'] = {
            'total_records': len(df),
            'columns_count': len(df.columns),
            'date_columns': [col for col in df.columns if df[col].dtype == 'datetime64[ns]'],
            'numeric_columns': [col for col in df.columns if pd.api.types.is_numeric_dtype(df[col])],
            'text_columns': [col for col in df.columns if pd.api.types.is_string_dtype(df[col])],
            'unique_value_counts': {}
        }
        
        # Compter les valeurs uniques pour les colonnes importantes
        for col in df.columns:
            unique_count = df[col].nunique()
            if unique_count < 100:  # Seulement pour les colonnes avec peu de valeurs uniques
                patterns['data_insights']['unique_value_counts'][col] = {
                    'unique_values': unique_count,
                    'top_values': df[col].value_counts().head(5).to_dict()
                }
        
        return patterns
    
    def _generate_summary(self, df: pd.DataFrame, patterns: Dict[str, Any]) -> str:
        """Génère un résumé des données"""
        summary_parts = [
            f"Fichier analysé avec {len(df)} lignes et {len(df.columns)} colonnes."
        ]
        
        # Colonnes d'audit détectées
        audit_cols = patterns.get('potential_audit_fields', [])
        if audit_cols:
            summary_parts.append(f"Colonnes d'audit détectées: {', '.join(audit_cols[:5])}")
        
        # Informations temporelles
        date_cols = patterns['data_insights'].get('date_columns', [])
        if date_cols:
            for col in date_cols[:2]:  # Max 2 colonnes de date
                try:
                    min_date = df[col].min()
                    max_date = df[col].max()
                    summary_parts.append(f"Période couverte ({col}): {min_date} à {max_date}")
                except:
                    pass
        
        # Top valeurs pour colonnes importantes
        unique_counts = patterns['data_insights'].get('unique_value_counts', {})
        for col, info in list(unique_counts.items())[:3]:  # Max 3 colonnes
            top_values = list(info['top_values'].keys())[:3]
            summary_parts.append(f"Top valeurs {col}: {', '.join(map(str, top_values))}")
        
        return " ".join(summary_parts)
    
    def _suggest_questions(self, df: pd.DataFrame, patterns: Dict[str, Any]) -> List[str]:
        """Suggère des questions d'analyse basées sur les données"""
        questions = []
        
        # Questions générales
        questions.append(f"Combien d'enregistrements sont dans ce fichier ?")
        questions.append(f"Quelle est la période couverte par ces données ?")
        
        # Questions basées sur les colonnes détectées
        detected_cols = patterns.get('detected_columns', {})
        
        if 'user_columns' in detected_cols:
            user_cols = detected_cols['user_columns']
            questions.extend([
                f"Quels sont les utilisateurs les plus actifs dans {user_cols[0]} ?",
                f"Combien d'utilisateurs uniques sont enregistrés ?"
            ])
        
        if 'action_columns' in detected_cols:
            action_cols = detected_cols['action_columns']
            questions.extend([
                f"Quelles sont les actions les plus fréquentes dans {action_cols[0]} ?",
                f"Répartition des types d'actions par fréquence"
            ])
        
        if 'timestamp_columns' in detected_cols:
            time_cols = detected_cols['timestamp_columns']
            questions.extend([
                f"À quelle heure l'activité est-elle la plus élevée ?",
                f"Répartition de l'activité par jour/heure"
            ])
        
        if 'object_columns' in detected_cols:
            obj_cols = detected_cols['object_columns']
            questions.extend([
                f"Quels sont les objets les plus consultés dans {obj_cols[0]} ?",
                f"Répartition par schéma/objet"
            ])
        
        if 'host_columns' in detected_cols:
            host_cols = detected_cols['host_columns']
            questions.extend([
                f"Quels sont les hôtes les plus actifs dans {host_cols[0]} ?",
                f"Répartition géographique des connexions"
            ])
        
        # Questions d'analyse avancée
        questions.extend([
            "Y a-t-il des patterns suspects dans les données ?",
            "Évolution de l'activité dans le temps",
            "Corrélations entre utilisateurs et actions",
            "Détection d'anomalies dans les accès"
        ])
        
        return questions[:15]  # Limiter à 15 questions

# Instance globale
file_processor = FileProcessor()

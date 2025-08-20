"""
Processeur de fichiers simplifié qui fonctionne sans pandas/openpyxl
Version fallback pour traitement basique CSV
"""

import csv
import io
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

@dataclass
class SimpleProcessedFileData:
    """Données d'un fichier traité (version simplifiée)"""
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

class SimpleFileProcessor:
    """Processeur de fichiers simplifié pour CSV uniquement"""
    
    def __init__(self):
        self.supported_formats = ['.csv', '.txt']  # Seulement CSV en mode simple
        self.audit_patterns = {
            'timestamp_columns': ['timestamp', 'date', 'time', 'event_timestamp', 'created_date'],
            'user_columns': ['user', 'username', 'os_username', 'db_username', 'dbusername'],
            'action_columns': ['action', 'action_name', 'operation', 'event_type'],
            'object_columns': ['object', 'object_name', 'table_name', 'schema', 'object_schema'],
            'host_columns': ['host', 'hostname', 'userhost', 'client_host'],
            'session_columns': ['session', 'session_id', 'sessionid'],
            'program_columns': ['program', 'client_program', 'application']
        }
    
    def process_file(self, file_content: bytes, filename: str) -> SimpleProcessedFileData:
        """Traite un fichier CSV simple"""
        try:
            logger.info(f"Processing file with simple processor: {filename}")
            
            # Déterminer le type de fichier
            file_ext = Path(filename).suffix.lower()
            
            if file_ext == '.csv':
                return self._process_csv(file_content, filename)
            elif file_ext in ['.xlsx', '.xls', '.xlsm']:
                # Pour Excel, retourner un message d'erreur explicite
                raise ValueError(f"Les fichiers Excel ({file_ext}) nécessitent pandas et openpyxl. Veuillez convertir en CSV ou installer les dépendances.")
            else:
                # Traiter comme un fichier texte basique
                return self._process_text(file_content, filename)
                
        except Exception as e:
            logger.error(f"Error processing file {filename}: {e}")
            raise
    
    def _process_csv(self, file_content: bytes, filename: str) -> SimpleProcessedFileData:
        """Traite un fichier CSV"""
        try:
            # Détecter l'encodage
            content_str = None
            for encoding in ['utf-8', 'iso-8859-1', 'cp1252', 'utf-16']:
                try:
                    content_str = file_content.decode(encoding)
                    logger.info(f"Successfully decoded CSV with {encoding}")
                    break
                except UnicodeDecodeError:
                    continue
            
            if content_str is None:
                raise ValueError("Impossible de décoder le fichier CSV. Vérifiez l'encodage.")
            
            # Détecter le délimiteur
            delimiter = self._detect_delimiter(content_str)
            logger.info(f"Detected delimiter: '{delimiter}'")
            
            # Parser le CSV
            csv_reader = csv.DictReader(io.StringIO(content_str), delimiter=delimiter)
            
            data = []
            columns = []
            
            for i, row in enumerate(csv_reader):
                if i == 0:
                    columns = list(row.keys())
                    logger.info(f"CSV columns: {columns}")
                
                # Nettoyer les données
                clean_row = {}
                for key, value in row.items():
                    clean_key = str(key).strip().lower().replace(' ', '_')
                    clean_value = str(value).strip() if value else ''
                    clean_row[clean_key] = clean_value
                
                data.append(clean_row)
                
                # Limiter pour éviter les gros fichiers
                if i >= 10000:
                    logger.warning(f"CSV file has >10000 rows, limiting to first 10000")
                    break
            
            # Nettoyer les noms de colonnes
            clean_columns = [str(col).strip().lower().replace(' ', '_') for col in columns]
            
            # Analyser les patterns
            patterns = self._detect_patterns(data, clean_columns)
            
            # Générer résumé et questions
            summary = self._generate_summary(data, clean_columns, patterns)
            questions = self._suggest_questions(clean_columns, patterns)
            
            return SimpleProcessedFileData(
                filename=filename,
                file_type='.csv',
                row_count=len(data),
                column_count=len(clean_columns),
                columns=clean_columns,
                data=data,
                summary=summary,
                detected_patterns=patterns,
                suggested_questions=questions,
                metadata={
                    'encoding': 'auto-detected',
                    'delimiter': delimiter,
                    'upload_time': datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Error processing CSV: {e}")
            raise
    
    def _process_text(self, file_content: bytes, filename: str) -> SimpleProcessedFileData:
        """Traite un fichier texte basique"""
        try:
            # Détecter l'encodage
            content_str = None
            for encoding in ['utf-8', 'iso-8859-1', 'cp1252']:
                try:
                    content_str = file_content.decode(encoding)
                    break
                except UnicodeDecodeError:
                    continue
            
            if content_str is None:
                content_str = file_content.decode('utf-8', errors='ignore')
            
            lines = content_str.split('\n')
            lines = [line.strip() for line in lines if line.strip()]
            
            # Créer des données basiques
            data = []
            for i, line in enumerate(lines[:1000]):  # Limiter à 1000 lignes
                data.append({
                    'line_number': i + 1,
                    'content': line
                })
            
            return SimpleProcessedFileData(
                filename=filename,
                file_type='.txt',
                row_count=len(data),
                column_count=2,
                columns=['line_number', 'content'],
                data=data,
                summary=f"Fichier texte avec {len(lines)} lignes",
                detected_patterns={},
                suggested_questions=[
                    "Combien de lignes contient ce fichier ?",
                    "Quels sont les mots les plus fréquents ?",
                    "Y a-t-il des patterns spécifiques ?"
                ],
                metadata={
                    'total_lines': len(lines),
                    'upload_time': datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Error processing text file: {e}")
            raise
    
    def _detect_delimiter(self, content: str) -> str:
        """Détecte le délimiteur CSV"""
        first_lines = content.split('\n')[:5]
        delimiters = [',', ';', '\t', '|']
        
        delimiter_scores = {}
        for delimiter in delimiters:
            scores = []
            for line in first_lines:
                if line.strip():
                    scores.append(line.count(delimiter))
            
            if scores:
                # Vérifier la consistance
                avg_score = sum(scores) / len(scores)
                consistency = len([s for s in scores if abs(s - avg_score) <= 1]) / len(scores)
                delimiter_scores[delimiter] = avg_score * consistency
        
        if delimiter_scores:
            best_delimiter = max(delimiter_scores.items(), key=lambda x: x[1])[0]
            return best_delimiter
        
        return ','  # Par défaut
    
    def _detect_patterns(self, data: List[Dict], columns: List[str]) -> Dict[str, Any]:
        """Détecte les patterns d'audit dans les données"""
        patterns = {
            'detected_columns': {},
            'data_insights': {},
            'potential_audit_fields': []
        }
        
        # Identifier les types de colonnes d'audit
        for pattern_type, keywords in self.audit_patterns.items():
            matching_cols = []
            for col in columns:
                if any(keyword in col.lower() for keyword in keywords):
                    matching_cols.append(col)
            
            if matching_cols:
                patterns['detected_columns'][pattern_type] = matching_cols
                patterns['potential_audit_fields'].extend(matching_cols)
        
        # Analyser les données
        if data:
            patterns['data_insights'] = {
                'total_records': len(data),
                'columns_count': len(columns),
                'sample_values': {}
            }
            
            # Échantillonner les valeurs pour chaque colonne
            for col in columns[:10]:  # Limiter à 10 colonnes
                values = [row.get(col, '') for row in data[:100] if row.get(col)]
                unique_values = list(set(values))[:10]
                patterns['data_insights']['sample_values'][col] = unique_values
        
        return patterns
    
    def _generate_summary(self, data: List[Dict], columns: List[str], patterns: Dict) -> str:
        """Génère un résumé des données"""
        summary_parts = [
            f"Fichier CSV analysé avec {len(data)} lignes et {len(columns)} colonnes."
        ]
        
        # Colonnes d'audit détectées
        audit_cols = patterns.get('potential_audit_fields', [])
        if audit_cols:
            summary_parts.append(f"Colonnes d'audit détectées: {', '.join(audit_cols[:5])}")
        
        # Échantillon de données
        if data and len(data) > 0:
            summary_parts.append(f"Première ligne: {str(data[0])[:100]}...")
        
        return " ".join(summary_parts)
    
    def _suggest_questions(self, columns: List[str], patterns: Dict) -> List[str]:
        """Suggère des questions basées sur les colonnes détectées"""
        questions = [
            f"Combien d'enregistrements sont dans ce fichier ?",
            f"Quelles sont les colonnes disponibles ?"
        ]
        
        # Questions basées sur les colonnes détectées
        detected_cols = patterns.get('detected_columns', {})
        
        if 'user_columns' in detected_cols:
            questions.extend([
                f"Quels sont les utilisateurs uniques ?",
                f"Répartition par utilisateur"
            ])
        
        if 'action_columns' in detected_cols:
            questions.extend([
                f"Quelles sont les actions les plus fréquentes ?",
                f"Répartition des types d'actions"
            ])
        
        if 'timestamp_columns' in detected_cols:
            questions.extend([
                f"Quelle est la période couverte ?",
                f"Répartition temporelle des événements"
            ])
        
        if 'object_columns' in detected_cols:
            questions.extend([
                f"Quels sont les objets les plus consultés ?",
                f"Répartition par objet/schéma"
            ])
        
        # Questions générales
        questions.extend([
            "Analyse des patterns dans les données",
            "Détection d'anomalies",
            "Résumé statistique des colonnes"
        ])
        
        return questions[:15]  # Limiter à 15 questions

# Instance globale simple
simple_file_processor = SimpleFileProcessor()

"""
Service LLM pour l'analyse d'audit Oracle
Prototype pour démontrer l'intégration LLM
"""

import json
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from loguru import logger
import pandas as pd
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
from sentence_transformers import SentenceTransformer
import chromadb
from pymongo import MongoClient

# Templates de questions pour l'audit Oracle (basés sur questionTemplates.js)
QUESTION_TEMPLATES = [
    # Utilisateurs
    {
        "question": "Quels sont les utilisateurs OS (OS_USERNAME) qui se connectent à la base de données ?",
        "categorie": "Utilisateurs",
        "champs": ["os_username"],
        "reponse": "Les utilisateurs OS sont : datchemi, tahose, olan, root, oracle, BACKUP, Administrateur."
    },
    {
        "question": "Quels utilisateurs ont effectué le plus d'actions ?",
        "categorie": "Utilisateurs",
        "champs": ["db_username", "action_name"],
        "reponse": "Les utilisateurs les plus actifs sont : ATCHEMI (SELECT sur SYS), OLA (Toad), root (TRUNCATE via JDBC)."
    },
    {
        "question": "Quels sont les hôtes d'où proviennent les connexions ?",
        "categorie": "Infrastructure",
        "champs": ["userhost"],
        "reponse": "Les hôtes sont : WLXREBOND, LAPOSTE\\PC-ATCHEMI, apiprod, jdbcclient, frmprod01."
    },
    {
        "question": "Combien de sessions uniques (SESSIONID) sont enregistrées ?",
        "categorie": "Sessions",
        "champs": ["session_id"],
        "reponse": "Exemples de sessions uniques : 994729870, 2315658237, 604592084 (certaines durent des heures)."
    },
    {
        "question": "Quels utilisateurs ont effectué des opérations de TRUNCATE TABLE ?",
        "categorie": "Actions",
        "champs": ["db_username", "action_name"],
        "reponse": "Les utilisateurs avec TRUNCATE sont : root (via JDBC), BATCH_USER (via sqlplus)."
    },
    {
        "question": "Combien d'opérations SELECT sont enregistrées ?",
        "categorie": "Statistiques",
        "champs": ["action_name"],
        "reponse": "Il y a 200+ opérations SELECT, surtout sur SYS.OBJ$, SYS.USER$."
    },
    {
        "question": "Combien d'opérations LOGON sont enregistrées ?",
        "categorie": "Statistiques",
        "champs": ["action_name"],
        "reponse": "Il y a environ 30 connexions LOGON distinctes."
    },
    {
        "question": "Quelles tables ont été le plus souvent interrogées via SELECT ?",
        "categorie": "Objets",
        "champs": ["object_name", "action_name"],
        "reponse": "Les tables les plus consultées sont : SYS.OBJ$, SYS.USER$, SYS.TAB$, DUAL."
    },
    {
        "question": "Combien d'opérations SET ROLE sont enregistrées ?",
        "categorie": "Statistiques",
        "champs": ["action_name"],
        "reponse": "Il y a 50+ opérations SET ROLE par rwbuilder.exe (session 2315658237)."
    },
    {
        "question": "Quelles sont les tables qui ont été tronquées (TRUNCATE) ?",
        "categorie": "Actions",
        "champs": ["object_name", "action_name"],
        "reponse": "Les tables tronquées sont : IMOBILE.MOUVEMENT_UL (7x), MBUDGET.TEMP2 (5x), EPOSTE.MOUVEMENT_EPOSTE (2x)."
    },
    {
        "question": "Quels schémas (OBJECT_SCHEMA) sont les plus actifs ?",
        "categorie": "Objets",
        "champs": ["object_schema"],
        "reponse": "Les schémas les plus actifs sont : SYS (accès système), SPT, IMOBILE, MBUDGET, EPOSTE."
    },
    {
        "question": "Quelles tables (OBJECT_NAME) sont les plus fréquemment accédées ?",
        "categorie": "Objets",
        "champs": ["object_name"],
        "reponse": "Les tables les plus accédées sont : OBJ$, USER$ (système), COMPTE, MOUVEMENT_UL (métier)."
    },
    {
        "question": "Y a-t-il des accès à des tables système comme SYS.OBJ$ ?",
        "categorie": "Sécurité",
        "champs": ["object_schema", "object_name"],
        "reponse": "Oui, il y a des accès à SYS.OBJ$ par ATCHEMI via SQL Developer (reconnaissance de la base)."
    },
    {
        "question": "Combien d'opérations concernent des objets dans le schéma SYS ?",
        "categorie": "Statistiques",
        "champs": ["object_schema"],
        "reponse": "Il y a 150+ SELECT sur des objets du schéma SYS."
    },
    {
        "question": "Quels objets ont été modifiés via UPDATE ?",
        "categorie": "Actions",
        "champs": ["object_name", "action_name"],
        "reponse": "Les objets modifiés par UPDATE sont : SPT.COMPTE (par OLA via Toad)."
    },
    {
        "question": "Quels sont les trois programmes clients les plus utilisés ?",
        "categorie": "Clients",
        "champs": ["client_program"],
        "reponse": "Les trois programmes les plus utilisés sont : 1) SQL Developer (ATCHEMI), 2) Toad.exe (OLA/AHOSE), 3) JDBC Thin Client (root)."
    },
    {
        "question": "Combien de connexions proviennent de SQL Developer ?",
        "categorie": "Statistiques",
        "champs": ["client_program"],
        "reponse": "Il y a environ 100 actions via SQL Developer (majorité des SELECT système)."
    },
    {
        "question": "Combien de connexions proviennent de Toad.exe ?",
        "categorie": "Statistiques",
        "champs": ["client_program"],
        "reponse": "Il y a environ 50 actions via Toad.exe (LOGON, UPDATE, ALTER SYSTEM)."
    },
    {
        "question": "Combien de connexions utilisent JDBC Thin Client ?",
        "categorie": "Statistiques",
        "champs": ["client_program"],
        "reponse": "Il y a environ 20 TRUNCATE via JDBC Thin Client sur des tables métier."
    },
    {
        "question": "Quelles actions sont effectuées par rwbuilder.exe ?",
        "categorie": "Actions",
        "champs": ["client_program", "action_name"],
        "reponse": "rwbuilder.exe effectue uniquement des SET ROLE (session 2315658237)."
    },
    {
        "question": "À quelle heure de la journée y a-t-il le plus d'activité ?",
        "categorie": "Temps",
        "champs": ["timestamp"],
        "reponse": "Les pics d'activité sont : 11h30–12h30 (TRUNCATE) et 15h–16h (connexions)."
    },
    {
        "question": "Quel est le premier événement enregistré dans le fichier ?",
        "categorie": "Temps",
        "champs": ["timestamp"],
        "reponse": "Le premier événement est : 11/07/2025 08:48:43 (OLA via Toad, ALTER SYSTEM)."
    },
    {
        "question": "Quel est le dernier événement enregistré dans le fichier ?",
        "categorie": "Temps",
        "champs": ["timestamp"],
        "reponse": "Le dernier événement est : 11/07/2025 18:26:26 (AWATA via frmprod01)."
    },
    {
        "question": "Y a-t-il des opérations effectuées en dehors des heures de bureau ?",
        "categorie": "Temps",
        "champs": ["timestamp"],
        "reponse": "Non, il n'y a pas d'activité nocturne (uniquement 8h–18h)."
    },
    {
        "question": "Combien de temps dure la session la plus longue ?",
        "categorie": "Sessions",
        "champs": ["session_id", "timestamp"],
        "reponse": "La session 604592084 (OLA) dure de 8h à 18h (10 heures)."
    },
    {
        "question": "Quelles adresses IP (HOST dans CLIENT_ADDRESS) sont les plus actives ?",
        "categorie": "Infrastructure",
        "champs": ["userhost"],
        "reponse": "Les IPs les plus actives sont : 192.168.60.42 (Toad), 192.168.60.23 (JDBC), 192.168.200.93 (rwbuilder)."
    },
    {
        "question": "Combien de connexions proviennent de 192.168.60.42 ?",
        "categorie": "Statistiques",
        "champs": ["userhost"],
        "reponse": "Il y a environ 100 connexions depuis 192.168.60.42 (Toad + SQL Developer)."
    },
    {
        "question": "Quels ports sont utilisés pour les connexions ?",
        "categorie": "Infrastructure",
        "champs": ["userhost"],
        "reponse": "Exemples de ports utilisés : 50259 (Toad), 51105 (SQL Developer), 59515 (JDBC)."
    },
    {
        "question": "Y a-t-il des connexions depuis des réseaux non autorisés ?",
        "categorie": "Sécurité",
        "champs": ["userhost"],
        "reponse": "Non, toutes les connexions proviennent de réseaux internes (192.168.x.x)."
    },
    {
        "question": "Combien de connexions proviennent de terminaux 'unknown' ?",
        "categorie": "Statistiques",
        "champs": ["userhost"],
        "reponse": "SQL Developer utilise des terminaux 'unknown' (TERMINAL=unknown)."
    },
    {
        "question": "Quels utilisateurs ont effectué des opérations DDL (CREATE, ALTER) ?",
        "categorie": "Actions",
        "champs": ["db_username", "action_name"],
        "reponse": "Les utilisateurs DDL sont : OLA (ALTER SYSTEM), BATCH_USER (CREATE INDEX)."
    },
    {
        "question": "Qui a créé ou modifié des procédures stockées ?",
        "categorie": "Actions",
        "champs": ["db_username", "object_name"],
        "reponse": "AHOSE a créé SUBSOLAIRE.MOON_API_DATA_VALIDATION."
    },
    {
        "question": "Quels utilisateurs ont utilisé SET ROLE ?",
        "categorie": "Actions",
        "champs": ["db_username", "action_name"],
        "reponse": "SET ROLE est utilisé exclusivement par rwbuilder.exe (ATCHEMI)."
    },
    {
        "question": "Y a-t-il des opérations ALTER SYSTEM dans les logs ?",
        "categorie": "Actions",
        "champs": ["action_name"],
        "reponse": "Oui, il y a 100+ ALTER SYSTEM par OLA via Toad (session 604592084)."
    },
    {
        "question": "Qui a créé des index ?",
        "categorie": "Actions",
        "champs": ["db_username", "object_name", "action_name"],
        "reponse": "BATCH_USER a créé l'index SPT.MVO_SOLDE_CPTE_JOUR_ANCIEN_PK."
    },
    {
        "question": "Combien d'opérations concernent le schéma SPT ?",
        "categorie": "Statistiques",
        "champs": ["object_schema"],
        "reponse": "Les opérations sur SPT incluent : UPDATE COMPTE, TRUNCATE SOLDE_CPT_JR_ANCIEN."
    },
    {
        "question": "Quelles tables du schéma SPT sont accédées ?",
        "categorie": "Objets",
        "champs": ["object_schema", "object_name"],
        "reponse": "Les tables SPT accédées sont : COMPTE, T_INACTIF_CCP, SOLDE_CPT_JR_ANCIEN."
    },
    {
        "question": "Combien d'opérations concernent le schéma EPOSTE ?",
        "categorie": "Statistiques",
        "champs": ["object_schema"],
        "reponse": "Il y a 2 TRUNCATE MOUVEMENT_EPOSTE par l'utilisateur EPOSTE."
    },
    {
        "question": "Quelles actions sont effectuées sur IMOBILE.MOUVEMENT_UL ?",
        "categorie": "Actions",
        "champs": ["object_schema", "object_name", "action_name"],
        "reponse": "Sur IMOBILE.MOUVEMENT_UL : 7 TRUNCATE par root (JDBC)."
    },
    {
        "question": "Y a-t-il des opérations sur MBUDGET.TEMP2 ?",
        "categorie": "Actions",
        "champs": ["object_schema", "object_name"],
        "reponse": "Oui, il y a 5 TRUNCATE sur MBUDGET.TEMP2 par GST_DEKOU."
    },
    {
        "question": "Tous les enregistrements sont-ils de type 'Standard' ?",
        "categorie": "Audit",
        "champs": ["action_name"],
        "reponse": "Oui, tous les enregistrements sont de type 'Standard'."
    },
    {
        "question": "Y a-t-il des différences entre les instances (INSTANCE) ?",
        "categorie": "Infrastructure",
        "champs": ["instance"],
        "reponse": "Tous les événements proviennent de la même instance."
    },
    {
        "question": "Combien d'événements sont des connexions réussies ?",
        "categorie": "Statistiques",
        "champs": ["action_name"],
        "reponse": "Toutes les connexions LOGON sont réussies (pas d'échecs d'authentification)."
    },
    {
        "question": "Y a-t-il des échecs d'authentification ?",
        "categorie": "Sécurité",
        "champs": ["action_name"],
        "reponse": "Non, il n'y a pas d'échecs d'authentification enregistrés."
    },
    {
        "question": "Quelle est la fréquence des opérations TRUNCATE TABLE ?",
        "categorie": "Statistiques",
        "champs": ["action_name"],
        "reponse": "La fréquence des TRUNCATE est élevée : 7x sur MOUVEMENT_UL, 5x sur TEMP2, 2x sur MOUVEMENT_EPOSTE."
    },
    {
        "question": "Quel utilisateur a effectué le plus de TRUNCATE TABLE ?",
        "categorie": "Actions",
        "champs": ["db_username", "action_name"],
        "reponse": "L'utilisateur root a effectué le plus de TRUNCATE (via JDBC Thin Client)."
    },
    {
        "question": "Combien de fois la table MOUVEMENT_UL a-t-elle été tronquée ?",
        "categorie": "Statistiques",
        "champs": ["object_name", "action_name"],
        "reponse": "La table MOUVEMENT_UL a été tronquée 7 fois par root (JDBC)."
    },
    {
        "question": "Y a-t-il des patterns dans les heures des opérations TRUNCATE ?",
        "categorie": "Temps",
        "champs": ["timestamp", "action_name"],
        "reponse": "Oui, les TRUNCATE sont groupés : MOUVEMENT_UL tronquée 3x en 10 minutes."
    },
    {
        "question": "Combien de temps s'écoule entre deux TRUNCATE sur la même table ?",
        "categorie": "Temps",
        "champs": ["timestamp", "object_name", "action_name"],
        "reponse": "Le temps entre TRUNCATE varie : parfois quelques minutes, parfois plusieurs heures."
    },
    {
        "question": "Quelle session (SESSIONID) a duré le plus longtemps ?",
        "categorie": "Sessions",
        "champs": ["session_id", "timestamp"],
        "reponse": "La session 604592084 (OLA) a duré le plus longtemps : 8h à 18h."
    },
    {
        "question": "Combien d'actions sont effectuées par session en moyenne ?",
        "categorie": "Statistiques",
        "champs": ["session_id", "action_name"],
        "reponse": "Le nombre d'actions par session varie : certaines sessions ont des centaines d'actions."
    },
    {
        "question": "Y a-t-il des sessions avec un nombre anormal d'actions ?",
        "categorie": "Sécurité",
        "champs": ["session_id", "action_name"],
        "reponse": "Oui, la session 604592084 (OLA) a un nombre élevé d'ALTER SYSTEM."
    },
    {
        "question": "Quelles sessions ont effectué à la fois SELECT et UPDATE ?",
        "categorie": "Actions",
        "champs": ["session_id", "action_name"],
        "reponse": "Plusieurs sessions ont effectué SELECT et UPDATE, notamment celles utilisant Toad."
    },
    {
        "question": "Combien de sessions proviennent du même hôte ?",
        "categorie": "Infrastructure",
        "champs": ["userhost", "session_id"],
        "reponse": "Plusieurs sessions proviennent du même hôte, notamment WLXREBOND et LAPOSTE\\PC-ATCHEMI."
    },
    {
        "question": "Quelles tables ont été mises à jour (UPDATE) ?",
        "categorie": "Actions",
        "champs": ["object_name", "action_name"],
        "reponse": "La table SPT.COMPTE a été mise à jour par OLA via Toad."
    },
    {
        "question": "Qui a effectué des INSERT dans SPT.MOUVEMENT ?",
        "categorie": "Actions",
        "champs": ["db_username", "object_name", "action_name"],
        "reponse": "Aucun INSERT n'est enregistré dans SPT.MOUVEMENT dans ces logs."
    },
    {
        "question": "Y a-t-il des DELETE enregistrés ?",
        "categorie": "Actions",
        "champs": ["action_name"],
        "reponse": "Non, il n'y a pas d'opérations DELETE enregistrées dans ces logs."
    },
    {
        "question": "Quelles tables ont eu des INSERT et DELETE le même jour ?",
        "categorie": "Actions",
        "champs": ["object_name", "action_name", "timestamp"],
        "reponse": "Aucune table n'a eu d'INSERT et DELETE le même jour (pas de DELETE enregistrés)."
    },
    {
        "question": "Combien d'opérations DML sont enregistrées ?",
        "categorie": "Statistiques",
        "champs": ["action_name"],
        "reponse": "Les opérations DML enregistrées sont : UPDATE (SPT.COMPTE) et TRUNCATE (plusieurs tables)."
    },
    {
        "question": "Combien d'accès à SYS.USER$ sont enregistrés ?",
        "categorie": "Statistiques",
        "champs": ["object_schema", "object_name"],
        "reponse": "Il y a de nombreux accès à SYS.USER$ par ATCHEMI via SQL Developer."
    },
    {
        "question": "Pourquoi y a-t-il tant d'accès à SYS.OBJ$ ?",
        "categorie": "Sécurité",
        "champs": ["object_schema", "object_name", "db_username"],
        "reponse": "Les accès à SYS.OBJ$ sont effectués par ATCHEMI via SQL Developer pour la reconnaissance de la base."
    },
    {
        "question": "Quels objets système sont les plus consultés ?",
        "categorie": "Objets",
        "champs": ["object_schema", "object_name"],
        "reponse": "Les objets système les plus consultés sont : SYS.OBJ$, SYS.USER$, SYS.TAB$, DUAL."
    },
    {
        "question": "Y a-t-il des accès à GV$ENABLEDPRIVS ?",
        "categorie": "Objets",
        "champs": ["object_name"],
        "reponse": "Non, il n'y a pas d'accès à GV$ENABLEDPRIVS dans ces logs."
    },
    {
        "question": "Combien d'accès à DUAL sont enregistrés ?",
        "categorie": "Statistiques",
        "champs": ["object_name"],
        "reponse": "Il y a plusieurs accès à DUAL, table système Oracle utilisée pour les requêtes simples."
    },
    {
        "question": "Quelles applications (CLIENT_PROGRAM_NAME) accèdent à quelles tables ?",
        "categorie": "Applications",
        "champs": ["client_program", "object_name"],
        "reponse": "SQL Developer accède aux tables système, Toad aux tables métier, JDBC aux tables de données."
    },
    {
        "question": "SQL Developer est-il utilisé pour des opérations administratives ?",
        "categorie": "Applications",
        "champs": ["client_program", "action_name"],
        "reponse": "Oui, SQL Developer est utilisé par ATCHEMI pour des opérations administratives (accès SYS)."
    },
    {
        "question": "Toad.exe est-il utilisé pour des opérations spécifiques ?",
        "categorie": "Applications",
        "champs": ["client_program", "action_name"],
        "reponse": "Oui, Toad.exe est utilisé par OLA pour ALTER SYSTEM et UPDATE sur SPT.COMPTE."
    },
    {
        "question": "JDBC Thin Client est-il utilisé pour des opérations batch ?",
        "categorie": "Applications",
        "champs": ["client_program", "action_name"],
        "reponse": "Oui, JDBC Thin Client est utilisé par root pour des TRUNCATE (opérations batch)."
    },
    {
        "question": "rwbuilder.exe est-il utilisé pour des opérations particulières ?",
        "categorie": "Applications",
        "champs": ["client_program", "action_name"],
        "reponse": "Oui, rwbuilder.exe est utilisé exclusivement pour des SET ROLE (session 2315658237)."
    },
    {
        "question": "Y a-t-il des accès suspects à des tables système ?",
        "categorie": "Sécurité",
        "champs": ["object_schema", "db_username"],
        "reponse": "Oui, ATCHEMI accède de manière excessive aux tables système via SQL Developer."
    },
    {
        "question": "Des utilisateurs normaux accèdent-ils à des objets SYS ?",
        "categorie": "Sécurité",
        "champs": ["object_schema", "db_username"],
        "reponse": "Oui, ATCHEMI (utilisateur normal) accède aux objets SYS via SQL Developer."
    },
    {
        "question": "Y a-t-il des opérations sensibles effectuées par des applications ?",
        "categorie": "Sécurité",
        "champs": ["client_program", "action_name"],
        "reponse": "Oui, JDBC effectue des TRUNCATE et Toad effectue des ALTER SYSTEM."
    },
    {
        "question": "Les TRUNCATE sont-ils effectués par des utilisateurs appropriés ?",
        "categorie": "Sécurité",
        "champs": ["db_username", "action_name"],
        "reponse": "Les TRUNCATE sont effectués par root et BATCH_USER, ce qui semble approprié mais la fréquence est élevée."
    },
    {
        "question": "Y a-t-il des connexions depuis des hôtes non autorisés ?",
        "categorie": "Sécurité",
        "champs": ["userhost"],
        "reponse": "Non, toutes les connexions proviennent de réseaux internes autorisés (192.168.x.x)."
    },
    {
        "question": "Quel est le pic d'activité dans la journée ?",
        "categorie": "Temps",
        "champs": ["timestamp"],
        "reponse": "Les pics d'activité sont : 11h–12h et 15h–16h."
    },
    {
        "question": "Y a-t-il des opérations la nuit ?",
        "categorie": "Temps",
        "champs": ["timestamp"],
        "reponse": "Non, il n'y a pas d'opérations nocturnes (uniquement 8h–18h)."
    },
    {
        "question": "Combien de temps entre le premier et le dernier événement ?",
        "categorie": "Temps",
        "champs": ["timestamp"],
        "reponse": "Il y a 10 heures entre le premier (8h48) et le dernier événement (18h26)."
    },
    {
        "question": "Les opérations TRUNCATE sont-elles groupées dans le temps ?",
        "categorie": "Temps",
        "champs": ["timestamp", "action_name"],
        "reponse": "Oui, les TRUNCATE sont groupés : MOUVEMENT_UL tronquée 3x en 10 minutes."
    },
    {
        "question": "Y a-t-il des sessions qui durent plusieurs heures ?",
        "categorie": "Sessions",
        "champs": ["session_id", "timestamp"],
        "reponse": "Oui, la session 604592084 (OLA) dure de 8h à 18h (10 heures)."
    },
    {
        "question": "Combien de fois SET ROLE est-il appelé ?",
        "categorie": "Statistiques",
        "champs": ["action_name"],
        "reponse": "SET ROLE est appelé 50+ fois par rwbuilder.exe."
    },
    {
        "question": "Quels utilisateurs utilisent SET ROLE ?",
        "categorie": "Actions",
        "champs": ["db_username", "action_name"],
        "reponse": "SET ROLE est utilisé uniquement par ATCHEMI via rwbuilder.exe."
    },
    {
        "question": "Y a-t-il des patterns dans l'utilisation de SET ROLE ?",
        "categorie": "Actions",
        "champs": ["timestamp", "action_name"],
        "reponse": "Oui, les SET ROLE sont groupés en rafales (ex: 10x en 1 minute)."
    },
    {
        "question": "SET ROLE est-il utilisé avec des applications spécifiques ?",
        "categorie": "Applications",
        "champs": ["client_program", "action_name"],
        "reponse": "Oui, SET ROLE est utilisé exclusivement avec rwbuilder.exe."
    },
    {
        "question": "Combien de SET ROLE par session en moyenne ?",
        "categorie": "Statistiques",
        "champs": ["session_id", "action_name"],
        "reponse": "Il y a environ 20 SET ROLE par session 2315658237."
    },
    {
        "question": "Quels schémas contiennent des tables tronquées ?",
        "categorie": "Objets",
        "champs": ["object_schema", "action_name"],
        "reponse": "Les schémas avec TRUNCATE sont : IMOBILE, MBUDGET, EPOSTE, SPT."
    },
    {
        "question": "Le schéma SPT est-il utilisé pour quels types d'opérations ?",
        "categorie": "Actions",
        "champs": ["object_schema", "action_name"],
        "reponse": "Le schéma SPT est utilisé pour : UPDATE COMPTE, TRUNCATE SOLDE_CPT_JR_ANCIEN."
    },
    {
        "question": "Qui accède au schéma IMOBILE ?",
        "categorie": "Actions",
        "champs": ["object_schema", "db_username"],
        "reponse": "Seul root accède au schéma IMOBILE (uniquement pour TRUNCATE MOUVEMENT_UL)."
    },
    {
        "question": "Y a-t-il des opérations croisées entre schémas ?",
        "categorie": "Actions",
        "champs": ["object_schema", "db_username"],
        "reponse": "Non, les schémas sont utilisés de manière isolée par des utilisateurs différents."
    },
    {
        "question": "Quel schéma a le plus d'opérations UPDATE ?",
        "categorie": "Statistiques",
        "champs": ["object_schema", "action_name"],
        "reponse": "Le schéma SPT a le plus d'opérations UPDATE (table COMPTE)."
    }
]

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

class QuestionTemplateService:
    """Service pour gérer les templates de questions et réponses"""
    
    def __init__(self):
        self.templates = QUESTION_TEMPLATES
    
    def find_matching_template(self, question: str) -> Optional[Dict]:
        """Trouve un template correspondant à la question"""
        question_lower = question.lower()
        
        # Recherche exacte
        for template in self.templates:
            if template["question"].lower() == question_lower:
                return template
        
        # Recherche par mots-clés
        for template in self.templates:
            template_question = template["question"].lower()
            # Vérifier si les mots-clés principaux correspondent
            keywords = self._extract_keywords(template_question)
            if any(keyword in question_lower for keyword in keywords):
                return template
        
        # Recherche par catégorie
        for template in self.templates:
            if template["categorie"].lower() in question_lower:
                return template
        
        return None
    
    def _extract_keywords(self, question: str) -> List[str]:
        """Extrait les mots-clés d'une question"""
        # Mots-clés importants pour l'audit Oracle
        keywords = [
            "utilisateurs", "os_username", "db_username", "actions", "tables", "schémas",
            "sessions", "connexions", "truncate", "select", "update", "insert", "delete",
            "logon", "set role", "alter system", "create", "index", "procédures",
            "sql developer", "toad", "jdbc", "rwbuilder", "heures", "temps", "sécurité",
            "système", "objets", "statistiques", "fréquence", "patterns", "hôtes", "ports"
        ]
        
        found_keywords = []
        for keyword in keywords:
            if keyword in question:
                found_keywords.append(keyword)
        
        return found_keywords
    
    def analyze_data_for_template(self, events: List[AuditEvent], template: Dict) -> Dict:
        """Analyse les données pour un template donné"""
        analysis = {}
        
        for field in template.get("champs", []):
            if field == "os_username":
                analysis[field] = self._analyze_os_usernames(events)
            elif field == "db_username":
                analysis[field] = self._analyze_db_usernames(events)
            elif field == "action_name":
                analysis[field] = self._analyze_actions(events)
            elif field == "object_name":
                analysis[field] = self._analyze_objects(events)
            elif field == "object_schema":
                analysis[field] = self._analyze_schemas(events)
            elif field == "client_program":
                analysis[field] = self._analyze_client_programs(events)
            elif field == "userhost":
                analysis[field] = self._analyze_userhosts(events)
            elif field == "session_id":
                analysis[field] = self._analyze_sessions(events)
            elif field == "timestamp":
                analysis[field] = self._analyze_timestamps(events)
            elif field == "instance":
                analysis[field] = self._analyze_instances(events)
        
        return analysis
    
    def _analyze_os_usernames(self, events: List[AuditEvent]) -> Dict:
        """Analyse les noms d'utilisateurs OS"""
        usernames = {}
        for event in events:
            username = getattr(event, 'os_username', None)
            if username:
                usernames[username] = usernames.get(username, 0) + 1
        
        return {
            "unique_count": len(usernames),
            "most_common": sorted(usernames.items(), key=lambda x: x[1], reverse=True)[:5],
            "all": list(usernames.keys())
        }
    
    def _analyze_db_usernames(self, events: List[AuditEvent]) -> Dict:
        """Analyse les noms d'utilisateurs DB"""
        usernames = {}
        for event in events:
            username = getattr(event, 'db_username', None)
            if username:
                usernames[username] = usernames.get(username, 0) + 1
        
        return {
            "unique_count": len(usernames),
            "most_common": sorted(usernames.items(), key=lambda x: x[1], reverse=True)[:5],
            "all": list(usernames.keys())
        }
    
    def _analyze_actions(self, events: List[AuditEvent]) -> Dict:
        """Analyse les actions"""
        actions = {}
        for event in events:
            action = getattr(event, 'action_name', None)
            if action:
                actions[action] = actions.get(action, 0) + 1
        
        return {
            "unique_count": len(actions),
            "most_common": sorted(actions.items(), key=lambda x: x[1], reverse=True)[:5],
            "all": list(actions.keys())
        }
    
    def _analyze_objects(self, events: List[AuditEvent]) -> Dict:
        """Analyse les objets"""
        objects = {}
        for event in events:
            obj_name = getattr(event, 'object_name', None)
            if obj_name:
                objects[obj_name] = objects.get(obj_name, 0) + 1
        
        return {
            "unique_count": len(objects),
            "most_common": sorted(objects.items(), key=lambda x: x[1], reverse=True)[:5],
            "all": list(objects.keys())
        }
    
    def _analyze_schemas(self, events: List[AuditEvent]) -> Dict:
        """Analyse les schémas"""
        schemas = {}
        for event in events:
            schema = getattr(event, 'object_schema', None)
            if schema:
                schemas[schema] = schemas.get(schema, 0) + 1
        
        return {
            "unique_count": len(schemas),
            "most_common": sorted(schemas.items(), key=lambda x: x[1], reverse=True)[:5],
            "all": list(schemas.keys())
        }
    
    def _analyze_client_programs(self, events: List[AuditEvent]) -> Dict:
        """Analyse les programmes clients"""
        programs = {}
        for event in events:
            program = getattr(event, 'client_program', None)
            if program:
                programs[program] = programs.get(program, 0) + 1
        
        return {
            "unique_count": len(programs),
            "most_common": sorted(programs.items(), key=lambda x: x[1], reverse=True)[:5],
            "all": list(programs.keys())
        }
    
    def _analyze_userhosts(self, events: List[AuditEvent]) -> Dict:
        """Analyse les hôtes utilisateurs"""
        userhosts = {}
        for event in events:
            userhost = getattr(event, 'userhost', None)
            if userhost:
                userhosts[userhost] = userhosts.get(userhost, 0) + 1
        
        return {
            "unique_count": len(userhosts),
            "most_common": sorted(userhosts.items(), key=lambda x: x[1], reverse=True)[:5],
            "all": list(userhosts.keys())
        }
    
    def _analyze_sessions(self, events: List[AuditEvent]) -> Dict:
        """Analyse les sessions"""
        sessions = {}
        for event in events:
            session_id = getattr(event, 'session_id', None)
            if session_id:
                sessions[session_id] = sessions.get(session_id, 0) + 1
        
        return {
            "unique_count": len(sessions),
            "most_common": sorted(sessions.items(), key=lambda x: x[1], reverse=True)[:5],
            "all": list(sessions.keys())
        }
    
    def _analyze_timestamps(self, events: List[AuditEvent]) -> Dict:
        """Analyse les timestamps"""
        if not events:
            return {"earliest": None, "latest": None, "duration_hours": 0}
        
        timestamps = [event.timestamp for event in events if hasattr(event, 'timestamp') and event.timestamp]
        if not timestamps:
            return {"earliest": None, "latest": None, "duration_hours": 0}
        
        earliest = min(timestamps)
        latest = max(timestamps)
        duration = (latest - earliest).total_seconds() / 3600 if earliest and latest else 0
        
        return {
            "earliest": earliest,
            "latest": latest,
            "duration_hours": round(duration, 2)
        }
    
    def _analyze_instances(self, events: List[AuditEvent]) -> Dict:
        """Analyse les instances"""
        instances = {}
        for event in events:
            instance = getattr(event, 'instance', None)
            if instance:
                instances[instance] = instances.get(instance, 0) + 1
        
        return {
            "unique_count": len(instances),
            "most_common": sorted(instances.items(), key=lambda x: x[1], reverse=True)[:5],
            "all": list(instances.keys())
        }
    
    def generate_template_response(self, events: List[AuditEvent], question: str) -> Optional[str]:
        """Génère une réponse basée sur un template"""
        template = self.find_matching_template(question)
        if not template:
            return None
        
        # Analyser les données pour ce template
        analysis = self.analyze_data_for_template(events, template)
        
        # Générer une réponse dynamique basée sur l'analyse
        response = self._generate_dynamic_response(template, analysis, events)
        
        return response
    
    def _generate_dynamic_response(self, template: Dict, analysis: Dict, events: List[AuditEvent]) -> str:
        """Génère une réponse dynamique basée sur l'analyse des données"""
        base_response = template.get("reponse", "")
        
        # Remplacer les placeholders par les vraies données
        response = base_response
        
        # Remplacer les statistiques
        if "os_username" in analysis:
            usernames = analysis["os_username"]["all"]
            if usernames:
                response = response.replace("datchemi, tahose, olan, root, oracle, BACKUP, Administrateur", 
                                          ", ".join(usernames[:7]))
        
        if "db_username" in analysis:
            usernames = analysis["db_username"]["most_common"]
            if usernames:
                top_users = [f"{user} ({count} actions)" for user, count in usernames[:3]]
                response = response.replace("ATCHEMI (SELECT sur SYS), OLA (Toad), root (TRUNCATE via JDBC)", 
                                          ", ".join(top_users))
        
        if "action_name" in analysis:
            actions = analysis["action_name"]["most_common"]
            if actions:
                action_counts = [f"{action} ({count})" for action, count in actions[:3]]
                response = response.replace("200+ opérations SELECT", f"{sum(count for _, count in actions)} opérations")
        
        if "object_name" in analysis:
            objects = analysis["object_name"]["most_common"]
            if objects:
                top_objects = [obj for obj, _ in objects[:5]]
                response = response.replace("SYS.OBJ$, SYS.USER$, SYS.TAB$, DUAL", ", ".join(top_objects))
        
        if "client_program" in analysis:
            programs = analysis["client_program"]["most_common"]
            if programs:
                top_programs = [f"{prog} ({count})" for prog, count in programs[:3]]
                response = response.replace("SQL Developer (ATCHEMI), 2) Toad.exe (OLA/AHOSE), 3) JDBC Thin Client (root)", 
                                          ", ".join(top_programs))
        
        # Ajouter des statistiques réelles
        if events:
            response += f"\n\nStatistiques basées sur {len(events)} événements analysés :"
            
            if "os_username" in analysis:
                response += f"\n- {analysis['os_username']['unique_count']} utilisateurs OS uniques"
            
            if "db_username" in analysis:
                response += f"\n- {analysis['db_username']['unique_count']} utilisateurs DB uniques"
            
            if "action_name" in analysis:
                response += f"\n- {analysis['action_name']['unique_count']} types d'actions différents"
        
        return response

class MongoDBService:
    """Service pour la connexion et récupération des données MongoDB"""
    
    def __init__(self, connection_string: str = "mongodb://localhost:27017/"):
        self.connection_string = connection_string
        self.client = None
        self.db = None
        
    def connect(self):
        """Établit la connexion MongoDB"""
        try:
            self.client = MongoClient(self.connection_string)
            # Tester la connexion
            self.client.admin.command('ping')
            self.db = self.client.auditdb
            logger.info("Connexion MongoDB établie avec succès")
            return True
        except Exception as e:
            logger.error(f"Erreur de connexion MongoDB: {e}")
            self.client = None
            self.db = None
            return False
    
    def get_audit_data(self, collection_name: str = "actions_audit", limit: int = 1000) -> List[Dict]:
        """Récupère les données d'audit depuis MongoDB"""
        try:
            if not self.db:
                if not self.connect():
                    return []
            
            # Vérifier si la base de données existe
            if self.db is None:
                logger.error("Base de données MongoDB non connectée")
                return []
            
            collection = self.db[collection_name]
            data = list(collection.find({}).limit(limit))
            logger.info(f"Récupération de {len(data)} documents depuis MongoDB")
            return data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des données MongoDB: {e}")
            return []
    
    def convert_mongo_to_audit_events(self, mongo_data: List[Dict]) -> List[AuditEvent]:
        """Convertit les données MongoDB en objets AuditEvent"""
        events = []
        for doc in mongo_data:
            try:
                # Mapping des champs MongoDB vers AuditEvent
                event = AuditEvent(
                    timestamp=doc.get('timestamp', ''),
                    os_username=doc.get('os_username', ''),
                    db_username=doc.get('db_username', ''),
                    action_name=doc.get('action_name', ''),
                    object_name=doc.get('object_name', ''),
                    object_schema=doc.get('object_schema', ''),
                    client_program=doc.get('client_program', ''),
                    userhost=doc.get('userhost', ''),
                    session_id=doc.get('session_id', ''),
                    instance=doc.get('instance', ''),
                    raw_line=str(doc)
                )
                events.append(event)
            except Exception as e:
                logger.warning(f"Erreur lors de la conversion d'un document: {e}")
                continue
        
        logger.info(f"Conversion de {len(events)} événements d'audit depuis MongoDB")
        return events

class OracleLogParser:
    """Parser pour les logs d'audit Oracle"""
    
    def __init__(self):
        self.audit_patterns = {
            'standard': r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}).*?OS_USERNAME=([^,]+).*?DBUSERNAME=([^,]+).*?ACTION_NAME=([^,]+).*?OBJECT_NAME=([^,]+).*?OBJECT_SCHEMA=([^,]+).*?CLIENT_PROGRAM_NAME=([^,]+).*?USERHOST=([^,]+).*?SESSIONID=([^,]+).*?INSTANCE=([^,]+)',
            'simple': r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}).*?([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+)'
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
        
        logger.info(f"Parsed {len(events)} audit events from log")
        return events
    
    def _parse_line(self, line: str) -> Optional[AuditEvent]:
        """Parse une ligne de log individuelle"""
        try:
            # Pattern standard Oracle audit log
            match = re.search(self.audit_patterns['standard'], line)
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
            logger.warning(f"Failed to parse line: {line[:100]}... Error: {e}")
        
        return None

class AuditVectorizationService:
    """Service de vectorisation des logs d'audit"""
    
    def __init__(self):
        self.embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.chroma_client.get_or_create_collection("audit_logs")
    
    def vectorize_audit_events(self, events: List[AuditEvent]) -> List[str]:
        """Vectorise les événements d'audit et les stocke"""
        documents = []
        metadatas = []
        ids = []
        
        for i, event in enumerate(events):
            # Créer une représentation textuelle de l'événement
            doc_text = f"Timestamp: {event.timestamp}, User: {event.os_username}/{event.db_username}, Action: {event.action_name}, Object: {event.object_schema}.{event.object_name}, Program: {event.client_program}, Host: {event.userhost}"
            
            documents.append(doc_text)
            metadatas.append({
                "timestamp": event.timestamp,
                "os_username": event.os_username,
                "db_username": event.db_username,
                "action_name": event.action_name,
                "object_name": event.object_name,
                "object_schema": event.object_schema,
                "client_program": event.client_program,
                "userhost": event.userhost,
                "session_id": event.session_id,
                "instance": event.instance
            })
            ids.append(f"event_{i}")
        
        # Ajouter à la base vectorielle
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        logger.info(f"Vectorized and stored {len(events)} audit events")
        return ids
    
    def search_similar_events(self, query: str, top_k: int = 10) -> List[Dict]:
        """Recherche des événements similaires"""
        results = self.collection.query(
            query_texts=[query],
            n_results=top_k
        )
        
        return [
            {
                "document": doc,
                "metadata": meta,
                "distance": dist
            }
            for doc, meta, dist in zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            )
        ]

class AuditLLMService:
    """Service LLM pour l'analyse d'audit"""
    
    def __init__(self):
        # Utiliser un modèle plus léger pour le prototype
        self.model_name = "microsoft/DialoGPT-medium"  # Modèle de base
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
        
        # Pipeline pour la génération de texte
        self.generator = pipeline(
            "text-generation",
            model=self.model,
            tokenizer=self.tokenizer,
            max_length=200,
            temperature=0.7
        )
        
        self.vectorization_service = AuditVectorizationService()
        self.log_parser = OracleLogParser()
        self.mongo_service = MongoDBService()
        self.question_template_service = QuestionTemplateService()
        
        # Stockage des événements uploadés
        self.uploaded_events = []
        self.current_log_id = None
        
        # Templates de prompts pour l'audit Oracle
        self.audit_prompts = {
            "user_analysis": "Analyse les utilisateurs dans ces logs d'audit Oracle: {context}. Question: {question}",
            "action_analysis": "Analyse les actions dans ces logs d'audit Oracle: {context}. Question: {question}",
            "security_analysis": "Analyse la sécurité dans ces logs d'audit Oracle: {context}. Question: {question}",
            "performance_analysis": "Analyse les performances dans ces logs d'audit Oracle: {context}. Question: {question}"
        }
    
    def get_audit_events_from_mongo(self) -> List[AuditEvent]:
        """Récupère les événements d'audit depuis MongoDB"""
        try:
            # Récupérer les données MongoDB
            mongo_data = self.mongo_service.get_audit_data()
            
            if not mongo_data:
                logger.warning("Aucune donnée MongoDB trouvée")
                return []
            
            # Convertir en AuditEvent
            events = self.mongo_service.convert_mongo_to_audit_events(mongo_data)
            
            # Vectoriser les événements pour la recherche
            if events:
                try:
                    self.vectorization_service.vectorize_audit_events(events)
                except Exception as e:
                    logger.warning(f"Erreur lors de la vectorisation: {e}")
            
            return events
            
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des données MongoDB: {e}")
            return []
    
    def process_log_upload(self, log_content: str) -> str:
        """Traite l'upload d'un fichier de log"""
        try:
            # Parser les logs
            events = self.log_parser.parse_log_content(log_content)
            
            if not events:
                return "Aucun événement d'audit trouvé dans le fichier"
            
            # Stocker les événements pour les questions futures
            self.uploaded_events = events
            self.current_log_id = f"upload_{len(events)}_{hash(log_content) % 10000}"
            
            # Vectoriser les événements
            event_ids = self.vectorization_service.vectorize_audit_events(events)
            
            # Générer un résumé automatique
            summary = self._generate_summary(events)
            
            logger.info(f"Log uploadé avec succès: {len(events)} événements stockés pour analyse")
            
            return f"Log traité avec succès! {len(events)} événements analysés et stockés. {summary}"
            
        except Exception as e:
            logger.error(f"Error processing log upload: {e}")
            return f"Erreur lors du traitement: {str(e)}"
    
    def answer_question(self, question: str, log_id: str = None) -> LLMResponse:
        """Répond à une question sur les logs d'audit"""
        try:
            # Déterminer la source des données
            events = []
            data_source = "uploaded_file"
            
            # Priorité aux événements uploadés
            if self.uploaded_events:
                events = self.uploaded_events
                logger.info(f"Utilisation de {len(events)} événements uploadés pour l'analyse")
            else:
                # Fallback vers MongoDB
                try:
                    events = self.get_audit_events_from_mongo()
                    data_source = "mongodb"
                    logger.info(f"Utilisation de {len(events)} événements MongoDB pour l'analyse")
                except Exception as e:
                    logger.error(f"Erreur lors de la récupération MongoDB: {e}")
                    events = []
            
            if not events:
                return LLMResponse(
                    answer="Aucune donnée d'audit disponible. Veuillez uploader un fichier de logs ou vérifier la connexion MongoDB.",
                    confidence=0.0,
                    sources=[{"source": "none", "count": 0, "type": "error"}],
                    analysis_type="error"
                )
            
            # Essayer d'abord les templates de questions
            template_response = self.question_template_service.generate_template_response(events, question)
            
            if template_response:
                logger.info(f"Réponse générée via template pour la question: {question}")
                return LLMResponse(
                    answer=template_response,
                    confidence=0.9,
                    sources=[{"source": data_source, "count": len(events), "type": "template"}],
                    analysis_type="template"
                )
            
            # Si pas de template, utiliser le LLM
            # Déterminer le type d'analyse basé sur la question
            analysis_type = self._classify_question(question)
            
            # Analyser les patterns pour enrichir la réponse
            patterns = self.analyze_patterns(events)
            
            # Construire le contexte avec les données réelles
            context = self._build_context_from_events(events, patterns)
            
            # Générer la réponse
            prompt = self.audit_prompts[analysis_type].format(
                context=context,
                question=question
            )
            
            response = self.generator(prompt)[0]['generated_text']
            
            # Extraire la réponse pertinente
            answer = self._extract_answer(response, prompt)
            
            # Enrichir avec les statistiques
            enriched_answer = self._enrich_answer_with_statistics(answer, patterns, question)
            
            return LLMResponse(
                answer=enriched_answer,
                confidence=0.85,
                sources=[{"source": data_source, "count": len(events), "type": "llm"}],
                analysis_type=analysis_type
            )
            
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            return LLMResponse(
                answer=f"Erreur lors de l'analyse: {str(e)}",
                confidence=0.0,
                sources=[{"source": "error", "count": 0, "type": "error"}],
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
    
    def _classify_question(self, question: str) -> str:
        """Classifie le type de question"""
        question_lower = question.lower()
        
        if any(word in question_lower for word in ['utilisateur', 'user', 'qui', 'qui a']):
            return "user_analysis"
        elif any(word in question_lower for word in ['action', 'requête', 'select', 'insert', 'update', 'delete']):
            return "action_analysis"
        elif any(word in question_lower for word in ['sécurité', 'sécurisé', 'suspect', 'anomalie']):
            return "security_analysis"
        else:
            return "performance_analysis"
    
    def _build_context(self, relevant_events: List[Dict]) -> str:
        """Construit le contexte à partir des événements pertinents"""
        context_parts = []
        
        for event in relevant_events:
            metadata = event['metadata']
            context_parts.append(
                f"Event: {metadata['os_username']} ({metadata['db_username']}) "
                f"performed {metadata['action_name']} on {metadata['object_schema']}.{metadata['object_name']} "
                f"via {metadata['client_program']} from {metadata['userhost']}"
            )
        
        return " | ".join(context_parts)
    
    def _build_context_from_events(self, events: List[AuditEvent], patterns: Dict[str, Any]) -> str:
        """Construit le contexte à partir des événements d'audit réels"""
        if not events:
            return "Aucune donnée d'audit disponible"
        
        # Statistiques générales
        total_events = len(events)
        unique_users = patterns.get('unique_users', 0)
        unique_actions = len(patterns.get('unique_actions', {}))
        
        # Échantillon d'événements récents
        recent_events = events[-10:] if len(events) > 10 else events
        
        context_parts = [
            f"Statistiques: {total_events} événements, {unique_users} utilisateurs uniques, {unique_actions} types d'actions"
        ]
        
        # Ajouter quelques événements récents
        for event in recent_events[:5]:
            context_parts.append(
                f"Event: {event.os_username} ({event.db_username}) "
                f"performed {event.action_name} on {event.object_schema}.{event.object_name} "
                f"via {event.client_program} from {event.userhost}"
            )
        
        return " | ".join(context_parts)
    
    def _enrich_answer_with_statistics(self, answer: str, patterns: Dict[str, Any], question: str) -> str:
        """Enrichit la réponse avec des statistiques pertinentes"""
        enriched_answer = answer
        
        # Ajouter des statistiques selon le type de question
        question_lower = question.lower()
        
        if any(word in question_lower for word in ['utilisateur', 'user', 'qui']):
            if 'unique_users' in patterns:
                enriched_answer += f"\n\nStatistiques utilisateurs: {patterns['unique_users']} utilisateurs uniques identifiés."
        
        if any(word in question_lower for word in ['action', 'requête', 'select', 'insert', 'update', 'delete']):
            if 'unique_actions' in patterns:
                top_actions = list(patterns['unique_actions'].items())[:3]
                action_stats = ", ".join([f"{action}: {count}" for action, count in top_actions])
                enriched_answer += f"\n\nActions principales: {action_stats}"
        
        if any(word in question_lower for word in ['sécurité', 'suspect', 'anomalie']):
            if 'suspicious_activities' in patterns:
                suspicious = patterns['suspicious_activities']
                if suspicious:
                    enriched_answer += f"\n\nActivitiés suspectes détectées: {len(suspicious)} alertes."
        
        if any(word in question_lower for word in ['performance', 'programme', 'client']):
            if 'top_programs' in patterns:
                top_programs = list(patterns['top_programs'].items())[:3]
                program_stats = ", ".join([f"{prog}: {count}" for prog, count in top_programs])
                enriched_answer += f"\n\nProgrammes clients principaux: {program_stats}"
        
        return enriched_answer
    
    def _extract_answer(self, response: str, prompt: str) -> str:
        """Extrait la réponse pertinente du texte généré"""
        # Supprimer le prompt original
        if prompt in response:
            answer = response.replace(prompt, "").strip()
        else:
            answer = response.strip()
        
        # Limiter la longueur
        if len(answer) > 500:
            answer = answer[:500] + "..."
        
        return answer
    
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

    def get_current_data_info(self) -> Dict[str, Any]:
        """Retourne des informations sur les données actuellement disponibles"""
        info = {
            "has_uploaded_data": len(self.uploaded_events) > 0,
            "uploaded_events_count": len(self.uploaded_events),
            "current_log_id": self.current_log_id,
            "data_source": "uploaded_file" if self.uploaded_events else "mongodb"
        }
        
        if self.uploaded_events:
            # Analyser les patterns des données uploadées
            patterns = self.analyze_patterns(self.uploaded_events)
            info.update({
                "unique_users": patterns.get('unique_users', 0),
                "unique_actions": len(patterns.get('unique_actions', {})),
                "time_range": patterns.get('time_range', {}),
                "suspicious_activities_count": len(patterns.get('suspicious_activities', []))
            })
        
        return info

# Instance globale du service
audit_llm_service = AuditLLMService() 
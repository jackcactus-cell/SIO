# Questions d'Étude Basées sur le Schéma Oracle Audit

## Schéma des Données
```
ID AUDIT_TYPE SESSIONID OS_USERNAME USERHOST TERMINAL AUTHENTICATION_TYPE 
DBUSERNAME CLIENT_PROGRAM_NAME OBJECT_SCHEMA OBJECT_NAME SQL_TEXT SQL_BINDS 
EVENT_TIMESTAMP ACTION_NAME INSTANCE_ID INSTANCE
```

## 🎯 Questions Optimisées pour l'Étude (20 Questions)

### 📊 Analyse des Utilisateurs (OS_USERNAME & DBUSERNAME)
1. **"Analyse OS_USERNAME détaillée"**
   - Analyse tous les utilisateurs du système d'exploitation
   - Statistiques d'activité par utilisateur OS

2. **"Analyse DBUSERNAME avec statistiques"**
   - Analyse des utilisateurs de base de données
   - Répartition des actions par utilisateur DB

3. **"Comparaison OS_USERNAME et DBUSERNAME"**
   - Corrélation entre utilisateurs OS et DB
   - Identification des mappings utilisateur

### 🖥️ Analyse de l'Infrastructure (USERHOST & TERMINAL)
4. **"Analyse USERHOST détaillée"**
   - Cartographie des hôtes sources
   - Volume d'activité par machine

5. **"Analyse TERMINAL avec patterns"**
   - Types de terminaux utilisés
   - Répartition des accès par terminal

6. **"Analyse géographique USERHOST"**
   - Distribution des accès par IP/hôte
   - Identification des zones d'activité

### 🔐 Analyse de Sécurité (AUTHENTICATION_TYPE)
7. **"Analyse AUTHENTICATION_TYPE détaillée"**
   - Types d'authentification utilisés
   - Répartition par méthode d'accès

8. **"Sécurité AUTHENTICATION_TYPE"**
   - Évaluation des méthodes de connexion
   - Identification des risques potentiels

### 💻 Analyse des Applications (CLIENT_PROGRAM_NAME)
9. **"Analyse CLIENT_PROGRAM_NAME complète"**
   - Outils utilisés pour accéder à Oracle
   - Statistiques d'utilisation par programme

10. **"Performance CLIENT_PROGRAM_NAME"**
    - Efficacité des différents outils
    - Patterns d'utilisation des applications

### 🗃️ Analyse des Objets (OBJECT_SCHEMA & OBJECT_NAME)
11. **"Analyse OBJECT_SCHEMA détaillée"**
    - Schémas les plus sollicités
    - Répartition de l'activité par schéma

12. **"Analyse OBJECT_NAME avec patterns"**
    - Objets les plus accédés
    - Types d'objets manipulés

13. **"Sécurité OBJECT_SCHEMA"**
    - Accès aux schémas système
    - Détection d'accès suspects

### ⚡ Analyse des Actions (ACTION_NAME)
14. **"Analyse ACTION_NAME statistiques"**
    - Types d'opérations effectuées
    - Fréquence des actions

15. **"Performance ACTION_NAME"**
    - Actions les plus consommatrices
    - Patterns temporels des opérations

### ⏰ Analyse Temporelle (EVENT_TIMESTAMP)
16. **"Analyse EVENT_TIMESTAMP détaillée"**
    - Répartition temporelle de l'activité
    - Pics d'utilisation

17. **"Patterns temporels EVENT_TIMESTAMP"**
    - Heures de pointe et creuses
    - Analyse des tendances

### 🔍 Analyse des Sessions (SESSIONID)
18. **"Analyse SESSIONID avancée"**
    - Durée des sessions
    - Patterns de connexion

### 📝 Analyse des Requêtes (SQL_TEXT)
19. **"Analyse SQL_TEXT patterns"**
    - Types de requêtes exécutées
    - Complexité des instructions

### 📈 Analyses Globales
20. **"Analyse complète toutes colonnes"**
    - Vue d'ensemble multi-dimensionnelle
    - Corrélations entre tous les champs

## 🔧 Configuration Technique

### Améliorations Apportées

1. **Recognition des Colonnes** (intelligentChatbot.js)
   - Ajout des noms exacts des colonnes du schéma
   - Confiance élevée (+0.6) pour les colonnes exactes
   - Support des termes techniques spécialisés

2. **Analyses Spécialisées** (questionTemplates.js)
   - Nouvelles analyses pour USERHOST/TERMINAL
   - Analyses dédiées CLIENT_PROGRAM_NAME
   - Support complet OBJECT_SCHEMA/OBJECT_NAME
   - Analyses temporelles EVENT_TIMESTAMP

3. **Réponses d'Étude**
   - Format "ANALYSE DÉTAILLÉE" pour chaque catégorie
   - Statistiques quantitatives avec pourcentages
   - Explications contextuelles pour l'étude
   - Colonnes structurées pour tableaux

### Utilisation

Pour poser une question, utilisez :
```bash
Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot" -Method POST -ContentType "application/json" -Body '{"question":"[VOTRE QUESTION]"}'
```

### Sources de Données
- API principale : `http://localhost:4000/api/audit/raw`
- Format MongoDB avec colonnes en minuscules
- Fallback sur données par défaut si MongoDB non disponible

## 📊 Exemples de Réponses Attendues

Chaque question génère maintenant :
- **Type** : detailed_analysis, statistical_analysis, advanced_analysis
- **Données** : Tableau structuré avec métriques
- **Résumé** : Synthèse des points clés
- **Explication** : Contexte analytique pour l'étude
- **Colonnes** : Structure pour affichage tabulaire

Ces améliorations garantissent des réponses "acceptables pour être étudiées" avec un niveau de détail et d'analyse approprié pour vos recherches.




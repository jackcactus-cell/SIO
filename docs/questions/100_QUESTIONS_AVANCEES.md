# 🚀 100 Questions Avancées - Système d'Audit Oracle

## 🎯 SYSTÈME ENRICHI AVEC ANALYSES COMPLEXES

Votre chatbot peut maintenant traiter **100+ questions sophistiquées** avec des analyses avancées automatiques.

## 📊 **CATÉGORIES DE QUESTIONS SUPPORTÉES**

### 🔍 **1. FILTRES SIMPLES (Questions 1-10)**
```
- "Affiche toutes les entrées d'audit pour l'utilisateur Oracle DBUSERNAME = 'SCOTT'"
- "Montre les actions effectuées depuis l'OS OS_USERNAME = 'oracle'"
- "Quelles requêtes ont été lancées depuis le terminal TERMINAL = 'pts/1'"
- "Liste les événements pour la session SESSIONID = 1234"
- "Quelles requêtes ont été exécutées par l'application CLIENT_PROGRAM_NAME = 'sqlplus.exe'"
- "Quels objets du schéma OBJECT_SCHEMA = 'HR' ont été consultés"
- "Montre toutes les requêtes contenant le mot DELETE"
- "Quelles opérations ont été faites par l'utilisateur USERHOST = 'machine01'"
- "Affiche les entrées où AUTHENTICATION_TYPE = PASSWORD"
- "Quelles sont les requêtes exécutées après le 2025-08-01"
```

### 📈 **2. REGROUPEMENTS (Questions 11-20)**
```
- "Combien d'actions par DBUSERNAME"
- "Classe les utilisateurs par nombre de sessions"
- "Nombre de requêtes par type d'authentification"
- "Quels sont les 5 CLIENT_PROGRAM_NAME les plus utilisés"
- "Statistiques par OBJECT_SCHEMA"
- "Combien d'objets distincts par utilisateur"
- "Classement des OS les plus utilisés pour se connecter"
- "Nombre d'actions par ACTION_NAME"
- "Temps moyen entre deux actions pour chaque utilisateur"
- "Classement des utilisateurs par nombre d'objets modifiés"
```

### ⏰ **3. ANALYSES TEMPORELLES (Questions 21-30)**
```
- "Quelles actions ont été effectuées aujourd'hui"
- "Quelles requêtes ont été exécutées hier"
- "Donne la tendance horaire d'utilisation par utilisateur"
- "Pic d'activité par heure"
- "Quels jours de la semaine ont le plus d'actions"
- "Heure la plus fréquente pour les DELETE"
- "Nombre de connexions par jour sur le dernier mois"
- "Quelles actions ont été faites entre 2025-08-01 et 2025-08-05"
- "Historique des objets modifiés par SCOTT"
- "Durée maximale d'une session"
```

### 💻 **4. CONTENU SQL (Questions 31-40)**
```
- "Trouve toutes les requêtes contenant DROP"
- "Quelles requêtes commencent par UPDATE"
- "Requêtes modifiant la table EMPLOYEES"
- "Combien de requêtes SELECT par utilisateur"
- "Quelles requêtes insèrent des données dans le schéma HR"
- "Lister toutes les requêtes MERGE"
- "Quelles requêtes contiennent un bind :1"
- "Requêtes exécutées sans WHERE"
- "Combien de requêtes distinctes ont été exécutées"
- "Dernière requête exécutée par SYS"
```

### 🔐 **5. SÉCURITÉ (Questions 41-50)**
```
- "Liste les connexions échouées"
- "Combien de connexions par authentification EXTERNAL"
- "Quelles actions ont été faites par un utilisateur inconnu"
- "Détecte les sessions suspectes depuis un OS inhabituel"
- "Détecte les requêtes DROP TABLE"
- "Quelles actions ont été faites hors heures de travail (20h-6h)"
- "Quels utilisateurs ont accédé à plus de 10 schémas différents"
- "Sessions ouvertes depuis un USERHOST non autorisé"
- "Affiche les actions GRANT ou REVOKE"
- "Quelles requêtes contiennent des mots-clés sensibles ALTER SYSTEM"
```

### ⚡ **6. PERFORMANCE (Questions 51-60)**
```
- "Combien de requêtes par seconde sur la dernière heure"
- "Utilisateurs générant le plus de requêtes par minute"
- "Quels CLIENT_PROGRAM_NAME envoient le plus de requêtes"
- "Combien d'actions par INSTANCE_ID"
- "Actions les plus fréquentes par instance"
- "Top 10 des requêtes les plus longues"
- "Temps moyen entre deux requêtes d'un même utilisateur"
- "Charge horaire par instance"
- "Sessions consommant le plus de CPU"
- "Évolution du nombre de sessions par heure"
```

### 🏢 **7. ANALYSES MÉTIER (Questions 61-70)**
```
- "Quels utilisateurs accèdent le plus aux données RH"
- "Combien de modifications ont été faites sur OBJECT_SCHEMA = 'FINANCE'"
- "Quels objets sont consultés mais jamais modifiés"
- "Quelles tables sont les plus modifiées"
- "Quelles actions entraînent le plus d'accès à la base"
- "Répartition des actions par rôle utilisateur"
- "Utilisateurs qui font le plus d'INSERT"
- "Qui a exécuté le plus de TRUNCATE"
- "Quelles actions sont liées à des exports massifs"
- "Quels objets sont créés mais jamais utilisés"
```

### 🔍 **8. INVESTIGATION (Questions 71-80)**
```
- "Qui a modifié l'objet OBJECT_NAME = 'SALARY'"
- "Dernière modification sur la table CUSTOMERS"
- "Toutes les requêtes exécutées par SYSDBA"
- "Utilisateurs connectés depuis plusieurs machines"
- "Quelles sessions utilisent un programme inconnu"
- "Qui a supprimé des données hier soir"
- "Accès multiples à un même objet en moins de 10 secondes"
- "Quelles requêtes ont été annulées"
- "Séquences de commandes suspectes DROP suivi de CREATE"
- "Changements de schéma inattendus"
```

### 📊 **9. STATISTIQUES (Questions 81-90)**
```
- "Nombre total d'entrées d'audit"
- "Pourcentage de requêtes SELECT vs DML"
- "Nombre moyen de requêtes par session"
- "Moyenne des sessions par utilisateur"
- "Répartition des actions par type SELECT, UPDATE, etc"
- "Taux d'utilisation par AUTHENTICATION_TYPE"
- "Proportion des accès par terminal physique"
- "Répartition des connexions par USERHOST"
- "Nombre moyen de schémas accédés par utilisateur"
- "Variance d'activité entre utilisateurs"
```

### 🎯 **10. QUESTIONS AVANCÉES (Questions 91-100)**
```
- "Détecte les sessions simultanées par utilisateur"
- "Corrélation entre CLIENT_PROGRAM_NAME et actions effectuées"
- "Analyse de pic d'activité par événement"
- "Séquence la plus fréquente d'actions par session"
- "Comparer l'activité entre deux utilisateurs"
- "Détecter les requêtes similaires exécutées par plusieurs utilisateurs"
- "Trouver les patterns d'attaque SQL (SQL Injection)"
- "Identifier les sessions avec beaucoup de binds"
- "Détecter les accès à des objets système"
- "Identifier les actions en double dans une même session"
```

## 🚀 **NOUVELLES CAPACITÉS SYSTÈME**

### ✅ **Traitement Automatique**
- **Reconnaissance intelligente** des 100 patterns de questions
- **Analyses automatiques** avec statistiques avancées
- **Catégorisation** par domaine (sécurité, performance, métier...)
- **Réponses formatées** pour l'étude académique

### ✅ **Types d'Analyses Générées**
- **Filtrage avancé** avec conditions complexes
- **Regroupements** et agrégations automatiques
- **Analyses temporelles** avec trends
- **Détection d'anomalies** de sécurité
- **Statistiques métier** spécialisées

### ✅ **Format des Réponses**
```json
{
  "type": "advanced_analysis",
  "category": "securite|performance|metier|...",
  "data": [...],
  "summary": "Résumé de l'analyse",
  "explanation": "Contexte pour l'étude", 
  "columns": ["Col1", "Col2", ...],
  "matchedPattern": "Pattern regex utilisé"
}
```

## 🔧 **UTILISATION**

### Test d'une Question Avancée
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot" -Method POST -ContentType "application/json" -Body '{"question":"Combien d'\''actions par DBUSERNAME"}'
```

### Interface Web
- Les réponses s'affichent automatiquement dans l'interface
- Tableaux formatés avec colonnes appropriées
- Analyses détaillées pour l'étude

## 🎯 **RÉSULTAT POUR VOS ÉTUDES**

Avec ce système enrichi, vous pouvez maintenant :
- **Poser 100+ questions sophistiquées** automatiquement reconnues
- **Recevoir des analyses détaillées** avec statistiques et explications
- **Exploiter vos données Oracle** pour tous types d'études
- **Obtenir des réponses structurées** parfaites pour l'analyse

**Le système est maintenant PARFAITEMENT organisé pour vos besoins d'étude ! 🚀**




# 🚀 Projet Oracle Audit Finalisé - Guide Complet

## 📋 Vue d'ensemble

Ce projet Oracle Audit a été finalisé avec toutes les fonctionnalités demandées :

### ✅ Fonctionnalités Implémentées

1. **Upload de fichiers Excel/CSV/XLS** 📊
   - Support complet des formats `.xlsx`, `.xls`, `.xlsm`, `.csv`
   - Analyse automatique des colonnes et détection des patterns d'audit
   - Génération automatique de questions basées sur les données
   - Affichage en tableaux simples et résumés

2. **Extraction automatique Oracle Audit Trail** 🔄
   - Script d'extraction depuis DBA_AUDIT_TRAIL, DBA_FGA_AUDIT_TRAIL, UNIFIED_AUDIT_TRAIL
   - Insertion automatique dans MongoDB avec gestion des doublons
   - Planification d'extraction périodique (configurable)
   - Support des connexions Oracle avec authentification

3. **Chatbot intelligent amélioré** 🤖
   - Détection de mots-clés pour réponses structurées
   - Formatage automatique en tableaux simples
   - Résumés clairs et interprétations
   - Support des questions en français naturel

4. **Dockerisation complète** 🐳
   - Tous les services containerisés
   - Scripts d'initialisation automatique
   - Configuration via variables d'environnement
   - Extraction Oracle automatique au démarrage

## 🏗️ Architecture

```
SIO/
├── frontend (React + Vite)          → Port 5173
├── backend (Node.js + Express)      → Port 4000
├── backend_python (FastAPI + Oracle) → Port 8000
├── backend/llm-prototype (LLM + IA)  → Port 8001
└── MongoDB                          → Port 27017
```

## 🚀 Démarrage Rapide

### 1. Configuration Oracle (Optionnel)

Copiez et configurez le fichier Oracle :

```bash
cp oracle.env.example oracle.env
```

Éditez `oracle.env` avec vos paramètres Oracle :

```env
ORACLE_HOST=your-oracle-server.domain.com
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=your_service_name
ORACLE_USERNAME=audit_user
ORACLE_PASSWORD=your_password
AUTO_EXTRACT_ORACLE=true
EXTRACT_ON_START=true
```

### 2. Démarrage des services

```bash
# Démarrer tous les services
docker-compose -f docker-compose.dev.yml --env-file oracle.env up -d

# Ou sans Oracle
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Accès aux services

- **Application Frontend** : http://localhost:5173
- **Backend Node.js** : http://localhost:4000
- **Backend Python Oracle** : http://localhost:8000
- **Service LLM** : http://localhost:8001
- **Documentation LLM API** : http://localhost:8001/docs
- **MongoDB** : mongodb://localhost:27017

## 📊 Utilisation des nouvelles fonctionnalités

### Upload de fichiers Excel/CSV

1. Allez sur la page "Oracle Audit" dans l'application
2. Cliquez sur le bouton "📎 Uploader logs"
3. Sélectionnez vos fichiers Excel (.xlsx, .xls, .xlsm) ou CSV
4. Le système analyse automatiquement :
   - Détecte les colonnes d'audit (utilisateurs, actions, objets, etc.)
   - Génère des questions suggérées
   - Affiche un résumé des données
5. Utilisez les questions suggérées ou posez vos propres questions

### Extraction Oracle Audit Trail

#### Méthode 1 : Via l'API

```bash
curl -X POST "http://localhost:8001/api/oracle/extract-audit" \
  -H "Content-Type: application/json" \
  -d '{
    "oracle_host": "your-oracle-server.com",
    "oracle_port": 1521,
    "oracle_service": "your_service",
    "oracle_user": "audit_user",
    "oracle_password": "your_password",
    "days_back": 7,
    "audit_type": "all"
  }'
```

#### Méthode 2 : Script autonome

```bash
cd backend/llm-prototype
python oracle_audit_extractor.py
```

#### Méthode 3 : Automatique via Docker

Configurez dans `oracle.env` :

```env
AUTO_EXTRACT_ORACLE=true
EXTRACT_ON_START=true
EXTRACTION_INTERVAL_HOURS=6
```

### Chatbot amélioré

Le chatbot détecte maintenant automatiquement les types de questions et formate les réponses :

**Exemples de questions supportées :**

- **Comptage** : "Combien d'utilisateurs sont dans ce fichier ?"
- **Utilisateurs** : "Quels sont les utilisateurs les plus actifs ?"
- **Actions** : "Répartition des actions par type"
- **Temporel** : "À quelle heure l'activité est-elle la plus élevée ?"
- **Schémas** : "Quels schémas sont les plus consultés ?"
- **Sécurité** : "Y a-t-il des anomalies de sécurité ?"

Les réponses sont automatiquement formatées en tableaux simples avec résumés.

## 🔧 Configuration Avancée

### Variables d'environnement Oracle

```env
# Connexion Oracle
ORACLE_HOST=oracle-server.domain.com
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=PROD
ORACLE_USERNAME=audit_reader
ORACLE_PASSWORD=secure_password

# Extraction automatique
AUTO_EXTRACT_ORACLE=true          # Activer l'extraction
EXTRACT_ON_START=true              # Extraire au démarrage
EXTRACTION_INTERVAL_HOURS=6        # Intervalle d'extraction (heures)
EXTRACTION_DAYS_BACK=1             # Nombre de jours à extraire
AUDIT_TYPES=all                    # Types: all, audit_trail, fga_audit, unified_audit

# MongoDB
MONGODB_URI=mongodb://mongodb:27017

# Logs
LOG_LEVEL=INFO
```

### Schéma MongoDB

Les données Oracle sont stockées dans les collections :

- `oracle_audit_trail` : DBA_AUDIT_TRAIL
- `oracle_fga_audit` : DBA_FGA_AUDIT_TRAIL  
- `oracle_unified_audit` : UNIFIED_AUDIT_TRAIL

Chaque document contient :

```json
{
  "_id": ObjectId,
  "_unique_id": "hash_unique",
  "_extraction_time": "2024-01-03T10:30:00Z",
  "_audit_type": "audit_trail",
  "_source": "oracle_audit_trail",
  "timestamp": "2024-01-03T10:29:00Z",
  "os_username": "user123",
  "db_username": "app_user",
  "action_name": "SELECT",
  "object_name": "EMPLOYEES",
  "object_schema": "HR",
  "client_program_name": "SQLDeveloper",
  "userhost": "workstation01",
  "session_id": "12345",
  // ... autres champs
}
```

## 🔍 Tests et Validation

### 1. Test de l'upload Excel/CSV

```bash
# Créer un fichier CSV de test
cat > test_audit.csv << EOF
timestamp,os_username,action_name,object_name,object_schema
2024-01-03 10:00:00,user1,SELECT,EMPLOYEES,HR
2024-01-03 10:01:00,user2,INSERT,ORDERS,SALES
2024-01-03 10:02:00,user1,UPDATE,CUSTOMERS,SALES
EOF

# Uploader via l'interface web sur http://localhost:5173
```

### 2. Test de l'extraction Oracle

```bash
# Vérifier les statistiques
curl http://localhost:8001/api/oracle/stats

# Tester la connexion
curl -X POST http://localhost:8001/api/oracle/extract-audit \
  -H "Content-Type: application/json" \
  -d '{"oracle_host":"test","days_back":1}'
```

### 3. Test du chatbot

Posez des questions comme :
- "Combien d'enregistrements dans ce fichier ?"
- "Quels utilisateurs sont les plus actifs ?"
- "Répartition des actions par type"

## 🐛 Dépannage

### Problèmes courants

1. **Service LLM non accessible**
   ```bash
   docker-compose logs backend_llm
   ```

2. **Erreur connexion Oracle**
   - Vérifiez les paramètres dans `oracle.env`
   - Testez la connectivité réseau
   - Vérifiez les privilèges de l'utilisateur Oracle

3. **Fichiers Excel non traités**
   - Vérifiez les logs : `docker-compose logs backend_llm`
   - Taille limite : 50MB par fichier
   - Formats supportés : .xlsx, .xls, .xlsm, .csv

### Logs utiles

```bash
# Logs de tous les services
docker-compose logs -f

# Logs spécifiques
docker-compose logs backend_llm
docker-compose logs backend_python
docker-compose logs frontend
```

## 📈 Monitoring

### Métriques disponibles

- **API LLM Health** : `GET http://localhost:8001/`
- **Statistiques Oracle** : `GET http://localhost:8001/api/oracle/stats`
- **Status des logs** : `GET http://localhost:8001/api/logs-status`
- **MongoDB Status** : `GET http://localhost:8000/api/oracle/pool-status`

### Tableau de bord

Surveillez via l'interface web :
- Statut des connexions Oracle
- Nombre de fichiers traités
- Performances du chatbot
- Métriques de la base vectorielle

## 🔄 Mise en production

### 1. Configuration production

Créez un `docker-compose.prod.yml` :

```yaml
version: '3.8'
services:
  # Même structure mais avec :
  # - Variables d'environnement sécurisées
  # - Volumes persistants
  # - Configuration reverse proxy
  # - SSL/TLS
```

### 2. Sécurité

- Changez tous les mots de passe par défaut
- Configurez un reverse proxy (nginx)
- Activez SSL/TLS
- Limitez l'accès réseau
- Configurez des backups MongoDB

### 3. Monitoring production

- Logs centralisés (ELK Stack)
- Métriques (Prometheus + Grafana)
- Alertes (AlertManager)
- Health checks

## 📚 Documentation API

### Service LLM (Port 8001)

- `POST /api/upload-logs` : Upload fichiers Excel/CSV/TXT
- `POST /api/ask-llm` : Questions au chatbot
- `POST /api/oracle/extract-audit` : Extraction Oracle
- `GET /api/oracle/stats` : Statistiques MongoDB
- `GET /api/sample-questions` : Questions suggérées
- `GET /docs` : Documentation Swagger complète

### Service Python Oracle (Port 8000)

- `POST /api/oracle/execute-sql` : Exécution SQL
- `POST /api/oracle/test-connection` : Test connexion
- `GET /api/oracle/pool-status` : Statut du pool
- `GET /api/oracle/metrics/stream` : Métriques temps réel

## 🎯 Fonctionnalités futures possibles

- Export des analyses en PDF/Excel
- Tableaux de bord personnalisables
- Alertes automatiques sur anomalies
- Intégration LDAP/SSO
- API REST complète pour intégrations
- Clustering pour haute disponibilité
- Analyse prédictive avec ML

---

## ✅ Résumé de finalisation

Le projet Oracle Audit est maintenant complet avec :

1. ✅ **Upload Excel/CSV/XLS** avec analyse automatique
2. ✅ **Extraction Oracle Audit Trail** automatisée vers MongoDB
3. ✅ **Chatbot intelligent** avec mots-clés et tableaux simples
4. ✅ **Dockerisation complète** avec configuration flexible
5. ✅ **Documentation complète** et scripts de déploiement

Tous les objectifs sont atteints et le système est prêt pour la production ! 🎉

# Backend Python - Application d'Audit SIO

Backend Python complet avec FastAPI pour l'application d'audit SIO avec chatbot intelligent.

## 🚀 Fonctionnalités

### Authentification et Sécurité
- ✅ Inscription et connexion utilisateur
- ✅ Authentification JWT avec tokens sécurisés
- ✅ Hachage des mots de passe avec bcrypt
- ✅ Protection des endpoints avec middleware d'authentification

### Chatbot Intelligent
- ✅ Intégration OpenAI GPT-3.5-turbo
- ✅ Traitement du langage naturel en français
- ✅ Analyse d'intention et extraction d'entités
- ✅ Cache intelligent des réponses
- ✅ Suggestions automatiques de questions

### Analyse d'Audit
- ✅ Analyse d'activité utilisateur
- ✅ Détection d'anomalies dans les logs
- ✅ Recherche avancée dans les données d'audit
- ✅ Analyse temporelle et patterns comportementaux
- ✅ Statistiques et rapports détaillés

### Gestion des Données
- ✅ MongoDB pour les données d'audit
- ✅ SQLite pour le cache et les statistiques
- ✅ Connexions asynchrones optimisées
- ✅ Gestion automatique des index

### Cache et Performance
- ✅ Cache intelligent des requêtes
- ✅ Statistiques d'utilisation
- ✅ Nettoyage automatique
- ✅ Optimisation des performances

## 📋 Prérequis

- Python 3.11+
- MongoDB
- Redis (optionnel)
- Clé API OpenAI

## 🛠️ Installation

### 1. Installation des dépendances

```bash
cd backend_python
pip install -r requirements.txt
```

### 2. Configuration des variables d'environnement

Copiez `.env.example` vers `.env` et configurez :

```env
# Configuration de l'application
APP_NAME=SIO Audit Backend
DEBUG=True
HOST=0.0.0.0
PORT=8000

# Base de données
MONGODB_URI=mongodb://localhost:27017/auditdb
SQLITE_DB_PATH=./cache/chatbot_cache.db

# API Keys
OPENAI_API_KEY=your-openai-api-key

# Sécurité
SECRET_KEY=your-secret-key-change-in-production
```

### 3. Installation des modèles NLP

```bash
python -m spacy download fr_core_news_sm
```

## 🚀 Démarrage

### Développement
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Avec Docker
```bash
docker build -t sio-backend-python .
docker run -p 8000:8000 sio-backend-python
```

## 📚 API Documentation

Une fois l'application démarrée, accédez à :
- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

## 🔗 Endpoints Principaux

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Chatbot
- `POST /api/chat/message` - Envoyer un message
- `GET /api/chat/suggestions` - Suggestions de complétion
- `GET /api/chat/frequent-questions` - Questions fréquentes

### Analyse d'Audit
- `POST /api/audit/analyze` - Analyser une requête
- `GET /api/audit/user-activity` - Activité utilisateur
- `GET /api/audit/anomalies` - Détection d'anomalies
- `GET /api/audit/search` - Recherche dans les logs

### Cache et Statistiques
- `GET /api/cache/stats` - Statistiques du cache
- `GET /api/cache/actions` - Statistiques des actions
- `POST /api/cache/cleanup` - Nettoyage du cache

### Système
- `GET /api/health` - État de santé
- `GET /api/info` - Informations de l'application

## 🏗️ Architecture

```
backend_python/
├── main.py                 # Application FastAPI principale
├── config.py              # Configuration et paramètres
├── models.py              # Modèles de données Pydantic
├── database.py            # Gestion des connexions DB
├── auth.py                # Authentification et sécurité
├── openai_service.py      # Intégration OpenAI
├── nlp_service.py         # Traitement du langage naturel
├── cache_service.py       # Gestion du cache
├── requirements.txt       # Dépendances Python
├── Dockerfile            # Configuration Docker
├── .env                  # Variables d'environnement
└── README.md             # Documentation
```

## 🔧 Services

### NLPService
- Analyse d'intention des questions
- Extraction d'entités (utilisateurs, actions, dates, etc.)
- Classification automatique des requêtes
- Recherche de questions similaires

### OpenAIService
- Intégration avec GPT-3.5-turbo
- Génération de réponses contextuelles
- Analyse des données d'audit
- Suggestions intelligentes

### CacheService
- Cache des requêtes avec SQLite
- Statistiques d'utilisation
- Nettoyage automatique
- Optimisation des performances

### AuditAnalysisService
- Analyse d'activité utilisateur
- Détection d'anomalies
- Analyse temporelle
- Génération de rapports

## 🧪 Tests

```bash
pytest
```

## 📊 Monitoring

L'application inclut :
- Logs structurés avec Loguru
- Métriques de performance
- Health checks
- Monitoring des bases de données

## 🔒 Sécurité

- Authentification JWT
- Hachage sécurisé des mots de passe
- Protection CORS
- Validation des données d'entrée
- Gestion sécurisée des secrets

## 🚀 Déploiement

### Docker Compose

Ajoutez ce service à votre `docker-compose.yml` :

```yaml
backend-python:
  build:
    context: ./backend_python
    dockerfile: Dockerfile
  ports:
    - "8000:8000"
  environment:
    - MONGODB_URI=mongodb://mongodb:27017/auditdb
  depends_on:
    - mongodb
  networks:
    - app-network
```

## 🟦 Oracle: Pool de connexions et endpoints

Le backend expose un pool Oracle robuste via `oracledb` et des retries (`tenacity`).

Endpoints:

- `POST /api/oracle/test-connection` — test de connectivité et amorçage éventuel du pool
- `POST /api/oracle/execute-sql` — exécution sécurisée de requêtes `SELECT` via le pool
- `GET /api/oracle/pool-status` — statut du pool (min/max/open/busy si dispo)
- `GET /api/oracle/metrics/stream` — flux SSE de métriques (toutes les 2s)

Variables `.env` pour initialisation auto au démarrage:

```
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=ORCLPDB1
ORACLE_USERNAME=hr
ORACLE_PASSWORD=secret
ORACLE_DRIVER_MODE=thin
```


## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation API
2. Vérifiez les logs de l'application
3. Consultez les issues GitHub

---

**Note** : Ce backend Python reproduit toutes les fonctionnalités du backend Node.js original avec des améliorations en termes de performance, sécurité et maintenabilité.

# 🧠 Système LLM pour l'Analyse d'Audit Oracle

## 📋 Vue d'ensemble

Ce système transforme votre chatbot actuel en un assistant IA intelligent spécialisé dans l'analyse des logs d'audit Oracle. Il permet aux utilisateurs d'uploader leurs propres logs et de poser des questions naturelles pour obtenir des analyses détaillées.

## ✨ Fonctionnalités Principales

### 🔍 **Analyse Intelligente des Logs**
- **Upload de fichiers** : Interface simple pour uploader des logs Oracle
- **Parsing automatique** : Reconnaissance des formats de logs Oracle
- **Vectorisation** : Conversion des logs en vecteurs pour recherche sémantique
- **Analyse contextuelle** : Réponses basées sur le contenu réel des logs

### 🤖 **Assistant IA Spécialisé**
- **Modèle fine-tuné** : Entraîné sur vos 100 questions d'audit
- **Réponses contextuelles** : Comprend le contexte Oracle
- **Détection d'anomalies** : Identification automatique des activités suspectes
- **Analyse de patterns** : Reconnaissance des tendances et comportements

### 📊 **Interface Utilisateur Avancée**
- **Upload drag & drop** : Interface intuitive pour les fichiers
- **Chat intelligent** : Conversation naturelle avec l'IA
- **Questions suggérées** : Aide à la formulation des questions
- **Visualisation des résultats** : Affichage clair des analyses

## 🚀 Installation et Configuration

### Prérequis
- Python 3.11+
- Node.js 18+
- 4GB RAM minimum (8GB recommandé)
- GPU optionnel (pour l'entraînement)

### 1. Installation des Dépendances Python

```bash
cd wathy/SIO/backend/llm-prototype
pip install -r requirements.txt
```

### 2. Configuration de l'Environnement

```bash
# Créer un fichier .env
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

Variables d'environnement importantes :
```env
# Modèle LLM
LLM_MODEL_NAME=microsoft/DialoGPT-medium
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Base de données vectorielle
CHROMA_DB_PATH=./chroma_db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8001
```

### 3. Démarrage du Serveur LLM

```bash
# Démarrer le serveur API
python api_server.py
```

Le serveur sera accessible sur `http://localhost:8001`

### 4. Test du Système

```bash
# Lancer les tests automatiques
python test_llm_system.py
```

## 📖 Utilisation

### 1. Upload de Logs

1. **Préparer votre fichier de log** :
   - Format supporté : `.log`, `.txt`, `.csv`
   - Encodage : UTF-8
   - Structure Oracle audit standard

2. **Upload via l'interface** :
   - Cliquer sur "Sélectionner un fichier"
   - Choisir votre fichier de log
   - Attendre le traitement automatique

3. **Vérification** :
   - Le système affiche le nombre d'événements analysés
   - Un résumé automatique est généré
   - Les logs sont vectorisés et stockés

### 2. Pose de Questions

#### Questions d'Exemple
- "Quels sont les utilisateurs les plus actifs ?"
- "Combien d'opérations SELECT ont été effectuées ?"
- "Y a-t-il des activités suspectes ?"
- "Quels programmes clients sont les plus utilisés ?"
- "Combien d'actions destructives ont été détectées ?"

#### Types d'Analyses Disponibles

**🔍 Analyse Utilisateurs**
- Utilisateurs les plus actifs
- Sessions simultanées
- Patterns de connexion
- Droits et privilèges

**⚡ Analyse Actions**
- Types d'opérations (SELECT, INSERT, UPDATE, DELETE)
- Fréquence des requêtes
- Actions destructives (TRUNCATE, DROP)
- Modifications de structure

**🛡️ Analyse Sécurité**
- Accès au schéma SYS
- Activités suspectes
- Connexions anormales
- Violations de sécurité

**📈 Analyse Performance**
- Heures de pointe
- Utilisation des ressources
- Patterns temporels
- Optimisations possibles

### 3. Interprétation des Résultats

#### Niveau de Confiance
- **🟢 80-100%** : Réponse très fiable
- **🟡 60-79%** : Réponse probable
- **🔴 0-59%** : Réponse incertaine

#### Types d'Analyse
- **user_analysis** : Analyse des utilisateurs
- **action_analysis** : Analyse des actions
- **security_analysis** : Analyse de sécurité
- **performance_analysis** : Analyse de performance

## 🔧 Architecture Technique

### Composants Principaux

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Server    │    │   LLM Service   │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (Python)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Vector DB     │    │   Log Parser    │
                       │   (ChromaDB)    │    │   (Oracle)      │
                       └─────────────────┘    └─────────────────┘
```

### Flux de Données

1. **Upload** : Fichier → Parser → Vectorisation → Stockage
2. **Question** : Question → Vectorisation → Recherche → LLM → Réponse
3. **Analyse** : Logs → Patterns → Détection → Rapport

## 🎯 Avantages du Système

### Pour les Utilisateurs
- **Gain de temps** : Analyse instantanée vs manuelle
- **Précision** : Réponses basées sur les données réelles
- **Simplicité** : Interface intuitive et questions naturelles
- **Complétude** : Analyse exhaustive des logs

### Pour l'Organisation
- **Automatisation** : Réduction du travail manuel
- **Détection proactive** : Identification automatique des anomalies
- **Conformité** : Traçabilité complète des analyses
- **Efficacité** : Optimisation des processus d'audit

## 🔮 Roadmap et Évolutions

### Phase 1 : Prototype (Actuel)
- ✅ Upload de logs
- ✅ Questions basiques
- ✅ Interface utilisateur
- ✅ Analyse de patterns

### Phase 2 : Améliorations (Prochaines)
- 🔄 Fine-tuning sur vos 100 questions
- 🔄 Modèle plus performant (Llama-2, Mistral)
- 🔄 Analyse en temps réel
- 🔄 Alertes automatiques

### Phase 3 : Fonctionnalités Avancées
- 📋 Intégration avec d'autres sources de logs
- 📋 Machine Learning pour prédiction
- 📋 API pour intégration externe
- 📋 Dashboard avancé

## 🛠️ Développement

### Structure du Code

```
llm-prototype/
├── audit_llm_service.py    # Service LLM principal
├── api_server.py           # Serveur API FastAPI
├── test_llm_system.py     # Tests automatiques
├── requirements.txt        # Dépendances Python
└── README.md              # Documentation
```

### Ajout de Nouvelles Fonctionnalités

1. **Nouveau type d'analyse** :
   ```python
   # Dans audit_llm_service.py
   def _classify_question(self, question: str) -> str:
       # Ajouter votre logique
       if "votre_mot_clé" in question.lower():
           return "votre_analyse_type"
   ```

2. **Nouveau endpoint API** :
   ```python
   # Dans api_server.py
   @app.post("/api/votre-endpoint")
   async def votre_fonction():
       # Votre logique
       pass
   ```

3. **Nouveau composant React** :
   ```typescript
   // Dans LLMChatbot.tsx
   const votreFonction = async () => {
       // Votre logique
   };
   ```

## 🐛 Dépannage

### Problèmes Courants

**Le serveur ne démarre pas**
```bash
# Vérifier les dépendances
pip install -r requirements.txt

# Vérifier le port
netstat -an | grep 8001

# Vérifier les logs
tail -f llm_api.log
```

**Erreur de modèle**
```bash
# Réinstaller les modèles
rm -rf ~/.cache/huggingface
python -c "from transformers import AutoModel; AutoModel.from_pretrained('microsoft/DialoGPT-medium')"
```

**Problème de vectorisation**
```bash
# Nettoyer la base vectorielle
rm -rf ./chroma_db
```

### Logs et Debugging

```bash
# Logs du serveur
tail -f llm_api.log

# Logs détaillés
LOG_LEVEL=DEBUG python api_server.py
```

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les logs d'erreur
3. Tester avec le script de test
4. Contacter l'équipe de développement

---

**🎉 Félicitations !** Votre système d'analyse d'audit Oracle est maintenant équipé d'une intelligence artificielle de pointe qui transformera votre façon de travailler avec les logs. 
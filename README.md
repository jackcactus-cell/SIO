# 🚀 Système d'Audit Oracle - Projet Réorganisé

## 📁 Structure du Projet

Ce projet a été réorganisé pour une meilleure lisibilité et maintenance. Voici la nouvelle structure :

```
📦 SIO/
├── 📁 backend/                 # Backend Node.js principal
├── 📁 project/                 # Frontend React/TypeScript
├── 📁 backend_python/          # Backend Python alternatif
├── 📁 docs/                    # Documentation complète
│   ├── 📁 guides/             # Guides d'utilisation
│   ├── 📁 questions/          # Questions et templates
│   ├── 📁 system/             # Documentation système
│   ├── 📁 logging/            # Documentation logging
│   ├── 📁 interface/          # Documentation interface
│   └── 📁 deployment/         # Guides de déploiement
├── 📁 scripts/                 # Scripts utilitaires
│   ├── 📁 docker/             # Scripts Docker
│   ├── 📁 startup/            # Scripts de démarrage
│   └── 📁 test/               # Scripts de test
├── 📁 config/                  # Configuration
│   ├── 📁 docker/             # Configurations Docker
│   └── 📁 env/                # Variables d'environnement
├── 📁 data/                    # Données et logs
│   └── 📁 logs/               # Fichiers de logs
└── 📁 logs/                    # Logs système
```

## 🎯 Fonctionnalités Principales

### 🔍 **Système d'Audit Oracle**
- Analyse avancée des logs Oracle
- Traitement de 100+ questions complexes
- Détection d'anomalies de sécurité
- Statistiques de performance

### 🤖 **Chatbot Intelligent**
- Interface conversationnelle
- Traitement NLP avancé
- Réponses structurées
- Analyse en temps réel

### 📊 **Interface Web**
- Dashboard interactif
- Visualisations de données
- Éditeur SQL intégré
- Système de rôles utilisateur

## 🚀 Démarrage Rapide

### 1. **Démarrage avec Docker**
```bash
# Script automatique
./scripts/startup/start_project.sh

# Ou manuellement
docker-compose up -d
```

### 2. **Démarrage manuel**
```bash
# Backend
cd backend && npm install && npm start

# Frontend
cd project && npm install && npm run dev
```

## 📚 Documentation

### 📖 **Guides**
- `docs/guides/` - Guides d'utilisation et configuration
- `docs/deployment/` - Guides de déploiement et Docker

### ❓ **Questions et Templates**
- `docs/questions/` - 100+ questions prédéfinies
- Templates pour analyses avancées

### 🔧 **Système**
- `docs/system/` - Architecture et configuration
- `docs/logging/` - Système de logging
- `docs/interface/` - Interface utilisateur

## ⚙️ Configuration

### 🔐 **Variables d'Environnement**
```bash
# Copier les exemples
cp config/env/env.example .env
cp config/env/oracle.env.example oracle.env

# Configurer selon votre environnement
```

### 🐳 **Docker**
```bash
# Configurations dans config/docker/
docker-compose.yml
docker-compose.dev.yml
```

## 🧪 Tests

### 📝 **Scripts de Test**
```bash
# Tests système
./scripts/test/test_final_system.py

# Tests questions
./scripts/test/test_questions_schema.ps1
```

## 📊 Logs et Données

### 📈 **Gestion des Logs**
- `data/logs/` - Logs applicatifs
- `logs/` - Logs système
- Scripts de nettoyage dans `data/logs/`

## 🔄 Maintenance

### 🧹 **Nettoyage**
```bash
# Nettoyage des logs
node data/logs/cleanup_logs.js

# Validation de la structure
./scripts/validate-structure.sh
```

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation dans `docs/`
2. Vérifiez les logs dans `data/logs/`
3. Utilisez les scripts de diagnostic dans `scripts/`

---

**🎯 Projet organisé et optimisé pour vos études SIO !**

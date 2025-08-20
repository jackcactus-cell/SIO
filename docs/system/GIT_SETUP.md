# 🚀 Configuration Git - Projet SIA

## 📋 Vue d'ensemble

Ce document explique comment configurer Git pour le projet SIA de manière propre et efficace, en excluant les fichiers et dossiers non nécessaires.

## 🎯 Objectifs

- ✅ Exclure les modules et dépendances
- ✅ Exclure les environnements virtuels
- ✅ Exclure les fichiers de logs et cache
- ✅ Exclure les fichiers de configuration sensibles
- ✅ Garder uniquement le code source et la documentation

## 📁 Structure Git

### ✅ Fichiers inclus
```
📦 SIA/
├── 📁 backend/                 # Code source backend
├── 📁 project/                 # Code source frontend
├── 📁 backend_python/          # Code source Python
├── 📁 docs/                    # Documentation
├── 📁 scripts/                 # Scripts utilitaires
├── 📁 config/                  # Configurations (exemples)
├── 📁 data/                    # Données (structure)
├── 📄 README.md               # Documentation principale
├── 📄 .gitignore              # Configuration Git
└── 📄 *.md                    # Documentation Markdown
```

### ❌ Fichiers exclus
- `node_modules/` - Dépendances Node.js
- `venv/`, `env/` - Environnements virtuels Python
- `*.log` - Fichiers de logs
- `*.db` - Bases de données locales
- `.env` - Variables d'environnement sensibles
- `build/`, `dist/` - Fichiers de build
- `cache/` - Fichiers de cache

## 🚀 Initialisation Rapide

### Option 1: Script automatique (Recommandé)

#### Windows (PowerShell)
```powershell
.\scripts\setup-git.ps1
```

#### Linux/Mac (Bash)
```bash
chmod +x scripts/setup-git.sh
./scripts/setup-git.sh
```

### Option 2: Commandes manuelles

```bash
# 1. Initialiser Git
git init

# 2. Ajouter le README
git add README.md

# 3. Premier commit
git commit -m "first commit"

# 4. Renommer la branche
git branch -M main

# 5. Ajouter le remote
git remote add origin https://github.com/dinoxharge/sia.git

# 6. Push vers GitHub
git push -u origin main
```

## 📝 Configuration .gitignore

Le fichier `.gitignore` est configuré pour exclure :

### 🔧 Dépendances
```
node_modules/
package-lock.json
yarn.lock
```

### 🐍 Python
```
__pycache__/
*.pyc
venv/
env/
```

### 📊 Bases de données
```
*.db
*.sqlite
*.sqlite3
backend/chatbot_cache.db*
```

### 🔐 Variables d'environnement
```
.env
.env.local
config/env/*.env
```

### 📈 Logs
```
logs/
*.log
backend/logs/
```

## 🔄 Workflow Git recommandé

### 1. **Première configuration**
```bash
# Cloner le repository
git clone https://github.com/dinoxharge/sia.git
cd sia

# Installer les dépendances
cd backend && npm install
cd ../project && npm install
cd ../backend_python && pip install -r requirements.txt
```

### 2. **Développement quotidien**
```bash
# Vérifier les changements
git status

# Ajouter les fichiers modifiés
git add .

# Committer avec un message descriptif
git commit -m "feat: ajout nouvelle fonctionnalité"

# Pousser vers GitHub
git push
```

### 3. **Gestion des branches**
```bash
# Créer une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# Travailler sur la branche
# ... modifications ...

# Fusionner avec main
git checkout main
git merge feature/nouvelle-fonctionnalite
```

## 🛠️ Scripts utilitaires

### 📋 Validation de la structure
```bash
# Vérifier que la structure est correcte
./scripts/validate-structure.sh
```

### 🧹 Nettoyage
```bash
# Nettoyer les fichiers temporaires
./scripts/cleanup.sh
```

## 🔍 Vérification

### ✅ Checklist avant commit
- [ ] Pas de fichiers sensibles (.env, mots de passe)
- [ ] Pas de modules node_modules/
- [ ] Pas d'environnements virtuels venv/
- [ ] Pas de logs ou fichiers temporaires
- [ ] Documentation à jour

### 🔍 Commandes de vérification
```bash
# Voir les fichiers qui seront commités
git status

# Voir les fichiers ignorés
git status --ignored

# Vérifier la taille du repository
du -sh .git
```

## 🚨 Problèmes courants

### ❌ Erreur: "fatal: remote origin already exists"
```bash
# Supprimer le remote existant
git remote remove origin

# Ajouter le nouveau remote
git remote add origin https://github.com/dinoxharge/sia.git
```

### ❌ Erreur: "Permission denied"
```bash
# Vérifier les permissions SSH
ssh -T git@github.com

# Ou utiliser HTTPS avec token
git remote set-url origin https://username:token@github.com/dinoxharge/sia.git
```

### ❌ Fichiers non ignorés
```bash
# Forcer l'ajout au .gitignore
echo "fichier_problematique" >> .gitignore
git add .gitignore
git commit -m "fix: ajout fichier au .gitignore"
```

## 📚 Ressources

- [Documentation Git officielle](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Gitignore.io](https://www.gitignore.io/) - Générateur de .gitignore

---

**🎯 Configuration Git optimisée pour le projet SIA !**

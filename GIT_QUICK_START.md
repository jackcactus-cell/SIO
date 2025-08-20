# 🚀 Démarrage Rapide Git - Projet SIA

## ⚡ Initialisation Express (Windows)

### Option 1: Script PowerShell (Recommandé)
```powershell
# Exécuter le script d'initialisation
.\scripts\setup-git.ps1
```

### Option 2: Commandes manuelles
```powershell
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

## ✅ Vérification de la configuration

### Script de validation
```powershell
# Vérifier que tout est bien configuré
.\scripts\validate-git-setup.sh
```

### Vérification manuelle
```powershell
# Vérifier l'état Git
git status

# Vérifier les fichiers ignorés
git status --ignored

# Vérifier le remote
git remote -v
```

## 📁 Structure Git optimisée

### ✅ Fichiers inclus
- `backend/` - Code source backend
- `project/` - Code source frontend  
- `backend_python/` - Code source Python
- `docs/` - Documentation complète
- `scripts/` - Scripts utilitaires
- `config/` - Configurations (exemples)
- `README.md` - Documentation principale
- `.gitignore` - Configuration Git

### ❌ Fichiers exclus
- `node_modules/` - Dépendances Node.js
- `venv/`, `env/` - Environnements virtuels
- `*.log` - Fichiers de logs
- `*.db` - Bases de données locales
- `.env` - Variables d'environnement
- `build/`, `dist/` - Fichiers de build

## 🔄 Workflow quotidien

### Ajouter des fichiers
```powershell
# Ajouter tous les fichiers (selon .gitignore)
git add .

# Ou ajouter des fichiers spécifiques
git add backend/
git add project/
git add docs/
```

### Committer les changements
```powershell
# Commit avec message descriptif
git commit -m "feat: ajout nouvelle fonctionnalité"
git commit -m "fix: correction bug interface"
git commit -m "docs: mise à jour documentation"
```

### Pousser vers GitHub
```powershell
# Push vers la branche main
git push

# Ou push avec upstream
git push -u origin main
```

## 🛠️ Commandes utiles

### Vérification
```powershell
git status                    # État du repository
git log --oneline           # Historique des commits
git diff                    # Différences non commitées
git branch                  # Liste des branches
```

### Gestion des branches
```powershell
git checkout -b feature/nouvelle-fonctionnalite  # Créer une branche
git checkout main                                # Changer de branche
git merge feature/nouvelle-fonctionnalite        # Fusionner
git branch -d feature/nouvelle-fonctionnalite    # Supprimer une branche
```

### Configuration
```powershell
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

## 🚨 Problèmes courants

### Erreur: "fatal: remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/dinoxharge/sia.git
```

### Erreur: "Permission denied"
```powershell
# Vérifier l'authentification GitHub
# Utiliser un token personnel ou configurer SSH
```

### Fichiers non ignorés
```powershell
# Ajouter au .gitignore
echo "fichier_problematique" >> .gitignore
git add .gitignore
git commit -m "fix: ajout fichier au .gitignore"
```

## 📚 Ressources

- [Documentation Git](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**🎯 Votre projet SIA est maintenant prêt pour Git !**

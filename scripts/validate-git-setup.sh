#!/bin/bash

# Script de validation de la configuration Git
# Auteur: Assistant IA

echo "🔍 Validation de la configuration Git - Projet SIA"
echo "=================================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Vérifier si Git est initialisé
if [ -d ".git" ]; then
    print_result 0 "Repository Git initialisé"
else
    print_result 1 "Repository Git non initialisé"
    echo -e "${YELLOW}💡 Exécutez: git init${NC}"
fi

# Vérifier le .gitignore
if [ -f ".gitignore" ]; then
    print_result 0 "Fichier .gitignore présent"
    
    # Vérifier les exclusions importantes
    if grep -q "node_modules/" .gitignore; then
        print_result 0 "node_modules/ exclu"
    else
        print_result 1 "node_modules/ non exclu"
    fi
    
    if grep -q "venv/" .gitignore; then
        print_result 0 "venv/ exclu"
    else
        print_result 1 "venv/ non exclu"
    fi
    
    if grep -q "*.log" .gitignore; then
        print_result 0 "*.log exclu"
    else
        print_result 1 "*.log non exclu"
    fi
    
    if grep -q "*.db" .gitignore; then
        print_result 0 "*.db exclu"
    else
        print_result 1 "*.db non exclu"
    fi
else
    print_result 1 "Fichier .gitignore manquant"
fi

# Vérifier le README.md
if [ -f "README.md" ]; then
    print_result 0 "README.md présent"
else
    print_result 1 "README.md manquant"
fi

# Vérifier les fichiers sensibles
echo ""
echo "🔐 Vérification des fichiers sensibles:"

if [ -f ".env" ]; then
    print_result 1 "Fichier .env détecté (sensible!)"
    echo -e "${YELLOW}💡 Ajoutez .env au .gitignore${NC}"
else
    print_result 0 "Aucun fichier .env détecté"
fi

# Vérifier les modules node_modules
if [ -d "node_modules" ]; then
    print_result 1 "Dossier node_modules détecté"
    echo -e "${YELLOW}💡 Ajoutez node_modules/ au .gitignore${NC}"
else
    print_result 0 "Aucun dossier node_modules détecté"
fi

# Vérifier les environnements virtuels
if [ -d "venv" ] || [ -d "env" ] || [ -d ".venv" ]; then
    print_result 1 "Environnement virtuel détecté"
    echo -e "${YELLOW}💡 Ajoutez venv/, env/, .venv/ au .gitignore${NC}"
else
    print_result 0 "Aucun environnement virtuel détecté"
fi

# Vérifier les bases de données
if find . -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3" | grep -q .; then
    print_result 1 "Fichiers de base de données détectés"
    echo -e "${YELLOW}💡 Ajoutez *.db, *.sqlite, *.sqlite3 au .gitignore${NC}"
else
    print_result 0 "Aucun fichier de base de données détecté"
fi

# Vérifier les logs
if find . -name "*.log" | grep -q .; then
    print_result 1 "Fichiers de logs détectés"
    echo -e "${YELLOW}💡 Ajoutez *.log au .gitignore${NC}"
else
    print_result 0 "Aucun fichier de logs détecté"
fi

# Vérifier la structure du projet
echo ""
echo "📁 Vérification de la structure:"

if [ -d "backend" ]; then
    print_result 0 "Dossier backend présent"
else
    print_result 1 "Dossier backend manquant"
fi

if [ -d "project" ]; then
    print_result 0 "Dossier project présent"
else
    print_result 1 "Dossier project manquant"
fi

if [ -d "docs" ]; then
    print_result 0 "Dossier docs présent"
else
    print_result 1 "Dossier docs manquant"
fi

if [ -d "scripts" ]; then
    print_result 0 "Dossier scripts présent"
else
    print_result 1 "Dossier scripts manquant"
fi

# Vérifier le remote origin
if git remote -v | grep -q "origin"; then
    print_result 0 "Remote origin configuré"
    git remote -v | grep origin
else
    print_result 1 "Remote origin non configuré"
    echo -e "${YELLOW}💡 Exécutez: git remote add origin https://github.com/dinoxharge/sia.git${NC}"
fi

# Vérifier la branche
current_branch=$(git branch --show-current 2>/dev/null)
if [ "$current_branch" = "main" ]; then
    print_result 0 "Branche main active"
else
    print_result 1 "Branche non configurée"
    echo -e "${YELLOW}💡 Exécutez: git branch -M main${NC}"
fi

echo ""
echo "📊 Résumé:"
echo "=========="

# Compter les fichiers qui seront commités
tracked_files=$(git status --porcelain 2>/dev/null | wc -l)
if [ $tracked_files -gt 0 ]; then
    echo -e "${YELLOW}📝 $tracked_files fichiers prêts à être commités${NC}"
else
    echo -e "${GREEN}📝 Aucun fichier à committer${NC}"
fi

# Taille du repository
if [ -d ".git" ]; then
    repo_size=$(du -sh .git 2>/dev/null | cut -f1)
    echo -e "${GREEN}💾 Taille du repository: $repo_size${NC}"
fi

echo ""
echo "🎯 Recommandations:"
echo "=================="

if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✅ Configuration Git prête!${NC}"
    echo -e "${GREEN}✅ Vous pouvez maintenant committer vos fichiers${NC}"
else
    echo -e "${RED}❌ Créez d'abord un fichier .gitignore${NC}"
fi

echo ""
echo -e "${YELLOW}💡 Commandes utiles:${NC}"
echo "git add .                    # Ajouter tous les fichiers"
echo "git commit -m 'message'      # Committer les changements"
echo "git push                     # Pousser vers GitHub"
echo "git status                   # Vérifier l'état"
echo "git log --oneline           # Voir l'historique"

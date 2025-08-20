#!/bin/bash

# Script d'initialisation Git pour le projet SIA
# Auteur: Assistant IA
# Date: $(date +%Y-%m-%d)

echo "🚀 Initialisation Git pour le projet SIA"
echo "============================================="

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi
echo "✅ Git est installé"

# Vérifier si on est dans le bon répertoire
if [ ! -f "README.md" ]; then
    echo "❌ README.md non trouvé. Assurez-vous d'être dans le répertoire racine du projet."
    exit 1
fi

echo "📁 Répertoire actuel: $(pwd)"

# Initialiser Git
echo "🔧 Initialisation du repository Git..."
git init
if [ $? -eq 0 ]; then
    echo "✅ Repository Git initialisé"
else
    echo "❌ Erreur lors de l'initialisation Git"
    exit 1
fi

# Ajouter le README.md
echo "📝 Ajout du README.md..."
git add README.md
if [ $? -eq 0 ]; then
    echo "✅ README.md ajouté"
else
    echo "❌ Erreur lors de l'ajout du README.md"
    exit 1
fi

# Premier commit
echo "💾 Premier commit..."
git commit -m "first commit"
if [ $? -eq 0 ]; then
    echo "✅ Premier commit effectué"
else
    echo "❌ Erreur lors du commit"
    exit 1
fi

# Renommer la branche en main
echo "🌿 Renommage de la branche en 'main'..."
git branch -M main
if [ $? -eq 0 ]; then
    echo "✅ Branche renommée en 'main'"
else
    echo "❌ Erreur lors du renommage de la branche"
    exit 1
fi

# Ajouter le remote origin
echo "🔗 Ajout du remote origin..."
git remote add origin https://github.com/dinoxharge/sia.git
if [ $? -eq 0 ]; then
    echo "✅ Remote origin ajouté"
else
    echo "❌ Erreur lors de l'ajout du remote"
    exit 1
fi

# Push vers GitHub
echo "🚀 Push vers GitHub..."
git push -u origin main
if [ $? -eq 0 ]; then
    echo "✅ Push vers GitHub réussi!"
else
    echo "❌ Erreur lors du push vers GitHub"
    echo "💡 Vérifiez que le repository existe sur GitHub et que vous avez les permissions"
    exit 1
fi

echo ""
echo "🎉 Initialisation Git terminée avec succès!"
echo "============================================="
echo ""
echo "📋 Prochaines étapes:"
echo "1. Ajoutez vos fichiers: git add ."
echo "2. Committez vos changements: git commit -m 'votre message'"
echo "3. Poussez vers GitHub: git push"
echo ""
echo "🔗 Repository: https://github.com/dinoxharge/sia.git"

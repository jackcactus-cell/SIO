# Script d'initialisation Git pour le projet SIA
# Auteur: Assistant IA
# Date: $(Get-Date -Format "yyyy-MM-dd")

Write-Host "🚀 Initialisation Git pour le projet SIA" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Vérifier si Git est installé
try {
    git --version | Out-Null
    Write-Host "✅ Git est installé" -ForegroundColor Green
} catch {
    Write-Host "❌ Git n'est pas installé. Veuillez l'installer d'abord." -ForegroundColor Red
    exit 1
}

# Vérifier si on est dans le bon répertoire
if (-not (Test-Path "README.md")) {
    Write-Host "❌ README.md non trouvé. Assurez-vous d'être dans le répertoire racine du projet." -ForegroundColor Red
    exit 1
}

Write-Host "📁 Répertoire actuel: $(Get-Location)" -ForegroundColor Yellow

# Initialiser Git
Write-Host "🔧 Initialisation du repository Git..." -ForegroundColor Yellow
git init
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Repository Git initialisé" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'initialisation Git" -ForegroundColor Red
    exit 1
}

# Ajouter le README.md
Write-Host "📝 Ajout du README.md..." -ForegroundColor Yellow
git add README.md
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ README.md ajouté" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'ajout du README.md" -ForegroundColor Red
    exit 1
}

# Premier commit
Write-Host "💾 Premier commit..." -ForegroundColor Yellow
git commit -m "first commit"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Premier commit effectué" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du commit" -ForegroundColor Red
    exit 1
}

# Renommer la branche en main
Write-Host "🌿 Renommage de la branche en 'main'..." -ForegroundColor Yellow
git branch -M main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Branche renommée en 'main'" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du renommage de la branche" -ForegroundColor Red
    exit 1
}

# Ajouter le remote origin
Write-Host "🔗 Ajout du remote origin..." -ForegroundColor Yellow
git remote add origin https://github.com/dinoxharge/sia.git
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Remote origin ajouté" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'ajout du remote" -ForegroundColor Red
    exit 1
}

# Push vers GitHub
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Yellow
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push vers GitHub réussi!" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du push vers GitHub" -ForegroundColor Red
    Write-Host "💡 Vérifiez que le repository existe sur GitHub et que vous avez les permissions" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Initialisation Git terminée avec succès!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Ajoutez vos fichiers: git add ." -ForegroundColor White
Write-Host "2. Committez vos changements: git commit -m 'votre message'" -ForegroundColor White
Write-Host "3. Poussez vers GitHub: git push" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Repository: https://github.com/dinoxharge/sia.git" -ForegroundColor Cyan

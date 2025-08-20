# =================================================================
# SIO Audit App - Quick Start Script (PowerShell)
# Script de démarrage rapide pour l'application SIO Audit
# =================================================================

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  SIO Audit App - Démarrage Rapide" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Vérification des prérequis
Write-Host "1. Vérification des prérequis..." -ForegroundColor Yellow

try {
    $dockerVersion = docker --version 2>$null
    if (-not $dockerVersion) {
        Write-Host "❌ Docker n'est pas installé" -ForegroundColor Red
        exit 1
    }
    
    $composeVersion = docker-compose --version 2>$null
    if (-not $composeVersion) {
        Write-Host "❌ Docker Compose n'est pas installé" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Docker et Docker Compose sont installés" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors de la vérification: $_" -ForegroundColor Red
    exit 1
}

# Configuration des fichiers d'environnement
Write-Host "2. Configuration des fichiers d'environnement..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Fichier .env créé" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Fichier env.example introuvable" -ForegroundColor Yellow
    }
}

if (-not (Test-Path "backend_python\.env")) {
    if (Test-Path "backend_python\env.example") {
        Copy-Item "backend_python\env.example" "backend_python\.env"
        Write-Host "✅ Fichier backend_python\.env créé" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Fichier backend_python\env.example introuvable" -ForegroundColor Yellow
    }
}

# Choix du mode
Write-Host "3. Choisissez votre mode de démarrage:" -ForegroundColor Yellow
Write-Host "1) Production (recommandé)"
Write-Host "2) Développement"
$modeChoice = Read-Host "Votre choix (1 ou 2)"

if ($modeChoice -eq "2") {
    $composeFile = "docker-compose.dev.yml"
    $mode = "développement"
    $port = "5173"
} else {
    $composeFile = "docker-compose.yml"
    $mode = "production"
    $port = "80"
}

Write-Host "✅ Mode $mode sélectionné" -ForegroundColor Green

# Construction et démarrage
Write-Host "4. Construction des images Docker..." -ForegroundColor Yellow
docker-compose -f $composeFile build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la construction" -ForegroundColor Red
    exit 1
}

Write-Host "5. Démarrage des services..." -ForegroundColor Yellow
docker-compose -f $composeFile up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du démarrage" -ForegroundColor Red
    exit 1
}

# Attendre que les services soient prêts
Write-Host "6. Vérification des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Affichage des informations
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  🎉 Application démarrée avec succès!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📱 Frontend: http://localhost:$port" -ForegroundColor Cyan
Write-Host "🔧 Backend Node.js: http://localhost:4000" -ForegroundColor Cyan
Write-Host "🐍 Backend Python: http://localhost:8000" -ForegroundColor Cyan
Write-Host "🤖 Service LLM: http://localhost:8001" -ForegroundColor Cyan
Write-Host "🗄️  MongoDB: localhost:27017" -ForegroundColor Cyan

if ($modeChoice -eq "2") {
    Write-Host "🔧 Adminer (DB): http://localhost:8080" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📊 Pour voir le statut: docker-compose -f $composeFile ps" -ForegroundColor Gray
Write-Host "📜 Pour voir les logs: docker-compose -f $composeFile logs -f" -ForegroundColor Gray
Write-Host "🛑 Pour arrêter: docker-compose -f $composeFile down" -ForegroundColor Gray

Write-Host ""
Write-Host "✨ L'application SIO Audit est prête!" -ForegroundColor Green

# Optionnel: ouvrir le navigateur
$openBrowser = Read-Host "Voulez-vous ouvrir l'application dans le navigateur? (y/N)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "http://localhost:$port"
}



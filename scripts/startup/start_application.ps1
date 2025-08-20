# Script de démarrage de l'application SIO avec système de logging
# PowerShell Script pour Windows

Write-Host "🚀 Démarrage de l'application SIO avec système de logging complet" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan

# Vérifier que Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier que le dossier logs existe
$logsDir = ".\logs"
if (-not (Test-Path $logsDir)) {
    Write-Host "📁 Création du dossier logs..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# Nettoyer les logs anciens
Write-Host "🧹 Nettoyage des logs anciens..." -ForegroundColor Yellow
node cleanup_logs.js

# Tester le système de logging
Write-Host "🧪 Test du système de logging..." -ForegroundColor Yellow
node test_logging_complete.js

# Démarrer le backend
Write-Host "🔧 Démarrage du backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node index.js" -WindowStyle Normal

# Attendre un peu pour que le backend démarre
Start-Sleep -Seconds 3

# Démarrer le frontend
Write-Host "🎨 Démarrage du frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd project; npm run dev" -WindowStyle Normal

# Démarrer MongoDB si nécessaire
Write-Host "🗄️ Vérification de MongoDB..." -ForegroundColor Yellow
try {
    $mongoStatus = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoStatus -and $mongoStatus.Status -eq "Running") {
        Write-Host "✅ MongoDB est déjà en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "⚠️ MongoDB n'est pas en cours d'exécution" -ForegroundColor Yellow
        Write-Host "   Vous pouvez le démarrer manuellement ou utiliser: .\start_mongodb.ps1" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️ Impossible de vérifier le statut de MongoDB" -ForegroundColor Yellow
}

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ Application SIO démarrée avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Services démarrés:" -ForegroundColor White
Write-Host "   • Backend Node.js (port 4000)" -ForegroundColor Cyan
Write-Host "   • Frontend React (port 5173)" -ForegroundColor Cyan
Write-Host "   • Système de logging complet" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Surveillance des logs:" -ForegroundColor White
Write-Host "   • Backend: tail -f logs/backend.log" -ForegroundColor Gray
Write-Host "   • API: tail -f logs/api.log" -ForegroundColor Gray
Write-Host "   • Chatbot: tail -f logs/chatbot.log" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Accès à l'application:" -ForegroundColor White
Write-Host "   • Interface: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   • API: http://localhost:4000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Rapport de logs: logs/log_report.json" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer cette fenêtre..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

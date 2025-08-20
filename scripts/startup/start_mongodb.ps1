# Script PowerShell pour démarrer MongoDB avec Docker

Write-Host "=== Démarrage MongoDB avec Docker ===" -ForegroundColor Green

# Vérifier si Docker est installé
try {
    docker --version | Out-Null
    Write-Host "✅ Docker est installé" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas installé. Veuillez installer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Vérifier si le conteneur MongoDB existe déjà
$containerName = "mongodb-audit"
$containerExists = docker ps -a --filter "name=$containerName" --format "table {{.Names}}" | Select-String $containerName

if ($containerExists) {
    Write-Host "🔄 Conteneur MongoDB existant trouvé, démarrage..." -ForegroundColor Yellow
    docker start $containerName
} else {
    Write-Host "🆕 Création d'un nouveau conteneur MongoDB..." -ForegroundColor Yellow
    
    # Créer le conteneur MongoDB
    docker run -d `
        --name $containerName `
        -p 27017:27017 `
        -e MONGO_INITDB_DATABASE=audit_db `
        -v mongodb_data:/data/db `
        mongo:latest
    
    Write-Host "✅ Conteneur MongoDB créé et démarré" -ForegroundColor Green
}

# Attendre que MongoDB soit prêt
Write-Host "⏳ Attente que MongoDB soit prêt..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Vérifier le statut du conteneur
$containerStatus = docker ps --filter "name=$containerName" --format "table {{.Status}}"
Write-Host "📊 Statut du conteneur: $containerStatus" -ForegroundColor Cyan

Write-Host "✅ MongoDB est prêt sur localhost:27017" -ForegroundColor Green
Write-Host "🔗 URI de connexion: mongodb://localhost:27017/audit_db" -ForegroundColor Cyan

# Instructions pour arrêter MongoDB
Write-Host "`n💡 Pour arrêter MongoDB: docker stop $containerName" -ForegroundColor Yellow
Write-Host "💡 Pour redémarrer MongoDB: docker start $containerName" -ForegroundColor Yellow 
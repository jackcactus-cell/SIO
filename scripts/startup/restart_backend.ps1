# Script de redémarrage du backend
Write-Host "🔄 Redémarrage du backend Oracle Audit..." -ForegroundColor Yellow

# Arrêter tous les processus Node.js
Write-Host "⏹️ Arrêt des processus existants..." -ForegroundColor Red
taskkill /F /IM node.exe 2>$null

# Attendre un peu
Start-Sleep -Seconds 2

# Redémarrer le backend
Write-Host "🚀 Démarrage du nouveau backend..." -ForegroundColor Green
cd backend
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "index.js"

# Attendre que le serveur démarre
Start-Sleep -Seconds 3

# Tester la connectivité
Write-Host "🔍 Test de connectivité..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/audit/raw" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend opérationnel - $($response.data.Count) entrées disponibles" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur de connexion au backend" -ForegroundColor Red
}

Write-Host "✨ Redémarrage terminé !" -ForegroundColor Green




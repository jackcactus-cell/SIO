# Script PowerShell pour démarrer le Projet Oracle Audit Complet

Write-Host "🚀 Démarrage du Projet Oracle Audit Complet" -ForegroundColor Green
Write-Host "=========================================="

# Vérifier Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé. Veuillez installer Docker Desktop." -ForegroundColor Red
    exit 1
}

if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose." -ForegroundColor Red
    exit 1
}

# Vérifier si les services tournent déjà
Write-Host "🔍 Vérification des services existants..."
try {
    $runningServices = & docker-compose -f docker-compose.dev.yml ps --services --filter "status=running" 2>$null
    if ($runningServices) {
        Write-Host "⚠️  Certains services sont déjà en cours d'exécution." -ForegroundColor Yellow
        $restart = Read-Host "Voulez-vous les redémarrer ? (y/n)"
        if ($restart -eq "y" -or $restart -eq "Y") {
            Write-Host "🔄 Arrêt des services existants..."
            & docker-compose -f docker-compose.dev.yml down
        }
    }
} catch {
    # Continuer si docker-compose n'est pas encore configuré
}

# Configuration Oracle optionnelle
$envFile = ""
if (Test-Path "oracle.env") {
    Write-Host "✅ Configuration Oracle trouvée (oracle.env)" -ForegroundColor Green
    $envFile = "--env-file oracle.env"
} else {
    Write-Host "⚠️  Aucune configuration Oracle trouvée" -ForegroundColor Yellow
    Write-Host "   Pour activer l'extraction Oracle automatique:"
    Write-Host "   1. Copiez oracle.env.example vers oracle.env"
    Write-Host "   2. Configurez vos paramètres Oracle"
    Write-Host "   3. Redémarrez le projet"
}

# Créer les répertoires nécessaires
Write-Host "📁 Création des répertoires..."
$directories = @(
    "logs",
    "backend\llm-prototype\logs",
    "backend\llm-prototype\chroma_db",
    "backend\llm-prototype\uploads"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Construire et démarrer les services
Write-Host "🐳 Construction et démarrage des services Docker..." -ForegroundColor Cyan
Write-Host "   Ceci peut prendre quelques minutes la première fois..."

$dockerCommand = "docker-compose -f docker-compose.dev.yml $envFile up -d --build"
$result = Invoke-Expression $dockerCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services démarrés avec succès!" -ForegroundColor Green
    
    Write-Host "⏳ Attente de l'initialisation des services..."
    Start-Sleep -Seconds 10
    
    # Vérifier les services
    Write-Host "🔍 Vérification des services..."
    
    $services = @(
        @{Name="Frontend"; Url="http://localhost:5173"},
        @{Name="Backend Node.js"; Url="http://localhost:4000"},
        @{Name="Backend Python"; Url="http://localhost:8000"},
        @{Name="Backend LLM"; Url="http://localhost:8001"}
    )
    
    foreach ($service in $services) {
        try {
            $response = Invoke-WebRequest -Uri $service.Url -Method Get -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $($service.Name): $($service.Url)" -ForegroundColor Green
            } else {
                Write-Host "⚠️  $($service.Name): en cours de démarrage..." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️  $($service.Name): en cours de démarrage..." -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "🎉 PROJET DÉMARRÉ AVEC SUCCÈS!" -ForegroundColor Green
    Write-Host "=============================="
    Write-Host ""
    Write-Host "📱 Accès à l'application:" -ForegroundColor Cyan
    Write-Host "   🌐 Frontend:           http://localhost:5173"
    Write-Host "   🔧 API Node.js:        http://localhost:4000"
    Write-Host "   🐍 API Python:         http://localhost:8000"
    Write-Host "   🤖 API LLM:            http://localhost:8001"
    Write-Host "   📚 Documentation LLM:  http://localhost:8001/docs"
    Write-Host ""
    Write-Host "🧪 Test du système:" -ForegroundColor Yellow
    Write-Host "   python test_final_system.py"
    Write-Host ""
    Write-Host "📊 Fonctionnalités disponibles:" -ForegroundColor Cyan
    Write-Host "   ✅ Upload de fichiers Excel/CSV/XLS"
    Write-Host "   ✅ Chatbot intelligent avec mots-clés"
    Write-Host "   ✅ Extraction Oracle Audit Trail (si configuré)"
    Write-Host "   ✅ Analyse automatique et questions suggérées"
    Write-Host "   ✅ Tableaux simples et résumés"
    Write-Host ""
    Write-Host "🔧 Gestion des services:" -ForegroundColor Yellow
    Write-Host "   Arrêter:    docker-compose -f docker-compose.dev.yml down"
    Write-Host "   Logs:       docker-compose -f docker-compose.dev.yml logs -f"
    Write-Host "   Redémarrer: .\start_project.ps1"
    Write-Host ""
    Write-Host "📖 Consultez README_FINALISATION.md pour la documentation complète" -ForegroundColor Magenta
    
} else {
    Write-Host "❌ Erreur lors du démarrage des services" -ForegroundColor Red
    Write-Host "🔍 Vérifiez les logs avec: docker-compose -f docker-compose.dev.yml logs" -ForegroundColor Yellow
    exit 1
}

# =================================================================
# SIO Audit App - Docker Manager Script (PowerShell)
# Script de gestion Docker complet pour l'application SIO Audit
# =================================================================

param(
    [Parameter(Position=0, Mandatory=$false)]
    [string]$Command = "help",
    
    [Parameter(Position=1, Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Position=2, Mandatory=$false)]
    [string]$Option = ""
)

# Configuration
$ProjectName = "sio-audit-app"
$DevComposeFile = "docker-compose.dev.yml"
$ProdComposeFile = "docker-compose.yml"

# Fonctions utilitaires
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Vérifier que Docker est installé et fonctionne
function Test-Docker {
    Write-Info "Vérification de Docker..."
    
    try {
        # Vérifier Docker
        $dockerVersion = docker --version 2>$null
        if (-not $dockerVersion) {
            Write-Error "Docker n'est pas installé ou n'est pas dans le PATH"
            exit 1
        }
        
        # Vérifier Docker Daemon
        docker info 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker n'est pas démarré ou n'est pas accessible"
            exit 1
        }
        
        # Vérifier Docker Compose
        $composeVersion = docker-compose --version 2>$null
        if (-not $composeVersion) {
            Write-Error "Docker Compose n'est pas installé ou n'est pas dans le PATH"
            exit 1
        }
        
        Write-Success "Docker et Docker Compose sont disponibles"
    }
    catch {
        Write-Error "Erreur lors de la vérification de Docker: $_"
        exit 1
    }
}

# Créer les fichiers d'environnement s'ils n'existent pas
function Initialize-EnvFiles {
    Write-Info "Configuration des fichiers d'environnement..."
    
    # Fichier principal .env
    if (-not (Test-Path ".env")) {
        if (Test-Path "env.example") {
            Copy-Item "env.example" ".env"
            Write-Success "Fichier .env créé depuis env.example"
        } else {
            Write-Warning "Fichier env.example introuvable, veuillez créer .env manuellement"
        }
    }
    
    # Fichier backend Python .env
    if (-not (Test-Path "backend_python\.env")) {
        if (Test-Path "backend_python\env.example") {
            Copy-Item "backend_python\env.example" "backend_python\.env"
            Write-Success "Fichier backend_python\.env créé"
        } else {
            Write-Warning "Fichier backend_python\env.example introuvable"
        }
    }
}

# Construire les images Docker
function Build-Images {
    param([string]$Env = "production")
    
    $composeFile = if ($Env -eq "dev") { $DevComposeFile } else { $ProdComposeFile }
    
    Write-Info "Construction des images Docker pour l'environnement: $Env"
    
    docker-compose -f $composeFile build --no-cache
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Images construites avec succès"
    } else {
        Write-Error "Erreur lors de la construction des images"
        exit 1
    }
}

# Démarrer les services
function Start-Services {
    param([string]$Env = "production")
    
    $composeFile = if ($Env -eq "dev") { $DevComposeFile } else { $ProdComposeFile }
    
    Write-Info "Démarrage des services pour l'environnement: $Env"
    
    docker-compose -f $composeFile up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services démarrés"
        Show-Status $Env
    } else {
        Write-Error "Erreur lors du démarrage des services"
        exit 1
    }
}

# Arrêter les services
function Stop-Services {
    param([string]$Env = "production")
    
    $composeFile = if ($Env -eq "dev") { $DevComposeFile } else { $ProdComposeFile }
    
    Write-Info "Arrêt des services pour l'environnement: $Env"
    
    docker-compose -f $composeFile down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services arrêtés"
    } else {
        Write-Error "Erreur lors de l'arrêt des services"
    }
}

# Redémarrer les services
function Restart-Services {
    param([string]$Env = "production")
    
    Write-Info "Redémarrage des services..."
    
    Stop-Services $Env
    Start-Services $Env
}

# Afficher le statut des services
function Show-Status {
    param([string]$Env = "production")
    
    $composeFile = if ($Env -eq "dev") { $DevComposeFile } else { $ProdComposeFile }
    
    Write-Info "Statut des services:"
    docker-compose -f $composeFile ps
    
    Write-Host ""
    Write-Info "URLs d'accès:"
    if ($Env -eq "dev") {
        Write-Host "  Frontend (Dev): http://localhost:5173" -ForegroundColor Cyan
        Write-Host "  Adminer (DB):   http://localhost:8080" -ForegroundColor Cyan
    } else {
        Write-Host "  Frontend:       http://localhost:80" -ForegroundColor Cyan
    }
    Write-Host "  Backend Node:   http://localhost:4000" -ForegroundColor Cyan
    Write-Host "  Backend Python: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "  Backend LLM:    http://localhost:8001" -ForegroundColor Cyan
    Write-Host "  MongoDB:        localhost:27017" -ForegroundColor Cyan
}

# Afficher les logs
function Show-Logs {
    param(
        [string]$Env = "production",
        [string]$Service = ""
    )
    
    $composeFile = if ($Env -eq "dev") { $DevComposeFile } else { $ProdComposeFile }
    
    if ($Service) {
        Write-Info "Logs du service: $Service"
        docker-compose -f $composeFile logs -f $Service
    } else {
        Write-Info "Logs de tous les services"
        docker-compose -f $composeFile logs -f
    }
}

# Nettoyer les ressources Docker
function Invoke-Cleanup {
    param([string]$Env = "production")
    
    $composeFile = if ($Env -eq "dev") { $DevComposeFile } else { $ProdComposeFile }
    
    Write-Warning "Nettoyage des ressources Docker..."
    
    # Arrêter et supprimer les conteneurs
    docker-compose -f $composeFile down -v --remove-orphans
    
    # Supprimer les images inutilisées
    docker image prune -f
    
    # Optionnel: supprimer les volumes
    $response = Read-Host "Voulez-vous supprimer les volumes de données? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        docker volume prune -f
        Write-Warning "Volumes supprimés"
    }
    
    Write-Success "Nettoyage terminé"
}

# Sauvegarder les données MongoDB
function Backup-MongoDB {
    Write-Info "Sauvegarde de MongoDB..."
    
    # Créer le dossier de sauvegarde
    $backupDir = "backup\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    try {
        # Dump MongoDB
        docker exec sio_mongodb_prod mongodump --out /tmp/backup
        docker cp sio_mongodb_prod:/tmp/backup $backupDir\
        
        Write-Success "Sauvegarde créée dans: $backupDir"
    }
    catch {
        Write-Error "Erreur lors de la sauvegarde: $_"
    }
}

# Surveiller les performances
function Start-Monitoring {
    Write-Info "Surveillance des performances..."
    Write-Info "Appuyez sur Ctrl+C pour arrêter"
    
    try {
        while ($true) {
            Clear-Host
            Write-Host "=== CPU et Mémoire ===" -ForegroundColor Yellow
            docker stats --no-stream --format "table {{.Name}}`t{{.CPUPerc}}`t{{.MemUsage}}`t{{.MemPerc}}"
            Write-Host ""
            Write-Host "=== Espace disque ===" -ForegroundColor Yellow
            docker system df
            Write-Host ""
            Write-Host "Mise à jour dans 5 secondes..." -ForegroundColor Gray
            Start-Sleep -Seconds 5
        }
    }
    catch {
        Write-Info "Surveillance arrêtée"
    }
}

# Mise à jour de l'application
function Update-Application {
    param([string]$Env = "production")
    
    Write-Info "Mise à jour de l'application..."
    
    try {
        # Pull des dernières modifications
        git pull
        
        # Rebuild et redémarrage
        Build-Images $Env
        Restart-Services $Env
        
        Write-Success "Mise à jour terminée"
    }
    catch {
        Write-Error "Erreur lors de la mise à jour: $_"
    }
}

# Afficher l'aide
function Show-Help {
    Write-Host "SIO Audit App - Docker Manager (PowerShell)" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Usage: .\docker-manager.ps1 <command> [environment] [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  build [env]          Construire les images Docker"
    Write-Host "  start [env]          Démarrer les services"
    Write-Host "  stop [env]           Arrêter les services"
    Write-Host "  restart [env]        Redémarrer les services"
    Write-Host "  status [env]         Afficher le statut des services"
    Write-Host "  logs [env] [service] Afficher les logs"
    Write-Host "  cleanup [env]        Nettoyer les ressources Docker"
    Write-Host "  backup               Sauvegarder MongoDB"
    Write-Host "  monitor              Surveiller les performances"
    Write-Host "  update [env]         Mettre à jour l'application"
    Write-Host "  help                 Afficher cette aide"
    Write-Host ""
    Write-Host "Environments:" -ForegroundColor Yellow
    Write-Host "  production (default) Mode production"
    Write-Host "  dev                  Mode développement"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\docker-manager.ps1 start dev         Démarrer en mode développement"
    Write-Host "  .\docker-manager.ps1 logs prod backend Voir les logs du backend en prod"
    Write-Host "  .\docker-manager.ps1 backup            Sauvegarder les données"
}

# Script principal
function Main {
    # Vérifier Docker au démarrage
    Test-Docker
    Initialize-EnvFiles
    
    switch ($Command.ToLower()) {
        "build" {
            Build-Images $Environment
        }
        "start" {
            Start-Services $Environment
        }
        "stop" {
            Stop-Services $Environment
        }
        "restart" {
            Restart-Services $Environment
        }
        "status" {
            Show-Status $Environment
        }
        "logs" {
            Show-Logs $Environment $Option
        }
        "cleanup" {
            Invoke-Cleanup $Environment
        }
        "backup" {
            Backup-MongoDB
        }
        "monitor" {
            Start-Monitoring
        }
        "update" {
            Update-Application $Environment
        }
        "help" {
            Show-Help
        }
        default {
            if ($Command -ne "help") {
                Write-Error "Commande inconnue: $Command"
            }
            Show-Help
        }
    }
}

# Exécuter le script principal
Main



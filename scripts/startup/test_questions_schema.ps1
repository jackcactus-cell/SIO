# Script de Test des Questions Basées sur le Schéma Oracle Audit
# Teste toutes les questions optimisées pour l'étude

Write-Host "🔍 Test des Questions d'Étude - Schéma Oracle Audit" -ForegroundColor Green
Write-Host "=" * 60

# Fonction pour tester une question
function Test-Question {
    param($question, $description)
    
    Write-Host "`n📝 Test: $description" -ForegroundColor Yellow
    Write-Host "Question: $question" -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot" -Method POST -ContentType "application/json" -Body "{`"question`":`"$question`"}"
        
        if ($response.status -eq "success") {
            Write-Host "✅ Succès - Type: $($response.data.type)" -ForegroundColor Green
            if ($response.data.summary) {
                Write-Host "📊 Résumé: $($response.data.summary.Substring(0, [Math]::Min(100, $response.data.summary.Length)))..." -ForegroundColor White
            }
        } else {
            Write-Host "❌ Échec: $($response.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 1
}

# Questions de test basées sur le schéma exact
$questions = @(
    @{
        question = "Analyse OS_USERNAME détaillée"
        description = "Analyse des utilisateurs système d'exploitation"
    },
    @{
        question = "Analyse DBUSERNAME avec statistiques"
        description = "Analyse des utilisateurs base de données"
    },
    @{
        question = "Analyse USERHOST détaillée"
        description = "Cartographie des hôtes sources"
    },
    @{
        question = "Analyse CLIENT_PROGRAM_NAME complète"
        description = "Outils utilisés pour accéder à Oracle"
    },
    @{
        question = "Analyse OBJECT_SCHEMA détaillée"
        description = "Schémas les plus sollicités"
    },
    @{
        question = "Analyse ACTION_NAME statistiques"
        description = "Types d'opérations effectuées"
    },
    @{
        question = "Analyse EVENT_TIMESTAMP détaillée"
        description = "Répartition temporelle de l'activité"
    },
    @{
        question = "Analyse AUTHENTICATION_TYPE détaillée"
        description = "Types d'authentification utilisés"
    },
    @{
        question = "Analyse SESSIONID avancée"
        description = "Durée et patterns des sessions"
    },
    @{
        question = "Analyse complète toutes colonnes"
        description = "Vue d'ensemble multi-dimensionnelle"
    }
)

# Test de connectivité
Write-Host "`n🔗 Test de connectivité..." -ForegroundColor Blue
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:4000/api/audit/raw" -Method GET
    Write-Host "✅ Backend accessible - Source: $($healthCheck.source)" -ForegroundColor Green
    Write-Host "📊 Données disponibles: $($healthCheck.data.Count) entrées" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Assurez-vous que le backend est démarré: node SIO/backend/index.js" -ForegroundColor Yellow
    exit 1
}

# Exécution des tests
$successCount = 0
$totalCount = $questions.Count

foreach ($test in $questions) {
    Test-Question -question $test.question -description $test.description
    $successCount++
}

# Résumé final
Write-Host "`n" + "=" * 60 -ForegroundColor Green
Write-Host "📈 RÉSUMÉ DES TESTS" -ForegroundColor Green
Write-Host "✅ Tests exécutés: $successCount/$totalCount" -ForegroundColor White
Write-Host "🎯 Schéma supporté: ID AUDIT_TYPE SESSIONID OS_USERNAME USERHOST TERMINAL" -ForegroundColor White
Write-Host "   AUTHENTICATION_TYPE DBUSERNAME CLIENT_PROGRAM_NAME OBJECT_SCHEMA" -ForegroundColor White
Write-Host "   OBJECT_NAME SQL_TEXT SQL_BINDS EVENT_TIMESTAMP ACTION_NAME INSTANCE_ID INSTANCE" -ForegroundColor White
Write-Host "`n💡 Pour des questions détaillées, utilisez les noms exacts des colonnes" -ForegroundColor Yellow
Write-Host "📚 Documentation complète: SIO/QUESTIONS_ETUDE_SCHEMA.md" -ForegroundColor Yellow




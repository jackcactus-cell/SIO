#!/bin/bash

echo "🚀 Démarrage du Projet Oracle Audit Complet"
echo "=========================================="

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker Desktop."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose."
    exit 1
fi

# Vérifier si les services tournent déjà
echo "🔍 Vérification des services existants..."
RUNNING_SERVICES=$(docker-compose -f docker-compose.dev.yml ps --services --filter "status=running" 2>/dev/null | wc -l)

if [ $RUNNING_SERVICES -gt 0 ]; then
    echo "⚠️  Certains services sont déjà en cours d'exécution."
    read -p "Voulez-vous les redémarrer ? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Arrêt des services existants..."
        docker-compose -f docker-compose.dev.yml down
    fi
fi

# Configuration Oracle optionnelle
if [ -f "oracle.env" ]; then
    echo "✅ Configuration Oracle trouvée (oracle.env)"
    ENV_FILE="--env-file oracle.env"
else
    echo "⚠️  Aucune configuration Oracle trouvée"
    echo "   Pour activer l'extraction Oracle automatique:"
    echo "   1. Copiez oracle.env.example vers oracle.env"
    echo "   2. Configurez vos paramètres Oracle"
    echo "   3. Redémarrez le projet"
    ENV_FILE=""
fi

# Créer les répertoires nécessaires
echo "📁 Création des répertoires..."
mkdir -p logs backend/llm-prototype/logs backend/llm-prototype/chroma_db backend/llm-prototype/uploads

# Construire et démarrer les services
echo "🐳 Construction et démarrage des services Docker..."
echo "   Ceci peut prendre quelques minutes la première fois..."

if docker-compose -f docker-compose.dev.yml $ENV_FILE up -d --build; then
    echo "✅ Services démarrés avec succès!"
    
    echo "⏳ Attente de l'initialisation des services..."
    sleep 10
    
    # Vérifier les services
    echo "🔍 Vérification des services..."
    
    # Frontend
    if curl -s http://localhost:5173 > /dev/null; then
        echo "✅ Frontend: http://localhost:5173"
    else
        echo "⚠️  Frontend: en cours de démarrage..."
    fi
    
    # Backend Node
    if curl -s http://localhost:4000 > /dev/null; then
        echo "✅ Backend Node.js: http://localhost:4000"
    else
        echo "⚠️  Backend Node.js: en cours de démarrage..."
    fi
    
    # Backend Python
    if curl -s http://localhost:8000 > /dev/null; then
        echo "✅ Backend Python: http://localhost:8000"
    else
        echo "⚠️  Backend Python: en cours de démarrage..."
    fi
    
    # Backend LLM
    if curl -s http://localhost:8001 > /dev/null; then
        echo "✅ Backend LLM: http://localhost:8001"
    else
        echo "⚠️  Backend LLM: en cours de démarrage..."
    fi
    
    echo ""
    echo "🎉 PROJET DÉMARRÉ AVEC SUCCÈS!"
    echo "=============================="
    echo ""
    echo "📱 Accès à l'application:"
    echo "   🌐 Frontend:           http://localhost:5173"
    echo "   🔧 API Node.js:        http://localhost:4000"
    echo "   🐍 API Python:         http://localhost:8000"
    echo "   🤖 API LLM:            http://localhost:8001"
    echo "   📚 Documentation LLM:  http://localhost:8001/docs"
    echo ""
    echo "🧪 Test du système:"
    echo "   python3 test_final_system.py"
    echo ""
    echo "📊 Fonctionnalités disponibles:"
    echo "   ✅ Upload de fichiers Excel/CSV/XLS"
    echo "   ✅ Chatbot intelligent avec mots-clés"
    echo "   ✅ Extraction Oracle Audit Trail (si configuré)"
    echo "   ✅ Analyse automatique et questions suggérées"
    echo "   ✅ Tableaux simples et résumés"
    echo ""
    echo "🔧 Gestion des services:"
    echo "   Arrêter:    docker-compose -f docker-compose.dev.yml down"
    echo "   Logs:       docker-compose -f docker-compose.dev.yml logs -f"
    echo "   Redémarrer: ./start_project.sh"
    echo ""
    echo "📖 Consultez README_FINALISATION.md pour la documentation complète"
    
else
    echo "❌ Erreur lors du démarrage des services"
    echo "🔍 Vérifiez les logs avec: docker-compose -f docker-compose.dev.yml logs"
    exit 1
fi

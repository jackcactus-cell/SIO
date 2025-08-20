#!/bin/bash

# Script de setup automatique pour le système LLM d'audit Oracle
# Usage: ./setup.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Installation du système LLM d'audit Oracle"
echo "=============================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier Python
print_status "Vérification de Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python $PYTHON_VERSION trouvé"
else
    print_error "Python 3 n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier pip
print_status "Vérification de pip..."
if command -v pip3 &> /dev/null; then
    print_success "pip3 trouvé"
else
    print_error "pip3 n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Créer l'environnement virtuel
print_status "Création de l'environnement virtuel..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Environnement virtuel créé"
else
    print_warning "L'environnement virtuel existe déjà"
fi

# Activer l'environnement virtuel
print_status "Activation de l'environnement virtuel..."
source venv/bin/activate

# Mettre à jour pip
print_status "Mise à jour de pip..."
pip install --upgrade pip

# Installer les dépendances
print_status "Installation des dépendances Python..."
pip install -r requirements.txt

# Créer le fichier .env s'il n'existe pas
if [ ! -f ".env" ]; then
    print_status "Création du fichier .env..."
    cat > .env << EOF
# Configuration du système LLM d'audit Oracle

# Modèle LLM
LLM_MODEL_NAME=microsoft/DialoGPT-medium
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Base de données vectorielle
CHROMA_DB_PATH=./chroma_db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8001

# Logging
LOG_LEVEL=INFO
LOG_FILE=llm_api.log

# Cache
CACHE_ENABLED=true
CACHE_TTL=3600
EOF
    print_success "Fichier .env créé"
else
    print_warning "Le fichier .env existe déjà"
fi

# Créer les dossiers nécessaires
print_status "Création des dossiers nécessaires..."
mkdir -p logs
mkdir -p chroma_db
mkdir -p data

# Télécharger les modèles (optionnel)
read -p "Voulez-vous télécharger les modèles maintenant ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Téléchargement des modèles (cela peut prendre quelques minutes)..."
    python -c "
from transformers import AutoTokenizer, AutoModelForCausalLM
from sentence_transformers import SentenceTransformer

print('Téléchargement du modèle LLM...')
tokenizer = AutoTokenizer.from_pretrained('microsoft/DialoGPT-medium')
model = AutoModelForCausalLM.from_pretrained('microsoft/DialoGPT-medium')

print('Téléchargement du modèle d\'embedding...')
embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

print('Modèles téléchargés avec succès!')
"
    print_success "Modèles téléchargés"
else
    print_warning "Les modèles seront téléchargés au premier démarrage"
fi

# Test rapide du système
print_status "Test rapide du système..."
python -c "
import sys
sys.path.append('.')

try:
    from audit_llm_service import audit_llm_service
    print('✅ Service LLM initialisé avec succès')
    
    from api_server import app
    print('✅ Serveur API initialisé avec succès')
    
    print('✅ Tous les composants sont prêts')
except Exception as e:
    print(f'❌ Erreur lors du test: {e}')
    sys.exit(1)
"

# Créer le script de démarrage
print_status "Création du script de démarrage..."
cat > start_llm_server.sh << 'EOF'
#!/bin/bash

# Script de démarrage du serveur LLM
# Usage: ./start_llm_server.sh

echo "🚀 Démarrage du serveur LLM d'audit Oracle..."

# Activer l'environnement virtuel
source venv/bin/activate

# Vérifier que le port est libre
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Le port 8001 est déjà utilisé. Arrêtez le processus existant."
    exit 1
fi

# Démarrer le serveur
echo "📡 Serveur accessible sur http://localhost:8001"
echo "📚 Documentation API: http://localhost:8001/docs"
echo "🔄 Redémarrage automatique activé"
echo "⏹️  Appuyez sur Ctrl+C pour arrêter"

python api_server.py
EOF

chmod +x start_llm_server.sh
print_success "Script de démarrage créé"

# Créer le script de test
print_status "Création du script de test..."
cat > test_system.sh << 'EOF'
#!/bin/bash

# Script de test du système LLM
# Usage: ./test_system.sh

echo "🧪 Test du système LLM d'audit Oracle..."

# Activer l'environnement virtuel
source venv/bin/activate

# Lancer les tests
python test_llm_system.py
EOF

chmod +x test_system.sh
print_success "Script de test créé"

# Afficher les instructions finales
echo
echo "🎉 Installation terminée avec succès!"
echo "====================================="
echo
echo "📋 Prochaines étapes:"
echo "1. Démarrer le serveur: ./start_llm_server.sh"
echo "2. Tester le système: ./test_system.sh"
echo "3. Accéder à l'API: http://localhost:8001"
echo "4. Documentation: http://localhost:8001/docs"
echo
echo "📁 Structure créée:"
echo "├── venv/                    # Environnement virtuel Python"
echo "├── logs/                    # Fichiers de logs"
echo "├── chroma_db/              # Base de données vectorielle"
echo "├── data/                   # Données du système"
echo "├── .env                    # Configuration"
echo "├── start_llm_server.sh     # Script de démarrage"
echo "└── test_system.sh          # Script de test"
echo
echo "🔧 Commandes utiles:"
echo "- Démarrer: ./start_llm_server.sh"
echo "- Tester: ./test_system.sh"
echo "- Logs: tail -f logs/llm_api.log"
echo "- Arrêter: Ctrl+C dans le terminal du serveur"
echo
echo "📚 Documentation complète: README.md"
echo
print_success "Installation terminée! 🚀" 
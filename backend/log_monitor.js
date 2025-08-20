const fs = require('fs');
const path = require('path');

// Configuration
const LOGS_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILES = [
  'backend.log',
  'backend-errors.log',
  'api.log',
  'chatbot.log',
  'user-actions.log',
  'security.log',
  'performance.log'
];

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Fonction pour colorer le texte
function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Fonction pour obtenir le nom court du fichier
function getShortName(filename) {
  return filename.replace('.log', '').toUpperCase();
}

// Fonction pour déterminer la couleur selon le type de log
function getLogColor(line) {
  if (line.includes('[ERROR]')) return 'red';
  if (line.includes('[WARN]')) return 'yellow';
  if (line.includes('[SECURITY_THREAT]')) return 'red';
  if (line.includes('[PERFORMANCE]') && line.includes('time.*[5-9][0-9][0-9]ms')) return 'yellow';
  if (line.includes('[USER_LOGIN]')) return 'green';
  if (line.includes('[CHATBOT_QUESTION]')) return 'cyan';
  return 'white';
}

// Fonction pour surveiller un fichier de log
function watchLogFile(filename) {
  const filePath = path.join(LOGS_DIR, filename);
  const shortName = getShortName(filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(colorize(`⚠️  Fichier ${filename} non trouvé`, 'yellow'));
    return;
  }

  console.log(colorize(`👁️  Surveillance de ${shortName} (${filename})`, 'cyan'));

  // Lire les dernières lignes existantes
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  let lastLineCount = lines.length;

  // Surveiller les nouvelles lignes
  fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
    if (curr.size > prev.size) {
      const newContent = fs.readFileSync(filePath, 'utf8');
      const newLines = newContent.split('\n').filter(line => line.trim());
      
      if (newLines.length > lastLineCount) {
        const newEntries = newLines.slice(lastLineCount);
        lastLineCount = newLines.length;
        
        newEntries.forEach(line => {
          if (line.trim()) {
            const color = getLogColor(line);
            const timestamp = new Date().toISOString();
            console.log(colorize(`[${timestamp}] ${shortName}: ${line}`, color));
          }
        });
      }
    }
  });
}

// Fonction pour afficher les statistiques en temps réel
function displayStats() {
  console.log(colorize('\n📊 Statistiques en temps réel:', 'bright'));
  
  LOG_FILES.forEach(filename => {
    const filePath = path.join(LOGS_DIR, filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      const errors = lines.filter(line => line.includes('[ERROR]')).length;
      const warnings = lines.filter(line => line.includes('[WARN]')).length;
      
      console.log(colorize(`${getShortName(filename)}: ${lines.length} lignes, ${errors} erreurs, ${warnings} avertissements`, 'blue'));
    }
  });
}

// Fonction pour filtrer les logs
function filterLogs(pattern) {
  console.log(colorize(`\n🔍 Recherche de "${pattern}" dans tous les logs:`, 'bright'));
  
  LOG_FILES.forEach(filename => {
    const filePath = path.join(LOGS_DIR, filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      const matches = lines.filter(line => line.toLowerCase().includes(pattern.toLowerCase()));
      
      if (matches.length > 0) {
        console.log(colorize(`\n${getShortName(filename)} (${matches.length} correspondances):`, 'cyan'));
        matches.slice(-5).forEach(line => { // Afficher les 5 dernières correspondances
          const color = getLogColor(line);
          console.log(colorize(`  ${line}`, color));
        });
      }
    }
  });
}

// Fonction pour afficher les erreurs récentes
function showRecentErrors() {
  console.log(colorize('\n❌ Erreurs récentes:', 'bright'));
  
  LOG_FILES.forEach(filename => {
    const filePath = path.join(LOGS_DIR, filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      const errors = lines.filter(line => line.includes('[ERROR]'));
      
      if (errors.length > 0) {
        console.log(colorize(`\n${getShortName(filename)}:`, 'cyan'));
        errors.slice(-3).forEach(error => { // Afficher les 3 dernières erreurs
          console.log(colorize(`  ${error}`, 'red'));
        });
      }
    }
  });
}

// Fonction pour afficher l'aide
function showHelp() {
  console.log(colorize('\n📖 Commandes disponibles:', 'bright'));
  console.log(colorize('  stats     - Afficher les statistiques', 'green'));
  console.log(colorize('  errors    - Afficher les erreurs récentes', 'green'));
  console.log(colorize('  filter <pattern> - Filtrer les logs', 'green'));
  console.log(colorize('  help      - Afficher cette aide', 'green'));
  console.log(colorize('  quit      - Quitter le moniteur', 'green'));
  console.log(colorize('  clear     - Effacer l\'écran', 'green'));
}

// Fonction principale
function main() {
  console.log(colorize('🔍 Moniteur de logs SAO - Surveillance en temps réel', 'bright'));
  console.log(colorize('==================================================', 'bright'));
  console.log(colorize('Appuyez sur Ctrl+C pour arrêter', 'yellow'));
  console.log(colorize('Tapez "help" pour voir les commandes disponibles\n', 'yellow'));

  // Démarrer la surveillance de tous les fichiers
  LOG_FILES.forEach(watchLogFile);

  // Interface de commandes
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (data) => {
    const command = data.trim().toLowerCase();
    
    switch (command) {
      case 'stats':
        displayStats();
        break;
      case 'errors':
        showRecentErrors();
        break;
      case 'help':
        showHelp();
        break;
      case 'clear':
        console.clear();
        break;
      case 'quit':
      case 'exit':
        console.log(colorize('\n👋 Arrêt du moniteur de logs', 'green'));
        process.exit(0);
        break;
      default:
        if (command.startsWith('filter ')) {
          const pattern = command.substring(7);
          filterLogs(pattern);
        } else if (command) {
          console.log(colorize(`❓ Commande inconnue: ${command}`, 'red'));
          console.log(colorize('Tapez "help" pour voir les commandes disponibles', 'yellow'));
        }
    }
  });

  // Gestion de l'arrêt propre
  process.on('SIGINT', () => {
    console.log(colorize('\n👋 Arrêt du moniteur de logs', 'green'));
    process.exit(0);
  });

  // Afficher l'aide au démarrage
  showHelp();
}

// Exporter les fonctions pour utilisation externe
module.exports = {
  watchLogFile,
  displayStats,
  filterLogs,
  showRecentErrors
};

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

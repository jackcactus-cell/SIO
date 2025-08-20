const fs = require('fs');
const path = require('path');

// Configuration des chemins de logs
const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Fonction pour lire un fichier de log
function readLogFile(filename) {
  const filePath = path.join(LOGS_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8').split('\n').filter(line => line.trim());
    }
    return [];
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${filename}:`, error.message);
    return [];
  }
}

// Fonction pour analyser les logs
function analyzeLogs() {
  console.log('📊 Analyse des logs du système SAO\n');

  const logFiles = [
    'backend.log',
    'backend-errors.log',
    'api.log',
    'chatbot.log',
    'mongodb.log',
    'user-actions.log',
    'security.log',
    'performance.log',
    'file-operations.log',
    'oracle-audit.log',
    'system-events.log',
    'navigation.log',
    'database.log',
    'general.log'
  ];

  const analysis = {};

  logFiles.forEach(filename => {
    const lines = readLogFile(filename);
    const logType = filename.replace('.log', '');
    
    analysis[logType] = {
      totalLines: lines.length,
      errors: lines.filter(line => line.includes('[ERROR]')).length,
      warnings: lines.filter(line => line.includes('[WARN]')).length,
      info: lines.filter(line => line.includes('[INFO]')).length,
      lastEntry: lines[lines.length - 1] || 'Aucune entrée',
      sampleEntries: lines.slice(-3) // 3 dernières entrées
    };
  });

  return analysis;
}

// Fonction pour afficher les statistiques
function displayStatistics(analysis) {
  console.log('📈 Statistiques générales :\n');
  
  let totalEntries = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  Object.entries(analysis).forEach(([logType, stats]) => {
    totalEntries += stats.totalLines;
    totalErrors += stats.errors;
    totalWarnings += stats.warnings;
    
    console.log(`${logType.toUpperCase()}:`);
    console.log(`  📝 Total: ${stats.totalLines} entrées`);
    console.log(`  ❌ Erreurs: ${stats.errors}`);
    console.log(`  ⚠️  Avertissements: ${stats.warnings}`);
    console.log(`  ℹ️  Infos: ${stats.info}`);
    console.log('');
  });

  console.log('🎯 RÉSUMÉ GLOBAL:');
  console.log(`  📊 Total d'entrées: ${totalEntries}`);
  console.log(`  ❌ Total d'erreurs: ${totalErrors}`);
  console.log(`  ⚠️  Total d'avertissements: ${totalWarnings}`);
  console.log(`  📈 Taux d'erreur: ${totalEntries > 0 ? ((totalErrors / totalEntries) * 100).toFixed(2) : 0}%`);
}

// Fonction pour afficher les dernières entrées
function displayRecentEntries(analysis) {
  console.log('\n🕒 Dernières entrées par type de log:\n');
  
  Object.entries(analysis).forEach(([logType, stats]) => {
    if (stats.totalLines > 0) {
      console.log(`${logType.toUpperCase()}:`);
      stats.sampleEntries.forEach(entry => {
        if (entry.trim()) {
          console.log(`  ${entry}`);
        }
      });
      console.log('');
    }
  });
}

// Fonction pour rechercher des patterns spécifiques
function searchPatterns(analysis) {
  console.log('\n🔍 Recherche de patterns spécifiques:\n');
  
  const patterns = {
    'Erreurs critiques': /\[ERROR\].*critical/i,
    'Tentatives de connexion': /login|connect/i,
    'Actions de sécurité': /security|auth|threat/i,
    'Performances lentes': /time.*[5-9][0-9][0-9]ms|time.*[0-9][0-9][0-9][0-9]ms/i,
    'Accès refusés': /denied|forbidden|unauthorized/i
  };

  Object.entries(patterns).forEach(([patternName, regex]) => {
    console.log(`${patternName}:`);
    let found = false;
    
    Object.entries(analysis).forEach(([logType, stats]) => {
      const matchingLines = stats.sampleEntries.filter(line => regex.test(line));
      if (matchingLines.length > 0) {
        console.log(`  ${logType}: ${matchingLines.length} correspondance(s)`);
        matchingLines.forEach(line => {
          console.log(`    ${line}`);
        });
        found = true;
      }
    });
    
    if (!found) {
      console.log(`  Aucune correspondance trouvée`);
    }
    console.log('');
  });
}

// Fonction pour générer un rapport
function generateReport(analysis) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalLogFiles: Object.keys(analysis).length,
      totalEntries: Object.values(analysis).reduce((sum, stats) => sum + stats.totalLines, 0),
      totalErrors: Object.values(analysis).reduce((sum, stats) => sum + stats.errors, 0),
      totalWarnings: Object.values(analysis).reduce((sum, stats) => sum + stats.warnings, 0)
    },
    details: analysis
  };

  const reportPath = path.join(LOGS_DIR, 'log_analysis_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Rapport généré: ${reportPath}`);
}

// Fonction pour nettoyer les anciens logs
function cleanOldLogs() {
  console.log('\n🧹 Nettoyage des anciens logs...');
  
  const logFiles = fs.readdirSync(LOGS_DIR).filter(file => file.endsWith('.log'));
  let cleanedCount = 0;
  
  logFiles.forEach(filename => {
    const filePath = path.join(LOGS_DIR, filename);
    const stats = fs.statSync(filePath);
    const daysOld = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysOld > 7) {
      // Garder seulement les 1000 dernières lignes
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      if (lines.length > 1000) {
        const recentLines = lines.slice(-1000);
        fs.writeFileSync(filePath, recentLines.join('\n') + '\n', 'utf8');
        cleanedCount++;
        console.log(`  ✅ ${filename}: nettoyé (${lines.length - 1000} lignes supprimées)`);
      }
    }
  });
  
  console.log(`🧹 Nettoyage terminé: ${cleanedCount} fichiers traités`);
}

// Fonction principale
function main() {
  try {
    console.log('🔍 Analyseur de logs du système SAO\n');
    
    // Analyser les logs
    const analysis = analyzeLogs();
    
    // Afficher les statistiques
    displayStatistics(analysis);
    
    // Afficher les dernières entrées
    displayRecentEntries(analysis);
    
    // Rechercher des patterns
    searchPatterns(analysis);
    
    // Générer un rapport
    generateReport(analysis);
    
    // Nettoyer les anciens logs
    cleanOldLogs();
    
    console.log('\n✅ Analyse terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
}

// Exporter les fonctions pour utilisation externe
module.exports = {
  analyzeLogs,
  displayStatistics,
  displayRecentEntries,
  searchPatterns,
  generateReport,
  cleanOldLogs
};

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

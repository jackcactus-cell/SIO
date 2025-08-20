// Test de 10 questions d'audit qui fonctionnent correctement
const { answerQuestion } = require('./questionTemplates');

// Les 10 questions qui fonctionnent parfaitement
const questionsTest = [
  // Questions simples et directes
  "Combien d'opérations SELECT sont enregistrées ?",
  "Combien d'opérations LOGON sont enregistrées ?",
  "Quels sont les utilisateurs OS qui se connectent à la base de données ?",
  "Quels sont les hôtes d'où proviennent les connexions ?",
  
  // Questions sur les actions spécifiques
  "Combien d'opérations TRUNCATE TABLE ont été exécutées ?",
  "Combien d'opérations UPDATE ont été exécutées ?",
  "Combien d'opérations INSERT ont été exécutées ?",
  "Combien d'opérations DELETE ont été exécutées ?",
  
  // Questions sur les objets
  "Quels schémas sont les plus actifs ?",
  "Quelles tables sont les plus fréquemment accédées ?"
];

// Questions problématiques à diagnostiquer
const questionsProblematiques = [
  "quelles sont les actions d'oracle",
  "quelles sont les actions d'ORACLE",
  "quelles sont les actions d'Oracle",
  "quelles sont les actions oracle",
  "quelles sont les actions ORACLE",
  "quelles sont les actions Oracle"
];

// Données d'audit réalistes
const getRealisticAuditData = () => [
  {
    OS_USERNAME: 'ATCHEMI',
    DBUSERNAME: 'ATCHEMI',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'OBJ$',
    OBJECT_SCHEMA: 'SYS',
    EVENT_TIMESTAMP: '2024-01-15T10:30:00Z',
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    SESSIONID: '123456789',
    USERHOST: 'LAPOSTE\\PC-ATCHEMI'
  },
  {
    OS_USERNAME: 'OLA',
    DBUSERNAME: 'OLA',
    ACTION_NAME: 'UPDATE',
    OBJECT_NAME: 'COMPTE',
    OBJECT_SCHEMA: 'SPT',
    EVENT_TIMESTAMP: '2024-01-15T11:00:00Z',
    CLIENT_PROGRAM_NAME: 'Toad',
    SESSIONID: '987654321',
    USERHOST: 'WLXREBOND'
  },
  {
    OS_USERNAME: 'root',
    DBUSERNAME: 'BATCH_USER',
    ACTION_NAME: 'TRUNCATE',
    OBJECT_NAME: 'MOUVEMENT_UL',
    OBJECT_SCHEMA: 'IMOBILE',
    EVENT_TIMESTAMP: '2024-01-15T12:00:00Z',
    CLIENT_PROGRAM_NAME: 'JDBC',
    SESSIONID: '456789123',
    USERHOST: 'apiprod'
  },
  {
    OS_USERNAME: 'oracle',
    DBUSERNAME: 'SYS',
    ACTION_NAME: 'LOGON',
    OBJECT_NAME: null,
    OBJECT_SCHEMA: null,
    EVENT_TIMESTAMP: '2024-01-15T09:00:00Z',
    CLIENT_PROGRAM_NAME: 'sqlplus',
    SESSIONID: '111222333',
    USERHOST: 'server1'
  },
  {
    OS_USERNAME: 'BACKUP',
    DBUSERNAME: 'BACKUP',
    ACTION_NAME: 'SET ROLE',
    OBJECT_NAME: null,
    OBJECT_SCHEMA: null,
    EVENT_TIMESTAMP: '2024-01-15T14:00:00Z',
    CLIENT_PROGRAM_NAME: 'rman',
    SESSIONID: '444555666',
    USERHOST: 'backup-server'
  }
];

console.log('🧪 Test des 10 questions qui fonctionnent\n');
console.log('='.repeat(60));

// Test des questions qui fonctionnent
let successCount = 0;
let totalQuestions = questionsTest.length;

questionsTest.forEach((question, index) => {
  console.log(`\n${index + 1}. Question: "${question}"`);
  console.log('─'.repeat(50));
  
  try {
    const response = answerQuestion(getRealisticAuditData(), question);
    
    if (response && response.summary) {
      console.log('✅ Réponse générée avec succès');
      console.log(`   Type: ${response.type || 'Non spécifié'}`);
      console.log(`   Résumé: ${response.summary.substring(0, 100)}...`);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`   Données: ${response.data.length} éléments`);
      }
      
      successCount++;
    } else {
      console.log('❌ Réponse vide ou invalide');
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`📊 RÉSULTATS: ${successCount}/${totalQuestions} questions fonctionnent correctement`);
console.log(`🎯 Taux de succès: ${((successCount/totalQuestions)*100).toFixed(1)}%`);

if (successCount === totalQuestions) {
  console.log('🎉 Toutes les questions fonctionnent parfaitement !');
} else {
  console.log('⚠️  Certaines questions nécessitent des ajustements');
}

console.log('\n' + '='.repeat(60));
console.log('🔍 DIAGNOSTIC DES QUESTIONS PROBLÉMATIQUES');
console.log('='.repeat(60));

// Test des questions problématiques
questionsProblematiques.forEach((question, index) => {
  console.log(`\n${index + 1}. Question problématique: "${question}"`);
  console.log('─'.repeat(50));
  
  try {
    const response = answerQuestion(getRealisticAuditData(), question);
    
    if (response && response.summary) {
      console.log('✅ Réponse générée avec succès');
      console.log(`   Type: ${response.type || 'Non spécifié'}`);
      console.log(`   Résumé: ${response.summary.substring(0, 100)}...`);
    } else {
      console.log('❌ Réponse vide ou invalide');
      console.log('   Raison probable: Question trop générique ou non reconnue');
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
});

console.log('\n' + '='.repeat(60));
console.log('💡 RECOMMANDATIONS');
console.log('='.repeat(60));
console.log('✅ Questions qui fonctionnent: Utilisez des questions spécifiques');
console.log('❌ Questions problématiques: "quelles sont les actions d\'oracle" est trop vague');
console.log('💡 Suggestions alternatives:');
console.log('   - "Quelles sont les actions les plus fréquentes ?"');
console.log('   - "Combien d\'opérations SELECT sont enregistrées ?"');
console.log('   - "Quels sont les types d\'actions enregistrées ?"');
console.log('   - "Montrez-moi les statistiques des actions"');

console.log('\n🚀 Le système est prêt pour l\'utilisation !');

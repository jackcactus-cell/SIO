// Test pour vérifier le traitement des questions sur les utilisateurs
const IntelligentChatbot = require('./intelligentChatbot');
const EnhancedQuestionAnalyzer = require('./enhancedQuestionAnalyzer');

// Données de test
const testAuditData = [
  {
    _id: 'test_1',
    OS_USERNAME: 'datchemi',
    DBUSERNAME: 'datchemi',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'SEQ$',
    EVENT_TIMESTAMP: '2025-07-31T10:30:00Z',
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SYS',
    USERHOST: '192.168.60.42'
  },
  {
    _id: 'test_2',
    OS_USERNAME: 'ATCHEMI',
    DBUSERNAME: 'ATCHEMI',
    ACTION_NAME: 'INSERT',
    OBJECT_NAME: 'SEQ$',
    EVENT_TIMESTAMP: '2025-07-31T11:15:00Z',
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'USER_SCHEMA',
    USERHOST: '192.168.60.42'
  },
  {
    _id: 'test_3',
    OS_USERNAME: 'SYSTEM',
    DBUSERNAME: 'SYSTEM',
    ACTION_NAME: 'UPDATE',
    OBJECT_NAME: 'DBA_USERS',
    EVENT_TIMESTAMP: '2025-07-31T11:45:00Z',
    CLIENT_PROGRAM_NAME: 'SQL*Plus',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SYS',
    USERHOST: '192.168.60.42'
  },
  {
    _id: 'test_4',
    OS_USERNAME: 'SYS',
    DBUSERNAME: 'SYS',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'SUM$',
    EVENT_TIMESTAMP: '2025-07-31T12:00:00Z',
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SYS',
    USERHOST: '192.168.60.42'
  },
  {
    _id: 'test_5',
    OS_USERNAME: 'datchemi',
    DBUSERNAME: 'datchemi',
    ACTION_NAME: 'DELETE',
    OBJECT_NAME: 'TEMP_TABLE',
    EVENT_TIMESTAMP: '2025-07-31T12:30:00Z',
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'USER_SCHEMA',
    USERHOST: '192.168.60.42'
  }
];

// Questions de test
const testQuestions = [
  "Quels sont les utilisateurs les plus actifs ?",
  "Qui utilise le plus SQL Developer ?",
  "Quels utilisateurs accèdent au schéma SYS ?",
  "Combien d'utilisateurs uniques se sont connectés ?",
  "Qui a les privilèges les plus élevés ?",
  "Quels utilisateurs utilisent Toad.exe ?",
  "Qui effectue le plus d'actions de maintenance ?",
  "Quels utilisateurs sont connectés en ce moment ?"
];

// Fonction de test
function testUserQuestions() {
  console.log('🧪 Test du traitement des questions sur les utilisateurs\n');
  
  const chatbot = new IntelligentChatbot();
  const analyzer = new EnhancedQuestionAnalyzer();
  
  testQuestions.forEach((question, index) => {
    console.log(`\n📝 Test ${index + 1}: "${question}"`);
    
    try {
      // Analyser la question
      const analysis = analyzer.analyzeQuestion(question);
      console.log(`   ✅ Analyse: ${analysis.type} (confiance: ${analysis.confidence})`);
      
      // Traiter avec le chatbot
      const response = chatbot.processMessage(question, testAuditData);
      console.log(`   ✅ Réponse: ${response.success ? 'SUCCÈS' : 'ÉCHEC'}`);
      
      if (response.success) {
        console.log(`   📊 Type: ${response.response.type}`);
        if (response.response.data) {
          console.log(`   📈 Données: ${response.response.data.summary || 'Aucun résumé'}`);
        }
      } else {
        console.log(`   ❌ Erreur: ${response.error || 'Erreur inconnue'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
  });
  
  console.log('\n🎯 Test terminé');
}

// Exécuter le test
if (require.main === module) {
  testUserQuestions();
}

module.exports = { testUserQuestions, testAuditData, testQuestions };

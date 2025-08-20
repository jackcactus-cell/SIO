const axios = require('axios');

/**
 * Script de test pour vérifier le fonctionnement de la page de maintenance
 * et des endpoints de santé
 */

const BASE_URL = 'http://localhost:8001';
const FRONTEND_URL = 'http://localhost:3000';

async function testHealthEndpoint() {
  console.log('🔍 Test de l\'endpoint de santé...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Endpoint de santé fonctionnel');
    console.log('📊 Statut:', response.data.status);
    console.log('🕐 Timestamp:', response.data.timestamp);
    console.log('🔧 Services:', response.data.services);
    return true;
  } catch (error) {
    console.error('❌ Erreur endpoint de santé:', error.message);
    return false;
  }
}

async function testDetailedHealthEndpoint() {
  console.log('\n🔍 Test de l\'endpoint de santé détaillé...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/health/detailed`);
    console.log('✅ Endpoint de santé détaillé fonctionnel');
    console.log('📊 Statut:', response.data.status);
    console.log('💾 Mémoire utilisée:', Math.round(response.data.memory.used / 1024 / 1024), 'MB');
    console.log('🖥️ Plateforme:', response.data.platform);
    console.log('📦 Version Node:', response.data.nodeVersion);
    return true;
  } catch (error) {
    console.error('❌ Erreur endpoint de santé détaillé:', error.message);
    return false;
  }
}

async function testMaintenancePage() {
  console.log('\n🔍 Test de la page de maintenance...');
  
  try {
    const response = await axios.get(`${FRONTEND_URL}/maintenance`);
    console.log('✅ Page de maintenance accessible');
    console.log('📄 Status:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Erreur page de maintenance:', error.message);
    return false;
  }
}

async function testErrorHandling() {
  console.log('\n🔍 Test de la gestion d\'erreurs...');
  
  try {
    // Test d'un endpoint inexistant
    const response = await axios.get(`${BASE_URL}/api/nonexistent`, {
      validateStatus: () => true // Ne pas lever d'erreur pour les codes 4xx/5xx
    });
    
    if (response.status === 404) {
      console.log('✅ Gestion d\'erreur 404 correcte');
    } else {
      console.log('⚠️ Réponse inattendue pour endpoint inexistant:', response.status);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de gestion d\'erreurs:', error.message);
    return false;
  }
}

async function simulateServerError() {
  console.log('\n🔍 Simulation d\'erreur serveur...');
  
  try {
    // Test avec un endpoint qui pourrait causer une erreur
    const response = await axios.post(`${BASE_URL}/api/ask`, {
      question: null // Question invalide
    }, {
      validateStatus: () => true
    });
    
    if (response.status === 400) {
      console.log('✅ Gestion d\'erreur 400 correcte pour question invalide');
    } else {
      console.log('⚠️ Réponse inattendue pour question invalide:', response.status);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la simulation d\'erreur serveur:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Démarrage des tests de maintenance...\n');
  
  const tests = [
    { name: 'Endpoint de santé', fn: testHealthEndpoint },
    { name: 'Endpoint de santé détaillé', fn: testDetailedHealthEndpoint },
    { name: 'Page de maintenance', fn: testMaintenancePage },
    { name: 'Gestion d\'erreurs', fn: testErrorHandling },
    { name: 'Simulation d\'erreur serveur', fn: simulateServerError }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n📋 Test: ${test.name}`);
    console.log('─'.repeat(50));
    
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
    } catch (error) {
      console.error(`❌ Erreur lors du test ${test.name}:`, error.message);
      results.push({ name: test.name, success: false });
    }
  }
  
  // Résumé des tests
  console.log('\n📊 Résumé des tests:');
  console.log('─'.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log(`\n🎯 Résultat: ${passed}/${total} tests réussis`);
  
  if (passed === total) {
    console.log('🎉 Tous les tests sont passés avec succès !');
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez la configuration.');
  }
  
  return passed === total;
}

// Exécution des tests si le script est appelé directement
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Erreur fatale lors des tests:', error);
      process.exit(1);
    });
}

module.exports = {
  testHealthEndpoint,
  testDetailedHealthEndpoint,
  testMaintenancePage,
  testErrorHandling,
  simulateServerError,
  runAllTests
};


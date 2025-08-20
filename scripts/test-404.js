const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';

async function test404Page() {
  console.log('🔍 Test de la page 404...');
  
  try {
    const response = await axios.get(`${FRONTEND_URL}/page-inexistante`, {
      validateStatus: () => true
    });
    
    console.log('✅ Page 404 accessible');
    console.log('📄 Status:', response.status);
    
    const content = response.data;
    const checks = [
      { name: 'Titre "Oops!"', found: content.includes('Oops!') },
      { name: 'Numéro "404"', found: content.includes('404') },
      { name: 'Message français', found: content.includes('Vous essayez d\'accéder') },
      { name: 'Bouton "Revenir en lieu sûr"', found: content.includes('Revenir en lieu sûr') }
    ];
    
    checks.forEach(check => {
      const status = check.found ? '✅' : '❌';
      console.log(`${status} ${check.name}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

test404Page();

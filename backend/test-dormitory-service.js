require('dotenv').config();
const dormitoryService = require('./src/services/dormitoryService');

async function testDormitoryService() {
  console.log('🧪 Test du service d\'attribution automatique des dortoirs\n');
  
  // Test 1: Attribution normale
  console.log('Test 1: Attribution automatique');
  const result1 = await dormitoryService.assignDormitory(
    'test-inscription-id-123',
    'male'
  );
  console.log('Résultat:', result1);
  console.log('\n---\n');

  // Test 2: Tentative de double attribution
  console.log('Test 2: Tentative de double attribution');
  const result2 = await dormitoryService.assignDormitory(
    'test-inscription-id-123',
    'male'
  );
  console.log('Résultat:', result2);
  console.log('\n---\n');

  // Test 3: Attribution avec genre invalide
  console.log('Test 3: Genre non spécifié');
  const result3 = await dormitoryService.assignDormitory(
    'test-inscription-id-456',
    null
  );
  console.log('Résultat:', result3);
  console.log('\n---\n');

  console.log('✅ Tests terminés');
}

// Exécuter les tests
testDormitoryService().catch(console.error);

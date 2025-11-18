#!/usr/bin/env node

/**
 * Script de test rapide du système de paiement JOSPIA
 * Usage: node test-payment-flow.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';
let inscriptionId = '';
let paymentId = '';

// Données de test
const testUser = {
  email: `test${Date.now()}@jospia.test`,
  password: 'Test123456!',
  full_name: 'Test Paiement'
};

const testInscription = {
  first_name: 'Test',
  last_name: 'Paiement',
  age: 25,
  residence_location: 'Abidjan',
  contact_phone: '+2250102030405',
  gender: 'male',
  section: 'Lyma',
  health_condition: 'RAS',
  guardian_name: '',
  guardian_contact: ''
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function step(name, fn) {
  console.log(`\n📍 ${name}...`);
  try {
    await fn();
    console.log(`✅ ${name} - OK`);
  } catch (error) {
    console.error(`❌ ${name} - ERREUR:`, error.response?.data || error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 TEST DU FLUX DE PAIEMENT JOSPIA\n');
  console.log('='.repeat(50));

  // 1. Créer un compte
  await step('1. Création du compte utilisateur', async () => {
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    authToken = response.data.access_token;
    userId = response.data.user.id;
    console.log(`   User ID: ${userId}`);
  });

  // 2. Créer une inscription
  await step('2. Création de l\'inscription', async () => {
    const response = await axios.post(
      `${API_URL}/inscriptions`,
      testInscription,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    inscriptionId = response.data.data.id;
    console.log(`   Inscription ID: ${inscriptionId}`);
  });

  // 3. Initier un paiement
  await step('3. Initiation du paiement', async () => {
    const response = await axios.post(
      `${API_URL}/payments/initiate`,
      {
        inscription_id: inscriptionId,
        payment_method: 'orange'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    paymentId = response.data.data.id;
    console.log(`   Payment ID: ${paymentId}`);
    console.log(`   Référence: ${response.data.data.reference_code}`);
  });

  // 4. Simuler le paiement
  await step('4. Simulation du paiement réussi', async () => {
    const response = await axios.post(
      `${API_URL}/payments/${paymentId}/simulate`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`   Statut: ${response.data.data.status}`);
  });

  // 5. Vérifier l'affectation dortoir
  await sleep(1000); // Attendre 1 seconde
  await step('5. Vérification de l\'affectation dortoir', async () => {
    const response = await axios.get(
      `${API_URL}/dormitories/assignment/${inscriptionId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (response.data.data) {
      console.log(`   Dortoir: ${response.data.data.dormitories.name}`);
      console.log(`   Genre: ${response.data.data.dormitories.gender}`);
    } else {
      throw new Error('Aucun dortoir assigné');
    }
  });

  // 6. Vérifier le statut de l'inscription
  await step('6. Vérification du statut de l\'inscription', async () => {
    const response = await axios.get(
      `${API_URL}/inscriptions/${inscriptionId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    const status = response.data.data.status;
    console.log(`   Statut: ${status}`);
    
    if (status !== 'confirmed') {
      throw new Error(`Statut incorrect: ${status} (attendu: confirmed)`);
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log('🎉 TOUS LES TESTS RÉUSSIS !');
  console.log('\n📊 Résumé:');
  console.log(`   - User ID: ${userId}`);
  console.log(`   - Inscription ID: ${inscriptionId}`);
  console.log(`   - Payment ID: ${paymentId}`);
  console.log(`   - Email: ${testUser.email}`);
  console.log('\n✅ Le flux de paiement fonctionne correctement !');
  console.log('   Vous pouvez vérifier dans l\'interface admin.');
}

main().catch(error => {
  console.error('\n❌ ERREUR FATALE:', error.message);
  process.exit(1);
});

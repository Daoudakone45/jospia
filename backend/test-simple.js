/**
 * 🎯 Script Simple - Simuler Paiement et Télécharger PDF
 * 
 * Ce script fait tout automatiquement :
 * 1. Créer un compte
 * 2. Créer une inscription
 * 3. Simuler un paiement
 * 4. Télécharger le PDF du reçu
 * 
 * Usage : node test-simple.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

// Données de test (vous pouvez modifier)
const USER = {
  email: `test_${Date.now()}@example.com`,
  password: 'Test1234!',
  firstName: 'Jean',
  lastName: 'Dupont'
};

console.log('\n🎯 SIMULATION DE PAIEMENT ET TÉLÉCHARGEMENT PDF\n');
console.log('═══════════════════════════════════════════════\n');

let token = null;
let inscriptionId = null;
let paymentId = null;

// Étape 1 : Créer un compte
async function step1_CreateAccount() {
  console.log('📝 Étape 1 : Création du compte...');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      email: USER.email,
      password: USER.password,
      firstName: USER.firstName,
      lastName: USER.lastName
    });
    
    token = response.data.data.token;
    console.log('✅ Compte créé :', USER.email);
    console.log('');
    return true;
  } catch (error) {
    if (error.response?.data?.message?.includes('existe déjà')) {
      console.log('ℹ️  Compte existe déjà, connexion...');
      return step1b_Login();
    }
    console.error('❌ Erreur:', error.response?.data?.message || error.message);
    return false;
  }
}

async function step1b_Login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: USER.email,
      password: USER.password
    });
    token = response.data.data.token;
    console.log('✅ Connexion réussie\n');
    return true;
  } catch (error) {
    console.error('❌ Connexion échouée:', error.message);
    return false;
  }
}

// Étape 2 : Créer une inscription
async function step2_CreateInscription() {
  console.log('📋 Étape 2 : Création de l\'inscription...');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/inscriptions`,
      {
        first_name: 'Jean',
        last_name: 'Dupont',
        gender: 'male',
        date_of_birth: '2000-01-01',
        contact_phone: '0123456789',
        emergency_contact: '0987654321',
        section: 'Abobo',
        residence_location: 'Abidjan, Cocody',
        allergies: 'Aucune',
        dietary_restrictions: 'Aucune',
        medical_needs: 'Aucun',
        mobility_needs: 'Aucun'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    inscriptionId = response.data.data.id;
    console.log('✅ Inscription créée');
    console.log('   ID:', inscriptionId);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data?.message || error.message);
    return false;
  }
}

// Étape 3 : Simuler le paiement (PAS BESOIN D'API DE PAIEMENT !)
async function step3_SimulatePayment() {
  console.log('💳 Étape 3 : Simulation du paiement...');
  console.log('   (Pas besoin d\'API réelle, tout est simulé !)');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/payments`,
      {
        inscription_id: inscriptionId,
        amount: 5000,
        payment_method: 'orange_money'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    paymentId = response.data.data.id;
    console.log('✅ Paiement simulé avec succès !');
    console.log('   ID:', paymentId);
    console.log('   Montant: 5000 FCFA');
    console.log('   Statut:', response.data.data.status);
    console.log('   Méthode: Orange Money');
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data?.message || error.message);
    return false;
  }
}

// Étape 4 : Télécharger le PDF du reçu
async function step4_DownloadPDF() {
  console.log('📄 Étape 4 : Téléchargement du reçu PDF...');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/payments/${paymentId}/receipt`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer'
      }
    );
    
    const filename = `recu_jospia_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, filename);
    fs.writeFileSync(filepath, response.data);
    
    const fileSize = (fs.statSync(filepath).size / 1024).toFixed(2);
    
    console.log('✅ PDF téléchargé avec succès !');
    console.log('   Fichier:', filename);
    console.log('   Taille:', fileSize, 'KB');
    console.log('   Emplacement:', filepath);
    console.log('');
    console.log('🎉 SUCCÈS ! Ouvrez le PDF pour voir votre reçu.\n');
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data?.message || error.message);
    return false;
  }
}

// Exécution
async function run() {
  console.log('⏳ Vérification du serveur...\n');
  
  try {
    await axios.get('http://localhost:5000/health');
  } catch (error) {
    console.error('❌ Le serveur backend n\'est pas démarré !');
    console.log('\n💡 Démarrez-le avec : cd backend && node src/server.js\n');
    return;
  }
  
  const success1 = await step1_CreateAccount();
  if (!success1) return;
  
  const success2 = await step2_CreateInscription();
  if (!success2) return;
  
  const success3 = await step3_SimulatePayment();
  if (!success3) return;
  
  const success4 = await step4_DownloadPDF();
  
  if (success4) {
    console.log('═══════════════════════════════════════════════');
    console.log('✨ TOUT EST FAIT ! Vous avez votre PDF de reçu.');
    console.log('═══════════════════════════════════════════════\n');
  }
}

run().catch(err => {
  console.error('\n💥 Erreur fatale:', err.message);
});

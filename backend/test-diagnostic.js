/**
 * 🔍 Script de Diagnostic - Test Paiement Simple
 * 
 * Ce script teste directement la création d'un paiement simulé
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testPayment() {
  console.log('\n🔍 DIAGNOSTIC DU PAIEMENT\n');
  console.log('═══════════════════════════════════\n');

  // Utiliser vos vraies données
  const email = 'konedaouda4595@gmail.com';
  const password = ''; // ⚠️ METTEZ VOTRE VRAI MOT DE PASSE ICI
  const inscriptionId = '20a4d3ec-7dd0-4c2e-9753-a0a2fe00a15b';

  try {
    // Étape 1 : Login
    console.log('1️⃣ Connexion...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Connecté en tant que:', user.email);
    console.log('   User ID:', user.id);
    console.log('   Role:', user.role);
    console.log('');

    // Étape 2 : Vérifier l'inscription
    console.log('2️⃣ Vérification de l\'inscription...');
    const inscriptionResponse = await axios.get(
      `${BASE_URL}/inscriptions/${inscriptionId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const inscription = inscriptionResponse.data.data;
    console.log('✅ Inscription trouvée:');
    console.log('   ID:', inscription.id);
    console.log('   Nom:', inscription.first_name, inscription.last_name);
    console.log('   User ID:', inscription.user_id);
    console.log('   Statut:', inscription.status);
    console.log('');

    // Vérifier si user_id correspond
    if (inscription.user_id !== user.id) {
      console.error('❌ PROBLÈME DÉTECTÉ !');
      console.error('   L\'inscription n\'appartient pas à cet utilisateur');
      console.error('   Inscription user_id:', inscription.user_id);
      console.error('   Votre user_id:', user.id);
      console.error('');
      console.error('💡 Solution: Créez une nouvelle inscription avec ce compte');
      return;
    }

    // Étape 3 : Créer le paiement
    console.log('3️⃣ Création du paiement simulé...');
    const paymentResponse = await axios.post(
      `${BASE_URL}/payments/create-simple`,
      {
        inscription_id: inscriptionId,
        payment_method: 'orange_money'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const payment = paymentResponse.data.data;
    console.log('✅ Paiement créé avec succès !');
    console.log('   Payment ID:', payment.id);
    console.log('   Montant:', payment.amount, 'FCFA');
    console.log('   Statut:', payment.status);
    console.log('   Référence:', payment.reference_code);
    console.log('');

    // Étape 4 : Télécharger le reçu
    console.log('4️⃣ Téléchargement du reçu PDF...');
    const receiptResponse = await axios.get(
      `${BASE_URL}/payments/${payment.id}/receipt`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer'
      }
    );

    const fs = require('fs');
    const path = require('path');
    const filename = `recu_test_${Date.now()}.pdf`;
    fs.writeFileSync(path.join(__dirname, filename), receiptResponse.data);
    
    console.log('✅ PDF téléchargé !');
    console.log('   Fichier:', filename);
    console.log('   Taille:', (receiptResponse.data.length / 1024).toFixed(2), 'KB');
    console.log('');

    console.log('═══════════════════════════════════');
    console.log('🎉 TOUT FONCTIONNE PARFAITEMENT !');
    console.log('═══════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERREUR DÉTECTÉE\n');
    console.error('═══════════════════════════════════');
    
    if (error.response) {
      console.error('Statut:', error.response.status);
      console.error('Message:', error.response.data?.message || error.response.statusText);
      console.error('Données:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erreur:', error.message);
    }
    
    console.error('═══════════════════════════════════\n');

    // Suggestions
    console.log('💡 SUGGESTIONS DE CORRECTION:\n');
    
    if (error.response?.status === 404) {
      console.log('1. Vérifiez que l\'ID d\'inscription est correct');
      console.log('2. Vérifiez que l\'inscription existe dans la base de données');
    } else if (error.response?.status === 403) {
      console.log('1. L\'inscription n\'appartient pas à cet utilisateur');
      console.log('2. Créez une nouvelle inscription avec ce compte');
    } else if (error.response?.status === 400) {
      console.log('1. Vérifiez les paramètres envoyés (inscription_id, payment_method)');
      console.log('2. payment_method doit être: orange_money, mtn_money, moov_money, ou wave');
    } else if (error.response?.status === 401) {
      console.log('1. Token d\'authentification invalide ou expiré');
      console.log('2. Reconnectez-vous');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('1. Le serveur backend n\'est pas démarré');
      console.log('2. Lancez: cd backend && node src/server.js');
    }
    console.log('');
  }
}

testPayment();

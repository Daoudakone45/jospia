/**
 * Script pour créer un paiement pour une inscription et simuler son succès
 * Usage: node create-and-pay.js
 */

require('dotenv').config();
const supabase = require('./src/config/supabase');
const dormitoryService = require('./src/services/dormitoryService');
const { v4: uuidv4 } = require('uuid');

async function createAndPayInscription() {
  console.log('💰 === CRÉATION ET SIMULATION DE PAIEMENT ===\n');

  try {
    // 1. Trouver une inscription sans paiement
    console.log('🔍 Recherche d\'inscriptions sans paiement...');
    
    const { data: inscriptions, error: inscError } = await supabase
      .from('inscriptions')
      .select('id, first_name, last_name, gender, status, ticket_price')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (inscError) {
      console.error('❌ Erreur:', inscError.message);
      return;
    }

    if (!inscriptions || inscriptions.length === 0) {
      console.log('❌ Aucune inscription trouvée');
      return;
    }

    // Vérifier quelles inscriptions n'ont pas de paiement
    const inscriptionsWithoutPayment = [];
    for (const ins of inscriptions) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('inscription_id', ins.id)
        .single();
      
      if (!existingPayment) {
        inscriptionsWithoutPayment.push(ins);
      }
    }

    if (inscriptionsWithoutPayment.length === 0) {
      console.log('❌ Toutes les inscriptions ont déjà un paiement');
      console.log('   Relancez `node simulate-payment.js` pour simuler un paiement existant\n');
      return;
    }

    console.log(`\n✅ ${inscriptionsWithoutPayment.length} inscription(s) sans paiement:\n`);
    inscriptionsWithoutPayment.forEach((ins, i) => {
      console.log(`  ${i + 1}. ${ins.first_name} ${ins.last_name}`);
      console.log(`     ID: ${ins.id}`);
      console.log(`     Genre: ${ins.gender === 'male' ? 'Homme' : 'Femme'}`);
      console.log(`     Prix: ${ins.ticket_price} FCFA\n`);
    });

    // Sélectionner la première inscription
    const inscription = inscriptionsWithoutPayment[0];
    console.log(`🎯 Traitement de: ${inscription.first_name} ${inscription.last_name}\n`);

    // 2. Créer le paiement
    console.log('💳 Création du paiement...');
    const paymentData = {
      id: uuidv4(),
      inscription_id: inscription.id,
      amount: inscription.ticket_price || 5000,
      status: 'pending',
      payment_method: 'orange_money',
      reference_code: `TEST-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: payment, error: payError } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (payError) {
      console.error('❌ Erreur création paiement:', payError.message);
      return;
    }

    console.log('✅ Paiement créé:', payment.id.substring(0, 8) + '...');
    console.log('   Statut: pending\n');

    // 3. Simuler le paiement réussi
    console.log('✨ Simulation du paiement réussi...');
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: 'success',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('❌ Erreur mise à jour:', updateError.message);
      return;
    }

    console.log('✅ Paiement marqué comme réussi\n');

    // 4. Mettre à jour le statut de l'inscription
    await supabase
      .from('inscriptions')
      .update({ status: 'confirmed' })
      .eq('id', inscription.id);

    // 5. Attribution automatique du dortoir
    console.log('🏠 Attribution automatique du dortoir...\n');
    const assignmentResult = await dormitoryService.assignDormitory(
      inscription.id,
      inscription.gender
    );

    // 6. Afficher le résultat
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSULTAT FINAL');
    console.log('='.repeat(60) + '\n');

    if (assignmentResult.success) {
      console.log('🎉 ✅ SUCCÈS COMPLET !');
      console.log(`   Participant: ${inscription.first_name} ${inscription.last_name}`);
      console.log(`   Paiement: ${payment.amount} FCFA - Réussi ✓`);
      console.log(`   Dortoir: ${assignmentResult.dormitory.name}`);
      console.log(`   Genre: ${assignmentResult.dormitory.gender === 'male' ? 'Homme' : 'Femme'}`);
      console.log(`   Places restantes: ${assignmentResult.dormitory.available_slots}`);

      // Vérifier l'affectation
      const { data: assignment } = await supabase
        .from('dormitory_assignments')
        .select('id, assigned_at')
        .eq('inscription_id', inscription.id)
        .single();

      if (assignment) {
        console.log(`   Date attribution: ${new Date(assignment.assigned_at).toLocaleString('fr-FR')}`);
      }
    } else {
      console.log('⚠️ Paiement réussi mais attribution du dortoir a échoué');
      console.log(`   Raison: ${assignmentResult.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Vérifiez maintenant:');
    console.log('   - Dashboard participant: Affiche le dortoir assigné');
    console.log('   - Admin /admin/assignments: Liste l\'affectation');
    console.log('   - Admin /admin/payments: Paiement marqué comme réussi\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error);
  }
}

// Exécuter
createAndPayInscription()
  .then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

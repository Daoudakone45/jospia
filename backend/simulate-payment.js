/**
 * Script simple pour simuler un paiement réussi
 * Usage: node backend/simulate-payment.js
 */

require('dotenv').config();
const supabase = require('./src/config/supabase');
const dormitoryService = require('./src/services/dormitoryService');

async function simulatePayment() {
  console.log('💰 === SIMULATION DE PAIEMENT ===\n');

  try {
    // 1. Chercher les paiements en attente
    console.log('🔍 Recherche des paiements en attente...');
    const { data: pendingPayments, error: payError } = await supabase
      .from('payments')
      .select(`
        id,
        inscription_id,
        amount,
        status,
        inscriptions (
          id,
          first_name,
          last_name,
          gender
        )
      `)
      .in('status', ['pending', 'initiated'])
      .order('created_at', { ascending: false })
      .limit(5);

    if (payError) {
      console.error('❌ Erreur:', payError.message);
      return;
    }

    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('❌ Aucun paiement en attente trouvé.');
      console.log('\n💡 Pour tester:');
      console.log('   1. Créez une inscription sur le site');
      console.log('   2. Le paiement sera créé automatiquement');
      console.log('   3. Relancez ce script\n');
      return;
    }

    console.log(`\n✅ ${pendingPayments.length} paiement(s) en attente:\n`);
    pendingPayments.forEach((p, i) => {
      console.log(`  ${i + 1}. ID: ${p.id.substring(0, 8)}...`);
      console.log(`     Participant: ${p.inscriptions.first_name} ${p.inscriptions.last_name}`);
      console.log(`     Genre: ${p.inscriptions.gender === 'male' ? 'Homme' : 'Femme'}`);
      console.log(`     Montant: ${p.amount} FCFA`);
      console.log(`     Statut: ${p.status}\n`);
    });

    // Sélectionner le premier paiement
    const payment = pendingPayments[0];
    console.log(`🎯 Simulation du paiement pour: ${payment.inscriptions.first_name} ${payment.inscriptions.last_name}\n`);

    // 2. Marquer comme payé
    console.log('💳 Mise à jour du statut à "success"...');
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

    // 3. Attribution automatique du dortoir
    console.log('🏠 Attribution automatique du dortoir...\n');
    const assignmentResult = await dormitoryService.assignDormitory(
      payment.inscription_id,
      payment.inscriptions.gender
    );

    // 4. Afficher le résultat
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSULTAT FINAL');
    console.log('='.repeat(60) + '\n');

    if (assignmentResult.success) {
      console.log('🎉 ✅ SUCCÈS - Attribution réussie !');
      console.log(`   Participant: ${payment.inscriptions.first_name} ${payment.inscriptions.last_name}`);
      console.log(`   Dortoir: ${assignmentResult.dormitory.name}`);
      console.log(`   Genre: ${assignmentResult.dormitory.gender === 'male' ? 'Homme' : 'Femme'}`);
      console.log(`   Places restantes: ${assignmentResult.dormitory.available_slots}`);
      
      // Vérifier dans la base
      const { data: assignment } = await supabase
        .from('dormitory_assignments')
        .select('id, assigned_at')
        .eq('inscription_id', payment.inscription_id)
        .single();

      if (assignment) {
        console.log(`   Date d'attribution: ${new Date(assignment.assigned_at).toLocaleString('fr-FR')}`);
        console.log(`   ID affectation: ${assignment.id.substring(0, 8)}...`);
      }
    } else {
      console.log('❌ ÉCHEC - Attribution non réussie');
      console.log(`   Raison: ${assignmentResult.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Vérifiez maintenant:');
    console.log('   - Frontend participant: Dashboard affiche le dortoir');
    console.log('   - Frontend admin: /admin/assignments liste l\'affectation\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error);
  }
}

// Exécuter
simulatePayment()
  .then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

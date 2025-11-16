/**
 * Script pour vérifier l'état des inscriptions et paiements
 */

require('dotenv').config();
const supabase = require('./src/config/supabase');

async function checkStatus() {
  console.log('🔍 === VÉRIFICATION DES INSCRIPTIONS ET PAIEMENTS ===\n');

  try {
    // 1. Vérifier les inscriptions récentes
    console.log('📝 Inscriptions récentes:');
    const { data: inscriptions, error: inscError } = await supabase
      .from('inscriptions')
      .select('id, first_name, last_name, gender, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (inscError) {
      console.error('❌ Erreur inscriptions:', inscError.message);
      return;
    }

    if (!inscriptions || inscriptions.length === 0) {
      console.log('❌ Aucune inscription trouvée\n');
      return;
    }

    console.log(`✅ ${inscriptions.length} inscription(s) trouvée(s):\n`);
    inscriptions.forEach((ins, i) => {
      console.log(`  ${i + 1}. ID: ${ins.id}`);
      console.log(`     Nom: ${ins.first_name} ${ins.last_name}`);
      console.log(`     Genre: ${ins.gender}`);
      console.log(`     Statut: ${ins.status}`);
      console.log(`     Date: ${new Date(ins.created_at).toLocaleString('fr-FR')}\n`);
    });

    // 2. Vérifier tous les paiements
    console.log('💳 Tous les paiements:');
    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select(`
        id,
        inscription_id,
        amount,
        status,
        payment_method,
        created_at,
        inscriptions (
          first_name,
          last_name,
          gender
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (payError) {
      console.error('❌ Erreur paiements:', payError.message);
      return;
    }

    if (!payments || payments.length === 0) {
      console.log('❌ Aucun paiement trouvé');
      console.log('\n⚠️ PROBLÈME: Les paiements ne sont pas créés automatiquement !');
      console.log('   Vérifiez que vous arrivez bien sur la page de paiement après inscription.\n');
      return;
    }

    console.log(`✅ ${payments.length} paiement(s) trouvé(s):\n`);
    payments.forEach((pay, i) => {
      console.log(`  ${i + 1}. ID: ${pay.id.substring(0, 8)}...`);
      console.log(`     Inscription: ${pay.inscriptions?.first_name} ${pay.inscriptions?.last_name}`);
      console.log(`     Genre: ${pay.inscriptions?.gender}`);
      console.log(`     Montant: ${pay.amount} FCFA`);
      console.log(`     Méthode: ${pay.payment_method || 'Non défini'}`);
      console.log(`     Statut: ${pay.status} ${pay.status === 'pending' ? '⏳' : pay.status === 'success' ? '✅' : '❌'}`);
      console.log(`     Date: ${new Date(pay.created_at).toLocaleString('fr-FR')}\n`);
    });

    // 3. Vérifier les affectations de dortoirs
    console.log('🏠 Affectations de dortoirs:');
    const { data: assignments, error: assignError } = await supabase
      .from('dormitory_assignments')
      .select(`
        id,
        inscription_id,
        assigned_at,
        dormitories (name, gender),
        inscriptions (first_name, last_name)
      `)
      .order('assigned_at', { ascending: false })
      .limit(5);

    if (assignError) {
      console.error('❌ Erreur affectations:', assignError.message);
      return;
    }

    if (!assignments || assignments.length === 0) {
      console.log('❌ Aucune affectation trouvée\n');
    } else {
      console.log(`✅ ${assignments.length} affectation(s) trouvée(s):\n`);
      assignments.forEach((asg, i) => {
        console.log(`  ${i + 1}. ${asg.inscriptions.first_name} ${asg.inscriptions.last_name}`);
        console.log(`     Dortoir: ${asg.dormitories.name} (${asg.dormitories.gender})`);
        console.log(`     Date: ${new Date(asg.assigned_at).toLocaleString('fr-FR')}\n`);
      });
    }

    // 4. Résumé
    console.log('='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    
    const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'initiated');
    const successPayments = payments.filter(p => p.status === 'success');
    
    console.log(`✅ Total inscriptions: ${inscriptions.length}`);
    console.log(`💳 Total paiements: ${payments.length}`);
    console.log(`   - En attente: ${pendingPayments.length}`);
    console.log(`   - Réussis: ${successPayments.length}`);
    console.log(`🏠 Total affectations: ${assignments?.length || 0}`);
    console.log('='.repeat(60) + '\n');

    if (pendingPayments.length > 0) {
      console.log('💡 Action suivante: Lancez `node simulate-payment.js` pour simuler un paiement\n');
    }

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error);
  }
}

checkStatus()
  .then(() => {
    console.log('✅ Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

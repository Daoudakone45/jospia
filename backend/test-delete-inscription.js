/**
 * Script de test pour vérifier la libération automatique des dortoirs
 * Usage: node test-delete-inscription.js
 */

require('dotenv').config();
const supabase = require('./src/config/supabase');

async function testDormitoryFreeOnDelete() {
  console.log('🧪 TEST: Libération automatique des dortoirs lors de la suppression\n');
  console.log('='.repeat(70));

  try {
    // 1. Vérifier les dortoirs avant
    console.log('\n📊 ÉTAT INITIAL');
    const { data: dormitoriesBefore } = await supabase
      .from('dormitories')
      .select('*')
      .order('name');

    console.log('\nDortoirs disponibles:');
    dormitoriesBefore?.forEach(d => {
      console.log(`  - ${d.name} (${d.gender}): ${d.available_slots}/${d.total_capacity} places disponibles`);
    });

    // 2. Compter les inscriptions et assignations
    const { count: inscriptionCount } = await supabase
      .from('inscriptions')
      .select('*', { count: 'exact', head: true });

    const { count: assignmentCount } = await supabase
      .from('dormitory_assignments')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📋 Total inscriptions: ${inscriptionCount}`);
    console.log(`🏠 Total assignations: ${assignmentCount}`);

    // 3. Trouver une inscription avec assignation
    const { data: inscriptionsWithDorm } = await supabase
      .from('dormitory_assignments')
      .select(`
        id,
        inscription_id,
        dormitory_id,
        inscriptions (
          id,
          first_name,
          last_name,
          status
        ),
        dormitories (
          id,
          name,
          available_slots,
          total_capacity
        )
      `)
      .limit(1);

    if (!inscriptionsWithDorm || inscriptionsWithDorm.length === 0) {
      console.log('\n⚠️  Aucune inscription avec dortoir assigné trouvée.');
      console.log('💡 Créez d\'abord une inscription et effectuez un paiement.');
      return;
    }

    const testAssignment = inscriptionsWithDorm[0];
    const testInscription = testAssignment.inscriptions;
    const testDormitory = testAssignment.dormitories;

    console.log('\n🎯 INSCRIPTION DE TEST TROUVÉE');
    console.log(`   ID: ${testInscription.id}`);
    console.log(`   Participant: ${testInscription.first_name} ${testInscription.last_name}`);
    console.log(`   Statut: ${testInscription.status}`);
    console.log(`   Dortoir: ${testDormitory.name}`);
    console.log(`   Places disponibles AVANT: ${testDormitory.available_slots}/${testDormitory.total_capacity}`);

    // 4. Demander confirmation
    console.log('\n⚠️  ATTENTION: Cette inscription va être supprimée pour le test.');
    console.log('   Appuyez sur Ctrl+C pour annuler, ou attendez 3 secondes...\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Supprimer l'inscription
    console.log('🗑️  SUPPRESSION EN COURS...\n');

    const { error: deleteError } = await supabase
      .from('inscriptions')
      .delete()
      .eq('id', testInscription.id);

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression:', deleteError.message);
      return;
    }

    console.log('✅ Inscription supprimée\n');

    // 6. Attendre un peu pour la propagation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 7. Vérifier l'état après
    console.log('📊 ÉTAT APRÈS SUPPRESSION');

    const { data: dormitoryAfter } = await supabase
      .from('dormitories')
      .select('*')
      .eq('id', testDormitory.id)
      .single();

    console.log(`\nDortoir: ${dormitoryAfter.name}`);
    console.log(`   Places disponibles AVANT: ${testDormitory.available_slots}/${testDormitory.total_capacity}`);
    console.log(`   Places disponibles APRÈS: ${dormitoryAfter.available_slots}/${dormitoryAfter.total_capacity}`);

    const difference = dormitoryAfter.available_slots - testDormitory.available_slots;
    
    if (difference === 1) {
      console.log(`\n✅ TEST RÉUSSI! +${difference} place libérée`);
    } else if (difference === 0) {
      console.log('\n❌ TEST ÉCHOUÉ! Aucune place libérée');
      console.log('💡 Assurez-vous que:');
      console.log('   1. Le trigger SQL a été exécuté (FIX-DORMITORY-ON-DELETE.sql)');
      console.log('   2. Le backend a été redémarré');
    } else {
      console.log(`\n⚠️  RÉSULTAT INATTENDU: ${difference > 0 ? '+' : ''}${difference} places`);
    }

    // 8. Vérifier que l'assignation a été supprimée
    const { data: assignmentCheck } = await supabase
      .from('dormitory_assignments')
      .select('id')
      .eq('id', testAssignment.id)
      .single();

    if (!assignmentCheck) {
      console.log('✅ Assignation de dortoir supprimée (CASCADE)');
    }

    // 9. Afficher le récapitulatif final
    console.log('\n📊 RÉCAPITULATIF FINAL');
    
    const { data: dormitoriesAfter } = await supabase
      .from('dormitories')
      .select('*')
      .order('name');

    console.log('\nDortoirs disponibles:');
    dormitoriesAfter?.forEach(d => {
      const before = dormitoriesBefore?.find(db => db.id === d.id);
      const diff = d.available_slots - (before?.available_slots || 0);
      const indicator = diff > 0 ? '⬆️ ' : diff < 0 ? '⬇️ ' : '';
      
      console.log(`  ${indicator}${d.name} (${d.gender}): ${d.available_slots}/${d.total_capacity} places ${diff !== 0 ? `(${diff > 0 ? '+' : ''}${diff})` : ''}`);
    });

    const { count: inscriptionCountAfter } = await supabase
      .from('inscriptions')
      .select('*', { count: 'exact', head: true });

    const { count: assignmentCountAfter } = await supabase
      .from('dormitory_assignments')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📋 Inscriptions: ${inscriptionCount} → ${inscriptionCountAfter} (${inscriptionCountAfter - inscriptionCount})`);
    console.log(`🏠 Assignations: ${assignmentCount} → ${assignmentCountAfter} (${assignmentCountAfter - assignmentCount})`);

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Test terminé\n');
}

// Exécuter le test
testDormitoryFreeOnDelete()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });

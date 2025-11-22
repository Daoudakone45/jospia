/**
 * Script pour recalculer et corriger l'occupation des dortoirs
 * Usage: node fix-dormitory-slots.js
 */

require('dotenv').config();
const supabase = require('./src/config/supabase');

async function fixDormitorySlots() {
  console.log('🔧 CORRECTION DE L\'OCCUPATION DES DORTOIRS\n');
  console.log('='.repeat(70));

  try {
    // 1. Récupérer tous les dortoirs
    const { data: dormitories, error: dormError } = await supabase
      .from('dormitories')
      .select('*')
      .order('name');

    if (dormError) {
      console.error('❌ Erreur récupération dortoirs:', dormError.message);
      return;
    }

    console.log('\n📊 ÉTAT ACTUEL DES DORTOIRS');
    console.log('-'.repeat(70));
    dormitories.forEach(d => {
      const occupied = d.total_capacity - d.available_slots;
      console.log(`${d.name} (${d.gender}): ${occupied}/${d.total_capacity} occupées, ${d.available_slots} disponibles`);
    });

    // 2. Compter les assignations réelles
    console.log('\n🔍 VÉRIFICATION DES ASSIGNATIONS RÉELLES');
    console.log('-'.repeat(70));

    for (const dormitory of dormitories) {
      const { count: realAssignments, error: countError } = await supabase
        .from('dormitory_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('dormitory_id', dormitory.id);

      if (countError) {
        console.error(`❌ Erreur comptage ${dormitory.name}:`, countError.message);
        continue;
      }

      const currentOccupied = dormitory.total_capacity - dormitory.available_slots;
      const shouldBeAvailable = dormitory.total_capacity - realAssignments;

      console.log(`\n${dormitory.name}:`);
      console.log(`  Capacité totale: ${dormitory.total_capacity}`);
      console.log(`  Assignations réelles: ${realAssignments}`);
      console.log(`  Places disponibles (DB): ${dormitory.available_slots}`);
      console.log(`  Places disponibles (réel): ${shouldBeAvailable}`);

      if (dormitory.available_slots !== shouldBeAvailable) {
        console.log(`  ⚠️  INCOHÉRENCE DÉTECTÉE! Différence: ${shouldBeAvailable - dormitory.available_slots}`);
        
        // Corriger
        const { error: updateError } = await supabase
          .from('dormitories')
          .update({ available_slots: shouldBeAvailable })
          .eq('id', dormitory.id);

        if (updateError) {
          console.log(`  ❌ Erreur correction:`, updateError.message);
        } else {
          console.log(`  ✅ CORRIGÉ: ${dormitory.available_slots} → ${shouldBeAvailable}`);
        }
      } else {
        console.log(`  ✅ OK - Cohérent`);
      }
    }

    // 3. Afficher l'état après correction
    console.log('\n📊 ÉTAT APRÈS CORRECTION');
    console.log('-'.repeat(70));

    const { data: dormitoriesAfter } = await supabase
      .from('dormitories')
      .select('*')
      .order('name');

    dormitoriesAfter.forEach(d => {
      const occupied = d.total_capacity - d.available_slots;
      console.log(`${d.name} (${d.gender}): ${occupied}/${d.total_capacity} occupées, ${d.available_slots} disponibles`);
    });

    // 4. Vérification finale
    console.log('\n🔍 VÉRIFICATION FINALE');
    console.log('-'.repeat(70));

    const { count: totalAssignments } = await supabase
      .from('dormitory_assignments')
      .select('*', { count: 'exact', head: true });

    const totalOccupied = dormitoriesAfter.reduce((sum, d) => sum + (d.total_capacity - d.available_slots), 0);
    const totalAvailable = dormitoriesAfter.reduce((sum, d) => sum + d.available_slots, 0);
    const totalCapacity = dormitoriesAfter.reduce((sum, d) => sum + d.total_capacity, 0);

    console.log(`\nAssignations réelles: ${totalAssignments}`);
    console.log(`Places occupées (DB): ${totalOccupied}`);
    console.log(`Places disponibles: ${totalAvailable}`);
    console.log(`Capacité totale: ${totalCapacity}`);

    if (totalAssignments === totalOccupied) {
      console.log('\n✅ SUCCÈS! Les données sont maintenant cohérentes.');
    } else {
      console.log('\n⚠️  Il reste une incohérence:');
      console.log(`   Assignations: ${totalAssignments}`);
      console.log(`   Places occupées: ${totalOccupied}`);
      console.log(`   Différence: ${totalOccupied - totalAssignments}`);
    }

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Script terminé\n');
}

// Exécuter
fixDormitorySlots()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });

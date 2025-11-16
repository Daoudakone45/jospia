const supabase = require('../config/supabase');

/**
 * Attribuer automatiquement un dortoir à un participant après paiement
 * @param {string} inscriptionId - ID de l'inscription
 * @param {string} gender - Genre du participant ('male' ou 'female')
 * @returns {Object} { success, dormitory, assignment, message }
 */
const assignDormitory = async (inscriptionId, gender) => {
  try {
    console.log(`🏠 Attribution automatique de dortoir pour inscription ${inscriptionId}, genre: ${gender}`);

    // 1. Vérifier que l'inscription existe
    const { data: inscription, error: inscriptionError } = await supabase
      .from('inscriptions')
      .select('id, user_id, first_name, last_name, gender')
      .eq('id', inscriptionId)
      .single();

    if (inscriptionError || !inscription) {
      console.error('❌ Inscription non trouvée:', inscriptionError?.message);
      return {
        success: false,
        message: 'Inscription non trouvée'
      };
    }

    // Utiliser le genre de l'inscription si fourni, sinon celui passé en paramètre
    const participantGender = inscription.gender || gender;

    if (!participantGender) {
      console.error('❌ Genre du participant non spécifié');
      return {
        success: false,
        message: 'Genre du participant non spécifié'
      };
    }

    console.log(`👤 Participant: ${inscription.first_name} ${inscription.last_name}, Genre: ${participantGender}`);

    // 2. Vérifier si déjà assigné
    const { data: existingAssignment } = await supabase
      .from('dormitory_assignments')
      .select('id, dormitory_id, dormitories(name)')
      .eq('inscription_id', inscriptionId)
      .single();

    if (existingAssignment) {
      console.log('⚠️  Participant déjà assigné au dortoir:', existingAssignment.dormitories?.name);
      return {
        success: true,
        alreadyAssigned: true,
        assignment: existingAssignment,
        message: 'Participant déjà assigné à un dortoir'
      };
    }

    // 3. Trouver les dortoirs disponibles pour ce genre
    const { data: availableDormitories, error: dormsError } = await supabase
      .from('dormitories')
      .select('id, name, gender, total_capacity, available_slots')
      .eq('gender', participantGender)
      .gt('available_slots', 0)
      .order('available_slots', { ascending: false }); // Remplir les dortoirs les plus pleins en premier

    if (dormsError) {
      console.error('❌ Erreur récupération dortoirs:', dormsError.message);
      return {
        success: false,
        message: 'Erreur lors de la recherche de dortoirs disponibles'
      };
    }

    if (!availableDormitories || availableDormitories.length === 0) {
      console.error('❌ Aucun dortoir disponible pour le genre:', participantGender);
      return {
        success: false,
        message: `Aucun dortoir disponible pour les ${participantGender === 'male' ? 'hommes' : 'femmes'}`
      };
    }

    // 4. Sélectionner le dortoir avec le plus de places occupées (pour optimiser le remplissage)
    const selectedDormitory = availableDormitories[0];
    console.log(`✅ Dortoir sélectionné: ${selectedDormitory.name} (${selectedDormitory.available_slots} places disponibles)`);

    // 5. Créer l'assignment dans une transaction
    const { data: assignment, error: assignmentError } = await supabase
      .from('dormitory_assignments')
      .insert([{
        inscription_id: inscriptionId,
        dormitory_id: selectedDormitory.id
      }])
      .select('*, dormitories(id, name, gender)')
      .single();

    if (assignmentError) {
      console.error('❌ Erreur création assignment:', assignmentError.message);
      return {
        success: false,
        message: 'Erreur lors de l\'attribution du dortoir'
      };
    }

    // 6. Décrémenter available_slots
    const { error: updateError } = await supabase
      .from('dormitories')
      .update({ 
        available_slots: selectedDormitory.available_slots - 1 
      })
      .eq('id', selectedDormitory.id);

    if (updateError) {
      console.error('❌ Erreur mise à jour available_slots:', updateError.message);
      
      // Rollback : supprimer l'assignment créé
      await supabase
        .from('dormitory_assignments')
        .delete()
        .eq('id', assignment.id);

      return {
        success: false,
        message: 'Erreur lors de la mise à jour de la capacité du dortoir'
      };
    }

    console.log('✅ Attribution réussie:', {
      participant: `${inscription.first_name} ${inscription.last_name}`,
      dortoir: selectedDormitory.name,
      places_restantes: selectedDormitory.available_slots - 1
    });

    return {
      success: true,
      dormitory: selectedDormitory,
      assignment: assignment,
      message: `Dortoir ${selectedDormitory.name} attribué avec succès`
    };

  } catch (error) {
    console.error('❌ Erreur attribution dortoir:', error.message);
    return {
      success: false,
      message: 'Erreur système lors de l\'attribution du dortoir'
    };
  }
};

/**
 * Libérer un dortoir (en cas d'annulation ou de réassignation)
 * @param {string} assignmentId - ID de l'assignment à supprimer
 * @returns {Object} { success, message }
 */
const unassignDormitory = async (assignmentId) => {
  try {
    console.log(`🔄 Libération du dortoir pour assignment ${assignmentId}`);

    // 1. Récupérer l'assignment
    const { data: assignment, error: fetchError } = await supabase
      .from('dormitory_assignments')
      .select('id, dormitory_id, inscription_id')
      .eq('id', assignmentId)
      .single();

    if (fetchError || !assignment) {
      console.error('❌ Assignment non trouvé:', fetchError?.message);
      return {
        success: false,
        message: 'Assignment non trouvé'
      };
    }

    // 2. Supprimer l'assignment
    const { error: deleteError } = await supabase
      .from('dormitory_assignments')
      .delete()
      .eq('id', assignmentId);

    if (deleteError) {
      console.error('❌ Erreur suppression assignment:', deleteError.message);
      return {
        success: false,
        message: 'Erreur lors de la suppression de l\'assignment'
      };
    }

    // 3. Incrémenter available_slots
    const { data: dormitory } = await supabase
      .from('dormitories')
      .select('available_slots')
      .eq('id', assignment.dormitory_id)
      .single();

    if (dormitory) {
      await supabase
        .from('dormitories')
        .update({ 
          available_slots: dormitory.available_slots + 1 
        })
        .eq('id', assignment.dormitory_id);
    }

    console.log('✅ Dortoir libéré avec succès');

    return {
      success: true,
      message: 'Dortoir libéré avec succès'
    };

  } catch (error) {
    console.error('❌ Erreur libération dortoir:', error.message);
    return {
      success: false,
      message: 'Erreur système lors de la libération du dortoir'
    };
  }
};

/**
 * Réassigner un participant à un autre dortoir
 * @param {string} inscriptionId - ID de l'inscription
 * @param {string} newDormitoryId - ID du nouveau dortoir
 * @returns {Object} { success, assignment, message }
 */
const reassignDormitory = async (inscriptionId, newDormitoryId) => {
  try {
    console.log(`🔄 Réassignation pour inscription ${inscriptionId} vers dortoir ${newDormitoryId}`);

    // 1. Récupérer l'assignment actuel
    const { data: currentAssignment } = await supabase
      .from('dormitory_assignments')
      .select('id, dormitory_id')
      .eq('inscription_id', inscriptionId)
      .single();

    if (!currentAssignment) {
      console.error('❌ Aucun assignment existant');
      return {
        success: false,
        message: 'Aucun dortoir attribué actuellement'
      };
    }

    // 2. Vérifier la disponibilité du nouveau dortoir
    const { data: newDormitory, error: dormError } = await supabase
      .from('dormitories')
      .select('id, name, available_slots')
      .eq('id', newDormitoryId)
      .single();

    if (dormError || !newDormitory) {
      console.error('❌ Nouveau dortoir non trouvé:', dormError?.message);
      return {
        success: false,
        message: 'Dortoir cible non trouvé'
      };
    }

    if (newDormitory.available_slots <= 0) {
      console.error('❌ Nouveau dortoir plein');
      return {
        success: false,
        message: 'Le dortoir cible est complet'
      };
    }

    // 3. Mettre à jour l'assignment
    const { data: updatedAssignment, error: updateError } = await supabase
      .from('dormitory_assignments')
      .update({ dormitory_id: newDormitoryId })
      .eq('id', currentAssignment.id)
      .select('*, dormitories(name)')
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour assignment:', updateError.message);
      return {
        success: false,
        message: 'Erreur lors de la réassignation'
      };
    }

    // 4. Libérer l'ancien dortoir
    const { data: oldDormitory } = await supabase
      .from('dormitories')
      .select('available_slots')
      .eq('id', currentAssignment.dormitory_id)
      .single();

    if (oldDormitory) {
      await supabase
        .from('dormitories')
        .update({ available_slots: oldDormitory.available_slots + 1 })
        .eq('id', currentAssignment.dormitory_id);
    }

    // 5. Occuper le nouveau dortoir
    await supabase
      .from('dormitories')
      .update({ available_slots: newDormitory.available_slots - 1 })
      .eq('id', newDormitoryId);

    console.log('✅ Réassignation réussie vers:', newDormitory.name);

    return {
      success: true,
      assignment: updatedAssignment,
      message: `Réassigné au dortoir ${newDormitory.name}`
    };

  } catch (error) {
    console.error('❌ Erreur réassignation:', error.message);
    return {
      success: false,
      message: 'Erreur système lors de la réassignation'
    };
  }
};

module.exports = {
  assignDormitory,
  unassignDormitory,
  reassignDormitory
};

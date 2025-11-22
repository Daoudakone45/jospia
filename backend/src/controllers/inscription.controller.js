const supabase = require('../config/supabase');
const { inscriptionSchema } = require('../utils/validation');
const { sendConfirmationEmail } = require('../utils/emailService');
const dormitoryService = require('../services/dormitoryService');

const createInscription = async (req, res, next) => {
  try {
    // Validate input
    const { error: validationError, value } = inscriptionSchema.validate(req.body);
    if (validationError) {
      validationError.isJoi = true;
      return next(validationError);
    }

    const inscriptionData = {
      ...value,
      user_id: req.user.id,
      ticket_price: parseInt(process.env.TICKET_PRICE) || 5000,
      status: 'pending'
    };

    // Create inscription
    const { data, error } = await supabase
      .from('inscriptions')
      .insert([inscriptionData])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Send confirmation email
    try {
      await sendConfirmationEmail(req.user, data);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Inscription created successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getInscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('inscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Inscription not found'
      });
    }

    // Check if user owns this inscription or is admin
    if (data.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateInscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if inscription exists and user owns it
    const { data: existing, error: fetchError } = await supabase
      .from('inscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({
        success: false,
        message: 'Inscription not found'
      });
    }

    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate update data
    const { error: validationError, value } = inscriptionSchema.validate(req.body);
    if (validationError) {
      validationError.isJoi = true;
      return next(validationError);
    }

    // Update inscription
    const { data, error } = await supabase
      .from('inscriptions')
      .update(value)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Inscription updated successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getAllInscriptions = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      section, 
      status, 
      search,
      gender 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('inscriptions')
      .select('*, users(email, full_name)', { count: 'exact' });

    // Apply filters
    if (section) {
      query = query.eq('section', section);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (gender) {
      query = query.eq('gender', gender);
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteInscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log('🗑️  SUPPRESSION INSCRIPTION:', id);

    // 1. Vérifier que l'inscription existe
    const { data: inscription, error: fetchError } = await supabase
      .from('inscriptions')
      .select('id, first_name, last_name')
      .eq('id', id)
      .single();

    if (fetchError || !inscription) {
      return res.status(404).json({
        success: false,
        message: 'Inscription not found'
      });
    }

    console.log(`   Participant: ${inscription.first_name} ${inscription.last_name}`);

    // 2. Vérifier et libérer le dortoir assigné
    const { data: assignment } = await supabase
      .from('dormitory_assignments')
      .select('id, dormitory_id, dormitories(name)')
      .eq('inscription_id', id)
      .single();

    if (assignment) {
      console.log(`   🏠 Dortoir assigné: ${assignment.dormitories?.name}`);
      console.log('   🔄 Libération du dortoir...');
      
      const unassignResult = await dormitoryService.unassignDormitory(assignment.id);
      
      if (unassignResult.success) {
        console.log('   ✅ Dortoir libéré avec succès');
      } else {
        console.log('   ⚠️  Erreur lors de la libération du dortoir:', unassignResult.message);
      }
    } else {
      console.log('   ℹ️  Aucun dortoir assigné');
    }

    // 3. Supprimer les paiements associés (si nécessaire)
    const { data: payments } = await supabase
      .from('payments')
      .select('id')
      .eq('inscription_id', id);

    if (payments && payments.length > 0) {
      console.log(`   💰 Suppression de ${payments.length} paiement(s)...`);
      
      const { error: paymentDeleteError } = await supabase
        .from('payments')
        .delete()
        .eq('inscription_id', id);

      if (paymentDeleteError) {
        console.error('   ⚠️  Erreur suppression paiements:', paymentDeleteError.message);
      } else {
        console.log('   ✅ Paiements supprimés');
      }
    }

    // 4. Supprimer l'inscription
    console.log('   🗑️  Suppression de l\'inscription...');
    const { data, error } = await supabase
      .from('inscriptions')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('   ❌ Erreur suppression:', error?.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete inscription'
      });
    }

    console.log('✅ SUPPRESSION RÉUSSIE\n');

    res.json({
      success: true,
      message: 'Inscription deleted successfully, dormitory freed'
    });
  } catch (error) {
    console.error('❌ ERREUR SUPPRESSION:', error);
    next(error);
  }
};

const getMyInscription = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('inscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no inscription found, return null instead of error
      if (error.code === 'PGRST116') {
        return res.json({
          success: true,
          data: null
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInscription,
  getInscription,
  updateInscription,
  getAllInscriptions,
  deleteInscription,
  getMyInscription
};

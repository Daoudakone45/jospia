const supabase = require('../config/supabase');
const { dormitoryAssignmentSchema } = require('../utils/validation');
const dormitoryService = require('../services/dormitoryService');

const getAllDormitories = async (req, res, next) => {
  try {
    const { gender } = req.query;

    let query = supabase
      .from('dormitories')
      .select('id, name, gender, total_capacity, available_slots, created_at');

    if (gender) {
      query = query.eq('gender', gender);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) {
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

const getAvailableSlots = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('dormitories')
      .select('available_slots, total_capacity')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Dormitory not found'
      });
    }

    res.json({
      success: true,
      data: {
        available: data.available_slots,
        total: data.total_capacity,
        occupied: data.total_capacity - data.available_slots
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAssignment = async (req, res, next) => {
  try {
    const { inscription_id } = req.params;

    const { data, error } = await supabase
      .from('dormitory_assignments')
      .select('*, dormitories(*), inscriptions(*)')
      .eq('inscription_id', inscription_id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check authorization
    if (data.inscriptions.user_id !== req.user.id && req.user.role !== 'admin') {
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

const createDormitory = async (req, res, next) => {
  try {
    const { name, gender, total_capacity } = req.body;

    const { data, error } = await supabase
      .from('dormitories')
      .insert([{
        name,
        gender,
        total_capacity,
        available_slots: total_capacity
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Dormitory created successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const assignDormitory = async (req, res, next) => {
  try {
    const { error: validationError, value } = dormitoryAssignmentSchema.validate(req.body);
    if (validationError) {
      validationError.isJoi = true;
      return next(validationError);
    }

    const { inscription_id, dormitory_id, room_number, bed_number } = value;

    // Check if inscription exists
    const { data: inscription, error: inscriptionError } = await supabase
      .from('inscriptions')
      .select('*')
      .eq('id', inscription_id)
      .single();

    if (inscriptionError || !inscription) {
      return res.status(404).json({
        success: false,
        message: 'Inscription not found'
      });
    }

    // Check if dormitory exists and has available slots
    const { data: dormitory, error: dormitoryError } = await supabase
      .from('dormitories')
      .select('*')
      .eq('id', dormitory_id)
      .single();

    if (dormitoryError || !dormitory) {
      return res.status(404).json({
        success: false,
        message: 'Dormitory not found'
      });
    }

    if (dormitory.available_slots <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No available slots in this dormitory'
      });
    }

    // Check gender match
    if (dormitory.gender !== inscription.gender) {
      return res.status(400).json({
        success: false,
        message: 'Dormitory gender does not match inscription gender'
      });
    }

    // Check if already assigned
    const { data: existing } = await supabase
      .from('dormitory_assignments')
      .select('*')
      .eq('inscription_id', inscription_id)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Inscription already assigned to a dormitory'
      });
    }

    // Create assignment
    const { data, error } = await supabase
      .from('dormitory_assignments')
      .insert([{
        inscription_id,
        dormitory_id,
        room_number,
        bed_number
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Update available slots
    await supabase
      .from('dormitories')
      .update({ available_slots: dormitory.available_slots - 1 })
      .eq('id', dormitory_id);

    res.status(201).json({
      success: true,
      message: 'Dormitory assigned successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dormitory_id, room_number, bed_number } = req.body;

    // Get current assignment
    const { data: currentAssignment, error: fetchError } = await supabase
      .from('dormitory_assignments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // If changing dormitory
    if (dormitory_id && dormitory_id !== currentAssignment.dormitory_id) {
      // Check new dormitory availability
      const { data: newDormitory } = await supabase
        .from('dormitories')
        .select('*')
        .eq('id', dormitory_id)
        .single();

      if (!newDormitory || newDormitory.available_slots <= 0) {
        return res.status(400).json({
          success: false,
          message: 'New dormitory not available'
        });
      }

      // Update slots
      await supabase
        .from('dormitories')
        .update({ available_slots: newDormitory.available_slots - 1 })
        .eq('id', dormitory_id);

      // Restore old dormitory slot
      const { data: oldDormitory } = await supabase
        .from('dormitories')
        .select('*')
        .eq('id', currentAssignment.dormitory_id)
        .single();

      await supabase
        .from('dormitories')
        .update({ available_slots: oldDormitory.available_slots + 1 })
        .eq('id', currentAssignment.dormitory_id);
    }

    // Update assignment
    const { data, error } = await supabase
      .from('dormitory_assignments')
      .update({
        ...(dormitory_id && { dormitory_id }),
        ...(room_number && { room_number }),
        ...(bed_number && { bed_number })
      })
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
      message: 'Assignment updated successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateDormitory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, gender, total_capacity } = req.body;

    // Get current dormitory
    const { data: currentDormitory, error: fetchError } = await supabase
      .from('dormitories')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentDormitory) {
      return res.status(404).json({
        success: false,
        message: 'Dormitory not found'
      });
    }

    // Calculate new available_slots if capacity changes
    let available_slots = currentDormitory.available_slots;
    if (total_capacity && total_capacity !== currentDormitory.total_capacity) {
      const occupied = currentDormitory.total_capacity - currentDormitory.available_slots;
      available_slots = total_capacity - occupied;
      
      // Check if new capacity is sufficient
      if (available_slots < 0) {
        return res.status(400).json({
          success: false,
          message: 'New capacity is too small for current assignments'
        });
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(gender && { gender }),
      ...(total_capacity && { total_capacity, available_slots })
    };

    const { data, error } = await supabase
      .from('dormitories')
      .update(updateData)
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
      message: 'Dormitory updated successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const deleteDormitory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if dormitory has assignments
    const { data: assignments } = await supabase
      .from('dormitory_assignments')
      .select('*')
      .eq('dormitory_id', id);

    if (assignments && assignments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete dormitory with existing assignments'
      });
    }

    const { data, error } = await supabase
      .from('dormitories')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Dormitory not found'
      });
    }

    res.json({
      success: true,
      message: 'Dormitory deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getAllAssignments = async (req, res, next) => {
  try {
    const { dormitory_id, gender } = req.query;

    let query = supabase
      .from('dormitory_assignments')
      .select(`
        id,
        inscription_id,
        dormitory_id,
        assigned_at,
        dormitories (id, name, gender),
        inscriptions (id, first_name, last_name, gender, contact_phone)
      `);

    if (dormitory_id) {
      query = query.eq('dormitory_id', dormitory_id);
    }

    const { data, error } = await query.order('assigned_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération assignments:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Filtrer par genre côté serveur si nécessaire
    let filteredData = data || [];
    if (gender && filteredData.length > 0) {
      filteredData = filteredData.filter(assignment => 
        assignment.dormitories?.gender === gender
      );
    }

    res.json({
      success: true,
      data: filteredData
    });
  } catch (error) {
    console.error('❌ Erreur getAllAssignments:', error);
    next(error);
  }
};

const unassignDormitory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await dormitoryService.unassignDormitory(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const reassignDormitory = async (req, res, next) => {
  try {
    const { inscription_id, new_dormitory_id } = req.body;

    if (!inscription_id || !new_dormitory_id) {
      return res.status(400).json({
        success: false,
        message: 'inscription_id and new_dormitory_id are required'
      });
    }

    const result = await dormitoryService.reassignDormitory(inscription_id, new_dormitory_id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDormitories,
  getAvailableSlots,
  getAssignment,
  getAllAssignments,
  createDormitory,
  updateDormitory,
  assignDormitory,
  updateAssignment,
  unassignDormitory,
  reassignDormitory,
  deleteDormitory
};

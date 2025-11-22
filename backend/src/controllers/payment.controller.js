const supabase = require('../config/supabase');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { paymentInitiateSchema } = require('../utils/validation');
const { sendPaymentReceiptEmail } = require('../utils/emailService');
const { generatePaymentReceipt } = require('../utils/pdfService');
const dormitoryService = require('../services/dormitoryService');

const initiatePayment = async (req, res, next) => {
  try {
    // Validate input
    const { error: validationError, value } = paymentInitiateSchema.validate(req.body);
    if (validationError) {
      validationError.isJoi = true;
      return next(validationError);
    }

    const { inscription_id, payment_method } = value;

    // Check if inscription exists and belongs to user
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

    if (inscription.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if already paid
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('inscription_id', inscription_id)
      .eq('status', 'success')
      .single();

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this inscription'
      });
    }

    // Generate unique reference
    const reference = `JOSPIA-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Fixed amount for JOSPIA seminar
    const SEMINAR_PRICE = 5000; // 5000 FCFA

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        inscription_id,
        amount: SEMINAR_PRICE,
        payment_method,
        reference_code: reference,
        status: 'pending'
      }])
      .select()
      .single();

    if (paymentError) {
      return res.status(400).json({
        success: false,
        message: paymentError.message
      });
    }

    // Initialize CinetPay payment
    try {
      const cinetpayResponse = await axios.post('https://api-checkout.cinetpay.com/v2/payment', {
        apikey: process.env.CINETPAY_API_KEY,
        site_id: process.env.CINETPAY_SITE_ID,
        transaction_id: reference,
        amount: SEMINAR_PRICE,
        currency: process.env.CURRENCY || 'XOF',
        description: `Inscription JOSPIA - ${inscription.first_name} ${inscription.last_name}`,
        customer_name: `${inscription.first_name} ${inscription.last_name}`,
        customer_surname: inscription.last_name,
        customer_email: req.user.email,
        customer_phone_number: inscription.contact_phone,
        customer_address: inscription.residence_location,
        customer_city: inscription.residence_location,
        customer_country: 'CI',
        customer_state: 'CI',
        customer_zip_code: '00000',
        notify_url: process.env.CINETPAY_NOTIFY_URL,
        return_url: process.env.CINETPAY_RETURN_URL,
        channels: payment_method.toUpperCase()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (cinetpayResponse.data.code === '201') {
        res.json({
          success: true,
          message: 'Payment initiated successfully',
          data: {
            payment_id: payment.id,
            payment_url: cinetpayResponse.data.data.payment_url,
            reference: reference
          }
        });
      } else {
        // Update payment status to failed
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', payment.id);

        return res.status(400).json({
          success: false,
          message: 'Failed to initiate payment with CinetPay'
        });
      }
    } catch (cinetpayError) {
      console.error('CinetPay error:', cinetpayError);
      
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id);

      return res.status(500).json({
        success: false,
        message: 'Payment gateway error'
      });
    }
  } catch (error) {
    next(error);
  }
};

const paymentCallback = async (req, res, next) => {
  try {
    const { cpm_trans_id, cpm_trans_status, signature } = req.body;

    // Verify signature (security check)
    // Implementation depends on CinetPay's signature algorithm

    // Get payment by reference
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, inscriptions(*)')
      .eq('reference_code', cpm_trans_id)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status
    const newStatus = cpm_trans_status === '00' ? 'success' : 'failed';
    
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        payment_date: new Date().toISOString()
      })
      .eq('id', payment.id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: updateError.message
      });
    }

    // If payment successful, update inscription status
    if (newStatus === 'success') {
      await supabase
        .from('inscriptions')
        .update({ status: 'confirmed' })
        .eq('id', payment.inscription_id);

      // Générer le reçu
      const receiptNumber = `${process.env.RECEIPT_PREFIX}${Date.now()}`;
      const { data: receipt } = await supabase
        .from('receipts')
        .insert([{
          payment_id: payment.id,
          receipt_number: receiptNumber
        }])
        .select()
        .single();

      // Attribution automatique du dortoir
      console.log('🏠 Démarrage attribution automatique dortoir...');
      const assignmentResult = await dormitoryService.assignDormitory(
        payment.inscription_id,
        payment.inscriptions.gender
      );
      
      if (assignmentResult.success) {
        console.log('✅ Dortoir attribué:', assignmentResult.dormitory?.name);
      } else {
        console.warn('⚠️ Échec attribution dortoir:', assignmentResult.message);
      }

      // Send receipt email
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', payment.inscriptions.user_id)
        .single();

      try {
        await sendPaymentReceiptEmail(user, payment.inscriptions, updatedPayment, null);
      } catch (emailError) {
        console.error('Failed to send receipt email:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('payments')
      .select('*, inscriptions(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
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

const checkPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, inscriptions(*)')
      .eq('id', id)
      .single();

    if (error || !payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.inscriptions.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check status with CinetPay
    try {
      const response = await axios.post('https://api-checkout.cinetpay.com/v2/payment/check', {
        apikey: process.env.CINETPAY_API_KEY,
        site_id: process.env.CINETPAY_SITE_ID,
        transaction_id: payment.reference_code
      });

      if (response.data.code === '00') {
        const cinetpayStatus = response.data.data.status;
        
        if (cinetpayStatus === 'ACCEPTED' && payment.status !== 'success') {
          // Update payment status
          await supabase
            .from('payments')
            .update({
              status: 'success',
              payment_date: new Date().toISOString()
            })
            .eq('id', payment.id);

          await supabase
            .from('inscriptions')
            .update({ status: 'confirmed' })
            .eq('id', payment.inscription_id);

          // Attribution automatique du dortoir
          console.log('🏠 Attribution automatique dortoir après vérification paiement...');
          const assignmentResult = await dormitoryService.assignDormitory(
            payment.inscription_id,
            payment.inscriptions.gender
          );
          
          if (assignmentResult.success) {
            console.log('✅ Dortoir attribué:', assignmentResult.dormitory?.name);
          } else {
            console.warn('⚠️ Échec attribution dortoir:', assignmentResult.message);
          }
        }

        return res.json({
          success: true,
          data: {
            status: cinetpayStatus === 'ACCEPTED' ? 'success' : payment.status,
            payment
          }
        });
      }
    } catch (cinetpayError) {
      console.error('CinetPay check error:', cinetpayError);
    }

    res.json({
      success: true,
      data: {
        status: payment.status,
        payment
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllPayments = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      date_from,
      date_to
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('payments')
      .select('*, inscriptions(first_name, last_name, section)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (date_from) {
      query = query.gte('payment_date', date_from);
    }

    if (date_to) {
      query = query.lte('payment_date', date_to);
    }

    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

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

// Helper function to auto-assign dormitory
// Note: L'attribution automatique des dortoirs est gérée par dormitoryService
// Voir: src/services/dormitoryService.js

// Simulate payment success (for development/testing)
const simulatePaymentSuccess = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, inscriptions(*)')
      .eq('id', id)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment belongs to user (unless admin)
    if (!req.user.is_admin && payment.inscriptions.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update payment to success
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'success',
        payment_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: updateError.message
      });
    }

    // Update inscription status to confirmed
    await supabase
      .from('inscriptions')
      .update({ status: 'confirmed' })
      .eq('id', payment.inscription_id);

    // Auto-assign dormitory
    try {
      // Récupérer l'inscription pour obtenir le genre
      const { data: inscription } = await supabase
        .from('inscriptions')
        .select('gender')
        .eq('id', payment.inscription_id)
        .single();
      
      const assignment = await dormitoryService.assignDormitory(
        payment.inscription_id,
        inscription?.gender
      );
      console.log('✅ Dortoir attribué automatiquement:', assignment);
    } catch (assignError) {
      console.error('❌ Erreur attribution dortoir:', assignError);
      // Continue even if assignment fails
    }

    res.json({
      success: true,
      message: 'Payment simulated successfully',
      data: updatedPayment
    });
  } catch (error) {
    next(error);
  }
};

// Download payment receipt as PDF
const downloadReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get payment with all related data
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        inscriptions (
          id,
          first_name,
          last_name,
          contact_phone,
          section,
          gender,
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment belongs to user (unless admin)
    if (!req.user.is_admin && payment.inscriptions.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Payment must be successful
    if (payment.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Receipt only available for successful payments'
      });
    }

    // Get user data
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', payment.inscriptions.user_id)
      .single();

    // Get dormitory assignment if exists
    const { data: dormitoryAssignment } = await supabase
      .from('dormitory_assignments')
      .select('*, dormitories(*)')
      .eq('inscription_id', payment.inscriptions.id)
      .single();

    // Generate receipt number if not exists
    const receiptNumber = payment.receipt_number || `JOSPIA-${Date.now()}-${payment.id.substring(0, 8).toUpperCase()}`;

    // Update payment with receipt number if it doesn't have one
    if (!payment.receipt_number) {
      await supabase
        .from('payments')
        .update({ receipt_number: receiptNumber })
        .eq('id', id);
    }

    // Generate PDF
    const pdfBuffer = await generatePaymentReceipt({
      payment,
      inscription: payment.inscriptions,
      user,
      receiptNumber,
      dormitory: dormitoryAssignment?.dormitories || null
    });

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Recu-JOSPIA-${receiptNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating receipt:', error);
    next(error);
  }
};

// Create and complete payment in one step (for development without CinetPay)
const createSimplePayment = async (req, res, next) => {
  try {
    console.log('📝 createSimplePayment - Body:', req.body);
    console.log('👤 User:', req.user);
    
    // Validate input
    const { error: validationError, value } = paymentInitiateSchema.validate(req.body);
    if (validationError) {
      console.error('❌ Validation error:', validationError.details);
      validationError.isJoi = true;
      return next(validationError);
    }

    const { inscription_id, payment_method } = value;

    // Check if inscription exists and belongs to user
    const { data: inscription, error: inscriptionError } = await supabase
      .from('inscriptions')
      .select('*')
      .eq('id', inscription_id)
      .single();

    console.log('📋 Inscription:', inscription);
    console.log('❌ Inscription error:', inscriptionError);

    if (inscriptionError || !inscription) {
      return res.status(404).json({
        success: false,
        message: 'Inscription introuvable'
      });
    }

    if (inscription.user_id !== req.user.id) {
      console.error('❌ Access denied - user_id mismatch:', {
        inscription_user_id: inscription.user_id,
        request_user_id: req.user.id
      });
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    // Check if already paid
    console.log('🔍 Vérification paiement existant...');
    const { data: existingPayment, error: existingPaymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('inscription_id', inscription_id)
      .eq('status', 'success')
      .single();

    console.log('💰 Paiement existant:', existingPayment);
    console.log('❌ Erreur paiement existant:', existingPaymentError);

    if (existingPayment) {
      console.log('⚠️  Paiement déjà effectué !');
      return res.status(400).json({
        success: false,
        message: 'Paiement déjà effectué pour cette inscription'
      });
    }

    // Generate unique reference
    console.log('🎫 Génération de la référence...');
    const reference = `JOSPIA-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const SEMINAR_PRICE = 5000; // 5000 FCFA
    console.log('✅ Référence:', reference);

    // Déterminer le statut en fonction de la méthode de paiement
    const paymentStatus = payment_method === 'cash' ? 'pending' : 'success';
    const inscriptionStatus = payment_method === 'cash' ? 'pending' : 'confirmed';

    console.log(`💵 Méthode: ${payment_method}, Statut: ${paymentStatus}`);

    // Create payment record
    console.log('💳 Création du paiement dans la base de données...');
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        inscription_id,
        amount: SEMINAR_PRICE,
        payment_method,
        reference_code: reference,
        status: paymentStatus, // 'pending' pour espèces, 'success' pour mobile money
        payment_date: payment_method === 'cash' ? null : new Date().toISOString()
      }])
      .select()
      .single();

    console.log('💰 Paiement créé:', payment);
    console.log('❌ Erreur création paiement:', paymentError);

    if (paymentError) {
      console.error('❌ ERREUR SUPABASE:', paymentError);
      return res.status(400).json({
        success: false,
        message: paymentError.message
      });
    }

    // Update inscription status
    await supabase
      .from('inscriptions')
      .update({ status: inscriptionStatus })
      .eq('id', inscription_id);

    // Auto-assign dormitory UNIQUEMENT si le paiement est validé (non-cash)
    if (payment_method !== 'cash') {
      console.log('🏠 DÉMARRAGE assignation automatique dortoir...');
      console.log('   Inscription ID:', inscription_id);
      console.log('   Genre:', inscription.gender);
      try {
        const assignmentResult = await dormitoryService.assignDormitory(inscription_id, inscription.gender);
        console.log('✅ RÉSULTAT assignation:', assignmentResult);
        if (assignmentResult.success) {
          console.log(`✅ Dortoir assigné: ${assignmentResult.dormitory?.name}`);
        } else {
          console.error('❌ Échec assignation:', assignmentResult.message);
        }
      } catch (assignError) {
        console.error('⚠️  EXCEPTION lors de l\'assignation dortoir:');
        console.error('   Message:', assignError.message);
        console.error('   Stack:', assignError.stack);
        // Continue même si l'assignation échoue
      }
    } else {
      console.log('💵 Paiement en espèces - assignation dortoir en attente de validation');
    }

    // Send confirmation email UNIQUEMENT si le paiement est validé
    if (payment_method !== 'cash') {
      try {
        await sendPaymentReceiptEmail(
          req.user,                    // user object
          inscription,                 // inscription object
          payment,                     // payment object (from DB)
          null                         // receiptPdfPath (optional, null for now)
        );
        console.log('✅ Email de confirmation envoyé à:', req.user.email);
      } catch (emailError) {
        console.error('⚠️  Erreur envoi email:', emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: payment_method === 'cash' 
        ? 'Demande de paiement créée. Veuillez vous présenter à l\'admin avec le montant en espèces.'
        : 'Paiement effectué avec succès',
      data: payment
    });
  } catch (error) {
    console.error('❌ ERREUR GLOBALE createSimplePayment:', error);
    next(error);
  }
};

// Get payment by inscription ID
const getPaymentByInscription = async (req, res, next) => {
  try {
    const { inscriptionId } = req.params;

    // Get payment for this inscription
    const { data, error } = await supabase
      .from('payments')
      .select('*, inscriptions(*)')
      .eq('inscription_id', inscriptionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
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

/**
 * Valider manuellement un paiement en espèces (ADMIN ONLY)
 */
const validateCashPayment = async (req, res, next) => {
  try {
    const { inscriptionId } = req.params;
    const { amount, notes } = req.body;

    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Get inscription
    const { data: inscription, error: inscriptionError } = await supabase
      .from('inscriptions')
      .select('*')
      .eq('id', inscriptionId)
      .single();

    if (inscriptionError || !inscription) {
      return res.status(404).json({
        success: false,
        message: 'Inscription not found'
      });
    }

    // Check if already paid successfully
    const { data: existingSuccessPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('inscription_id', inscriptionId)
      .eq('status', 'success')
      .single();

    if (existingSuccessPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this inscription'
      });
    }

    // Check if there's a pending cash payment
    const { data: pendingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('inscription_id', inscriptionId)
      .eq('payment_method', 'cash')
      .eq('status', 'pending')
      .single();

    const paymentAmount = amount || 5000; // Default seminar price
    let payment;

    console.log('💵 VALIDATION PAIEMENT ESPÈCES PAR ADMIN');
    console.log('   Inscription ID:', inscriptionId);
    console.log('   Montant:', paymentAmount, 'FCFA');
    console.log('   Admin:', req.user.email);
    console.log('   Paiement en attente existant:', pendingPayment ? 'OUI' : 'NON');

    if (pendingPayment) {
      // Update existing pending payment
      console.log('📝 Mise à jour du paiement en attente:', pendingPayment.id);
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'success',
          payment_date: new Date().toISOString()
        })
        .eq('id', pendingPayment.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erreur mise à jour paiement:', updateError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update payment record',
          error: updateError.message
        });
      }

      payment = updatedPayment;
      console.log('✅ Paiement mis à jour:', payment.id);
    } else {
      // Create new payment record if no pending payment exists
      const referenceCode = `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      console.log('📝 Création d\'un nouveau paiement');
      
      const { data: newPayment, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          inscription_id: inscriptionId,
          amount: paymentAmount,
          payment_method: 'cash',
          status: 'success',
          reference_code: referenceCode,
          payment_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (paymentError) {
        console.error('❌ Erreur création paiement:', paymentError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment record',
          error: paymentError.message
        });
      }

      payment = newPayment;
      console.log('✅ Paiement créé:', payment.id);
    }

    // Update inscription status to confirmed
    const { error: updateError } = await supabase
      .from('inscriptions')
      .update({ status: 'confirmed' })
      .eq('id', inscriptionId);

    if (updateError) {
      console.error('⚠️ Erreur mise à jour inscription:', updateError);
    } else {
      console.log('✅ Inscription confirmée');
    }

    // Auto-assign dormitory
    console.log('🏠 DÉMARRAGE assignation automatique dortoir...');
    console.log('   Inscription ID:', inscriptionId);
    console.log('   Genre:', inscription.gender);

    const assignmentResult = await dormitoryService.assignDormitory(
      inscriptionId,
      inscription.gender
    );

    console.log('✅ RÉSULTAT assignation:', assignmentResult);
    if (assignmentResult.success) {
      console.log(`✅ Dortoir assigné: ${assignmentResult.dormitory?.name}`);
    } else {
      console.log('⚠️ Aucun dortoir disponible ou erreur:', assignmentResult.message);
    }

    // Get user for email
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', inscription.user_id)
      .single();

    // Send email notification (if configured)
    if (user) {
      try {
        await sendPaymentReceiptEmail(
          user,
          inscription,
          payment,
          null
        );
        console.log('✅ Email envoyé');
      } catch (emailError) {
        console.error('⚠️ Erreur envoi email:', emailError.message);
      }
    }

    res.json({
      success: true,
      message: 'Cash payment validated successfully',
      data: {
        payment,
        dormitory: assignmentResult.success ? assignmentResult.dormitory : null
      }
    });

  } catch (error) {
    console.error('❌ Erreur validation paiement espèces:', error);
    next(error);
  }
};

module.exports = {
  initiatePayment,
  paymentCallback,
  getPayment,
  getPaymentByInscription,
  checkPaymentStatus,
  getAllPayments,
  simulatePaymentSuccess,
  downloadReceipt,
  createSimplePayment,
  validateCashPayment
};

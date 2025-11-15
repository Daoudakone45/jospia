const supabase = require('../config/supabase');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { paymentInitiateSchema } = require('../utils/validation');
const { sendPaymentReceiptEmail } = require('../utils/emailService');

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

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        inscription_id,
        amount: inscription.ticket_price,
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
        amount: inscription.ticket_price,
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

      // Generate receipt
      const receiptNumber = `${process.env.RECEIPT_PREFIX}${Date.now()}`;
      const { data: receipt } = await supabase
        .from('receipts')
        .insert([{
          payment_id: payment.id,
          receipt_number: receiptNumber
        }])
        .select()
        .single();

      // Auto-assign dormitory
      await autoAssignDormitory(payment.inscriptions);

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
const autoAssignDormitory = async (inscription) => {
  try {
    // Find available dormitory for gender
    const { data: dormitory } = await supabase
      .from('dormitories')
      .select('*')
      .eq('gender', inscription.gender)
      .gt('available_slots', 0)
      .order('available_slots', { ascending: false })
      .limit(1)
      .single();

    if (dormitory) {
      // Assign dormitory
      await supabase
        .from('dormitory_assignments')
        .insert([{
          inscription_id: inscription.id,
          dormitory_id: dormitory.id
        }]);

      // Update available slots
      await supabase
        .from('dormitories')
        .update({ available_slots: dormitory.available_slots - 1 })
        .eq('id', dormitory.id);
    }
  } catch (error) {
    console.error('Auto-assign dormitory error:', error);
  }
};

module.exports = {
  initiatePayment,
  paymentCallback,
  getPayment,
  checkPaymentStatus,
  getAllPayments
};

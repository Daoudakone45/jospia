const supabase = require('../config/supabase');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const getReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('receipts')
      .select('*, payments(*, inscriptions(*))')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    // Check authorization
    if (data.payments.inscriptions.user_id !== req.user.id && req.user.role !== 'admin') {
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

const downloadReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: receipt, error } = await supabase
      .from('receipts')
      .select('*, payments(*, inscriptions(*))')
      .eq('id', id)
      .single();

    if (error || !receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    const inscription = receipt.payments.inscriptions;
    const payment = receipt.payments;

    // Check authorization
    if (inscription.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate QR code
    const qrCodeData = `JOSPIA-${receipt.receipt_number}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=recu_${receipt.receipt_number}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('JOSPIA', { align: 'center' });
    doc.fontSize(16).text('Reçu de Paiement', { align: 'center' });
    doc.moveDown();

    // Receipt number and date
    doc.fontSize(10);
    doc.text(`Numéro de reçu: ${receipt.receipt_number}`, { align: 'right' });
    doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString('fr-FR')}`, { align: 'right' });
    doc.moveDown(2);

    // Participant information
    doc.fontSize(14).text('Informations du participant', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Nom complet: ${inscription.first_name} ${inscription.last_name}`);
    doc.text(`Section: ${inscription.section}`);
    doc.text(`Contact: ${inscription.contact_phone}`);
    doc.text(`Genre: ${inscription.gender === 'male' ? 'Homme' : 'Femme'}`);
    doc.moveDown(2);

    // Payment information
    doc.fontSize(14).text('Détails du paiement', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Montant: ${payment.amount} FCFA`);
    doc.text(`Méthode: ${payment.payment_method}`);
    doc.text(`Référence: ${payment.reference_code}`);
    doc.text(`Statut: ${payment.status === 'success' ? 'Payé' : 'En attente'}`);
    doc.moveDown(2);

    // QR Code
    doc.fontSize(12).text('QR Code de vérification:', { align: 'center' });
    doc.image(qrCodeBuffer, {
      fit: [150, 150],
      align: 'center',
      valign: 'center'
    });
    doc.moveDown(2);

    // Footer
    doc.fontSize(8).text('Merci pour votre participation au séminaire JOSPIA!', { align: 'center' });
    doc.text('Ce reçu fait foi de paiement. Veuillez le conserver.', { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

const sendReceiptByEmail = async (req, res, next) => {
  try {
    const { receipt_id, email } = req.body;

    const { data: receipt, error } = await supabase
      .from('receipts')
      .select('*, payments(*, inscriptions(*))')
      .eq('id', receipt_id)
      .single();

    if (error || !receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    const inscription = receipt.payments.inscriptions;

    // Check authorization
    if (inscription.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', inscription.user_id)
      .single();

    // Send email
    const { sendPaymentReceiptEmail } = require('../utils/emailService');
    await sendPaymentReceiptEmail(user, inscription, receipt.payments, null);

    res.json({
      success: true,
      message: 'Receipt sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getAllReceipts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('receipts')
      .select('*, payments(*, inscriptions(first_name, last_name))', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('generated_at', { ascending: false });

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

module.exports = {
  getReceipt,
  downloadReceipt,
  sendReceiptByEmail,
  getAllReceipts
};

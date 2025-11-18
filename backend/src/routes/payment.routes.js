const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Protected routes
router.post('/initiate', authenticate, paymentController.initiatePayment);
router.post('/create-simple', authenticate, paymentController.createSimplePayment); // Simple payment without CinetPay
router.post('/callback', paymentController.paymentCallback);
router.post('/:id/simulate', authenticate, paymentController.simulatePaymentSuccess);
router.get('/inscription/:inscriptionId', authenticate, paymentController.getPaymentByInscription); // Get payment by inscription
router.get('/:id', authenticate, paymentController.getPayment);
router.get('/:id/status', authenticate, paymentController.checkPaymentStatus);
router.get('/:id/receipt', authenticate, paymentController.downloadReceipt);

// Admin routes
router.get('/', authenticate, authorizeAdmin, paymentController.getAllPayments);

module.exports = router;

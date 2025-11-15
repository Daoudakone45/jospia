const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Protected routes
router.post('/initiate', authenticate, paymentController.initiatePayment);
router.post('/callback', paymentController.paymentCallback);
router.get('/:id', authenticate, paymentController.getPayment);
router.get('/:id/status', authenticate, paymentController.checkPaymentStatus);

// Admin routes
router.get('/', authenticate, authorizeAdmin, paymentController.getAllPayments);

module.exports = router;

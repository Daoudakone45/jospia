const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Protected routes
router.get('/:id', authenticate, receiptController.getReceipt);
router.get('/:id/download', authenticate, receiptController.downloadReceipt);
router.post('/send-email', authenticate, receiptController.sendReceiptByEmail);

// Admin routes
router.get('/', authenticate, authorizeAdmin, receiptController.getAllReceipts);

module.exports = router;

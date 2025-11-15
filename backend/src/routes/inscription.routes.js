const express = require('express');
const router = express.Router();
const inscriptionController = require('../controllers/inscription.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Protected routes (user must be authenticated)
router.post('/', authenticate, inscriptionController.createInscription);
router.get('/my-inscription', authenticate, inscriptionController.getMyInscription); // New route
router.get('/:id', authenticate, inscriptionController.getInscription);
router.put('/:id', authenticate, inscriptionController.updateInscription);

// Admin routes
router.get('/', authenticate, authorizeAdmin, inscriptionController.getAllInscriptions);
router.delete('/:id', authenticate, authorizeAdmin, inscriptionController.deleteInscription);

module.exports = router;

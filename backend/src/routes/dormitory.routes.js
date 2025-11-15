const express = require('express');
const router = express.Router();
const dormitoryController = require('../controllers/dormitory.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Protected routes
router.get('/', authenticate, dormitoryController.getAllDormitories);
router.get('/:id/available', authenticate, dormitoryController.getAvailableSlots);
router.get('/assignment/:inscription_id', authenticate, dormitoryController.getAssignment);

// Admin routes
router.post('/', authenticate, authorizeAdmin, dormitoryController.createDormitory);
router.post('/assign', authenticate, authorizeAdmin, dormitoryController.assignDormitory);
router.put('/assignment/:id', authenticate, authorizeAdmin, dormitoryController.updateAssignment);
router.delete('/:id', authenticate, authorizeAdmin, dormitoryController.deleteDormitory);

module.exports = router;

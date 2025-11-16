const express = require('express');
const router = express.Router();
const dormitoryController = require('../controllers/dormitory.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Protected routes - mettre les routes spécifiques avant les routes génériques
router.get('/assignments', authenticate, authorizeAdmin, dormitoryController.getAllAssignments);
router.get('/assignment/:inscription_id', authenticate, dormitoryController.getAssignment);
router.get('/:id/available', authenticate, dormitoryController.getAvailableSlots);
router.get('/', authenticate, dormitoryController.getAllDormitories);

// Admin routes - mettre les routes spécifiques avant les routes avec :id
router.post('/assign', authenticate, authorizeAdmin, dormitoryController.assignDormitory);
router.post('/reassign', authenticate, authorizeAdmin, dormitoryController.reassignDormitory);
router.put('/assignment/:id', authenticate, authorizeAdmin, dormitoryController.updateAssignment);
router.delete('/assignment/:id', authenticate, authorizeAdmin, dormitoryController.unassignDormitory);
router.post('/', authenticate, authorizeAdmin, dormitoryController.createDormitory);
router.put('/:id', authenticate, authorizeAdmin, dormitoryController.updateDormitory);
router.delete('/:id', authenticate, authorizeAdmin, dormitoryController.deleteDormitory);

module.exports = router;

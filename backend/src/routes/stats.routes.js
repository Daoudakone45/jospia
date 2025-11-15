const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Admin routes only
router.get('/dashboard', authenticate, authorizeAdmin, statsController.getDashboardStats);
router.get('/occupancy', authenticate, authorizeAdmin, statsController.getOccupancyStats);
router.get('/revenue', authenticate, authorizeAdmin, statsController.getRevenueStats);
router.get('/export/excel', authenticate, authorizeAdmin, statsController.exportToExcel);
router.get('/export/pdf', authenticate, authorizeAdmin, statsController.exportToPDF);

module.exports = router;

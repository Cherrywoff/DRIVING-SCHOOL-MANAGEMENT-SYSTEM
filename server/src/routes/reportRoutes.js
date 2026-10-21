const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/dashboard-stats', authenticateToken, reportController.getDashboardStats);
router.get('/export/students-excel', authenticateToken, authorizeRoles('Admin'), reportController.exportStudentsExcel);
router.get('/export/revenue-excel', authenticateToken, authorizeRoles('Admin'), reportController.exportRevenueExcel);

module.exports = router;

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, attendanceController.getAllAttendance);
router.post('/', authenticateToken, authorizeRoles('Admin', 'Instructor'), attendanceController.recordAttendance);

module.exports = router;

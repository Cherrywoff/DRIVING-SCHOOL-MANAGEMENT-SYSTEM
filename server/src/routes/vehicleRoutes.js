const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', vehicleController.getAllVehicles);
router.post('/', authenticateToken, authorizeRoles('Admin'), vehicleController.createVehicle);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), vehicleController.updateVehicle);

module.exports = router;

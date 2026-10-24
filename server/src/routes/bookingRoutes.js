const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, bookingController.getAllBookings);
router.post('/', authenticateToken, bookingController.createBooking);
router.put('/:id/status', authenticateToken, bookingController.updateBookingStatus);
router.put('/:id/assign', authenticateToken, authorizeRoles('Admin'), bookingController.assignAndFinalizeSlot);

module.exports = router;

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, paymentController.getAllPayments);
router.post('/process', authenticateToken, paymentController.processPayment);
router.get('/:id/receipt', authenticateToken, paymentController.generateReceiptPdf);

module.exports = router;

const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', instructorController.getAllInstructors);
router.get('/:id', instructorController.getInstructorById);
router.post('/', authenticateToken, authorizeRoles('Admin'), instructorController.createInstructor);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), instructorController.updateInstructor);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), instructorController.deleteInstructor);

module.exports = router;

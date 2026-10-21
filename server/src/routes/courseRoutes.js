const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', authenticateToken, authorizeRoles('Admin'), courseController.createCourse);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), courseController.updateCourse);

module.exports = router;

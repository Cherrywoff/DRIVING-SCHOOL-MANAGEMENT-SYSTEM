const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/mock-quiz/papers', authenticateToken, testController.getPapersList);
router.get('/mock-quiz/questions', authenticateToken, testController.getMockQuizQuestions);
router.post('/mock-quiz/submit', authenticateToken, testController.submitMockQuiz);
router.get('/', authenticateToken, testController.getAllTests);
router.post('/', authenticateToken, authorizeRoles('Admin', 'Instructor'), testController.scheduleTest);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Instructor'), testController.updateTestResult);

module.exports = router;

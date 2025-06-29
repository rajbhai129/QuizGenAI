// routes/quizRoutes.js (or similar)
const express = require('express');
const router = express.Router();
const { 
  generateQuiz,
  createSharedQuiz, 
  getSharedQuiz, 
  submitSharedQuiz 
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

// AI Quiz Generation
router.post('/generate', protect, generateQuiz);

// Shared Quiz Management - using more specific routes
router.post('/create', protect, createSharedQuiz);
router.get('/shared-quiz/:quizId', getSharedQuiz);
router.post('/shared-quiz/:quizId/submit', protect, submitSharedQuiz);

module.exports = router;

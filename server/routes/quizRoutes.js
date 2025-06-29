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

// Create shared quiz
router.post('/create', protect, createSharedQuiz);

// Shared Quiz Management - using query parameters instead of route parameters
router.get('/shared', getSharedQuiz);
router.post('/shared/submit', protect, submitSharedQuiz);

module.exports = router;

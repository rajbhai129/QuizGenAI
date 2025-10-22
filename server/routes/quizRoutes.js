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

router.post('/generate', protect, generateQuiz); // Re-added 'protect'

// Shared quiz routes
router.post('/create', protect, createSharedQuiz);
router.get('/:id', getSharedQuiz);
router.post('/:id/submit', protect, submitSharedQuiz);

module.exports = router;

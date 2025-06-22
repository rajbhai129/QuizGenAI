// routes/quizRoutes.js (or similar)
const express = require('express');
const router = express.Router();
const { generateQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { createSharedQuiz, getSharedQuiz, submitSharedQuiz } = require('../controllers/quizController');

router.post('/generate', generateQuiz);

// Shared quiz routes
router.post('/create', protect, createSharedQuiz);
router.get('/:id', getSharedQuiz);
router.post('/:id/submit', protect, submitSharedQuiz);

module.exports = router;

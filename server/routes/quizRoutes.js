// routes/quizRoutes.js (or similar)
const express = require('express');
const router = express.Router();
const { generateQuiz } = require('../controllers/quizController');

router.post('/generate', generateQuiz);

module.exports = router;

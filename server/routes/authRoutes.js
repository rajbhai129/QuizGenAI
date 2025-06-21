const express = require('express');
const router = express.Router();
const { register, login, saveQuizResult, getQuizHistory, updateAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/quiz-result', protect, saveQuizResult);
router.get('/quiz-history', protect, getQuizHistory);
router.put('/avatar', protect, updateAvatar);

module.exports = router;
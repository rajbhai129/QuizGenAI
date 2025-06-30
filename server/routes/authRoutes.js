const express = require('express');
const router = express.Router();
const { register, login, saveQuizResult, getQuizHistory, updateAvatar, getUserById } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/quiz-result', protect, saveQuizResult);
router.get('/quiz-history', protect, getQuizHistory);
router.put('/avatar', protect, updateAvatar);
router.get('/user/:id', getUserById);

module.exports = router;
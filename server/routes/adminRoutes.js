const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

// Get all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all quizzes
router.get('/quizzes', protect, adminOnly, async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
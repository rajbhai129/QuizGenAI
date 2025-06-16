const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveQuizResult = async (req, res) => {
  try {
    const { quizResults } = req.body;
    const user = await User.findById(req.user._id);

    // Ensure type is set
    quizResults.type = quizResults.type || 'taken';
    quizResults.date = new Date();

    user.quizHistory.push(quizResults);
    await user.save();

    res.json({ message: 'Quiz results saved successfully' });
  } catch (error) {
    console.error('Error saving quiz results:', error);
    res.status(500).json({ error: error.message });
  }
};

const getQuizHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const history = {
      taken: user.quizHistory.filter(q => q.type === 'taken' || !q.type),
      created: user.quizHistory.filter(q => q.type === 'created')
    };
    res.json(history);
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  saveQuizResult,
  getQuizHistory
};
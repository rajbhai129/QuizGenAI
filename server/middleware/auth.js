const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    console.log('Auth Header:', req.headers.authorization);

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('No token found.');
      return res.status(401).json({ error: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      console.log('User not found after token verification.');
      return res.status(401).json({ error: 'Not authorized' });
    }
    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    res.status(401).json({ error: 'Not authorized' });
  }
};

module.exports = { protect };
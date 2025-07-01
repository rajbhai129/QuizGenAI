const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Admin access only' });
  }
};

module.exports = adminOnly; 
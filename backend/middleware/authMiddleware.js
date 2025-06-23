const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token with fallback secret
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-fallback';
      const decoded = jwt.verify(token, jwtSecret);

      // Get user from the token
      req.user = await User.findById(decoded.userId).select('-password');
      
      if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect }; 
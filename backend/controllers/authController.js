const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register a new user (Signup)
const signupUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({ token, userId: user._id, name: user.name });
  } catch (error) {
    res.status(400).json({ message: 'Invalid user data', error });
  }
};

// @desc    Authenticate a user (Login)
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    const token = generateToken(user._id);
    res.status(200).json({ token, userId: user._id, name: user.name });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

module.exports = {
  signupUser,
  loginUser,
}; 
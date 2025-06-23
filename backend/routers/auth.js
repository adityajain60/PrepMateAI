const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signupUser, loginUser } = require('../controllers/authController');

// Validation middleware for signup
const signupValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Validation middleware for login
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required'),
];

router.post('/signup', signupValidation, signupUser);
router.post('/login', loginValidation, loginUser);

module.exports = router;
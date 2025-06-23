const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMe } = require('../controllers/userController');

// This route is protected and gets the logged-in user's data
router.get('/me', protect, getMe);

module.exports = router;
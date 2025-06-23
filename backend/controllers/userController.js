const User = require('../models/User');

// @desc    Get current user's profile data
const getMe = async (req, res) => {
  try {
    // req.user is attached from the 'protect' middleware
    // We select '-password' to exclude the hashed password from the response
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMe,
}; 
const ResumeHistory = require('../models/ResumeHistory');
const InterviewHistory = require('../models/InterviewHistory');

// @desc    Get all resume analysis history for a user
const getResumeHistory = async (req, res) => {
  try {
    const history = await ResumeHistory.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching resume history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all interview question history for a user
const getInterviewHistory = async (req, res) => {
  try {
    const history = await InterviewHistory.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getResumeHistory,
  getInterviewHistory
}; 
const mongoose = require('mongoose');

const interviewHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  jobDescription: {
    type: String,
    required: true,
  },
  questions: {
    type: [String],
    required: true,
  },
  fullQuestions: {
    type: mongoose.Schema.Types.Mixed
  },
  answersSubmitted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('InterviewHistory', interviewHistorySchema); 
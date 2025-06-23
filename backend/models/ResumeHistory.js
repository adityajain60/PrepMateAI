const mongoose = require('mongoose');

const resumeHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  jobDescription: {
    type: String,
    required: true,
  },
  analysisSummary: {
    type: String,
    required: true,
  },
  matchScore: {
    type: Number,
    required: true,
  },
  strengths: [{
    type: String
  }],
  suggestions: [{
    type: String
  }],
  fullAnalysis: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('ResumeHistory', resumeHistorySchema); 
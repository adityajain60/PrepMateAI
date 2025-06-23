const mongoose = require('mongoose');

const platformMetricsSchema = new mongoose.Schema({
  resumesAnalyzed: {
    type: Number,
    default: 0,
  },
  questionsGenerated: {
    type: Number,
    default: 0,
  },
  totalUsers: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('PlatformMetrics', platformMetricsSchema); 
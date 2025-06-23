const PlatformMetrics = require('../models/PlatformMetrics');
const ResumeHistory = require('../models/ResumeHistory');
const InterviewHistory = require('../models/InterviewHistory');
const User = require('../models/User');

// Get or create platform metrics
const getOrCreateMetrics = async () => {
  let metrics = await PlatformMetrics.findOne();
  if (!metrics) {
    metrics = new PlatformMetrics();
    await metrics.save();
  }
  return metrics;
};

// Get platform metrics
const getPlatformMetrics = async (req, res) => {
  try {
    const metrics = await getOrCreateMetrics();
    
    // Calculate real-time metrics from actual data
    const resumesAnalyzed = await ResumeHistory.countDocuments();
    
    // Count total individual questions generated
    const questionsGenerated = await InterviewHistory.aggregate([
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: { $size: "$questions" } }
        }
      }
    ]);
    
    const totalUsers = await User.countDocuments();
    
    // Update metrics with real-time data
    metrics.resumesAnalyzed = resumesAnalyzed;
    metrics.questionsGenerated = questionsGenerated.length > 0 ? questionsGenerated[0].totalQuestions : 0;
    metrics.totalUsers = totalUsers;
    metrics.lastUpdated = new Date();
    
    await metrics.save();
    
    res.json({
      success: true,
      metrics: {
        resumesAnalyzed: metrics.resumesAnalyzed,
        questionsGenerated: metrics.questionsGenerated,
        totalUsers: metrics.totalUsers,
        lastUpdated: metrics.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error getting platform metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to get platform metrics' });
  }
};

// Increment specific metric (for future use)
const incrementMetric = async (metricType) => {
  try {
    const metrics = await getOrCreateMetrics();
    
    switch (metricType) {
      case 'resumesAnalyzed':
        metrics.resumesAnalyzed += 1;
        break;
      case 'questionsGenerated':
        metrics.questionsGenerated += 1;
        break;
      case 'totalUsers':
        metrics.totalUsers += 1;
        break;
    }
    
    metrics.lastUpdated = new Date();
    await metrics.save();
  } catch (error) {
    console.error('Error incrementing metric:', error);
  }
};

module.exports = {
  getPlatformMetrics,
  incrementMetric
}; 
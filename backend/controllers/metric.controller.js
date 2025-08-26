// routes/metrics.controller.js  — lean showcase version
import ResumeHistory from '../models/resume.model.js';
import InterviewHistory from '../models/interview.model.js';
import User from '../models/user.model.js';

export const getPlatformMetrics = async (req, res) => {
  try {
    const [totalUsers, resumesAnalyzed] = await Promise.all([
      User.estimatedDocumentCount(),
      ResumeHistory.estimatedDocumentCount()
    ]);

    const [{ totalQuestions = 0 } = {}] = await InterviewHistory.aggregate([
      { $project: { qCnt: { $size: { $ifNull: ["$questions", []] } } } },
      { $group: { _id: null, totalQuestions: { $sum: "$qCnt" } } }
    ]);

    res.json({
      totalUsers,
      resumesAnalyzed,
      questionsGenerated: totalQuestions,
      lastUpdated: new Date()
    });
  } catch (err) {
    console.error("getPlatformMetrics:", err);
    return res.status(500).json({ error: "Failed to get platform metrics" });
  }
};

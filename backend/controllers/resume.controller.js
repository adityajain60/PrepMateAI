import ResumeHistory from '../models/resume.model.js';
import { prepareApiRequest, callPythonService } from '../utils/apiUtils.js';

// Analyze resume using Python service
export const analyzeResume = async (req, res) => {
  try {
    // 1. Validate input
    if (!req.user?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    if (!req.body.resumeText && !req.files?.resume) {
      return res
        .status(400)
        .json({ error: "Resume (text or file) is required" });
    }
    if (!req.body.jobDescription && !req.files?.jobDescriptionFile) {
      return res
        .status(400)
        .json({ error: "Job description (text or file) is required" });
    }

    // 2. Prepare Data for Python Service
    const { pythonServiceData, headers } = prepareApiRequest(req);

    // 3. Call Python Service 
    const analysisResult = await callPythonService(
      "/resume/analyze",
      pythonServiceData,
      headers
    );

    // 4. Handle AI Response
    const matchScore = analysisResult?.ats_score?.total_score;
    const analysisSummary = analysisResult?.ats_score?.final_assessment;

    if (matchScore === undefined || !analysisSummary) {
      return res
        .status(500)
        .json({ error: "Incomplete analysis result from AI service" });
    }

    // 5. Save result to history
    const { jobDescription } = req.body;
    const jobDescriptionForDB =
      jobDescription ||
      `Job from file: ${req.files?.jobDescriptionFile?.[0]?.originalname}`;
    const historyEntry = new ResumeHistory({
      user: req.user.id,
      jobDescription: jobDescriptionForDB,
      matchScore,
      analysisSummary,
      strengths: analysisResult.strengths,
      suggestions: analysisResult.suggestions,
    });
    await historyEntry.save();

    // 6. Send result to client
    res.json(analysisResult);
  } catch (error) {
    console.log("Error in resume analysis: ", error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.error || 'Internal server error during analysis';
    res.status(statusCode).json({ error: message });
  }
};


// Get resume analysis history
export const getResumeHistory = async (req, res) => {
  try {
    // Checks user authentication
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Fetches history from MongoDB, sorted by most recent
    const history = await ResumeHistory.find({ user: userId })
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.log("Error in getResumeHistory: ", error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
}; 
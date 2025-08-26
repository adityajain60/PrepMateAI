import InterviewHistory from '../models/interview.model.js';
import { prepareApiRequest, callPythonService } from '../utils/apiUtils.js';

export const generateQuestions = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // ✅ Extract data (from text or file) + additional config fields
    const { pythonServiceData, headers } = await prepareApiRequest(req);

    // ✅ Send to Python service
    const questionsFromPython = await callPythonService(
      '/interview/generate',
      pythonServiceData,
      headers
    );

    // ✅ Build job description summary (first 200 chars or fallback to file name)
    const jobDescSummary =
      pythonServiceData.jd_content?.slice(0, 200) ||
      `Job from file: ${req.files?.jobDescriptionFile?.[0]?.originalname || 'Unknown JD'}`;

    // ✅ Save to DB
    const history = await InterviewHistory.create({
      user: req.user.id,
      jobDescription: jobDescSummary,
      questions: questionsFromPython,
    });

    // ✅ Return response
    res.json({ questions: questionsFromPython, interviewId: history._id });

  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || 'Error generating questions';
    console.error(err);
    res.status(status).json({ error: message });
  }
};


export const getInterviewHistory = async (req, res) => {
  try {
    const history = await InterviewHistory.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interview history' });
  }
};

export const getAnswerFeedback = async (req, res) => {
  try {
    const { resumeText, jobDescription, question, answer } = req.body;
    if (!resumeText || !jobDescription || !question || !answer) {
      return res.status(400).json({ error: 'Resume, JD, question, and answer are required' });
    }
    
    // 2. Prepare and call Python service using RAG
    const { pythonServiceData, headers } = prepareApiRequest(req);
    const result = await callPythonService('/answer-feedback', pythonServiceData, headers);

    // 3. Send result to client
    res.json(result);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || 'Error during feedback';
    res.status(status).json({ error: message });
  }
};

export const getIdealAnswer = async (req, res) => {
  try {
    const { resumeText, jobDescription, question } = req.body;
    if (!resumeText || !jobDescription || !question) {
      return res.status(400).json({ error: 'Resume, JD, and question are required' });
    }

    // 2. Prepare and call Python service using RAG
    const { pythonServiceData, headers } = prepareApiRequest(req);
    const result = await callPythonService('/ideal-answer', pythonServiceData, headers);
    
    // 3. Send result to client
    res.json(result);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || 'Error generating ideal answer';
    res.status(status).json({ error: message });
  }
};

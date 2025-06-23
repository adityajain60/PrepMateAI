const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController.js');
const { protect } = require('../middleware/authMiddleware.js');
const multer = require('multer');
const axios = require('axios');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// Generate interview questions
router.post('/generate', protect, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescriptionFile', maxCount: 1 }
]), interviewController.generateQuestions);

// Get answer feedback
router.post('/feedback', protect, interviewController.getAnswerFeedback);

// Generate ideal answer
router.post('/ideal-answer', protect, interviewController.generateIdealAnswer);

// Get interview history
router.get('/history', protect, interviewController.getHistory);

// Q&A endpoint
router.post('/ask', protect, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescriptionFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Extract data from request
    const question = req.body.question;
    const resumeText = req.body.resumeText;
    const jobDescription = req.body.jobDescription;
    const resumeFile = req.files?.resume?.[0];
    const jdFile = req.files?.jobDescriptionFile?.[0];

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    if (!resumeFile && !resumeText) {
      return res.status(400).json({ message: 'Resume (file or text) is required' });
    }

    if (!jdFile && !jobDescription) {
      return res.status(400).json({ message: 'Job description (file or text) is required' });
    }

    // Prepare data for Python service
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('question', question);
    
    if (resumeFile) {
      formData.append('resume', resumeFile.buffer, {
        filename: resumeFile.originalname,
        contentType: resumeFile.mimetype
      });
    } else {
      formData.append('resumeText', resumeText);
    }
    
    if (jdFile) {
      formData.append('jobDescriptionFile', jdFile.buffer, {
        filename: jdFile.originalname,
        contentType: jdFile.mimetype
      });
    } else {
      formData.append('jobDescription', jobDescription);
    }

    // Forward to Python service
    const pythonResponse = await axios.post(
      `${PYTHON_SERVICE_URL}/ask`,
      formData,
      { 
        headers: formData.getHeaders(),
        timeout: 60000
      }
    );

    res.json(pythonResponse.data);

  } catch (error) {
    console.error('Q&A error:', error);
    if (error.response && error.response.data) {
      return res.status(error.response.status).json({
        message: error.response.data.error || 'Q&A failed',
        details: error.response.data.details
      });
    }
    res.status(500).json({ 
      message: 'Internal server error during Q&A',
      details: error.message
    });
  }
});

module.exports = router; 
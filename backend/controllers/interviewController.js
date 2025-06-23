const axios = require('axios');
const InterviewHistory = require('../models/InterviewHistory.js');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

const interviewController = {
  // Generate interview questions using Python service
  async generateQuestions(req, res) {
    try {
      console.log('Interview question generation request received:', {
        hasFile: !!req.files,
        hasResumeText: !!req.body.resumeText,
        hasJobDescription: !!req.body.jobDescription,
        questionTypes: req.body.questionType,
        userId: req.user?.id,
        bodyKeys: Object.keys(req.body)
      });

      const { resumeText, jobDescription } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        console.error('No user ID found in request');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      if (!resumeText && !req.files?.resume) {
        return res.status(400).json({ message: 'Resume content (text or file) is required' });
      }

      if (!jobDescription && !req.files?.jobDescriptionFile) {
        return res.status(400).json({ message: 'Job description (text or file) is required' });
      }

      // Prepare data for Python service
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Add resume data
      if (req.files?.resume) {
        console.log('Adding resume file to form data');
        formData.append('resume', req.files.resume[0].buffer, {
          filename: req.files.resume[0].originalname,
          contentType: req.files.resume[0].mimetype
        });
      } else {
        console.log('Adding resume text to form data');
        formData.append('resumeText', resumeText);
      }
      
      // Add job description data
      if (req.files?.jobDescriptionFile) {
        console.log('Adding job description file to form data');
        formData.append('jobDescriptionFile', req.files.jobDescriptionFile[0].buffer, {
          filename: req.files.jobDescriptionFile[0].originalname,
          contentType: req.files.jobDescriptionFile[0].mimetype
        });
      } else {
        console.log('Adding job description text to form data');
        formData.append('jobDescription', jobDescription);
      }
      
      // Add interview configuration with defaults
      const config = {
        questionDifficulty: req.body.questionDifficulty || 'Medium',
        questionType: req.body.questionType || 'Technical',
        experienceLevel: req.body.experienceLevel || '1-2 years',
        roundType: req.body.roundType || 'Technical',
        targetJobRole: req.body.targetJobRole || 'Software Engineer',
        skillFocus: req.body.skillFocus || 'Python, SQL',
        numQuestions: req.body.numQuestions || 5
      };

      console.log('Adding configuration to form data:', config);

      formData.append('questionDifficulty', config.questionDifficulty);
      
      // Handle questionType - could be array or string
      if (Array.isArray(config.questionType)) {
        // Convert array to comma-separated string
        formData.append('questionType', config.questionType.join(', '));
      } else {
        formData.append('questionType', config.questionType);
      }
      
      formData.append('experienceLevel', config.experienceLevel);
      formData.append('roundType', config.roundType);
      formData.append('targetJobRole', config.targetJobRole);
      formData.append('skillFocus', config.skillFocus);
      formData.append('numQuestions', config.numQuestions);

      console.log('Sending to Python service at:', `${PYTHON_SERVICE_URL}/interview/generate`);

      // Call Python service
      const pythonResponse = await axios.post(
        `${PYTHON_SERVICE_URL}/interview/generate`,
        formData,
        { 
          headers: formData.getHeaders(),
          timeout: 120000 // 2 minute timeout
        }
      );

      console.log('Python service response received:', {
        status: pythonResponse.status,
        hasData: !!pythonResponse.data,
        dataKeys: Object.keys(pythonResponse.data || {})
      });

      const questionsResult = pythonResponse.data;

      // Prepare job description for database - handle both text and file cases
      let jobDescriptionForDB = jobDescription;
      if (!jobDescriptionForDB && req.files?.jobDescriptionFile) {
        // If no text but file exists, use a placeholder or extract text
        jobDescriptionForDB = `Job Description from file: ${req.files.jobDescriptionFile[0].originalname}`;
      }

      // Save to history
      const historyEntry = new InterviewHistory({
        user: userId,
        jobDescription: jobDescriptionForDB,
        questions: questionsResult.questions,
        fullQuestions: questionsResult.fullQuestions
      });

      await historyEntry.save();
      console.log('Interview history saved successfully');

      // Return the questions result
      res.json({
        ...questionsResult,
        jobDescription: jobDescriptionForDB,
        interviewId: historyEntry._id
      });

    } catch (error) {
      console.error('Interview question generation error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url
      });
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(500).json({ 
          message: 'Python AI service is not running. Please start the service on port 5001.',
          details: error.message
        });
      }
      
      if (error.response && error.response.data) {
        return res.status(error.response.status).json({
          message: error.response.data.error || 'Question generation failed',
          details: error.response.data.details
        });
      }
      
      res.status(500).json({ 
        message: 'Internal server error during question generation',
        details: error.message
      });
    }
  },

  // Get interview history
  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const history = await InterviewHistory.find({ user: userId })
        .sort({ createdAt: -1 })
        .select('-fullQuestions'); // Exclude the large fullQuestions field

      res.json(history);
    } catch (error) {
      console.error('Get interview history error:', error);
      res.status(500).json({ message: 'Failed to fetch interview history' });
    }
  },

  // Get answer feedback using Python service
  async getAnswerFeedback(req, res) {
    try {
      console.log('Answer feedback request received:', {
        hasResumeContent: !!req.body.resume_content,
        hasJdContent: !!req.body.jd_content,
        hasQuestion: !!req.body.question,
        hasAnswer: !!req.body.answer,
        userId: req.user?.id
      });

      const { resume_content, jd_content, question, answer, interviewId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        console.error('No user ID found in request');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      if (!resume_content || !jd_content || !question || !answer) {
        return res.status(400).json({ message: 'All fields are required: resume_content, jd_content, question, answer' });
      }

      // Call Python service for answer feedback
      const pythonResponse = await axios.post(
        `${PYTHON_SERVICE_URL}/answer-feedback`,
        {
          resume_content,
          jd_content,
          question,
          answer
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000 // 60 second timeout
        }
      );

      console.log('Python service feedback response received:', {
        status: pythonResponse.status,
        hasData: !!pythonResponse.data
      });

      // Increment answers submitted counter if interviewId is provided
      if (interviewId) {
        try {
          await InterviewHistory.findByIdAndUpdate(
            interviewId,
            { $inc: { answersSubmitted: 1 } }
          );
          console.log('Answer submission counter incremented for interview:', interviewId);
        } catch (dbError) {
          console.error('Failed to increment answer counter:', dbError);
          // Don't fail the request if counter update fails
        }
      }

      // Return the feedback result
      res.json(pythonResponse.data);

    } catch (error) {
      console.error('Answer feedback error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response && error.response.data) {
        return res.status(error.response.status).json({
          message: error.response.data.error || 'Feedback generation failed',
          details: error.response.data.details
        });
      }
      
      res.status(500).json({ 
        message: 'Internal server error during feedback generation',
        details: error.message
      });
    }
  },

  // Generate ideal answer using Python service
  async generateIdealAnswer(req, res) {
    try {
      console.log('Ideal answer generation request received:', {
        hasResumeContent: !!req.body.resume_content,
        hasJdContent: !!req.body.jd_content,
        hasQuestion: !!req.body.question,
        userId: req.user?.id
      });

      const { resume_content, jd_content, question } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        console.error('No user ID found in request');
        return res.status(401).json({ message: 'User not authenticated' });
      }

      if (!resume_content || !jd_content || !question) {
        return res.status(400).json({ message: 'All fields are required: resume_content, jd_content, question' });
      }

      // Call Python service for ideal answer generation
      const pythonResponse = await axios.post(
        `${PYTHON_SERVICE_URL}/ideal-answer`,
        {
          resume_content,
          jd_content,
          question
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000 // 60 second timeout
        }
      );

      console.log('Python service ideal answer response received:', {
        status: pythonResponse.status,
        hasData: !!pythonResponse.data
      });

      // Return the ideal answer result
      res.json(pythonResponse.data);

    } catch (error) {
      console.error('Ideal answer generation error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response && error.response.data) {
        return res.status(error.response.status).json({
          message: error.response.data.error || 'Ideal answer generation failed',
          details: error.response.data.details
        });
      }
      
      res.status(500).json({ 
        message: 'Internal server error during ideal answer generation',
        details: error.message
      });
    }
  }
};

module.exports = interviewController; 
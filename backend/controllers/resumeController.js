const axios = require('axios');
const ResumeHistory = require('../models/ResumeHistory.js');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

const resumeController = {
  // Analyze resume using Python service
  async analyzeResume(req, res) {
    try {
      console.log('Request user object:', req.user);
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);
      
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

      console.log('Preparing data for Python service...');

      // Prepare data for Python service
      let pythonServiceData;
      let headers = {};

      if (req.files?.resume || req.files?.jobDescriptionFile) {
        // File upload case
        console.log('Processing file upload...');
        const FormData = require('form-data');
        const formData = new FormData();
        
        if (req.files?.resume) {
          formData.append('resume', req.files.resume[0].buffer, {
            filename: req.files.resume[0].originalname,
            contentType: req.files.resume[0].mimetype
          });
        } else {
          formData.append('resumeText', resumeText);
        }
        
        if (req.files?.jobDescriptionFile) {
          formData.append('jobDescriptionFile', req.files.jobDescriptionFile[0].buffer, {
            filename: req.files.jobDescriptionFile[0].originalname,
            contentType: req.files.jobDescriptionFile[0].mimetype
          });
        } else {
          formData.append('jobDescription', jobDescription);
        }
        
        pythonServiceData = formData;
        headers = formData.getHeaders();
        console.log('File upload prepared');
      } else {
        // Text input case
        console.log('Processing text input...');
        pythonServiceData = {
          resumeText,
          jobDescription
        };
        headers = { 'Content-Type': 'application/json' };
      }

      console.log('Calling Python service at:', `${PYTHON_SERVICE_URL}/resume/analyze`);

      // Call Python service
      const pythonResponse = await axios.post(
        `${PYTHON_SERVICE_URL}/resume/analyze`,
        pythonServiceData,
        { 
          headers,
          timeout: 60000 // 60 second timeout
        }
      );

      console.log('Python service response received:', {
        status: pythonResponse.status,
        hasData: !!pythonResponse.data
      });

      const analysisResult = pythonResponse.data;

      // Process suggestions to convert nested structure to flat array
      let processedSuggestions = [];
      if (analysisResult.suggestions) {
        if (Array.isArray(analysisResult.suggestions)) {
          // If it's already an array, filter out non-string values
          processedSuggestions = analysisResult.suggestions.filter(item => typeof item === 'string');
        } else if (typeof analysisResult.suggestions === 'object') {
          // If it's a nested object, flatten it
          Object.values(analysisResult.suggestions).forEach(category => {
            if (Array.isArray(category)) {
              category.forEach(item => {
                if (typeof item === 'string') {
                  processedSuggestions.push(item);
                } else if (typeof item === 'object' && item.current && item.suggested) {
                  // Handle rewrite examples - convert to string format
                  processedSuggestions.push(`Rewrite: "${item.current}" → "${item.suggested}"`);
                }
              });
            } else if (typeof category === 'object') {
              // Handle nested objects like formatting.high_priority
              Object.values(category).forEach(subcategory => {
                if (Array.isArray(subcategory)) {
                  subcategory.forEach(item => {
                    if (typeof item === 'string') {
                      processedSuggestions.push(item);
                    } else if (typeof item === 'object' && item.current && item.suggested) {
                      // Handle rewrite examples - convert to string format
                      processedSuggestions.push(`Rewrite: "${item.current}" → "${item.suggested}"`);
                    }
                  });
                }
              });
            }
          });
        }
      }

      // Process strengths to ensure it's an array
      let processedStrengths = [];
      if (analysisResult.strengths) {
        if (Array.isArray(analysisResult.strengths)) {
          processedStrengths = analysisResult.strengths;
        } else if (typeof analysisResult.strengths === 'object') {
          Object.values(analysisResult.strengths).forEach(category => {
            if (Array.isArray(category)) {
              processedStrengths.push(...category);
            }
          });
        }
      }

      // Save to history
      console.log('Saving to history...');
      
      // Prepare job description for database - handle both text and file cases
      let jobDescriptionForDB = jobDescription;
      if (!jobDescriptionForDB && req.files?.jobDescriptionFile) {
        // If no text but file exists, use a placeholder or extract text
        jobDescriptionForDB = `Job Description from file: ${req.files.jobDescriptionFile[0].originalname}`;
      }
      
      const historyEntry = new ResumeHistory({
        user: userId,
        jobDescription: jobDescriptionForDB,
        matchScore: analysisResult.matchScore,
        analysisSummary: analysisResult.analysisSummary,
        strengths: processedStrengths,
        suggestions: processedSuggestions,
        fullAnalysis: analysisResult.fullAnalysis
      });

      await historyEntry.save();
      console.log('History saved successfully');

      // Return the analysis result
      res.json(analysisResult);

    } catch (error) {
      console.error('Resume analysis error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response && error.response.data) {
        return res.status(error.response.status).json({
          message: error.response.data.error || 'Analysis failed',
          details: error.response.data.details
        });
      }
      
      res.status(500).json({ 
        message: 'Internal server error during analysis',
        details: error.message
      });
    }
  },

  // Get resume analysis history
  async getHistory(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const history = await ResumeHistory.find({ user: userId })
        .sort({ createdAt: -1 })
        .select('-fullAnalysis'); // Exclude the large fullAnalysis field

      res.json(history);
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ message: 'Failed to fetch history' });
    }
  }
};

module.exports = resumeController; 
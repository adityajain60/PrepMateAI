import express from 'express';
import {
  generateQuestions,
  getAnswerFeedback,
  getIdealAnswer,
  getInterviewHistory
} from '../controllers/interview.controller.js';
import uploadFile from '../middleware/uploadFile.js'; // ✅ fixed import
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

// Protect all routes in this file
router.use(protectRoute);

// Generate interview questions
router.post('/generate', uploadFile, generateQuestions);

// Get feedback on an answer
router.post('/feedback', getAnswerFeedback);
router.post('/ask', getAnswerFeedback);

// Get ideal answer for a question
router.post('/ideal-answer', getIdealAnswer);

// Get interview history
router.get('/history', getInterviewHistory);

export default router;

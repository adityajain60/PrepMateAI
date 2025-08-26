import express from 'express';
import { analyzeResume, getResumeHistory } from '../controllers/resume.controller.js';
import uploadFile from '../middleware/uploadFile.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

// Protect all routes in this file
router.use(protectRoute);

// This route handles both file uploads and text-only submissions
router.post('/analyze', uploadFile, analyzeResume);

router.get('/history', getResumeHistory);

export default router; 
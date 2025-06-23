const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController.js');
const { protect } = require('../middleware/authMiddleware.js');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Apply authentication middleware to all routes
router.use(protect);

// Analyze resume (supports both file upload and text input)
router.post('/analyze', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescriptionFile', maxCount: 1 }
]), resumeController.analyzeResume);

// Get resume analysis history
router.get('/history', resumeController.getHistory);

module.exports = router; 
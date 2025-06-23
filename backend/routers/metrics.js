const express = require('express');
const router = express.Router();
const { getPlatformMetrics } = require('../controllers/metricsController');

// Get platform metrics (public endpoint)
router.get('/', getPlatformMetrics);

module.exports = router; 
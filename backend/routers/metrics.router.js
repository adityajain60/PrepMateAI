import express from 'express';
import { getPlatformMetrics } from '../controllers/metric.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

// Get platform metrics (public endpoint)
router.get('/', getPlatformMetrics);

export default router; 
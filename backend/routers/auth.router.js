import express from 'express';
import { signup, login, logout, getUserProfile } from '../controllers/auth.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);

router.post('/logout', logout);

router.get('/me', protectRoute, getUserProfile);

export default router;
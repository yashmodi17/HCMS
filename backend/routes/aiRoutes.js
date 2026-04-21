import express from 'express';
import { generateAIResponse } from '../controllers/aiController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Role-based chatbot path
router.post('/chat', authMiddleware(), generateAIResponse);

export default router;

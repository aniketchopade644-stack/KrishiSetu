import express from 'express';
import { askAIAssistant, getChatHistory, clearChatHistory } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/ask', askAIAssistant);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;

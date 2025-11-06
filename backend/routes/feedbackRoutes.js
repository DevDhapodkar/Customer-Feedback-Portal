import express from 'express';
import {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedbackStatus,
  getUserFeedbacks,
} from '../controllers/feedbackController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createFeedback);
router.get('/my-feedback', protect, getUserFeedbacks);
router.get('/:id', protect, getFeedbackById);
router.get('/', protect, admin, getFeedbacks);
router.put('/:id/status', protect, admin, updateFeedbackStatus);

export default router;


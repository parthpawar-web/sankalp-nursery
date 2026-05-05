import express from 'express';
import {
  getVarieties,
  getVarietyById,
  createVariety,
  updateVariety,
  deleteVariety,
  createVarietyReview,
} from '../controllers/varietyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getVarieties).post(createVariety);
router.route('/:id').get(getVarietyById).put(updateVariety).delete(deleteVariety);
router.route('/:id/reviews').post(protect, createVarietyReview);

export default router;

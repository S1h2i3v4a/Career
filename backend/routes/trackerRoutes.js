import express from 'express';
import { 
  getTrackerItems, 
  createTrackerItem, 
  updateTrackerItem, 
  deleteTrackerItem 
} from '../controllers/trackerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getTrackerItems)
  .post(protect, createTrackerItem);

router.route('/:id')
  .put(protect, updateTrackerItem)
  .delete(protect, deleteTrackerItem);

export default router;

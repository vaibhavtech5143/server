import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  assignVendor,
  addProgress,
  addRating,
  getTaskById
} from '../controllers/taskController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Fetch all tasks or create a new task
router.route('/')
  .get(getTasks)
  .post(restrictTo('resident'), createTask);

// Get and update specific task details, restricted to supervisors for general updates
router.route('/:id')
  .get(getTaskById)
  .patch(restrictTo('supervisor'), updateTask);

// Assign vendors, restricted to supervisors
router.patch('/:id/assign-vendor', restrictTo('supervisor'), assignVendor);

// Progress updates restricted to vendors
router.post('/:id/progress', restrictTo('vendor'), addProgress);

// Ratings restricted to residents
router.post('/:id/rating', restrictTo('resident'), addRating);

export default router;

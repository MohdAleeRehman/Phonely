import express from 'express';
import {
  createRating,
  getUserRatings,
  getMyRatings,
  canRateUser,
  deleteRating,
} from '../controllers/rating.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/user/:userId', getUserRatings);

// Protected routes
router.use(protect);
router.post('/', createRating);
router.get('/my-ratings', getMyRatings);
router.get('/can-rate/:listingId/:userId', canRateUser);
router.delete('/:id', deleteRating);

export default router;

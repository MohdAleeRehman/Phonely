import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  addToWaitlist,
  getWaitlist,
  removeFromWaitlist,
} from '../controllers/waitlist.controller.js';

const router = express.Router();

/**
 * @route   POST /api/v1/waitlist
 * @desc    Add email to waitlist
 * @access  Public
 */
router.post('/', addToWaitlist);

/**
 * @route   GET /api/v1/waitlist
 * @desc    Get all waitlist entries
 * @access  Private/Admin
 */
router.get('/', protect, restrictTo('admin'), getWaitlist);

/**
 * @route   DELETE /api/v1/waitlist/:id
 * @desc    Remove from waitlist
 * @access  Private/Admin
 */
router.delete('/:id', protect, restrictTo('admin'), removeFromWaitlist);

export default router;

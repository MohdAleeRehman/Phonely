import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getProfile,
  updateProfile,
  deleteAccount,
  getMyListings,
  getUserById,
} from '../controllers/user.controller.js';

const router = express.Router();

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, updateProfile);

/**
 * @route   DELETE /api/v1/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', protect, deleteAccount);

/**
 * @route   GET /api/v1/users/my-listings
 * @desc    Get current user's listings
 * @access  Private
 */
router.get('/my-listings', protect, getMyListings);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID (public profile)
 * @access  Public
 */
router.get('/:id', getUserById);

export default router;

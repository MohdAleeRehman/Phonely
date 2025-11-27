import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getAllUsers,
  getAllListingsAdmin,
  deleteUser,
  deleteListingAdmin,
} from '../controllers/admin.controller.js';

const router = express.Router();

// All routes are protected and restricted to admin
router.use(protect, restrictTo('admin'));

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Private/Admin
 */
router.get('/dashboard', getDashboardStats);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/v1/admin/listings
 * @desc    Get all listings (including drafts and removed)
 * @access  Private/Admin
 */
router.get('/listings', getAllListingsAdmin);

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Delete a user
 * @access  Private/Admin
 */
router.delete('/users/:id', deleteUser);

/**
 * @route   DELETE /api/v1/admin/listings/:id
 * @desc    Delete a listing
 * @access  Private/Admin
 */
router.delete('/listings/:id', deleteListingAdmin);

export default router;

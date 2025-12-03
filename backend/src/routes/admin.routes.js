import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getAllUsers,
  getAllListingsAdmin,
  deleteUser,
  deleteListingAdmin,
  toggleUserBan,
  getUserDetails,
  updateListingStatus,
  getListingDetails,
  getAnalytics,
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
 * @route   GET /api/v1/admin/analytics
 * @desc    Get platform analytics (user growth, listings, brands, PTA stats)
 * @access  Private/Admin
 */
router.get('/analytics', getAnalytics);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with filters
 * @access  Private/Admin
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get user details with stats
 * @access  Private/Admin
 */
router.get('/users/:id', getUserDetails);

/**
 * @route   PATCH /api/v1/admin/users/:id/ban
 * @desc    Ban/Unban user
 * @access  Private/Admin
 */
router.patch('/users/:id/ban', toggleUserBan);

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Delete a user (soft delete)
 * @access  Private/Admin
 */
router.delete('/users/:id', deleteUser);

/**
 * @route   GET /api/v1/admin/listings
 * @desc    Get all listings (including drafts and removed)
 * @access  Private/Admin
 */
router.get('/listings', getAllListingsAdmin);

/**
 * @route   GET /api/v1/admin/listings/:id
 * @desc    Get listing details with inspection report
 * @access  Private/Admin
 */
router.get('/listings/:id', getListingDetails);

/**
 * @route   PATCH /api/v1/admin/listings/:id/status
 * @desc    Update listing status
 * @access  Private/Admin
 */
router.patch('/listings/:id/status', updateListingStatus);

/**
 * @route   DELETE /api/v1/admin/listings/:id
 * @desc    Delete a listing (hard delete)
 * @access  Private/Admin
 */
router.delete('/listings/:id', deleteListingAdmin);

export default router;
